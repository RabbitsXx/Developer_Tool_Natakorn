# 02 — Design System

## Purpose

Keep every screen visually coherent instead of letting the AI invent a new UI language per route.

## Rules

1. Reuse the project's existing tokens/components first.
2. If no design system exists, define the smallest useful token set before building multiple screens.
3. Use a restrained spacing scale such as 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
4. Limit typography roles to a small named hierarchy: display, H1, H2, H3, body, small, label.
5. Keep radius, shadows, border treatment, and elevation to a few repeatable levels.
6. Use semantic colors: brand, surface, text, muted, success, warning, danger. Never rely on color alone for meaning.
7. Use one icon family within a product unless an existing design system says otherwise.
8. Prefer established accessible primitives/components over custom recreations of dialogs, menus, selects, tabs, tooltips, and popovers.
9. Component variants must be intentional: primary, secondary, ghost, destructive; avoid one-off button styles.
10. Responsive behavior is part of the component contract, not a later patch.

## Visual consistency checks

- Same action = same component/variant.
- Same information level = same typography treatment.
- Same status = same semantic treatment.
- Repeated layouts share spacing and container rules.
- Cards are used only when grouping/boundaries help comprehension; do not wrap every section in a card.

## Anti-patterns

Avoid:
- random gradients/glows everywhere;
- many nearly identical grays or radii;
- custom SVG icons with inconsistent stroke/style when a shared icon library exists;
- arbitrary pixel values for every component;
- decorative complexity that reduces scanability;
- rebuilding primitives already provided by the selected component library.

## Output

When creating or revising a design system, record only the decisions that future UI work must reuse: token scale, typography roles, component variants, container/breakpoint rules, icon family, and accessibility constraints.
