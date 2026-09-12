# ⚡ Ultimate VibeCoder Ecosystem

Private, portable developer kit สำหรับเริ่มโปรเจกต์ด้วย AI แบบมีกรอบชัดเจน ลด terminal noise, ลด context ที่ไม่จำเป็น และทำให้ทุกเครื่องใช้วิธี setup ใกล้เคียงกัน

Repository นี้ไม่ใช่ application template สำเร็จรูป และไม่ฝัง API key หรือ cloud credential ใด ๆ ลง Git เป้าหมายคือเป็น “คู่มือปฏิบัติ + เครื่องมือตรวจ + bootstrap” ที่นำไปใช้กับโปรเจกต์ใหม่ได้ทุกครั้ง

## Quick start

### Windows

```powershell
git clone https://github.com/RabbitsXx/Developer_Tool_Natakorn.git
cd Developer_Tool_Natakorn
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\doctor.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\bootstrap-project.ps1 -TargetPath C:\path\to\project
```

### macOS / Linux

```bash
git clone https://github.com/RabbitsXx/Developer_Tool_Natakorn.git
cd Developer_Tool_Natakorn
bash scripts/doctor.sh
bash scripts/bootstrap-project.sh /path/to/project
```

Bootstrap จะไม่ทับไฟล์ที่มีอยู่ หากเจอไฟล์ชื่อเดียวกันจะข้ามและแจ้งให้ merge เอง จากนั้นจะตรวจโปรเจกต์แบบ read-only และสร้าง `.ai-kit/project.json` เพื่อให้ AI ตัวถัดไปรู้ว่าเป็นโปรเจกต์ใหม่, โปรเจกต์เดิ��� หรือโปรเจกต์ที่ setup แล้ว

หลัง Bootstrap ให้เปิด `START_PROMPT.md` ที่ถูกวางไว้ในโปรเจกต์ แล้ว copy/paste เนื้อหาให้ AI coding agent ตัวที่กำลังใช้งาน จากนั้น Agent ต้องเริ่มจาก `.ai-kit/project.json` แทนการเดา stack หรือ setup ใหม่ทุกครั้ง

## นิยามการติดตั้งครบ 100%

Kit นี้แบ่งเครื่องมือเป็น 3 ระดับ จึงไม่ควรตีความว่า `npm install` ครั้งเดียวจะเปิดใช้ทุกบริการ cloud ได้ทันที

| ระดับ | เครื่องมือ | เกณฑ์ผ่าน |
|---|---|---|
| Baseline | Git, Node.js 22+, package manager, RTK | รัน `scripts/doctor.ps1` หรือ `scripts/doctor.sh` ผ่าน โดยไม่มี required/recommended issue |
| Local ตามงาน | Playwright, Repomix, Bruno, Docker-compatible runtime, Crawl4AI | ติดตั้งและรัน verify ของเครื่องมือนั้นเมื่อโปรเจกต์เลือกใช้ |
| Cloud ตามงาน | Neon, Supabase, Vercel, Inngest, Sentry/OTel provider, Jina Reader | CLI/API ใช้ได้หลัง login/configuration และเก็บ credential ใน environment/credential store |

สถานะ `100%` ของ Kit หมายถึง baseline ผ่านและเครื่องมือระดับ local/cloud ที่ระบุใน project context ถูก verify แล้ว ไม่ได้หมายถึงต้องติดตั้งทุกตัวในทุกโปรเจกต์

