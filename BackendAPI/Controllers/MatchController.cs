using BackendAPI.Models.DTO;
using BackendAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MatchController : ControllerBase
    {
        private readonly IMatchingService _matchingService;
        private readonly ILogger<MatchController> _logger;

        public MatchController(IMatchingService matchingService, ILogger<MatchController> logger)
        {
            _matchingService = matchingService;
            _logger = logger;
        }

        /// <summary>
        /// Submit a campaign brief and receive the top 5 matched influencers.
        /// Requires X-Api-Key header from a registered Brand or Agency.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> GetMatches([FromBody] MatchRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (request.MinimumFollowers >= request.MaximumFollowers)
                return BadRequest("MinimumFollowers must be less than MaximumFollowers.");

            var userType = User.FindFirst("UserType")?.Value;
            var userId = User.FindFirst("UserId")?.Value;

            if (userType == "Brand" && Guid.TryParse(userId, out var brandId))
                request.BrandId = brandId;
            else if (userType == "Agency" && Guid.TryParse(userId, out var agencyId))
                request.AgencyId = agencyId;

            try
            {
                var results = await _matchingService.GetTopMatchesAsync(request);

                if (!results.Any())
                    return Ok(new
                    {
                        message = "No influencers found matching your criteria. Try widening your follower range, removing the niche filter, or lowering the minimum engagement rate.",
                        matches = results
                    });

                return Ok(new
                {
                    message = $"{results.Count} match(es) found for \"{request.CampaignTitle}\"",
                    requestedBy = new { userType, userId },
                    matches = results
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Match request failed for campaign: {Title}", request.CampaignTitle);
                return StatusCode(500, "An error occurred while processing your match request.");
            }
        }

        /// <summary>
        /// Search influencers with filters — no AI scoring. Requires X-Api-Key header.
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] int? nicheId,
            [FromQuery] int? marketId,
            [FromQuery] int? minFollowers,
            [FromQuery] int? maxFollowers,
            [FromQuery] decimal? minEngagement,
            [FromQuery] decimal? maxBotScore,
            [FromQuery] string? platform)
        {
            var request = new MatchRequest
            {
                CampaignTitle = "Search",
                CampaignDescription = "Direct search",
                TargetPlatform = platform ?? "Any",
                NicheId = nicheId,
                MarketId = marketId,
                MinimumFollowers = minFollowers ?? 0,
                MaximumFollowers = maxFollowers ?? int.MaxValue,
                MinEngagementRate = minEngagement,
                MaxBotScore = maxBotScore
            };

            try
            {
                var results = await _matchingService.GetTopMatchesAsync(request);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Search failed");
                return StatusCode(500, "Search failed.");
            }
        }
    }
}
