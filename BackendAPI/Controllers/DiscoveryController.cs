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
            var enabled = Environment.GetEnvironmentVariable("DiscoverySettings__Enabled") != "false";
            if (!enabled)
                return Ok(new { message = "Discovery is currently disabled." });

            _logger.LogInformation("Manual discovery cycle triggered via API");
            _ = Task.Run(() => _discoveryService.RunDiscoveryCycleAsync(CancellationToken.None));
            return Ok(new { message = "Discovery cycle started." });
        }
    }
}
