# Appka — Review Recommendations

Baseline: `dotnet build Appka.slnx` and `npm run build` both succeed with 0 errors / 0 warnings.
Nothing here is a compile break; these are correctness, configuration, and robustness gaps.

---

## 1. Enable TypeScript `strict` mode — **high**

**Where:** `Appka.Client/tsconfig.app.json`, `Appka.Client/tsconfig.node.json`

Neither config sets `"strict": true`. The standard Vite `react-ts` template does. With it off,
`strictNullChecks` and `noImplicitAny` are disabled, which means:

- The `HelloMessage | null` and `string | null` unions in `src/App.tsx` are declared but never
  enforced — TypeScript will happily let you dereference `hello.message` without a guard.
- `document.getElementById('root')!` in `src/main.tsx` is unchecked either way, but the non-null
  assertion is meaningless without `strictNullChecks`.

**Action:** add `"strict": true` to both configs.

## 2. Add `DOM.Iterable` to `lib` — **medium**

**Where:** `Appka.Client/tsconfig.app.json`

`"lib": ["ES2023", "DOM"]` omits `DOM.Iterable`. Iterating `FormData`, `URLSearchParams`,
`Headers`, or a `NodeList` with `for...of` / spread will fail to type-check.

**Action:** `"lib": ["ES2023", "DOM", "DOM.Iterable"]`.

## 3. CORS policy is dead configuration that would fail in production — **medium**

**Where:** `Appka.Server/Program.cs`

The policy hardcodes `http://localhost:5173` and is only registered inside
`if (app.Environment.IsDevelopment())`. But the client never makes a cross-origin request in dev —
`vite.config.ts` proxies `/api` to `http://localhost:5138`, so the browser sees same-origin calls.

The result is the worst of both worlds: the CORS code does nothing today, and the moment the app is
deployed (where the proxy no longer exists and the origin is not `localhost:5173`), there is no CORS
policy registered at all.

**Action:** drive allowed origins from configuration (`Cors:AllowedOrigins`) and register the
middleware whenever origins are configured, instead of gating it on the environment.

## 4. No HTTPS redirection outside development — **medium**

**Where:** `Appka.Server/Program.cs`

There is no `UseHttpsRedirection()`. The `https` launch profile exists but nothing uses it.

**Action:** call `app.UseHttpsRedirection()` for non-development environments only, so the
HTTP-only `http` launch profile used by the VS Code tasks keeps working.

## 5. Inconsistent date formatting and no null fallback — **low**

**Where:** `Appka.Client/src/App.tsx`

`hello.serverTime` is rendered through `toLocaleString()`, but the forecast `date` is dumped raw as
`2026-10-01`. Separately, `summary` is typed `string | null` and renders as an empty table cell when
null.

**Action:** format the forecast date with `toLocaleDateString()` and fall back to `—` for a null
summary.

---

## Checked and found to be fine (no action)

- **Linting** — `Appka.Client/.oxlintrc.json` exists and enables the `react`, `typescript`, and
  `oxc` plugins, including `react/rules-of-hooks`.
- **Repo hygiene** — the root `.gitignore` already excludes `bin/`, `obj/`, and `*.user`;
  `git ls-files` confirms no build artifacts or `.csproj.user` are tracked.
- **Port wiring** — the Vite proxy target (`:5138`) matches the `http` launch profile's
  `applicationUrl`, which matches the `server: watch` VS Code task.
- **Abort handling** — the `AbortController` cleanup in `App.tsx` correctly suppresses state updates
  after unmount, including React `StrictMode`'s double-effect in development.
- **Serialization contract** — the server's `DateOnly` / `TemperatureF` members line up with the
  client's `WeatherForecast` type under default camelCase JSON naming.
