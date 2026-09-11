# 03 — Rollback

## Purpose

Make going back a rehearsed step decided before the deploy, so recovery is measured in minutes instead of the time it takes to improvise one.

## Rules

1. Decide the rollback triggers before deploying, in observable terms: error rate, failed critical path, data-integrity symptom, or user-visible breakage — with the threshold that counts as "wrong".
2. Write the rollback procedure for this specific release: the exact command or pipeline action, what happens to the database, and what happens to in-flight jobs or queues.
3. Make rollback compatibility a preflight item: if this release's migration cannot be reversed safely by the previous code, say so before deploying, and widen the blast radius decision to the user.
4. Prefer rollback over fix-forward when users are actively hurt and the cause is not yet understood. A fix needs a diagnosis; a rollback only needs a decision.
5. Fix-forward only when the cause is known, the fix is small, and rollback is more dangerous than the outage — and say why in the record.
6. During rollback, follow the migration safety rules from the `data-layer` pack: reversing schema changes is a migration too, and destructive reversal needs the same explicit authorization.
7. After a rollback, re-run the critical-path check on the restored version and confirm the symptom is actually gone.
8. Keep the rollback itself observable: announce it, watch the same health signals, and record when the system returned to its previous state.
9. A skipped or impossible rollback path is a finding, not a footnote: it goes into the post-release record with a proposal for making the next release reversible.

## Anti-patterns

Avoid:

- inventing the rollback plan while the incident is happening;
- a rollback that silently reverses code but leaves the new schema in place;
- pushing successive "small fixes" while users are staring at an error page;
- treating a rehearsed rollback as unnecessary ceremony for a small release;
- rolling back without confirming the symptom actually disappeared.

## Output

Record for the rollback:

- the trigger observed and the threshold it crossed;
- the exact action taken, by whom, at what time;
- the database and in-flight-work consequences, and how they were handled;
- the post-rollback verification result;
- what this release changes about the next one's rollback readiness.
