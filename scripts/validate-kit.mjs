import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findSkillDocDrift } from './sync-skill-docs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const required = [
  'START_PROMPT.md',
  'AGENTS.md',
  'SETUP.md',
  'toolchain.json',
  'lefthook.yml',
  'docs/BOOTSTRAP_PROTOCOL.md',
  'docs/ARCHITECTURE.md',
  'docs/AUDIT.md',
  'docs/INSTALLATION.md',
  'docs/CONTEXT_EFFICIENCY.md',
  'docs/QUALITY_AND_PRODUCTION.md',
  'templates/AGENTS.md',
  'templates/PROJECT_CONTEXT.md',
  // Skill pack files are not listed here: they are validated from toolchain.json `skills.packs`, so
  // registering a new pack is a manifest change instead of an edit to this list.
  'templates/optional/playwright.config.ts',
  'templates/optional/accessibility.spec.ts',
  'templates/optional/knip.jsonc',
  'templates/optional/lefthook.yml.example',
  'templates/optional/github-actions-ci.yml',
  'scripts/sync-skills.mjs',
  'scripts/sync-skill-docs.mjs',
  'scripts/new-skill.mjs',
  'scripts/project-state.mjs',
  'scripts/setup-project.mjs',
  'scripts/verify-bootstrap-protocol.mjs',
  'scripts/verify-tools.ps1',
  'scripts/tool-report.mjs',
];

for (const file of required) await access(path.join(root, file));
const toolchain = JSON.parse(await readFile(path.join(root, 'toolchain.json'), 'utf8'));
if (toolchain.schemaVersion < 4) throw new Error('toolchain schemaVersion must be >= 4');
if (toolchain.bootstrap?.startPrompt !== 'START_PROMPT.md') throw new Error('bootstrap start prompt contract is missing');
if (toolchain.bootstrap?.stateFile !== '.ai-kit/project.json') throw new Error('bootstrap state-file contract is missing');
for (const mode of ['NEW_PROJECT', 'EXISTING_PROJECT', 'RESUME_CONFIGURED_PROJECT']) {
  if (!toolchain.bootstrap?.modes?.includes(mode)) throw new Error(`missing bootstrap mode: ${mode}`);
}
if (!toolchain.contextBudget?.smallTaskMaxFiles || !toolchain.contextBudget?.mediumTaskMaxFiles) throw new Error('context budget is missing');
for (const id of ['playwright', 'axe-playwright', 'knip', 'lefthook', 'sentry-or-opentelemetry']) {
  if (!toolchain.tools.some((tool) => tool.id === id)) throw new Error(`missing capability: ${id}`);
}
for (const id of ['neon', 'supabase', 'postgresql']) {
  if (!toolchain.databaseOptions.some((item) => item.id === id)) throw new Error(`missing database option: ${id}`);
}
const startPrompt = await readFile(path.join(root, 'START_PROMPT.md'), 'utf8');
for (const phrase of ['NEW_PROJECT', 'EXISTING_PROJECT', 'RESUME_CONFIGURED_PROJECT', '.ai-kit/project.json', 'THINGS YOU WILL NOT CHANGE', '.ai-kit/skills/ui-ux/SKILL.md', 'Knip', 'Lefthook']) {
  if (!startPrompt.includes(phrase)) throw new Error(`START_PROMPT.md contract missing: ${phrase}`);
}
const agents = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
if (!agents.includes('Search before reading broadly') || !agents.includes('Playwright') || !agents.includes('.ai-kit/project.json')) throw new Error('AGENTS.md policy upgrade missing');
const projectTemplate = await readFile(path.join(root, 'templates/PROJECT_CONTEXT.md'), 'utf8');
if (!projectTemplate.includes('Database provider') || !projectTemplate.includes('AI context budget') || !projectTemplate.includes('.ai-kit/project.json')) throw new Error('PROJECT_CONTEXT template upgrade missing');
const bootstrapPs1 = await readFile(path.join(root, 'scripts/bootstrap-project.ps1'), 'utf8');
const bootstrapSh = await readFile(path.join(root, 'scripts/bootstrap-project.sh'), 'utf8');
for (const [name, text] of [['PowerShell bootstrap', bootstrapPs1], ['shell bootstrap', bootstrapSh]]) {
  if (!text.includes('START_PROMPT.md') || !text.includes('setup-project.mjs')) throw new Error(`${name} does not establish AI bootstrap state`);
  if (!text.includes('.ai-kit') || !text.includes('sync-skills.mjs')) throw new Error(`${name} does not synchronize Agent Skills packs`);
}
// PowerShell 5.1 reads BOM-less UTF-8 scripts as ANSI, so one non-ASCII character in a .ps1 file
// becomes invalid UTF-8 in captured output that log tools and gates then cannot read. Node and
// shell scripts are UTF-8 by contract, so only .ps1 files carry this risk.
for (const file of (await readdir(path.join(root, 'scripts'))).filter((name) => name.endsWith('.ps1'))) {
  const bytes = await readFile(path.join(root, 'scripts', file));
  if (bytes.some((byte) => byte > 0x7e && byte !== 0x09 && byte !== 0x0a && byte !== 0x0d)) {
    throw new Error(`scripts/${file} contains non-ASCII bytes; PowerShell 5.1 mangles BOM-less UTF-8 output`);
  }
}

const toolReport = await readFile(path.join(root, 'scripts/tool-report.mjs'), 'utf8');
for (const evidence of ['toolchain.json', 'tool-report.json', 'tool-report.md', 'tool-report.html']) {
  if (!toolReport.includes(evidence)) throw new Error(`tool-report.mjs does not handle ${evidence}`);
}

