import { createHash } from 'node:crypto';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STATE_SCHEMA_VERSION = 1;
const KIT_VERSION = 4;
const KIT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL_ENTRY = 'SKILL.md';
const SKILL_PACKS = await loadSkillPacks();

// Server-side dependencies that indicate the project exposes an HTTP API of its own.
const HTTP_SERVER_DEPS = [
  'express', 'fastify', 'koa', 'hono', '@hono/node-server', '@nestjs/core', '@hapi/hapi', 'restify',
  '@apollo/server', 'apollo-server', 'graphql', '@trpc/server', 'elysia', 'polka', 'tinyhttp', 'h3', 'nitro',
];
const PYTHON_API_RE = /(fastapi|flask|django|starlette|litestar|falcon|sanic|tornado|bottle|aiohttp)/i;

async function loadSkillPacks() {
  const manifest = await readJson(path.join(KIT_ROOT, 'toolchain.json'));
  const packs = manifest?.skills?.packs;
  return Array.isArray(packs) ? packs : [];
}

function skillEntryMarker(pack) {
  return `${pack.bootstrapPath}/${pack.entry ?? SKILL_ENTRY}`;
}

async function detectHttpApi(target, deps, markers) {
  if (hasAny(deps, HTTP_SERVER_DEPS)) return true;
  if (markers.has('pyproject.toml') || markers.has('requirements.txt') || markers.has('Pipfile')) {
    const text = [
      await readText(path.join(target, 'pyproject.toml')),
      await readText(path.join(target, 'requirements.txt')),
      await readText(path.join(target, 'Pipfile')),
    ].join('\n');
    if (PYTHON_API_RE.test(text)) return true;
  }
  for (const relative of ['src/app/api', 'app/api', 'src/pages/api', 'pages/api', 'api', 'routes']) {
    if (await exists(path.join(target, relative))) return true;
  }
  return false;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  try {
    const text = (await readFile(file, 'utf8')).replace(/^\uFEFF/, '');
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function readText(file) {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return '';
  }
}

function dependencyMap(pkg) {
  return {
    ...(pkg?.dependencies ?? {}),
    ...(pkg?.devDependencies ?? {}),
    ...(pkg?.peerDependencies ?? {}),
  };
}

function hasAny(deps, names) {
  return names.some((name) => Object.prototype.hasOwnProperty.call(deps, name));
}

function detectFramework(deps, markers) {
  if ('next' in deps) return 'nextjs';
  if ('nuxt' in deps) return 'nuxt';
  if ('astro' in deps) return 'astro';
  if (hasAny(deps, ['@remix-run/react', '@remix-run/node'])) return 'remix';
  if ('vite' in deps) return 'vite';
  if ('react' in deps) return 'react';
  if (markers.has('pyproject.toml') || markers.has('requirements.txt')) return 'python';
  if (markers.has('Cargo.toml')) return 'rust';
  if (markers.has('go.mod')) return 'go';
  return null;
}

function detectRuntime(markers, pkg) {
  const runtimes = [];
  if (pkg) runtimes.push('node');
  if (markers.has('pyproject.toml') || markers.has('requirements.txt')) runtimes.push('python');
  if (markers.has('Cargo.toml')) runtimes.push('rust');
  if (markers.has('go.mod')) runtimes.push('go');
  return runtimes;
}

function detectPackageManager(markers, pkg) {
  const locks = [
    ['pnpm', 'pnpm-lock.yaml'],
    ['npm', 'package-lock.json'],
    ['yarn', 'yarn.lock'],
    ['bun', 'bun.lock'],
    ['bun', 'bun.lockb'],
  ].filter(([, file]) => markers.has(file));
  const unique = [...new Set(locks.map(([name]) => name))];
  if (unique.length === 1) return { selected: unique[0], conflicts: [] };
  if (unique.length > 1) return { selected: null, conflicts: unique };
  const declared = typeof pkg?.packageManager === 'string' ? pkg.packageManager.split('@')[0] : null;
  return { selected: declared || null, conflicts: [] };
}

function detectDatabase(deps, envExample) {
  const providers = [];
  const accessLayers = [];
  if (hasAny(deps, ['@neondatabase/serverless', '@neondatabase/api-client'])) providers.push('neon');
  if (hasAny(deps, ['@supabase/supabase-js', '@supabase/ssr', 'supabase'])) providers.push('supabase');
  if (/\bNEON_[A-Z0-9_]+\b/.test(envExample)) providers.push('neon');
  if (/\bSUPABASE_[A-Z0-9_]+\b/.test(envExample)) providers.push('supabase');
  if (hasAny(deps, ['pg', 'postgres', 'postgresql'])) providers.push('postgresql');
  if (/\bDATABASE_URL\b/.test(envExample) && providers.length === 0) providers.push('postgresql-unknown-provider');

  if (hasAny(deps, ['drizzle-orm', 'drizzle-kit'])) accessLayers.push('drizzle');
  if (hasAny(deps, ['prisma', '@prisma/client'])) accessLayers.push('prisma');
  if ('pg' in deps) accessLayers.push('pg');
  if ('postgres' in deps) accessLayers.push('postgres');
  if (hasAny(deps, ['@supabase/supabase-js', '@supabase/ssr'])) accessLayers.push('supabase-sdk');
  if ('@neondatabase/serverless' in deps) accessLayers.push('neon-sdk');

  return {
    providers: [...new Set(providers)],
    accessLayers: [...new Set(accessLayers)],
  };
}

function detectCapabilities(deps, markers, pkg) {
  const browserE2E = '@playwright/test' in deps ? 'playwright' : ('cypress' in deps ? 'cypress' : null);
  const skillPacks = SKILL_PACKS.filter((pack) => markers.has(skillEntryMarker(pack))).map((pack) => `${pack.id}-skill-pack`);
  const accessibility = '@axe-core/playwright' in deps ? 'axe-playwright' : null;
  const codeHealth = 'knip' in deps || markers.has('knip.json') || markers.has('knip.jsonc') || markers.has('knip.ts') ? 'knip' : null;
  const gitHooks = 'lefthook' in deps || markers.has('lefthook.yml') || markers.has('lefthook.yaml') ? 'lefthook' : null;
  const backgroundJobs = 'inngest' in deps ? 'inngest' : null;
  const observability = hasAny(deps, ['@sentry/nextjs', '@sentry/node', '@opentelemetry/api', '@opentelemetry/sdk-node'])
    ? (hasAny(deps, ['@sentry/nextjs', '@sentry/node']) ? 'sentry' : 'opentelemetry')
    : null;
  const deployment = markers.has('vercel.json') || markers.has('.vercel/project.json') ? 'vercel' : null;
  const remoteCi = markers.has('.github/workflows') ? 'github-actions-or-other-workflow' : null;
  const qualityScripts = {};
  for (const name of ['lint', 'typecheck', 'test', 'test:e2e', 'build', 'format', 'knip']) {
    if (pkg?.scripts?.[name]) qualityScripts[name] = pkg.scripts[name];
  }
  return { skillPacks, browserE2E, accessibility, codeHealth, gitHooks, backgroundJobs, observability, deployment, remoteCi, qualityScripts };
}

function stableArchitecture(detected) {
  return {
    runtime: detected.runtime,
    framework: detected.framework,
    packageManager: detected.packageManager,
    databaseProviders: detected.database.providers,
    databaseAccessLayers: detected.database.accessLayers,
    browserE2E: detected.capabilities.browserE2E,
    accessibility: detected.capabilities.accessibility,
    codeHealth: detected.capabilities.codeHealth,
    gitHooks: detected.capabilities.gitHooks,
    backgroundJobs: detected.capabilities.backgroundJobs,
    observability: detected.capabilities.observability,
    deployment: detected.capabilities.deployment,
    qualityScriptNames: Object.keys(detected.capabilities.qualityScripts).sort(),
  };
}

function architectureFingerprint(detected) {
  return createHash('sha256').update(JSON.stringify(stableArchitecture(detected))).digest('hex');
}

export async function inspectProject(targetPath) {
  const target = path.resolve(targetPath);
  const markerNames = [
    'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb',
    'pyproject.toml', 'requirements.txt', 'Pipfile', 'poetry.lock', 'Cargo.toml', 'go.mod',
    'composer.json', 'Gemfile', 'pom.xml', 'build.gradle', 'build.gradle.kts', 'deno.json',
    'next.config.js', 'next.config.mjs', 'next.config.ts', 'vite.config.js', 'vite.config.ts',
    'astro.config.mjs', 'vercel.json', '.vercel/project.json', '.github/workflows', '.git',
    ...SKILL_PACKS.map(skillEntryMarker), 'knip.json', 'knip.jsonc', 'knip.ts', 'lefthook.yml', 'lefthook.yaml',
    'src', 'app', 'pages', 'public', 'index.html',
  ];
  const markers = new Set();
  for (const name of markerNames) if (await exists(path.join(target, name))) markers.add(name);

  const pkg = markers.has('package.json') ? await readJson(path.join(target, 'package.json')) : null;
  const deps = dependencyMap(pkg);
  const envExample = await readText(path.join(target, '.env.example'));
  const previousState = await readJson(path.join(target, '.ai-kit', 'project.json'));
  const topLevelNames = new Set(await readdir(target).catch(() => []));
  const kitOnlyNames = new Set([
    'START_PROMPT.md', 'AGENTS.md', 'PROJECT_CONTEXT.md', '.env.example', '.gitignore', '.editorconfig',
    'repomix.config.json', '.repomixignore', '.ai-kit', 'docs',
  ]);
  const nonKitTopLevel = [...topLevelNames].filter((name) => !kitOnlyNames.has(name) && !name.startsWith('.DS_Store'));
  const kitOnlyMarkers = new Set(['.github/workflows', ...SKILL_PACKS.map(skillEntryMarker)]);
  const meaningfulMarkers = [...markers].filter((name) => !kitOnlyMarkers.has(name));
  const initialDetectedMode = meaningfulMarkers.length === 0 && nonKitTopLevel.length === 0 ? 'NEW_PROJECT' : 'EXISTING_PROJECT';
  const mode = previousState?.kit?.configured ? 'RESUME_CONFIGURED_PROJECT' : initialDetectedMode;
  const packageManager = detectPackageManager(markers, pkg);
  const detected = {
    runtime: detectRuntime(markers, pkg),
    framework: detectFramework(deps, markers),
    packageManager,
    database: detectDatabase(deps, envExample),
    capabilities: detectCapabilities(deps, markers, pkg),
    markers: [...markers].sort(),
    nonKitTopLevel: nonKitTopLevel.sort(),
  };
  const fingerprint = architectureFingerprint(detected);
  const driftDetected = Boolean(previousState?.architectureFingerprint && previousState.architectureFingerprint !== fingerprint);

  const availableCapabilities = [
    detected.framework,
    ...detected.capabilities.skillPacks,
    detected.capabilities.browserE2E,
    detected.capabilities.accessibility,
    detected.capabilities.codeHealth,
    detected.capabilities.gitHooks,
    detected.capabilities.backgroundJobs,
    detected.capabilities.observability,
    detected.capabilities.deployment,
    ...detected.database.providers,
    ...detected.database.accessLayers,
  ].filter(Boolean);

  const potentiallyUseful = [];
  const projectTraits = {
    'web-framework': ['nextjs', 'nuxt', 'astro', 'remix', 'vite', 'react'].includes(detected.framework),
    'http-api': await detectHttpApi(target, deps, markers),
    'database': detected.database.providers.length > 0 || detected.database.accessLayers.length > 0,
  };
  for (const pack of SKILL_PACKS) {
    const capability = `${pack.id}-skill-pack`;
    if (!detected.capabilities.skillPacks.includes(capability) && (pack.recommendFor ?? []).some((tag) => projectTraits[tag])) {
      potentiallyUseful.push(capability);
    }
  }
  if (projectTraits['web-framework']) {
    if (!detected.capabilities.browserE2E) potentiallyUseful.push('playwright');
    if (detected.capabilities.browserE2E === 'playwright' && !detected.capabilities.accessibility) potentiallyUseful.push('axe-playwright');
  }
  if (pkg && !detected.capabilities.codeHealth) potentiallyUseful.push('knip');
  if (markers.has('.git') && Object.keys(detected.capabilities.qualityScripts).length > 0 && !detected.capabilities.gitHooks) potentiallyUseful.push('lefthook');
  if (detected.capabilities.deployment && !detected.capabilities.observability) potentiallyUseful.push('production-observability');
  if (detected.capabilities.deployment && !detected.capabilities.remoteCi) potentiallyUseful.push('optional-remote-ci');

  const pendingDecisions = [];
  if (initialDetectedMode === 'NEW_PROJECT') pendingDecisions.push('product_requirements_before_stack_selection');
  if (packageManager.conflicts.length) pendingDecisions.push('resolve_multiple_lockfiles_before_package_manager_changes');
  if (driftDetected) pendingDecisions.push('review_architecture_drift_before_setup_changes');

  return {
    target,
    previousState,
    mode,
    initialDetectedMode,
    detected,
    architectureFingerprint: fingerprint,
    driftDetected,
    availableCapabilities: [...new Set(availableCapabilities)],
    potentiallyUsefulCapabilities: [...new Set(potentiallyUseful)],
    pendingDecisions,
  };
}

export function buildProjectState(inspection, now = new Date()) {
  const previous = inspection.previousState;
  const architectureChanged = !previous?.architectureFingerprint || previous.architectureFingerprint !== inspection.architectureFingerprint;
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    kit: {
      name: 'Ultimate VibeCoder Ecosystem',
      version: KIT_VERSION,
      configured: true,
      configuredAt: previous?.kit?.configuredAt ?? now.toISOString(),
      stateUpdatedAt: architectureChanged ? now.toISOString() : (previous?.kit?.stateUpdatedAt ?? previous?.kit?.configuredAt ?? now.toISOString()),
    },
    project: {
      initialMode: previous?.project?.initialMode ?? inspection.initialDetectedMode,
      setupStatus: inspection.initialDetectedMode === 'NEW_PROJECT' ? 'awaiting_product_requirements' : 'ready_for_agent',
    },
    detected: inspection.detected,
    architectureFingerprint: inspection.architectureFingerprint,
    drift: {
      detected: inspection.driftDetected,
      previousFingerprint: inspection.driftDetected ? (previous?.architectureFingerprint ?? null) : null,
    },
    capabilities: {
      available: inspection.availableCapabilities,
      potentiallyUseful: inspection.potentiallyUsefulCapabilities,
      selectedByUserOrProject: previous?.capabilities?.selectedByUserOrProject ?? [],
    },
    pendingDecisions: inspection.pendingDecisions,
    safety: {
      secretValuesStored: false,
      detectorReadsDotEnvSecrets: false,
      detectorInstallsDependencies: false,
      detectorMutatesApplicationCode: false,
    },
  };
}

export async function writeProjectState(targetPath, state) {
  const dir = path.join(path.resolve(targetPath), '.ai-kit');
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, 'project.json');
  await writeFile(file, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  return file;
}
