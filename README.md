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

Bootstrap จะไม่ทับไฟล์ที่มีอยู่ หากเจอไฟล์ชื่อเดียวกันจะข้ามและแจ้งให้ merge เอง

## นิยามการติดตั้งครบ 100%

Kit นี้แบ่งเครื่องมือเป็น 3 ระดับ จึงไม่ควรตีความว่า `npm install` ครั้งเดียวจะเปิดใช้ทุกบริการ cloud ได้ทันที

| ระดับ | เครื่องมือ | เกณฑ์ผ่าน |
|---|---|---|
| Baseline | Git, Node.js 22+, package manager, RTK | รัน `scripts/doctor.ps1` หรือ `scripts/doctor.sh` ผ่าน โดยไม่มี required/recommended issue |
| Local ตามงาน | Repomix, Bruno, Docker-compatible runtime, Crawl4AI | ติดตั้งและรัน verify ของเครื่องมือนั้นเมื่อโปรเจกต์เลือกใช้ |
| Cloud ตามงาน | Supabase, Vercel, Inngest, Jina Reader | CLI/API ใช้ได้หลัง login, ตั้ง project และเก็บ credential ใน environment/credential store |

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
| Web framework | Next.js App Router + TypeScript | สร้าง full-stack web app |
| UI | Tailwind CSS + shadcn/ui | สร้าง design system และ component ที่แก้โค้ดได้เอง |
| Backend | Supabase | Postgres, Auth, Storage และ Realtime |
| Database access | Drizzle ORM | query และ schema แบบ type-safe |
| Terminal output | RTK | ลด output ที่ส่งเข้า context ของ AI |
| Repository context | Repomix | ส่งภาพรวม codebase เมื่อจำเป็น |
| Web-to-Markdown | Jina Reader | อ่านหน้า public แบบเร็ว |
| Advanced crawling | Crawl4AI | หน้า dynamic, หลายหน้า หรือ extraction ซับซ้อน |
| API testing | Bruno | เก็บ API collection เป็นไฟล์ใน Git |
| Containers | Docker Desktop / Rancher Desktop / Podman; OrbStack บน macOS | รัน Supabase local และ service dependencies |
| Deploy | Vercel | deploy Next.js และ Preview environments |
| Background work | Vercel Cron หรือ Inngest | เลือกตามความซับซ้อนของงาน ห้ามซ้อนโดยไม่มีเหตุผล |

## โครงสร้าง repository

```text
.
├── AGENTS.md                 # กติกาที่ AI ต้องอ่านก่อนทำงาน
├── SETUP.md                  # workflow มาตรฐานของ agent
├── toolchain.json            # manifest ที่คนและ AI อ่านได้
├── docs/
│   ├── ARCHITECTURE.md       # สถาปัตยกรรมและ decision rules
│   ├── INSTALLATION.md       # ติดตั้งแยกตามระบบปฏิบัติการ
│   └── AUDIT.md              # จุดผิด/เสี่ยงจากสเปกตั้งต้นและวิธีแก้
├── scripts/
│   ├── doctor.ps1            # ตรวจเครื่อง Windows แบบ read-only
│   ├── doctor.sh             # ตรวจเครื่อง macOS/Linux แบบ read-only
│   ├── bootstrap-project.ps1 # ลง template ในโปรเจกต์ Windows
│   └── bootstrap-project.sh  # ลง template ในโปรเจกต์ macOS/Linux
└── templates/                # ไฟล์ตั้งต้นที่ bootstrap นำไปใช้
```

## หลักการสำคัญ

- Pin dependency ในแต่ละโปรเจกต์ผ่าน lockfile; อย่าฝาก production build ไว้กับ global package
- `.env`, token, private key และข้อมูลลูกค้าห้ามเข้า Git
- ใช้ RTK กับคำสั่งที่รองรับ แต่เปิด raw output เมื่อกำลังวินิจฉัยสิ่งที่ถูกกรองหาย
- ใช้ Repomix เฉพาะเมื่อ context กว้างมีประโยชน์ และตรวจไฟล์ผลลัพธ์ก่อนส่งออกนอกเครื่อง
- Database migration history คือหลักฐานที่ deploy ได้จริง; schema TypeScript อย่างเดียวไม่ครอบคลุม RLS, policy, trigger และ extension
- ทุกงานต้องมี lint/typecheck/test/build ตามที่โปรเจกต์รองรับ และทดสอบ UI จริงเมื่อเปลี่ยน behavior

อ่าน [ผลตรวจสเปกและสิ่งที่แก้](docs/AUDIT.md) ก่อนนำ stack นี้ไปใช้จริง
