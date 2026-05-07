using BackendAPI.Models.DTO;
using System.Text;
using System.Text.Json;

namespace BackendAPI.Services
{
    public class ClaudeReasoningService : IAIReasoningService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ClaudeReasoningService> _logger;
        private readonly string _apiKey;

        public ClaudeReasoningService(
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            ILogger<ClaudeReasoningService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _apiKey = config["Anthropic:ApiKey"] ?? "";
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
                _logger.LogWarning("Anthropic API key not set — using template fallback");
                return FallbackRank(request, top10);
            }

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("x-api-key", _apiKey);
                client.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

                // Build candidate list for Claude
                var candidateList = string.Join("\n", top10.Select((r, i) =>
                    $"{i + 1}. @{r.InstagramHandle} | {r.FollowerCount:N0} followers | " +
                    $"{r.EngagementRate}% engagement | {r.BotScore:P0} bots | " +
                    $"Niche: {r.NicheName} | Market: {r.MarketName} | Score: {r.MatchScore}/100"));

                var prompt = $"""
                    You are an influencer marketing analyst specializing in African markets, particularly South Africa.

                    Campaign Brief:
                    Title: {request.CampaignTitle}
                    Description: {request.CampaignDescription}
                    Target Niche: {request.NicheName ?? "General"}
                    Target Market: {request.MarketName ?? "South Africa"}
                    Platform: {request.TargetPlatform}
                    Follower Range: {request.MinimumFollowers:N0} - {request.MaximumFollowers:N0}

                    Top 10 Candidates (pre-scored by algorithm):
                    {candidateList}

                    Select the TOP 5 influencers from this list that would deliver the best ROI for this campaign.
                    Consider engagement quality, audience authenticity, niche relevance, and market fit.

                    Respond ONLY with valid JSON in this exact format, no other text:
                    {{
                      "selections": [
                        {{
                          "rank": 1,
                          "handle": "instagram_handle",
                          "reason": "2-3 sentence analysis of why this influencer fits this specific campaign"
                        }}
                      ]
                    }}
                    """;

                var body = new
                {
                    model = "claude-sonnet-4-5",
                    max_tokens = 1000,
                    messages = new[] { new { role = "user", content = prompt } }
                };

                var json = JsonSerializer.Serialize(body);
                var httpContent = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await client.PostAsync("https://api.anthropic.com/v1/messages", httpContent);

                if (!response.IsSuccessStatusCode)
                {
                    var err = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Claude API error {Status}: {Error}",
                        response.StatusCode, err);
                    return FallbackRank(request, top10);
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseJson);

                if (!doc.RootElement.TryGetProperty("content", out var contentArr)
                    || contentArr.GetArrayLength() == 0)
                    return FallbackRank(request, top10);

                var text = contentArr[0].GetProperty("text").GetString() ?? "";

                // Parse Claude's JSON response
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

                // If Claude returned fewer than 5 fill from remaining top10
                if (finalResults.Count < 5)
                {
                    foreach (var remaining in top10)
                    {
                        if (finalResults.Count >= 5) break;
                        if (!finalResults.Any(r => r.InfluencerId == remaining.InfluencerId))
                        {
                            remaining.MatchReason ??= BuildFallbackReason(request, remaining);
                            finalResults.Add(remaining);
                        }
                    }
                }

                _logger.LogInformation("Claude selected and reasoned {Count} influencers", finalResults.Count);
                return finalResults.Take(5).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Claude RankAndReason failed");
                return FallbackRank(request, top10);
            }
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
            var engagementLabel = result.EngagementRate switch
            {
                >= 6 => "exceptional engagement",
                >= 3 => "strong engagement",
                >= 1 => "average engagement",
                _ => "below-average engagement"
            };
            var botLabel = result.BotScore <= 0.05m ? "a highly authentic audience"
                : result.BotScore <= 0.15m ? "a mostly authentic audience"
                : "some authenticity concerns worth reviewing";
            return $"{result.DisplayName} is a strong fit for {request.CampaignTitle}, " +
                   $"with {result.FollowerCount:N0} followers and {engagementLabel} at {result.EngagementRate}%. " +
                   $"Their audience shows {botLabel} for the {result.MarketName ?? "target"} market.";
        }
    }
}
