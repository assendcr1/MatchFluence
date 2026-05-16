using System.Text;
using System.Text.Json;

namespace BackendAPI.Services.Discovery
{
    public class GeminiClassificationResult
    {
        public int NicheId { get; set; } = 7;       // Default: Lifestyle
        public int MarketId { get; set; } = 10;      // Default: Global
        public string NicheName { get; set; } = "Lifestyle";
        public string MarketName { get; set; } = "Global";
        public string Confidence { get; set; } = "Low";
        public string Reasoning { get; set; } = "";
    }

    public class GeminiClassificationService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<GeminiClassificationService> _logger;
        private readonly string _apiKey;

        // Niche mapping
        private static readonly Dictionary<string, int> NicheMap = new(StringComparer.OrdinalIgnoreCase)
        {
            { "Fitness", 1 }, { "Fashion", 2 }, { "Food", 3 }, { "Beauty", 4 },
            { "Tech", 5 }, { "Travel", 6 }, { "Lifestyle", 7 }, { "Gaming", 8 },
            { "Finance", 9 }, { "Parenting", 10 }, { "Comedy", 11 }, { "Streaming", 12 },
            { "Entertainment", 13 }
        };

        // Market mapping
        private static readonly Dictionary<string, int> MarketMap = new(StringComparer.OrdinalIgnoreCase)
        {
            { "South Africa", 1 }, { "Nigeria", 2 }, { "Kenya", 3 }, { "Ghana", 4 },
            { "Egypt", 5 }, { "United Kingdom", 6 }, { "UK", 6 },
            { "United States", 7 }, { "USA", 7 }, { "US", 7 },
            { "Australia", 8 }, { "UAE", 9 }, { "United Arab Emirates", 9 },
            { "Global", 10 }, { "Zimbabwe", 11 }
        };

        public GeminiClassificationService(
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            ILogger<GeminiClassificationService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _apiKey = config["GeminiSettings:ApiKey"] ?? "";
            _logger = logger;
        }

        public async Task<GeminiClassificationResult> ClassifyInfluencerAsync(
            string handle, string name, string? biography, string? categoryName,
            int followerCount, int followingCount)
        {
            var result = new GeminiClassificationResult();

            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogWarning("Gemini API key not set — skipping AI classification for @{Handle}", handle);
                return result;
            }

            try
            {
                var client = _httpClientFactory.CreateClient();

                var prompt = $@"You are an influencer marketing analyst. Classify this Instagram influencer.

Instagram Handle: @{handle}
Display Name: {name}
Biography: {biography ?? "No biography"}
Category: {categoryName ?? "Not set"}
Followers: {followerCount:N0}
Following: {followingCount:N0}

Based on the handle, name, biography and your knowledge of public figures:

1. What COUNTRY are they based in or primarily creating content for?
2. What is their PRIMARY content niche?

Available niches: Fitness, Fashion, Food, Beauty, Tech, Travel, Lifestyle, Gaming, Finance, Parenting, Comedy, Streaming, Entertainment

Available markets: South Africa, Nigeria, Kenya, Ghana, Egypt, United Kingdom, United States, Australia, UAE, Zimbabwe, Global

If you are not sure about the country, use Global.
If the person is well known (celebrity, athlete, musician) use your knowledge to identify them.

Respond ONLY with valid JSON, no markdown:
{{""niche"": ""Lifestyle"", ""market"": ""South Africa"", ""confidence"": ""High"", ""reasoning"": ""brief explanation""}}";

                var body = new
                {
                    contents = new[] { new { parts = new[] { new { text = prompt } } } },
                    generationConfig = new { temperature = 0.1, maxOutputTokens = 150 }
                };

                var json = JsonSerializer.Serialize(body);
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={_apiKey}";

                // Retry up to 3 times for 503
                HttpResponseMessage response = null!;
                for (int attempt = 1; attempt <= 3; attempt++)
                {
                    response = await client.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));
                    if (response.IsSuccessStatusCode) break;
                    if ((int)response.StatusCode == 503 && attempt < 3)
                    {
                        await Task.Delay(attempt * 2000);
                        continue;
                    }
                    _logger.LogWarning("Gemini classification failed for @{Handle}: {Status}", handle, response.StatusCode);
                    return result;
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseJson);
                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString() ?? "";

                text = text.Replace("```json", "").Replace("```", "").Trim();

                using var parsed = JsonDocument.Parse(text);
                var root = parsed.RootElement;

                var niche = root.TryGetProperty("niche", out var n) ? n.GetString() ?? "Lifestyle" : "Lifestyle";
                var market = root.TryGetProperty("market", out var mk) ? mk.GetString() ?? "Global" : "Global";
                var confidence = root.TryGetProperty("confidence", out var c) ? c.GetString() ?? "Low" : "Low";
                var reasoning = root.TryGetProperty("reasoning", out var r) ? r.GetString() ?? "" : "";

                result.NicheName = niche;
                result.MarketName = market;
                result.Confidence = confidence;
                result.Reasoning = reasoning;
                result.NicheId = NicheMap.TryGetValue(niche, out var nid) ? nid : 7;
                result.MarketId = MarketMap.TryGetValue(market, out var mid) ? mid : 10;

                _logger.LogInformation(
                    "AI classified @{Handle} → Niche:{Niche} Market:{Market} Confidence:{Conf} | {Reason}",
                    handle, niche, market, confidence, reasoning);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gemini classification error for @{Handle}", handle);
                return result;
            }
        }
    }
}
