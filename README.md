# Appka

A minimal full-stack sample: a **.NET 10 minimal Web API** (`Appka.Server`) and a **React + TypeScript + Vite** client (`Appka.Client`).

## Structure

| Path | Description |
| --- | --- |
| `Appka.Server/` | .NET 10 minimal API, listens on `http://localhost:5138` |
| `Appka.Client/` | Vite + React 19 + TypeScript SPA, listens on `http://localhost:5173` |
| `Appka.slnx` | Solution file for the .NET project |

The Vite dev server proxies `/api/*` to the API (see [Appka.Client/vite.config.ts](Appka.Client/vite.config.ts)), so the browser only ever talks to one origin in development. CORS for `http://localhost:5173` is also enabled server-side for direct calls.

## Endpoints

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/hello` | Greeting plus current server time |
| GET | `/api/weatherforecast` | Five random forecast entries |
| GET | `/openapi/v1.json` | OpenAPI document (Development only) |

## Prerequisites

- .NET SDK 10.0+
- Node.js 20+ and npm

## Run it

Install client dependencies once:

```powershell
cd Appka.Client
npm install
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

Open http://localhost:5173 - the page fetches from the API and shows the greeting plus the forecast table.

In VS Code you can instead run the `dev: run all` task (`Ctrl+Shift+B`) to start both at once.

## Build

```powershell
dotnet build Appka.slnx
cd Appka.Client; npm run build
```
