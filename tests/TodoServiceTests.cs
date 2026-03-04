using Appka.Application.Services;
using Appka.Infrastructure.Repositories;

namespace Appka.Tests;

public class TodoServiceTests
{
    [Fact]
    public async Task CreateAndGetTodo()
    {
        var repo = new InMemoryTodoRepository();
        var svc = new TodoService(repo);

        var created = await svc.CreateAsync("test item");
        var fetched = await svc.GetAsync(created.Id);

        Assert.NotNull(fetched);
        Assert.Equal("test item", fetched!.Title);
    }
}
