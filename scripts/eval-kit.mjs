#!/usr/bin/env node
/**
 * eval-kit.mjs - run deterministic kit-level evals without external services.
 * These evals measure contract behavior, not model intelligence.
 */
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { classifyCommand, redact } from './policy-check.mjs';
import { inspectProject, buildProjectState } from './project-state.mjs';
import { syncOverlays } from './sync-overlays.mjs';

const root = await mkdtemp(path.join(os.tmpdir(), 'ai-kit-eval-'));
const results = [];
async function check(name, fn) {
  try { await fn(); results.push({ name, status: 'PASS' }); }
  catch (error) { results.push({ name, status: 'FAIL', detail: error.message }); }
}
try {
  await check('policy-denies-destructive-command', () => {
    if (classifyCommand('git reset --hard HEAD').decision !== 'deny') throw new Error('destructive command was not denied');
  });
  await check('policy-requires-approval-for-deploy', () => {
    if (classifyCommand('vercel deploy --prod').decision !== 'approval_required') throw new Error('deploy was not escalated');
  });
  await check('audit-redacts-secret-shaped-input', () => {
    if (redact('DATABASE_URL=postgres://user:pass@example/db').includes('pass@example')) throw new Error('secret remained');
  });
  await check('state-keeps-secret-out', async () => {
    const target = path.join(root, 'secret-app');
    await mkdir(target, { recursive: true });
    await writeFile(path.join(target, '.env'), 'TOKEN=SECRET_DO_NOT_STORE\n');
    await writeFile(path.join(target, 'private.csv'), 'customer,token\nsecret,SECRET_DO_NOT_STORE\n');
    const inspection = await inspectProject(target);
    const state = buildProjectState(inspection);
    if (JSON.stringify(state).includes('SECRET_DO_NOT_STORE')) throw new Error('secret-shaped value leaked');
    if (JSON.stringify(state).includes('customer,token')) throw new Error('data content leaked into state');
  });
  await check('overlay-detection', async () => {
    const target = path.join(root, 'overlay-app');
    await mkdir(path.join(target, '.ai-kit', 'overlays', 'business-rules-example'), { recursive: true });
    await writeFile(path.join(target, '.ai-kit', 'overlays', 'business-rules-example', 'OVERLAY.md'), '---\nname: business-rules-example\n---\nRules\n');
    const inspection = await inspectProject(target);
    if (!inspection.availableCapabilities.includes('overlay:business-rules-example')) throw new Error('overlay capability was not detected');
    const state = buildProjectState(inspection);
    if (JSON.stringify(state).includes('SECRET')) throw new Error('overlay detection included secret values');
  });
  await check('overlay-refuses-secret-file', async () => {
    const source = path.join(root, 'overlay-source');
    const overlay = path.join(source, 'business-rules-example');
    const target = path.join(root, 'overlay-target');
    await mkdir(overlay, { recursive: true });
    await writeFile(path.join(overlay, 'OVERLAY.md'), '---\nname: business-rules-example\n---\nRules\n');
    await writeFile(path.join(overlay, '.env.production'), 'TOKEN=secret\n');
    let refused = false;
    try { await syncOverlays({ source, target }); } catch (error) { refused = /Refusing secret-like overlay file/.test(error.message); }
    if (!refused) throw new Error('secret-like overlay file was not refused');
    try { await access(path.join(target, '.ai-kit', 'overlays')); throw new Error('partial overlay copy was created'); }
    catch (error) { if (error.message === 'partial overlay copy was created') throw error; }
  });
  const failed = results.filter((result) => result.status === 'FAIL');
  console.log(JSON.stringify({ ok: failed.length === 0, suite: 'kit-contract', results }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  await rm(root, { recursive: true, force: true });
}
