using Appka.Application.Services;
using Appka.Infrastructure.Repositories;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DI registrations
builder.Services.AddSingleton<Appka.Domain.Interfaces.ITodoRepository, InMemoryTodoRepository>();
builder.Services.AddScoped<ITodoService, TodoService>();

var app = builder.Build();

//if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/todos", async (ITodoService svc) => Results.Ok(await svc.GetAllAsync()));

app.MapGet("/todos/{id}", async (Guid id, ITodoService svc) =>
{
    var t = await svc.GetAsync(id);
    return t is null ? Results.NotFound() : Results.Ok(t);
});

app.MapPost("/todos", async (TodoCreateRequest req, ITodoService svc) =>
{
    var dto = await svc.CreateAsync(req.Title);
    return Results.Created($"/todos/{dto.Id}", dto);
});

app.MapPut("/todos/{id}", async (Guid id, TodoUpdateRequest req, ITodoService svc) =>
{
    var dto = new Appka.Application.DTOs.TodoDto(id, req.Title, req.IsDone);
    await svc.UpdateAsync(dto);
    return Results.NoContent();
});

app.MapDelete("/todos/{id}", async (Guid id, ITodoService svc) =>
{
    await svc.DeleteAsync(id);
    return Results.NoContent();
});

app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();

public record TodoCreateRequest(string Title);
public record TodoUpdateRequest(string Title, bool IsDone);
