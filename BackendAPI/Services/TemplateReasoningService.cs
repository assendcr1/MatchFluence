using BackendAPI.Models.DTO;
namespace BackendAPI.Services
{
    public class TemplateReasoningService : IAIReasoningService
    {
        public Task<string?> GenerateReasonAsync(MatchRequest request, MatchResult result)
        {
            return Task.FromResult<string?>(BuildReason(request, result));
        }

        public Task<List<MatchResult>> RankAndReasonAsync(MatchRequest request, List<MatchResult> top10)
        {
            var top5 = top10.Take(5).ToList();
            foreach (var result in top5)
                result.MatchReason = BuildReason(request, result);
            return Task.FromResult(top5);
        }

        private static string BuildReason(MatchRequest request, MatchResult result)
        {
            var engagementLabel = result.EngagementRate switch
            {
                >= 6 => "exceptional engagement",
                >= 3 => "strong engagement",
                >= 1 => "average engagement",
                _ => "below-average engagement"
            };
            var botLabel = result.BotScore <= 0.05m
                ? "a highly authentic audience"
                : result.BotScore <= 0.15m
                    ? "a mostly authentic audience"
                    : "some authenticity concerns worth reviewing";
            return $"{result.DisplayName} is a strong fit for the {request.CampaignTitle} campaign, " +
                   $"with {result.FollowerCount:N0} followers in the {result.NicheName ?? "target"} niche " +
                   $"and {engagementLabel} at {result.EngagementRate}%. " +
                   $"Their audience shows {botLabel}, making them a reliable choice " +
                   $"for reaching the {result.MarketName ?? "target"} market effectively.";
        }
    }
}
