# Installation guide

Install workstation tools globally only when they are shared across projects. Keep application dependencies project-local and committed through a lockfile.

## Required baseline

- Git
- Node.js 22 or newer for current Repomix requirements
- One package manager selected per project (`npm`, `pnpm`, `yarn`, or `bun`)
- RTK is recommended for AI-driven terminal sessions

Run the doctor first:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\doctor.ps1
```

```bash
bash scripts/doctor.sh
```

## RTK

First verify that the installed `rtk` is Rust Token Killer:

```text
rtk --version
rtk gain
```

### Windows

Download `rtk-x86_64-pc-windows-msvc.zip` and `checksums.txt` from the official GitHub release, verify the SHA-256 checksum, extract `rtk.exe` into a user-local directory, and add that directory to `PATH`.

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```

or:

```bash
brew install rtk-ai/tap/rtk
```

Cargo is an advanced fallback. Do not use bare `cargo install rtk` because another crate has the same name:

```bash
cargo install --git https://github.com/rtk-ai/rtk --branch master rtk
```

After installation, initialize the integration supported by your AI agent. Verify the generated instruction/hook files before committing anything project-specific.

## Repomix

Prefer on-demand use so the tool does not silently drift as a global dependency:

```text
npx repomix@latest
```

For reproducible automation, add a pinned dev dependency to the target project and commit its lockfile.

Review `repomix.config.json`, `.repomixignore`, and the generated output before sending it to any model or external service.

## Bruno

- Windows: `winget install Bruno.Bruno`
- macOS: `brew install bruno`
- Linux: use the official `.deb`, `.rpm`, AppImage, Flatpak, Snap, or documented APT repository.

Store Bruno collections in the application repository, but keep environment secrets outside Git.

## Container runtime

Choose one runtime only:

- Windows: Docker Desktop, Rancher Desktop, or Podman.
- macOS: OrbStack, Docker Desktop, Rancher Desktop, or Podman.
- Linux: Docker Engine/Desktop or Podman.

Verify before starting Supabase local:

```text
docker version
docker compose version
```

## Project-local web stack

Create Next.js first, then add only capabilities required by the product:

```text
npx create-next-app@latest my-app --ts --eslint --tailwind --src-dir --app --import-alias "@/*"
```

Inside the project, install and configure Supabase, Drizzle, shadcn/ui, and Inngest from their current official documentation. Commit the package-manager lockfile and database migrations.

Do not install Vercel, Supabase, Drizzle, Inngest, or Crawl4AI globally merely because they appear in the reference stack.

## Crawl4AI and Jina Reader

Jina Reader needs no local installation for basic use; prepend `https://r.jina.ai/` to an authorized public URL.

Install Crawl4AI in a project-specific Python virtual environment because its browser and model dependencies are substantial:

```text
python -m venv .venv
python -m pip install crawl4ai
python -m playwright install
```

The current Crawl4AI package declares Python 3.10 or newer. Recheck the package metadata when setting up a future machine because browser and model dependencies change independently.
