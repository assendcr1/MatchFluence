using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace BackendAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _smtpPassword;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _logger = logger;

            _fromEmail = config["EmailSettings:FromAddress"]
                ?? throw new InvalidOperationException("EmailSettings:FromAddress is not configured.");

            _fromName = config["EmailSettings:FromName"] ?? "FluentAI";

            _smtpHost = config["EmailSettings:SmtpHost"] ?? "smtp.gmail.com";

            _smtpPort = int.TryParse(config["EmailSettings:SmtpPort"], out var port) ? port : 587;

            _smtpPassword = config["EmailSettings:SmtpPassword"]
                ?? throw new InvalidOperationException("EmailSettings:SmtpPassword is not configured.");
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_fromName, _fromEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            // Switch to "html" if you want to send formatted emails later
            message.Body = new TextPart("plain") { Text = body };

            using var client = new SmtpClient();

            try
            {
                // StartTls — properly negotiates TLS on port 587
                await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_fromEmail, _smtpPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent to {ToEmail} with subject: {Subject}", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
                throw;
            }
        }
    }
}
