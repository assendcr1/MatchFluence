using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.Models.DTO;
using BackendAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgencyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ApiKeyService _apiKeyService;
        private readonly ILogger<AgencyController> _logger;

        public AgencyController(
            ApplicationDbContext context,
            ApiKeyService apiKeyService,
            ILogger<AgencyController> logger)
        {
            _context = context;
            _apiKeyService = apiKeyService;
            _logger = logger;
        }

        /// <summary>
        /// Register a new agency and receive an API key.
        /// The API key is shown ONCE — store it securely, it cannot be retrieved again.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterAgencyRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var exists = await _context.Agencies
                .AnyAsync(a => a.Email == request.Email);

            if (exists)
                return Conflict(new { message = "An agency with this email already exists." });

            var rawKey = _apiKeyService.GenerateApiKey();
            var keyHash = _apiKeyService.HashApiKey(rawKey);

            var agency = new Agency
            {
                Id = Guid.NewGuid(),
                AgencyName = request.AgencyName,
                Email = request.Email,
                Website = request.Website,
                ApiKeyHash = keyHash,
                CreatedAt = DateTime.UtcNow
            };

            _context.Agencies.Add(agency);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Agency registered: {AgencyName} ({Email})",
                agency.AgencyName, agency.Email);

            return CreatedAtAction(nameof(GetProfile), new { }, new
            {
                message = "Registration successful. Store your API key securely — it will not be shown again.",
                agencyId = agency.Id,
                agencyName = agency.AgencyName,
                apiKey = rawKey
            });
        }

        /// <summary>
        /// Get the authenticated agency's profile.
        /// Requires X-Api-Key header.
        /// </summary>
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var agencyId = GetCurrentUserId();
            if (agencyId == null)
                return Unauthorized();

            var agency = await _context.Agencies.FindAsync(agencyId);
            if (agency == null)
                return NotFound();

            return Ok(new
            {
                agency.Id,
                agency.AgencyName,
                agency.Email,
                agency.Website,
                agency.CreatedAt
            });
        }

        /// <summary>
        /// Get all campaigns created by the authenticated agency,
        /// including their matched influencers and scores.
        /// Requires X-Api-Key header.
        /// </summary>
        [HttpGet("campaigns")]
        [Authorize]
        public async Task<IActionResult> GetCampaigns()
        {
            var agencyId = GetCurrentUserId();
            if (agencyId == null)
                return Unauthorized();

            var campaigns = await _context.Campaigns
                .Where(c => c.CreatedByAgencyId == agencyId)
                .Include(c => c.Niche)
                .Include(c => c.Market)
                .Include(c => c.MatchedInfluencers)
                    .ThenInclude(ci => ci.Influencer)
                .OrderByDescending(c => c.StartDate)
                .ToListAsync();

            return Ok(campaigns);
        }

        private Guid? GetCurrentUserId()
        {
            var idClaim = User.FindFirst("UserId")?.Value;
            return Guid.TryParse(idClaim, out var id) ? id : null;
        }
    }
}
