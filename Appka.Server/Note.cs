namespace Appka.Server;

public class Note
{
    public long Id { get; set; }

    public bool IsArchived { get; set; }

    public string Text { get; set; } = string.Empty;
}