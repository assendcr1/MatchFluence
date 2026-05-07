using BackendAPI.Services.Discovery;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/discovery")]
    public class DiscoveryController : ControllerBase
    {
        private readonly IInfluencerDiscoveryService _discoveryService;
        private readonly ILogger<DiscoveryController> _logger;

        public DiscoveryController(
            IInfluencerDiscoveryService discoveryService,
            ILogger<DiscoveryController> logger)
        {
            _discoveryService = discoveryService;
            _logger = logger;
        }

        [HttpPost("run")]
        public async Task<IActionResult> RunDiscovery(CancellationToken ct)
        {
            _logger.LogInformation("Manual discovery cycle triggered via API");
            _ = Task.Run(() => _discoveryService.RunDiscoveryCycleAsync(ct), ct);
            return Ok(new { message = "Discovery cycle started." });
        }
    }
}
