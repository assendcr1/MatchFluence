using BackendAPI.Services.Discovery;

namespace BackendAPI.Services
{
    // Runs two jobs on separate schedules:
    // 1. Data refresh — updates metrics for existing influencers
    //    High priority: every 24hrs, Low priority: every 72hrs
    // 2. Discovery — finds new influencers to add to the database
    //    Runs once every 72hrs (after each low-priority refresh cycle)
    public class DataRefreshBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<DataRefreshBackgroundService> _logger;
        private readonly TimeSpan _highPriorityInterval;
        private readonly TimeSpan _lowPriorityInterval;
        private DateTime _lastLowPriorityRun = DateTime.MinValue;
        private DateTime _lastDiscoveryRun = DateTime.MinValue;

        public DataRefreshBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<DataRefreshBackgroundService> logger,
            IConfiguration config)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;

            _highPriorityInterval = TimeSpan.FromHours(
                config.GetValue("RefreshSettings:HighPriorityHours",
                    InfluencerThresholds.HighPriorityRefreshHours));

            _lowPriorityInterval = TimeSpan.FromHours(
                config.GetValue("RefreshSettings:LowPriorityHours",
                    InfluencerThresholds.LowPriorityRefreshHours));
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "Background service started. High priority: {High}hrs, Low priority: {Low}hrs",
                _highPriorityInterval.TotalHours, _lowPriorityInterval.TotalHours);

            // Wait 60 seconds on startup for DB and services to be fully ready
            await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.UtcNow;

                using var scope = _scopeFactory.CreateScope();
                var refreshService = scope.ServiceProvider
                    .GetRequiredService<IInfluencerRefreshService>();

                // ── High priority refresh — runs every 24hrs ──────────────
                try
                {
                    _logger.LogInformation("Running high priority refresh at {Time}", now);
                    await refreshService.RefreshByPriorityAsync("High", stoppingToken);
                }
                catch (OperationCanceledException) { break; }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "High priority refresh failed");
                }

                // ── Low priority refresh — runs every 72hrs ───────────────
                if (now - _lastLowPriorityRun >= _lowPriorityInterval)
                {
                    try
                    {
                        _logger.LogInformation("Running low priority refresh at {Time}", now);
                        await refreshService.RefreshByPriorityAsync("Low", stoppingToken);
                        _lastLowPriorityRun = now;
                    }
                    catch (OperationCanceledException) { break; }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Low priority refresh failed");
                    }
                }

                // ── Discovery cycle — runs every 72hrs ────────────────────
                if (now - _lastDiscoveryRun >= _lowPriorityInterval)
                {
                    try
                    {
                        _logger.LogInformation("Running discovery cycle at {Time}", now);
                        var discoveryService = scope.ServiceProvider
                            .GetRequiredService<IInfluencerDiscoveryService>();
                        await discoveryService.RunDiscoveryCycleAsync(stoppingToken);
                        _lastDiscoveryRun = now;
                    }
                    catch (OperationCanceledException) { break; }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Discovery cycle failed");
                    }
                }

                _logger.LogInformation("Next high priority refresh at {Next}",
                    DateTime.UtcNow.Add(_highPriorityInterval));

                await Task.Delay(_highPriorityInterval, stoppingToken);
            }

            _logger.LogInformation("Background service stopped.");
        }
    }
}
