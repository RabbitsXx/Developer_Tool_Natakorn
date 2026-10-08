# Safe file operations

- Read only the paths needed for the task, and do not print raw secrets or customer records.
- Write to a temporary sibling and rename when partial output would be harmful.
- Preserve source files unless transformation in place is an explicit requirement.
- Refuse path traversal and unexpected symlinks when processing user-selected directories.
- Use an explicit overwrite option or report that a destination already exists.
