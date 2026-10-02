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
| GET | `/api/notes` | Lists notes ordered by ID |
| POST | `/api/notes` | Creates a note when `text` contains at least two characters |
| PUT | `/api/notes/{id}` | Updates a note's `text` and `isArchived`; text must contain at least two characters |
| DELETE | `/api/notes/{id}` | Deletes a note |
| GET | `/api/weatherforecast` | Five random forecast entries |
| GET | `/openapi/v1.json` | OpenAPI document (Development only) |

Create a note with `POST /api/notes` and a JSON body such as `{"text":"Remember this"}`. The server generates its timestamp-based ID.
Update a note with `PUT /api/notes/{id}` and a JSON body such as `{"text":"Remember this","isArchived":false}`. Update and delete return `404` when the ID is not found.

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

Open http://localhost:5173 for the home page. The shared header lets you switch between **Home**, **Notes**, and **Contacts**. The home page also has an **Open notes** link to the existing greeting and notes page. Direct links are http://localhost:5173/#/notes and http://localhost:5173/#/contacts; Contacts contains placeholder Lorem ipsum text.

## Database

The server uses Entity Framework Core with SQLite through `NotesDbContext`. The default connection string stores `appka.db` in the server project directory. Install the matching EF CLI if needed, then apply the schema from `Appka.Server`:

```powershell
dotnet tool install --global dotnet-ef --version 10.0.12
cd Appka.Server
dotnet ef migrations add InitialCreate
dotnet ef database update
```

For later model changes, add a new migration and apply it with `dotnet ef database update`.

In VS Code you can instead run the `dev: run all` task (`Ctrl+Shift+B`) to start both at once.

## Build

```powershell
dotnet build Appka.slnx
cd Appka.Client; npm run build
```
