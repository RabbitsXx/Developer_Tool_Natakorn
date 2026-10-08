#!/usr/bin/env node
/** Compatibility helper. Prefer the lifecycle CLI for complete installation/updates. */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafePath, readOptional } from './safe-paths.mjs';
import { readInstallation } from './kit-lifecycle.mjs';

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(kitRoot, 'toolchain.json'), 'utf8'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const options = { target: null, update: false, dryRun: false };
for (let index = 2; index < process.argv.length; index += 1) {
  const flag = process.argv[index];
  if (flag === '--target') {
    options.target = process.argv[++index];
    if (!options.target || options.target.startsWith('--')) throw new Error('--target requires a value');
  } else if (flag === '--update') options.update = true;
  else if (flag === '--dry-run') options.dryRun = true;
  else throw new Error(`Unknown option: ${flag}`);
}
if (!options.target) throw new Error('Usage: sync-runtime.mjs --target <project> [--update] [--dry-run]');
const target = path.resolve(options.target);
const ledger = await readInstallation(target);
const pairs = manifest.runtime.files.map((name) => [`scripts/${name}`, `${manifest.runtime.destination}/${name}`]);
pairs.push(['toolchain.json', '.ai-kit/toolchain.json'], ['sources.json', '.ai-kit/sources.json']);
const operations = [];
for (const [source, relative] of pairs) {
  const content = await readFile(await assertSafePath(kitRoot, source));
  const current = await readOptional(await assertSafePath(target, relative));
  const status = current === null ? 'added' : current.equals(content) ? 'skipped' : 'differs';
  if (status === 'differs' && options.update && (!ledger?.files[relative] || hash(current) !== ledger.files[relative])) throw new Error(`Cannot update untracked or customized runtime file: ${relative}. Review and merge manually.`);
  operations.push({ path: relative, content, current, status });
}
const result = { ok: true, target, dryRun: options.dryRun, destination: manifest.runtime.destination, added: [], skipped: [], differs: [], updated: [] };
for (const operation of operations) {
  result[operation.status].push(operation.path);
  if (options.update && operation.status === 'differs') result.updated.push(operation.path);
}
if (!options.dryRun && options.update) {
  throw new Error('For tracked runtime upgrades use: node bin/natakorn.mjs update --target <project>. This preserves the installation ledger and uses the install lock.');
}
if (!options.dryRun) {
  for (const operation of operations.filter((item) => item.status === 'added')) {
    const destination = await assertSafePath(target, operation.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, operation.content, { flag: 'wx' });
  }
}
console.log(JSON.stringify(result, null, 2));
