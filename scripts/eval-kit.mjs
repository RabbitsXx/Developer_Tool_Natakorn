#!/usr/bin/env node
/**
 * eval-kit.mjs - run deterministic kit-level evals without external services.
 * These evals measure contract behavior, not model intelligence.
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { classifyCommand, redact } from './policy-check.mjs';
import { inspectProject, buildProjectState } from './project-state.mjs';

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
    const target = path.join(root, 'app');
    await writeFile(path.join(root, 'marker'), '');
    const inspection = await inspectProject(target);
    const state = buildProjectState(inspection);
    if (JSON.stringify(state).match(/SECRET|postgres:\/\//)) throw new Error('secret-shaped value leaked');
  });
  const failed = results.filter((result) => result.status === 'FAIL');
  console.log(JSON.stringify({ ok: failed.length === 0, suite: 'kit-contract', results }, null, 2));
  if (failed.length) process.exitCode = 1;
} finally {
  await rm(root, { recursive: true, force: true });
}
