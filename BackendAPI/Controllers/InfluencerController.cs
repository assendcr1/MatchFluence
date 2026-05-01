using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Data;
using BackendAPI.Models;

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

        /// <summary>
        /// Gets all Influencers
        /// </summary>
        /// <returns>List of all Influencers</returns>
        [HttpGet]
        public async Task<IActionResult> GetInfluencers()
        {
            var influencers = await _context.Influencers
                .Include(i => i.Niche)
                .Include(i => i.Market)
                .ToListAsync();
            return Ok(influencers);
        }

        /// <summary>
        /// Get an Influencer by ID
        /// </summary>
        /// <param name="id">The Influencers unique identifier</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetInfluencerById(Guid id)
        {
            var influencer = await _context.Influencers
                .Include(i => i.Niche)
                .Include(i => i.Market)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (influencer == null)
            {
                _logger.LogInformation("Influencer with ID {Id} not found.", id);
                return NotFound();
            }
            return Ok(influencer);
        }

        /// <summary>
        /// Get an Influencer by display name
        /// </summary>
        /// <param name="displayName">The Influencers display name</param>
        [HttpGet("username/{displayName}")]
        public async Task<IActionResult> GetInfluencerByUsername(string displayName)
        {
            var influencer = await _context.Influencers
                .Include(i => i.Niche)
                .Include(i => i.Market)
                .FirstOrDefaultAsync(i => i.DisplayName == displayName);

            if (influencer == null)
            {
                _logger.LogInformation("Influencer with DisplayName {DisplayName} not found.", displayName);
                return NotFound();
            }
            return Ok(influencer);
        }

        /// <summary>
        /// Search influencers with filters
        /// </summary>
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

            if (nicheId.HasValue)
                query = query.Where(i => i.NicheId == nicheId.Value);

            if (marketId.HasValue)
                query = query.Where(i => i.MarketId == marketId.Value);

            if (minFollowers.HasValue)
                query = query.Where(i => i.FollowerCount >= minFollowers.Value);

            if (maxFollowers.HasValue)
                query = query.Where(i => i.FollowerCount <= maxFollowers.Value);

            if (minEngagement.HasValue)
                query = query.Where(i => i.EngagementRate >= minEngagement.Value);

            if (maxBotScore.HasValue)
                query = query.Where(i => i.BotScore <= maxBotScore.Value);

            if (!string.IsNullOrEmpty(platform))
                query = query.Where(i => i.Platform == platform);

            var results = await query.ToListAsync();
            return Ok(results);
        }

        /// <summary>
        /// Deletes an influencer by ID
        /// </summary>
        /// <param name="id">The influencers unique identifier</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInfluencerById(Guid id)
        {
            var influencer = await _context.Influencers.FindAsync(id);
            if (influencer == null)
            {
                _logger.LogInformation("Influencer with ID {Id} not found for deletion.", id);
                return NotFound();
            }
            _context.Influencers.Remove(influencer);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Creates a new influencer
        /// </summary>
        /// <param name="influencer">The influencer object to create</param>
        [HttpPost]
        public async Task<IActionResult> CreateInfluencer([FromBody] Influencer influencer)
        {
            if (influencer == null)
            {
                _logger.LogWarning("Attempted to create an influencer with null data.");
                return BadRequest();
            }

            var userNameExists = await _context.Influencers
                .AnyAsync(i => i.DisplayName == influencer.DisplayName);

            if (userNameExists)
            {
                _logger.LogWarning("Duplicate DisplayName attempted: {DisplayName}.", influencer.DisplayName);
                return Conflict(new { message = "An influencer with the same DisplayName already exists." });
            }

            var influencerEntity = new Influencer
            {
                Name = influencer.Name,
                DisplayName = influencer.DisplayName,
                Platform = influencer.Platform,
                NicheId = influencer.NicheId,
                MarketId = influencer.MarketId,
                // Fixed — these three were missing from the original mapping
                FollowerCount = influencer.FollowerCount,
                EngagementRate = influencer.EngagementRate,
                BotScore = influencer.BotScore,
                Email = influencer.Email,
                InstagramHandle = influencer.InstagramHandle,
                TwitterHandle = influencer.TwitterHandle,
                TikTokHandle = influencer.TikTokHandle,
                YouTubeHandle = influencer.YouTubeHandle,
                LastDataRefresh = DateTime.UtcNow
            };

            _context.Influencers.Add(influencerEntity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInfluencerById),
                new { id = influencerEntity.Id }, influencerEntity);
        }

        /// <summary>
        /// Updates an existing influencer
        /// </summary>
        /// <param name="id">The influencers unique identifier</param>
        /// <param name="influencerEntity">The updated influencer object</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInfluencerInformation(Guid id, [FromBody] Influencer influencerEntity)
        {
            var existingInfluencer = await _context.Influencers.FindAsync(id);
            if (existingInfluencer == null)
            {
                _logger.LogInformation("Influencer with ID {Id} not found for update.", id);
                return NotFound();
            }

            existingInfluencer.Name = influencerEntity.Name;
            existingInfluencer.DisplayName = influencerEntity.DisplayName;
            existingInfluencer.Platform = influencerEntity.Platform;
            existingInfluencer.NicheId = influencerEntity.NicheId;
            existingInfluencer.MarketId = influencerEntity.MarketId;
            // Fixed — these three were missing from the original mapping
            existingInfluencer.FollowerCount = influencerEntity.FollowerCount;
            existingInfluencer.EngagementRate = influencerEntity.EngagementRate;
            existingInfluencer.BotScore = influencerEntity.BotScore;
            existingInfluencer.Email = influencerEntity.Email;
            existingInfluencer.InstagramHandle = influencerEntity.InstagramHandle;
            existingInfluencer.TwitterHandle = influencerEntity.TwitterHandle;
            existingInfluencer.TikTokHandle = influencerEntity.TikTokHandle;
            existingInfluencer.YouTubeHandle = influencerEntity.YouTubeHandle;

            _context.Influencers.Update(existingInfluencer);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}