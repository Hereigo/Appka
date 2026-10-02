# Appka

A minimal full-stack sample: a **.NET 10 minimal Web API** (`Appka.Server`) and a **React + TypeScript + Vite** client (`Appka.Client`).

## Structure

| Path | Description |
| --- | --- |
| `Appka.Server/` | .NET 10 minimal API, listens on `http://localhost:5138` |
| `Appka.Client/` | Vite + React 19 + TypeScript SPA, listens on `http://localhost:5173` |
| `Appka.slnx` | Solution file for the .NET project |

The Vite dev server proxies `/api/*` to the API (see [Appka.Client/vite.config.ts](Appka.Client/vite.config.ts)), so the browser only ever talks to one origin in development. Direct cross-origin access is disabled unless origins are configured in `Cors:AllowedOrigins`. In production, ASP.NET Core serves both the built React app and `/api` from the same origin.

## Endpoints

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/hello` | Anonymous | Greeting plus current server time |
| GET | `/api/notes` | Bearer token | Lists notes ordered by ID |
| POST | `/api/notes` | Bearer token | Creates a note when `text` contains at least two characters |
| PUT | `/api/notes/{id}` | Bearer token | Updates a note's `text` and `isArchived`; text must contain at least two characters |
| DELETE | `/api/notes/{id}` | Bearer token | Deletes a note |
| GET | `/api/weatherforecast` | Anonymous | Five random forecast entries |
| GET | `/openapi/v1.json` | Anonymous | OpenAPI document (Development only) |

Notes endpoints require a valid cidaas access token and return `401` without one. See [Authentication](#authentication-cidaas).

Create a note with `POST /api/notes` and a JSON body such as `{"text":"Remember this"}`. The server generates its timestamp-based ID.
Update a note with `PUT /api/notes/{id}` and a JSON body such as `{"text":"Remember this","isArchived":false}`. Update and delete return `404` when the ID is not found.

## Prerequisites

- .NET SDK 10.0+
- Node.js 20.19+ or 22.12+ and npm (for development and publishing, not required on the production host)

## Run it

### Visual Studio 2026

Open `Appka.slnx`, set **Appka.Server** as the startup project, select the **http** or **https** launch profile, and press **F5** or **Ctrl+F5**. Install Node.js before starting Visual Studio so npm is available to it.

The first Debug build restores missing client dependencies with `npm ci`. The development launch profile enables `Microsoft.AspNetCore.SpaProxy`, which starts `npm run dev` and redirects the browser from the backend root to http://localhost:5173 when Vite is ready. Only the server needs to be a startup project; an already running Vite instance is reused. API requests still go to http://localhost:5138 through Vite.

### Command Line

Starting the server with a development launch profile also starts Vite:

```powershell
dotnet run --project Appka.Server --launch-profile http
```

Open http://localhost:5138 to be redirected to the client. To run the two processes manually instead, install client dependencies once:

```powershell
cd Appka.Client
npm ci
```

Then start both apps in two terminals.

Terminal 1 - API:

```powershell
cd Appka.Server
dotnet run --launch-profile http
```

Terminal 2 - client:

```powershell
cd Appka.Client
npm run dev
```

Open http://localhost:5173 for the home page. The shared header lets you switch between **Home**, **Notes**, and **Contacts**. The home page also has an **Open notes** link to the existing greeting and notes page. Direct links are http://localhost:5173/#/notes and http://localhost:5173/#/contacts; Contacts contains placeholder Lorem ipsum text.

## Database

The server uses Entity Framework Core with SQLite through `NotesDbContext`. The default connection string stores `appka.db` in the server project directory. Install the matching EF CLI if needed, then apply the schema from `Appka.Server`:

```powershell
dotnet tool install --global dotnet-ef --version 10.0.12
cd Appka.Server
# dotnet ef migrations add InitialCreate
dotnet ef database update
```

For later model changes, add a new migration and apply it with `dotnet ef database update`.

In VS Code you can instead run the `dev: run all` task (`Ctrl+Shift+B`) to start both at once.

## Authentication (cidaas)

The SPA is a public OIDC client using Authorization Code + PKCE (`react-oidc-context`). The API is a
resource server that validates cidaas-issued JWTs. The server refuses to start until `Cidaas:Authority`
and `Cidaas:Audience` are set, so notes are never served unprotected. See [CIDAAS_HowTo.md](CIDAAS_HowTo.md)
for background.

### URLs to register in the cidaas Admin UI

Register the SPA as a `SINGLE_PAGE` app (no client secret) with `authorization_code` + `refresh_token`,
response type `code`, and PKCE `S256`. Redirect URIs are exact-match, so register every host you actually
open the client on.

| Field | Development value | Production value |
| --- | --- | --- |
| Redirect URLs | `http://localhost:5173/callback` | `https://your-app-host/callback` |
| Post-logout redirect URLs | `http://localhost:5173/` | `https://your-app-host/` |
| Allowed web origins (CORS) | `http://localhost:5173` | `https://your-app-host` |

