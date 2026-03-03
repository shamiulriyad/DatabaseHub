using backend.Data;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CompetitionLifecycleScheduler : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<CompetitionLifecycleScheduler> _logger;

        public CompetitionLifecycleScheduler(IServiceScopeFactory scopeFactory, ILogger<CompetitionLifecycleScheduler> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("CompetitionLifecycleScheduler started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await Tick(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "CompetitionLifecycleScheduler tick failed");
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        private async Task Tick(CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var scoringService = scope.ServiceProvider.GetRequiredService<IClanCompetitionScoringService>();

            var now = DateTime.UtcNow;

            // Start competitions when time window opens
            var toStart = await context.Competitions
                .Where(c => c.IsApproved && c.StartDate <= now && c.EndDate > now && c.Status == "Upcoming")
                .ToListAsync(cancellationToken);

            foreach (var competition in toStart)
            {
                competition.Status = "Ongoing";
                competition.IsLive = true;
                competition.UpdatedAt = now;
            }

            if (toStart.Count > 0)
            {
                _logger.LogInformation("CompetitionLifecycleScheduler started {Count} competition(s)", toStart.Count);
                await context.SaveChangesAsync(cancellationToken);
            }

            // Finalize ended admin clan competitions automatically
            var endedAdminClanCompetitions = await context.Competitions
                .Where(c => c.EndDate <= now
                            && c.IsTeamBased
                            && c.CreatorRole == "Admin"
                            && c.Status != "Completed"
                            && c.Status != "Cancelled")
                .OrderBy(c => c.EndDate)
                .ToListAsync(cancellationToken);

            if (endedAdminClanCompetitions.Count == 0)
                return;

            var fallbackAdminId = await context.Users
                .Where(u => u.IsAdmin)
                .OrderBy(u => u.Id)
                .Select(u => u.Id)
                .FirstOrDefaultAsync(cancellationToken);

            foreach (var competition in endedAdminClanCompetitions)
            {
                try
                {
                    var adminId = competition.CreatorId > 0 ? competition.CreatorId : fallbackAdminId;
                    if (adminId <= 0)
                    {
                        competition.Status = "Completed";
                        competition.IsLive = false;
                        competition.UpdatedAt = now;
                        continue;
                    }

                    var registrationsCount = await context.CompetitionRegistrations
                        .CountAsync(r => r.CompetitionId == competition.Id, cancellationToken);

                    if (registrationsCount == 0)
                    {
                        competition.Status = "Completed";
                        competition.IsLive = false;
                        competition.UpdatedAt = now;
                        await context.SaveChangesAsync(cancellationToken);
                        continue;
                    }

                    var finalizeResult = await scoringService.FinalizeCompetitionAndUpdateLeaderboard(competition.Id, adminId);
                    if (!finalizeResult.Success)
                    {
                        _logger.LogWarning("Auto-finalize failed for competition {CompetitionId}: {Message}", competition.Id, finalizeResult.Message);
                    }
                    else
                    {
                        _logger.LogInformation("Auto-finalized competition {CompetitionId}", competition.Id);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Auto-finalize exception for competition {CompetitionId}", competition.Id);
                }
            }
        }
    }
}
