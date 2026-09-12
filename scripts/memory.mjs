#!/usr/bin/env node
/** Record or inspect non-secret cross-session memory and handoff artifacts. */
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function parseArgs(argv) {
  const args = { target: '.', kind: null, text: null, status: 'open', owner: null, print: false };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--target') args.target = argv[++i] ?? '.';
    else if (flag === '--kind') args.kind = argv[++i] ?? null;
    else if (flag === '--text') args.text = argv[++i] ?? null;
    else if (flag === '--status') args.status = argv[++i] ?? 'open';
    else if (flag === '--owner') args.owner = argv[++i] ?? null;
    else if (flag === '--print') args.print = true;
    else throw new Error(`Unknown argument: ${flag}`);
  }
  return args;
}

function rejectSecrets(value) {
  if (/((?:token|secret|password|passwd|api[_-]?key|private[_-]?key|database_url)\s*[=:])|-----BEGIN/i.test(String(value))) {
    throw new Error('Memory cannot contain secret-like values or private keys');
  }
}

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args.target);
const memoryDir = path.join(root, '.ai-kit', 'memory');
const handoff = path.join(memoryDir, 'handoff.md');
if (args.print) {
  console.log(await readFile(handoff, 'utf8').catch(() => 'No handoff recorded.'));
} else {
  if (!args.kind || !args.text) throw new Error('Usage: memory.mjs --kind decision|lesson|handoff --text "..."');
  rejectSecrets(args.text);
  await mkdir(memoryDir, { recursive: true });
  if (args.kind === 'handoff') {
    await writeFile(handoff, `# Current handoff\n\n- Status: ${args.status}\n- Owner: ${args.owner ?? 'unassigned'}\n- Updated: ${new Date().toISOString()}\n\n${args.text}\n`, 'utf8');
  } else if (args.kind === 'decision' || args.kind === 'lesson') {
    const file = path.join(memoryDir, `${args.kind}s.jsonl`);
    await appendFile(file, `${JSON.stringify({ timestamp: new Date().toISOString(), text: args.text, status: args.status, owner: args.owner })}\n`, 'utf8');
  } else throw new Error('--kind must be decision, lesson, or handoff');
  console.log(JSON.stringify({ ok: true, kind: args.kind, target: root, memoryPath: path.relative(root, args.kind === 'handoff' ? handoff : path.join(memoryDir, `${args.kind}s.jsonl`)) }, null, 2));
}