หลังติดตั้งให้รัน:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\doctor.ps1 -Strict
```

จากนั้นตรวจเฉพาะ tool ที่โปรเจกต์ใช้งานจริงตาม `toolchain.json` และเอกสารใน `docs/` ก่อน commit หรือ deploy

## Ecosystem ที่แนะนำ

| Layer | Default | ใช้เมื่อ |
|---|---|---|
| AI planning | ChatGPT / Codex | ออกแบบ, review, research และวางแผน |
| Execution agent | Freebuff / Fullbuff / Codebuff / Codex CLI | แก้ไฟล์และรันคำสั่งใน checkout จริง |
| Web framework | Next.js App Router + TypeScript | ตัวเลือกหลักสำหรับ full-stack web app ใหม่ แต่ให้รักษา framework เดิมของโปรเจกต์ |
| UI | Tailwind CSS + shadcn/ui | ใช้เมื่อเหมาะกับโปรเจกต์ ไม่ใช่ข้อบังคับ |
| Database | Neon / Supabase / PostgreSQL provider อื่น | เลือกจาก requirement จริง ไม่ล็อก provider กลาง |
| Database access | Drizzle / Prisma / `pg` / provider SDK | รักษา access layer เดิมก่อนสร้างใหม่ |
| Agent Skills packs | `.ai-kit/skills/<pack>/SKILL.md` + `references/` | สกิล portable ตามสเปกเปิด Agent Skills; โหลดทีละ pack และเปิด reference เฉพาะที่งานต้องใช้ (ตาราง pack ด้านล่างสร้างจาก manifest) |

### Skill packs ที่ลงทะเบียน

รายการ pack ทั้งหมดอยู่ใน `toolchain.json` ที่ `skills.packs` — เพิ่ม pack ที่นั่นแล้วตารางนี้จะอัปเดตตาม (ห้ามแก้ในบล็อก generated)

<!-- skill-packs:start (generated from toolchain.json; run: node scripts/sync-skill-docs.mjs) -->

_8 pack ลงทะเบียนใน `toolchain.json` ที่ `skills.packs`; ทุก pack มี `SKILL.md` + `references/` ตามรูปแบบ Agent Skills_

| Pack | ใช้เมื่อ | แนะนำเมื่อโปรเจกต์มี |
|---|---|---|
| `ui-ux` → `.ai-kit/skills/ui-ux/SKILL.md` | งาน UI ที่ผู้ใช้เห็น: หน้า, flow, ระบบคอมโพเนนต์, responsive และ visual QA | `web-framework` |
| `api` → `.ai-kit/skills/api/SKILL.md` | งาน HTTP endpoint/route handler, สัญญา request/response, error shape, ขอบเขต authz และ API test | `http-api` |
| `data-layer` → `.ai-kit/skills/data-layer/SKILL.md` | งาน schema/constraint, ความปลอดภัยของ migration, query และ index, tenant scoping, การตรวจข้อมูล | `database` |
| `testing` → `.ai-kit/skills/testing/SKILL.md` | การเลือกสิ่งที่จะตรวจสอบ, ระดับของ test, browser journey, flakiness และ test data, regression test | `web-framework`, `http-api` |
| `security` → `.ai-kit/skills/security/SKILL.md` | การทำ threat model, identity/authz, ความปลอดภัยของ input/output, secrets, supply chain และการตรวจ security | `web-framework`, `http-api`, `database` |
| `infrastructure` → `.ai-kit/skills/infrastructure/SKILL.md` | งาน infrastructure, CI/CD, container, cloud configuration, reliability และ operational verification | `infrastructure` |
| `mobile` → `.ai-kit/skills/mobile/SKILL.md` | งาน mobile architecture, platform boundary, offline behavior, permissions, release build และการตรวจบนอุปกรณ์ | `mobile` |
| `release` → `.ai-kit/skills/release/SKILL.md` | การวางแผนและ execute release อย่างปลอดภัย: preflight, deploy, rollback, observability หลัง release และการยืนยันหลังปล่อยจริง | `web-framework` |

<!-- skill-packs:end -->
| Browser E2E | Playwright | ตรวจ critical user journeys ที่ build อย่างเดียวพิสูจน์ไม่ได้ |
| Accessibility | `@axe-core/playwright` | ตรวจ issue ที่ automate ได้เมื่อโปรเจกต์ใช้ Playwright |
| Code health | Knip | หา unused files/exports/dependencies หลัง AI แก้หลายรอบ |
| Local quality hooks | Lefthook | กันงานผิดพลาดพื้นฐานก่อน commit โดยไม่แทน full verification |
| Terminal output | RTK | ลด output ที่ส่งเข้า context ของ AI |
| Repository context | Search-first + Repomix on-demand | อ่านเฉพาะส่วนก่อน แล้วค่อยขยายเมื่อจำเป็น |
| Web-to-Markdown | Jina Reader | อ่านหน้า public แบบเร็ว |
| Advanced crawling | Crawl4AI | หน้า dynamic, หลายหน้า หรือ extraction ซับซ้อน |
| API testing | Bruno | เก็บ API collection เป็นไฟล์ใน Git |
| Containers | Docker Desktop / Rancher Desktop / Podman; OrbStack บน macOS | ใช้เมื่อ local services ต้องการเท่านั้น |
| Deploy | Vercel หรือ target ที่โปรเจกต์เลือก | deploy/preview ตาม architecture จริง |
| Background work | Vercel Cron หรือ Inngest | เลือกตามความซับซ้อนของงาน ห้ามซ้อนโดยไม่มีเหตุผล |
| Production observability | Sentry / OpenTelemetry / project standard | เพิ่มเมื่อ production ต้องมี error/trace visibility |
| Remote CI | GitHub Actions optional template | ใช้กับ shared/production project เมื่อ remote verification มีประโยชน์ |

## โครงสร้าง repository

```text
.
├── START_PROMPT.md           # prompt เดียวสำหรับให้ AI ตัวใหม่เริ่ม/ตรวจ/resume โปรเจกต์
├── AGENTS.md                 # กติกาที่ AI ต้องอ่านก่อนทำงาน
├── SETUP.md                  # workflow มาตรฐานของ agent
├── toolchain.json            # manifest ที่คนและ AI อ่านได้
├── lefthook.yml              # Git hook guard ของ kit เอง (pre-commit self-check)
├── docs/
│   ├── BOOTSTRAP_PROTOCOL.md # NEW / EXISTING / RESUME + persistent state
│   ├── ARCHITECTURE.md       # สถาปัตยกรรมและ decision rules
│   ├── CONTEXT_EFFICIENCY.md # search-first, context budget และ delegation rules
│   ├── QUALITY_AND_PRODUCTION.md # Playwright, optional CI, observability
│   ├── INSTALLATION.md       # ติดตั้งแยกตามระบบปฏิบัติการ
│   └── AUDIT.md              # จุดผิด/เสี่ยงจากสเปกตั้งต้นและวิธีแก้
├── scripts/
│   ├── doctor.ps1            # ตรวจเครื่อง Windows แบบ read-only
│   ├── doctor.sh             # ตรวจเครื่อง macOS/Linux แบบ read-only
│   ├── verify-tools.ps1      # ตรวจเครื่อง + สัญญา kit ในคำสั่งเดียว (Windows)
│   ├── setup-project.mjs     # ตรวจ mode/stack และเขียน .ai-kit/project.json
│   ├── project-state.mjs     # detector/state contract ที่ไม่อ่าน secret .env
│   ├── bootstrap-project.ps1 # ลง template + state ในโปรเจกต์ Windows
│   ├── bootstrap-project.sh  # ลง template + state ในโปรเจกต์ macOS/Linux
│   ├── sync-skills.mjs       # copy ทุก Agent Skills pack ที่ลงทะเบียนใน toolchain.json
│   ├── sync-skill-docs.mjs   # generate ตาราง pack ใน README/INSTALLATION จาก manifest (--check สำหรับ gate)
│   ├── new-skill.mjs         # scaffold pack ใหม่: สร้าง SKILL.md + references + ลงทะเบียนใน toolchain.json
│   ├── policy-check.mjs      # classify คำสั่งแบบ deny-first + redact + append audit log (ไม่ execute)
│   ├── run-safe.mjs          # รันคำสั่งผ่าน policy gate (allow / deny / approval-required)
│   ├── memory.mjs            # บันทึก decision/lesson/handoff ที่ไม่เป็นความลับลง .ai-kit/memory/
│   ├── metrics.mjs           # บันทึก session/task metrics ลง .ai-kit/metrics/events.jsonl
│   ├── eval-kit.mjs          # deterministic evals ของสัญญา kit (ไม่ใช่การวัดความฉลาดของ model)
│   ├── validate-kit.mjs      # ตรวจไฟล์บังคับ + manifest + สเปก SKILL.md ของทุก pack
│   ├── verify-bootstrap-protocol.mjs # ทดสอบ NEW/EXISTING/RESUME + drift + secret isolation
│   └── tool-report.mjs       # probe ทุก tool ใน toolchain.json → JSON + Markdown + HTML
├── skills/                   # <pack>/SKILL.md + references/ ต่อ pack ตามสเปก Agent Skills
│                             # รายการ pack จริง = toolchain.json skills.packs (ตารางด้านบน generate จาก manifest)
└── templates/                # ไฟล์ตั้งต้นที่ bootstrap นำไปใช้ (รวม policy.json และ memory/)
    └── optional/             # Playwright/CI starters เลือก copy เอง ไม่ bootstrap อัตโนมัติ
