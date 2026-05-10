using BackendAPI.Data;
using BackendAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            ApplicationDbContext context,
            IConfiguration config,
            ILogger<AuthController> logger)
        {
            _context = context;
            _config = config;
            _logger = logger;
        }

        // ── Brand login ───────────────────────────────────────────────────
        [HttpPost("brand/login")]
        public async Task<IActionResult> BrandLogin([FromBody] LoginRequest req)
        {
            if (string.IsNullOrEmpty(req.Email) || string.IsNullOrEmpty(req.Password))
                return BadRequest(new { message = "Email and password are required." });

            var brand = await _context.Brands
                .FirstOrDefaultAsync(b => b.Email.ToLower() == req.Email.ToLower());

            if (brand == null || string.IsNullOrEmpty(brand.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            if (!BCrypt.Net.BCrypt.Verify(req.Password, brand.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            var token = GenerateJwtToken(brand.Id.ToString(), brand.Email, "Brand", brand.CompanyName);

            _logger.LogInformation("Brand login: {Email}", brand.Email);

            return Ok(new
            {
                token,
                userType = "Brand",
                userId = brand.Id,
                name = brand.CompanyName,
                email = brand.Email,
                apiKey = (string?)null // not needed for web UI
            });
        }

        // ── Agency login ──────────────────────────────────────────────────
        [HttpPost("agency/login")]
        public async Task<IActionResult> AgencyLogin([FromBody] LoginRequest req)
        {
            if (string.IsNullOrEmpty(req.Email) || string.IsNullOrEmpty(req.Password))
                return BadRequest(new { message = "Email and password are required." });

            var agency = await _context.Agencies
                .FirstOrDefaultAsync(a => a.Email.ToLower() == req.Email.ToLower());

            if (agency == null || string.IsNullOrEmpty(agency.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            if (!BCrypt.Net.BCrypt.Verify(req.Password, agency.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            var token = GenerateJwtToken(agency.Id.ToString(), agency.Email, "Agency", agency.AgencyName);

            _logger.LogInformation("Agency login: {Email}", agency.Email);

            return Ok(new
            {
                token,
                userType = "Agency",
                userId = agency.Id,
                name = agency.AgencyName,
                email = agency.Email,
                apiKey = (string?)null
            });
        }

        // ── Influencer login ──────────────────────────────────────────────
        [HttpPost("influencer/login")]
        public async Task<IActionResult> InfluencerLogin([FromBody] LoginRequest req)
        {
            if (string.IsNullOrEmpty(req.Email) || string.IsNullOrEmpty(req.Password))
                return BadRequest(new { message = "Email and password are required." });

            var influencer = await _context.Influencers
                .FirstOrDefaultAsync(i => i.Email.ToLower() == req.Email.ToLower());

            if (influencer == null || string.IsNullOrEmpty(influencer.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            if (!BCrypt.Net.BCrypt.Verify(req.Password, influencer.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            var token = GenerateJwtToken(influencer.Id.ToString(), influencer.Email, "Influencer", influencer.DisplayName);

            _logger.LogInformation("Influencer login: {Email}", influencer.Email);

            return Ok(new
            {
                token,
                userType = "Influencer",
                userId = influencer.Id,
                name = influencer.Name,
                displayName = influencer.DisplayName,
                email = influencer.Email
            });
        }

        // ── Brand register ────────────────────────────────────────────────
        [HttpPost("brand/register")]
        public async Task<IActionResult> BrandRegister([FromBody] BrandRegisterRequest req)
        {
            if (string.IsNullOrEmpty(req.Email) || string.IsNullOrEmpty(req.Password) || string.IsNullOrEmpty(req.CompanyName))
                return BadRequest(new { message = "Company name, email and password are required." });

            if (req.Password.Length < 8)
                return BadRequest(new { message = "Password must be at least 8 characters." });

            var exists = await _context.Brands.AnyAsync(b => b.Email.ToLower() == req.Email.ToLower());
            if (exists)
                return Conflict(new { message = "An account with this email already exists." });

            var brand = new Brand
            {
                CompanyName = req.CompanyName,
                Email = req.Email.ToLower(),
                Industry = req.Industry,
                Website = req.Website,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                ApiKeyHash = ComputeApiKeyHash(Guid.NewGuid().ToString()),
                CreatedAt = DateTime.UtcNow
            };

            _context.Brands.Add(brand);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(brand.Id.ToString(), brand.Email, "Brand", brand.CompanyName);

            _logger.LogInformation("Brand registered: {Email}", brand.Email);

            return Ok(new
            {
                token,
                userType = "Brand",
                userId = brand.Id,
                name = brand.CompanyName,
                email = brand.Email
            });
        }

        // ── Agency register ───────────────────────────────────────────────
        [HttpPost("agency/register")]
        public async Task<IActionResult> AgencyRegister([FromBody] AgencyRegisterRequest req)
        {
            if (string.IsNullOrEmpty(req.Email) || string.IsNullOrEmpty(req.Password) || string.IsNullOrEmpty(req.AgencyName))
                return BadRequest(new { message = "Agency name, email and password are required." });

            if (req.Password.Length < 8)
                return BadRequest(new { message = "Password must be at least 8 characters." });

            var exists = await _context.Agencies.AnyAsync(a => a.Email.ToLower() == req.Email.ToLower());
            if (exists)
                return Conflict(new { message = "An account with this email already exists." });

            var agency = new Agency
            {
                AgencyName = req.AgencyName,
                Email = req.Email.ToLower(),
                Website = req.Website,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                ApiKeyHash = ComputeApiKeyHash(Guid.NewGuid().ToString()),
                CreatedAt = DateTime.UtcNow
            };

            _context.Agencies.Add(agency);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(agency.Id.ToString(), agency.Email, "Agency", agency.AgencyName);

            _logger.LogInformation("Agency registered: {Email}", agency.Email);

            return Ok(new
            {
                token,
                userType = "Agency",
                userId = agency.Id,
                name = agency.AgencyName,
                email = agency.Email
            });
        }

        // ── Influencer register ───────────────────────────────────────────
        [HttpPost("influencer/register")]
        public async Task<IActionResult> InfluencerRegister([FromBody] InfluencerRegisterRequest req)
        {
            if (string.IsNullOrEmpty(req.Email) || string.IsNullOrEmpty(req.Password) || string.IsNullOrEmpty(req.DisplayName))
                return BadRequest(new { message = "Display name, email and password are required." });

            if (req.Password.Length < 8)
                return BadRequest(new { message = "Password must be at least 8 characters." });

            var exists = await _context.Influencers.AnyAsync(i => i.Email.ToLower() == req.Email.ToLower());
            if (exists)
                return Conflict(new { message = "An account with this email already exists." });

            var influencer = new Influencer
            {
                Name = req.DisplayName,
                DisplayName = req.DisplayName.ToLower().Replace(" ", "_"),
                Email = req.Email.ToLower(),
                InstagramHandle = req.InstagramHandle,
                Platform = "Instagram",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                NicheId = 7, // Default Lifestyle — admin can update
                MarketId = 1, // Default South Africa
                RefreshPriority = "Low",
                DiscoverySource = "SelfRegistered",
                LastDataRefresh = DateTime.UtcNow,
                NextRefreshDue = DateTime.UtcNow,
            };

            _context.Influencers.Add(influencer);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(influencer.Id.ToString(), influencer.Email, "Influencer", influencer.DisplayName);

            _logger.LogInformation("Influencer registered: {Email}", influencer.Email);

            return Ok(new
            {
                token,
                userType = "Influencer",
                userId = influencer.Id,
                name = influencer.Name,
                displayName = influencer.DisplayName,
                email = influencer.Email
            });
        }

        // ── Helpers ───────────────────────────────────────────────────────
        private string GenerateJwtToken(string userId, string email, string userType, string name)
        {
            var secret = _config["JwtSettings:Secret"] ?? "FALLBACK_SECRET_CHANGE_IN_PRODUCTION";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiry = int.TryParse(_config["JwtSettings:ExpiryHours"], out var h) ? h : 24;

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("UserType", userType),
                new Claim("UserId", userId),
                new Claim("Name", name),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: _config["JwtSettings:Issuer"] ?? "MatchFluence",
                audience: _config["JwtSettings:Audience"] ?? "MatchFluenceUsers",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiry),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string ComputeApiKeyHash(string key)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(key));
            return Convert.ToHexString(bytes).ToLower();
        }
    }

    public record LoginRequest(string Email, string Password);
    public record BrandRegisterRequest(string CompanyName, string Email, string Password, string? Industry, string? Website);
    public record AgencyRegisterRequest(string AgencyName, string Email, string Password, string? Website);
    public record InfluencerRegisterRequest(string DisplayName, string Email, string Password, string? InstagramHandle);
}
