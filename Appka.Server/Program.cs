var builder = WebApplication.CreateBuilder(args);

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

const string ClientCors = "ClientCors";
builder.Services.AddCors(options =>
    options.AddPolicy(ClientCors, policy => policy
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors(ClientCors);
}

var api = app.MapGroup("/api");

api.MapGet("/hello", () => new HelloMessage(
        "Hello from Appka.Server (.NET 10 minimal API)",
        DateTimeOffset.Now))
   .WithName("GetHello");

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

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
