using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace BackendAPI.Auth
{
    // Reads the X-Api-Key header, looks up the hash in Brands and Agencies tables,
    // and sets the ClaimsPrincipal so [Authorize] works on protected controllers.
    public class ApiKeyAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        private readonly ApplicationDbContext _context;
        private readonly ApiKeyService _apiKeyService;

        public const string SchemeName = "ApiKey";
        public const string HeaderName = "X-Api-Key";

        public ApiKeyAuthenticationHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ApplicationDbContext context,
            ApiKeyService apiKeyService)
            : base(options, logger, encoder)
        {
            _context = context;
            _apiKeyService = apiKeyService;
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.TryGetValue(HeaderName, out var apiKeyValues))
                return AuthenticateResult.Fail("Missing X-Api-Key header.");

            var rawKey = apiKeyValues.FirstOrDefault();
            if (string.IsNullOrEmpty(rawKey))
                return AuthenticateResult.Fail("Empty X-Api-Key header.");

            var keyHash = _apiKeyService.HashApiKey(rawKey);

            // Check Brands first
            var brand = await _context.Brands
                .FirstOrDefaultAsync(b => b.ApiKeyHash == keyHash);

            if (brand != null)
            {
                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, brand.Id.ToString()),
                    new Claim(ClaimTypes.Name, brand.CompanyName),
                    new Claim(ClaimTypes.Email, brand.Email),
                    new Claim("UserType", "Brand"),
                    new Claim("UserId", brand.Id.ToString())
                };

                var identity = new ClaimsIdentity(claims, SchemeName);
                var principal = new ClaimsPrincipal(identity);
                var ticket = new AuthenticationTicket(principal, SchemeName);
                return AuthenticateResult.Success(ticket);
            }

            // Check Agencies
            var agency = await _context.Agencies
                .FirstOrDefaultAsync(a => a.ApiKeyHash == keyHash);

            if (agency != null)
            {
                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, agency.Id.ToString()),
                    new Claim(ClaimTypes.Name, agency.AgencyName),
                    new Claim(ClaimTypes.Email, agency.Email),
                    new Claim("UserType", "Agency"),
                    new Claim("UserId", agency.Id.ToString())
                };

                var identity = new ClaimsIdentity(claims, SchemeName);
                var principal = new ClaimsPrincipal(identity);
                var ticket = new AuthenticationTicket(principal, SchemeName);
                return AuthenticateResult.Success(ticket);
            }

            return AuthenticateResult.Fail("Invalid API key.");
        }
    }
}
