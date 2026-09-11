# 02 — Deploy

## Purpose

Execute the deployment as a deliberate, observable operation rather than pressing a button and hoping.

## Rules

1. Deploy with the project's own pipeline and documented commands. A release must be reproducible by the next person without this session's memory.
2. Follow the migration ordering: deploy code that tolerates the new schema, run migrations against the named environment, then deploy the code that relies on them. Never let one deploy carry both sides of a breaking change.
3. Announce the release window to the team when the project has other contributors, and avoid releasing unrelated work bundled into one change.
4. Deploy during the window the project chooses for risk; if none exists, prefer a time when the team can watch and react.
5. Observe the deploy as it happens: build output, deployment logs, and the platform's health signals. A silent deploy is an unaudited deploy.
6. Verify the release identity after it lands — the deployed commit, build ID, or version marker — so what is running is known, not assumed.
7. Exercise one critical path on the new release in production or a production-equivalent preview before calling it live: sign-in, a core flow, the changed feature.
8. Feature-flag risky behavior when the project uses flags, and default flags to the safe state on first deploy.
9. If any gate fails mid-deploy, stop and switch to the `03-rollback` reference instead of pushing a fix forward blindly.
10. Keep credentials and tokens out of deploy logs, and never echo secrets in deploy commands.

## Anti-patterns

Avoid:

- deploying on a Friday evening with no one watching;
- one deploy mixing schema change, feature change, and infrastructure change;
- assuming the new version is live because the pipeline succeeded;
- fixing forward with a second deploy before understanding the first failure;
- skipping the production smoke test because the pipeline ran the test suite.

## Output

Record during the deploy:

- the command or pipeline run used, with its identifier;
- the confirmed release identity running after the deploy;
- migration execution results in order;
- the critical-path check performed on the live release, with its result;
- any gate that failed and the action taken.
