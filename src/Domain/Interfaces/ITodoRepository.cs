using Appka.Domain.Entities;

namespace Appka.Domain.Interfaces;

public interface ITodoRepository
{
    Task<TodoItem> AddAsync(TodoItem item);
    Task<TodoItem?> GetAsync(Guid id);
    Task<IEnumerable<TodoItem>> GetAllAsync();
    Task UpdateAsync(TodoItem item);
    Task DeleteAsync(Guid id);
}
