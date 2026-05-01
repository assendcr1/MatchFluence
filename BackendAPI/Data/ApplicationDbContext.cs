using Microsoft.EntityFrameworkCore;
using BackendAPI.Models;

namespace BackendAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        // Existing tables
        public DbSet<Influencer> Influencers { get; set; }
        public DbSet<Campaign> Campaigns { get; set; }
        public DbSet<Markets> Markets { get; set; }
        public DbSet<Niches> Niches { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<MessageTemplate> MessageTemplates { get; set; }

        // New tables
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Agency> Agencies { get; set; }
        public DbSet<CampaignInfluencer> CampaignInfluencers { get; set; }
        public DbSet<InfluencerCollaboration> InfluencerCollaborations { get; set; }
        public DbSet<MetricSnapshot> MetricSnapshots { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // CampaignInfluencer — composite primary key
            modelBuilder.Entity<CampaignInfluencer>()
                .HasKey(ci => new { ci.CampaignId, ci.InfluencerId });

            modelBuilder.Entity<CampaignInfluencer>()
                .HasOne(ci => ci.Campaign)
                .WithMany(c => c.MatchedInfluencers)
                .HasForeignKey(ci => ci.CampaignId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CampaignInfluencer>()
                .HasOne(ci => ci.Influencer)
                .WithMany(i => i.Campaigns)
                .HasForeignKey(ci => ci.InfluencerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Campaign → Brand (no cascade — deleting a brand shouldn't delete campaigns)
            modelBuilder.Entity<Campaign>()
                .HasOne(c => c.CreatedByBrand)
                .WithMany(b => b.Campaigns)
                .HasForeignKey(c => c.CreatedByBrandId)
                .OnDelete(DeleteBehavior.SetNull);

            // Campaign → Agency
            modelBuilder.Entity<Campaign>()
                .HasOne(c => c.CreatedByAgency)
                .WithMany(a => a.Campaigns)
                .HasForeignKey(c => c.CreatedByAgencyId)
                .OnDelete(DeleteBehavior.SetNull);

            // Influencer → Niches (restrict delete — don't cascade delete influencers when a niche is deleted)
            modelBuilder.Entity<Influencer>()
                .HasOne(i => i.Niche)
                .WithMany()
                .HasForeignKey(i => i.NicheId)
                .OnDelete(DeleteBehavior.Restrict);

            // Influencer → Markets
            modelBuilder.Entity<Influencer>()
                .HasOne(i => i.Market)
                .WithMany()
                .HasForeignKey(i => i.MarketId)
                .OnDelete(DeleteBehavior.Restrict);

            // InfluencerCollaboration → Influencer
            modelBuilder.Entity<InfluencerCollaboration>()
                .HasOne(ic => ic.Influencer)
                .WithMany(i => i.PreviousCollaborations)
                .HasForeignKey(ic => ic.InfluencerId)
                .OnDelete(DeleteBehavior.Cascade);

            // MetricSnapshot → Influencer
            modelBuilder.Entity<MetricSnapshot>()
                .HasOne(ms => ms.Influencer)
                .WithMany(i => i.MetricSnapshots)
                .HasForeignKey(ms => ms.InfluencerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
