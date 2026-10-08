#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(kitRoot, 'toolchain.json'), 'utf8'));
const configuredFiles = manifest.runtime?.files;
if (!Array.isArray(configuredFiles) || configuredFiles.length === 0) throw new Error('toolchain.json runtime.files must list runtime helpers');

function parseArgs(args) {
  const options = { target: null, update: false };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--target') options.target = args[++index] ?? null;
    else if (args[index] === '--update') options.update = true;
    else throw new Error(`Unknown option: ${args[index]}`);
  }
  if (!options.target) throw new Error('Usage: node scripts/sync-runtime.mjs --target <project> [--update]');
  return options;
}

const options = parseArgs(process.argv.slice(2));
const target = path.resolve(options.target);
try { await access(target); } catch { throw new Error(`Target directory does not exist: ${target}`); }
const destinationRoot = path.join(target, manifest.runtime.destination ?? '.ai-kit/bin');
await mkdir(destinationRoot, { recursive: true });

const result = { ok: true, target, destination: path.relative(target, destinationRoot).split(path.sep).join('/'), added: [], skipped: [], differs: [], updated: [] };
for (const name of configuredFiles) {
  const source = path.join(kitRoot, 'scripts', name);
  const destination = path.join(destinationRoot, name);
  const content = await readFile(source);
  let current;
  try { current = await readFile(destination); } catch { current = null; }
  if (current === null) {
    await writeFile(destination, content);
    result.added.push(name);
  } else if (current.equals(content)) {
    result.skipped.push(name);
  } else {
    result.differs.push(name);
    if (options.update) {
      await writeFile(destination, content);
      result.updated.push(name);
    }
  }
}
console.log(JSON.stringify(result, null, 2));
