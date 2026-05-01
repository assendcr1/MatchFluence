namespace BackendAPI.Services
{
    public interface IInfluencerRefreshService
    {
        Task RefreshInfluencerAsync(Guid influencerId, CancellationToken cancellationToken);
        Task RefreshAllAsync(CancellationToken cancellationToken);

        // Refresh only influencers matching a priority tier ("High" or "Low")
        // that are due for a refresh based on their NextRefreshDue timestamp
        Task RefreshByPriorityAsync(string priority, CancellationToken cancellationToken);

        // Promote an influencer to high priority — called when they appear
        // in a match result or get contacted for a campaign
        Task PromoteToHighPriorityAsync(Guid influencerId);
    }
}
