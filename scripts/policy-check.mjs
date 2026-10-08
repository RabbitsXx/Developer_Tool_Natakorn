#!/usr/bin/env node
/**
 * policy-check.mjs - classify a command before an agent runs it.
 * It never executes the command. It records a redacted decision in .ai-kit/audit/events.jsonl.
 */
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { assertSafePath } from './safe-paths.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const DEFAULT_POLICY = {
  mode: 'deny-first',
  auditLog: '.ai-kit/audit/events.jsonl',
  denyPatterns: [
    'rm\\s+-rf\\s+/',
    'git\\s+reset\\s+--hard',
    'git\\s+clean\\s+-fd',
    '\\bgit\\s+push\\b.*(?:--force(?:-with-lease)?|-f)(?:\\s|$)',
    '\\b(Remove-Item|del|erase|rmdir)\\b.*(?:-Recurse|/s)\\b',
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
    '\\b(node|python|python3|ruby|perl)\\s+(?:-e|-c)\\b',
    '\\b(powershell|pwsh)\\b.*-(?:Command|EncodedCommand|c|enc)\\b',
    '\\b(bash|sh|cmd)\\s+(?:-c|/c)\\b',
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
    .replace(/((?:[\w-]*token|[\w-]*secret|password|passwd|api[_-]?key|private[_-]?key|database_url)["']?\s*[=:]\s*)(["'][^"']*["']|[^\s;&,}]+)/gi, '$1[REDACTED]')
    .replace(/(--(?:[\w-]*token|[\w-]*secret|password|passwd|api[_-]?key|private[_-]?key)\s+)(["'][^"']*["']|[^\s;&]+)/gi, '$1[REDACTED]')
    .replace(/(authorization["']?\s*[:=]\s*["']?(?:bearer|basic)\s+)[^\s"']+/gi, '$1[REDACTED]')
    .replace(/([a-z][a-z0-9+.-]*:\/\/)[^\s/@]+:[^\s/@]+@/gi, '$1[REDACTED]@')
    .replace(/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,})\b/g, '[REDACTED-TOKEN]')
    .replace(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/g, '[REDACTED-KEY]');
}

export function classifyCommand(command, policy = DEFAULT_POLICY) {
  // Account for common Git global options before matching the actual operation.
  const normalized = String(command).replace(/\s+/g, ' ').trim().replace(/\bgit\s+(?:(?:-C|-c|--git-dir|--work-tree)\s+(?:"[^"]*"|'[^']*'|\S+)\s+|--(?:git-dir|work-tree)=\S+\s+)+/gi, 'git ');
  for (const pattern of [...new Set([...DEFAULT_POLICY.denyPatterns, ...(policy.denyPatterns ?? [])])]) {
    if (new RegExp(pattern, 'i').test(normalized)) return { decision: 'deny', matched: pattern };
  }
  for (const pattern of [...new Set([...DEFAULT_POLICY.approvalPatterns, ...(policy.approvalPatterns ?? [])])]) {
    if (new RegExp(pattern, 'i').test(normalized)) return { decision: 'approval_required', matched: pattern };
  }
  return { decision: 'allow', matched: null };
}

export async function loadPolicy(target) {
  try {
    const file = await assertSafePath(target, '.ai-kit/policy.json');
    const policy = JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
    if (!policy || typeof policy !== 'object' || Array.isArray(policy)) throw new Error('Policy must be an object');
    for (const key of ['denyPatterns', 'approvalPatterns']) {
      if (policy[key] !== undefined && (!Array.isArray(policy[key]) || policy[key].some((item) => typeof item !== 'string'))) throw new Error(`Invalid policy ${key}`);
      for (const pattern of policy[key] ?? []) new RegExp(pattern, 'i');
    }
    await assertSafePath(target, policy.auditLog ?? DEFAULT_POLICY.auditLog);
    return policy;
  } catch (error) {
    if (error.code === 'ENOENT') return DEFAULT_POLICY;
    throw new Error(`Cannot load command policy: ${redact(error.message)}`);
  }
}

export async function record(target, event, policy) {
  const file = await assertSafePath(target, policy.auditLog ?? DEFAULT_POLICY.auditLog);
  await mkdir(path.dirname(file), { recursive: true });
  await appendFile(file, `${JSON.stringify(event)}\n`, 'utf8');
  return file;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const policy = await loadPolicy(args.target);
  const classification = classifyCommand(args.command, policy);
  const approved = classification.decision === 'approval_required' && args.approved;
  if (approved && !args.reason?.trim()) throw new Error('An approved command requires --reason describing the existing authorization');
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await main(); }
  catch (error) { console.error(JSON.stringify({ ok: false, error: redact(error.message) })); process.exitCode = 1; }
}
