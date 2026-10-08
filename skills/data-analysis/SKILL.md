---
name: data-analysis
description: Inspect, clean, analyze, and report data with reproducible calculations, explicit assumptions, and careful handling of sensitive records.
---

# Data analysis

Treat source data as evidence. Inspect file names, schemas, and a minimal safe sample before choosing a method; never infer a total from a convenient decoy or silently discard ambiguous rows.

## Working rules

- Preserve original inputs and make transformations reproducible.
- Normalize formats explicitly, including currency, dates, units, encodings, and missing values.
- Track duplicate handling, exclusions, and row counts.
- Validate calculations with an independent check, control total, or small hand-worked example.
- Separate observed values from assumptions and conclusions.
- Avoid exposing personal, confidential, or commercially sensitive rows in logs or reports.

## References

- [Data profiling](references/profiling.md)
- [Cleaning and calculations](references/cleaning-and-calculations.md)
- [Reproducible reporting](references/reporting.md)
