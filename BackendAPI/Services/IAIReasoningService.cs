using BackendAPI.Models.DTO;
namespace BackendAPI.Services
{
    public interface IAIReasoningService
    {
        Task<string?> GenerateReasonAsync(MatchRequest request, MatchResult result);
        Task<List<MatchResult>> RankAndReasonAsync(MatchRequest request, List<MatchResult> top10);
    }
}
