using System.Text.Json;
using System.Text.Json.Nodes;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ClanCompetitionOrchestrationService : IClanCompetitionOrchestrationService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public ClanCompetitionOrchestrationService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<ServiceResult<CompetitionDTO>> CreateAdminClanCompetition(CreateClanCompetitionDTO dto, int adminUserId)
        {
            try
            {
                var admin = await _context.Users.FirstOrDefaultAsync(u => u.Id == adminUserId);
                if (admin == null || !admin.IsAdmin)
                    return ServiceResult<CompetitionDTO>.FailureResult("Only admin can create clan competitions");

                if (dto.StartAt >= dto.EndAt)
                    return ServiceResult<CompetitionDTO>.FailureResult("End time must be after start time");

                if (dto.TeamMinSize < 3 || dto.TeamMaxSize > 4 || dto.TeamMinSize > dto.TeamMaxSize)
                    return ServiceResult<CompetitionDTO>.FailureResult("Team size must be within 3-4 members");

                if (dto.MaxTeamsPerClan < 1)
                    return ServiceResult<CompetitionDTO>.FailureResult("Max teams per clan must be at least 1");

                if (dto.ChallengeTypes == null || dto.ChallengeTypes.Count == 0)
                    return ServiceResult<CompetitionDTO>.FailureResult("At least one challenge type is required");

                var totalWeight = dto.ChallengeTypes.Sum(c => c.Weight);
                if (totalWeight <= 0.99m || totalWeight >= 1.01m)
                    return ServiceResult<CompetitionDTO>.FailureResult("Challenge type weights must sum to 1.0");

                var clanIds = await _context.Clans
                    .OrderBy(c => c.Rank)
                    .Select(c => c.Id)
                    .ToListAsync();

                var scoringSystem = JsonSerializer.Serialize(new
                {
                    competitionType = dto.CompetitionType,
                    weights = dto.ChallengeTypes,
                    formula = "TeamScore = sum(TypeScore * Weight)",
                    clanAggregation = "sum(top N team scores)",
                    topN = dto.TopTeamsCountForClanScore,
                    sort = "score-desc,time-asc"
                });

                var rules = JsonSerializer.Serialize(new
                {
                    competitionPeriod = dto.CompetitionPeriod,
                    competitionType = dto.CompetitionType,
                    participation = "clan-team-only",
                    noSingleParticipant = true,
                    teamMinSize = dto.TeamMinSize,
                    teamMaxSize = dto.TeamMaxSize,
                    maxTeamsPerClan = dto.MaxTeamsPerClan,
                    challengeTypes = dto.ChallengeTypes.Select(x => x.ChallengeType).ToList()
                });

                var competition = new Competition
                {
                    Title = dto.Title,
                    Description = dto.Description ?? string.Empty,
                    CompetitionType = dto.CompetitionType,
                    StartDate = dto.StartAt,
                    EndDate = dto.EndAt,
                    DurationMinutes = (int)Math.Max(1, (dto.EndAt - dto.StartAt).TotalMinutes),
                    IsTeamBased = true,
                    TeamSize = dto.TeamMaxSize,
                    AllowMultipleAttempts = true,
                    IsPublic = true,
                    AllowedClanIds = string.Join(',', clanIds),
                    CompetitionRules = rules,
                    ScoringSystem = scoringSystem,
                    CreatorId = adminUserId,
                    CreatorRole = "Admin",
                    IsApproved = true,
                    Status = "Upcoming",
                    Season = ResolveSeasonNumber(dto.StartAt),
                    PointRangeMin = null,
                    PointRangeMax = null,
                    ShowLeaderboard = true,
                    MaxParticipants = 10000
                };

                _context.Competitions.Add(competition);
                await _context.SaveChangesAsync();

                var result = new CompetitionDTO
                {
                    Id = competition.Id,
                    Title = competition.Title,
                    Description = competition.Description,
                    CompetitionType = competition.CompetitionType,
                    StartDate = competition.StartDate,
                    EndDate = competition.EndDate,
                    Status = competition.Status,
                    IsTeamBased = competition.IsTeamBased,
                    TeamSize = competition.TeamSize,
                    CreatorId = competition.CreatorId,
                    CreatorRole = competition.CreatorRole,
                    IsApproved = competition.IsApproved,
                    IsPublic = competition.IsPublic,
                    AllowedClanIds = clanIds,
                    ParticipantCount = competition.ParticipantCount,
                    CreatedAt = competition.CreatedAt
                };

                return ServiceResult<CompetitionDTO>.SuccessResult(result, "Admin clan competition created");
            }
            catch (Exception ex)
            {
                return ServiceResult<CompetitionDTO>.FailureResult($"Failed to create competition: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanLeaderboardEntryDTO>>> GetClanRanking()
        {
            try
            {
                var clans = await _context.Clans
                    .OrderByDescending(c => c.TotalPoints)
                    .ThenBy(c => c.CreatedAt)
                    .Select(c => new { c.Id, c.Name, c.TotalPoints })
                    .ToListAsync();

                var ranked = clans
                    .Select((c, index) => new ClanLeaderboardEntryDTO
                    {
                        RankNo = index + 1,
                        ClanId = c.Id,
                        ClanName = c.Name,
                        TotalScore = c.TotalPoints,
                        TeamCount = 0
                    })
                    .ToList();

                return ServiceResult<List<ClanLeaderboardEntryDTO>>.SuccessResult(ranked);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanLeaderboardEntryDTO>>.FailureResult($"Failed to fetch clan ranking: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanTeamSuggestionDTO>>> GenerateTeamSuggestions(int competitionId, int adminUserId, GenerateTeamSuggestionsDTO? policy = null)
        {
            try
            {
                var admin = await _context.Users.FirstOrDefaultAsync(u => u.Id == adminUserId);
                if (admin == null || !admin.IsAdmin)
                    return ServiceResult<List<ClanTeamSuggestionDTO>>.FailureResult("Only admin can generate suggestions");

                var competition = await _context.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId);
                if (competition == null)
                    return ServiceResult<List<ClanTeamSuggestionDTO>>.FailureResult("Competition not found");

                policy ??= new GenerateTeamSuggestionsDTO();

                var competitionType = competition.CompetitionType;
                var maxTeamsPerClan = GetMaxTeamsPerClanFromRules(competition.CompetitionRules);
                var clanPerformanceMap = await BuildClanTypePerformanceMap(competitionType);

                var clanRows = await _context.Clans
                    .OrderByDescending(c => c.TotalPoints)
                    .ThenBy(c => c.CreatedAt)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.TotalPoints,
                        c.LeaderId,
                        c.MemberCount,
                        c.CompetitionWins,
                        c.TotalCompetitions,
                        c.WeeklyPoints,
                        c.MonthlyPoints
                    })
                    .ToListAsync();

                if (clanRows.Count == 0)
                    return ServiceResult<List<ClanTeamSuggestionDTO>>.SuccessResult(new List<ClanTeamSuggestionDTO>(), "No clans available");

                var clanIds = clanRows.Select(c => c.Id).ToList();

                var activeMemberMap = await _context.ClanMembers
                    .Where(cm => clanIds.Contains(cm.ClanId))
                    .Join(_context.Users,
                        cm => cm.UserId,
                        u => u.Id,
                        (cm, u) => new { cm.ClanId, u.LastActive, u.LastLogin })
                    .GroupBy(x => x.ClanId)
                    .Select(g => new
                    {
                        ClanId = g.Key,
                        ActiveMembers = g.Count(x =>
                            (x.LastActive.HasValue && x.LastActive.Value >= DateTime.UtcNow.AddDays(-30)) ||
                            (x.LastLogin.HasValue && x.LastLogin.Value >= DateTime.UtcNow.AddDays(-30)))
                    })
                    .ToDictionaryAsync(x => x.ClanId, x => x.ActiveMembers);

                var weightedRows = clanRows.Select((c, i) =>
                {
                    var activeMembers = activeMemberMap.TryGetValue(c.Id, out var active) ? active : 0;
                    var winRate = c.TotalCompetitions > 0 ? (decimal)c.CompetitionWins / c.TotalCompetitions : 0m;
                    var historical = ((decimal)c.MonthlyPoints * 0.7m) + ((decimal)c.WeeklyPoints * 0.3m);

                    if (clanPerformanceMap.TryGetValue(c.Id, out var perf) && perf.CompetitionsPlayed > 0)
                    {
                        var rankBoost = Math.Max(1m, 20m - perf.AverageClanRank);
                        historical = perf.TotalScore + (perf.CompetitionsPlayed * 25m) + (rankBoost * 30m);
                    }

                    var adjusted =
                        c.TotalPoints +
                        (c.TotalPoints * winRate * policy.HistoricalPerformanceWeight) +
                        (historical * policy.HistoricalPerformanceWeight) +
                        (activeMembers * 10m * policy.ActiveMemberWeight);

                    return new
                    {
                        Clan = c,
                        Rank = i + 1,
                        ActiveMembers = activeMembers,
                        HistoricalScore = historical,
                        AdjustedScore = adjusted <= 0 ? 1m : adjusted
                    };
                }).ToList();

                var totalAdjusted = weightedRows.Sum(x => x.AdjustedScore);
                var totalTeamsAllowed = Math.Max(1, policy.TotalTeamsAllowed);

                var provisional = weightedRows.Select(x =>
                {
                    var exact = totalAdjusted <= 0 ? 0m : (x.AdjustedScore / totalAdjusted) * totalTeamsAllowed;
                    var floor = (int)Math.Floor(exact);
                    var capByMember = Math.Max(0, x.Clan.MemberCount / 3);
                    var capByCompetition = maxTeamsPerClan > 0 ? maxTeamsPerClan : int.MaxValue;

                    return new
                    {
                        x.Clan,
                        x.Rank,
                        x.ActiveMembers,
                        x.HistoricalScore,
                        Exact = exact,
                        Floor = floor,
                        Fraction = exact - floor,
                        MaxByMember = Math.Min(capByMember, capByCompetition)
                    };
                }).ToList();

                var working = provisional.Select(x => new TeamAllocationWork
                {
                    ClanId = x.Clan.Id,
                    ClanName = x.Clan.Name,
                    ClanRank = x.Rank,
                    ClanPoints = x.Clan.TotalPoints,
                    ActiveMembers = x.ActiveMembers,
                    HistoricalScore = x.HistoricalScore,
                    Fraction = x.Fraction,
                    Assigned = Math.Min(Math.Max(0, x.Floor), x.MaxByMember),
                    MaxByMember = x.MaxByMember
                }).ToList();

                var distributed = working.Sum(x => x.Assigned);
                var remaining = totalTeamsAllowed - distributed;

                if (remaining > 0)
                {
                    foreach (var row in working.OrderByDescending(x => x.Fraction).ThenBy(x => x.ClanRank))
                    {
                        if (remaining <= 0) break;
                        if (row.Assigned >= row.MaxByMember) continue;

                        row.Assigned += 1;
                        remaining -= 1;
                    }
                }
                else if (remaining < 0)
                {
                    var toRemove = Math.Abs(remaining);
                    foreach (var row in working.OrderBy(x => x.Fraction).ThenByDescending(x => x.ClanRank))
                    {
                        if (toRemove <= 0) break;
                        if (row.Assigned <= 0) continue;

                        row.Assigned -= 1;
                        toRemove -= 1;
                    }
                }

                var suggestions = working
                    .OrderBy(x => x.ClanRank)
                    .Select(x => new ClanTeamSuggestionDTO
                    {
                        ClanId = x.ClanId,
                        ClanName = x.ClanName,
                        ClanRank = x.ClanRank,
                        ClanPoints = x.ClanPoints,
                        ActiveMembers = x.ActiveMembers,
                        HistoricalPerformanceScore = Math.Round(x.HistoricalScore, 2),
                        SuggestedTeamCount = x.Assigned,
                        IsManualOverride = false,
                        SuggestionReason = $"{competitionType} performance ভিত্তিক suggestion (max {maxTeamsPerClan} team/clan)"
                    })
                    .ToList();

                PersistSuggestionSummary(competition, policy.TotalTeamsAllowed, suggestions);

                foreach (var suggestion in suggestions)
                {
                    var leaderId = clanRows.First(x => x.Id == suggestion.ClanId).LeaderId;
                    await _notificationService.CreateNotification(
                        leaderId,
                        "ClanTeamSuggestion",
                        "Competition Team Suggestion",
                        $"{competition.Title}: Suggested {suggestion.SuggestedTeamCount} team(s) for your clan.",
                        $"/admin/clan-competitions",
                        suggestion.ClanId,
                        adminUserId
                    );
                }

                await _context.SaveChangesAsync();

                return ServiceResult<List<ClanTeamSuggestionDTO>>.SuccessResult(suggestions, "Suggestions generated using dynamic formula and leaders notified");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanTeamSuggestionDTO>>.FailureResult($"Failed to generate suggestions: {ex.Message}");
            }
        }

        private static void PersistSuggestionSummary(Competition competition, int totalTeamsAllowed, List<ClanTeamSuggestionDTO> suggestions)
        {
            JsonObject root;
            try
            {
                root = string.IsNullOrWhiteSpace(competition.CompetitionRules)
                    ? new JsonObject()
                    : (JsonNode.Parse(competition.CompetitionRules)?.AsObject() ?? new JsonObject());
            }
            catch
            {
                root = new JsonObject();
            }

            var distributed = suggestions.Sum(x => x.SuggestedTeamCount);
            var remaining = Math.Max(0, totalTeamsAllowed - distributed);

            var suggestionJson = new JsonObject
            {
                ["totalTeamsAllowed"] = totalTeamsAllowed,
                ["totalTeamsDistributed"] = distributed,
                ["remainingTeams"] = remaining,
                ["updatedAt"] = DateTime.UtcNow,
                ["suggestions"] = JsonSerializer.SerializeToNode(suggestions)
            };

            root["teamSuggestion"] = suggestionJson;
            competition.CompetitionRules = root.ToJsonString();
            competition.UpdatedAt = DateTime.UtcNow;
        }

        public async Task<ServiceResult<TeamSuggestionSummaryDTO>> GetTeamSuggestionSummary(int competitionId)
        {
            try
            {
                var competition = await _context.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId);
                if (competition == null)
                    return ServiceResult<TeamSuggestionSummaryDTO>.FailureResult("Competition not found");

                var summary = ReadSuggestionSummary(competition);
                if (summary == null)
                {
                    return ServiceResult<TeamSuggestionSummaryDTO>.SuccessResult(new TeamSuggestionSummaryDTO
                    {
                        CompetitionId = competitionId,
                        TotalTeamsAllowed = 0,
                        TotalTeamsDistributed = 0,
                        RemainingTeams = 0,
                        UpdatedAt = DateTime.UtcNow,
                        Suggestions = new List<ClanTeamSuggestionDTO>()
                    });
                }

                summary.CompetitionId = competitionId;
                return ServiceResult<TeamSuggestionSummaryDTO>.SuccessResult(summary);
            }
            catch (Exception ex)
            {
                return ServiceResult<TeamSuggestionSummaryDTO>.FailureResult($"Failed to load suggestion summary: {ex.Message}");
            }
        }

        public async Task<ServiceResult<TeamSuggestionSummaryDTO>> ApplyTeamSuggestionOverride(int competitionId, int adminUserId, ApplyTeamSuggestionOverrideDTO dto)
        {
            try
            {
                var admin = await _context.Users.FirstOrDefaultAsync(u => u.Id == adminUserId);
                if (admin == null || !admin.IsAdmin)
                    return ServiceResult<TeamSuggestionSummaryDTO>.FailureResult("Only admin can apply overrides");

                var competition = await _context.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId);
                if (competition == null)
                    return ServiceResult<TeamSuggestionSummaryDTO>.FailureResult("Competition not found");

                var existing = ReadSuggestionSummary(competition);
                if (existing == null || existing.Suggestions.Count == 0)
                {
                    var generated = await GenerateTeamSuggestions(competitionId, adminUserId, new GenerateTeamSuggestionsDTO
                    {
                        TotalTeamsAllowed = dto.TotalTeamsAllowed
                    });

                    if (!generated.Success)
                        return ServiceResult<TeamSuggestionSummaryDTO>.FailureResult(generated.Message);

                    existing = new TeamSuggestionSummaryDTO
                    {
                        CompetitionId = competitionId,
                        TotalTeamsAllowed = dto.TotalTeamsAllowed,
                        Suggestions = generated.Data
                    };
                }

                var byClan = existing.Suggestions.ToDictionary(x => x.ClanId, x => x);
                foreach (var ov in dto.Overrides)
                {
                    if (!byClan.TryGetValue(ov.ClanId, out var target))
                        continue;

                    target.SuggestedTeamCount = ov.AssignedTeamCount;
                    target.IsManualOverride = true;
                    target.SuggestionReason = string.IsNullOrWhiteSpace(ov.Reason)
                        ? "Manual override by admin"
                        : $"Manual override: {ov.Reason}";
                }

                var distributed = byClan.Values.Sum(x => x.SuggestedTeamCount);
                if (distributed > dto.TotalTeamsAllowed)
                    return ServiceResult<TeamSuggestionSummaryDTO>.FailureResult("Override distribution exceeds total team limit");

                var updatedSuggestions = byClan.Values.OrderBy(x => x.ClanRank).ToList();
                PersistSuggestionSummary(competition, dto.TotalTeamsAllowed, updatedSuggestions);
                await _context.SaveChangesAsync();

                var leaders = await _context.Clans
                    .Where(c => byClan.Keys.Contains(c.Id))
                    .Select(c => new { c.Id, c.LeaderId })
                    .ToListAsync();

                foreach (var leader in leaders)
                {
                    var target = updatedSuggestions.First(s => s.ClanId == leader.Id);
                    await _notificationService.CreateNotification(
                        leader.LeaderId,
                        "ClanTeamOverride",
                        "Team Allocation Updated",
                        $"{competition.Title}: Admin assigned {target.SuggestedTeamCount} team(s) for your clan.",
                        "/admin/clan-competitions",
                        leader.Id,
                        adminUserId
                    );
                }

                return ServiceResult<TeamSuggestionSummaryDTO>.SuccessResult(new TeamSuggestionSummaryDTO
                {
                    CompetitionId = competitionId,
                    TotalTeamsAllowed = dto.TotalTeamsAllowed,
                    TotalTeamsDistributed = distributed,
                    RemainingTeams = dto.TotalTeamsAllowed - distributed,
                    UpdatedAt = DateTime.UtcNow,
                    Suggestions = updatedSuggestions
                }, "Overrides applied and leaders notified");
            }
            catch (Exception ex)
            {
                return ServiceResult<TeamSuggestionSummaryDTO>.FailureResult($"Failed to apply overrides: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<CompetitionTeamOverviewEntryDTO>>> GetCompetitionTeamOverview(int competitionId)
        {
            try
            {
                var competition = await _context.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId);
                if (competition == null)
                    return ServiceResult<List<CompetitionTeamOverviewEntryDTO>>.FailureResult("Competition not found");

                var allowedClanIds = ParseCsvIds(competition.AllowedClanIds);

                var teamsQuery = _context.Teams
                    .Include(t => t.Clan)
                    .AsQueryable();

                if (allowedClanIds.Count > 0)
                    teamsQuery = teamsQuery.Where(t => allowedClanIds.Contains(t.ClanId));

                var teams = await teamsQuery.ToListAsync();
                var teamIds = teams.Select(t => t.Id).ToList();

                var memberCounts = await _context.TeamMembers
                    .Where(tm => teamIds.Contains(tm.TeamId))
                    .GroupBy(tm => tm.TeamId)
                    .Select(g => new { TeamId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.TeamId, x => x.Count);

                var registrations = await _context.CompetitionRegistrations
                    .Where(r => r.CompetitionId == competitionId && teamIds.Contains(r.TeamId))
                    .ToDictionaryAsync(r => r.TeamId, r => r.Status);

                var overview = teams.Select(t =>
                {
                    var registered = registrations.TryGetValue(t.Id, out var registrationStatus);
                    var status = "Created";

                    if (registered)
                    {
                        status = registrationStatus?.Equals("Pending", StringComparison.OrdinalIgnoreCase) == true
                            ? "Pending"
                            : competition.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase)
                                ? "Completed"
                                : competition.Status.Equals("Ongoing", StringComparison.OrdinalIgnoreCase)
                                    ? "Active"
                                    : "Registered";
                    }

                    return new CompetitionTeamOverviewEntryDTO
                    {
                        TeamId = t.Id,
                        TeamName = t.Name,
                        ClanId = t.ClanId,
                        ClanName = t.Clan?.Name ?? "Unknown Clan",
                        MemberCount = memberCounts.TryGetValue(t.Id, out var mc) ? mc : 0,
                        Status = status,
                        IsRegistered = registered
                    };
                }).OrderBy(x => x.ClanName).ThenBy(x => x.TeamName).ToList();

                return ServiceResult<List<CompetitionTeamOverviewEntryDTO>>.SuccessResult(overview);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CompetitionTeamOverviewEntryDTO>>.FailureResult($"Failed to load team overview: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanMemberActivityEntryDTO>>> GetClanMemberActivity(int competitionId)
        {
            try
            {
                var competition = await _context.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId);
                if (competition == null)
                    return ServiceResult<List<ClanMemberActivityEntryDTO>>.FailureResult("Competition not found");

                var allowedClanIds = ParseCsvIds(competition.AllowedClanIds);
                var memberships = await _context.ClanMembers
                    .Include(cm => cm.User)
                    .Include(cm => cm.Clan)
                    .Where(cm => allowedClanIds.Count == 0 || allowedClanIds.Contains(cm.ClanId))
                    .ToListAsync();

                var userIds = memberships.Select(m => m.UserId).Distinct().ToList();
                var teamsJoinedMap = await _context.TeamMembers
                    .Where(tm => userIds.Contains(tm.UserId))
                    .GroupBy(tm => tm.UserId)
                    .Select(g => new { UserId = g.Key, Teams = g.Count() })
                    .ToDictionaryAsync(x => x.UserId, x => x.Teams);

                var scoreMap = await _context.CompetitionScores
                    .Where(s => s.CompetitionId == competitionId && userIds.Contains(s.UserId))
                    .GroupBy(s => s.UserId)
                    .Select(g => new { UserId = g.Key, Score = g.Sum(x => x.Score) })
                    .ToDictionaryAsync(x => x.UserId, x => (decimal)x.Score);

                var rows = memberships.Select(m =>
                {
                    var lastActive = m.User.LastActive ?? m.User.LastLogin;
                    var isActive = lastActive.HasValue && lastActive.Value >= DateTime.UtcNow.AddDays(-30);

                    return new ClanMemberActivityEntryDTO
                    {
                        UserId = m.UserId,
                        UserName = m.User.Username,
                        ClanId = m.ClanId,
                        ClanName = m.Clan.Name,
                        IsActive = isActive,
                        LastActive = lastActive,
                        TeamsJoined = teamsJoinedMap.TryGetValue(m.UserId, out var teams) ? teams : 0,
                        TotalCompetitionScore = scoreMap.TryGetValue(m.UserId, out var score) ? score : 0
                    };
                }).OrderByDescending(x => x.IsActive).ThenBy(x => x.ClanName).ThenBy(x => x.UserName).ToList();

                return ServiceResult<List<ClanMemberActivityEntryDTO>>.SuccessResult(rows);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanMemberActivityEntryDTO>>.FailureResult($"Failed to load member activity: {ex.Message}");
            }
        }

        public async Task<ServiceResult<CompetitionDashboardDTO>> GetCompetitionDashboard(int competitionId)
        {
            try
            {
                var competition = await _context.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId);
                if (competition == null)
                    return ServiceResult<CompetitionDashboardDTO>.FailureResult("Competition not found");

                var teamOverviewResult = await GetCompetitionTeamOverview(competitionId);
                if (!teamOverviewResult.Success)
                    return ServiceResult<CompetitionDashboardDTO>.FailureResult(teamOverviewResult.Message);

                var rows = teamOverviewResult.Data;
                var submissions = await _context.CompetitionScores.CountAsync(s => s.CompetitionId == competitionId);
                var avgScore = await _context.CompetitionScores
                    .Where(s => s.CompetitionId == competitionId)
                    .Select(s => (decimal?)s.Score)
                    .AverageAsync() ?? 0m;

                var challengeOverview = new List<ChallengeOverviewEntryDTO>();
                if (!string.IsNullOrWhiteSpace(competition.ScoringSystem))
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(competition.ScoringSystem);
                        if (doc.RootElement.TryGetProperty("weights", out var weights) && weights.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var w in weights.EnumerateArray())
                            {
                                challengeOverview.Add(new ChallengeOverviewEntryDTO
                                {
                                    ChallengeType = w.TryGetProperty("ChallengeType", out var ct)
                                        ? ct.GetString() ?? "Unknown"
                                        : w.TryGetProperty("challengeType", out var ct2) ? ct2.GetString() ?? "Unknown" : "Unknown",
                                    Weight = w.TryGetProperty("Weight", out var wt)
                                        ? wt.GetDecimal()
                                        : w.TryGetProperty("weight", out var wt2) ? wt2.GetDecimal() : 0m,
                                    Submissions = submissions,
                                    AverageScore = Math.Round(avgScore, 2)
                                });
                            }
                        }
                    }
                    catch
                    {
                    }
                }

                var dashboard = new CompetitionDashboardDTO
                {
                    CompetitionId = competition.Id,
                    CompetitionTitle = competition.Title,
                    Status = competition.Status,
                    TotalTeams = rows.Count,
                    RegisteredTeams = rows.Count(r => r.IsRegistered),
                    PendingTeams = rows.Count(r => r.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase)),
                    ActiveTeams = rows.Count(r => r.Status.Equals("Active", StringComparison.OrdinalIgnoreCase)),
                    CompletedTeams = rows.Count(r => r.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase)),
                    ChallengeOverview = challengeOverview
                };

                return ServiceResult<CompetitionDashboardDTO>.SuccessResult(dashboard);
            }
            catch (Exception ex)
            {
                return ServiceResult<CompetitionDashboardDTO>.FailureResult($"Failed to load dashboard: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanTypePerformanceEntryDTO>>> GetClanPerformanceByCompetitionType(string competitionType, int take = 20)
        {
            try
            {
                var normalizedType = string.IsNullOrWhiteSpace(competitionType) ? "ProgrammingMCQ" : competitionType.Trim();
                var performanceMap = await BuildClanTypePerformanceMap(normalizedType);

                if (performanceMap.Count == 0)
                    return ServiceResult<List<ClanTypePerformanceEntryDTO>>.SuccessResult(new List<ClanTypePerformanceEntryDTO>());

                var clanIds = performanceMap.Keys.ToList();
                var clanNames = await _context.Clans
                    .Where(c => clanIds.Contains(c.Id))
                    .Select(c => new { c.Id, c.Name })
                    .ToDictionaryAsync(x => x.Id, x => x.Name);

                var rows = performanceMap
                    .Select(kvp => new ClanTypePerformanceEntryDTO
                    {
                        ClanId = kvp.Key,
                        ClanName = clanNames.TryGetValue(kvp.Key, out var name) ? name : "Unknown Clan",
                        CompetitionsPlayed = kvp.Value.CompetitionsPlayed,
                        AverageClanRank = Math.Round(kvp.Value.AverageClanRank, 2),
                        BestClanRank = kvp.Value.BestClanRank,
                        TotalScore = Math.Round(kvp.Value.TotalScore, 2),
                        AverageScore = kvp.Value.CompetitionsPlayed > 0
                            ? Math.Round(kvp.Value.TotalScore / kvp.Value.CompetitionsPlayed, 2)
                            : 0
                    })
                    .OrderBy(x => x.AverageClanRank)
                    .ThenByDescending(x => x.TotalScore)
                    .Take(Math.Max(1, take))
                    .ToList();

                return ServiceResult<List<ClanTypePerformanceEntryDTO>>.SuccessResult(rows);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanTypePerformanceEntryDTO>>.FailureResult($"Failed to load clan performance: {ex.Message}");
            }
        }

        private static TeamSuggestionSummaryDTO? ReadSuggestionSummary(Competition competition)
        {
            if (string.IsNullOrWhiteSpace(competition.CompetitionRules))
                return null;

            try
            {
                using var doc = JsonDocument.Parse(competition.CompetitionRules);
                if (!doc.RootElement.TryGetProperty("teamSuggestion", out var suggestion))
                    return null;

                var totalAllowed = suggestion.TryGetProperty("totalTeamsAllowed", out var ta) ? ta.GetInt32() : 0;
                var distributed = suggestion.TryGetProperty("totalTeamsDistributed", out var td) ? td.GetInt32() : 0;
                var remaining = suggestion.TryGetProperty("remainingTeams", out var rem) ? rem.GetInt32() : Math.Max(0, totalAllowed - distributed);
                var updatedAt = suggestion.TryGetProperty("updatedAt", out var up) && up.ValueKind == JsonValueKind.String && DateTime.TryParse(up.GetString(), out var parsed)
                    ? parsed
                    : DateTime.UtcNow;

                var suggestions = new List<ClanTeamSuggestionDTO>();
                if (suggestion.TryGetProperty("suggestions", out var list) && list.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in list.EnumerateArray())
                    {
                        suggestions.Add(new ClanTeamSuggestionDTO
                        {
                            ClanId = item.TryGetProperty("ClanId", out var clanId) ? clanId.GetInt32() : item.TryGetProperty("clanId", out var clanId2) ? clanId2.GetInt32() : 0,
                            ClanName = item.TryGetProperty("ClanName", out var clanName) ? clanName.GetString() ?? string.Empty : item.TryGetProperty("clanName", out var clanName2) ? clanName2.GetString() ?? string.Empty : string.Empty,
                            ClanRank = item.TryGetProperty("ClanRank", out var clanRank) ? clanRank.GetInt32() : item.TryGetProperty("clanRank", out var clanRank2) ? clanRank2.GetInt32() : 0,
                            ClanPoints = item.TryGetProperty("ClanPoints", out var clanPoints) ? clanPoints.GetInt32() : item.TryGetProperty("clanPoints", out var clanPoints2) ? clanPoints2.GetInt32() : 0,
                            ActiveMembers = item.TryGetProperty("ActiveMembers", out var activeMembers) ? activeMembers.GetInt32() : item.TryGetProperty("activeMembers", out var activeMembers2) ? activeMembers2.GetInt32() : 0,
                            HistoricalPerformanceScore = item.TryGetProperty("HistoricalPerformanceScore", out var historical) ? historical.GetDecimal() : item.TryGetProperty("historicalPerformanceScore", out var historical2) ? historical2.GetDecimal() : 0,
                            SuggestedTeamCount = item.TryGetProperty("SuggestedTeamCount", out var count) ? count.GetInt32() : item.TryGetProperty("suggestedTeamCount", out var count2) ? count2.GetInt32() : 0,
                            IsManualOverride = item.TryGetProperty("IsManualOverride", out var manual) && manual.ValueKind == JsonValueKind.True || item.TryGetProperty("isManualOverride", out var manual2) && manual2.ValueKind == JsonValueKind.True,
                            SuggestionReason = item.TryGetProperty("SuggestionReason", out var reason) ? reason.GetString() ?? string.Empty : item.TryGetProperty("suggestionReason", out var reason2) ? reason2.GetString() ?? string.Empty : string.Empty
                        });
                    }
                }

                return new TeamSuggestionSummaryDTO
                {
                    TotalTeamsAllowed = totalAllowed,
                    TotalTeamsDistributed = distributed,
                    RemainingTeams = remaining,
                    UpdatedAt = updatedAt,
                    Suggestions = suggestions
                };
            }
            catch
            {
                return null;
            }
        }

        private static HashSet<int> ParseCsvIds(string? csv)
        {
            if (string.IsNullOrWhiteSpace(csv)) return new HashSet<int>();

            return csv.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(x => int.TryParse(x, out var id) ? id : (int?)null)
                .Where(x => x.HasValue)
                .Select(x => x!.Value)
                .ToHashSet();
        }

        private sealed class TeamAllocationWork
        {
            public int ClanId { get; set; }
            public string ClanName { get; set; } = string.Empty;
            public int ClanRank { get; set; }
            public int ClanPoints { get; set; }
            public int ActiveMembers { get; set; }
            public decimal HistoricalScore { get; set; }
            public decimal Fraction { get; set; }
            public int Assigned { get; set; }
            public int MaxByMember { get; set; }
        }

        private static int ResolveSeasonNumber(DateTime dateUtc)
        {
            // 2 seasons per year (6 months each)
            var half = dateUtc.Month <= 6 ? 1 : 2;
            return (dateUtc.Year * 10) + half;
        }

        private static int GetMaxTeamsPerClanFromRules(string? competitionRules)
        {
            if (string.IsNullOrWhiteSpace(competitionRules))
                return 2;

            try
            {
                using var doc = JsonDocument.Parse(competitionRules);
                if (doc.RootElement.TryGetProperty("maxTeamsPerClan", out var maxTeams) && maxTeams.TryGetInt32(out var value) && value > 0)
                    return value;
            }
            catch
            {
            }

            return 2;
        }

        private static int GetTopNFromScoringSystem(string? scoringSystem)
        {
            if (string.IsNullOrWhiteSpace(scoringSystem))
                return 2;

            try
            {
                using var doc = JsonDocument.Parse(scoringSystem);
                if (doc.RootElement.TryGetProperty("topN", out var topN) && topN.TryGetInt32(out var value) && value > 0)
                    return value;
            }
            catch
            {
            }

            return 2;
        }

        private async Task<Dictionary<int, (int CompetitionsPlayed, decimal AverageClanRank, int BestClanRank, decimal TotalScore)>> BuildClanTypePerformanceMap(string competitionType)
        {
            var completedCompetitions = await _context.Competitions
                .AsNoTracking()
                .Where(c => c.IsTeamBased
                    && c.CreatorRole == "Admin"
                    && c.Status == "Completed"
                    && c.CompetitionType == competitionType)
                .Select(c => new { c.Id, c.ScoringSystem })
                .ToListAsync();

            if (completedCompetitions.Count == 0)
            {
                return new Dictionary<int, (int CompetitionsPlayed, decimal AverageClanRank, int BestClanRank, decimal TotalScore)>();
            }

            var competitionIds = completedCompetitions.Select(c => c.Id).ToList();

            var registrations = await _context.CompetitionRegistrations
                .AsNoTracking()
                .Where(r => competitionIds.Contains(r.CompetitionId))
                .Include(r => r.Team)
                .ToListAsync();

            if (registrations.Count == 0)
            {
                return new Dictionary<int, (int CompetitionsPlayed, decimal AverageClanRank, int BestClanRank, decimal TotalScore)>();
            }

            var teamIds = registrations.Select(r => r.TeamId).Distinct().ToList();
            var members = await _context.TeamMembers
                .AsNoTracking()
                .Where(tm => teamIds.Contains(tm.TeamId))
                .ToListAsync();

            var memberIds = members.Select(m => m.UserId).Distinct().ToList();
            var scores = await _context.CompetitionScores
                .AsNoTracking()
                .Where(s => competitionIds.Contains(s.CompetitionId) && memberIds.Contains(s.UserId))
                .ToListAsync();

            var aggregatedRows = new List<(int CompetitionId, int ClanId, decimal Score)>();

            foreach (var competition in completedCompetitions)
            {
                var topN = GetTopNFromScoringSystem(competition.ScoringSystem);
                var regs = registrations.Where(r => r.CompetitionId == competition.Id && r.Team != null).ToList();

                var teamRows = regs.Select(r =>
                {
                    var teamMemberIds = members.Where(m => m.TeamId == r.TeamId).Select(m => m.UserId).ToList();
                    var total = scores.Where(s => s.CompetitionId == r.CompetitionId && teamMemberIds.Contains(s.UserId)).Sum(s => s.Score);
                    return new { ClanId = r.Team.ClanId, Score = total };
                }).ToList();

                var clanRows = teamRows
                    .GroupBy(x => x.ClanId)
                    .Select(g => new
                    {
                        ClanId = g.Key,
                        Score = g.OrderByDescending(x => x.Score).Take(topN).Sum(x => x.Score)
                    })
                    .OrderByDescending(x => x.Score)
                    .ToList();

                aggregatedRows.AddRange(clanRows.Select(x => (competition.Id, x.ClanId, (decimal)x.Score)));
            }

            var performance = aggregatedRows
                .GroupBy(x => x.ClanId)
                .ToDictionary(
                    g => g.Key,
                    g =>
                    {
                        var played = g.Select(x => x.CompetitionId).Distinct().Count();
                        var rankedRows = g
                            .GroupBy(x => x.CompetitionId)
                            .Select(grp => grp.First())
                            .ToList();

                        var ranks = new List<int>();
                        foreach (var competitionId in rankedRows.Select(x => x.CompetitionId))
                        {
                            var ordering = aggregatedRows
                                .Where(r => r.CompetitionId == competitionId)
                                .OrderByDescending(r => r.Score)
                                .ThenBy(r => r.ClanId)
                                .Select((r, i) => new { r.ClanId, Rank = i + 1 })
                                .ToList();

                            var clanRank = ordering.FirstOrDefault(o => o.ClanId == g.Key)?.Rank ?? ordering.Count;
                            ranks.Add(clanRank);
                        }

                        var avgRank = ranks.Count > 0 ? (decimal)ranks.Average() : 999m;
                        var bestRank = ranks.Count > 0 ? ranks.Min() : 999;
                        var totalScore = g.Sum(x => x.Score);

                        return (played, avgRank, bestRank, totalScore);
                    });

            return performance;
        }
    }
}
