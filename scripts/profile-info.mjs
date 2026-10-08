#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectProject } from './project-state.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'toolchain.json'), 'utf8'));
const profiles = manifest.profiles?.items ?? [];
const args = process.argv.slice(2);
let target = null;
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === '--target') target = args[++index] ?? null;
  else throw new Error(`Unknown option: ${args[index]}`);
}

console.log('ID\tDEFAULT\tTRAITS\tSUMMARY');
for (const profile of profiles) {
  console.log(`${profile.id}\t${profile.default ? 'yes' : ''}\t${profile.traits.join(', ')}\t${profile.summary}`);
}
if (target) {
  const inspection = await inspectProject(target);
  console.log(`Detected profile: ${inspection.profile.primary}`);
  console.log(`Matched profiles: ${inspection.profile.items.map((profile) => profile.id).join(', ')}`);
}
