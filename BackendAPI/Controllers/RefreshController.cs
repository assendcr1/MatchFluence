using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RefreshController : ControllerBase
    {
        private readonly IInfluencerRefreshService _refreshService;
        private readonly ILogger<RefreshController> _logger;

        public RefreshController(
            IInfluencerRefreshService refreshService,
            ILogger<RefreshController> logger)
        {
            _refreshService = refreshService;
            _logger = logger;
        }

        /// <summary>
        /// Manually trigger a full refresh of all influencer data.
        /// Normally runs automatically every 24hrs — use this for testing
        /// or to force an immediate refresh.
        /// </summary>
        [HttpPost("all")]
        public async Task<IActionResult> RefreshAll(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Manual full refresh triggered via API");

            try
            {
                // Fire and forget — don't make the caller wait for all influencers
                // to refresh before getting a response
                _ = Task.Run(
                    () => _refreshService.RefreshAllAsync(cancellationToken),
                    cancellationToken);

                return Ok(new
                {
                    message = "Refresh started. Check application logs for progress.",
                    startedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start manual refresh");
                return StatusCode(500, "Failed to start refresh.");
            }
        }

        /// <summary>
        /// Manually trigger a refresh for a single influencer by ID.
        /// Useful for testing a specific profile or forcing an update
        /// after an influencer connects their account.
        /// </summary>
        /// <param name="id">The influencer's unique identifier</param>
        [HttpPost("{id:guid}")]
        public async Task<IActionResult> RefreshSingle(Guid id, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Manual refresh triggered for influencer {Id}", id);

            try
            {
                await _refreshService.RefreshInfluencerAsync(id, cancellationToken);
                return Ok(new
                {
                    message = $"Refresh complete for influencer {id}",
                    completedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to refresh influencer {Id}", id);
                return StatusCode(500, $"Refresh failed for influencer {id}.");
            }
        }
    }
}
