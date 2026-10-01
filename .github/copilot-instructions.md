# Appka project instructions

Apply these instructions to work in this workspace. Follow the user's request first, keep changes focused, and do not add endpoints, persistence, dependencies, or UI behavior unless the task calls for them.

## Project and versions

- `Appka.Server` is an ASP.NET Core minimal API targeting `net10.0`, with nullable reference types and implicit usings enabled. It uses EF Core with SQLite. Check `Appka.Server/Appka.Server.csproj` for current server package versions; keep EF Core package versions aligned.
- `Appka.Client` is a React + TypeScript SPA built with Vite. `Appka.Client/package.json` currently declares React/React DOM `^19.2.8`, TypeScript `~6.0.2`, Vite `^8.3.0`, `@vitejs/plugin-react` `^6.1.1`, and oxlint `^1.81.0`. Read that manifest and `Appka.Client/package-lock.json` before choosing APIs or changing dependencies; the lockfile determines installed versions. Do not upgrade packages or target frameworks as incidental work.
- Read `README.md` for setup and project structure. Treat source files and manifests as the authority if documentation has drifted.

## Architecture and conventions

- The API routes live under `/api` in `Appka.Server/Program.cs`. The Vite dev server proxies `/api` to the HTTP API at `http://localhost:5138`; the client runs at `http://localhost:5173`. Keep client requests relative to `/api` in development. CORS origins come from `Cors:AllowedOrigins` configuration when needed for direct cross-origin access.
- SQLite persistence uses `NotesDbContext`, registered in `Program.cs` with the `ConnectionStrings:Appka` connection string. For entity or schema changes, create and commit an EF migration; use migrations rather than `EnsureCreated`. Run EF CLI commands from `Appka.Server`.
- Follow existing C# and TypeScript style. Keep C# nullability correct, initialize non-null properties, and use the client's strict TypeScript types. Keep API response shapes and client types aligned when changing contracts.
- Prefer the smallest maintainable change in the owning project. Reuse established patterns, validate inputs at boundaries, handle errors explicitly, and avoid introducing secrets into source or logs. Add tests appropriate to changed behavior when a test setup exists; do not invent infrastructure for a trivial change.

## AI-assisted implementation

- Before changing code, inspect the owning implementation and relevant callers, types, and tests. Follow the established patterns and preserve existing contracts unless the request requires changing them.
- Make complete, production-ready changes that address the root cause. Do not leave placeholder implementations, silently swallow errors, or claim behavior that has not been implemented.
- Keep changes limited to the request. Avoid unrelated refactors, new dependencies, endpoints, persistence, or behavior.
- For behavior changes, add or update focused tests when a test setup exists. Run the relevant checks below and report what passed and what could not be verified.

## Validation

- Server: run `dotnet build Appka.slnx` for server changes. For EF model or schema changes, also apply migrations with `dotnet ef database update` from `Appka.Server`.
- Client: run `npm run lint` and `npm run build` from `Appka.Client` for client changes. Use `npm ci` to restore dependencies from the lockfile when needed.
- Run relevant tests if present, report checks actually run, and call out any checks that could not be run. Update documentation when behavior or setup changes.