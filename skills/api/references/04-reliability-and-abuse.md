# 04 — Reliability and Abuse Resistance

## Purpose

Keep the API available and unabusable under real traffic, without making the common request path fragile.

## Rules

1. Rate limit per identity and per origin on authentication, search, export, and other expensive routes. Answer `429` with a retry hint.
2. Keep the handler's internal timeout budget shorter than the caller's, so the server fails before the client gives up.
3. Bound concurrency toward every downstream dependency, and apply backpressure instead of queueing without limit.
4. Cap request and response sizes, and reject oversized input early.
5. Be explicit about caching: what is public vs private, what can be revalidated (`ETag`/`If-None-Match`), and exactly what invalidates an entry. Never cache private data in a shared cache.
6. Webhooks: verify the signature, enforce a timestamp tolerance, protect against replay, record the event identifier, and acknowledge quickly before doing slow work.
7. Long-running work belongs outside the request. Follow the kit's single-trigger rule: a simple idempotent scheduled endpoint uses the platform scheduler (for example Vercel Cron, which runs on production deployments), while durable multi-step work with retries, waits, or fan-out uses a workflow engine (for example Inngest). Never execute the same business job from both.
8. Protect scheduled and internal endpoints: authenticate them, make their handlers idempotent, and assume they can be triggered twice.
9. Make failure observable: structured logs with the request identifier, timing, and outcome class; error-rate and latency signals; alerts on sustained failure rather than on single events.
10. Keep telemetry free of secrets, tokens, and unnecessary personal data, and provide health/readiness endpoints that do not leak configuration.

## Anti-patterns

Avoid:

- unlimited authentication attempts or unbounded export endpoints;
- doing minutes of work inside a request that a client will time out;
- retries without idempotency, which turn one failure into duplicate effects;
- accepting an unbounded `limit`/`page` from the client;
- treating a successful deployment as proof that the endpoint is safe under load;
- wiring both a scheduler and a workflow engine to the same job.

## Output

Record for the change:

- the limits that apply (rate, size, timeout, concurrency) and the response when each is exceeded;
- the caching decision and its invalidation rule, when caching is involved;
- the job boundary chosen for asynchronous work, and why the other option was rejected;
- what an operator would see when this endpoint fails.
