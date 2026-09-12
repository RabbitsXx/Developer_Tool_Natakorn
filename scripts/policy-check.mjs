#!/usr/bin/env node
/**
 * policy-check.mjs - classify a command before an agent runs it.
 * It never executes the command. It records a redacted decision in .ai-kit/audit/events.jsonl.
 */
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const DEFAULT_POLICY = {
  mode: 'deny-first',
  auditLog: '.ai-kit/audit/events.jsonl',
  denyPatterns: [
    'rm\\s+-rf\\s+/',
    'git\\s+reset\\s+--hard',
    'git\\s+clean\\s+-fd',
    '(drop|truncate)\\s+(database|table|schema)',
    '(terraform|pulumi)\\s+destroy',
    '(vercel|supabase|aws|gcloud|az)\\s+.*\\b(delete|destroy|remove)\\b',
    '(curl|wget|Invoke-WebRequest)\\b.*(TOKEN|SECRET|PASSWORD|PRIVATE.KEY)',
  ],
  approvalPatterns: [
    '\\bgit\\s+push\\b',
    '\\b(docker|podman)\\s+push\\b',
    '\\b(terraform|pulumi)\\s+apply\\b',
    '\\b(vercel|supabase|aws|gcloud|az)\\s+(deploy|push|update|migrate|db)',
    '\\b(npx\\s+)?prisma\\s+migrate\\s+deploy\\b',
    '\\b(dbmate|flyway|knex)\\s+migrate\\b',
    '\\b(railway|render|netlify)\\s+deploy\\b',
  ],
};

function parseArgs(argv) {
  const args = { target: '.', command: null, actor: 'agent', reason: null, approved: false, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--target') args.target = argv[++i] ?? '.';
    else if (flag.startsWith('--target=')) args.target = flag.slice(9);
    else if (flag === '--command') args.command = argv[++i] ?? '';
    else if (flag.startsWith('--command=')) args.command = flag.slice(10);
    else if (flag === '--actor') args.actor = argv[++i] ?? 'agent';
    else if (flag === '--reason') args.reason = argv[++i] ?? null;
    else if (flag === '--approved') args.approved = true;
    else if (flag === '--dry-run') args.dryRun = true;
    else throw new Error(`Unknown argument: ${flag}`);
  }
  if (!args.command) throw new Error('Usage: node policy-check.mjs --command "..." [--approved] [--reason "..."]');
  return args;
}

export function redact(value) {
  return String(value)
    .replace(/((?:token|secret|password|passwd|api[_-]?key|private[_-]?key|database_url)\s*[=:]\s*)([^\s;&]+)/gi, '$1[REDACTED]')
    .replace(/(https?:\/\/)([^\s/@]+):([^\s/@]+)@/gi, '$1[REDACTED]@[REDACTED]@')
    .replace(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/g, '[REDACTED-KEY]');
}

export function classifyCommand(command, policy = DEFAULT_POLICY) {
  const normalized = String(command).replace(/\s+/g, ' ').trim();
  for (const pattern of policy.denyPatterns ?? []) {
    if (new RegExp(pattern, 'i').test(normalized)) return { decision: 'deny', matched: pattern };
  }
  for (const pattern of policy.approvalPatterns ?? []) {
    if (new RegExp(pattern, 'i').test(normalized)) return { decision: 'approval_required', matched: pattern };
  }
  return { decision: 'allow', matched: null };
}

async function loadPolicy(target) {
  try {
    return JSON.parse(await readFile(path.join(path.resolve(target), '.ai-kit', 'policy.json'), 'utf8'));
  } catch {
    return DEFAULT_POLICY;
  }
}

export async function record(target, event, policy) {
  const file = path.join(path.resolve(target), policy.auditLog ?? DEFAULT_POLICY.auditLog);
  await mkdir(path.dirname(file), { recursive: true });
  await appendFile(file, `${JSON.stringify(event)}\n`, 'utf8');
  return file;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const policy = await loadPolicy(args.target);
  const classification = classifyCommand(args.command, policy);
  const approved = classification.decision === 'approval_required' && args.approved;
  const effective = classification.decision === 'approval_required' && approved ? 'allow' : classification.decision;
  const event = {
    timestamp: new Date().toISOString(),
    type: 'command-policy-decision',
    actor: redact(args.actor),
    command: redact(args.command),
    reason: redact(args.reason ?? ''),
    decision: effective,
    policyDecision: classification.decision,
    matchedRule: classification.matched,
    approvalRecorded: approved,
  };
  const auditFile = args.dryRun ? null : await record(args.target, event, policy);
  console.log(JSON.stringify({ ok: effective !== 'deny', ...event, auditFile }, null, 2));
  if (effective === 'deny') process.exitCode = 1;
  else if (effective === 'approval_required') process.exitCode = 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();