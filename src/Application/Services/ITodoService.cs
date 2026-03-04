using Appka.Application.DTOs;

namespace Appka.Application.Services;

public interface ITodoService
{
    Task<TodoDto> CreateAsync(string title);
    Task<TodoDto?> GetAsync(Guid id);
    Task<IEnumerable<TodoDto>> GetAllAsync();
    Task UpdateAsync(TodoDto dto);
    Task DeleteAsync(Guid id);
}
