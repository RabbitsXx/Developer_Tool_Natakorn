# 04 — Device quality

## Purpose

Verify mobile behavior across device constraints, accessibility needs, and real interaction conditions.

## Rules

1. Test representative OS versions, screen sizes, input methods, network conditions, and reduced-motion/font-scale settings.
2. Measure startup, navigation, scrolling, memory-sensitive screens, and battery-sensitive work where relevant.
3. Use semantic labels, dynamic type, touch targets, contrast, focus/order, and screen-reader behavior as applicable.

## Anti-patterns

Avoid:

- testing only a developer simulator configuration;
- using fixed dimensions that fail on text scaling or small screens;
- dismissing a platform-specific failure as “not reproducible” without environment details.

## Output

Record device/OS/build, journey, performance/accessibility observations, and unresolved differences.
