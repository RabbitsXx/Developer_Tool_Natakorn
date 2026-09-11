#!/usr/bin/env node
/**
 * new-skill.mjs - scaffolds a new Agent Skills pack and registers it in toolchain.json.
 *
 * Creates skills/<id>/SKILL.md plus one reference file per --reference, registers the pack under
 * `skills.packs` with the metadata the kit requires (activation, summary, summaryTh, recommendFor),
 * and regenerates the generated pack tables. Nothing else needs editing: both bootstrap scripts, the
 * detector, and validate-kit read the manifest.
 *
 * The generated files are valid but unfinished: every place that needs real content carries a
 * `<!-- TODO -->` marker, and validate-kit reports packs that still contain them.
 *
 * Usage:
 *   node scripts/new-skill.mjs --id release \
 *     --summary "Release and rollback procedure for a deployment." \
 *     --summary-th "ขั้นตอน release และ rollback ของการ deploy" \
 *     --recommend web-framework \
 *     --reference 01-preflight --reference 02-deploy --reference 03-rollback
 *
 * Options:
 *   --id <name>          required; lowercase alphanumeric with single hyphens, matches the directory
 *   --summary <text>     required; English one-liner used by docs/INSTALLATION.md
 *   --summary-th <text>  required; Thai one-liner used by README.md
 *   --reference <slug>   repeatable; default 01-overview, 02-workflow, 03-verification
 *   --recommend <tag>    repeatable; must be an existing tag in skills.recommendForTags
 *   --title <text>       heading title; default derived from --id
 *   --description <text> full SKILL.md description; default derived from --summary
 *   --dry-run            print the plan and write nothing
 */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncSkillDocs } from './sync-skill-docs.mjs';

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_REFERENCES = ['01-overview', '02-workflow', '03-verification'];