```

## ตรวจสุขภาพ Kit ด้วยตัวเอง

หลังแก้ไฟล์ใน kit (templates, manifest หรือ bootstrap scripts) ให้รัน self-check ทั้งสองตัวก่อน commit:

```bash
node scripts/validate-kit.mjs               # ไฟล์บังคับ + toolchain contract + สเปก SKILL.md ของทุก pack + ตาราง docs ตรงกับ manifest
node scripts/sync-skills.mjs --target <project>  # copy ทุก pack ตาม toolchain.json (ไม่ทับไฟล์เดิม)
node scripts/sync-skill-docs.mjs            # sync ตาราง pack ใน README/INSTALLATION จาก manifest (--check เพื่อ fail เมื่อเพี้ยน)
node scripts/new-skill.mjs --id <name> --summary "..." --summary-th "..."   # scaffold pack ใหม่แบบคำสั่งเดียว (--dry-run เพื่อพรีวิว)
node scripts/verify-bootstrap-protocol.mjs  # NEW / EXISTING / RESUME + drift + secret isolation
node scripts/eval-kit.mjs                   # evals ของสัญญา kit: policy, redaction, state safety
```

คำสั่งชุดนี้รันอยู่ใน temp directory ของระบบ หรืออ่านอย่างเดียวจาก kit (ไม่แตะโปรเจกต์ปลายทาง) และ `validate-kit` / `verify-bootstrap-protocol` / `eval-kit` ต้องคืน `"ok": true` ทั้งหมดก่อนนับว่างานเสร็จ

## Command policy, memory และ metrics

คิทไม่แกล้งอ้างว่าเป็น sandbox ระดับ OS — มันเป็น **command gate + audit trail** ที่ agent และ hook เรียกใช้ได้จริง

```bash
node scripts/policy-check.mjs --command "vercel deploy --prod"   # classify เท่านั้น ไม่รัน (exit 1 = deny, 2 = ต้องอนุมัติ)
node scripts/run-safe.mjs --command "vercel deploy --prod" --approved --reason "authorized by user"
node scripts/memory.mjs --kind decision --text "เก็บ provider เดิมไว้ เพราะ ..."
node scripts/memory.mjs --kind handoff --text "งานที่ค้างและขั้นถัดไป"
node scripts/metrics.mjs --event session-end --session <id> --status passed --files 7 --duration-ms 540000
```

- policy อ่านจาก `.ai-kit/policy.json` (bootstrap คัดมาจาก `templates/policy.json`) และตัดสินแบบ **deny ก่อน** แล้วจึง approval-required แล้วจึง allow
- ทุก decision ถูก redact (token/secret/password/connection string) และ append ลง `.ai-kit/audit/events.jsonl` ซึ่งอยู่ใน `.gitignore` ของโปรเจกต์ปลายทาง
- `.ai-kit/memory/` มี `decisions.jsonl`, `lessons.jsonl`, `handoff.md` และ **ปฏิเสธ** ข้อความที่มีลักษณะเป็น secret
- `.ai-kit/metrics/` เป็นหลักฐานระดับ task/session สำหรับดูว่า kit ช่วยจริงไหม ส่วน `eval-kit.mjs` วัดได้แค่สัญญาของ kit ไม่ใช่คุณภาพของ model
- ขอบเขตที่ต้องพูดตรง ๆ: gate นี้บังคับได้เท่าที่ harness เรียกมัน ถ้า agent รัน shell ตรง ๆ โดยไม่ผ่าน `run-safe.mjs` มันจะข้าม gate — hook/permission ของ harness ยังเป็นชั้นบังคับจริง

นอกจากรันเองแล้ว `lefthook.yml` ที่ root ผูกคำสั่งทั้งสองไว้กับ `pre-commit` โดยรันเฉพาะเมื่อ staged files แตะสัญญาของ kit (manifest, docs, scripts, skills, templates, Markdown) เปิดใช้ครั้งเดียวต่อ clone:

```bash
npx lefthook install     # ลง hook เข้า .git/hooks (ปิดด้วย npx lefthook uninstall)
```

บน Windows ใช้ entry point เดียวได้เลย — `verify-tools.ps1` จะรัน `doctor.ps1` แล้วต่อด้วย self-check ทั้งสอง พร้อมสรุปและ exit code เดียว (ใช้ `-SkipTools` เมื่อต้องการเฉพาะสัญญาของ kit):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-tools.ps1
```

