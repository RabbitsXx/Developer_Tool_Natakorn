import path from 'node:path';
import { inspectProject, buildProjectState, writeProjectState } from './project-state.mjs';

function parseArgs(argv) {
  const result = { target: '.', dryRun: false, acceptDrift: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') result.dryRun = true;
    else if (arg === '--accept-drift') result.acceptDrift = true;
    else if (arg === '--target') result.target = argv[++i] ?? '.';
    else if (arg.startsWith('--target=')) result.target = arg.slice('--target='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

const args = parseArgs(process.argv.slice(2));
const target = path.resolve(args.target);
const inspection = await inspectProject(target);
const acceptedInspection = args.acceptDrift && inspection.driftDetected
  ? {
      ...inspection,
      driftDetected: false,
      pendingDecisions: inspection.pendingDecisions.filter((item) => item !== 'review_architecture_drift_before_setup_changes'),
    }
  : inspection;
const state = buildProjectState(acceptedInspection);
let stateFile = path.join(target, '.ai-kit', 'project.json');
const writeBlockedByDrift = inspection.driftDetected && !args.acceptDrift;
const shouldWrite = !args.dryRun && !writeBlockedByDrift;
if (shouldWrite) stateFile = await writeProjectState(target, state);

console.log(JSON.stringify({
  ok: true,
  dryRun: args.dryRun,
  stateWritten: shouldWrite,
  writeBlockedByDrift,
  driftAccepted: Boolean(args.acceptDrift && inspection.driftDetected),
  target,
  projectMode: inspection.mode,
  initialMode: state.project.initialMode,
  setupStatus: state.project.setupStatus,
  stackDetected: {
    runtime: state.detected.runtime,
    framework: state.detected.framework,
    packageManager: state.detected.packageManager,
    database: state.detected.database,
    deployment: state.detected.capabilities.deployment,
    browserE2E: state.detected.capabilities.browserE2E,
  },
  availableCapabilities: state.capabilities.available,
  potentiallyUsefulCapabilities: state.capabilities.potentiallyUseful,
  architectureFingerprint: state.architectureFingerprint,
  driftDetected: state.drift.detected,
  pendingDecisions: state.pendingDecisions,
  stateFile: args.dryRun ? null : stateFile,
  safety: state.safety,
}, null, 2));
