namespace BackendAPI.Services.Discovery
{
    // Intermediate representation of a discovered account
    // before it passes qualification and gets written to the Influencers table.
    // Keeps the discovery pipeline decoupled from the data model.
    public class DiscoveredAccount
    {
        public string Handle { get; set; }
        public string Name { get; set; }
        public int FollowerCount { get; set; }
        public int FollowingCount { get; set; }
        public int PostCount { get; set; }
        public decimal EngagementRate { get; set; }
        public string Platform { get; set; } = "Instagram";

        // Tags and topics extracted from recent posts
        public List<string> ExtractedHashtags { get; set; } = new();
        public List<string> MentionedAccounts { get; set; } = new();

        // How this account was found
        public string DiscoverySource { get; set; }

        // The influencer ID that led to this discovery (for graph tracing)
        public Guid? DiscoveredFromInfluencerId { get; set; }

        // The hashtag or keyword that surfaced this account
        public string? DiscoveryContext { get; set; }
    }
}
