using BackendAPI.Models.DTO;

namespace BackendAPI.Services
{
    public interface IMatchingService
    {
        // Takes a campaign brief, returns top 5 scored and ranked influencers.
        Task<List<MatchResult>> GetTopMatchesAsync(MatchRequest request);
    }
}
