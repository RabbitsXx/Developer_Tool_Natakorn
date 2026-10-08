#!/usr/bin/env node
/** Append compact, non-secret agent session metrics to .ai-kit/metrics/events.jsonl. */
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { assertSafePath } from './safe-paths.mjs';
import { redact } from './policy-check.mjs';

function parseArgs(argv) {
  const args = { target: '.', session: null, event: null, task: null, status: null, files: null, tokens: null, durationMs: null, note: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--target') args.target = argv[++i] ?? '.';
    else if (flag === '--session') args.session = argv[++i];
    else if (flag === '--event') args.event = argv[++i];
    else if (flag === '--task') args.task = argv[++i];
    else if (flag === '--status') args.status = argv[++i];
    else if (flag === '--files') args.files = Number(argv[++i]);
    else if (flag === '--tokens') args.tokens = Number(argv[++i]);
    else if (flag === '--duration-ms') args.durationMs = Number(argv[++i]);
    else if (flag === '--note') args.note = argv[++i] ?? '';
    else throw new Error(`Unknown argument: ${flag}`);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args.event) throw new Error('Usage: metrics.mjs --event session-start|session-end|check --session ID');
if (!['session-start', 'session-end', 'check'].includes(args.event)) throw new Error('Unknown metrics event');
for (const key of ['files', 'tokens', 'durationMs']) if (args[key] !== null && (!Number.isSafeInteger(args[key]) || args[key] < 0)) throw new Error(`${key} must be a nonnegative safe integer`);
for (const value of [args.session, args.task, args.status, args.note]) if (value && redact(value) !== value) throw new Error('Metrics cannot contain secret-like values');
const session = args.session ?? `session-${Date.now()}`;
const event = {
  timestamp: new Date().toISOString(),
  session,
  event: args.event,
  task: args.task ?? undefined,
  status: args.status ?? undefined,
  files: Number.isFinite(args.files) ? args.files : undefined,
  tokens: Number.isFinite(args.tokens) ? args.tokens : undefined,
  durationMs: Number.isFinite(args.durationMs) ? args.durationMs : undefined,
  note: String(args.note).replace(/[\r\n]/g, ' ').slice(0, 240),
};
const clean = Object.fromEntries(Object.entries(event).filter(([, value]) => value !== undefined && value !== ''));
const file = await assertSafePath(args.target, '.ai-kit/metrics/events.jsonl');
await mkdir(path.dirname(file), { recursive: true });
await appendFile(file, `${JSON.stringify(clean)}\n`, 'utf8');
console.log(JSON.stringify({ ok: true, file: path.relative(path.resolve(args.target), file), event: clean }, null, 2));
