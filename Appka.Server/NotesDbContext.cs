using Microsoft.EntityFrameworkCore;

namespace Appka.Server;

public sealed class NotesDbContext(DbContextOptions<NotesDbContext> options) : DbContext(options)
{
    public DbSet<Note> Notes => Set<Note>();
}