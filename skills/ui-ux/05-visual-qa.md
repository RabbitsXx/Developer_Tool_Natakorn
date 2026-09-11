# 05 — Visual QA

## Purpose

Catch the gap between “code compiles” and “the interface actually looks and works well.”

## Required loop for substantial UI changes

1. Start the real app/preview.
2. Open the changed route in a browser.
3. Capture or inspect desktop, tablet/intermediate, and mobile states.
4. Exercise the primary interaction, not just the initial screenshot.
5. Inspect browser console/runtime errors.
6. Run automated accessibility checks when configured.
7. Compare against the existing design language and UX intent.
8. Fix issues and re-run the same evidence path.

## Inspect visually

- information hierarchy;
- alignment and spacing rhythm;
- inconsistent component variants;
- text wrapping/clipping;
- overflow and viewport fit;
- contrast and readability;
- empty/loading/error states;
- icon consistency;
- accidental duplicate controls;
- overly dense or overly sparse layouts;
- whether the primary action is obvious;
- whether decorative UI competes with important content.

## Browser behavior

Verify the actual critical path: navigation, form input, submit, modal/dialog behavior, keyboard focus, responsive controls, success/error response, and any permission boundary touched by the change.

When Playwright is configured, prefer repeatable tests/screenshots for critical journeys. When `@axe-core/playwright` is configured, run accessibility scans for automatically detectable issues. Automated accessibility checks do not replace manual judgment.

## Visual-regression policy

Use screenshot baselines only for stable, high-value surfaces. Do not create brittle snapshots for highly dynamic timestamps, random data, animation, or content that changes every run unless those regions are normalized/masked.

## Completion evidence

A UI change can be called complete only when the relevant code checks pass and the real browser route has been inspected or tested. Report the exact viewport/journey checked and any intentionally unverified states.
