namespace BackendAPI.Services
{
    // Derives a bot/fake follower score (0.0 to 1.0) from observable signals.
    // No API gives you this directly — you calculate it from patterns.
    // 0.00 = fully authentic, 1.00 = entirely fake.
    public class BotScoreCalculator
    {
        // Signal weights
        private const decimal EngagementWeight = 0.40m;
        private const decimal FollowerRatioWeight = 0.30m;
        private const decimal PostFrequencyWeight = 0.20m;
        private const decimal GrowthConsistencyWeight = 0.10m;

        // Industry benchmarks
        private const decimal ExpectedEngagementAt10k = 0.05m;   // 5% for <10k
        private const decimal ExpectedEngagementAt100k = 0.03m;  // 3% for 10k-100k
        private const decimal ExpectedEngagementAt1m = 0.015m;   // 1.5% for 100k-1m
        private const decimal ExpectedEngagementAbove1m = 0.008m;// 0.8% for 1m+

        public decimal Calculate(
            int followerCount,
            int followingCount,
            decimal engagementRate,
            int postCount,
            int accountAgeDays,
            decimal? previousFollowerCount = null)
        {
            var signals = new List<(decimal score, decimal weight)>();

            // ── Signal 1: Engagement anomaly (40% weight) ────────────────────
            // Low engagement relative to follower count is the strongest bot signal.
            // Real audiences engage; bought followers don't.
            var expectedRate = followerCount switch
            {
                < 10_000 => ExpectedEngagementAt10k,
                < 100_000 => ExpectedEngagementAt100k,
                < 1_000_000 => ExpectedEngagementAt1m,
                _ => ExpectedEngagementAbove1m
            };

            decimal engagementSignal;
            if (engagementRate <= 0)
                engagementSignal = 0.9m; // No engagement at all — very suspicious
            else if (engagementRate >= expectedRate * 3)
                engagementSignal = 0.0m; // Unusually high — could be micro-niche, not a bot signal
            else if (engagementRate >= expectedRate)
                engagementSignal = 0.0m; // Meets benchmark — clean
            else
            {
                // Scales from 0 to 0.8 as engagement drops below benchmark
                var deficit = 1.0m - (engagementRate / expectedRate);
                engagementSignal = Math.Min(0.8m, deficit);
            }

            signals.Add((engagementSignal, EngagementWeight));

            // ── Signal 2: Follower/following ratio (30% weight) ──────────────
            // Accounts with massive follower counts but very low following counts
            // are generally fine (celebrities, brands). But accounts following
            // far more than their followers suggests follow-for-follow tactics
            // often associated with inflated follower counts.
            decimal ratioSignal = 0.0m;
            if (followingCount > 0)
            {
                var ratio = (decimal)followerCount / followingCount;
                if (ratio < 0.1m)
                    ratioSignal = 0.7m; // Following 10x more than followers — suspicious
                else if (ratio < 0.5m)
                    ratioSignal = 0.3m; // Following significantly more than followers
                else
                    ratioSignal = 0.0m; // Normal ratio
            }

            signals.Add((ratioSignal, FollowerRatioWeight));

            // ── Signal 3: Post frequency vs account age (20% weight) ─────────
            // Dormant accounts (very few posts for their age) often have
            // inflated follower counts from past purchase or follow-farming.
            decimal postFrequencySignal = 0.0m;
            if (accountAgeDays > 0 && postCount >= 0)
            {
                var postsPerMonth = (decimal)postCount / (accountAgeDays / 30m);
                if (postsPerMonth < 0.5m)
                    postFrequencySignal = 0.5m; // Less than 2 posts a month — dormant
                else if (postsPerMonth < 2m)
                    postFrequencySignal = 0.2m; // Infrequent
                else
                    postFrequencySignal = 0.0m; // Active
            }

            signals.Add((postFrequencySignal, PostFrequencyWeight));

            // ── Signal 4: Follower growth consistency (10% weight) ───────────
            // Sudden large spikes in follower count between refresh cycles
            // suggest bought followers. Natural growth is gradual.
            decimal growthSignal = 0.0m;
            if (previousFollowerCount.HasValue && previousFollowerCount.Value > 0)
            {
                var growthRate = Math.Abs(followerCount - previousFollowerCount.Value)
                                 / previousFollowerCount.Value;

                if (growthRate > 0.20m)
                    growthSignal = 0.8m; // 20%+ growth in 24hrs — very suspicious
                else if (growthRate > 0.10m)
                    growthSignal = 0.4m; // 10-20% growth — worth flagging
                else
                    growthSignal = 0.0m; // Normal growth
            }

            signals.Add((growthSignal, GrowthConsistencyWeight));

            // ── Weighted average ─────────────────────────────────────────────
            var weightedScore = signals.Sum(s => s.score * s.weight);

            // Clamp to 0.0–1.0 and round to 4 decimal places
            return Math.Round(Math.Max(0.0m, Math.Min(1.0m, weightedScore)), 4);
        }
    }
}
