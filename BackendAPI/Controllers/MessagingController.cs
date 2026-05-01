using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc;
using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.Models.DTO;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly MessageService _messageService;
        private readonly ILogger<MessagingController> _logger;

        // Fixed — all dependencies injected via DI, no more "new Service()"
        public MessagingController(
            ApplicationDbContext context,
            IEmailService emailService,
            MessageService messageService,
            ILogger<MessagingController> logger)
        {
            _context = context;
            _emailService = emailService;
            _messageService = messageService;
            _logger = logger;
        }

        /// <summary>
        /// Sends a message (Email) to an influencer for a campaign
        /// </summary>
        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest sendMessageRequest)
        {
            if (sendMessageRequest == null)
                return BadRequest("Request body is required.");

            var influencer = await _context.Influencers.FindAsync(sendMessageRequest.InfluencerId);
            var campaign = await _context.Campaigns.FindAsync(sendMessageRequest.CampaignId);

            if (influencer == null || campaign == null)
                return NotFound("Influencer or campaign not found.");

            string message = _messageService.GenerateDefaultMessage(influencer.Name, campaign.Title);
            string subject = "Campaign Opportunity";
            string status = "Pending";

            try
            {
                if (sendMessageRequest.MessageType == "Email")
                {
                    await _emailService.SendEmailAsync(influencer.Email, subject, message);
                    status = "Sent";
                }
                else
                {
                    // Instagram DM via API is not supported for unsolicited outreach.
                    // Direct the caller to use email or reach out manually via the handle.
                    _logger.LogWarning("DM message type requested but not supported. InfluencerId: {Id}",
                        sendMessageRequest.InfluencerId);
                    return BadRequest(new
                    {
                        message = "Instagram DM outreach is not supported via API. " +
                                  "Use Email or contact the influencer directly via their handle.",
                        instagramHandle = influencer.InstagramHandle
                    });
                }
            }
            catch (Exception ex)
            {
                // Fixed — was silently swallowing exceptions
                _logger.LogError(ex, "Failed to send message to influencer {InfluencerId} for campaign {CampaignId}",
                    sendMessageRequest.InfluencerId, sendMessageRequest.CampaignId);
                status = "Failed";
            }

            var report = new Report
            {
                Id = Guid.NewGuid(),
                CampaignId = sendMessageRequest.CampaignId,
                InfluencerId = sendMessageRequest.InfluencerId,
                MessageType = sendMessageRequest.MessageType,
                Subject = subject,
                MessageBody = message,
                IsCustomMessage = false,
                SentDate = DateTime.UtcNow, // Fixed — was DateTime.Now
                Status = status
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(report);
        }
    }
}
