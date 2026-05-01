namespace BackendAPI.Models
{
    public class MessageTemplate
    {
        public int Id { get; set; }

        // Email or DM
        public string Type { get; set; }

        // Template text
        public string Template { get; set; }
    }
}
