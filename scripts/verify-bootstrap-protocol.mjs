import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildProjectState, inspectProject, writeProjectState } from './project-state.mjs';

const root = await mkdtemp(path.join(os.tmpdir(), 'ai-project-kit-verify-'));
const result = {};

try {
  const blank = path.join(root, 'blank');
  await mkdir(path.join(blank, 'docs'), { recursive: true });
  await writeFile(path.join(blank, 'START_PROMPT.md'), 'kit prompt');
  await writeFile(path.join(blank, 'AGENTS.md'), 'kit rules');
  await writeFile(path.join(blank, 'PROJECT_CONTEXT.md'), 'kit context');
  let inspection = await inspectProject(blank);
  assert.equal(inspection.mode, 'NEW_PROJECT');
  const blankState = buildProjectState(inspection, new Date('2026-01-01T00:00:00Z'));
  assert.equal(blankState.project.setupStatus, 'awaiting_product_requirements');
  assert(blankState.pendingDecisions.includes('product_requirements_before_stack_selection'));
  await writeProjectState(blank, blankState);
  inspection = await inspectProject(blank);
  assert.equal(inspection.mode, 'RESUME_CONFIGURED_PROJECT');
  assert.equal(inspection.driftDetected, false);
  const resumedBlankState = buildProjectState(inspection, new Date('2026-02-01T00:00:00Z'));
  assert.deepEqual(resumedBlankState, blankState);
  result.newProject = 'PASS';
  result.resumeBlankProject = 'PASS';
  result.idempotentBlankState = 'PASS';

  const existing = path.join(root, 'existing');
  await mkdir(existing, { recursive: true });
  await writeFile(path.join(existing, 'package.json'), JSON.stringify({
    name: 'existing-app',
    scripts: { lint: 'eslint .', typecheck: 'tsc --noEmit', test: 'node --test', build: 'next build' },
    dependencies: { next: '^16.0.0', react: '^19.0.0', pg: '^8.0.0' },
  }, null, 2));
  await writeFile(path.join(existing, 'package-lock.json'), '{}');
  await writeFile(path.join(existing, '.env.example'), 'DATABASE_URL=\n');
  await writeFile(path.join(existing, '.env'), 'DATABASE_URL=postgres://SECRET_SHOULD_NEVER_APPEAR\n');

  inspection = await inspectProject(existing);
  assert.equal(inspection.mode, 'EXISTING_PROJECT');
  assert.equal(inspection.detected.framework, 'nextjs');
  assert.equal(inspection.detected.packageManager.selected, 'npm');
  assert(inspection.detected.database.providers.includes('postgresql'));
  assert(inspection.detected.database.accessLayers.includes('pg'));
  const existingState = buildProjectState(inspection, new Date('2026-01-01T00:00:00Z'));
  assert(!JSON.stringify(existingState).includes('SECRET_SHOULD_NEVER_APPEAR'));
  await writeProjectState(existing, existingState);

  inspection = await inspectProject(existing);
  assert.equal(inspection.mode, 'RESUME_CONFIGURED_PROJECT');
  assert.equal(inspection.driftDetected, false);
  const resumedExistingState = buildProjectState(inspection, new Date('2026-02-01T00:00:00Z'));
  assert.deepEqual(resumedExistingState, existingState);
  result.existingProject = 'PASS';
  result.resumeExistingProject = 'PASS';
  result.idempotentExistingState = 'PASS';
  result.secretIsolation = 'PASS';

  const changedPackage = JSON.parse(await (await import('node:fs/promises')).readFile(path.join(existing, 'package.json'), 'utf8'));
  changedPackage.devDependencies = {
    '@playwright/test': '^1.0.0',
    '@axe-core/playwright': '^4.0.0',
    knip: '^5.0.0',
    lefthook: '^1.0.0'
  };
  await writeFile(path.join(existing, 'package.json'), JSON.stringify(changedPackage, null, 2));
  inspection = await inspectProject(existing);
  assert.equal(inspection.mode, 'RESUME_CONFIGURED_PROJECT');
  assert.equal(inspection.driftDetected, true);
  assert.equal(inspection.detected.capabilities.browserE2E, 'playwright');
  assert.equal(inspection.detected.capabilities.accessibility, 'axe-playwright');
  assert.equal(inspection.detected.capabilities.codeHealth, 'knip');
  assert.equal(inspection.detected.capabilities.gitHooks, 'lefthook');
  assert(inspection.availableCapabilities.includes('axe-playwright'));
  assert(inspection.availableCapabilities.includes('knip'));
  assert(inspection.availableCapabilities.includes('lefthook'));
  assert(inspection.pendingDecisions.includes('review_architecture_drift_before_setup_changes'));
  result.p0QualityCapabilityDetection = 'PASS';
  result.architectureDrift = 'PASS';

  const conflict = path.join(root, 'conflict');
  await mkdir(conflict, { recursive: true });
  await writeFile(path.join(conflict, 'package.json'), JSON.stringify({ name: 'conflict-app' }));
  await writeFile(path.join(conflict, 'package-lock.json'), '{}');
  await writeFile(path.join(conflict, 'pnpm-lock.yaml'), 'lockfileVersion: 9');
  inspection = await inspectProject(conflict);
  assert.deepEqual(inspection.detected.packageManager.conflicts.sort(), ['npm', 'pnpm']);
  assert(inspection.pendingDecisions.includes('resolve_multiple_lockfiles_before_package_manager_changes'));
  result.multipleLockfileGuard = 'PASS';

  // An API-shaped project with no pack yet is told the api pack exists.
  const apiProject = path.join(root, 'api-app');
  await mkdir(apiProject, { recursive: true });
  await writeFile(path.join(apiProject, 'package.json'), JSON.stringify({
    name: 'api-app',
    scripts: { test: 'node --test' },
    dependencies: { express: '^5.0.0' },
  }, null, 2));
  await writeFile(path.join(apiProject, 'package-lock.json'), '{}');
  inspection = await inspectProject(apiProject);
  assert(inspection.potentiallyUsefulCapabilities.includes('api-skill-pack'));
  await writeProjectState(apiProject, buildProjectState(inspection, new Date('2026-01-01T00:00:00Z')));

  // Installing the pack is detected as a capability without disturbing the architecture fingerprint.
  await mkdir(path.join(apiProject, '.ai-kit', 'skills', 'api'), { recursive: true });
  await writeFile(path.join(apiProject, '.ai-kit', 'skills', 'api', 'SKILL.md'), '---\nname: api\n---\n');
  inspection = await inspectProject(apiProject);
  assert(inspection.detected.capabilities.skillPacks.includes('api-skill-pack'));
  assert(inspection.availableCapabilities.includes('api-skill-pack'));
  assert(!inspection.potentiallyUsefulCapabilities.includes('api-skill-pack'));
  assert.equal(inspection.driftDetected, false);
  result.apiPackDetection = 'PASS';
  result.skillPackKeepsFingerprintStable = 'PASS';

  // A storage-shaped project is told the data-layer pack exists, without any pack-specific code path.
  const dataProject = path.join(root, 'data-app');
  await mkdir(dataProject, { recursive: true });
  await writeFile(path.join(dataProject, 'package.json'), JSON.stringify({
    name: 'data-app',
    scripts: { test: 'node --test' },
    dependencies: { 'drizzle-orm': '^0.44.0', pg: '^8.0.0' },
  }, null, 2));
  await writeFile(path.join(dataProject, 'package-lock.json'), '{}');
  inspection = await inspectProject(dataProject);
  assert(inspection.potentiallyUsefulCapabilities.includes('data-layer-skill-pack'));
  assert(!inspection.potentiallyUsefulCapabilities.includes('api-skill-pack'));
  result.dataLayerPackRecommendation = 'PASS';

  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
} finally {
  await rm(root, { recursive: true, force: true });
}
