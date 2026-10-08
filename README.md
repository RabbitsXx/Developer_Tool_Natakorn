# ⚡ Developer Tool Natakorn

**v1.1.0 — ชุดเครื่องมือสำหรับ AI coding agent ที่ติดตั้ง ตรวจสถานะ และอัปเกรดได้จาก CLI เดียว**

ช่วยให้ AI เข้าสู่โปรเจกต์ใหม่หรือโปรเจกต์เดิมอย่างมีข้อมูล: ตรวจ stack และ lockfile, ติดตั้งคำแนะนำกับ skills, เก็บสถานะสำหรับ session ถัดไป และตรวจคำสั่งก่อนเรียกใช้ รองรับ Node.js 22+ บน Windows, macOS และ Linux โดยใช้ Node built-ins ทั้งหมด ไม่มี runtime dependency ให้ติดตั้ง

## สารบัญ

- [เริ่มใช้งาน](#เริ่มใช้งาน)
- [คำสั่งหลัก](#คำสั่งหลัก)
- [อัปเกรดโดยรักษางานเดิม](#อัปเกรดโดยรักษางานเดิม)
- [ใช้ Prompt Enchant และ one-shot workflow](#ใช้-prompt-enchant-และ-one-shot-workflow)
- [Agent integrations และ skills](#agent-integrations-และ-skills)
- [Profiles, overlays และ optional starters](#profiles-overlays-และ-optional-starters)
- [ความปลอดภัยและข้อมูล](#ความปลอดภัยและข้อมูล)
- [ตรวจ toolkit และพัฒนาต่อ](#ตรวจ-toolkit-และพัฒนาต่อ)
- [เอกสารเพิ่มเติม](#เอกสารเพิ่มเติม)

## เริ่มใช้งาน

Clone repository แล้วสร้างโฟลเดอร์โปรเจกต์ปลายทางก่อน ตัวอย่าง PowerShell:

```powershell
git clone https://github.com/RabbitsXx/Developer_Tool_Natakorn.git
cd Developer_Tool_Natakorn
node bin/natakorn.mjs doctor
New-Item -ItemType Directory -Path C:\work\my-project -Force
node bin/natakorn.mjs init --target C:\work\my-project --agent all --dry-run
node bin/natakorn.mjs init --target C:\work\my-project --agent all
```

macOS / Linux:

```bash
git clone https://github.com/RabbitsXx/Developer_Tool_Natakorn.git
cd Developer_Tool_Natakorn
mkdir -p ~/work/my-project
node bin/natakorn.mjs init --target ~/work/my-project --agent all --dry-run
node bin/natakorn.mjs init --target ~/work/my-project --agent all
```

หลังติดตั้ง ให้เปิดโปรเจกต์ใน agent และส่งเนื้อหา `START_PROMPT.md` เพื่อเริ่มงานจริง ใช้ `--agent claude`, `--agent codex`, `--agent copilot`, `--agent gemini` หรือคั่นหลายชื่อด้วย comma ได้ ถ้าไม่ระบุ agent จะติดตั้ง skills กลางที่ `.ai-kit/skills/`

CLI รับ path ที่มีช่องว่างและภาษาไทยเมื่อใส่เครื่องหมาย quote เช่น `--target "F:\งานของฉัน"`

## คำสั่งหลัก

| คำสั่ง | การทำงาน |
|---|---|
| `init --target <project>` | เพิ่มไฟล์ที่ขาดและสร้าง state กับรายการ hash ของไฟล์ที่ toolkit ติดตั้ง |
| `update --target <project>` | อัปเกรดเฉพาะไฟล์ที่ติดตามและยังไม่ได้ถูกผู้ใช้แก้ |
| `inspect --target <project>` | ตรวจ stack, profiles, capabilities และรายละเอียด architecture drift โดยไม่เขียนไฟล์ |
| `status --target <project>` | ตรวจ SHA-256 และรายงาน unchanged / modified / missing |
| `doctor --target <project>` | ตรวจเครื่องมือในเครื่อง ไม่มี download หรือ login |
| `sources` | แสดงแหล่งโอเพนซอร์สและ pattern ที่นำมาปรับใช้ |
| `verify` | ตรวจ syntax, manifest/docs, bootstrap, eval และ regression tests ของ repository |
| `--help` / `--version` | ดูวิธีใช้ / เวอร์ชัน |

รายงานคำสั่งเป็น JSON; diagnostics ไป stderr; exit code `0` = สำเร็จ, `1` = งานล้มเหลวหรือถูกบล็อก, `2` = ใช้ CLI ผิด สำหรับ policy helpers เดิม `2` หมายถึงต้องได้รับ authorization

เริ่มตรวจเครื่องมือและโปรเจกต์ก่อนแก้ไฟล์ได้ด้วย:

```text
node bin/natakorn.mjs doctor
node bin/natakorn.mjs inspect --target /path/to/project
node bin/natakorn.mjs init --target /path/to/project --agent all --dry-run
```

ตรวจแผน dry-run ก่อน แล้วค่อยรันคำสั่งเดิมโดยเอา `--dry-run` ออกเพื่อเขียนไฟล์ สำหรับโปรเจกต์ที่ติดตั้งแล้ว ให้เรียก local CLI ใน `.ai-kit/bin/cli.mjs` ตามหัวข้อด้านล่าง

## อัปเกรดโดยรักษางานเดิม

```text
node bin/natakorn.mjs update --target /path/to/project --dry-run
node bin/natakorn.mjs update --target /path/to/project
```

Toolkit เก็บ ownership และ SHA-256 ใน `.ai-kit/installation.json` ไฟล์ที่มีอยู่ก่อนติดตั้งจะถูกเก็บไว้และไม่ถูกยึดเป็นไฟล์ของ toolkit แม้เนื้อหาตรงกับ template ถ้าไฟล์ที่ toolkit ติดตามถูกแก้ การอัปเกรดจะรายงาน conflict และหยุดก่อนเปลี่ยนไฟล์ทั้งหมด ให้ตรวจและ merge การปรับแต่งจากต้นฉบับด้วยตนเอง

โปรเจกต์ที่ bootstrap ด้วยเวอร์ชันเก่าใช้ `init` เพื่อเติมส่วนที่ขาดได้ ไฟล์เดิมจะยังเป็นไฟล์ของโปรเจกต์และต้องตรวจ merge เอง; ไม่มีการเดาประวัติ ownership

ถ้า stack เปลี่ยน `inspect` จะแสดงชื่อ field และค่าก่อน/หลัง ตรวจว่าเป็นการเปลี่ยนโดยตั้งใจแล้วจึงใช้ `update --accept-drift` การรันซ้ำโดยไม่มีการเปลี่ยนแปลงจะไม่เปลี่ยนเนื้อหา state หรือ ledger

## ใช้งานจากโปรเจกต์ที่ติดตั้งแล้ว

```text
node .ai-kit/bin/cli.mjs inspect
node .ai-kit/bin/cli.mjs status
node .ai-kit/bin/cli.mjs doctor
node .ai-kit/bin/cli.mjs sources
node .ai-kit/bin/policy-check.mjs --command "git status --short" --dry-run
node .ai-kit/bin/memory.mjs --kind handoff --text "Continue the next scoped task"
node .ai-kit/bin/metrics.mjs --event check --session task-1 --status passed --files 3
```

Helpers พร้อม manifest อยู่ในโปรเจกต์เอง ส่วน `init`, `update` และการตรวจ repository ด้วย `verify` ต้องใช้ checkout เต็มของ toolkit

### Prompt Enchant และ one-shot workflow

ใช้ `prompt-enchant` เมื่อต้องการปรับ prompt โดยตรง หรือเมื่อคำขอยังขาดขอบเขต/เกณฑ์รับงานจนเสี่ยงแก้ซ้ำ สำหรับงานที่ทำใน repository นี้ กฎใน `AGENTS.md` และ `START_PROMPT.md` กำหนดให้ agent ตรวจความครบถ้วนแบบเงียบ ๆ ก่อนเริ่มงานที่ไม่ใช่งานเล็กชัดเจน แล้วเติมข้อเท็จจริงจากไฟล์ที่เกี่ยวข้องให้น้อยที่สุดเท่าที่จำเป็น

- ถ้าขอ **prompt อย่างเดียว**: ได้ prompt พร้อมคัดลอกและไม่มีการ execute งานนั้นแทน
- ถ้าขอ **ให้ลงมือทำ**: ใช้ brief ภายในและทำงานต่อจนตรวจ acceptance ที่เกี่ยวข้อง
- ถ้าเป็น **งานเล็กและชัด**: ลงมือได้เลยโดยไม่เพิ่มขั้นวางแผนหรือเขียน prompt ใหม่
- ถ้าคำแก้เดิมเกิดซ้ำ: เก็บเป็นข้อจำกัดหรือ acceptance ที่ตรวจได้ แทนการเพิ่มคำอธิบายกว้าง ๆ

สำหรับงานที่ไม่เล็ก ให้ brief ครอบคลุมผลลัพธ์ ขอบเขต/ข้อจำกัด เกณฑ์ผ่านที่สังเกตได้ และวิธีตรวจ ใช้รูปแบบตามชนิดงาน เช่น UI ระบุผู้ใช้ ลำดับการใช้งาน อุปกรณ์และ responsive behavior; API ระบุ caller, contract, failure และ authorization; งาน data ระบุ provider, constraint และ rollback

หลักนี้สังเคราะห์จาก [คู่มือ prompting ของ Codex](https://developers.openai.com/codex/prompting), [แนวทาง Claude Code](https://code.claude.com/docs/en/best-practices) และ [แนวทาง prompting ของ Claude](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) โดยใช้หลักฐานวิจัยอย่างระมัดระวัง: งานศึกษาการเขียน requirement และ Self-Refine ไม่ใช่ benchmark ของ coding agent และไม่ได้พิสูจน์ว่าลดจำนวนรอบแก้ในทุกงาน ดูที่มาและข้อจำกัดใน [Open-source foundations](docs/OPEN_SOURCE_FOUNDATIONS.md)

เปิด [ตัว skill](skills/prompt-enchant/SKILL.md) และ [คู่มือ one-shot brief](docs/ONE_SHOT_WORKFLOW.md) เพื่อดูขั้นตอนและตัวอย่าง prompt ฉบับเต็ม ไม่มี API call หรือ dependency เพิ่ม และไม่มี prompt ใดรับประกัน first-pass success

## Agent integrations และ skills

| Agent | Skills ที่ติดตั้ง | คำแนะนำเข้าโปรเจกต์ |
|---|---|---|
| Codex | `.agents/skills/<pack>/` | `AGENTS.md` |
| Claude Code | `.claude/skills/<pack>/` | `CLAUDE.md` |
| GitHub Copilot | `.github/skills/<pack>/` | `.github/copilot-instructions.md` |
| Gemini CLI | `.gemini/skills/<pack>/` | `GEMINI.md` |
| Agent อื่น | `.ai-kit/skills/<pack>/` | `START_PROMPT.md` + `AGENTS.md` |

แต่ละ pack เป็น `SKILL.md` และ `references/` ตาม Agent Skills format โหลดเฉพาะ pack และ references ที่งานต้องใช้ การติดตั้งไฟล์ไม่ได้รับประกันว่า agent ทุกเวอร์ชันจะเรียก skill โดยอัตโนมัติ

ตัวติดตั้งคัดลอก skills ที่ลงทะเบียนใน `toolchain.json` ไปยังตำแหน่งของ agent ที่เลือก ไม่ติดตั้ง agent หรือเปิด permission เพิ่ม ดูวิธีติดตั้งและ refresh skills ใน [Installation guide](docs/INSTALLATION.md)

<!-- skill-packs:start (generated from toolchain.json; run: node scripts/sync-skill-docs.mjs) -->

_12 pack ลงทะเบียนใน `toolchain.json` ที่ `skills.packs`; ทุก pack มี `SKILL.md` + `references/` ตามรูปแบบ Agent Skills_

| Pack | ใช้เมื่อ | แนะนำเมื่อโปรเจกต์มี |
|---|---|---|
| `ui-ux` → `.ai-kit/skills/ui-ux/SKILL.md` | งาน UI ที่ผู้ใช้เห็น: หน้า, flow, ระบบคอมโพเนนต์, responsive และ visual QA | `web-framework` |
| `api` → `.ai-kit/skills/api/SKILL.md` | งาน HTTP endpoint/route handler, สัญญา request/response, error shape, ขอบเขต authz และ API test | `http-api` |
| `data-layer` → `.ai-kit/skills/data-layer/SKILL.md` | งาน schema/constraint, ความปลอดภัยของ migration, query และ index, tenant scoping, การตรวจข้อมูล | `database` |
| `testing` → `.ai-kit/skills/testing/SKILL.md` | การเลือกสิ่งที่จะตรวจสอบ, ระดับของ test, browser journey, flakiness และ test data, regression test | `web-framework`, `http-api`, `script-project`, `data-project` |
| `security` → `.ai-kit/skills/security/SKILL.md` | การทำ threat model, identity/authz, ความปลอดภัยของ input/output, secrets, supply chain และการตรวจ security | `web-framework`, `http-api`, `database`, `script-project` |
| `infrastructure` → `.ai-kit/skills/infrastructure/SKILL.md` | งาน infrastructure, CI/CD, container, cloud configuration, reliability และ operational verification | `infrastructure` |
| `mobile` → `.ai-kit/skills/mobile/SKILL.md` | งาน mobile architecture, platform boundary, offline behavior, permissions, release build และการตรวจบนอุปกรณ์ | `mobile` |
| `release` → `.ai-kit/skills/release/SKILL.md` | การวางแผนและ execute release อย่างปลอดภัย: preflight, deploy, rollback, observability หลัง release และการยืนยันหลังปล่อยจริง | `web-framework` |
| `automation` → `.ai-kit/skills/automation/SKILL.md` | สคริปต์ที่เชื่อถือได้, CLI, การตรวจ input, idempotency และ handoff ของ automation | `script-project` |
| `data-analysis` → `.ai-kit/skills/data-analysis/SKILL.md` | การตรวจและทำความสะอาดข้อมูล การคำนวณ ที่มา และการรายงานอย่างตรวจสอบได้ | `data-project` |
| `content-docs` → `.ai-kit/skills/content-docs/SKILL.md` | เอกสารและคู่มือที่ยึดแหล่งข้อมูล ตรวจความสอดคล้อง และแยกข้อเท็จจริง | `docs-project` |
| `prompt-enchant` → `.ai-kit/skills/prompt-enchant/SKILL.md` | แปลงคำขอสั้นหรือคลุมเครือเป็น prompt สำหรับ coding agent ที่ยึด repo ชัด มีเกณฑ์ผ่านและวิธีตรวจ โดยไม่ยืดเกินจำเป็น | `web-framework`, `http-api`, `database`, `mobile`, `infrastructure`, `script-project`, `data-project`, `docs-project` |

<!-- skill-packs:end -->

## Profiles และ overlays

Detector เลือก profiles จากหลักฐานในไฟล์ เช่น web, API, script, data, docs, mobile และ infrastructure พร้อม checklist ใน `.ai-kit/project.json` โปรเจกต์ผสมอาจมีหลาย profile; ดู [Profiles](docs/PROFILES.md)

กฎองค์กรหรือกฎธุรกิจเพิ่มได้ผ่าน `.ai-kit/overlays/<name>/OVERLAY.md` โดยใช้ frontmatter `name` ตรงกับชื่อโฟลเดอร์ ดู [Overlays](docs/OVERLAYS.md) และ [template](templates/overlay/OVERLAY.md)

Wrappers เดิมเรียก installer เดียวกัน และตรวจ overlay ก่อนติดตั้ง:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/bootstrap-project.ps1 -TargetPath C:\work\my-project -OverlayPath C:\work\overlays -DryRun
```

```bash
bash scripts/bootstrap-project.sh ~/work/my-project --overlay ~/work/overlays --dry-run
```

## Optional starters

```text
node bin/natakorn.mjs init --target /path/to/project --with playwright,accessibility,knip,lefthook,ci --dry-run
```

เลือกเฉพาะที่ต้องใช้: `playwright`, `accessibility`, `knip`, `lefthook`, `ci` การเลือกนี้คัดลอก configuration และตัวอย่างเท่านั้น ต้องปรับคำสั่งให้ตรงกับโปรเจกต์และติดตั้ง dependencies ด้วย package manager เดิม `accessibility` ต้องเลือกพร้อม `playwright`; CI จะถูกเพิ่มเฉพาะเมื่อระบุ `ci`

## ความปลอดภัยและข้อมูล

- แผนติดตั้งตรวจ path traversal, symlink/junction และไฟล์ที่ไม่ใช่ regular file ก่อนเขียน
- ใช้ exclusive creation, install lock, atomic metadata writes และ rollback ไฟล์ที่เขียนเมื่อเกิดข้อผิดพลาด โฟลเดอร์ว่างอาจเหลือหลัง rollback
- Policy ที่หายใช้ built-in rules; policy ที่เสียหรือ regex ไม่ถูกต้องหยุดการรัน Built-in deny/approval rules ถูกเก็บไว้แม้ project policy เป็น array ว่าง
- บันทึก audit โดย redact secret-shaped values; memory และ metrics ปฏิเสธข้อมูลลักษณะดังกล่าว
- Detector อ่าน metadata และชื่อตัวแปรจาก example ไม่อ่านค่าจาก secret `.env`
- Policy เป็น regex gate; host ยังต้องควบคุม process permissions เพราะการวิเคราะห์นี้ไม่ครอบคลุม shell syntax, aliases หรือสคริปต์ที่ซ่อนการทำงานทุกแบบ

อ่าน [Bootstrap protocol](docs/BOOTSTRAP_PROTOCOL.md) และ [Open-source foundations](docs/OPEN_SOURCE_FOUNDATIONS.md) สำหรับรายละเอียดขอบเขต

## แนวทางจากโอเพนซอร์ส

| แหล่ง | สิ่งที่นำมาปรับใช้ |
|---|---|
| [GitHub Spec Kit](https://github.com/github/spec-kit) | ติดตามไฟล์ด้วย hash, รักษา customization และจัด skill directories ตาม agent |
| [Superpowers](https://github.com/obra/superpowers) | ยืนยัน completion ด้วยผลตรวจที่รันจริง และ workflow ตามขอบเขตงาน |
| [Repomix](https://github.com/yamadashy/repomix) | จัด context, ignore ข้อมูลอ่อนไหว และ review ก่อนแบ่งปัน |
| [RTK](https://github.com/rtk-ai/rtk) | ลด terminal noise และวัดผลใน session จริงด้วย `rtk gain` |

ที่มา, license, หลักฐานที่ตรวจ และข้อจำกัดอยู่ใน [sources.json](sources.json) และ [บันทึกการศึกษา](docs/OPEN_SOURCE_FOUNDATIONS.md) ไม่มีการคัดลอก source upstream มา vendor หรือเรียก remote install script ระหว่าง bootstrap ผลของ toolkit ต้องวัดจากงานจริง ไม่ใช้จำนวน stars หรือเปอร์เซ็นต์ของ vendor เป็นผลรับประกัน

## ตรวจ toolkit และพัฒนาต่อ

```text
node bin/natakorn.mjs verify
```

หรือ `npm run verify` โดยไม่ต้อง `npm install` ชุดตรวจประกอบด้วย syntax check, manifest/doc contracts, bootstrap protocol, contract eval และ Node built-in regression tests ทดสอบ CLI จริงกับ temporary projects, Unicode paths, reruns, safe upgrades, local edits, policy failures, audit paths และ secret rejection

[Changelog](CHANGELOG.md) ระบุผลและ environment ที่ตรวจจริง เวอร์ชันนี้ยืนยันการทำงานบน Windows/Node 24; ยังต้องตรวจบน macOS/Linux ก่อนอ้างผลแพลตฟอร์มเหล่านั้น

ผลตรวจล่าสุดที่บันทึกใน [Changelog](CHANGELOG.md) ระบุ environment, กลุ่มตรวจ, จำนวน regression cases และรายการที่ข้ามไว้ตาม release นั้น ผลตรวจของ checkout ปัจจุบันอาจต่างออกไป ให้รัน `verify` เพื่อดูผลล่าสุดแทนการอาศัยตัวเลขใน release เก่า

## โครงสร้าง

```text
bin/natakorn.mjs            CLI entrypoint
scripts/cli.mjs             Commands and argument validation
scripts/kit-lifecycle.mjs   Planning, ownership hashes, installs and updates
scripts/safe-paths.mjs      Path boundaries and atomic writes
scripts/project-state.mjs   Stack/profile detection and drift
scripts/policy-check.mjs    Command classification and redacted audit
scripts/run-safe.mjs        Policy-gated execution
scripts/doctor.mjs          Offline tool probes
scripts/verify-kit.mjs      Complete local verification
skills/                    Agent Skills packs
templates/                 Project instructions and optional starters
tests/                     CLI, lifecycle and security regressions
sources.json               Primary-source research record
toolchain.json             Tool, profile, skill and runtime manifest
```

เอกสารเพิ่มเติม: [Setup](SETUP.md), [Installation](docs/INSTALLATION.md), [Architecture](docs/ARCHITECTURE.md), [Profiles](docs/PROFILES.md), [Overlays](docs/OVERLAYS.md), [Bootstrap protocol](docs/BOOTSTRAP_PROTOCOL.md), [One-shot workflow](docs/ONE_SHOT_WORKFLOW.md), [Open-source foundations](docs/OPEN_SOURCE_FOUNDATIONS.md), [Context efficiency](docs/CONTEXT_EFFICIENCY.md), [Quality](docs/QUALITY_AND_PRODUCTION.md), [Audit](docs/AUDIT.md)
