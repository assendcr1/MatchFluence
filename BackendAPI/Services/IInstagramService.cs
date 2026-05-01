using BackendAPI.Models;

namespace BackendAPI.Services
{
    public interface IInstagramService
    {
        Task<InstagramProfile> GetProfileAsync(string userId);
        Task<List<InstagramMedia>> GetMediaAsync(string userId);

        // Fixed return types — was Task<string> (raw JSON)
        Task<MediaInsights?> GetMediaInsightsAsync(string mediaId);
        Task<AccountInsights?> GetAccountInsightsAsync(string userId);
    }
}
