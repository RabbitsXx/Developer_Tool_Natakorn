# Run guide

## Reproduce artifacts

- Copy required local environment files from the main checkout; never copy secret values into this document.
- Install dependencies with the repository's package manager using its lockfile.
- Run required database setup or code generation commands documented by the project.

## Run the server

- Start command: `<!-- e.g. npm run dev -->`
- Default URL: `<!-- e.g. http://localhost:3000 -->`
- Port override: `<!-- command or environment variable -->`
- Log file: `<!-- path -->`

## Verify

- Health route: `<!-- URL or command -->`
- Lint/typecheck/test/build: `<!-- commands -->`
- Browser E2E: `<!-- Playwright command / manual browser procedure / none -->`
- Primary user flow: `<!-- interaction to test -->`
- Expected result: `<!-- observable behavior -->`
- Browser console/network expectation: `<!-- e.g. no unexpected errors -->`

For user-facing changes, a successful build is not sufficient evidence by itself. Verify the real route; use Playwright when the project has it configured.