Hook เป็นตัวช่วย ไม่ใช่เงื่อนไขบังคับ: ถ้าเครื่องไหนยังไม่มี Lefthook คำสั่งมือด้านบนยังใช้ได้ตามปกติ และ `templates/optional/lefthook.yml.example` ยังเป็น starter สำหรับโปรเจกต์ปลายทางที่ใช้สคริปต์ของตัวเอง

### รายงานสถานะเครื่องมือ (tool-report)

`tool-report.mjs` อ่านรายการ tool จาก `toolchain.json` แล้ว probe ทีละตัว โดยเขียนผลออก 3 แบบ:

```bash
node scripts/tool-report.mjs                     # probe จาก root ของ kit
node scripts/tool-report.mjs --cwd ../apps/web   # probe ในโปรเจกต์ที่มี dependency ติดตั้งอยู่
node scripts/tool-report.mjs --json              # สำหรับ agent: พิมพ์บรรทัดเดียว
```

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `tool-report.json` | ผลเต็ม — คำสั่ง, exit code, เวลา, output ดิบ |
| `tool-report.md` | ตารางพร้อมวางใน README |
| `tool-report.html` | หน้าสรุปสำหรับคน เปิดในเบราว์เซอร์ได้เลย ไม่ต้องมี server |

ค่าเริ่มต้น probe แบบ **offline**: `npx <pkg>` ถูกเติม `--no-install` ให้อัตโนมัติ จึงไม่มีการดาวน์โหลดเงียบ ๆ ระหว่างตรวจ (ใช้ `--allow-install` เมื่อต้องการให้ตรวจผ่านเน็ต)

