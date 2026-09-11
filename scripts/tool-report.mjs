#!/usr/bin/env node
/**
 * tool-report.mjs - probes every tool declared in toolchain.json and writes a report.
 *
 * Terminal output is deliberately compact (one line per tool + summary + report paths) so a run
 * costs tens of tokens instead of thousands. Full detail lives in tool-report.json, the Markdown
 * table is paste-ready for the README, and the HTML page is a human-facing summary that never
 * needs to enter an agent's context.
 *
 * Usage:
 *   node scripts/tool-report.mjs [--cwd <dir>] [--out <dir>] [--timeout <ms>]
 *                                [--tool <id>]... [--json] [--quiet] [--allow-install]
 *
 * Probing is offline by default: `npx <pkg>` is rewritten to `npx --no-install <pkg>` so a report
 * never silently downloads a package. Pass --allow-install to probe with network instead.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(path.join(kitRoot, 'toolchain.json'), 'utf8'));

const STATUS_LABEL = {
  ok: 'ยืนยันแล้ว',
  missing: 'ไม่พบบนเครื่องนี้',
  error: 'รันแล้วล้มเหลว',
  timeout: 'ค้างเกินเวลา (timeout)',
  'not-applicable': 'ตรวจอัตโนมัติไม่ได้',
};
const STATUS_BADGE = { ok: 'OK', missing: '--', error: '!!', timeout: 'TT', 'not-applicable': 'NA' };
const MISSING_SIGNALS = [
  /not found/i,
  /command not found/i,
  /is not recognized/i,
  /could not determine executable/i,
  /no such file/i,
  /cannot find module/i,
  /ENOENT/i,
  /npx canceled due to missing packages/i,
  /missing packages and no YES option/i,
];
const VERSION_RE = /(\d+\.\d+(?:[.\-+][\w.\-+]+)?)/;

function parseArgs(argv) {
  const args = {
    cwd: kitRoot,
    out: path.join(kitRoot, '.artifacts', 'tool-report'),
    timeout: 8000,
    tools: [],
    json: false,
    quiet: false,
    allowInstall: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--cwd') args.cwd = path.resolve(kitRoot, argv[++index]);
    else if (flag === '--out') args.out = path.resolve(kitRoot, argv[++index]);
    else if (flag === '--timeout') args.timeout = Number(argv[++index]);
    else if (flag === '--tool') args.tools.push(argv[++index]);
    else if (flag === '--json') args.json = true;
    else if (flag === '--quiet') args.quiet = true;
    else if (flag === '--allow-install') args.allowInstall = true;
    else throw new Error(`unknown flag: ${flag}`);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const offline = !args.allowInstall;

function run(command, timeoutMs) {
  const started = Date.now();
  const result = spawnSync(command, {
    cwd: args.cwd,
    shell: true,
    timeout: timeoutMs,
    encoding: 'utf8',
    windowsHide: true,
  });
  return {
    exitCode: result.status,
    durationMs: Date.now() - started,
    timedOut: result.error?.code === 'ETIMEDOUT' || result.signal === 'SIGTERM',
    stdout: String(result.stdout ?? '').trim(),
    stderr: String(result.stderr ?? '').trim(),
  };
}

function binaryExists(binary) {
  const probe = process.platform === 'win32' ? `where ${binary}` : `command -v ${binary}`;
  return spawnSync(probe, { shell: true, stdio: 'ignore' }).status === 0;
}

function offlineCommand(command) {
  return offline && /^npx\s/.test(command) ? command.replace(/^npx\s+/, 'npx --no-install ') : command;
}

function versionFrom(text) {
  const firstLine = text.split('\n').map((line) => line.trim()).find(Boolean) ?? '';
  const match = firstLine.match(VERSION_RE) ?? text.match(VERSION_RE);
  return match ? match[1] : null;
}

function probePlan(tool) {
  if (tool.probeKind === 'remote' || tool.probeKind === 'project-specific') {
    return { kind: 'manual', note: tool.probeNote ?? null };
  }
  if (Array.isArray(tool.probeAlternatives)) {
    return { kind: 'alternatives', commands: tool.probeAlternatives.map(offlineCommand), note: tool.probeNote ?? null };
  }
  const command = tool.probe ?? tool.verify;
  if (!command || !/^[a-z0-9._-]+(\s|$)/i.test(command)) {
    return { kind: 'manual', note: tool.probeNote ?? null };
  }
  return { kind: 'command', commands: [offlineCommand(command)], note: tool.probeNote ?? null };
}

function attempt(tool, command) {
  const result = run(command, args.timeout);
  const base = command.split(/\s+/)[0];
  const combined = `${result.stdout}\n${result.stderr}`;
  const toolText = [result.stdout, result.stderr].map((part) => part.split('\n')[0]).find(Boolean) ?? '';

  if (result.timedOut) {
    return { status: 'timeout', command, exitCode: result.exitCode, durationMs: result.durationMs, version: null, detail: toolText, raw: combined };
  }
  if (result.exitCode === 0) {
    return { status: 'ok', command, exitCode: 0, durationMs: result.durationMs, version: versionFrom(combined), detail: toolText, raw: combined };
  }
  const looksMissing =
    tool.probeKind === 'dependency' || MISSING_SIGNALS.some((signal) => signal.test(combined)) || !binaryExists(base);
  return {
    status: looksMissing ? 'missing' : 'error',
    command,
    exitCode: result.exitCode,
    durationMs: result.durationMs,
    version: null,
    detail: toolText || `exit ${result.exitCode}`,
    raw: combined,
  };
}

function probe(tool) {
  const plan = probePlan(tool);
  if (plan.kind === 'manual') {
    return { id: tool.id, tier: tool.tier, status: 'not-applicable', command: null, version: null, exitCode: null, durationMs: 0, detail: plan.note, raw: '' };
  }
  let last = null;
  for (const command of plan.commands) {
    const result = attempt(tool, command);
    if (result.status === 'ok') return { id: tool.id, tier: tool.tier, ...result };
    last = result;
  }
  return { id: tool.id, tier: tool.tier, ...last };
}

const selected = args.tools.length ? manifest.tools.filter((tool) => args.tools.includes(tool.id)) : manifest.tools;
const startedAt = Date.now();
const results = selected.map(probe);
const elapsedMs = Date.now() - startedAt;

const counts = results.reduce((accumulator, result) => {
  accumulator[result.status] = (accumulator[result.status] ?? 0) + 1;
  return accumulator;
}, {});

const relative = (target) => path.relative(kitRoot, target).split(path.sep).join('/') || '.';
const report = {
  generatedAt: new Date().toISOString(),
  host: {
    platform: `${process.platform} ${os.release()}`,
    arch: process.arch,
    node: process.version,
    shell: offline ? 'offline probing (npx --no-install)' : 'network allowed (npx may download)',
  },
  probeCwd: relative(args.cwd),
  probeTimeoutMs: args.timeout,
  elapsedMs,
  counts,
  tools: results.map((result) => ({ ...result, raw: result.raw.length > 4000 ? `${result.raw.slice(0, 4000)}\n[truncated]` : result.raw })),
};

mkdirSync(args.out, { recursive: true });
const jsonPath = path.join(args.out, 'tool-report.json');
const mdPath = path.join(args.out, 'tool-report.md');
const htmlPath = path.join(args.out, 'tool-report.html');
writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(mdPath, renderMarkdown(report), 'utf8');
writeFileSync(htmlPath, renderHtml(report), 'utf8');

function renderMarkdown(data) {
  const box = (value) => (value ? `\`${value}\`` : '—');
  const verified = data.tools.filter((tool) => tool.status === 'ok');
  const unverified = data.tools.filter((tool) => tool.status !== 'ok');
  const lines = [
    `<!-- generated by scripts/tool-report.mjs at ${data.generatedAt} on ${data.host.platform} (probe cwd: ${data.probeCwd}) -->`,
    '',
    `### เครื่องมือที่ยืนยันแล้ว (${verified.length})`,
    '',
    '| เครื่องมือ | Tier | คำสั่งที่รัน | ผลที่ได้จริง |',
    '|---|---|---|---|',
    ...verified.map((tool) => `| \`${tool.id}\` | ${tool.tier} | \`${tool.command}\` | ${box(tool.version ?? tool.detail)} |`),
    '',
    `### ยังไม่ยืนยันบนเครื่องนี้ (${unverified.length})`,
    '',
    '| เครื่องมือ | Tier | สถานะ | เหตุผล / สิ่งที่ต้องมี |',
    '|---|---|---|---|',
    ...unverified.map((tool) => `| \`${tool.id}\` | ${tool.tier} | ${STATUS_LABEL[tool.status]} | ${String(tool.detail ?? '').replace(/\|/g, '\\|').slice(0, 90) || '—'} |`),
    '',
  ];
  return lines.join('\n');
}

function renderHtml(data) {
  const badge = (status) => `<span class="badge ${status}">${STATUS_BADGE[status] ?? '??'} ${status}</span>`;
  const rows = data.tools
    .map(
      (tool) => `    <tr>
      <td class="id">${tool.id}</td>
      <td class="tier">${tool.tier}</td>
      <td>${badge(tool.status)}</td>
      <td class="version">${tool.version ?? ''}</td>
      <td class="cmd"><code>${tool.command ?? '—'}</code></td>
      <td class="ms">${tool.durationMs}ms</td>
    </tr>
    <tr class="detail">
      <td colspan="6"><details><summary>รายละเอียด / output ที่ได้</summary><pre>${(tool.raw || tool.detail || 'no output recorded').replace(/[<>&]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[char]))}</pre></details></td>
    </tr>`,
    )
    .join('\n');

  const cards = ['ok', 'missing', 'error', 'timeout', 'not-applicable']
    .filter((status) => data.counts[status])
    .map((status) => `<div class="card ${status}"><strong>${data.counts[status]}</strong><span>${STATUS_LABEL[status]}</span></div>`)
    .join('\n      ');

  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Tool report - kit toolchain</title>
<style>
  :root { color-scheme: light dark; --line: #d9dee5; --muted: #5b6673; --ok: #0f8a4d; --warn: #b26a00; --bad: #c0392b; --na: #6b7280; }
  * { box-sizing: border-box; }
  body { margin: 0 auto; max-width: 1100px; padding: 28px 20px 60px; font: 15px/1.6 ui-sans-serif, system-ui, "Segoe UI", sans-serif; }
  h1 { font-size: 22px; margin: 0 0 6px; }
  .meta { color: var(--muted); font-size: 13px; margin-bottom: 20px; }
  .meta code { background: rgba(127,127,127,.14); padding: 1px 5px; border-radius: 4px; }
  .cards { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
  .card { border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; min-width: 130px; }
  .card strong { display: block; font-size: 22px; }
  .card span { color: var(--muted); font-size: 12px; }
  .card.ok strong { color: var(--ok); } .card.error strong, .card.timeout strong { color: var(--bad); }
  .card.missing strong { color: var(--warn); } .card.not-applicable strong { color: var(--na); }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
  tr.detail td { border-bottom: 1px solid var(--line); padding-top: 0; }
  td.id { font-weight: 600; } td.version { font-variant-numeric: tabular-nums; } td.ms { color: var(--muted); }
  td.tier { color: var(--muted); font-size: 12px; }
  code { font: 12.5px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
  .badge { display: inline-block; font-size: 11.5px; padding: 2px 8px; border-radius: 999px; border: 1px solid currentColor; }
  .badge.ok { color: var(--ok); } .badge.missing { color: var(--warn); } .badge.error, .badge.timeout { color: var(--bad); } .badge.not-applicable { color: var(--na); }
  details summary { cursor: pointer; color: var(--muted); font-size: 12.5px; }
  pre { margin: 8px 0 14px; padding: 12px; border-radius: 8px; background: rgba(127,127,127,.12); overflow: auto; max-height: 320px; font-size: 12.5px; }
</style>
</head>
<body>
  <h1>Tool report</h1>
  <p class="meta">
    ${data.tools.length} tools probed in ${(data.elapsedMs / 1000).toFixed(1)}s ·
    generated <code>${data.generatedAt}</code> ·
    host <code>${data.host.platform} ${data.host.arch}</code> ·
    node <code>${data.host.node}</code> ·
    probe cwd <code>${data.probeCwd}</code> ·
    timeout <code>${data.probeTimeoutMs}ms</code> ·
    ${data.host.shell}
  </p>
  <div class="cards">
      ${cards}
  </div>
  <table>
    <thead><tr><th>Tool</th><th>Tier</th><th>Status</th><th>Version</th><th>Command</th><th>Time</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>
  <p class="meta">Status หมายถึงผลบนเครื่องที่รันเท่านั้น — "ไม่พบบนเครื่องนี้" ไม่ได้แปลว่าเครื่องมือไม่ดี และ "ตรวจอัตโนมัติไม่ได้" คือต้องมี credential/network หรือเป็นตัวเลือกของโปรเจกต์</p>
</body>
</html>
`;
}

if (args.json) {
  console.log(JSON.stringify({ counts, elapsedMs, reports: { json: relative(jsonPath), md: relative(mdPath), html: relative(htmlPath) } }));
} else if (!args.quiet) {
  const width = Math.max(...results.map((result) => result.id.length));
  console.log(`tool-report · ${results.length} tools · probe cwd: ${relative(args.cwd)} · ${report.host.shell}`);
  for (const result of results) {
    const badge = `[${STATUS_BADGE[result.status]}]`;
    const value = result.status === 'ok' ? (result.version ?? 'ok') : result.status === 'missing' ? 'not found' : result.status === 'not-applicable' ? 'manual / credentialed' : String(result.detail).split('\n')[0].slice(0, 48);
    console.log(`${badge.padEnd(5)} ${result.id.padEnd(width)} ${value.padEnd(34)} ${result.durationMs}ms`);
  }
  const summary = Object.entries(counts).map(([status, count]) => `${status} ${count}`).join(' · ');
  console.log(`summary: ${summary} (${(elapsedMs / 1000).toFixed(1)}s)`);
  console.log(`reports: ${relative(jsonPath)} · ${relative(mdPath)} · ${relative(htmlPath)}`);
}

process.exit(counts.error || counts.timeout ? 1 : 0);
