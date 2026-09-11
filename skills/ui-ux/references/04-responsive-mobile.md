# 04 — Responsive & Mobile

## Purpose

Make responsive behavior intentional instead of shrinking a desktop layout until it barely fits.

## Rules

1. Define the mobile task flow, not just the mobile CSS.
2. Prioritize the primary action and essential information on small screens; move secondary/advanced details behind progressive disclosure when appropriate.
3. Avoid horizontal scrolling for core content unless the interaction truly requires a wide canvas/table.
4. Tables need an intentional small-screen strategy: stacked rows, prioritized columns, horizontal container, or alternate summary view.
5. Navigation must remain reachable and understandable without consuming most of the viewport.
6. Touch targets must be comfortably tappable and separated.
7. Do not rely on hover for essential information or actions.
8. Account for long labels, translated text, validation messages, dynamic counts, and empty states.
9. Images/media should preserve useful framing and not force layout shift or clipping.
10. Test at least one narrow mobile, one tablet/intermediate width, and one desktop width for substantial UI work.

## Responsive QA

Check:
- no clipped text/buttons;
- no accidental horizontal overflow;
- headings wrap without destroying hierarchy;
- dialogs/drawers fit viewport height;
- sticky/fixed elements do not cover primary controls;
- forms remain usable with the on-screen keyboard conceptually in mind;
- content order still matches user priority;
- empty/loading/error states fit mobile too.

## Anti-patterns

Avoid:
- desktop sidebar compressed into a tiny unusable column;
- six equal dashboard cards stacked before the user sees the main task;
- hiding critical actions just to make the mobile screenshot look clean;
- setting fixed widths/heights without content-driven reason;
- creating a separate mobile product experience unless the user journey genuinely differs.