Terminal พิมพ์แค่บรรทัดละ tool + สรุป + path ของรายงาน (19 tool ≈ 400 tokens) ส่วนรายละเอียดทั้งหมดอยู่ในไฟล์ จึงไม่กิน context จนกว่าจะมีคนอ่าน — และหน้า HTML ไม่กิน token เลยเพราะ agent ไม่ต้องอ่านมัน

## ผลการทดสอบเครื่องมือ (verified on a real workstation)

ทุกแถวในส่วนนี้ **รันจริงบนเครื่องที่ทดสอบ** ไม่ใช่การอ้างจากเอกสารผู้ผลิต — ทดสอบเมื่อ 2026-09-11 บน Windows 10.0.26100 x64 ผ่าน Git Bash 5.2.37 + PowerShell แถวที่ยังไม่ได้ทดสอบจะถูกระบุว่า "ยังไม่ทดสอบ" และไม่นับเป็นผ่าน

### A. เครื่องมือที่ยืนยันแล้ว

| # | เครื่องมือ | Tier | คำสั่งที่รัน | ผลที่ได้จริง |
|---|---|---|---|---|
| 1 | git | required | `git --version` | `git version 2.52.0.windows.1` |
| 2 | node | required (>= 22) | `node --version` | `v24.19.0` |
| 3 | npm | required | `npm --version` | `11.17.0` |
| 4 | pnpm | optional | `pnpm --version` | `11.24.0` |
| 5 | rtk | recommended | `rtk --version` + `rtk gain` | `rtk 0.48.0`; วัดได้ 361 commands · input 200.3K / output 181.9K tokens · ประหยัด 18.4K (9.2%) · ดีสุด `rtk rg` 24.8% |
| 6 | Bruno CLI | recommended for API work | `bru --version` | `4.1.0` |
| 7 | GitHub CLI | ตรวจโดย doctor | `gh --version` | `gh version 2.86.0` |
| 8 | python | ฐานของ Crawl4AI | `python --version` | `Python 3.14.2` |
| 9 | Playwright | recommended for user-facing web | `npx playwright --version` แล้วรัน spec จริง | `1.63.0`; รันกับ route จริงผ่าน 1 test (1.9s) — HTTP 200, title `SAG Growth OS`, axe ตรวจ 7 rules ผ่าน 0 violations |
| 10 | @axe-core/playwright | recommended with Playwright | ใช้ `AxeBuilder` ใน spec เดียวกัน | ทำงานจริง คืนผล audit เป็น JSON (`axeRulesPassed`, `violations`) |
| 11 | Knip | recommended for JS/TS code health | `npx knip` | จบด้วย exit 0: unused files 22 (ในนั้น 13 เป็น `out/_next/**` = build artifact) · unused dependencies 2 (`clsx`, `date-fns`) · unused devDependencies 2 · unlisted dependency 1 (`server-only`) · unused exports 43 |
| 12 | Lefthook | optional local quality guard | `npx lefthook version` → `lefthook install` → commit จริง | `2.1.12`; ติดตั้ง `.git/hooks/pre-commit` สำเร็จ (`sync hooks: ✔️(pre-commit)`); commit ที่แตะ kit contract ถูกบล็อกจริง (`Error: toolchain schemaVersion must be >= 4`, `exit status 1`, HEAD ไม่ขยับ) |

สิ่งที่เจอจากของจริงระหว่างทดสอบ (ไม่ใช่ทฤษฎี)

- npm 11 บล็อก `postinstall` ของ Lefthook (`npm warn allow-scripts`) — CLI ยังใช้ได้ แต่โปรเจกต์ที่พึ่ง postinstall ต้องอนุมัติสคริปต์ก่อน
- Knip รายงาน `out/_next/**` เป็น unused files เพราะ build output ไม่ได้ถูก ignore — ต้องตรวจผลก่อนลบตามที่เอกสารเตือนไว้
- `@axe-core/playwright` และ `lefthook` ถูกนับเป็น unused devDependencies ตามคาด เพราะแอปไม่ได้ import เอง (ใช้ผ่าน CLI/spec)
- พบช่องโหว่จริงใน guard ของ kit: staged เฉพาะ `lefthook.yml` แล้วได้ `kit-self-check (skip) no matching staged files` → เพิ่ม `lefthook.yml` เข้า glob แล้วรันซ้ำได้ `✔️ kit-self-check (0.20 seconds)`

<!-- tool-report:start (generated; edit outside this block) -->

_19 tools probed 2026-09-11T02:59:33.054Z on win32 10.0.26100, probe cwd `../apps/web` (offline probing (npx --no-install))._

### เครื่องมือที่ยืนยันแล้ว (12)