If you browse the client at `http://127.0.0.1:5173` instead of `localhost`, register the `127.0.0.1`
variants as well - the two hosts are different origins to cidaas. The API (`http://localhost:5138`) is
never redirected to by the browser, so it needs no redirect URLs; in development the Vite dev server
proxies `/api` to it, so API calls stay same-origin.

### Client configuration

```powershell
cd Appka.Client
Copy-Item .env.example .env.local
```

Set `Authority` (for example `https://EXAMPLE-TENANT.cidaas.eu`) and `Audience` to
the SPA client ID, then restart `npm run dev`. `.env.local` is git-ignored. Optionally override
`VITE_CIDAAS_SCOPE` to request your API scopes. Tokens are kept in `sessionStorage`, not `localStorage`.

### Server configuration

Keep tenant values out of source control by using user secrets:

```powershell
cd Appka.Server
dotnet user-secrets init
dotnet user-secrets set "Cidaas:Authority" "https://EXAMPLE-TENANT.cidaas.eu"
dotnet user-secrets set "Cidaas:Audience" "your-api-client-id"
```

`Audience` must match the `aud` claim of the access token the SPA receives. Decode a real token and
compare before going further; a mismatch shows up as `401` on a token that otherwise looks valid.

In the client, **Home** and **Contacts** stay public. Opening **Notes** redirects to the cidaas hosted
login page, and the header shows the signed-in email plus a **Log out** button.

## Build

```powershell
dotnet build Appka.slnx
cd Appka.Client; npm run build
```

## Publish and Host

Publish **Appka.Server** from Visual Studio, or run this from the solution directory:

```powershell
dotnet publish Appka.Server/Appka.Server.csproj -c Release -o ./publish
```

Publishing runs `npm ci` and `npm run build`, then includes the client output under `publish/wwwroot`. Deploy the **entire publish directory**, not just the server DLL. ASP.NET Core serves the React app at `/`, static assets from `wwwroot`, and the API at `/api`. Client routes fall back to `index.html`; unknown API routes remain `404` responses.

The host needs support for **ASP.NET Core 10** (the .NET 10 Hosting Bundle on IIS for a framework-dependent deployment), not a separate Node.js or Vite server. Use the **Production** environment and do not set the development `ASPNETCORE_HOSTINGSTARTUPASSEMBLIES` variable on the host. For IIS, deploy to an ASP.NET Core-enabled site; for Linux, run the published server behind your host's HTTPS reverse proxy. A host that only supports classic ASP.NET Framework cannot run this application.

Configure `ConnectionStrings__Appka` on the host to use a persistent, writable SQLite path, for example `Data Source=/var/lib/appka/appka.db` on Linux. Apply the existing EF migrations to that database before using Notes. The application does not apply migrations automatically. Keep the database outside the publish directory so redeployments do not replace it, and grant the application identity write access to its directory.

To test the published output locally:

```powershell
cd publish
$env:ASPNETCORE_ENVIRONMENT = 'Production'
dotnet Appka.Server.dll --urls http://localhost:5138
```

Open http://localhost:5138. On a real host, configure HTTPS and any required reverse-proxy forwarding settings; production enables HTTPS redirection.