const verifyTools = await readFile(path.join(root, 'scripts/verify-tools.ps1'), 'utf8');
for (const evidence of ['doctor.ps1', 'scripts/validate-kit.mjs', 'scripts/verify-bootstrap-protocol.mjs']) {
  if (!verifyTools.includes(evidence)) throw new Error(`verify-tools.ps1 does not run ${evidence}`);
}

const kitHook = await readFile(path.join(root, 'lefthook.yml'), 'utf8');
for (const target of ['scripts/validate-kit.mjs', 'scripts/verify-bootstrap-protocol.mjs']) {
  if (!kitHook.includes(target)) throw new Error(`lefthook.yml does not run ${target}`);
}
if (!kitHook.includes('pre-commit')) throw new Error('lefthook.yml must guard pre-commit');

// Agent Skills contract: every registered pack stays installable in any harness that reads SKILL.md.
const registeredPacks = toolchain.skills?.packs;
if (!Array.isArray(registeredPacks) || registeredPacks.length < 2) throw new Error('toolchain.skills.packs must register at least the ui-ux and api packs');
if (toolchain.skills?.entry !== 'SKILL.md') throw new Error('toolchain skills.entry must be SKILL.md');
const knownTags = toolchain.skills?.recommendForTags ?? [];
const skillReport = [];
const pendingScaffolds = [];
for (const pack of registeredPacks) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(pack.id ?? '')) throw new Error(`skill pack id is not spec-valid: ${pack.id}`);
  if (pack.sourcePath !== `skills/${pack.id}`) throw new Error(`skill pack ${pack.id} sourcePath must be skills/${pack.id}`);
  if (pack.bootstrapPath !== `.ai-kit/skills/${pack.id}`) throw new Error(`skill pack ${pack.id} bootstrapPath must be .ai-kit/skills/${pack.id}`);
  if (!pack.activation) throw new Error(`skill pack ${pack.id} is missing activation guidance`);
  if (!pack.summary || !pack.summaryTh) throw new Error(`skill pack ${pack.id} needs summary and summaryTh for the generated docs`);
  for (const tag of pack.recommendFor ?? []) {
    if (!knownTags.includes(tag)) throw new Error(`skill pack ${pack.id} uses unknown recommendFor tag: ${tag}`);
  }
  const skillDir = path.join(root, pack.sourcePath);
  const skillEntry = await readFile(path.join(skillDir, 'SKILL.md'), 'utf8');
  const frontmatter = skillEntry.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!frontmatter) throw new Error(`${pack.sourcePath}/SKILL.md must start with YAML frontmatter`);
  const skillName = frontmatter[1].match(/^name:\s*(\S+)\s*$/m)?.[1];
  const skillDescription = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (skillName !== pack.id) throw new Error(`${pack.sourcePath}/SKILL.md name must match the pack id: ${skillName} !== ${pack.id}`);
  if (skillName !== path.basename(skillDir)) throw new Error(`${pack.sourcePath}/SKILL.md name must match its directory: ${skillName}`);
  if (!skillDescription || skillDescription.length > 1024) throw new Error(`${pack.sourcePath}/SKILL.md description must be 1-1024 characters`);
  const bodyLines = skillEntry.slice(frontmatter[0].length).trimEnd().split(/\r?\n/).length;
  if (bodyLines > 500) throw new Error(`${pack.sourcePath}/SKILL.md body must stay under 500 lines (found ${bodyLines})`);
  const references = [...new Set([...skillEntry.matchAll(/\(references\/[^)]+\)/g)].map((match) => match[0].slice(1, -1)))];
  if (references.length === 0) throw new Error(`${pack.sourcePath}/SKILL.md must reference progressive-disclosure files under references/`);
  let todoMarkers = skillEntry.includes('<!-- TODO') ? 1 : 0;
  for (const reference of references) {
    await access(path.join(skillDir, reference));
    if ((await readFile(path.join(skillDir, reference), 'utf8')).includes('<!-- TODO')) todoMarkers += 1;
  }
  if (todoMarkers) pendingScaffolds.push(pack.id);
  skillReport.push({ id: pack.id, version: pack.version ?? null, entry: toolchain.skills.entry, bodyLines, references: references.length });
}

// The generated pack tables must match the manifest, so a registered pack cannot ship with stale docs.
const skillDocDrift = await findSkillDocDrift(toolchain, root);
if (skillDocDrift.length) {
  throw new Error(`skill pack docs are out of date (${skillDocDrift.map((item) => `${item.file}: ${item.reason}`).join(', ')}); run node scripts/sync-skill-docs.mjs`);
}

console.log(JSON.stringify({
  ok: true,
  schemaVersion: toolchain.schemaVersion,
  requiredFiles: required.length,
  selfCheckHook: 'lefthook.yml (pre-commit)',
  contextBudget: toolchain.contextBudget,
  databaseOptions: toolchain.databaseOptions.map((item) => item.id),
  browserE2E: toolchain.tools.find((tool) => tool.id === 'playwright')?.tier,
  accessibility: toolchain.tools.find((tool) => tool.id === 'axe-playwright')?.tier,
  codeHealth: toolchain.tools.find((tool) => tool.id === 'knip')?.tier,
  gitHooks: toolchain.tools.find((tool) => tool.id === 'lefthook')?.tier,
  skills: { spec: toolchain.skills?.spec, syncScript: toolchain.skills?.syncScript, docSync: toolchain.skills?.docSync, packs: skillReport },
  skillDocs: { generated: ['README.md', 'docs/INSTALLATION.md'], inSync: true },
  // Non-fatal: a scaffolded pack passes validation while its TODO markers are still unfilled.
  skillPacksPendingContent: pendingScaffolds,
  observability: toolchain.tools.find((tool) => tool.id === 'sentry-or-opentelemetry')?.tier,
  bootstrap: toolchain.bootstrap,
  optionalCI: true,
}, null, 2));