| เครื่องมือ | Tier | คำสั่งที่รัน | ผลที่ได้จริง |
|---|---|---|---|
| `git` | required | `git --version` | `2.52.0.windows.1` |
| `node` | required | `node --version` | `24.19.0` |
| `npm` | required | `npm --version` | `11.17.0` |
| `pnpm` | optional | `pnpm --version` | `11.24.0` |
| `rtk` | recommended | `rtk --version` | `0.48.0` |
| `gh` | recommended-for-github-workflow | `gh --version` | `2.86.0` |
| `python` | on-demand | `python --version` | `3.14.2` |
| `playwright` | recommended-for-user-facing-web | `npx --no-install playwright --version` | `1.63.0` |
| `axe-playwright` | recommended-with-playwright-for-user-facing-web | `node -e "require.resolve('@axe-core/playwright')"` | — |
| `knip` | recommended-for-js-ts-code-health | `npx --no-install knip --version` | `6.35.1` |
| `lefthook` | optional-local-quality-guard | `npx --no-install lefthook version` | `2.1.12` |
| `bruno` | recommended-for-api-work | `bru --version` | `4.1.0` |

### ยังไม่ยืนยันบนเครื่องนี้ (7)

| เครื่องมือ | Tier | สถานะ | เหตุผล / สิ่งที่ต้องมี |
|---|---|---|---|
| `yarn` | optional | ไม่พบบนเครื่องนี้ | 'yarn' is not recognized as an internal or external command, |
| `bun` | optional | ไม่พบบนเครื่องนี้ | 'bun' is not recognized as an internal or external command, |
| `repomix` | on-demand | ไม่พบบนเครื่องนี้ | npm error npx canceled due to missing packages and no YES option: ["repomix@1.18.0"] |
| `container-runtime` | on-demand | ไม่พบบนเครื่องนี้ | 'podman' is not recognized as an internal or external command, |
| `crawl4ai` | on-demand | ไม่พบบนเครื่องนี้ | 'crawl4ai-doctor' is not recognized as an internal or external command, |
| `jina-reader` | on-demand | ตรวจอัตโนมัติไม่ได้ | nothing to install locally; verified by calling the API with a credential |
| `sentry-or-opentelemetry` | recommended-for-production | ตรวจอัตโนมัติไม่ได้ | depends on the observability stack each project selects |

<!-- tool-report:end -->

### B. ยังไม่ทดสอบบนเครื่องนี้ (ไม่นับเป็นผ่าน)

| เครื่องมือ | สถานะที่ตรวจได้ | คำสั่งที่ใช้ยืนยันด้วยตัวเอง |
|---|---|---|
| Repomix | ไม่พบบน PATH | `npx repomix@latest --version` |
| Crawl4AI | ไม่พบ | `pip install crawl4ai` แล้ว `crawl4ai-doctor` |
| Docker-compatible runtime | ไม่พบ (`docker`, `podman`) | `docker --version` |
| Jina Reader | ต้องมี network/credential | ยิง `https://r.jina.ai/<url>` |
| Neon / Supabase / PostgreSQL provider | ต้องมี credential ของโปรเจกต์ | ใช้ connection string จริง + เช็ค `GET /api/health/db` |
| Vercel / Inngest / Sentry-OTel | ต้องมีบัญชี cloud | login CLI แล้ว verify ในโปรเจกต์ที่เลือกใช้ |

### C. สคริปต์ของ kit ที่ทดสอบ end-to-end

