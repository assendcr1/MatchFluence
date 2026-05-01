namespace BackendAPI.Services
{
    public class MessageService
    {
        public string GenerateDefaultMessage(string influencerName, string campaignTitle)
        {
            return $"Hi {influencerName},\n\n" +
                   $"We believe you would be a great fit for our campaign: {campaignTitle}.\n" +
                   $"We would love to collaborate with you!\n\n" +
                   $"Please reply if you're interested.\n\n" +
                   $"Best regards,\nMarketing Team";
        }

    }
}
