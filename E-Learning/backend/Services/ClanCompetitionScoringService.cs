using System.Text.Json;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ClanCompetitionScoringService : IClanCompetitionScoringService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public ClanCompetitionScoringService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<ServiceResult<ClanCompetitionFinalizeResultDTO>> FinalizeCompetitionAndUpdateLeaderboard(int competitionId, int adminUserId)
        {
            try
            {
                var admin = await _context.Users.FirstOrDefaultAsync(u => u.Id == adminUserId);
                if (admin == null || !admin.IsAdmin)
                    return ServiceResult<ClanCompetitionFinalizeResultDTO>.FailureResult("Only admin can finalize competitions");

                var competition = await _context.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId);
                if (competition == null)
                    return ServiceResult<ClanCompetitionFinalizeResultDTO>.FailureResult("Competition not found");

                if (competition.Status == "Completed")
                    return ServiceResult<ClanCompetitionFinalizeResultDTO>.FailureResult("Competition already finalized");

                await EnsureProgressionDefaultsAsync();

                var registrations = await _context.CompetitionRegistrations
                    .Where(r => r.CompetitionId == competitionId)
                    .Include(r => r.Team)
                        .ThenInclude(t => t.Clan)
                    .ToListAsync();

                if (registrations.Count == 0)
                    return ServiceResult<ClanCompetitionFinalizeResultDTO>.FailureResult("No registered teams found");

                var teamIds = registrations.Select(r => r.TeamId).Distinct().ToList();

                var teamMembers = await _context.TeamMembers
                    .Where(tm => teamIds.Contains(tm.TeamId))
                    .ToListAsync();

                var (minTeamSize, maxTeamSize) = ResolveTeamSizeRange(competition.CompetitionRules, competition.TeamSize);

                // Enforce competition-specific team size for scoring eligibility
                var validTeamIds = teamMembers
                    .GroupBy(tm => tm.TeamId)
                    .Where(g => g.Count() >= minTeamSize && g.Count() <= maxTeamSize)
                    .Select(g => g.Key)
                    .ToHashSet();

                var allMemberIds = teamMembers.Select(m => m.UserId).Distinct().ToList();
                var userScores = await _context.CompetitionScores
                    .Where(s => s.CompetitionId == competitionId && allMemberIds.Contains(s.UserId))
                    .ToListAsync();

                var participantTimes = await _context.CompetitionParticipants
                    .Where(p => p.CompetitionId == competitionId && allMemberIds.Contains(p.UserId))
                    .ToListAsync();

                var teamRows = new List<(int TeamId, int ClanId, string TeamName, string ClanName, decimal Score, int Penalty)>();

                foreach (var reg in registrations)
                {
                    if (!validTeamIds.Contains(reg.TeamId))
                        continue;

                    var members = teamMembers.Where(tm => tm.TeamId == reg.TeamId).Select(tm => tm.UserId).ToList();
                    var score = userScores.Where(s => members.Contains(s.UserId)).Sum(s => s.Score);
                    var penalty = participantTimes.Where(p => members.Contains(p.UserId) && p.TimeTaken.HasValue).Sum(p => p.TimeTaken ?? 0);

                    teamRows.Add((
                        reg.TeamId,
                        reg.Team.ClanId,
                        reg.Team.Name,
                        reg.Team.Clan?.Name ?? "Unknown Clan",
                        score,
                        penalty
                    ));
                }

                var teamLeaderboard = teamRows
                    .OrderByDescending(x => x.Score)
                    .ThenBy(x => x.Penalty)
                    .Select((x, i) => new CompetitionLeaderboardEntryDTO
                    {
                        RankNo = i + 1,
                        TeamId = x.TeamId,
                        TeamName = x.TeamName,
                        ClanId = x.ClanId,
                        ClanName = x.ClanName,
                        TotalScore = x.Score,
                        PenaltySeconds = x.Penalty
                    })
                    .ToList();

                var levelThresholds = await _context.LevelThresholds
                    .AsNoTracking()
                    .OrderBy(t => t.RequiredExp)
                    .ToListAsync();

                var awardedUserIds = (await _context.UserCompetitionHistories
                    .Where(h => h.CompetitionId == competitionId)
                    .Select(h => h.UserId)
                    .ToListAsync())
                    .ToHashSet();

                var participantUserIds = teamMembers.Select(tm => tm.UserId).Distinct().ToList();
                var usersById = await _context.Users
                    .Where(u => participantUserIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id, u => u);

                foreach (var teamEntry in teamLeaderboard)
                {
                    var earnedExp = GetAdminClanCompetitionExpForPosition(teamEntry.RankNo);
                    var memberIds = teamMembers
                        .Where(tm => tm.TeamId == teamEntry.TeamId)
                        .Select(tm => tm.UserId)
                        .Distinct()
                        .ToList();

                    foreach (var memberId in memberIds)
                    {
                        if (awardedUserIds.Contains(memberId))
                            continue;

                        if (!usersById.TryGetValue(memberId, out var user))
                            continue;

                        _context.UserCompetitionHistories.Add(new UserCompetitionHistory
                        {
                            UserId = memberId,
                            CompetitionId = competitionId,
                            ClanTeamId = teamEntry.TeamId,
                            Position = teamEntry.RankNo,
                            EarnedExp = earnedExp,
                            Date = DateTime.UtcNow
                        });

                        user.Exp += earnedExp;
                        user.Level = CalculateLevelFromThreshold(user.Exp, levelThresholds);
                        user.UpdatedAt = DateTime.UtcNow;
                        awardedUserIds.Add(memberId);
                    }
                }

                var clanExpByClanId = teamLeaderboard
                    .GroupBy(t => t.ClanId)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Sum(teamEntry =>
                        {
                            var earnedExp = GetAdminClanCompetitionExpForPosition(teamEntry.RankNo);
                            var membersCount = teamMembers
                                .Where(tm => tm.TeamId == teamEntry.TeamId)
                                .Select(tm => tm.UserId)
                                .Distinct()
                                .Count();
                            return earnedExp * membersCount;
                        })
                    );

                var topTeamsCount = GetTopTeamsCountFromScoringSystem(competition.ScoringSystem);

                var clanLeaderboard = teamLeaderboard
                    .GroupBy(t => new { t.ClanId, t.ClanName })
                    .Select(g => new
                    {
                        g.Key.ClanId,
                        g.Key.ClanName,
                        TeamCount = g.Count(),
                        Total = g.OrderByDescending(x => x.TotalScore).ThenBy(x => x.PenaltySeconds).Take(topTeamsCount).Sum(x => x.TotalScore)
                    })
                    .OrderByDescending(x => x.Total)
                    .ThenBy(x => x.ClanName)
                    .Select((x, i) => new ClanLeaderboardEntryDTO
                    {
                        RankNo = i + 1,
                        ClanId = x.ClanId,
                        ClanName = x.ClanName,
                        TotalScore = x.Total,
                        TeamCount = x.TeamCount
                    })
                    .ToList();

                // Update clan points/ranks in core clan table
                var clansToUpdate = await _context.Clans
                    .Where(c => clanLeaderboard.Select(x => x.ClanId).Contains(c.Id))
                    .ToListAsync();

                foreach (var clan in clansToUpdate)
                {
                    var row = clanLeaderboard.First(x => x.ClanId == clan.Id);
                    var clanExp = clanExpByClanId.TryGetValue(clan.Id, out var value) ? value : 0;
                    clan.TotalPoints += clanExp;
                    clan.WeeklyPoints += clanExp;
                    clan.MonthlyPoints += clanExp;
                    clan.TotalCompetitions += 1;
                    if (row.RankNo == 1) clan.CompetitionWins += 1;
                }

                // Re-rank all clans globally by points
                var allClans = await _context.Clans
                    .OrderByDescending(c => c.TotalPoints)
                    .ThenBy(c => c.CreatedAt)
                    .ToListAsync();

                for (var i = 0; i < allClans.Count; i++)
                {
                    allClans[i].Rank = i + 1;
                }

                competition.Status = "Completed";
                competition.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Notify clan leaders
                foreach (var clan in clansToUpdate)
                {
                    var row = clanLeaderboard.First(x => x.ClanId == clan.Id);
                    await _notificationService.CreateNotification(
                        clan.LeaderId,
                        "CompetitionFinalized",
                        "Competition Result Finalized",
                        $"{competition.Title}: Clan rank #{row.RankNo}, score {row.TotalScore}.",
                        $"/competitions/{competitionId}",
                        clan.Id,
                        adminUserId
                    );
                }

                var result = new ClanCompetitionFinalizeResultDTO
                {
                    CompetitionId = competition.Id,
                    CompetitionTitle = competition.Title,
                    FinalStatus = competition.Status,
                    TeamLeaderboard = teamLeaderboard,
                    ClanLeaderboard = clanLeaderboard,
                    ExpDistribution = GetAdminClanCompetitionExpDistribution(),
                    FinalizedAt = DateTime.UtcNow
                };

                return ServiceResult<ClanCompetitionFinalizeResultDTO>.SuccessResult(result, "Competition finalized and leaderboard updated");
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanCompetitionFinalizeResultDTO>.FailureResult($"Failed to finalize competition: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<CompetitionLeaderboardEntryDTO>>> GetTeamLeaderboard(int competitionId)
        {
            try
            {
                var competition = await _context.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId);
                if (competition == null)
                    return ServiceResult<List<CompetitionLeaderboardEntryDTO>>.FailureResult("Competition not found");

                var registrations = await _context.CompetitionRegistrations
                    .Where(r => r.CompetitionId == competitionId)
                    .Include(r => r.Team)
                        .ThenInclude(t => t.Clan)
                    .ToListAsync();

                var teamIds = registrations.Select(r => r.TeamId).Distinct().ToList();
                var teamMembers = await _context.TeamMembers.Where(tm => teamIds.Contains(tm.TeamId)).ToListAsync();
                var userIds = teamMembers.Select(tm => tm.UserId).Distinct().ToList();
                var scores = await _context.CompetitionScores.Where(s => s.CompetitionId == competitionId && userIds.Contains(s.UserId)).ToListAsync();
                var participantTimes = await _context.CompetitionParticipants.Where(p => p.CompetitionId == competitionId && userIds.Contains(p.UserId)).ToListAsync();
                var (minTeamSize, maxTeamSize) = ResolveTeamSizeRange(competition.CompetitionRules, competition.TeamSize);

                var rows = new List<CompetitionLeaderboardEntryDTO>();

                foreach (var reg in registrations)
                {
                    var members = teamMembers.Where(tm => tm.TeamId == reg.TeamId).Select(tm => tm.UserId).ToList();
                    if (members.Count < minTeamSize || members.Count > maxTeamSize) continue;

                    var score = scores.Where(s => members.Contains(s.UserId)).Sum(s => s.Score);
                    var penalty = participantTimes.Where(p => members.Contains(p.UserId) && p.TimeTaken.HasValue).Sum(p => p.TimeTaken ?? 0);

                    rows.Add(new CompetitionLeaderboardEntryDTO
                    {
                        TeamId = reg.TeamId,
                        TeamName = reg.Team.Name,
                        ClanId = reg.Team.ClanId,
                        ClanName = reg.Team.Clan?.Name ?? "Unknown Clan",
                        TotalScore = score,
                        PenaltySeconds = penalty
                    });
                }

                var ranked = rows.OrderByDescending(r => r.TotalScore).ThenBy(r => r.PenaltySeconds)
                    .Select((r, i) =>
                    {
                        r.RankNo = i + 1;
                        return r;
                    })
                    .ToList();

                return ServiceResult<List<CompetitionLeaderboardEntryDTO>>.SuccessResult(ranked);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CompetitionLeaderboardEntryDTO>>.FailureResult($"Failed to get team leaderboard: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanLeaderboardEntryDTO>>> GetClanLeaderboard(int competitionId)
        {
            try
            {
                var teamResult = await GetTeamLeaderboard(competitionId);
                if (!teamResult.Success)
                    return ServiceResult<List<ClanLeaderboardEntryDTO>>.FailureResult(teamResult.Message);

                var competition = await _context.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId);
                if (competition == null)
                    return ServiceResult<List<ClanLeaderboardEntryDTO>>.FailureResult("Competition not found");

                var topTeamsCount = GetTopTeamsCountFromScoringSystem(competition.ScoringSystem);

                var ranked = teamResult.Data
                    .GroupBy(t => new { t.ClanId, t.ClanName })
                    .Select(g => new
                    {
                        g.Key.ClanId,
                        g.Key.ClanName,
                        TeamCount = g.Count(),
                        Score = g.OrderByDescending(x => x.TotalScore).ThenBy(x => x.PenaltySeconds).Take(topTeamsCount).Sum(x => x.TotalScore)
                    })
                    .OrderByDescending(x => x.Score)
                    .ThenBy(x => x.ClanName)
                    .Select((x, i) => new ClanLeaderboardEntryDTO
                    {
                        RankNo = i + 1,
                        ClanId = x.ClanId,
                        ClanName = x.ClanName,
                        TotalScore = x.Score,
                        TeamCount = x.TeamCount
                    })
                    .ToList();

                return ServiceResult<List<ClanLeaderboardEntryDTO>>.SuccessResult(ranked);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanLeaderboardEntryDTO>>.FailureResult($"Failed to get clan leaderboard: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<SeasonalClanRankingEntryDTO>>> GetSeasonalClanRanking(int season)
        {
            try
            {
                var competitions = await _context.Competitions
                    .Where(c => c.Season == season && c.Status == "Completed")
                    .Select(c => c.Id)
                    .ToListAsync();

                if (competitions.Count == 0)
                    return ServiceResult<List<SeasonalClanRankingEntryDTO>>.SuccessResult(new List<SeasonalClanRankingEntryDTO>(), "No completed competitions in this season");

                var registrations = await _context.CompetitionRegistrations
                    .Where(r => competitions.Contains(r.CompetitionId))
                    .Include(r => r.Team)
                        .ThenInclude(t => t.Clan)
                    .ToListAsync();

                var teamIds = registrations.Select(r => r.TeamId).Distinct().ToList();
                var teamMembers = await _context.TeamMembers
                    .Where(tm => teamIds.Contains(tm.TeamId))
                    .ToListAsync();
                var memberIds = teamMembers.Select(tm => tm.UserId).Distinct().ToList();

                var scores = await _context.CompetitionScores
                    .Where(s => competitions.Contains(s.CompetitionId) && memberIds.Contains(s.UserId))
                    .ToListAsync();

                var teamCompetitionScores = registrations
                    .Select(reg =>
                    {
                        var members = teamMembers.Where(tm => tm.TeamId == reg.TeamId).Select(tm => tm.UserId).ToList();
                        var total = scores.Where(s => s.CompetitionId == reg.CompetitionId && members.Contains(s.UserId)).Sum(s => s.Score);
                        return new
                        {
                            reg.CompetitionId,
                            ClanId = reg.Team.ClanId,
                            ClanName = reg.Team.Clan?.Name ?? "Unknown Clan",
                            Score = (decimal)total
                        };
                    })
                    .ToList();

                var seasonRanking = teamCompetitionScores
                    .GroupBy(x => new { x.ClanId, x.ClanName })
                    .Select(g => new
                    {
                        g.Key.ClanId,
                        g.Key.ClanName,
                        SeasonPoints = g.Sum(x => x.Score),
                        CompetitionsPlayed = g.Select(x => x.CompetitionId).Distinct().Count()
                    })
                    .OrderByDescending(x => x.SeasonPoints)
                    .ThenByDescending(x => x.CompetitionsPlayed)
                    .ThenBy(x => x.ClanName)
                    .Select((x, i) => new SeasonalClanRankingEntryDTO
                    {
                        RankNo = i + 1,
                        ClanId = x.ClanId,
                        ClanName = x.ClanName,
                        SeasonPoints = x.SeasonPoints,
                        CompetitionsPlayed = x.CompetitionsPlayed
                    })
                    .ToList();

                return ServiceResult<List<SeasonalClanRankingEntryDTO>>.SuccessResult(seasonRanking);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<SeasonalClanRankingEntryDTO>>.FailureResult($"Failed to get seasonal ranking: {ex.Message}");
            }
        }

        private static int GetTopTeamsCountFromScoringSystem(string? scoringSystem)
        {
            if (string.IsNullOrWhiteSpace(scoringSystem)) return 2;
            try
            {
                using var doc = JsonDocument.Parse(scoringSystem);
                if (doc.RootElement.TryGetProperty("topN", out var topN) && topN.ValueKind == JsonValueKind.Number)
                {
                    var value = topN.GetInt32();
                    return value < 1 ? 1 : value;
                }
            }
            catch
            {
            }

            return 2;
        }

        private static (int MinTeamSize, int MaxTeamSize) ResolveTeamSizeRange(string? competitionRules, int fallbackTeamSize)
        {
            var fallback = fallbackTeamSize > 0 ? fallbackTeamSize : 3;

            if (string.IsNullOrWhiteSpace(competitionRules))
                return (fallback, fallback);

            try
            {
                using var doc = JsonDocument.Parse(competitionRules);
                var min = fallback;
                var max = fallback;

                if (doc.RootElement.TryGetProperty("teamMinSize", out var minEl) && minEl.TryGetInt32(out var minValue) && minValue > 0)
                    min = minValue;

                if (doc.RootElement.TryGetProperty("teamMaxSize", out var maxEl) && maxEl.TryGetInt32(out var maxValue) && maxValue > 0)
                    max = maxValue;

                if (max < min)
                    max = min;

                return (min, max);
            }
            catch
            {
                return (fallback, fallback);
            }
        }

        private async Task EnsureProgressionDefaultsAsync()
        {
            if (!await _context.ExpRewardRules.AnyAsync())
            {
                var defaults = new List<ExpRewardRule>
                {
                    new() { Position = 1, ExpAmount = 3000 },
                    new() { Position = 2, ExpAmount = 2500 },
                    new() { Position = 3, ExpAmount = 2000 },
                    new() { Position = 4, ExpAmount = 1500 },
                    new() { Position = 5, ExpAmount = 1000 },
                    new() { Position = 6, ExpAmount = 800 },
                    new() { Position = 7, ExpAmount = 600 },
                    new() { Position = 8, ExpAmount = 500 },
                    new() { Position = 9, ExpAmount = 400 },
                    new() { Position = 10, ExpAmount = 300 }
                };
                _context.ExpRewardRules.AddRange(defaults);
            }

            if (!await _context.LevelThresholds.AnyAsync())
            {
                var defaults = Enumerable.Range(1, 20)
                    .Select(level => new LevelThreshold
                    {
                        Level = level,
                        RequiredExp = level * 3000L
                    })
                    .ToList();
                _context.LevelThresholds.AddRange(defaults);
            }

            await _context.SaveChangesAsync();
        }

        private static int GetAdminClanCompetitionExpForPosition(int position)
        {
            if (position <= 0)
                return 50;

            if (position == 1)
                return 1000;

            if (position == 2)
                return 800;

            if (position == 3)
                return 500;

            if (position <= 10)
                return 300;

            return 50;
        }

        private static List<CompetitionExpDistributionDTO> GetAdminClanCompetitionExpDistribution()
        {
            return new List<CompetitionExpDistributionDTO>
            {
                new() { RankRange = "1", Exp = 1000 },
                new() { RankRange = "2", Exp = 800 },
                new() { RankRange = "3", Exp = 500 },
                new() { RankRange = "4-10", Exp = 300 },
                new() { RankRange = "11+", Exp = 50 },
            };
        }

        private static int CalculateLevelFromThreshold(long exp, IReadOnlyList<LevelThreshold> thresholds)
        {
            if (thresholds.Count == 0)
                return (int)(exp / 3000);

            return thresholds
                .Where(t => exp >= t.RequiredExp)
                .Select(t => t.Level)
                .DefaultIfEmpty(0)
                .Max();
        }
    }
}
