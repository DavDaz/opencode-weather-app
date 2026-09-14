# 02-weather Agent Notes

## Scope

- Treat this directory as the project root. The parent Git repository is a course container with no workspace manifest or shared task runner.
- Run all install, build, and verification commands from `02-weather/`; do not initialize tooling in the parent directory.

## Toolchain

- Use Bun, not Node.js or npm. Keep `bun.lock` authoritative and install dependencies with `bun install --frozen-lockfile`.
- The package is already initialized. Do not follow the README's `bun init` setup step again.
- `package.json` defines `build`, `start`, and `dev` scripts for the `src/` entrypoint.

## Commands

- Run the current entrypoint: `bun run src/index.ts`
- Type-check: `bunx tsc --noEmit`
- Run one test file: `bun test tests/path/to/file.test.ts`
- Run the complete test suite with `bun test`.
- Puedes utilizar @bun-instructions.md para obtener instrucciones de bun.

## Current Shape

- `src/index.ts` is the runtime entrypoint for the interactive Weather CLI.
- `src/` is organized into `actions/`, `presentation/`, `storage/`, `types/`, `api/`, and `utils/`.
- Tests live in `tests/`, outside the `src/` runtime tree.
- Weather lookup requires two Open-Meteo calls: resolve a city through the geocoding API, then request current weather with the returned latitude and longitude.
- TypeScript uses bundler resolution, preserved ESM modules, Bun globals, and strict checking including `noUncheckedIndexedAccess` and `noFallthroughCasesInSwitch`.
- Bun loads `.env` automatically; do not add `dotenv`. Environment files are ignored and must not be committed.

## Verification

- For code changes, run `bunx tsc --noEmit`, then the narrowest relevant `bun test tests/<file>.test.ts`, then `bun run src/index.ts` for a CLI smoke test.
- Build with `bun run build`. There is no configured lint, formatter, CI, or codegen script. Do not claim those checks passed or introduce substitute commands without adding explicit project configuration.
