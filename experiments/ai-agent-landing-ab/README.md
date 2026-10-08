# AI-agent landing page design race

## Shared brief

“ออกแบบ Landing page ภาษาไทย UX/UI สวยและโดดเด่นเกี่ยวกับ AI coding agent สำหรับนักพัฒนา โดยสื่อสารในไม่กี่วินาทีว่า Developer Tool Natakorn ช่วยอะไรและจะเริ่มได้อย่างไร ทำหน้าแบบสั้นแต่สมบูรณ์ เน้นประโยชน์จริง CTA หลักไป GitHub ห้ามแต่งตัวเลขหรือความสามารถที่ตรวจไม่ได้ ให้ความสำคัญกับลำดับสายตา ความอ่านง่าย responsive และ accessibility ส่งเป็นไฟล์ HTML เดียวพร้อม CSS ในไฟล์เดียว ไม่ใช้ JavaScript หรือ dependency ภายนอก”

## Arms

- **A — no tools:** generated from the shared brief only; no repository, web, image, or shell access.
- **B — tools and applicable skills:** repository search/read, the full repository UI/UX pack (01/02/04 used during generation; 03/05 used in a read-only post-generation audit), `frontend-app-builder`, and `imagegen`. Sources for project copy included `README.md`, `SETUP.md`, `scripts/cli.mjs`, and the Git remote. Generated concept retained as `B/concept.png`.
- Each arm returned one HTML document; the evaluator saved the returned output in its matching folder. This is one pair, not a repeated-run or visitor experiment.

## Outcome checks

| Observable criterion | A | B |
|---|---|---|
| Thai page, single H1, inline CSS, no JavaScript or external dependency | Pass | Pass |
| Responsive CSS and visible keyboard focus | Pass | Pass |
| Reduced-motion preference | Pass | Pass |
| Names a real project benefit | Partial: “ทำงานกับ AI coding agent ให้เป็นระบบขึ้น” without explaining how | Pass: detects project context, prepares agent guidance/skills, and retains state for the next session |
| Gives a concrete first step | Partial: points to GitHub generally | Pass: `doctor`, then `init --dry-run` |
| CTA reaches the actual repository | Fail: points to `https://github.com` | Pass: points to `https://github.com/RabbitsXx/Developer_Tool_Natakorn` |
| Has a full-page visual direction | Pass: dark charcoal and lime, code-editor motif | Pass: white and blue, code window and process steps; concept generated |
| Grounding of product claims | Generic copy from the shared brief | Checked against README and setup/CLI docs |

## Reading the result

Tool and skill access improved **project-specific usefulness and onboarding** in this pair: B names verifiable functions, provides a safe first command sequence, and links to the right repository. A still creates a coherent art direction without tools, but cannot identify the concrete benefits or exact destination from the brief alone. This does not establish that B is always more visually appealing; only one generated pair was compared, with no participant ratings, click data, timing, or cost measurement.

## QA and limits

- Static inspection confirmed both documents have one H1, embedded CSS, no script tags, mobile breakpoints, focus styles, reduced-motion rules, and GitHub links.
- `B/concept.png` was viewed and compared with B's code direction. The generated concept is an image reference, not proof of the page's browser rendering.
- The post-generation UI audit found two copy risks in B: its decorative code panel can read like live status even though it is illustrative, and its footer says “Open source” although no project license file was found in the checkout. These were recorded without editing the one-shot output.
- Browser rendering, HTML validator, screen-reader testing, and mobile-device testing were not performed. No visual winner is claimed without those checks.

## Files

- [A — no tools](A/index.html)
- [B — tools and skills](B/index.html)
- [B — generated design concept](B/concept.png)
