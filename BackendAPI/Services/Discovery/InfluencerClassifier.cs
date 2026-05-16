using BackendAPI.Models;

namespace BackendAPI.Services.Discovery
{
    public class InfluencerClassifier
    {
        private readonly ILogger<InfluencerClassifier> _logger;

        public InfluencerClassifier(ILogger<InfluencerClassifier> logger)
        {
            _logger = logger;
        }

        // ── Market detection from biography ──────────────────────────────
        private static readonly Dictionary<string, int> LocationToMarket = new(StringComparer.OrdinalIgnoreCase)
        {
            // South Africa (MarketId 1)
            { "south africa", 1 }, { "southafrica", 1 }, { "cape town", 1 },
            { "capetown", 1 }, { "johannesburg", 1 }, { "joburg", 1 }, { "jozi", 1 },
            { "durban", 1 }, { "pretoria", 1 }, { "tshwane", 1 }, { "soweto", 1 },
            { "sandton", 1 }, { "mzansi", 1 }, { "proudly sa", 1 }, { "sa based", 1 },
            { "🇿🇦", 1 },
            // Nigeria (MarketId 2)
            { "nigeria", 2 }, { "lagos", 2 }, { "abuja", 2 }, { "nigerian", 2 },
            { "naija", 2 }, { "🇳🇬", 2 },
            // Kenya (MarketId 3)
            { "kenya", 3 }, { "nairobi", 3 }, { "kenyan", 3 }, { "🇰🇪", 3 },
            // Ghana (MarketId 4)
            { "ghana", 4 }, { "accra", 4 }, { "ghanaian", 4 }, { "🇬🇭", 4 },
            // Egypt (MarketId 5)
            { "egypt", 5 }, { "cairo", 5 }, { "egyptian", 5 }, { "🇪🇬", 5 },
            // UK (MarketId 6)
            { "london", 6 }, { "united kingdom", 6 }, { "uk based", 6 }, { "🇬🇧", 6 },
            // USA (MarketId 7)
            { "new york", 7 }, { "los angeles", 7 }, { "usa", 7 }, { "new york city", 7 },
            { "nyc", 7 }, { "la based", 7 }, { "🇺🇸", 7 },
            // Australia (MarketId 8)
            { "australia", 8 }, { "sydney", 8 }, { "melbourne", 8 }, { "🇦🇺", 8 },
            // UAE (MarketId 9)
            { "dubai", 9 }, { "uae", 9 }, { "abu dhabi", 9 }, { "🇦🇪", 9 },
        };

        // ── Niche detection from category_name + biography ────────────────
        private static readonly Dictionary<string, int> CategoryToNiche = new(StringComparer.OrdinalIgnoreCase)
        {
            { "fitness", 1 }, { "athlete", 1 }, { "personal trainer", 1 },
            { "health", 1 }, { "runner", 1 }, { "yoga", 1 }, { "gym", 1 },
            { "fashion", 2 }, { "model", 2 }, { "stylist", 2 }, { "fashion designer", 2 },
            { "food", 3 }, { "chef", 3 }, { "baker", 3 }, { "foodie", 3 }, { "recipe", 3 },
            { "beauty", 4 }, { "makeup", 4 }, { "skincare", 4 }, { "cosmetics", 4 },
            { "hair", 4 }, { "nail", 4 },
            { "tech", 5 }, { "technology", 5 }, { "developer", 5 },
            { "travel", 6 }, { "adventure", 6 }, { "explorer", 6 },
            { "lifestyle", 7 }, { "blogger", 7 }, { "content creator", 7 },
            { "public figure", 7 },
            { "gaming", 8 }, { "gamer", 8 }, { "esports", 8 },
            { "finance", 9 }, { "investor", 9 }, { "entrepreneur", 9 },
            { "parent", 10 }, { "mom", 10 }, { "dad", 10 }, { "family", 10 },
            { "comedian", 11 }, { "comedy", 11 }, { "skit", 11 },
            { "streamer", 12 }, { "streaming", 12 }, { "twitch", 12 },
            { "musician", 13 }, { "artist", 13 }, { "singer", 13 }, { "rapper", 13 },
            { "dj", 13 }, { "entertainer", 13 }, { "actor", 13 }, { "actress", 13 },
        };

        private static readonly Dictionary<string, int> BiographyNicheKeywords = new(StringComparer.OrdinalIgnoreCase)
        {
            { "fitness", 1 }, { "workout", 1 }, { "gym", 1 }, { "athlete", 1 },
            { "fashion", 2 }, { "style", 2 }, { "ootd", 2 }, { "model", 2 },
            { "food", 3 }, { "chef", 3 }, { "recipe", 3 }, { "cook", 3 }, { "baking", 3 },
            { "beauty", 4 }, { "makeup", 4 }, { "skincare", 4 }, { "mua", 4 },
            { "tech", 5 }, { "software", 5 }, { "coding", 5 }, { "developer", 5 },
            { "travel", 6 }, { "wanderlust", 6 }, { "explore", 6 },
            { "lifestyle", 7 }, { "wellness", 7 },
            { "gaming", 8 }, { "gamer", 8 }, { "streamer", 8 },
            { "finance", 9 }, { "investing", 9 }, { "money", 9 }, { "crypto", 9 },
            { "mom", 10 }, { "dad", 10 }, { "parent", 10 }, { "family", 10 },
            { "comedy", 11 }, { "comedian", 11 }, { "funny", 11 }, { "skit", 11 },
            { "stream", 12 }, { "twitch", 12 },
            { "music", 13 }, { "singer", 13 }, { "rapper", 13 }, { "dj", 13 },
            { "actor", 13 }, { "actress", 13 }, { "entertainment", 13 },
        };

