import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [];
for (const directory of ['bin', 'scripts', 'tests']) {
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.mjs')) files.push(`${directory}/${entry.name}`);
  }
}
const failed = [];
for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8', windowsHide: true });
  if (result.error || result.status !== 0) failed.push({ file, error: result.error?.message ?? result.stderr });
}
console.log(JSON.stringify({ ok: failed.length === 0, checked: files.length, failed }, null, 2));
if (failed.length) process.exitCode = 1;
