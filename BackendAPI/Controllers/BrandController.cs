using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.Models.DTO;
using BackendAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BrandController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ApiKeyService _apiKeyService;
        private readonly ILogger<BrandController> _logger;

        public BrandController(
            ApplicationDbContext context,
            ApiKeyService apiKeyService,
            ILogger<BrandController> logger)
        {
            _context = context;
            _apiKeyService = apiKeyService;
            _logger = logger;
        }

        /// <summary>
        /// Register a new brand and receive an API key.
        /// The API key is shown ONCE — store it securely, it cannot be retrieved again.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterBrandRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var exists = await _context.Brands
                .AnyAsync(b => b.Email == request.Email);

            if (exists)
                return Conflict(new { message = "A brand with this email already exists." });

            var rawKey = _apiKeyService.GenerateApiKey();
            var keyHash = _apiKeyService.HashApiKey(rawKey);

            var brand = new Brand
            {
                Id = Guid.NewGuid(),
                CompanyName = request.CompanyName,
                Email = request.Email,
                Industry = request.Industry,
                Website = request.Website,
                ApiKeyHash = keyHash,
                CreatedAt = DateTime.UtcNow
            };

            _context.Brands.Add(brand);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Brand registered: {CompanyName} ({Email})",
                brand.CompanyName, brand.Email);

            // Return the raw key ONCE — it is not stored and cannot be recovered
            return CreatedAtAction(nameof(GetProfile), new { }, new
            {
                message = "Registration successful. Store your API key securely — it will not be shown again.",
                brandId = brand.Id,
                companyName = brand.CompanyName,
                apiKey = rawKey
            });
        }

        /// <summary>
        /// Get the authenticated brand's profile.
        /// Requires X-Api-Key header.
        /// </summary>
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var brandId = GetCurrentUserId();
            if (brandId == null)
                return Unauthorized();

            var brand = await _context.Brands.FindAsync(brandId);
            if (brand == null)
                return NotFound();

            return Ok(new
            {
                brand.Id,
                brand.CompanyName,
                brand.Email,
                brand.Industry,
                brand.Website,
                brand.CreatedAt
            });
        }

        /// <summary>
        /// Get all campaigns created by the authenticated brand,
        /// including their matched influencers and scores.
        /// Requires X-Api-Key header.
        /// </summary>
        [HttpGet("campaigns")]
        [Authorize]
        public async Task<IActionResult> GetCampaigns()
        {
            var brandId = GetCurrentUserId();
            if (brandId == null)
                return Unauthorized();

            var campaigns = await _context.Campaigns
                .Where(c => c.CreatedByBrandId == brandId)
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
