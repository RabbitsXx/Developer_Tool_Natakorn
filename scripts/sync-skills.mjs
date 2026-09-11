#!/usr/bin/env node
/**
 * sync-skills.mjs - copies every Agent Skills pack registered in toolchain.json into a target project.
 *
 * The bootstrap scripts call this instead of carrying their own copy lists, so adding a pack under
 * `skills.packs` in toolchain.json is the only change needed to ship it. Existing destinations are
 * skipped, never overwritten, so project-local edits to a skill survive a re-run.
 *
 * Usage:
 *   node scripts/sync-skills.mjs --target <dir> [--dry-run]
 */
import { access, copyFile, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const args = { target: '.', dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--dry-run') args.dryRun = true;
    else if (flag === '--target') args.target = argv[++index] ?? '.';
    else if (flag.startsWith('--target=')) args.target = flag.slice('--target='.length);
    else throw new Error(`Unknown argument: ${flag}`);
  }
  return args;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir, prefix = '') {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(path.join(dir, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}

const args = parseArgs(process.argv.slice(2));
const manifest = JSON.parse(await readFile(path.join(kitRoot, 'toolchain.json'), 'utf8'));
const entry = manifest.skills?.entry ?? 'SKILL.md';
const packs = manifest.skills?.packs;
if (!Array.isArray(packs) || packs.length === 0) throw new Error('toolchain.json registers no skills.packs');

const target = path.resolve(args.target);
if (!(await stat(target).catch(() => null))?.isDirectory()) throw new Error(`Target directory does not exist: ${target}`);

const report = [];
for (const pack of packs) {
  if (!pack?.id || !pack?.sourcePath || !pack?.bootstrapPath) {
    throw new Error(`Skill pack ${pack?.id ?? '(unnamed)'} is missing id, sourcePath, or bootstrapPath`);
  }
  const sourceDir = path.join(kitRoot, pack.sourcePath);
  if (!(await exists(path.join(sourceDir, entry)))) throw new Error(`Skill pack ${pack.id} has no ${entry} in ${pack.sourcePath}`);

  const added = [];
  let skipped = 0;
  for (const relative of await listFiles(sourceDir)) {
    const destination = path.join(target, pack.bootstrapPath, relative);
    if (await exists(destination)) {
      skipped += 1;
      continue;
    }
    if (!args.dryRun) {
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(path.join(sourceDir, relative), destination);
    }
    added.push(relative);
  }
  report.push({ id: pack.id, destination: pack.bootstrapPath, files: added.length + skipped, added, skipped });
}

console.log(JSON.stringify({ ok: true, dryRun: args.dryRun, target, packs: report }, null, 2));
