import { createHash } from 'node:crypto';
import { lstat, mkdir, open, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafePath, atomicWrite, readOptional } from './safe-paths.mjs';
import { buildProjectState, inspectProject } from './project-state.mjs';

export const KIT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const INSTALL_FILE = '.ai-kit/installation.json';
const digest = (content) => createHash('sha256').update(content).digest('hex');
const BASE_FILES = [
  ['START_PROMPT.md', 'START_PROMPT.md'],
  ['templates/AGENTS.md', 'AGENTS.md'],
  ['templates/PROJECT_CONTEXT.md', 'PROJECT_CONTEXT.md'],
  ['templates/run.md', 'docs/run.md'],
  ['templates/.gitignore', '.gitignore'],
  ['templates/.editorconfig', '.editorconfig'],
  ['templates/env.example', '.env.example'],
  ['templates/repomix.config.json', 'repomix.config.json'],
  ['templates/repomixignore', '.repomixignore'],
  ['templates/policy.json', '.ai-kit/policy.json'],
  ['templates/memory/README.md', '.ai-kit/memory/README.md'],
  ['toolchain.json', '.ai-kit/toolchain.json'],
  ['sources.json', '.ai-kit/sources.json'],
];
export const AGENT_PATHS = { codex: '.agents/skills', claude: '.claude/skills', copilot: '.github/skills', gemini: '.gemini/skills' };
const POINTERS = { claude: ['templates/agent-pointers/CLAUDE.md', 'CLAUDE.md'], gemini: ['templates/agent-pointers/GEMINI.md', 'GEMINI.md'], copilot: ['templates/agent-pointers/.github/copilot-instructions.md', '.github/copilot-instructions.md'] };
export const OPTIONAL_FILES = {
  playwright: ['templates/optional/playwright.config.ts', 'playwright.config.ts'],
  accessibility: ['templates/optional/accessibility.spec.ts', 'tests/accessibility.spec.ts'],
  knip: ['templates/optional/knip.jsonc', 'knip.jsonc'],
  lefthook: ['templates/optional/lefthook.yml.example', 'lefthook.yml'],
  ci: ['templates/optional/github-actions-ci.yml', '.github/workflows/ci.yml'],
};

async function walk(root, relative) {
  const directory = path.join(root, relative);
  const files = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = `${relative}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Source must not contain symbolic links: ${file}`);
    if (entry.isDirectory()) files.push(...await walk(root, file));
    else if (entry.isFile()) files.push(file);
    else throw new Error(`Source must contain regular files: ${file}`);
  }
  return files;
}

export async function readInstallation(target) {
  const bytes = await readOptional(await assertSafePath(target, INSTALL_FILE));
  if (!bytes) return null;
  const ledger = JSON.parse(bytes.toString('utf8'));
  if (ledger.schemaVersion !== 1 || !ledger.files || typeof ledger.files !== 'object' || Array.isArray(ledger.files)) throw new Error('Invalid installation ledger; restore it from version control');
  for (const [relative, hash] of Object.entries(ledger.files)) {
    await assertSafePath(target, relative);
    if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error('Invalid installation hash');
  }
  return ledger;
}

export async function installationStatus(target) {
  const ledger = await readInstallation(target);
  if (!ledger) return { ok: false, installed: false, files: [], error: 'No installation ledger. Run init from a kit checkout.' };
  const files = [];
  for (const [relative, expected] of Object.entries(ledger.files)) {
    const content = await readOptional(await assertSafePath(target, relative));
    files.push({ path: relative, status: content === null ? 'missing' : digest(content) === expected ? 'unchanged' : 'modified' });
  }
  // Modified files can be intentional; missing files prevent a complete installation.
  return { ok: !files.some((file) => file.status === 'missing'), installed: true, version: ledger.version, agents: ledger.agents, files };
}

