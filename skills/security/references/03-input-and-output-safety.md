# 03 — Input and output safety

## Purpose

Reduce injection, SSRF, traversal, XSS, unsafe deserialization, and resource-exhaustion risk at boundaries.

## Rules

1. Validate type, size, range, encoding, and allowed values before business logic.
2. Parameterize queries and use context-appropriate output encoding; do not build executable strings from input.
3. Constrain outbound URLs, file paths, redirects, and uploads with allowlists and resource limits.
4. Return safe error details and avoid reflecting secrets or internal stack traces.

## Anti-patterns

Avoid:

- “sanitize everything” without identifying the sink;
- accepting arbitrary URLs, sort expressions, file paths, or content types;
- relying on a client-side validator as the only boundary.

## Output

Record the input contract, sink control, limits, and representative malformed inputs.