function parseArgs(argv) {
  const args = { id: null, title: null, summary: null, summaryTh: null, description: null, references: [], recommend: [], dryRun: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--id') args.id = argv[++index];
    else if (flag === '--title') args.title = argv[++index];
    else if (flag === '--summary') args.summary = argv[++index];
    else if (flag === '--summary-th') args.summaryTh = argv[++index];
    else if (flag === '--description') args.description = argv[++index];
    else if (flag === '--reference') args.references.push(argv[++index]);
    else if (flag === '--recommend') args.recommend.push(argv[++index]);
    else if (flag === '--dry-run') args.dryRun = true;
    else if (flag === '--help' || flag === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${flag}`);
  }
  return args;
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function titleFromId(id) {
  return id.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function referenceFiles(slugs) {
  return slugs.map((slug) => {
    const clean = slug.endsWith('.md') ? slug : `${slug}.md`;
    const label = (clean.match(/^(\d+)/) ?? [])[1] ?? clean.replace(/\.md$/, '');
    return { file: clean, label };
  });
}

export function renderSkillEntry({ id, title, description, references }) {
  const rows = references.map((reference) => `| <!-- TODO: task shape --> | [${reference.label}](references/${reference.file}) |`).join('\n');
  const bullets = references.map((reference) => `- ${reference.label} — <!-- TODO: what this reference decides -->`).join('\n');
  return `---
name: ${id}
description: ${description}
compatibility: Instruction-only; no packages installed. <!-- TODO: replace with the real environment requirements, or delete this line. -->
metadata:
  version: "1"
  source: ultimate-vibecoder-ecosystem
  spec: agentskills.io/specification
---

# ${title}

<!-- TODO: one sentence stating the principle this pack enforces. -->

## Invariants that hold in every task

1. <!-- TODO: the rule that must never be broken -->

## Load only what the task needs

This skill is deliberately split. Read this file, then open only the reference files the task maps to.

| Task | Read in order |
|---|---|
${rows}

${bullets}

## Completion rule

<!-- TODO: state the evidence that makes this work complete, and what is not evidence. -->
`;
}

function lineIndentAt(text, index) {
  const lineStart = text.lastIndexOf('\n', index) + 1;
  return text.slice(lineStart, index).match(/^[ \t]*/)?.[0] ?? '';
}

/**
 * Inserts a pack into the `skills.packs` array of the manifest text without reformatting the rest of
 * the file. A JSON round-trip would rewrite unrelated compact arrays and turn a one-pack change into
 * a whole-file diff.
 */
export function insertPackIntoManifest(text, pack) {
  const keyIndex = text.indexOf('"packs"');
  if (keyIndex === -1) throw new Error('toolchain.json has no "packs" key to register into');
  const arrayStart = text.indexOf('[', keyIndex);
  if (arrayStart === -1) throw new Error('skills.packs must be an array');

  let depth = 0;
  let inString = false;
  let escaped = false;
  let arrayEnd = -1;
  for (let index = arrayStart; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '[' || char === '{') depth += 1;
    else if (char === ']' || char === '}') {
      depth -= 1;
      if (depth === 0) {
        arrayEnd = index;
        break;
      }
    }
  }
  if (arrayEnd === -1) throw new Error('could not find the end of skills.packs');

  const arrayIndent = lineIndentAt(text, arrayStart);
  const entryIndent = `${arrayIndent}  `;
  const block = entryIndent + JSON.stringify(pack, null, 2).split('\n').join(`\n${entryIndent}`);
  const inner = text.slice(arrayStart + 1, arrayEnd);

  const next = inner.trim() === ''
    ? `${text.slice(0, arrayStart + 1)}\n${block}\n${arrayIndent}${text.slice(arrayEnd)}`
    : `${text.slice(0, arrayEnd - (inner.match(/\s*$/)?.[0].length ?? 0))},\n${block}\n${arrayIndent}${text.slice(arrayEnd)}`;

  const parsed = JSON.parse(next);
  const packCount = parsed.skills?.packs?.length ?? 0;
  if (packCount !== (JSON.parse(text).skills?.packs?.length ?? 0) + 1 || parsed.skills.packs.at(-1)?.id !== pack.id) {
    throw new Error('internal error: manifest insertion did not produce the expected pack list');
  }
  return next;
}

export function renderReference(reference, title) {
  return `# ${reference.label} — ${title}

## Purpose

<!-- TODO: what this reference decides before implementation starts. -->

## Rules

1. <!-- TODO: a concrete rule an agent can follow -->

## Anti-patterns

Avoid:

- <!-- TODO: the failure this reference exists to prevent -->

## Output

Record for the change:

- <!-- TODO: what the agent must report back -->
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.id) throw new Error('Provide at least --id, --summary, and --summary-th. See the header of scripts/new-skill.mjs for the full usage.');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(args.id)) throw new Error(`--id must be lowercase alphanumeric with single hyphens (spec rule for SKILL.md names): ${args.id}`);
  if (!args.summary) throw new Error('--summary is required: one English line describing what the pack covers');
  if (!args.summaryTh) throw new Error('--summary-th is required: one Thai line for the generated README table');

  const manifestPath = path.join(kitRoot, 'toolchain.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const packs = manifest.skills?.packs;
  if (!Array.isArray(packs)) throw new Error('toolchain.json has no skills.packs array to register into');
  if (packs.some((pack) => pack.id === args.id)) throw new Error(`skill pack ${args.id} is already registered in toolchain.json`);

  const sourcePath = `skills/${args.id}`;
  const skillDir = path.join(kitRoot, sourcePath);
  if (await exists(skillDir)) throw new Error(`${sourcePath} already exists; remove or rename it before scaffolding ${args.id}`);

  const knownTags = manifest.skills?.recommendForTags ?? [];
  for (const tag of args.recommend) {
    if (!knownTags.includes(tag)) {
      throw new Error(`unknown recommendFor tag "${tag}". Known tags: ${knownTags.join(', ') || '(none)'}. To add one, extend skills.recommendForTags in toolchain.json and teach scripts/project-state.mjs to detect it first.`);
    }
  }

  const references = referenceFiles(args.references.length ? args.references : DEFAULT_REFERENCES);
  for (const reference of references) {
    if (!/^\d{2}-[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(reference.file)) {
      throw new Error(`invalid --reference "${reference.file}": expected NN-slug, for example 03-rollback`);
    }
  }
  if (new Set(references.map((reference) => reference.file)).size !== references.length) throw new Error('duplicate --reference names');

  const title = args.title ?? titleFromId(args.id);
  const description = args.description
    ?? `${args.summary} Use when a task falls inside this scope; do not use it for work outside this pack.`;
  const entry = manifest.skills?.entry ?? 'SKILL.md';
  const pack = {
    id: args.id,
    version: 1,
    sourcePath,
    bootstrapPath: `.ai-kit/skills/${args.id}`,
    activation: `Load only for ${title.toLowerCase()} work; read ${entry}, then open only the reference files the task maps to.`,
    summary: args.summary,
    summaryTh: args.summaryTh,
    recommendFor: args.recommend,
  };

  const files = [
    { relative: `${sourcePath}/${entry}`, content: renderSkillEntry({ id: args.id, title, description, references }) },
    ...references.map((reference) => ({
      relative: `${sourcePath}/${manifest.skills?.referencesPath ?? 'references'}/${reference.file}`,
      content: renderReference(reference, title),
    })),
  ];

  if (args.dryRun) {
    console.log(JSON.stringify({ ok: true, dryRun: true, pack, files: files.map((file) => file.relative) }, null, 2));
    return;
  }

  for (const file of files) {
    await mkdir(path.dirname(path.join(kitRoot, file.relative)), { recursive: true });
    await writeFile(path.join(kitRoot, file.relative), file.content, 'utf8');
  }

  await writeFile(manifestPath, insertPackIntoManifest(await readFile(manifestPath, 'utf8'), pack), 'utf8');
  const docs = await syncSkillDocs();

  console.log(JSON.stringify({
    ok: true,
    dryRun: false,
    pack: { id: pack.id, sourcePath: pack.sourcePath, bootstrapPath: pack.bootstrapPath, recommendFor: pack.recommendFor },
    created: files.map((file) => file.relative),
    registered: 'toolchain.json',
    docsUpdated: docs.updated,
    next: [
      `Fill in every <!-- TODO --> marker in ${sourcePath}.`,
      'node scripts/validate-kit.mjs   # must report ok: true before handoff',
      'node scripts/verify-bootstrap-protocol.mjs',
    ],
  }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
