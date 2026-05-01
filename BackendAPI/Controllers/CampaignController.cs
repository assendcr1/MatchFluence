using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Data;
using BackendAPI.Models;

namespace BackendAPI.Controllers
{
[Route("api/[controller]")]
[ApiController]
public class CampaignController : ControllerBase
{
private readonly ILogger<CampaignController> _logger; // Logger for debugging and logging information
private readonly ApplicationDbContext _context; // Database context for accessing the database
public CampaignController(ILogger<CampaignController> logger, ApplicationDbContext context)
{
    _logger = logger;
    _context = context;
}

/// <summary>
/// Gets all Campaigns
/// </summary>
/// <returns>List of all campaigns</returns>

// GET: api/Campaign - Retrieves a list of all campaigns
[HttpGet]
public async Task<IActionResult> GetCampaign()
{
    var campaigns = await _context.Campaigns
        .Include(c => c.MatchedInfluencers)
            .ThenInclude(ci => ci.Influencer)
                .ThenInclude(i => i.Niche)
        .Include(c => c.MatchedInfluencers)
            .ThenInclude(ci => ci.Influencer)
                .ThenInclude(i => i.Market)
        .ToListAsync();
    
    return Ok(campaigns);
}

/// <summary>
/// Gets a campaign by name
/// </summary>
/// <param name="campaignName">The name of the campaign you want to return</param>
/// <returns>A single campaign</returns>

// GET: api/Campaign/campaign/{campaignName} - Retrieves a campaign by its name
[HttpGet("{campaignName}")]
public async Task<IActionResult> GetCampaignByName(string campaignName)
{
    var campaign = await _context.Campaigns
        .Include(c => c.MatchedInfluencers)
            .ThenInclude(ci => ci.Influencer)
                .ThenInclude(i => i.Niche)
        .Include(c => c.MatchedInfluencers)
            .ThenInclude(ci => ci.Influencer)
                .ThenInclude(i => i.Market)
        .FirstOrDefaultAsync(c => c.Title == campaignName);
    
    if (campaign == null)
    {
        _logger.LogWarning("Campaign with name {CampaignName} not found.", campaignName);
        return NotFound();
    }
    return Ok(campaign);
}

/// <summary>
/// Gets a campain by id
/// </summary>
/// <param name="id">The campaigns unique identifier</param>
/// <returns>A single campaign</returns>

// GET: api/Campaign/{id} - Retrieves a campaign by its ID
[HttpGet("{id:Guid}")]
public async Task<IActionResult> GetCampaignById(Guid id)
{
    var campaign = await _context.Campaigns
        .Include(c => c.MatchedInfluencers)
            .ThenInclude(ci => ci.Influencer)
                .ThenInclude(i => i.Niche)
        .Include(c => c.MatchedInfluencers)
            .ThenInclude(ci => ci.Influencer)
                .ThenInclude(i => i.Market)
        .FirstOrDefaultAsync(c => c.Id == id);

    if (campaign == null)
    {
        _logger.LogWarning("Campaign with ID {Id} not found.", id);
        return NotFound();
    }
    return Ok(campaign);
}

/// <summary>
/// Deletes a campaign by ID
/// </summary>
/// <param name="id">The campaigns unique identifier</param>
/// <returns></returns>

// DELETE: api/Campaign/{id} - Retrieves a campaign by its ID and DELETES it from the database
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteCampaignById(Guid id)
{
    var campaign = await _context.Campaigns.FindAsync(id);
    if (campaign == null)
    {
        _logger.LogWarning("Campaign with ID {Id} not found for deletion.", id);
        return NotFound();
    }
    _context.Campaigns.Remove(campaign);
    await _context.SaveChangesAsync();
    _logger.LogInformation("Campaign with ID {Id} deleted successfully.", id);
    return NoContent();
}

/// <summary>
/// Creates a new campaign
/// </summary>
/// <param name="campaign">The campaign object to create</param>
/// <returns>The created campaign object</returns>

// POST: api/Campaign - Creates a new campaign
[HttpPost]
public async Task<IActionResult> CreateCampaign([FromBody] Campaign campaign)
{
    if (campaign == null)
    {
        _logger.LogWarning("Received null campaign object for creation.");
        return BadRequest("Campaign data is required.");
    }

    var campaignEntity = new Campaign
    {
        Id = Guid.NewGuid(),
        Title = campaign.Title,
        Description = campaign.Description,
        TargetPlatform = campaign.TargetPlatform,
        AudienceAgeMin = campaign.AudienceAgeMin,
        AudienceAgeMax = campaign.AudienceAgeMax,
        AudienceGender = campaign.AudienceGender,
        ContentType = campaign.ContentType,
        MinimumFollowers = campaign.MinimumFollowers,
        MaximumFollowers = campaign.MaximumFollowers,
        StartDate = campaign.StartDate,
        EndDate = campaign.EndDate
    };

    _context.Campaigns.Add(campaignEntity);
    await _context.SaveChangesAsync();
    return CreatedAtAction(nameof(GetCampaignById), new { id = campaignEntity.Id }, campaignEntity);
}

/// <summary>
/// Updates an existing campaign
/// </summary>
/// <param name="campaign">The updated campaign object</param>
/// <param name="id">The ID of the campaign object you would like to update</param>
/// <returns></returns>

// PUT: api/Campaign - Updates an existing campaign
[HttpPut("{id}")]
public async Task<IActionResult> UpdateCampaign(Guid id, [FromBody] Campaign campaign)
{
    var existingCampaign = await _context.Campaigns.FindAsync(id);
    if (existingCampaign == null)
    {
        _logger.LogWarning("Campaign with ID {id} not found for update.", id);
        return NotFound();
    }
    existingCampaign.Title = campaign.Title;
    existingCampaign.Description = campaign.Description;
    existingCampaign.TargetPlatform = campaign.TargetPlatform;
    existingCampaign.AudienceAgeMin = campaign.AudienceAgeMin;
    existingCampaign.AudienceAgeMax = campaign.AudienceAgeMax;
    existingCampaign.AudienceGender = campaign.AudienceGender;
    existingCampaign.ContentType = campaign.ContentType;
    existingCampaign.MinimumFollowers = campaign.MinimumFollowers;
    existingCampaign.MaximumFollowers = campaign.MaximumFollowers;
    existingCampaign.StartDate = campaign.StartDate;
    existingCampaign.EndDate = campaign.EndDate;

    _context.Campaigns.Update(existingCampaign);
    await _context.SaveChangesAsync();
    return NoContent();
}

}
}
