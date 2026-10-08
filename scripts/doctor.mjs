import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { inspectProject } from './project-state.mjs';

// Fixed probes only. No npx, downloads, login attempts, or project script execution.
export function probeTool(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 5000, windowsHide: true, shell: false });
  return { available: !result.error && result.status === 0, version: result.status === 0 ? (result.stdout || result.stderr).trim().split(/\r?\n/)[0].slice(0,160) : null };
}

export async function diagnoseProject(target, { strict = false } = {}) {
  const inspection = await inspectProject(target);
  const checks = [{ id: 'node', tier: 'required', available: Number(process.versions.node.split('.')[0]) >= 22, version: process.versions.node }];
  for (const [id, tier, command, args] of [
    ['git', 'required', 'git', ['--version']], ['rtk', 'recommended', 'rtk', ['--version']],
    ['gh', 'optional', 'gh', ['--version']], ['python', 'optional', 'python', ['--version']],
    ['docker', 'optional', 'docker', ['--version']], ['podman', 'optional', 'podman', ['--version']],
  ]) checks.push({ id, tier, ...probeTool(command, args, target) });
  // Detect npm/pnpm without executing .cmd files through a shell on Windows.
  const require = createRequire(path.join(path.resolve(target), 'package.json'));
  const selectedManager = inspection.detected.packageManager.selected;
  for (const manager of ['npm', 'pnpm', 'yarn', 'bun']) {
    const probe = process.platform === 'win32' && manager !== 'bun'
      ? probeTool('cmd.exe', ['/d', '/c', `${manager} --version`], target)
      : probeTool(manager, ['--version'], target);
    checks.push({ id: manager, tier: manager === selectedManager ? 'required' : 'optional', ...probe });
  }
  for (const name of ['@playwright/test', '@axe-core/playwright', 'knip', 'lefthook']) {
    let available = false;
    try { require.resolve(name); available = true; } catch {}
    checks.push({ id: name, tier: 'optional', available, version: null });
  }
  const requiredMissing = checks.filter((check) => check.tier === 'required' && !check.available).map((check) => check.id);
  const recommendedMissing = checks.filter((check) => check.tier === 'recommended' && !check.available).map((check) => check.id);
  return {
    ok: !requiredMissing.length && (!strict || !recommendedMissing.length) && !inspection.driftDetected && !inspection.detected.packageManager.conflicts.length,
    target: path.resolve(target), strict, checks, requiredMissing, recommendedMissing,
    project: { mode: inspection.mode, profile: inspection.profile, detected: inspection.detected, driftDetected: inspection.driftDetected, pendingDecisions: inspection.pendingDecisions },
    hint: 'Optional tools are informative. Only Node, Git, and the selected package manager are required. No dependencies are downloaded.',
  };
}
