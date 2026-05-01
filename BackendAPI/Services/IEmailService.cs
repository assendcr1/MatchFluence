namespace BackendAPI.Services
{
    // Separated into its own file — was previously defined inside EmailService.cs
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
}
