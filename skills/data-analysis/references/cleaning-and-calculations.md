# Cleaning and calculations

- Define the key used for duplicate detection and whether the first, last, or aggregated record wins.
- Parse amounts with locale-aware rules; reject or flag ambiguous formats instead of guessing.
- Convert dates only after identifying the calendar and timezone; preserve the original value when useful.
- Keep transformations in code or a clear formula trail so another person can reproduce them.
- Compare totals before and after each exclusion or normalization step.
