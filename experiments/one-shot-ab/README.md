# One-shot prompt A/B — run 01

## Question

Does adding audience, repository facts, concrete page content, and acceptance checks make the first landing-page attempt more useful than a short generic request?

## Variants

- **A — short prompt:** “Create a concise, modern landing page for Developer Tool Natakorn, an AI coding toolkit. Make it clear and polished.”
- **B — one-shot brief:** Help Thai-speaking developers and AI coding agents joining an existing project understand how the toolkit inspects repository context, preserves existing work, and verifies changes. Keep the page to three sections, ground claims in the repository, include a working GitHub CTA, use responsive and accessible markup, and avoid promises about guaranteed one-shot success or time savings.

Both variants used the same repository, agent environment, and implementation envelope: one self-contained HTML file, no new dependencies, a short three-section page, working anchors, and a CTA. A and B were generated independently in parallel.

## First-pass observations

| Check | A | B |
|---|---|---|
| Delivered after one generation, without a repair prompt | Pass | Pass |
| One H1 and three page sections | Pass | Pass |
| Three concrete workflow steps | Pass | Pass |
| Product context from repository | Present, broad | More explicit, including preservation and verification principles |
| Language fit for this Thai request | English | Mostly Thai, with a few English labels |
| Responsive breakpoints and reduced-motion handling in source | Present | Present |
| Skip link, visible keyboard focus, valid in-page anchors | Present; 5 anchors resolve | Present; 5 anchors resolve |
| Browser visual review | Not completed | Not completed |

**Early read:** both prompts produced complete, navigable first-pass pages. B made the audience and repository-specific promises clearer and matched the request language more closely. A is concise and explains the toolkit in broad terms. This run does not yet show that B reduces repair cycles: neither page received a follow-up correction, and one example per variant is too small for a reliable conclusion.

## Human evaluation

The user reviewed the alternatives and judged **A better than B overall**. This is the primary preference result for this run; the exact dimension behind the preference was not specified, so the experiment does not assign a cause.

Both variants ran in the same agent environment with the same tool availability. The prompt treatment differed. The result supports a practical lesson for this task: adding more detail did not make B the preferred landing page. It does not test whether giving B more tools helps or hurts.

## Likely causes from the prompts and source

These are evidence-based hypotheses, not confirmed visual findings:

1. **B turned the production method into page content.** Its third section explains what “One shot” means and lists internal operating principles. Those may belong in the toolkit documentation, but they compete with the visitor's simpler question: what does the toolkit help me do?
2. **B carries more copy and language switching.** It includes several proof bullets and English eyebrow labels inside an otherwise Thai page. A keeps one language and a direct promise, then uses a terminal example and three steps to support it.
3. **B's brief specified evidence, but not editorial priority.** The agent included many true capabilities without being told which one should dominate. A's shorter request left more room for a focused product story.

This suggests a useful refinement to the one-shot method: keep acceptance and safety constraints in the implementation brief, but do not turn them into visible copy unless the visitor needs them. The task brief should reduce guesswork without dictating that every fact become a section.

## Limitations

- This is a single qualitative comparison, not a benchmark or a blind review. Both agents used the same updated repository instructions, so it compares a short task prompt with a more explicit task brief under those shared instructions; it does not isolate the effect of the instruction-file change itself.
- Static source checks passed, but rendered layout, contrast, and real-device behavior were not inspected. The in-app browser security policy blocked the `file://` page, and its response prohibited using another route to render that same local page.
- Next useful evidence: have a human open A and B locally, choose the stronger direction, then repeat the comparison on several similar tasks and record first-pass acceptance plus correction count.

## Files

- [Variant A](A/index.html)
- [Variant B](B/index.html)