| สคริปต์ | วิธีทดสอบ | ผลจริง |
|---|---|---|
| `validate-kit.mjs` | `node scripts/validate-kit.mjs` | `ok: true` · required files 32 · `selfCheckHook: lefthook.yml (pre-commit)` |
| `verify-bootstrap-protocol.mjs` | `node scripts/verify-bootstrap-protocol.mjs` | 13 PASS (NEW / EXISTING / RESUME, idempotent state, secret isolation, drift, lockfile guard, manifest-driven skills) |
| `doctor.ps1` | `powershell -File scripts/doctor.ps1` และ `-Strict` | `0 required issue(s), 0 recommended issue(s)` |
| `doctor.sh` | `bash scripts/doctor.sh` | `0 required issue(s), 0 recommended issue(s)` |
| `verify-tools.ps1` | `powershell -File scripts/verify-tools.ps1` (+ `-SkipTools`) | entry point เดียว: `[OK]` ทั้ง 3 stage (doctor → validate-kit → verify-bootstrap) · `-SkipTools` รัน 2 stage ของ kit · exit 0 |
| `verify-tools.ps1` (failure path) | แตะ `toolchain.json` ให้ `schemaVersion` เป็น 4 แล้วรัน `-SkipTools` | `[FAIL] kit contract (validate-kit.mjs)` เพราะ schema ต้องเป็น 5 และ script ออกด้วย exit 1 (ไม่กลืน error) |
| `setup-project.mjs` | โฟลเดอร์ว่าง | โหมด `NEW_PROJECT`, เขียน `.ai-kit/project.json`, `pendingDecisions: [product_requirements_before_stack_selection]`, safety flags ทั้ง 4 เป็น `false` |
| `setup-project.mjs --dry-run` | โฟลเดอร์ว่างอีกอัน | `dryRun: true`, `stateFile: null` และไม่มีการสร้าง `.ai-kit/` |
| `setup-project.mjs` + drift | เติม `package.json` (`next`) แล้วรันซ้ำ | `framework: nextjs`, `driftDetected: true` → `--accept-drift` แล้วเป็น `false` และรันซ้ำยังคง `false` |
| `bootstrap-project.ps1` | ลงโปรเจกต์ใหม่ | สร้าง instruction/policy/memory state และ skill 8 pack รวม 48 ไฟล์ใต้ `.ai-kit/skills/` |
| `bootstrap-project.ps1` (รันซ้ำ) | หลังเติมบรรทัดใน `AGENTS.md` และใน `.ai-kit/skills/ui-ux/SKILL.md` | ข้ามเทมเพลตเดิม 9 ครั้ง, sync รายงาน `skipped: 6` ต่อ pack และข้อความ local edit ของทั้งสองไฟล์ยังอยู่ (`grep -c` = 1) |
| `sync-skills.mjs --dry-run` | โฟลเดอร์ว่าง | `ok: true`, `dryRun: true`, 8 pack รวม 48 ไฟล์เป็น `added` โดยยังไม่เขียนลงดิสก์ |
| `sync-skill-docs.mjs --check` | แก้ `summary` ของ pack ใน manifest (บนสำเนาชั่วคราวของ kit) | `ok: false` + `docs/INSTALLATION.md: out of date` และ exit 1; `validate-kit.mjs` ก็ fail พร้อมข้อความให้รัน `sync-skill-docs.mjs` |
| เพิ่ม pack ที่สาม (`data-layer`) | เขียน `skills/data-layer/` + ลงทะเบียนใน `toolchain.json` | `bootstrap-project.sh/.ps1` ไม่มีคำว่า `data-layer` เลย แต่ bootstrap ลง 18 ไฟล์ และ detector รายงาน `data-layer-skill-pack` |
| เพิ่ม pack ที่สี่ (`testing`) โดยใช้ tag เดิม (`web-framework`, `http-api`) | เขียน `skills/testing/` + ลงทะเบียนใน `toolchain.json` เท่านั้น | sha256 ของ `scripts/*` ก่อน/หลังเท่ากัน (ตอนนั้น kit มี 4 pack จึงลง 24 ไฟล์ และ detector รายงาน 4 capability) |
| domain packs | เพิ่ม `security`, `infrastructure`, และ `mobile` ผ่าน manifest + `SKILL.md` | bootstrap และ detector รับรู้ pack ตาม tag `web-framework`, `http-api`, `database`, `infrastructure`, `mobile` โดยไม่ hardcode รายชื่อใน bootstrap |
| `bootstrap-project.sh` | ลงโปรเจกต์ใหม่ | ไฟล์ชุดเดียวกับฝั่ง PowerShell, policy/memory state และ skill packs ถูกติดตั้ง; detector ต่อได้เป็น `RESUME_CONFIGURED_PROJECT` |
| `lefthook.yml` guard | `lefthook install` + commit จริง | บล็อก commit ที่แตะ kit contract ได้จริง และ self-check ปัจจุบันตรวจ manifest/docs/policy/memory/eval contracts |
| `policy-check.mjs` | bootstrap โปรเจกต์จำลอง แล้ว classify 4 คำสั่ง (allow / deploy / reset --hard / curl พร้อม token) | `allow`, `approval_required`, `deny` ถูกต้อง; append audit 4 บรรทัด; grep ค่า token ที่ใส่ไปใน audit = **false** |
| `run-safe.mjs` | กำหนด policy ให้ `node --version` ต้องอนุมัติ แล้วลอง 3 ทาง | ไม่ใส่ `--approved` → blocked (`decision: approval_required`); ใส่ `--approved --reason` → รันจริงและคืน `v22.17.1`; `deny` → exit 1 โดยไม่ออกคำสั่ง |
| `memory.mjs` | decision + handoff + พยายามเขียนข้อความที่มี `TOKEN=...` | decision/handoff ถูกเขียนและอ่านคืนได้; ข้อความลักษณะ secret ถูกปฏิเสธ |
| `metrics.mjs` | `--event session-end --session s1 --status passed --files 7` | เขียน `.ai-kit/metrics/events.jsonl` สำเร็จ |
| `eval-kit.mjs` | `node scripts/eval-kit.mjs` | `ok: true` 4/4 evals (policy deny, deploy escalation, redaction, state safety) |
| bootstrap 8 pack (bash และ PowerShell) | ลงโปรเจกต์ใหม่ทั้งสองภาษา | ได้ `policy.json`, `memory/README.md`, skill 48 ไฟล์ 8 pack, `project.json`; รันซ้ำข้ามเทมเพลต 11 ครั้ง + sync `skipped` ครบ 8 pack; local edit ใน `AGENTS.md` และ `SKILL.md` รอด |
| ย้าย roster ของ pack ออกจาก prose | `grep` หา path เจาะจง `.ai-kit/skills/<id>/SKILL.md` ใน 4 ไฟล์ instruction | เหลือ **0 จุด** ทุกไฟล์; ทั้ง 4 ไฟล์ชี้ไป `.ai-kit/skills/`, `skills.packs` และ `potentiallyUseful`; bootstrap ทั้ง bash และ PowerShell ยังลง 48 ไฟล์ 8 pack |
| gate กัน roster กลับมา | บนสำเนาชั่วคราวของ kit: ใส่ bullet 2 บรรทัดที่ระบุ path ของ pack แล้วรัน `validate-kit` | fail ทันทีด้วยข้อความ `AGENTS.md enumerates skill packs in prose (.ai-kit/skills/ui-ux/SKILL.md, .ai-kit/skills/api/SKILL.md)`; ลบออกแล้วผ่านอีกครั้ง |

