using BackendAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/influencer")]
    public class InfluencerPortalController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<InfluencerPortalController> _logger;

        public InfluencerPortalController(
            ApplicationDbContext context,
            ILogger<InfluencerPortalController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get follower count and engagement history for an influencer.
        /// Returns all MetricSnapshot records ordered by date — use this
        /// to show growth charts on the influencer dashboard.
        /// </summary>
        /// <param name="id">The influencer's unique identifier</param>
        [HttpGet("{id:guid}/metrics")]
        public async Task<IActionResult> GetMetrics(Guid id)
        {
            var influencer = await _context.Influencers.FindAsync(id);
            if (influencer == null)
            {
                _logger.LogInformation("Influencer {Id} not found for metrics request", id);
                return NotFound();
            }

            var snapshots = await _context.MetricSnapshots
                .Where(ms => ms.InfluencerId == id)
                .OrderBy(ms => ms.SnapshotDate)
                .Select(ms => new
                {
                    ms.SnapshotDate,
                    ms.FollowerCount,
                    ms.EngagementRate,
                    ms.AverageReach,
                    BotScore = Math.Round(ms.BotScore * 100, 2) // Return as percentage
                })
                .ToListAsync();

            var latest = snapshots.LastOrDefault();

            return Ok(new
            {
                influencerId = id,
                displayName = influencer.DisplayName,
                currentFollowerCount = influencer.FollowerCount,
                currentEngagementRate = influencer.EngagementRate,
                currentBotScore = Math.Round(influencer.BotScore * 100, 2),
                lastRefreshed = influencer.LastDataRefresh,
                snapshotCount = snapshots.Count,
                history = snapshots
            });
        }

        /// <summary>
        /// Get all campaigns this influencer has been matched to,
        /// including match scores, reasons, and current status.
        /// </summary>
        /// <param name="id">The influencer's unique identifier</param>
        [HttpGet("{id:guid}/campaigns")]
        public async Task<IActionResult> GetCampaigns(Guid id)
        {
            var influencer = await _context.Influencers.FindAsync(id);
            if (influencer == null)
                return NotFound();

            var campaigns = await _context.CampaignInfluencers
                .Where(ci => ci.InfluencerId == id)
                .Include(ci => ci.Campaign)
                    .ThenInclude(c => c.Niche)
                .Include(ci => ci.Campaign)
                    .ThenInclude(c => c.Market)
                .OrderByDescending(ci => ci.MatchedAt)
                .Select(ci => new
                {
                    ci.CampaignId,
                    campaignTitle = ci.Campaign.Title,
                    campaignDescription = ci.Campaign.Description,
                    targetPlatform = ci.Campaign.TargetPlatform,
                    niche = ci.Campaign.Niche != null ? ci.Campaign.Niche.NicheName : null,
                    market = ci.Campaign.Market != null ? ci.Campaign.Market.MarketName : null,
                    startDate = ci.Campaign.StartDate,
                    endDate = ci.Campaign.EndDate,
                    ci.MatchScore,
                    ci.MatchReason,
                    ci.Status,
                    ci.MatchedAt
                })
                .ToListAsync();

            return Ok(new
            {
                influencerId = id,
                displayName = influencer.DisplayName,
                totalCampaigns = campaigns.Count,
                campaigns
            });
        }

        /// <summary>
        /// Get a summary of an influencer's profile — metrics, platform handles,
        /// and campaign stats in one call. Useful for a dashboard landing page.
        /// </summary>
        /// <param name="id">The influencer's unique identifier</param>
        [HttpGet("{id:guid}/summary")]
        public async Task<IActionResult> GetSummary(Guid id)
        {
            var influencer = await _context.Influencers
                .Include(i => i.Niche)
                .Include(i => i.Market)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (influencer == null)
                return NotFound();

            var totalCampaigns = await _context.CampaignInfluencers
                .CountAsync(ci => ci.InfluencerId == id);

            var avgMatchScore = await _context.CampaignInfluencers
                .Where(ci => ci.InfluencerId == id)
                .AverageAsync(ci => (double?)ci.MatchScore) ?? 0;

            var latestSnapshot = await _context.MetricSnapshots
                .Where(ms => ms.InfluencerId == id)
                .OrderByDescending(ms => ms.SnapshotDate)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                id = influencer.Id,
                name = influencer.Name,
                displayName = influencer.DisplayName,
                platform = influencer.Platform,
                niche = influencer.Niche?.NicheName,
                market = influencer.Market?.MarketName,
                handles = new
                {
                    instagram = influencer.InstagramHandle,
                    tiktok = influencer.TikTokHandle,
                    youtube = influencer.YouTubeHandle,
                    twitter = influencer.TwitterHandle
                },
                metrics = new
                {
                    followerCount = influencer.FollowerCount,
                    engagementRate = influencer.EngagementRate,
                    botScore = Math.Round(influencer.BotScore * 100, 2),
                    lastRefreshed = influencer.LastDataRefresh
                },
                campaignStats = new
                {
                    totalMatched = totalCampaigns,
                    averageMatchScore = Math.Round(avgMatchScore, 1)
                },
                accountConnected = !string.IsNullOrEmpty(influencer.AccessToken)
            });
        }
    }
}
