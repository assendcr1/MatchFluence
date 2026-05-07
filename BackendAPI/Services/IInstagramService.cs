using BackendAPI.Models;

namespace BackendAPI.Services
{
    public interface IInstagramService
    {
        Task<InstagramProfile?> GetProfileAsync(string userId);
        Task<InstagramProfile?> GetPublicProfileAsync(string username);
        Task<List<InstagramMedia>> GetMediaAsync(string username);
        Task<List<string>> GetSimilarUsersAsync(string username);
        Task<List<string>> GetTaggedUsersAsync(string username);
        Task<MediaInsights?> GetMediaInsightsAsync(string mediaId);
        Task<AccountInsights?> GetAccountInsightsAsync(string userId);
    }
}
