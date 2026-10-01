using Appka.Server;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Appka")
    ?? throw new InvalidOperationException("Connection string 'Appka' was not found.");

builder.Services.AddDbContext<NotesDbContext>(options => options.UseSqlite(connectionString));

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
}

if (allowedOrigins.Length > 0)
{
    app.UseCors(ClientCors);
}

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
   .WithName("CreateNote");

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

app.Run();

record HelloMessage(string Message, DateTimeOffset ServerTime);

record CreateNoteRequest(string? Text);

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
