using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.Services.Discovery;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InfluencerController : ControllerBase
    {
        private readonly ILogger<InfluencerController> _logger;
        private readonly ApplicationDbContext _context;

        public InfluencerController(ILogger<InfluencerController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetInfluencers()
        {
            var influencers = await _context.Influencers
                .Include(i => i.Niche)
                .Include(i => i.Market)
                .ToListAsync();
            return Ok(influencers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInfluencerById(Guid id)
        {
            var influencer = await _context.Influencers
                .Include(i => i.Niche)
                .Include(i => i.Market)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (influencer == null)
                return NotFound();

            return Ok(influencer);
        }

        [HttpGet("username/{displayName}")]
        public async Task<IActionResult> GetInfluencerByUsername(string displayName)
        {
            var influencer = await _context.Influencers
                .Include(i => i.Niche)
                .Include(i => i.Market)
                .FirstOrDefaultAsync(i => i.DisplayName == displayName);

            if (influencer == null)
                return NotFound();

            return Ok(influencer);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchInfluencers(
            [FromQuery] int? nicheId,
            [FromQuery] int? marketId,
            [FromQuery] int? minFollowers,
            [FromQuery] int? maxFollowers,
            [FromQuery] decimal? minEngagement,
            [FromQuery] decimal? maxBotScore,
            [FromQuery] string? platform)
        {
            var query = _context.Influencers
                .Include(i => i.Niche)
                .Include(i => i.Market)
                .AsQueryable();

            if (nicheId.HasValue) query = query.Where(i => i.NicheId == nicheId.Value);
            if (marketId.HasValue) query = query.Where(i => i.MarketId == marketId.Value);
            if (minFollowers.HasValue) query = query.Where(i => i.FollowerCount >= minFollowers.Value);
            if (maxFollowers.HasValue) query = query.Where(i => i.FollowerCount <= maxFollowers.Value);
            if (minEngagement.HasValue) query = query.Where(i => i.EngagementRate >= minEngagement.Value);
            if (maxBotScore.HasValue) query = query.Where(i => i.BotScore <= maxBotScore.Value);
            if (!string.IsNullOrEmpty(platform)) query = query.Where(i => i.Platform == platform);

            return Ok(await query.ToListAsync());
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInfluencerById(Guid id)
        {
            var influencer = await _context.Influencers.FindAsync(id);
            if (influencer == null)
                return NotFound();

            _context.Influencers.Remove(influencer);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> CreateInfluencer([FromBody] Influencer influencer)
        {
            if (influencer == null)
                return BadRequest();

            var exists = await _context.Influencers
                .AnyAsync(i => i.DisplayName == influencer.DisplayName);

            if (exists)
                return Conflict(new { message = "An influencer with the same DisplayName already exists." });

            var entity = new Influencer
            {
                Name = influencer.Name,
                DisplayName = influencer.DisplayName,
                Platform = influencer.Platform,
                NicheId = influencer.NicheId,
                MarketId = influencer.MarketId,
                FollowerCount = influencer.FollowerCount,
                EngagementRate = influencer.EngagementRate,
                BotScore = influencer.BotScore,
                Email = influencer.Email,
                InstagramHandle = influencer.InstagramHandle,
                TwitterHandle = influencer.TwitterHandle,
                TikTokHandle = influencer.TikTokHandle,
                YouTubeHandle = influencer.YouTubeHandle,
                LastDataRefresh = DateTime.UtcNow,

                // Manually added influencers are seeds — High priority, verified, refresh immediately
                RefreshPriority = InfluencerThresholds.PriorityHigh,
                IsVerified = true,
                DiscoverySource = "Manual",
                NextRefreshDue = DateTime.UtcNow
            };

            _context.Influencers.Add(entity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInfluencerById), new { id = entity.Id }, entity);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInfluencerInformation(Guid id, [FromBody] Influencer influencer)
        {
            var existing = await _context.Influencers.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Name = influencer.Name;
            existing.DisplayName = influencer.DisplayName;
            existing.Platform = influencer.Platform;
            existing.NicheId = influencer.NicheId;
            existing.MarketId = influencer.MarketId;
            existing.FollowerCount = influencer.FollowerCount;
            existing.EngagementRate = influencer.EngagementRate;
            existing.BotScore = influencer.BotScore;
            existing.Email = influencer.Email;
            existing.InstagramHandle = influencer.InstagramHandle;
            existing.TwitterHandle = influencer.TwitterHandle;
            existing.TikTokHandle = influencer.TikTokHandle;
            existing.YouTubeHandle = influencer.YouTubeHandle;

            _context.Influencers.Update(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
