import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { installProject, installationStatus, KIT_ROOT } from '../scripts/kit-lifecycle.mjs';
import { inspectProject } from '../scripts/project-state.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'natakorn-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const target = path.join(root, 'งานทดสอบ with spaces');
  await mkdir(target);
  return { root, target };
}
async function snapshot(root) {
  const files = {};
  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = `${prefix}${entry.name}`;
      if (entry.isDirectory()) await walk(path.join(directory, entry.name), `${relative}/`);
      else if (entry.isFile()) files[relative] = (await readFile(path.join(directory, entry.name))).toString('base64');
    }
  }
  await walk(root);
  return files;
}
function cli(target, args, script = path.join(KIT_ROOT, 'bin/natakorn.mjs')) {
  return spawnSync(process.execPath, [script, ...args], { cwd: target, encoding: 'utf8', timeout: 20000, windowsHide: true });
}

test('dry-run validates a complete plan without creating files', async (t) => {
  const { target } = await fixture(t);
  const result = await installProject({ target, dryRun: true, agents: ['claude', 'codex'] });
  assert(result.ok);
  assert(result.files.some((file) => file.path === '.ai-kit/bin/policy-check.mjs'));
  assert(result.files.some((file) => file.path === '.claude/skills/api/SKILL.md'));
  assert.deepEqual(await readdir(target), []);
});

test('Unicode project boots, resumes byte-identically, and runs installed helpers', async (t) => {
  const { target } = await fixture(t);
  await installProject({ target, agents: ['claude', 'codex', 'gemini', 'copilot'] });
  const before = await snapshot(target);
  const inspection = await inspectProject(target);
  assert.equal(inspection.mode, 'RESUME_CONFIGURED_PROJECT');
  assert.equal(inspection.previousState.project.initialMode, 'NEW_PROJECT');
  assert.equal(inspection.driftDetected, false);
  await installProject({ target });
  assert.deepEqual(await snapshot(target), before);
  const localCli = path.join(target, '.ai-kit/bin/cli.mjs');
  for (const command of ['inspect', 'status', 'sources']) {
    const result = cli(target, [command], localCli);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).ok, true);
  }
  const policy = cli(target, ['--command', 'git status --short', '--dry-run'], path.join(target, '.ai-kit/bin/policy-check.mjs'));
  assert.equal(policy.status, 0, policy.stderr);
});

test('preserves user files without adopting identical preexisting files', async (t) => {
  const { target } = await fixture(t);
  await writeFile(path.join(target, 'AGENTS.md'), 'User-owned rules');
  await writeFile(path.join(target, '.editorconfig'), await readFile(path.join(KIT_ROOT, 'templates/.editorconfig')));
  await writeFile(path.join(target, 'package.json'), JSON.stringify({ dependencies: { next: '16', pg: '8' }, scripts: { test: 'node --test' } }));
  await writeFile(path.join(target, 'pnpm-lock.yaml'), 'lockfileVersion: 9');
  await writeFile(path.join(target, '.env'), 'TOKEN=DO_NOT_PERSIST_THIS');
  const pkg = await readFile(path.join(target, 'package.json'), 'utf8');
  await installProject({ target });
  const ledger = JSON.parse(await readFile(path.join(target, '.ai-kit/installation.json'), 'utf8'));
  assert(!Object.hasOwn(ledger.files, 'AGENTS.md'));
  assert(!Object.hasOwn(ledger.files, '.editorconfig'));
  assert.equal(await readFile(path.join(target, 'AGENTS.md'), 'utf8'), 'User-owned rules');
  assert.equal(await readFile(path.join(target, 'package.json'), 'utf8'), pkg);
  const state = JSON.parse(await readFile(path.join(target, '.ai-kit/project.json'), 'utf8'));
  assert.equal(state.detected.packageManager.selected, 'pnpm');
  assert(!JSON.stringify(state).includes('DO_NOT_PERSIST_THIS'));
});

test('safe update applies new templates only while installed hashes match', async (t) => {
  const { root, target } = await fixture(t);
  await installProject({ target });
  const nextKit = path.join(root, 'next-kit');
  await mkdir(nextKit);
  for (const name of ['templates', 'skills', 'scripts', 'START_PROMPT.md', 'toolchain.json', 'sources.json']) await cp(path.join(KIT_ROOT, name), path.join(nextKit, name), { recursive: true });
  await writeFile(path.join(nextKit, 'templates/PROJECT_CONTEXT.md'), 'Updated upstream context\n');
  const plan = await installProject({ target, kitRoot: nextKit, update: true, dryRun: true });
  assert.equal(plan.files.find((file) => file.path === 'PROJECT_CONTEXT.md').status, 'update');
  assert((await installProject({ target, kitRoot: nextKit, update: true })).ok);
  assert.equal(await readFile(path.join(target, 'PROJECT_CONTEXT.md'), 'utf8'), 'Updated upstream context\n');
  assert((await installationStatus(target)).files.every((file) => file.status === 'unchanged'));
});

test('local edit blocks all update writes and status reports the modification', async (t) => {
  const { target } = await fixture(t);
  await installProject({ target });
  await writeFile(path.join(target, '.ai-kit/skills/api/SKILL.md'), 'User customization');
  const before = await snapshot(target);
  const result = await installProject({ target, update: true, agents: ['claude'] });
  assert.equal(result.ok, false);
  assert(result.conflicts.includes('.ai-kit/skills/api/SKILL.md'));
  assert.deepEqual(await snapshot(target), before);
  assert((await installationStatus(target)).files.some((file) => file.status === 'modified'));
});

