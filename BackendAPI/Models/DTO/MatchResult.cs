namespace BackendAPI.Models.DTO
{
    // One entry in the top 5 results returned by the matching engine.
    public class MatchResult
    {
        public Guid InfluencerId { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string? InstagramHandle { get; set; }
        public string? TikTokHandle { get; set; }
        public string? YouTubeHandle { get; set; }
        public string? TwitterHandle { get; set; }
        public int FollowerCount { get; set; }
        public decimal EngagementRate { get; set; }
        public decimal BotScore { get; set; }
        public string? NicheName { get; set; }
        public string? MarketName { get; set; }

        // 0–100 overall match score
        public int MatchScore { get; set; }

        // Breakdown of how the score was calculated
        public ScoreBreakdown ScoreBreakdown { get; set; }

        // AI-generated plain-English explanation — null until AI layer runs
        public string? MatchReason { get; set; }

        // Any flags the brand should be aware of
        public List<string> RedFlags { get; set; } = new();
    }

    public class ScoreBreakdown
    {
        // Each component out of its max weight
        public int NicheScore { get; set; }         // max 30
        public int FollowerScore { get; set; }      // max 20
        public int EngagementScore { get; set; }    // max 25
        public int BotScore { get; set; }           // max 15
        public int PlatformScore { get; set; }      // max 10
        public int Total => NicheScore + FollowerScore + EngagementScore + BotScore + PlatformScore;
    }
}
