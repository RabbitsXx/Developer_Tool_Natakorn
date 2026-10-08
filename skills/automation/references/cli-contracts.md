# CLI contracts

- Keep positional arguments and flags small and consistent with neighboring tools.
- Support `--help` and return nonzero for invalid input or failed work.
- Write machine-readable output to stdout only when the interface promises it; send diagnostics to stderr.
- State whether paths are resolved from the current directory, an explicit option, or the script location.
- Avoid silently guessing between multiple input files or overwriting outputs.
