using BackendAPI.Models.DTO;
using System.Text;
using System.Text.Json;

namespace BackendAPI.Services
{
    // Uses Ollama running locally — completely free, no API key needed.
    // Ollama runs open-source models (Llama 3) inside your Codespace or server.
    //
    // Setup (run once in terminal):
    //   curl -fsSL https://ollama.com/install.sh | sh
    //   ollama pull llama3.2
    //   ollama serve   (runs in background on port 11434)
    //
    // When you have funding, replace this with ClaudeReasoningService
    // and update the registration in Program.cs — nothing else changes.
    public class OllamaReasoningService : IAIReasoningService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<OllamaReasoningService> _logger;
        private readonly string _ollamaUrl;
        private readonly string _model;

        public OllamaReasoningService(HttpClient httpClient, IConfiguration config,
            ILogger<OllamaReasoningService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _ollamaUrl = config["OllamaSettings:BaseUrl"] ?? "http://localhost:11434";
            _model = config["OllamaSettings:Model"] ?? "llama3.2";
        }

        public async Task<string?> GenerateReasonAsync(MatchRequest request, MatchResult result)
        {
            var prompt = BuildPrompt(request, result);

            var payload = new
            {
                model = _model,
                prompt = prompt,
                stream = false,
                options = new { temperature = 0.3, num_predict = 150 }
            };

            try
            {
                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // 60 second timeout — don't block the response waiting for AI
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
                var response = await _httpClient.PostAsync(
                    $"{_ollamaUrl}/api/generate", content, cts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Ollama returned {StatusCode}", response.StatusCode);
                    return null;
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseJson);

                if (doc.RootElement.TryGetProperty("response", out var responseText))
                    return responseText.GetString()?.Trim();

                return null;
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Ollama reasoning timed out for influencer {Id}", result.InfluencerId);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ollama reasoning failed for influencer {Id}", result.InfluencerId);
                return null;
            }
        }

        private string BuildPrompt(MatchRequest request, MatchResult result)
        {
            var redFlagText = result.RedFlags.Any()
                ? $"Concerns: {string.Join(", ", result.RedFlags)}."
                : "No concerns flagged.";

            return $"""
                You are an influencer marketing analyst. Write exactly 2 sentences explaining 
                why this influencer is a good match for this campaign. Be specific and concise.
                Do not use bullet points. Do not repeat the numbers back — interpret them.

                Campaign: {request.CampaignTitle}
                Description: {request.CampaignDescription}
                Target platform: {request.TargetPlatform}
                Target niche: {result.NicheName ?? "Not specified"}
                Target market: {result.MarketName ?? "Not specified"}

                Influencer: {result.DisplayName}
                Followers: {result.FollowerCount:N0}
                Engagement rate: {result.EngagementRate}%
                Bot score: {result.BotScore:P0} suspected fake followers
                Niche: {result.NicheName ?? "Unknown"}
                Market: {result.MarketName ?? "Unknown"}
                Match score: {result.MatchScore}/100
                {redFlagText}

                Two-sentence match explanation:
                """;
        }
    }
}
