#!/usr/bin/env node
import { lstat, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_FILE_BYTES = 1024 * 1024;
const SECRET_NAME = /^(?:\.env[^/]*|.*\.(?:pem|key))$/i;

function parseArgs(args) {
  const options = { source: null, target: null, dryRun: false };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--source') options.source = args[++index] ?? null;
    else if (args[index] === '--target') options.target = args[++index] ?? null;
    else if (args[index] === '--dry-run') options.dryRun = true;
    else throw new Error(`Unknown option: ${args[index]}`);
  }
  if (!options.source || !options.target) throw new Error('Usage: node scripts/sync-overlays.mjs --source <dir> --target <project> [--dry-run]');
  return options;
}

async function inspectOverlay(folderPath, folderName) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folderName)) throw new Error(`Invalid overlay folder name: ${folderName}`);
  const overlayFile = path.join(folderPath, 'OVERLAY.md');
  let markdown;
  try { markdown = await readFile(overlayFile, 'utf8'); } catch { return null; }
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`${folderName}/OVERLAY.md must begin with YAML frontmatter`);
  const name = frontmatter[1].match(/^name:\s*["']?([^"'\r\n]+?)["']?\s*$/m)?.[1]?.trim();
  if (name !== folderName) throw new Error(`${folderName}/OVERLAY.md frontmatter name must equal the folder name`);

  const files = [];
  async function walk(directory, relative = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const childRelative = path.join(relative, entry.name);
      const fullPath = path.join(directory, entry.name);
      const info = await lstat(fullPath);
      if (info.isSymbolicLink()) throw new Error(`${folderName}/${childRelative} is a symbolic link; overlays must contain regular files and directories`);
      if (SECRET_NAME.test(entry.name)) throw new Error(`Refusing secret-like overlay file: ${folderName}/${childRelative}`);
      if (info.isDirectory()) await walk(fullPath, childRelative);
      else if (info.isFile()) {
        if (info.size > MAX_FILE_BYTES) throw new Error(`${folderName}/${childRelative} exceeds the ${MAX_FILE_BYTES}-byte per-file limit`);
        files.push({ source: fullPath, relative: childRelative });
      } else throw new Error(`${folderName}/${childRelative} is not a regular file`);
    }
  }
  await walk(folderPath);
  return { name: folderName, files };
}

export async function syncOverlays({ source, target, dryRun = false }) {
  const sourceRoot = path.resolve(source);
  const targetRoot = path.resolve(target);
  const entries = await readdir(sourceRoot, { withFileTypes: true });
  const overlays = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const overlay = await inspectOverlay(path.join(sourceRoot, entry.name), entry.name);
    if (overlay) overlays.push(overlay);
  }

  const destinationRoot = path.join(targetRoot, '.ai-kit', 'overlays');
  const result = { ok: true, dryRun, source: sourceRoot, target: targetRoot, added: [], skipped: [] };
  for (const overlay of overlays) {
    const destination = path.join(destinationRoot, overlay.name);
    let exists = false;
    try { await lstat(destination); exists = true; } catch {}
    if (exists) {
      result.skipped.push(overlay.name);
      continue;
    }
    result.added.push({ name: overlay.name, files: overlay.files.length });
  }

  if (!dryRun) {
    for (const entry of result.added) {
      const overlay = overlays.find((item) => item.name === entry.name);
      const destination = path.join(destinationRoot, overlay.name);
      await mkdir(destination, { recursive: true });
      for (const file of overlay.files) {
        const targetFile = path.join(destination, file.relative);
        await mkdir(path.dirname(targetFile), { recursive: true });
        await writeFile(targetFile, await readFile(file.source));
      }
    }
  }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await syncOverlays({ ...parseArgs(process.argv.slice(2)) });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
    process.exitCode = 1;
  }
}
