using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.Models.DTO;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Services
{
    public class MatchingService : IMatchingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAIReasoningService _aiReasoning;
        private readonly ILogger<MatchingService> _logger;

        public MatchingService(
            ApplicationDbContext context,
            IAIReasoningService aiReasoning,
            ILogger<MatchingService> logger)
        {
            _context = context;
            _aiReasoning = aiReasoning;
            _logger = logger;
        }

        public async Task<List<MatchResult>> GetTopMatchesAsync(MatchRequest request)
        {
            _logger.LogInformation("Starting match for campaign: {Title}", request.CampaignTitle);

            // ── Step 1: Hard filters ─────────────────────────────────────────
            // Pull only influencers that meet the non-negotiable criteria.
            // This narrows the pool before scoring begins.

            var query = _context.Influencers
                .Include(i => i.Niche)
                .Include(i => i.Market)
                .AsQueryable();

            // Follower range — must be within band
            query = query.Where(i =>
                i.FollowerCount >= request.MinimumFollowers &&
                i.FollowerCount <= request.MaximumFollowers);

            // Niche match — if specified
            if (request.NicheId.HasValue)
                query = query.Where(i => i.NicheId == request.NicheId.Value);

            // Market match — if specified
            if (request.MarketId.HasValue)
                query = query.Where(i => i.MarketId == request.MarketId.Value);

            // Minimum engagement rate — if specified
            if (request.MinEngagementRate.HasValue)
                query = query.Where(i => i.EngagementRate >= request.MinEngagementRate.Value);

            // Maximum bot score — if specified (e.g. reject anyone above 20% fake followers)
            if (request.MaxBotScore.HasValue)
                query = query.Where(i => i.BotScore <= request.MaxBotScore.Value);

            var candidates = await query.ToListAsync();

            _logger.LogInformation("Hard filter returned {Count} candidates", candidates.Count);

            if (!candidates.Any())
                return new List<MatchResult>();

            // ── Step 2: Score each candidate ────────────────────────────────
            var scored = candidates
                .Select(influencer => ScoreInfluencer(influencer, request))
                .OrderByDescending(r => r.MatchScore)
                .Take(5)
                .ToList();

            _logger.LogInformation("Top 5 selected. Scores: {Scores}",
                string.Join(", ", scored.Select(s => $"{s.DisplayName}:{s.MatchScore}")));

            // ── Step 3: AI reasoning on top 5 ───────────────────────────────
            // Runs in parallel to keep response time down
            var reasoningTasks = scored.Select(async result =>
            {
                try
                {
                    result.MatchReason = await _aiReasoning.GenerateReasonAsync(request, result);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "AI reasoning failed for {InfluencerId} — returning score only",
                        result.InfluencerId);
                    result.MatchReason = null;
                }
                return result;
            });

            var finalResults = (await Task.WhenAll(reasoningTasks)).ToList();

            // ── Step 4: Persist matches if CampaignId provided ──────────────
            if (request.CampaignId.HasValue)
                await PersistMatchesAsync(request.CampaignId.Value, finalResults);

            return finalResults;
        }

        // ── Scoring algorithm ────────────────────────────────────────────────
        // Total max = 100 points across 5 weighted signals.

        private MatchResult ScoreInfluencer(Influencer influencer, MatchRequest request)
        {
            var breakdown = new ScoreBreakdown();
            var redFlags = new List<string>();

            // 1. Niche match — 30 points
            // Full points if niche matches exactly.
            if (request.NicheId.HasValue && influencer.NicheId == request.NicheId.Value)
                breakdown.NicheScore = 30;
            else if (!request.NicheId.HasValue)
                breakdown.NicheScore = 20; // No preference specified — partial credit
            else
                breakdown.NicheScore = 0;

            // 2. Follower count fit — 20 points
            // How well does their follower count sit within the requested range?
            // Centre of the range scores max; edges score less.
            breakdown.FollowerScore = ScoreFollowerFit(
                influencer.FollowerCount,
                request.MinimumFollowers,
                request.MaximumFollowers);

            // 3. Engagement rate — 25 points
            // Industry benchmarks: >6% excellent, 3–6% good, 1–3% average, <1% poor
            breakdown.EngagementScore = influencer.EngagementRate switch
            {
                >= 6 => 25,
                >= 3 => 20,
                >= 1 => 12,
                _ => 5
            };

            // 4. Bot score — 15 points (inverted — lower bot score = higher points)
            // 0–5% fake: full points. 5–15%: partial. 15–30%: concern. >30%: red flag.
            if (influencer.BotScore <= 0.05m)
                breakdown.BotScore = 15;
            else if (influencer.BotScore <= 0.15m)
                breakdown.BotScore = 10;
            else if (influencer.BotScore <= 0.30m)
            {
                breakdown.BotScore = 5;
                redFlags.Add($"Elevated bot score: {influencer.BotScore:P0} suspected fake followers");
            }
            else
            {
                breakdown.BotScore = 0;
                redFlags.Add($"High bot score: {influencer.BotScore:P0} suspected fake followers — ROI risk");
            }

            // 5. Platform match — 10 points
            breakdown.PlatformScore = ScorePlatformMatch(influencer, request.TargetPlatform);
            if (breakdown.PlatformScore == 0)
                redFlags.Add($"Influencer may not be active on {request.TargetPlatform}");

            // Red flag: data is stale (not refreshed in 48+ hours)
            if (influencer.LastDataRefresh < DateTime.UtcNow.AddHours(-48))
                redFlags.Add("Profile data is stale — metrics may not reflect current state");

            return new MatchResult
            {
                InfluencerId = influencer.Id,
                Name = influencer.Name,
                DisplayName = influencer.DisplayName,
                InstagramHandle = influencer.InstagramHandle,
                TikTokHandle = influencer.TikTokHandle,
                YouTubeHandle = influencer.YouTubeHandle,
                TwitterHandle = influencer.TwitterHandle,
                FollowerCount = influencer.FollowerCount,
                EngagementRate = influencer.EngagementRate,
                BotScore = influencer.BotScore,
                NicheName = influencer.Niche?.NicheName,
                MarketName = influencer.Market?.MarketName,
                MatchScore = breakdown.Total,
                ScoreBreakdown = breakdown,
                RedFlags = redFlags
            };
        }

        private int ScoreFollowerFit(int followerCount, int min, int max)
        {
            if (max <= min) return 10;

            // Score based on how close to the centre of the range they are
            double centre = (min + max) / 2.0;
            double range = (max - min) / 2.0;
            double distance = Math.Abs(followerCount - centre);
            double ratio = 1.0 - (distance / range);
            ratio = Math.Max(0, Math.Min(1, ratio));

            return (int)Math.Round(ratio * 20);
        }

        private int ScorePlatformMatch(Influencer influencer, string targetPlatform)
        {
            return targetPlatform.ToLower() switch
            {
                "instagram" => !string.IsNullOrEmpty(influencer.InstagramHandle) ? 10 : 0,
                "tiktok"    => !string.IsNullOrEmpty(influencer.TikTokHandle) ? 10 : 0,
                "youtube"   => !string.IsNullOrEmpty(influencer.YouTubeHandle) ? 10 : 0,
                "twitter" or "x" => !string.IsNullOrEmpty(influencer.TwitterHandle) ? 10 : 0,
                _ => 5 // Unknown platform — partial credit
            };
        }

        private async Task PersistMatchesAsync(Guid campaignId, List<MatchResult> results)
        {
            try
            {
                // Remove any previous matches for this campaign before saving new ones
                var existing = _context.CampaignInfluencers
                    .Where(ci => ci.CampaignId == campaignId);
                _context.CampaignInfluencers.RemoveRange(existing);

                foreach (var result in results)
                {
                    _context.CampaignInfluencers.Add(new CampaignInfluencer
                    {
                        CampaignId = campaignId,
                        InfluencerId = result.InfluencerId,
                        MatchScore = result.MatchScore,
                        MatchReason = result.MatchReason,
                        Status = "Matched",
                        MatchedAt = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Persisted {Count} matches for campaign {CampaignId}",
                    results.Count, campaignId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to persist matches for campaign {CampaignId}", campaignId);
            }
        }
    }
}
