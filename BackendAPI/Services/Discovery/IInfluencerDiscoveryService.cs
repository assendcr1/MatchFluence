namespace BackendAPI.Services.Discovery
{
    public interface IInfluencerDiscoveryService
    {
        // Stage 1: Mine hashtags related to a niche, discover new accounts
        Task<List<DiscoveredAccount>> MineHashtagsAsync(
            string niche,
            List<string> hashtags,
            CancellationToken cancellationToken);

        // Stage 2: Expand from a known influencer — mine their posts for
        // mentions, tags, and co-appearing accounts
        Task<List<DiscoveredAccount>> ExpandFromInfluencerAsync(
            Guid influencerId,
            CancellationToken cancellationToken);

        // Stage 3: Qualify a discovered account against thresholds
        // Returns null if the account doesn't meet the criteria
        Task<DiscoveredAccount?> QualifyAccountAsync(
            string handle,
            CancellationToken cancellationToken);

        // Stage 4: Write a qualified account to the Influencers table
        // Returns the new influencer ID, or null if it already exists
        Task<Guid?> IngestAccountAsync(
            DiscoveredAccount account,
            int nicheId,
            int marketId,
            CancellationToken cancellationToken);

        // Full discovery run — runs all stages for all niches
        Task RunDiscoveryCycleAsync(CancellationToken cancellationToken);
    }
}
