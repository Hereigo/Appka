using Appka.Domain.Entities;
using Appka.Domain.Interfaces;

namespace Appka.Infrastructure.Repositories;

public class InMemoryTodoRepository : ITodoRepository
{
    private readonly Dictionary<Guid, TodoItem> _store = new();

    public Task<TodoItem> AddAsync(TodoItem item)
    {
        _store[item.Id] = item;
        return Task.FromResult(item);
    }

    public Task DeleteAsync(Guid id)
    {
        _store.Remove(id);
        return Task.CompletedTask;
    }

    public Task<TodoItem?> GetAsync(Guid id)
    {
        _store.TryGetValue(id, out var item);
        return Task.FromResult(item);
    }

    public Task<IEnumerable<TodoItem>> GetAllAsync()
    {
        return Task.FromResult(_store.Values.AsEnumerable());
    }

    public Task UpdateAsync(TodoItem item)
    {
        if (_store.ContainsKey(item.Id))
            _store[item.Id] = item;
        return Task.CompletedTask;
    }
}
