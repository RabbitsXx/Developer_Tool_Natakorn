#!/usr/bin/env node
/**
 * run-safe.mjs - policy-gated command runner. It executes only allowlisted or explicitly approved commands.
 * Prefer a project's native process runner for ordinary commands; use this for mutating operations.
 */
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyCommand, redact, record } from './policy-check.mjs';

function parseArgs(argv) {
  const args = { target: '.', command: null, approved: false, actor: 'agent', reason: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--target') args.target = argv[++i] ?? '.';
    else if (flag.startsWith('--target=')) args.target = flag.slice(9);
    else if (flag === '--command') args.command = argv[++i] ?? '';
    else if (flag.startsWith('--command=')) args.command = flag.slice(10);
    else if (flag === '--approved') args.approved = true;
    else if (flag === '--actor') args.actor = argv[++i] ?? 'agent';
    else if (flag === '--reason') args.reason = argv[++i] ?? '';
    else throw new Error(`Unknown argument: ${flag}`);
  }
  if (!args.command) throw new Error('Usage: node scripts/run-safe.mjs --command "..." [--approved] [--reason "..."]');
  return args;
}

async function loadPolicy(target) {
  try {
    return JSON.parse(await readFile(path.join(path.resolve(target), '.ai-kit', 'policy.json'), 'utf8'));
  } catch {
    return { mode: 'deny-first', auditLog: '.ai-kit/audit/events.jsonl' };
  }
}

const args = parseArgs(process.argv.slice(2));
const policy = await loadPolicy(args.target);
const classification = classifyCommand(args.command, policy);
const effective = classification.decision === 'approval_required' && args.approved ? 'allow' : classification.decision;
const event = {
  timestamp: new Date().toISOString(),
  type: 'safe-command-execution',
  actor: redact(args.actor),
  command: redact(args.command),
  reason: redact(args.reason),
  decision: effective,
  policyDecision: classification.decision,
  matchedRule: classification.matched,
  approvalRecorded: classification.decision === 'approval_required' && args.approved,
};
await record(args.target, event, policy);
if (effective !== 'allow') {
  console.log(JSON.stringify({ ok: false, ...event }, null, 2));
  process.exitCode = effective === 'deny' ? 1 : 2;
} else {
  const result = spawnSync(args.command, { cwd: path.resolve(args.target), shell: true, stdio: 'inherit', windowsHide: true });
  console.log(JSON.stringify({ ok: result.status === 0, ...event, exitCode: result.status }, null, 2));
  process.exitCode = result.status ?? 1;
}
