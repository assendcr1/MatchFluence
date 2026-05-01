using BackendAPI.Data;
using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/instagram")]
    public class InstagramOAuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IInfluencerRefreshService _refreshService;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly ILogger<InstagramOAuthController> _logger;

        public InstagramOAuthController(
            ApplicationDbContext context,
            IInfluencerRefreshService refreshService,
            IConfiguration config,
            HttpClient httpClient,
            ILogger<InstagramOAuthController> logger)
        {
            _context = context;
            _refreshService = refreshService;
            _config = config;
            _httpClient = httpClient;
            _logger = logger;
        }

        [HttpGet("auth-url")]
        public IActionResult GetAuthUrl([FromQuery] Guid influencerId)
        {
            var appId = _config["InstagramSettings:AppId"];
            var redirectUri = _config["InstagramSettings:RedirectUri"];

            if (string.IsNullOrEmpty(appId) || string.IsNullOrEmpty(redirectUri))
                return BadRequest(new { message = "Instagram OAuth not configured." });

            // Instagram Basic Display API scopes only
            var scope = "instagram_basic,instagram_content_publish";
            var state = influencerId.ToString();

            var authUrl = $"https://api.instagram.com/oauth/authorize" +
                          $"?client_id={appId}" +
                          $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                          $"&scope={scope}" +
                          $"&response_type=code" +
                          $"&state={state}";

            return Ok(new { authUrl });
        }

        [HttpPost("callback")]
        public async Task<IActionResult> HandleCallback(
            [FromBody] OAuthCallbackRequest request,
            CancellationToken cancellationToken)
        {
            var appId = _config["InstagramSettings:AppId"];
            var appSecret = _config["InstagramSettings:AppSecret"];
            var redirectUri = _config["InstagramSettings:RedirectUri"];

            if (string.IsNullOrEmpty(appId) || string.IsNullOrEmpty(appSecret))
                return BadRequest(new { message = "Instagram OAuth not configured." });

            try
            {
                var tokenResponse = await ExchangeCodeForTokenAsync(
                    request.Code, appId, appSecret, redirectUri);

                if (tokenResponse == null)
                    return BadRequest(new { message = "Failed to exchange code for token." });

                var longLivedToken = await ExchangeForLongLivedTokenAsync(
                    tokenResponse.AccessToken, appSecret);

                var finalToken = longLivedToken ?? tokenResponse.AccessToken;
                var tokenExpiry = longLivedToken != null
                    ? DateTime.UtcNow.AddDays(59)
                    : DateTime.UtcNow.AddHours(1);

                if (!Guid.TryParse(request.State, out var influencerId))
                    return BadRequest(new { message = "Invalid state parameter." });

                var influencer = await _context.Influencers.FindAsync(
                    new object[] { influencerId }, cancellationToken);

                if (influencer == null)
                    return NotFound(new { message = "Influencer not found." });

                var igUsername = await GetInstagramUsernameAsync(finalToken);

                influencer.AccessToken = finalToken;
                influencer.TokenExpiry = tokenExpiry;
                if (!string.IsNullOrEmpty(igUsername))
                    influencer.InstagramHandle = "@" + igUsername;

                await _context.SaveChangesAsync(cancellationToken);
                await _refreshService.RefreshInfluencerAsync(influencerId, cancellationToken);

                _logger.LogInformation("Instagram connected for {Id}", influencerId);

                return Ok(new { message = "Instagram connected successfully.", influencerId, tokenExpiry });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OAuth callback failed");
                return StatusCode(500, new { message = "OAuth flow failed. Please try again." });
            }
        }

        [HttpGet("status/{influencerId}")]
        public async Task<IActionResult> GetConnectionStatus(Guid influencerId)
        {
            var influencer = await _context.Influencers.FindAsync(influencerId);
            if (influencer == null) return NotFound();

            var isConnected = !string.IsNullOrEmpty(influencer.AccessToken)
                              && influencer.TokenExpiry > DateTime.UtcNow;

            return Ok(new
            {
                isConnected,
                tokenExpiry = influencer.TokenExpiry,
                instagramHandle = influencer.InstagramHandle
            });
        }

        private async Task<TokenResponse?> ExchangeCodeForTokenAsync(
            string code, string appId, string appSecret, string redirectUri)
        {
            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string,string>("client_id", appId),
                new KeyValuePair<string,string>("client_secret", appSecret),
                new KeyValuePair<string,string>("grant_type", "authorization_code"),
                new KeyValuePair<string,string>("redirect_uri", redirectUri),
                new KeyValuePair<string,string>("code", code),
            });

            var response = await _httpClient.PostAsync(
                "https://api.instagram.com/oauth/access_token", content);

            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync();
                _logger.LogError("Token exchange failed: {Error}", err);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<TokenResponse>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }

        private async Task<string?> ExchangeForLongLivedTokenAsync(
            string shortToken, string appSecret)
        {
            try
            {
                var url = $"https://graph.instagram.com/access_token" +
                          $"?grant_type=ig_exchange_token" +
                          $"&client_secret={appSecret}" +
                          $"&access_token={shortToken}";

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return null;

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                return doc.RootElement.TryGetProperty("access_token", out var token)
                    ? token.GetString() : null;
            }
            catch { return null; }
        }

        private async Task<string?> GetInstagramUsernameAsync(string accessToken)
        {
            try
            {
                var url = $"https://graph.instagram.com/me?fields=id,username&access_token={accessToken}";
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return null;

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                return doc.RootElement.TryGetProperty("username", out var u)
                    ? u.GetString() : null;
            }
            catch { return null; }
        }
    }

    public class OAuthCallbackRequest
    {
        public string Code { get; set; } = "";
        public string State { get; set; } = "";
    }

    public class TokenResponse
    {
        public string AccessToken { get; set; } = "";
        public string TokenType { get; set; } = "";
    }
}
