# Tool usefulness A/B: landing page

## Question

Does repository-reading access make the generated page more useful than the same model asked to work without tools?

## Controlled setup

- Same task prompt and HTML requirements for both variants.
- A had no tool access and could not inspect project files.
- B could use read-only repository search and file reading. It did not edit the repository or browse the web.
- Both outputs were returned as one HTML document. This is one paired run; elapsed time, token cost, and repeated-run variation were not measured.

## Results

| Check | A: no tools | B: repo tools |
|---|---|---|
| Thai copy; one H1; inline CSS; no JavaScript/dependencies | Pass | Pass |
| At most three content sections | Pass (1) | Pass (3) |
| CTA points to project GitHub | Pass | Pass |
| Says what this toolkit specifically does | Fail: only says it is a developer tool | Pass: AI coding agent context, CLI, setup guidance/skills, saved state |
| Gives a concrete first step | Partial: open GitHub only | Pass: doctor, then init dry-run |
| Project claims supported by repository evidence | Not applicable; generic | Pass on checked claims: README documents stack/lockfile detection, agent guidance/skills, saved project state, doctor, init dry-run |
| Tool use | 0 | B used read-only repo searches and file reads, including README, package manifest, CLI entry point, setup guide, and related docs; exact call count was not captured |

## What the paired output shows

For this task, repository access improved **specificity and actionability**: a reader can identify the tool's audience and purpose and see a safe first command. It did not establish that tools always improve page quality, reduce revision rounds, or save time. The test has one pair and did not measure visual rendering, user comprehension, click behavior, or cost. A was allowed to link to the known project GitHub URL as part of the task prompt; that does not count as repository discovery.

## Output files

- [A: no repository tools](A/index.html)
- [B: repository tools](B/index.html)

## Provenance

B's agent reported checking `README.md`, `package.json`, `bin/natakorn.mjs`, `SETUP.md`, `START_PROMPT.md`, `docs/`, and `.ai-kit/project.json` availability. It confirmed the repository GitHub URL and the documented `doctor` / `init --dry-run` workflow. The repository was already dirty from prior work; this experiment only adds its two output files and this report.
