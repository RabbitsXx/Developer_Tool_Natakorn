import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const commands = [
  ['syntax', ['scripts/check-syntax.mjs']],
  ['manifest-and-docs', ['scripts/validate-kit.mjs']],
  ['bootstrap-protocol', ['scripts/verify-bootstrap-protocol.mjs']],
  ['contract-evals', ['scripts/eval-kit.mjs']],
  ['regressions', ['--test']],
];
const checks = [];
for (const [name, args] of commands) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 120000, windowsHide: true });
  const passed = !result.error && result.status === 0;
  checks.push({ name, passed, exitCode: result.status, error: result.error?.message });
  process.stderr.write(`[${passed ? 'PASS' : 'FAIL'}] ${name}\n`);
  if (!passed) process.stderr.write(`${result.stdout ?? ''}${result.stderr ?? ''}\n`);
  else if (name === 'regressions') process.stderr.write(result.stdout);
}
const ok = checks.every((check) => check.passed);
console.log(JSON.stringify({ ok, checks, environment: { platform: process.platform, node: process.versions.node } }, null, 2));
if (!ok) process.exitCode = 1;
