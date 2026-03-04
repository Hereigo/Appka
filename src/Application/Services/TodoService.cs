using Appka.Application.DTOs;
using Appka.Domain.Entities;
using Appka.Domain.Interfaces;

namespace Appka.Application.Services;

public class TodoService : ITodoService
{
    private readonly ITodoRepository _repo;

    public TodoService(ITodoRepository repo)
    {
        _repo = repo;
    }

    public async Task<TodoDto> CreateAsync(string title)
    {
        var entity = new TodoItem { Title = title, IsDone = false };
        var added = await _repo.AddAsync(entity);
        return new TodoDto(added.Id, added.Title, added.IsDone);
    }

    public async Task<TodoDto?> GetAsync(Guid id)
    {
        var e = await _repo.GetAsync(id);
        return e is null ? null : new TodoDto(e.Id, e.Title, e.IsDone);
    }

    public async Task<IEnumerable<TodoDto>> GetAllAsync()
    {
        var list = await _repo.GetAllAsync();
        return list.Select(e => new TodoDto(e.Id, e.Title, e.IsDone));
    }

    public async Task UpdateAsync(TodoDto dto)
    {
        var e = new TodoItem { Id = dto.Id, Title = dto.Title, IsDone = dto.IsDone };
        await _repo.UpdateAsync(e);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _repo.DeleteAsync(id);
    }
}
