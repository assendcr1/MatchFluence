using BackendAPI.Models.DTO;
using System.Text;
using System.Text.Json;

namespace BackendAPI.Services
{
    public class GeminiReasoningService : IAIReasoningService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<GeminiReasoningService> _logger;
        private readonly string _apiKey;

        public GeminiReasoningService(
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            ILogger<GeminiReasoningService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _apiKey = config["GeminiSettings:ApiKey"] ?? "";
            _logger = logger;
        }

        public async Task<string?> GenerateReasonAsync(MatchRequest request, MatchResult result)
        {
            var results = await RankAndReasonAsync(request, new List<MatchResult> { result });
            return results.FirstOrDefault()?.MatchReason;
        }

        public async Task<List<MatchResult>> RankAndReasonAsync(
            MatchRequest request, List<MatchResult> top10)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogWarning("Gemini API key not set — using template fallback");
                return FallbackRank(request, top10);
            }

            try
            {
                var client = _httpClientFactory.CreateClient();
                var candidateList = string.Join("\n", top10.Select((r, i) =>
                    $"{i + 1}. @{r.InstagramHandle} | {r.FollowerCount:N0} followers | " +
                    $"{r.EngagementRate}% engagement | {r.BotScore:P0} bots | " +
                    $"Niche: {r.NicheName} | Market: {r.MarketName} | Score: {r.MatchScore}/100"));

                var prompt = "You are an influencer marketing analyst specializing in African markets.\n\n" +
                    "Campaign: " + request.CampaignTitle + "\n" +
                    "Description: " + request.CampaignDescription + "\n" +
                    "Platform: " + request.TargetPlatform + "\n" +
                    "Follower Range: " + request.MinimumFollowers.ToString("N0") + " - " + request.MaximumFollowers.ToString("N0") + "\n\n" +
                    "Top 10 Candidates:\n" + candidateList + "\n\n" +
                    "Select the TOP 5 that would deliver the best ROI for this specific campaign. " +
                    "Consider engagement quality, audience authenticity, niche relevance, and market fit. " +
                    "Respond ONLY with valid JSON, no markdown:\n" +
                    "{\"selections\":[{\"rank\":1,\"handle\":\"username\",\"reason\":\"2-3 sentence analysis why this influencer fits this campaign\"}]}";

                var body = new
                {
                    contents = new[] { new { parts = new[] { new { text = prompt } } } },
                    generationConfig = new { temperature = 0.3, maxOutputTokens = 1000 }
                };

                var json = JsonSerializer.Serialize(body);
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
                var response = await client.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));

                if (!response.IsSuccessStatusCode)
                {
                    var err = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Gemini error {Status}: {Error}", response.StatusCode, err);
                    return FallbackRank(request, top10);
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseJson);

                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString() ?? "";

                // Strip markdown if present
                text = text.Replace("```json", "").Replace("```", "").Trim();

                using var resultDoc = JsonDocument.Parse(text);
                if (!resultDoc.RootElement.TryGetProperty("selections", out var selections))
                    return FallbackRank(request, top10);

                var finalResults = new List<MatchResult>();
                foreach (var selection in selections.EnumerateArray())
                {
                    var handle = selection.TryGetProperty("handle", out var h)
                        ? h.GetString()?.TrimStart('@').ToLower() : null;
                    var reason = selection.TryGetProperty("reason", out var r)
                        ? r.GetString() : null;

                    if (string.IsNullOrEmpty(handle)) continue;

                    var match = top10.FirstOrDefault(x =>
                        x.InstagramHandle?.TrimStart('@').ToLower() == handle ||
                        x.DisplayName?.ToLower() == handle);

                    if (match != null)
                    {
                        match.MatchReason = reason;
                        finalResults.Add(match);
                    }
                }

                // Fill remaining spots if Gemini returned fewer than 5
                foreach (var remaining in top10)
                {
                    if (finalResults.Count >= 5) break;
                    if (!finalResults.Any(r => r.InfluencerId == remaining.InfluencerId))
                    {
                        remaining.MatchReason ??= BuildFallbackReason(request, remaining);
                        finalResults.Add(remaining);
                    }
                }

                _logger.LogInformation("Gemini selected {Count} influencers", finalResults.Count);
                return finalResults.Take(5).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gemini RankAndReason failed");
                return FallbackRank(request, top10);
            }
        }

        // Gemini influencer summary for search feature
        public async Task<string> GenerateInfluencerSummaryAsync(
            string handle, int followers, decimal engagement, decimal botScore,
            int postCount, string niche, string market)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return BuildTemplateSummary(handle, followers, engagement, botScore, niche, market);

            try
            {
                var client = _httpClientFactory.CreateClient();
                var prompt = $"You are an influencer marketing analyst. Provide a concise 3-4 sentence professional summary of this influencer for a brand considering working with them.\n\n" +
                    $"Handle: @{handle}\n" +
                    $"Followers: {followers:N0}\n" +
                    $"Engagement Rate: {engagement}%\n" +
                    $"Estimated Bot/Fake Followers: {botScore:P0}\n" +
                    $"Posts: {postCount}\n" +
                    $"Niche: {niche}\n" +
                    $"Market: {market}\n\n" +
                    $"Focus on: audience quality, engagement strength, brand partnership potential, and any concerns. Be direct and data-driven.";

                var body = new
                {
                    contents = new[] { new { parts = new[] { new { text = prompt } } } },
                    generationConfig = new { temperature = 0.4, maxOutputTokens = 300 }
                };

                var json = JsonSerializer.Serialize(body);
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
                var response = await client.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));

                if (!response.IsSuccessStatusCode) 
                    return BuildTemplateSummary(handle, followers, engagement, botScore, niche, market);

                var responseJson = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseJson);
                return doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString() ?? BuildTemplateSummary(handle, followers, engagement, botScore, niche, market);
            }
            catch
            {
                return BuildTemplateSummary(handle, followers, engagement, botScore, niche, market);
            }
        }

        private static string BuildTemplateSummary(string handle, int followers, decimal engagement, decimal botScore, string niche, string market)
        {
            var engLabel = engagement >= 6 ? "exceptional" : engagement >= 3 ? "strong" : engagement >= 1 ? "average" : "below-average";
            var authLabel = botScore <= 0.05m ? "highly authentic" : botScore <= 0.15m ? "mostly authentic" : "questionable authenticity";
            return $"@{handle} is a {niche} creator in {market} with {followers:N0} followers and {engLabel} engagement at {engagement}%. " +
                   $"Their audience shows {authLabel} ({botScore:P0} estimated bots), making them {(botScore <= 0.15m ? "a reliable" : "a risky")} choice for brand partnerships.";
        }

        private List<MatchResult> FallbackRank(MatchRequest request, List<MatchResult> top10)
        {
            var top5 = top10.Take(5).ToList();
            foreach (var r in top5)
                r.MatchReason ??= BuildFallbackReason(request, r);
            return top5;
        }

        private static string BuildFallbackReason(MatchRequest request, MatchResult result)
        {
            var engLabel = result.EngagementRate >= 6 ? "exceptional" : result.EngagementRate >= 3 ? "strong" : "average";
            var botLabel = result.BotScore <= 0.05m ? "highly authentic audience" : result.BotScore <= 0.15m ? "mostly authentic audience" : "some authenticity concerns";
            return $"@{result.DisplayName} is a strong fit for {request.CampaignTitle} with {result.FollowerCount:N0} followers and {engLabel} engagement at {result.EngagementRate}%. Their {botLabel} makes them a reliable choice for the {result.MarketName ?? "target"} market.";
        }
    }
}
