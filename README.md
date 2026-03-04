# Appka — Clean Architecture ASP.NET Core Skeleton

This workspace contains a minimal Clean Architecture skeleton with these projects:

- src/Api — Minimal Web API (ASP.NET Core)
- src/Application — Application services and DTOs
- src/Domain — Entities and repository interfaces
- src/Infrastructure — In-memory repository implementation
- tests — (basic) tests

Run locally (requires .NET 8 SDK):

```powershell
dotnet build
dotnet run --project src/Api
```

Then open `https://localhost:5001/swagger` (or the URL shown in console).