export async function installProject({ target, update = false, dryRun = false, agents, optional, acceptDrift = false, kitRoot = KIT_ROOT }) {
  target = path.resolve(target);
  if (target === path.resolve(kitRoot)) throw new Error('Choose a project directory outside the kit checkout');
  if (!(await lstat(target)).isDirectory()) throw new Error('Target must be an existing directory');
  if (!(await lstat(path.join(kitRoot, 'templates')).catch(() => null))?.isDirectory()) throw new Error('Init/update require the full kit checkout; installed helpers can inspect, doctor, and status');
  const previous = await readInstallation(target);
  agents = agents ?? previous?.agents ?? [];
  optional = optional ?? previous?.optional ?? [];
  if (agents.some((agent) => !Object.hasOwn(AGENT_PATHS, agent))) throw new Error(`Supported agents: ${Object.keys(AGENT_PATHS).join(', ')}`);
  if (optional.some((name) => !Object.hasOwn(OPTIONAL_FILES, name))) throw new Error(`Supported optional starters: ${Object.keys(OPTIONAL_FILES).join(', ')}`);
  if (optional.includes('accessibility') && !optional.includes('playwright')) throw new Error('The accessibility starter requires --with playwright,accessibility');
  const inspection = await inspectProject(target);
  if (inspection.driftDetected && !acceptDrift) return { ok: false, blocked: 'architecture-drift', dryRun, target, pendingDecisions: inspection.pendingDecisions, hint: 'Inspect the architecture change, then rerun with --accept-drift if intentional.' };

  const manifest = JSON.parse(await readFile(path.join(kitRoot, 'toolchain.json'), 'utf8'));
  const pairs = [...BASE_FILES];
  for (const name of manifest.runtime.files) pairs.push([`scripts/${name}`, `${manifest.runtime.destination}/${name}`]);
  for (const pack of manifest.skills.packs) {
    await assertSafePath(kitRoot, `${pack.sourcePath}/SKILL.md`);
    for (const source of await walk(kitRoot, pack.sourcePath)) {
      const suffix = source.slice(pack.sourcePath.length + 1);
      pairs.push([source, `${pack.bootstrapPath}/${suffix}`]);
      for (const agent of agents) pairs.push([source, `${AGENT_PATHS[agent]}/${pack.id}/${suffix}`]);
    }
  }
  for (const agent of agents) if (POINTERS[agent]) pairs.push(POINTERS[agent]);
  for (const name of optional) pairs.push(OPTIONAL_FILES[name]);

  const operations = [];
  const destinations = new Set();
  for (const [source, relative] of pairs) {
    if (destinations.has(relative)) throw new Error(`Duplicate destination: ${relative}`);
    destinations.add(relative);
    const content = await readFile(await assertSafePath(kitRoot, source));
    const current = await readOptional(await assertSafePath(target, relative));
    const currentHash = current === null ? null : digest(current);
    const owned = previous?.files[relative];
    const status = current === null ? 'add' : owned && currentHash !== owned ? 'conflict' : current.equals(content) ? 'unchanged' : update && owned ? 'update' : 'preserve';
    operations.push({ path: relative, status, source, content, current, hash: digest(content) });
  }
  await assertSafePath(target, '.ai-kit/project.json');
  await assertSafePath(target, INSTALL_FILE);
  const summary = { ok: true, dryRun, target, update, agents, optional, files: operations.map(({ path: file, status }) => ({ path: file, status })) };
  const conflicts = operations.filter((operation) => operation.status === 'conflict').map((operation) => operation.path);
  if (conflicts.length) return { ...summary, ok: false, blocked: 'modified-managed-files', conflicts, hint: 'Review and merge your local edits before updating. No files were changed.' };
  if (dryRun) return summary;

  const lockFile = await assertSafePath(target, '.ai-kit/install.lock');
  await mkdir(path.dirname(lockFile), { recursive: true });
  let lock;
  try { lock = await open(lockFile, 'wx'); }
  catch (error) { if (error.code === 'EEXIST') throw new Error('Another install holds .ai-kit/install.lock; confirm it finished before removing a stale lock'); throw error; }
  const changed = [];
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    // Recheck snapshots after acquiring the lock; never overwrite a concurrent user edit.
    for (const operation of operations) {
      const current = await readOptional(await assertSafePath(target, operation.path));
      if ((current === null) !== (operation.current === null) || (current && !current.equals(operation.current))) throw new Error(`File changed during planning: ${operation.path}`);
    }
    for (const operation of operations.filter((item) => ['add', 'update'].includes(item.status))) {
      const file = await assertSafePath(target, operation.path);
      await mkdir(path.dirname(file), { recursive: true });
      if (operation.status === 'add') await writeFile(file, operation.content, { flag: 'wx' });
      else await atomicWrite(target, operation.path, operation.content);
      changed.push({ path: operation.path, previous: operation.current });
    }
    const currentInspection = await inspectProject(target);
    const state = buildProjectState({ ...currentInspection, driftDetected: false, pendingDecisions: currentInspection.pendingDecisions.filter((item) => item !== 'review_architecture_drift_before_setup_changes') });
    const files = { ...(previous?.files ?? {}) };
    for (const operation of operations) if (['add', 'update'].includes(operation.status)) files[operation.path] = operation.hash;
    const ledger = { schemaVersion: 1, version: previous && !update ? previous.version : manifest.version, agents, optional, files };
    for (const [relative, value] of [['.ai-kit/project.json', state], [INSTALL_FILE, ledger]]) {
      const before = await readOptional(await assertSafePath(target, relative));
      const after = Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
      if (before?.equals(after)) continue;
      await atomicWrite(target, relative, after);
      changed.push({ path: relative, previous: before });
    }
    return { ...summary, version: ledger.version, mode: currentInspection.mode, stateWritten: true };
  } catch (error) {
    for (const item of changed.reverse()) {
      if (item.previous === null) await unlink(await assertSafePath(target, item.path));
      else await atomicWrite(target, item.path, item.previous);
    }
    throw error;
  } finally {
    await lock.close();
    await unlink(lockFile);
  }
}
