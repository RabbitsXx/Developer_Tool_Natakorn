#!/usr/bin/env node
/**
 * sync-skill-docs.mjs - renders the skill pack tables in README.md and docs/INSTALLATION.md
 * from `skills.packs` in toolchain.json.
 *
 * The manifest is the source of truth: register a pack there, run this script, and every table
 * updates. Markers delimit the generated regions, exactly like tool-report.mjs does for the tool
 * table, and validate-kit.mjs fails when a region is out of date, so docs cannot drift silently.
 *
 * Each pack needs `summary` (English) and `summaryTh` (Thai) because the kit ships a Thai README
 * next to English docs.
 *
 * Usage:
 *   node scripts/sync-skill-docs.mjs          # rewrite the generated regions
 *   node scripts/sync-skill-docs.mjs --check  # report drift and exit 1, writing nothing
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SKILL_DOC_START = '<!-- skill-packs:start (generated from toolchain.json; run: node scripts/sync-skill-docs.mjs) -->';
export const SKILL_DOC_END = '<!-- skill-packs:end -->';

function oneLine(text) {
  return String(text ?? '').replace(/\r?\n/g, ' ').trim();
}

function tagList(pack) {
  return (pack.recommendFor ?? []).map((tag) => `\`${tag}\``).join(', ') || '—';
}

export function renderPackTables(manifest) {
  const packs = manifest.skills?.packs ?? [];
  const entry = manifest.skills?.entry ?? 'SKILL.md';

  const th = [
    `_${packs.length} pack ลงทะเบียนใน \`toolchain.json\` ที่ \`skills.packs\`; ทุก pack มี \`${entry}\` + \`references/\` ตามรูปแบบ Agent Skills_`,
    '',
    '| Pack | ใช้เมื่อ | แนะนำเมื่อโปรเจกต์มี |',
    '|---|---|---|',
  ];
  for (const pack of packs) {
    th.push(`| \`${pack.id}\` → \`.ai-kit/skills/${pack.id}/${entry}\` | ${oneLine(pack.summaryTh ?? pack.summary)} | ${tagList(pack)} |`);
  }

  const en = [
    `_${packs.length} packs are registered in \`toolchain.json\` under \`skills.packs\`; each one is a folder with \`${entry}\` plus \`references/\` in the open Agent Skills format._`,
    '',
    '| Pack | Source | Bootstrapped to | Use when |',
    '|---|---|---|---|',
  ];
  for (const pack of packs) {
    en.push(`| \`${pack.id}\` | \`${pack.sourcePath}\` | \`${pack.bootstrapPath}\` | ${oneLine(pack.summary)} |`);
  }

  return { th: th.join('\n'), en: en.join('\n') };
}

export function buildSkillDocTargets(manifest) {
  const tables = renderPackTables(manifest);
  return [
    { file: 'README.md', content: tables.th },
    { file: 'docs/INSTALLATION.md', content: tables.en },
  ];
}

function missingMarkerFiles() {
  return [
    `README.md and docs/INSTALLATION.md must contain both markers (order matters):`,
    SKILL_DOC_START,
    SKILL_DOC_END,
  ].join('\n');
}

async function readIfExists(file) {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return null;
  }
}

export async function findSkillDocDrift(manifest, root = kitRoot) {
  const drifted = [];
  for (const target of buildSkillDocTargets(manifest)) {
    const current = await readIfExists(path.join(root, target.file));
    if (current === null) {
      drifted.push({ file: target.file, reason: 'missing file' });
      continue;
    }
    const startIndex = current.indexOf(SKILL_DOC_START);
    const endIndex = current.indexOf(SKILL_DOC_END);
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      drifted.push({ file: target.file, reason: 'missing markers' });
      continue;
    }
    if (current.slice(startIndex + SKILL_DOC_START.length, endIndex).trim() !== target.content.trim()) {
      drifted.push({ file: target.file, reason: 'out of date' });
    }
  }
  return drifted;
}

async function syncDocs(manifest) {
  const updated = [];
  for (const target of buildSkillDocTargets(manifest)) {
    const file = path.join(kitRoot, target.file);
    const current = await readIfExists(file);
    if (current === null) throw new Error(`${target.file} is missing`);
    const startIndex = current.indexOf(SKILL_DOC_START);
    const endIndex = current.indexOf(SKILL_DOC_END);
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) throw new Error(missingMarkerFiles());
    const next = `${current.slice(0, startIndex + SKILL_DOC_START.length)}\n\n${target.content}\n\n${current.slice(endIndex)}`;
    if (next !== current) {
      await writeFile(file, next, 'utf8');
      updated.push(target.file);
    }
  }
  return updated;
}

async function readManifest() {
  return JSON.parse(await readFile(path.join(kitRoot, 'toolchain.json'), 'utf8'));
}

// Used by scripts/new-skill.mjs after it registers a pack, so the generated tables never lag behind.
export async function syncSkillDocs() {
  const manifest = await readManifest();
  return { packs: manifest.skills?.packs?.length ?? 0, updated: await syncDocs(manifest) };
}

async function main() {
  const manifest = await readManifest();
  const packs = manifest.skills?.packs ?? [];
  if (packs.length === 0) throw new Error('toolchain.json registers no skills.packs');
  for (const pack of packs) {
    if (!pack.summary) throw new Error(`skill pack ${pack.id} needs a "summary" for the generated docs`);
    if (!pack.summaryTh) throw new Error(`skill pack ${pack.id} needs a "summaryTh" for the generated docs`);
  }

  if (process.argv.includes('--check')) {
    const drift = await findSkillDocDrift(manifest);
    console.log(JSON.stringify({ ok: drift.length === 0, packs: packs.length, drift }, null, 2));
    if (drift.length) process.exitCode = 1;
    return;
  }

  const updated = await syncDocs(manifest);
  console.log(JSON.stringify({
    ok: true,
    packs: packs.length,
    updated,
    targets: buildSkillDocTargets(manifest).map((target) => target.file),
  }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