ผลชุดนี้เป็นของ Windows เท่านั้น — รอบนี้ยังไม่มีหลักฐานบน macOS/Linux

## หลักการสำคัญ

- เริ่ม session ใหม่ด้วย `START_PROMPT.md` และ `.ai-kit/project.json`; ถ้า architecture fingerprint ไม่เปลี่ยน ห้าม setup ซ้ำโดยไม่มีเหตุผล
- Pin dependency ในแต่ละโปรเจกต์ผ่าน lockfile; อย่าฝาก production build ไว้กับ global package
- `.env`, token, private key และข้อมูลลูกค้าห้ามเข้า Git
- ใช้ RTK กับคำสั่งที่รองรับ แต่เปิด raw output เฉพาะ failing section เมื่อกำลังวินิจฉัยสิ่งที่ถูกกรองหาย
- Search ก่อนอ่านกว้าง: small task เริ่มไม่เกิน 5 files, medium task เริ่มไม่เกิน 15 files แล้วขยายเมื่อ dependency บังคับ
- ใช้ Repomix เฉพาะเมื่อ context กว้างมีประโยชน์จริง และตรวจไฟล์ผลลัพธ์ก่อนส่งออกนอกเครื่อง
- Database/provider/ORM เป็น project decision; migration history ต้องสะท้อน behavior ที่ deploy ได้จริงเมื่อ architecture ใช้ migrations
- ทุกงานต้องมี lint/typecheck/test/build ตามที่โปรเจกต์รองรับ และทดสอบ UI จริงเมื่อเปลี่ยน behavior; critical browser journeys ใช้ Playwright เมื่อ configure ไว้
- CI และ observability เป็น optional capability ไม่ใช่ dependency ที่ต้องยัดทุกโปรเจกต์
- Skill packs (`ui-ux`, `api`, `data-layer`, `testing`, `security`, `infrastructure`, `mobile`, `release`) ถูก bootstrap เป็น instruction-only ใต้ `.ai-kit/skills/<pack>` ในรูปแบบ Agent Skills (`SKILL.md` + `references/`) จึงย้ายไปใช้กับ harness อื่นได้ทันที; Agent อ่าน `SKILL.md` แล้วเปิดเฉพาะ reference ที่ตรงกับงานเพื่อลด token/context
- ก่อนรันคำสั่งที่แก้ Git/database/cloud/container/remote system ให้ใช้ `scripts/policy-check.mjs` แบบ deny-first; ทุก decision ถูก redact และ append ลง `.ai-kit/audit/events.jsonl` แต่ตัว checker ไม่ใช่ OS sandbox และไม่ execute command แทน agent
- ใช้ `.ai-kit/memory/` สำหรับ decision/lesson/handoff ที่ไม่เป็นความลับ และ `.ai-kit/metrics/` สำหรับหลักฐานระดับ task/session; `scripts/eval-kit.mjs` วัด contract ของ kit ไม่ใช่ความฉลาดของ model
- Knip, axe-core และ Lefthook เป็น optional project capabilities: detector แนะนำ/ตรวจจับได้ แต่ bootstrap ไม่ติดตั้ง dependency ให้อัตโนมัติ

อ่าน [ผลตรวจสเปกและสิ่งที่แก้](docs/AUDIT.md) ก่อนนำ stack นี้ไปใช้จริง
