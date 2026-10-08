import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { classifyCommand, loadPolicy, redact, record } from '../scripts/policy-check.mjs';
import { containedPath } from '../scripts/safe-paths.mjs';
import { KIT_ROOT } from '../scripts/kit-lifecycle.mjs';
import { buildProjectState, inspectProject } from '../scripts/project-state.mjs';

async function fixture(t) {
  const target = await mkdtemp(path.join(os.tmpdir(), 'natakorn-security-'));
  t.after(() => rm(target, { recursive: true, force: true }));
  return target;
}
function run(target, name, args) {
  return spawnSync(process.execPath, [path.join(KIT_ROOT, 'scripts', name), '--target', target, ...args], { encoding: 'utf8', timeout: 10000, windowsHide: true });
}

test('missing policy uses built-in deny rules and the runner refuses execution', async (t) => {
  const target = await fixture(t);
  const policy = await loadPolicy(target);
  assert.equal(classifyCommand('git reset --hard HEAD', policy).decision, 'deny');
  const result = run(target, 'run-safe.mjs', ['--command', 'git reset --hard HEAD']);
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).policyDecision, 'deny');
});

test('local policy cannot remove built-in destructive and remote approval rules', () => {
  assert.equal(classifyCommand('git reset --hard', { denyPatterns: [], approvalPatterns: [] }).decision, 'deny');
  assert.equal(classifyCommand('git push origin main', { approvalPatterns: [] }).decision, 'approval_required');
  assert.equal(classifyCommand('git -C "project with spaces" reset --hard HEAD').decision, 'deny');
  assert.equal(classifyCommand('git --git-dir=.git push origin main').decision, 'approval_required');
  assert.equal(classifyCommand('git push origin main --force').decision, 'deny');
});

test('malformed policy never falls back to allowing execution', async (t) => {
  const target = await fixture(t);
  await mkdir(path.join(target, '.ai-kit'));
  for (const content of ['{invalid', JSON.stringify({ denyPatterns: ['['] }), JSON.stringify({ auditLog: '../outside.jsonl' }), JSON.stringify({ denyPatterns: 'invalid' })]) {
    await writeFile(path.join(target, '.ai-kit/policy.json'), content);
    const result = run(target, 'run-safe.mjs', ['--command', 'echo SHOULD_NOT_EXECUTE']);
    assert.equal(result.status, 1);
    assert(!result.stdout.includes('SHOULD_NOT_EXECUTE'));
    assert.match(result.stderr, /Cannot load command policy/);
  }
});

test('remote writes require approval and approval requires an authorization reason', async (t) => {
  const target = await fixture(t);
  const unapproved = run(target, 'run-safe.mjs', ['--command', 'git push origin main']);
  assert.equal(unapproved.status, 2);
  const noReason = run(target, 'run-safe.mjs', ['--command', 'git push origin main', '--approved']);
  assert.equal(noReason.status, 1);
  assert.match(noReason.stderr, /requires --reason/);
});

test('allowed runner propagates command failure', async (t) => {
  const target = await fixture(t);
  const result = run(target, 'run-safe.mjs', ['--command', 'natakorn-command-that-does-not-exist']);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /"ok": false/);
});

test('redacts quoted secrets, credential URLs, JSON fields, and authorization headers', () => {
  for (const input of ['TOKEN="sensitive multi word value"', "password='sensitive multi word value'", 'postgres://user:sensitive@example/db', '{"api_key": "sensitive multi word value"}', 'Authorization: Bearer sensitive', 'ACCESS_TOKEN=sensitive']) {
    assert(!redact(input).includes('sensitive'), input);
  }
  assert.equal(redact('Ordinary handoff: next step is documentation'), 'Ordinary handoff: next step is documentation');
});

test('audit traversal and absolute paths are refused', async (t) => {
  const target = await fixture(t);
  await assert.rejects(record(target, { command: 'echo safe' }, { auditLog: '../audit.jsonl' }), /traversal/);
  for (const name of ['/tmp/file', '../file', 'a/../../file', 'C:/file', 'a\\file', './file']) assert.throws(() => containedPath(target, name));
});

test('memory refuses secrets in text, owner, and status before writing', async (t) => {
  const target = await fixture(t);
  for (const args of [
    ['--kind', 'handoff', '--text', 'TOKEN="sensitive multi word"'],
    ['--kind', 'decision', '--text', 'safe', '--owner', 'password=sensitive'],
    ['--kind', 'lesson', '--text', 'safe', '--status', 'api_key=sensitive'],
  ]) assert.equal(run(target, 'memory.mjs', args).status, 1);
  assert.equal(await lstat(path.join(target, '.ai-kit/memory')).catch(() => null), null);
});

test('metrics refuse secrets, unknown events, and invalid numeric counters', async (t) => {
  const target = await fixture(t);
  for (const args of [
    ['--event', 'check', '--note', 'TOKEN=sensitive'], ['--event', 'check', '--files', '-1'],
    ['--event', 'check', '--tokens', 'NaN'], ['--event', 'unknown'], ['--event', 'check', '--duration-ms', '1.5'],
  ]) assert.equal(run(target, 'metrics.mjs', args).status, 1);
  assert.equal(await lstat(path.join(target, '.ai-kit/metrics/events.jsonl')).catch(() => null), null);
});

test('valid memory and metrics persist non-secret continuity', async (t) => {
  const target = await fixture(t);
  assert.equal(run(target, 'memory.mjs', ['--kind', 'handoff', '--text', 'Continue the CLI documentation']).status, 0);
  assert.match(await readFile(path.join(target, '.ai-kit/memory/handoff.md'), 'utf8'), /Continue the CLI/);
  assert.equal(run(target, 'metrics.mjs', ['--event', 'check', '--session', 'release-1', '--files', '2', '--tokens', '100', '--status', 'passed']).status, 0);
  const event = JSON.parse(await readFile(path.join(target, '.ai-kit/metrics/events.jsonl'), 'utf8'));
  assert.equal(event.tokens, 100);
});

test('detector redacts secrets embedded in package script commands', async (t) => {
  const target = await fixture(t);
  await writeFile(path.join(target, 'package.json'), JSON.stringify({ scripts: { test: 'API_KEY="sensitive multi word" node --test' } }));
  const state = buildProjectState(await inspectProject(target));
  assert(!JSON.stringify(state).includes('sensitive'));
  assert.match(state.detected.capabilities.qualityScripts.test, /REDACTED/);
});
