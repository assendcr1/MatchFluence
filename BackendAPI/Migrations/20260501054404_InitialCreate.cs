using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Agencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AgencyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Website = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApiKeyHash = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Agencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Brands",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Industry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Website = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApiKeyHash = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Markets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MarketName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Markets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MessageTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Template = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Niches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NicheName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Niches", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: false),
                    InfluencerId = table.Column<Guid>(type: "uuid", nullable: false),
                    MessageType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Subject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    MessageBody = table.Column<string>(type: "text", nullable: false),
                    IsCustomMessage = table.Column<bool>(type: "boolean", nullable: false),
                    SentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Campaigns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    TargetPlatform = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AudienceAgeMin = table.Column<int>(type: "integer", nullable: false),
                    AudienceAgeMax = table.Column<int>(type: "integer", nullable: false),
                    AudienceGender = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MinimumFollowers = table.Column<int>(type: "integer", nullable: false),
                    MaximumFollowers = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    NicheId = table.Column<int>(type: "integer", nullable: true),
                    MarketId = table.Column<int>(type: "integer", nullable: true),
                    CreatedByBrandId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByAgencyId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campaigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Campaigns_Agencies_CreatedByAgencyId",
                        column: x => x.CreatedByAgencyId,
                        principalTable: "Agencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Campaigns_Brands_CreatedByBrandId",
                        column: x => x.CreatedByBrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Campaigns_Markets_MarketId",
                        column: x => x.MarketId,
                        principalTable: "Markets",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Campaigns_Niches_NicheId",
                        column: x => x.NicheId,
                        principalTable: "Niches",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Influencers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Platform = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    NicheId = table.Column<int>(type: "integer", nullable: false),
                    MarketId = table.Column<int>(type: "integer", nullable: false),
                    EngagementRate = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    FollowerCount = table.Column<int>(type: "integer", nullable: false),
                    BotScore = table.Column<decimal>(type: "numeric(5,4)", nullable: false),
                    LastDataRefresh = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RefreshPriority = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    DiscoverySource = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DiscoveredFromInfluencerId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    NextRefreshDue = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    InstagramHandle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    TwitterHandle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    TikTokHandle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    YouTubeHandle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    AccessToken = table.Column<string>(type: "text", nullable: true),
                    TokenExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Influencers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Influencers_Markets_MarketId",
                        column: x => x.MarketId,
                        principalTable: "Markets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Influencers_Niches_NicheId",
                        column: x => x.NicheId,
                        principalTable: "Niches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CampaignInfluencers",
                columns: table => new
                {
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: false),
                    InfluencerId = table.Column<Guid>(type: "uuid", nullable: false),
                    MatchScore = table.Column<int>(type: "integer", nullable: false),
                    MatchReason = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    MatchedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignInfluencers", x => new { x.CampaignId, x.InfluencerId });
                    table.ForeignKey(
                        name: "FK_CampaignInfluencers_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CampaignInfluencers_Influencers_InfluencerId",
                        column: x => x.InfluencerId,
                        principalTable: "Influencers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InfluencerCollaborations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InfluencerId = table.Column<Guid>(type: "uuid", nullable: false),
                    BrandName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CollabDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InfluencerCollaborations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InfluencerCollaborations_Influencers_InfluencerId",
                        column: x => x.InfluencerId,
                        principalTable: "Influencers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MetricSnapshots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InfluencerId = table.Column<Guid>(type: "uuid", nullable: false),
                    FollowerCount = table.Column<int>(type: "integer", nullable: false),
                    EngagementRate = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    AverageReach = table.Column<int>(type: "integer", nullable: false),
                    BotScore = table.Column<decimal>(type: "numeric(5,4)", nullable: false),
                    SnapshotDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MetricSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MetricSnapshots_Influencers_InfluencerId",
                        column: x => x.InfluencerId,
                        principalTable: "Influencers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Agencies_Email",
                table: "Agencies",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Brands_Email",
                table: "Brands",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CampaignInfluencers_InfluencerId",
                table: "CampaignInfluencers",
                column: "InfluencerId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_CreatedByAgencyId",
                table: "Campaigns",
                column: "CreatedByAgencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_CreatedByBrandId",
                table: "Campaigns",
                column: "CreatedByBrandId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_MarketId",
                table: "Campaigns",
                column: "MarketId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_NicheId",
                table: "Campaigns",
                column: "NicheId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_Title",
                table: "Campaigns",
                column: "Title",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InfluencerCollaborations_InfluencerId",
                table: "InfluencerCollaborations",
                column: "InfluencerId");

            migrationBuilder.CreateIndex(
                name: "IX_Influencers_DisplayName",
                table: "Influencers",
                column: "DisplayName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Influencers_InstagramHandle",
                table: "Influencers",
                column: "InstagramHandle");

            migrationBuilder.CreateIndex(
                name: "IX_Influencers_MarketId",
                table: "Influencers",
                column: "MarketId");

            migrationBuilder.CreateIndex(
                name: "IX_Influencers_NicheId",
                table: "Influencers",
                column: "NicheId");

            migrationBuilder.CreateIndex(
                name: "IX_Markets_MarketName",
                table: "Markets",
                column: "MarketName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MetricSnapshots_InfluencerId",
                table: "MetricSnapshots",
                column: "InfluencerId");

            migrationBuilder.CreateIndex(
                name: "IX_Niches_NicheName",
                table: "Niches",
                column: "NicheName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CampaignInfluencers");

            migrationBuilder.DropTable(
                name: "InfluencerCollaborations");

            migrationBuilder.DropTable(
                name: "MessageTemplates");

            migrationBuilder.DropTable(
                name: "MetricSnapshots");

            migrationBuilder.DropTable(
                name: "Reports");

            migrationBuilder.DropTable(
                name: "Campaigns");

            migrationBuilder.DropTable(
                name: "Influencers");

            migrationBuilder.DropTable(
                name: "Agencies");

            migrationBuilder.DropTable(
                name: "Brands");

            migrationBuilder.DropTable(
                name: "Markets");

            migrationBuilder.DropTable(
                name: "Niches");
        }
    }
}