test('drift names changed architecture and prevents writes until accepted', async (t) => {
  const { target } = await fixture(t);
  await writeFile(path.join(target, 'package.json'), JSON.stringify({ dependencies: { vite: '7' } }));
  await installProject({ target });
  await writeFile(path.join(target, 'package.json'), JSON.stringify({ dependencies: { next: '16' } }));
  const inspection = await inspectProject(target);
  assert(inspection.driftChanges.some((change) => change.field === 'framework' && change.previous === 'vite' && change.current === 'nextjs'));
  const before = await snapshot(target);
  assert.equal((await installProject({ target, update: true })).blocked, 'architecture-drift');
  assert.deepEqual(await snapshot(target), before);
  assert((await installProject({ target, update: true, acceptDrift: true })).ok);
  assert.equal((await inspectProject(target)).driftDetected, false);
});

test('invalid state and ledger fail before installing files', async (t) => {
  const { target } = await fixture(t);
  await mkdir(path.join(target, '.ai-kit'));
  await writeFile(path.join(target, '.ai-kit/project.json'), '{invalid');
  await assert.rejects(installProject({ target }), /valid JSON/);
  assert.equal((await readdir(target)).length, 1);
  await writeFile(path.join(target, '.ai-kit/project.json'), '{}');
  await assert.rejects(installProject({ target }), /Invalid project state/);
  await writeFile(path.join(target, '.ai-kit/installation.json'), JSON.stringify({ schemaVersion: 1, files: { '../outside': 'a'.repeat(64) } }));
  await assert.rejects(installProject({ target }), /traversal/);
});

test('symlinked destination cannot write outside the project', async (t) => {
  const { root, target } = await fixture(t);
  const outside = path.join(root, 'outside');
  await mkdir(outside);
  await symlink(outside, path.join(target, 'docs'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(installProject({ target }), /symbolic link/);
  assert.deepEqual(await readdir(outside), []);
  assert.equal(await lstat(path.join(target, 'AGENTS.md')).catch(() => null), null);
});

test('installation lock prevents a second mutation and preserves the first lock', async (t) => {
  const { target } = await fixture(t);
  await mkdir(path.join(target, '.ai-kit'));
  await writeFile(path.join(target, '.ai-kit/install.lock'), 'existing lock');
  await assert.rejects(installProject({ target }), /Another install/);
  assert.equal(await readFile(path.join(target, '.ai-kit/install.lock'), 'utf8'), 'existing lock');
  assert.equal(await lstat(path.join(target, 'AGENTS.md')).catch(() => null), null);
});

test('optional templates are selected explicitly and accessibility requires Playwright', async (t) => {
  const { target } = await fixture(t);
  await assert.rejects(installProject({ target, optional: ['accessibility'] }), /requires/);
  const result = await installProject({ target, optional: ['playwright', 'accessibility', 'knip'], dryRun: true });
  assert(result.files.some((file) => file.path === 'tests/accessibility.spec.ts'));
  assert(!result.files.some((file) => file.path === '.github/workflows/ci.yml'));
  assert.deepEqual(await readdir(target), []);
});

test('CLI rejects invalid commands, flags, duplicates, and missing values', async (t) => {
  const { target } = await fixture(t);
  for (const args of [['unknown'], ['init', '--target'], ['inspect', '--dry-run'], ['init', '--target', '.', '--target', '.'], ['init', '--target=']]) {
    const result = cli(target, args);
    assert.equal(result.status, 2, `${args}: ${result.stderr}`);
    assert.equal(JSON.parse(result.stderr).ok, false);
  }
  assert.deepEqual(await readdir(target), []);
});

test('CLI supports help/version, read-only inspect, and nonzero status without a ledger', async (t) => {
  const { target } = await fixture(t);
  assert.match(cli(target, ['--help']).stdout, /Usage:/);
  assert.match(cli(target, ['--version']).stdout, /^1\.1\.0/);
  assert.equal(cli(target, ['inspect']).status, 0);
  assert.equal(cli(target, ['status']).status, 1);
  assert.deepEqual(await readdir(target), []);
});

test('installed doctor reports available and missing capabilities without writes', async (t) => {
  const { target } = await fixture(t);
  await installProject({ target });
  const before = await snapshot(target);
  const result = cli(target, ['doctor'], path.join(target, '.ai-kit/bin/cli.mjs'));
  const report = JSON.parse(result.stdout);
  assert(Array.isArray(report.checks));
  assert(report.checks.some((check) => check.id === 'node' && check.available));
  assert.equal(result.status, report.ok ? 0 : 1);
  assert.deepEqual(await snapshot(target), before);
});

test('PowerShell bootstrap delegates to the shared installer and dry-run stays read-only', { skip: process.platform !== 'win32' }, async (t) => {
  const { target } = await fixture(t);
  const script = path.join(KIT_ROOT, 'scripts/bootstrap-project.ps1');
  const run = (...extra) => spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-TargetPath', target, ...extra], { encoding: 'utf8', timeout: 30000, windowsHide: true });
  const planned = run('-DryRun');
  assert.equal(planned.status, 0, planned.stderr);
  assert.deepEqual(await readdir(target), []);
  const installed = run();
  assert.equal(installed.status, 0, installed.stderr);
  assert((await installationStatus(target)).ok);
  assert.equal((await inspectProject(target)).previousState.project.initialMode, 'NEW_PROJECT');
});
