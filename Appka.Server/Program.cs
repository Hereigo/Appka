using Appka.Server;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Appka")
    ?? throw new InvalidOperationException("Connection string 'Appka' was not found.");

builder.Services.AddDbContext<NotesDbContext>(options => options.UseSqlite(connectionString));

var cidaasAuthority = builder.Configuration["Cidaas:Authority"];
var cidaasAudience = builder.Configuration["Cidaas:Audience"];

if (string.IsNullOrWhiteSpace(cidaasAuthority) || string.IsNullOrWhiteSpace(cidaasAudience))
{
    throw new InvalidOperationException(
        "'Cidaas:Authority' and 'Cidaas:Audience' must be configured so notes endpoints can validate access tokens.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // The discovery document and JWKS are fetched from the authority and cached.
        options.Authority = cidaasAuthority;
        options.Audience = cidaasAudience;
        options.RequireHttpsMetadata = true;
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = cidaasAuthority,
            ValidateAudience = true,
            ValidAudience = cidaasAudience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = "sub",
            RoleClaimType = "roles"
        };
    });

builder.Services.AddAuthorization();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

const string ClientCors = "ClientCors";

// Empty in development: the Vite dev server proxies /api, so requests are same-origin.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
    options.AddPolicy(ClientCors, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHttpsRedirection();
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

if (allowedOrigins.Length > 0)
{
    app.UseCors(ClientCors);
}

app.UseAuthentication();
app.UseAuthorization();

var api = app.MapGroup("/api");

api.MapGet("/hello", () => new HelloMessage(
        "Hello from Appka.Server (.NET 10 minimal API)",
        DateTimeOffset.Now))
   .WithName("GetHello");

api.MapPost("/notes", async (
    CreateNoteRequest request,
    NotesDbContext dbContext,
    CancellationToken cancellationToken) =>
{
    if (request.Text is null || request.Text.Length < 2)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [nameof(request.Text)] = ["Text must be at least 2 characters long."]
        });
    }

    var note = new Note
    {
        Id = long.Parse(DateTime.Now.ToString("yyMMddHHmmssfff")),
        Text = request.Text
    };

    dbContext.Notes.Add(note);
    await dbContext.SaveChangesAsync(cancellationToken);

    return Results.Json(note, statusCode: StatusCodes.Status201Created);
})
   .WithName("CreateNote")
   .RequireAuthorization();

api.MapGet("/notes", async (NotesDbContext dbContext, CancellationToken cancellationToken) =>
        await dbContext.Notes
            .AsNoTracking()
            .OrderBy(note => note.Id)
            .ToListAsync(cancellationToken))
   .WithName("GetNotes")
   .RequireAuthorization();

api.MapPut("/notes/{id:long}", async (
    long id,
    UpdateNoteRequest request,
    NotesDbContext dbContext,
    CancellationToken cancellationToken) =>
{
    if (request.Text is null || request.Text.Length < 2)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [nameof(request.Text)] = ["Text must be at least 2 characters long."]
        });
    }

    var note = await dbContext.Notes
        .FirstOrDefaultAsync(note => note.Id == id, cancellationToken);

    if (note is null)
    {
        return Results.NotFound();
    }

    note.Text = request.Text;
    note.IsArchived = request.IsArchived;

    await dbContext.SaveChangesAsync(cancellationToken);

    return Results.Ok(note);
})
   .WithName("UpdateNote")
   .RequireAuthorization();

api.MapDelete("/notes/{id:long}", async (
    long id,
    NotesDbContext dbContext,
    CancellationToken cancellationToken) =>
{
    var note = await dbContext.Notes
        .FirstOrDefaultAsync(note => note.Id == id, cancellationToken);

    if (note is null)
    {
        return Results.NotFound();
    }

    dbContext.Notes.Remove(note);
    await dbContext.SaveChangesAsync(cancellationToken);

    return Results.NoContent();
})
   .WithName("DeleteNote")
   .RequireAuthorization();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

api.MapGet("/weatherforecast", () =>
        Enumerable.Range(1, 5).Select(index =>
            new WeatherForecast(
                DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                Random.Shared.Next(-20, 55),
                summaries[Random.Shared.Next(summaries.Length)]))
            .ToArray())
   .WithName("GetWeatherForecast");

if (!app.Environment.IsDevelopment())
{
    app.MapFallback("/api/{**path}", () => Results.NotFound());
    app.MapFallbackToFile("index.html");
}

app.Run();

record HelloMessage(string Message, DateTimeOffset ServerTime);

record CreateNoteRequest(string? Text);

record UpdateNoteRequest(string? Text, bool IsArchived);

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
