import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildProjectState, inspectProject } from './project-state.mjs';
import { installProject, installationStatus, KIT_ROOT } from './kit-lifecycle.mjs';
import { diagnoseProject } from './doctor.mjs';
import { redact } from './policy-check.mjs';

const HELP = `Developer Tool Natakorn
Usage: node bin/natakorn.mjs <command> [options]

  init      Add missing instructions, skills, helpers, and installation hashes
  update    Update only unchanged files owned by the kit
  inspect   Read current stack, profiles, decisions, and architecture drift
  status    Check installed file hashes (read-only)
  doctor    Probe local prerequisites without installing tools
  sources   Show reviewed open-source references and adopted patterns
  verify    Run the kit's complete local verification

Options:
  --target <directory>       Existing project path; default: current directory
  --agent <names>            claude,codex,copilot,gemini or all (init/update)
  --with <starters>          playwright,accessibility,knip,lefthook,ci
  --dry-run                 Plan init/update without writing anything
  --accept-drift            Accept inspected architecture changes (init/update)
  --strict                  Require recommended prerequisites (doctor)
  --json                    Machine-readable output (also the default)
  --help                    Show usage
  --version                 Show kit version

Installed projects: node .ai-kit/bin/cli.mjs inspect|status|doctor|sources
Exit codes: 0 success, 1 failed check/blocked operation, 2 invalid usage.
`;
const COMMANDS = {
  init: ['target', 'agent', 'with', 'dry-run', 'accept-drift', 'json'],
  update: ['target', 'agent', 'with', 'dry-run', 'accept-drift', 'json'],
  inspect: ['target', 'json'], status: ['target', 'json'], doctor: ['target', 'strict', 'json'], sources: ['json'], verify: ['json'],
};

export function parseArgs(argv) {
  if (!argv.length || argv.includes('--help') || argv[0] === 'help') return { help: true };
  if (argv.length === 1 && argv[0] === '--version') return { version: true };
  const [command, ...flags] = argv;
  if (!Object.hasOwn(COMMANDS, command)) throw new Error(`Unknown command: ${command}`);
  const options = { command, target: '.' };
  const seen = new Set();
  for (let index = 0; index < flags.length; index += 1) {
    const flag = flags[index];
    if (!flag.startsWith('--')) throw new Error(`Unexpected argument: ${flag}`);
    const separator = flag.indexOf('=');
    const key = flag.slice(2, separator === -1 ? undefined : separator);
    if (!COMMANDS[command].includes(key) || seen.has(key)) throw new Error(`Invalid or duplicate option for ${command}: --${key}`);
    seen.add(key);
    if (['target', 'agent', 'with'].includes(key)) {
      const value = separator === -1 ? flags[++index] : flag.slice(separator + 1);
      if (!value || value.startsWith('--')) throw new Error(`--${key} requires a value`);
      options[key] = value;
    } else {
      if (separator !== -1) throw new Error(`--${key} does not take a value`);
      options[key] = true;
    }
  }
  options.target = path.resolve(options.target);
  return options;
}

export async function main(argv = process.argv.slice(2)) {
  let args;
  try { args = parseArgs(argv); }
  catch (error) { console.error(JSON.stringify({ ok: false, error: redact(error.message), hint: 'Use --help for valid commands and options' })); process.exitCode = 2; return; }
  if (args.help) { console.log(HELP); return; }
  try {
    if (args.version) { const manifest = JSON.parse(await readFile(path.join(KIT_ROOT, 'toolchain.json'), 'utf8')); console.log(manifest.version); return; }
    let result;
    if (['init', 'update'].includes(args.command)) {
      const agents = args.agent === undefined ? undefined : args.agent === 'all' ? ['claude', 'codex', 'copilot', 'gemini'] : [...new Set(args.agent.split(','))];
      result = await installProject({ target: args.target, update: args.command === 'update', dryRun: Boolean(args['dry-run']), agents, optional: args.with?.split(','), acceptDrift: Boolean(args['accept-drift']) });
    } else if (args.command === 'inspect') {
      const inspection = await inspectProject(args.target);
      result = { ok: !inspection.driftDetected && !inspection.detected.packageManager.conflicts.length, target: args.target, mode: inspection.mode, state: buildProjectState(inspection), driftChanges: inspection.driftChanges, stateWritten: false };
    } else if (args.command === 'doctor') result = await diagnoseProject(args.target, { strict: Boolean(args.strict) });
    else if (args.command === 'status') result = await installationStatus(args.target);
    else if (args.command === 'sources') result = { ok: true, ...JSON.parse(await readFile(path.join(KIT_ROOT, 'sources.json'), 'utf8')) };
    else if (args.command === 'verify') {
      const runner = path.join(KIT_ROOT, 'scripts/verify-kit.mjs');
      const child = spawnSync(process.execPath, [runner], { cwd: KIT_ROOT, stdio: 'inherit', windowsHide: true });
      process.exitCode = child.status ?? 1;
      return;
    }
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: redact(error.message) }, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
