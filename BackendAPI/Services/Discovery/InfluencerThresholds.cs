namespace BackendAPI.Services.Discovery
{
    // Central definition of what qualifies an account as an influencer
    // worth storing in the database. Applied during qualification checks
    // on every discovered account before it is written to the DB.
    public static class InfluencerThresholds
    {
        // Minimum followers to qualify
        public const int MinFollowers = 1_000;

        // Minimum number of posts — accounts with fewer are likely inactive or new
        public const int MinPostCount = 6;

        // Minimum engagement rate — filters out bought-follower accounts
        // with no real audience interaction
        public const decimal MinEngagementRate = 0.5m;

        // Maximum bot score — accounts above this are too risky to store
        public const decimal MaxBotScore = 0.60m;

        // Account must be public (enforced by API — private accounts return no data)

        // Priority tiers — determines refresh frequency
        // High priority: seeds, verified, campaign-active influencers → 24hr refresh
        // Low priority: newly discovered, unverified → 72hr refresh
        public const string PriorityHigh = "High";
        public const string PriorityLow = "Low";

        // How many hours between refreshes per priority tier
        public const int HighPriorityRefreshHours = 24;
        public const int LowPriorityRefreshHours = 72;
    }
}
