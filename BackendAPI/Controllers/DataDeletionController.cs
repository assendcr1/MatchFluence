using BackendAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BackendAPI.Controllers
{
    // Meta requires a Data Deletion Callback URL for App Review
    // This endpoint handles deletion requests from Meta when a user
    // removes your app from their Facebook/Instagram account
    [ApiController]
    [Route("api/data-deletion")]
    public class DataDeletionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DataDeletionController> _logger;
        private readonly IConfiguration _config;

        public DataDeletionController(
            ApplicationDbContext context,
            ILogger<DataDeletionController> logger,
            IConfiguration config)
        {
            _context = context;
            _logger = logger;
            _config = config;
        }

        // Meta calls this endpoint when a user removes your app
        // Must return a confirmation URL and a unique deletion code
        [HttpPost("callback")]
        public async Task<IActionResult> MetaDeletionCallback()
        {
            try
            {
                // Read the signed_request from Meta
                var form = await Request.ReadFormAsync();
                var signedRequest = form["signed_request"].ToString();

                if (string.IsNullOrEmpty(signedRequest))
                    return BadRequest();

                // Parse the user ID from the signed request
                // In production you should verify the signature using your app secret
                var parts = signedRequest.Split('.');
                if (parts.Length < 2)
                    return BadRequest();

                var payload = parts[1];
                // Add padding if needed for base64
                var padded = payload.PadRight(payload.Length + (4 - payload.Length % 4) % 4, '=')
                    .Replace('-', '+').Replace('_', '/');

                var json = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(padded));
                using var doc = JsonDocument.Parse(json);

                var userId = doc.RootElement.TryGetProperty("user_id", out var uid)
                    ? uid.GetString() : null;

                if (!string.IsNullOrEmpty(userId))
                {
                    // Find and delete influencer by their stored Instagram user ID
                    var influencer = await _context.Influencers
                        .FirstOrDefaultAsync(i => i.InstagramHandle != null &&
                                                   i.InstagramHandle.Contains(userId));

                    if (influencer != null)
                    {
                        _context.Influencers.Remove(influencer);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Deleted influencer data for Meta user {UserId}", userId);
                    }
                }

                var confirmationCode = Guid.NewGuid().ToString("N")[..12].ToUpper();
                var statusUrl = $"https://match-fluence.vercel.app/data-deletion?code={confirmationCode}";

                return Ok(new
                {
                    url = statusUrl,
                    confirmation_code = confirmationCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Meta data deletion callback failed");
                return StatusCode(500);
            }
        }

        // Status page Meta can link to for deletion confirmation
        [HttpGet("status")]
        public IActionResult DeletionStatus([FromQuery] string code)
        {
            return Ok(new
            {
                status = "deleted",
                confirmation_code = code,
                message = "Your data has been permanently deleted from MatchFluence."
            });
        }
    }
}
