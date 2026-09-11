# 05 — Post-Release

## Purpose

Convert the release into evidence and follow-ups, so the next release starts smarter and this one's loose ends cannot hide.

## Rules

1. Confirm the release is healthy after the watch window: error rates back to baseline, critical paths verified, no unresolved new error types.
2. Reconcile what shipped against what was planned: every planned item is either in the release, explicitly deferred, or a finding.
3. Close the loop on migrations: the schema state in production matches the deployed code, and any deferred backfill or cleanup has an owner and a plan.
4. Turn every incident, rollback, or near-miss from this release into a tracked follow-up with an owner — including rollback-readiness gaps found in `03-rollback`.
5. Update the project's own records: run notes, the project context, or the changelog, so the next session does not rediscover this release from scratch.
6. Capture what the release changed about the process itself: a gate to add, a check to automate, a signal that was missing.
7. Verify cost or resource signals if the release changed them — a new integration, a new scheduled job, a bigger payload — before the next billing surprise.
8. Announce completion to the team when there is one, with the same facts recorded here, not with "it's live".
9. Do not declare "production-ready" from this release alone. The kit's rule holds: readiness claims need project-specific evidence, and one healthy release is one data point.

## Anti-patterns

Avoid:

- closing the release the moment the deploy succeeds;
- leaving deferred migrations or backfills without an owner;
- repeating the same release-day surprise twice because the lesson lived only in chat;
- forgetting feature flags that should now be removed or flipped;
- writing "production-ready" with no measurement behind it.

## Output

Record to close the release:

- the health confirmation after the watch window, with values;
- shipped versus planned, with deferrals and owners;
- migration and schema state in production;
- follow-ups created, each with an owner;
- process changes proposed for the next release.
