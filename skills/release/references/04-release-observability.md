# 04 — Release Observability

## Purpose

Watch the release window with signals that reflect user experience, so a regression is caught by the team instead of by the users.

## Rules

1. Know before deploying which signals exist for this project — error tracking, traces, logs, platform metrics — and confirm they are receiving events from the new release. An observability stack that shows nothing is itself a finding.
2. Watch a defined window after the deploy, proportional to the release's risk, and state when that window ends.
3. Compare against the pre-release baseline, not against zero: error rate, latency, and traffic shape all have a normal level.
4. Use the observability rules from the kit: production observability is a capability the project selected (Sentry, OpenTelemetry, or its existing standard); telemetry stays free of secrets and unnecessary personal data.
5. Tie observations to the release identity — version or build marker — so a spike can be attributed to this release rather than to traffic or a third party.
6. Verify user-visible behavior directly at least once: load the real page or flow from outside the deploy pipeline, as a user would.
7. Distinguish signal classes before reacting: new error types, elevated rates of known errors, latency shifts, and failed background jobs each point at different causes.
8. When the project has no production observability selected, say so in the release record and substitute what exists: platform logs, manual smoke checks, and a named person watching.
9. Escalate on sustained degradation, not on single events, and use the rollback triggers from `03-rollback` as the line where watching becomes acting.

## Anti-patterns

Avoid:

- staring at a dashboard after the fact that was never confirmed to receive data;
- treating a green health check endpoint as proof that critical paths work;
- ignoring a new error type because its volume is "still low";
- watching logs that contain secrets or personal data in the name of vigilance;
- declaring the release healthy because no one complained during the deploy.

## Output

Record for the release window:

- the signals watched, the baseline, and the observed values;
- the release identity the observations were attributed to;
- the user-visible verification performed;
- anything anomalous, with its classification and action;
- when the watch window closed and on whose authority.
