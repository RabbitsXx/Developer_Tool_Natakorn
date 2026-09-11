import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  'skills/ui-ux/README.md',
  'skills/ui-ux/01-ux-architect.md',
  'skills/ui-ux/02-design-system.md',
  'skills/ui-ux/03-production-ui-builder.md',
  'skills/ui-ux/04-responsive-mobile.md',
  'skills/ui-ux/05-visual-qa.md',
  'templates/optional/playwright.config.ts',
  'templates/optional/accessibility.spec.ts',
  'templates/optional/knip.jsonc',
  'templates/optional/lefthook.yml.example',
  'templates/optional/github-actions-ci.yml',
  'scripts/project-state.mjs',
  'scripts/setup-project.mjs',
  'scripts/verify-bootstrap-protocol.mjs',
  'scripts/verify-tools.ps1',
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
for (const phrase of ['NEW_PROJECT', 'EXISTING_PROJECT', 'RESUME_CONFIGURED_PROJECT', '.ai-kit/project.json', 'THINGS YOU WILL NOT CHANGE', '.ai-kit/skills/ui-ux/README.md', 'Knip', 'Lefthook']) {
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
  if (!text.includes('.ai-kit') || !text.includes('skills/ui-ux')) throw new Error(`${name} does not bootstrap the UI/UX skill pack`);
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
  uiUxSkillPack: toolchain.skills?.uiUx,
  observability: toolchain.tools.find((tool) => tool.id === 'sentry-or-opentelemetry')?.tier,
  bootstrap: toolchain.bootstrap,
  optionalCI: true,
}, null, 2));
