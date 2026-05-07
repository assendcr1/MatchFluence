using BackendAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/export")]
    [Authorize]
    public class ExportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExportController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("influencers")]
        public async Task<IActionResult> ExportInfluencers()
        {
            var influencers = await _context.Influencers
                .Include(i => i.Niche)
                .Include(i => i.Market)
                .OrderByDescending(i => i.FollowerCount)
                .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("Handle,Name,Platform,Niche,Market,Followers,EngagementRate,BotScore,Priority,DiscoverySource,LastRefresh");

            foreach (var i in influencers)
            {
                csv.AppendLine($"@{i.InstagramHandle?.TrimStart('@')}," +
                    $"{EscapeCsv(i.Name)}," +
                    $"{i.Platform}," +
                    $"{EscapeCsv(i.Niche?.NicheName)}," +
                    $"{EscapeCsv(i.Market?.MarketName)}," +
                    $"{i.FollowerCount}," +
                    $"{i.EngagementRate}," +
                    $"{i.BotScore}," +
                    $"{i.RefreshPriority}," +
                    $"{i.DiscoverySource}," +
                    $"{i.LastDataRefresh:yyyy-MM-dd}");
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()),
                "text/csv", $"influencers_{DateTime.UtcNow:yyyyMMdd}.csv");
        }

        [HttpGet("campaigns")]
        public async Task<IActionResult> ExportCampaigns()
        {
            var campaigns = await _context.Campaigns
                .Include(c => c.MatchedInfluencers)
                    .ThenInclude(ci => ci.Influencer)
                .OrderByDescending(c => c.StartDate)
                .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("CampaignTitle,Platform,StartDate,EndDate,MinFollowers,MaxFollowers,MatchedInfluencers");

            foreach (var c in campaigns)
            {
                var matched = string.Join("|", c.MatchedInfluencers
                    .Select(ci => $"@{ci.Influencer!.InstagramHandle?.TrimStart('@')}({ci.MatchScore})"));

                csv.AppendLine($"{EscapeCsv(c.Title)}," +
                    $"{c.TargetPlatform}," +
                    $"{c.StartDate:yyyy-MM-dd}," +
                    $"{c.EndDate:yyyy-MM-dd}," +
                    $"{c.MinimumFollowers}," +
                    $"{c.MaximumFollowers}," +
                    $"{EscapeCsv(matched)}");
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()),
                "text/csv", $"campaigns_{DateTime.UtcNow:yyyyMMdd}.csv");
        }

        [HttpGet("campaign/{campaignId}/matches")]
        public async Task<IActionResult> ExportCampaignMatches(Guid campaignId)
        {
            var matches = await _context.CampaignInfluencers
                .Include(ci => ci.Influencer)
                    .ThenInclude(i => i.Niche)
                .Include(ci => ci.Influencer)
                    .ThenInclude(i => i.Market)
                .Where(ci => ci.CampaignId == campaignId)
                .OrderByDescending(ci => ci.MatchScore)
                .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("Rank,Handle,Name,Followers,EngagementRate,BotScore,Niche,Market,MatchScore,MatchReason,Status");

            int rank = 1;
            foreach (var m in matches)
            {
                csv.AppendLine($"{rank++}," +
                    $"@{m.Influencer?.InstagramHandle?.TrimStart('@')}," +
                    $"{EscapeCsv(m.Influencer?.Name)}," +
                    $"{m.Influencer?.FollowerCount}," +
                    $"{m.Influencer?.EngagementRate}," +
                    $"{m.Influencer?.BotScore}," +
                    $"{EscapeCsv(m.Influencer?.Niche?.NicheName)}," +
                    $"{EscapeCsv(m.Influencer?.Market?.MarketName)}," +
                    $"{m.MatchScore}," +
                    $"{EscapeCsv(m.MatchReason)}," +
                    $"{m.Status}");
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()),
                "text/csv", $"campaign_matches_{campaignId}_{DateTime.UtcNow:yyyyMMdd}.csv");
        }

        private static string EscapeCsv(string? value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
                return $"\"{value.Replace("\"", "\"\"")}\"";
            return value;
        }
    }
}