        // ── Brand detection signals ───────────────────────────────────────
        private static readonly HashSet<string> BrandCategoryKeywords = new(StringComparer.OrdinalIgnoreCase)
        {
            "retail", "shopping", "grocery", "supermarket", "store", "shop",
            "bank", "banking", "insurance", "financial service",
            "telecom", "telecommunications", "automotive", "airline",
            "hotel", "travel agency", "software company", "news",
            "media company", "publisher", "sports team", "football club",
            "rugby club", "cricket club", "government", "non-profit",
            "event", "festival", "conference", "award", "museum",
            "clothing brand", "cosmetics brand", "beauty brand",
        };

        // These categories confirm it's a real person/influencer even if is_business_account=true
        private static readonly HashSet<string> InfluencerSafeCategories = new(StringComparer.OrdinalIgnoreCase)
        {
            "digital creator", "content creator", "public figure", "artist",
            "musician", "actor", "actress", "model", "comedian", "blogger",
            "personal blog", "fitness trainer", "chef", "photographer",
            "writer", "journalist", "entrepreneur", "motivational speaker",
            "beauty expert", "fashion designer", "makeup artist", "dj",
            "tv personality", "radio personality", "producer", "dancer",
            "athlete", "sports personality", "influencer", "youtuber",
            "gamer", "streamer", "health coach", "life coach",
        };

        public ClassificationResult Classify(InstagramProfile profile, int fallbackNicheId, int fallbackMarketId)
        {
            var result = new ClassificationResult
            {
                NicheId = fallbackNicheId,
                MarketId = 10, // Default to Global (10) — only override if HIGH confidence
                IsBrand = false,
                Confidence = "Low"
            };

            // ── Brand detection ───────────────────────────────────────────
            // Check safe influencer categories FIRST — bypass all brand signals
            bool isSafeCreator = false;
            if (!string.IsNullOrEmpty(profile.CategoryName))
            {
                foreach (var safeCategory in InfluencerSafeCategories)
                {
                    if (profile.CategoryName.Contains(safeCategory, StringComparison.OrdinalIgnoreCase))
                    {
                        isSafeCreator = true;
                        break;
                    }
                }
            }

            if (!isSafeCreator)
            {
                // Signal 1: category_name contains brand keyword
                if (!string.IsNullOrEmpty(profile.CategoryName))
                {
                    foreach (var keyword in BrandCategoryKeywords)
                    {
                        if (profile.CategoryName.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                        {
                            result.IsBrand = true;
                            result.BrandReason = $"Category: {profile.CategoryName}";
                            return result;
                        }
                    }
                }

                // Signal 2: is_business_account + very low following
                if (profile.IsBusinessAccount && profile.FollowersCount > 10000
                    && profile.FollowsCount < 200)
                {
                    result.IsBrand = true;
                    result.BrandReason = $"Business account with low following ({profile.FollowsCount})";
                    return result;
                }

                // Signal 3: extreme ratio — only if no category set
                if (string.IsNullOrEmpty(profile.CategoryName)
                    && profile.FollowersCount > 100000
                    && profile.FollowsCount < (profile.FollowersCount * 0.001))
                {
                    result.IsBrand = true;
                    result.BrandReason = $"Extreme ratio with no category: {profile.FollowersCount} followers, {profile.FollowsCount} following";
                    return result;
                }
            }
            // ── Market detection from biography ───────────────────────────
            if (!string.IsNullOrEmpty(profile.Biography))
            {
                var bio = profile.Biography.ToLower();
                foreach (var kvp in LocationToMarket)
                {
                    if (bio.Contains(kvp.Key.ToLower(), StringComparison.OrdinalIgnoreCase))
                    {
                        result.MarketId = kvp.Value;
                        result.Confidence = "High";
                        break;
                    }
                }
            }

            // ── Niche detection ───────────────────────────────────────────
            // Priority 1: category_name
            if (!string.IsNullOrEmpty(profile.CategoryName))
            {
                foreach (var kvp in CategoryToNiche)
                {
                    if (profile.CategoryName.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
                    {
                        result.NicheId = kvp.Value;
                        result.Confidence = result.Confidence == "High" ? "High" : "Medium";
                        return result;
                    }
                }
            }

            // Priority 2: biography keywords
            if (!string.IsNullOrEmpty(profile.Biography))
            {
                var bio = profile.Biography.ToLower();
                foreach (var kvp in BiographyNicheKeywords)
                {
                    if (bio.Contains(kvp.Key.ToLower(), StringComparison.OrdinalIgnoreCase))
                    {
                        result.NicheId = kvp.Value;
                        result.Confidence = result.Confidence == "High" ? "High" : "Medium";
                        return result;
                    }
                }
            }

            return result;
        }
    }

    public class ClassificationResult
    {
        public bool IsBrand { get; set; }
        public string? BrandReason { get; set; }
        public int NicheId { get; set; }
        public int MarketId { get; set; }
        public string Confidence { get; set; } = "Low";
    }
}
