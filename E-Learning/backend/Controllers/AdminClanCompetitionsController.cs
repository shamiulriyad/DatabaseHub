using backend.DTOs;
using backend.Data;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/admin/clan-competitions")]
    [Authorize]
    public class AdminClanCompetitionsController : ControllerBase
    {
        private readonly IClanCompetitionOrchestrationService _orchestrationService;
        private readonly IClanCompetitionScoringService _scoringService;
        private readonly ApplicationDbContext _context;

        public AdminClanCompetitionsController(
            IClanCompetitionOrchestrationService orchestrationService, 
            IClanCompetitionScoringService scoringService,
            ApplicationDbContext context)
        {
            _orchestrationService = orchestrationService;
            _scoringService = scoringService;
            _context = context;
        }

        private async Task<bool> IsAdmin(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            return user?.IsAdmin == true;
        }

        private int GetUserId() => int.Parse(User.FindFirst("userId")?.Value ?? "0");

        // ===== COMPETITION CRUD =====

        [HttpGet]
        public async Task<IActionResult> GetAllCompetitions([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var query = _context.Competitions
                .Where(c => c.IsTeamBased && c.CreatorRole == "Admin")
                .OrderByDescending(c => c.CreatedAt);

            var total = await query.CountAsync();
            var rows = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.Description,
                    c.CompetitionType,
                    c.CompetitionRules,
                    c.StartDate,
                    c.EndDate,
                    c.Status,
                    TotalTeams = _context.CompetitionRegistrations.Count(cr => cr.CompetitionId == c.Id),
                    TotalQuestions = c.Questions.Count,
                    TotalSubmissions = _context.CompetitionScores.Count(cs => cs.CompetitionId == c.Id),
                    c.CreatedAt
                })
                .ToListAsync();

            var competitions = rows.Select(c => new AdminCompetitionListDTO
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                CompetitionPeriod = ResolveCompetitionPeriod(c.CompetitionRules, c.StartDate, c.EndDate),
                CompetitionType = c.CompetitionType,
                MaxTeamsPerClan = ResolveMaxTeamsPerClan(c.CompetitionRules),
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                Status = c.Status,
                TotalTeams = c.TotalTeams,
                TotalQuestions = c.TotalQuestions,
                TotalSubmissions = c.TotalSubmissions,
                CreatedAt = c.CreatedAt
            }).ToList();

            return Ok(new { success = true, data = competitions, total, page, pageSize });
        }

        [HttpGet("{competitionId:int}")]
        public async Task<IActionResult> GetCompetition(int competitionId)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var competition = await _context.Competitions
                .Include(c => c.Questions)
                .FirstOrDefaultAsync(c => c.Id == competitionId);

            if (competition == null)
                return NotFound(new { success = false, message = "Competition not found" });

            return Ok(new { success = true, data = competition });
        }

        [HttpPost]
        public async Task<IActionResult> CreateCompetition([FromBody] CreateClanCompetitionDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _orchestrationService.CreateAdminClanCompetition(dto, userId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = result.Message, data = result.Data });
        }

        [HttpPut("{competitionId:int}")]
        public async Task<IActionResult> UpdateCompetition(int competitionId, [FromBody] UpdateCompetitionDTO dto)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var competition = await _context.Competitions.FindAsync(competitionId);
            if (competition == null)
                return NotFound(new { success = false, message = "Competition not found" });

            if (dto.Title != null) competition.Title = dto.Title;
            if (dto.Description != null) competition.Description = dto.Description;
            if (dto.StartDate.HasValue) competition.StartDate = dto.StartDate.Value;
            if (dto.EndDate.HasValue) competition.EndDate = dto.EndDate.Value;
            if (dto.IsPublic.HasValue) competition.IsPublic = dto.IsPublic.Value;

            competition.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Competition updated successfully" });
        }

        [HttpDelete("{competitionId:int}")]
        public async Task<IActionResult> DeleteCompetition(int competitionId)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var competition = await _context.Competitions
                .Include(c => c.Questions)
                .FirstOrDefaultAsync(c => c.Id == competitionId);

            if (competition == null)
                return NotFound(new { success = false, message = "Competition not found" });

            // Check if competition has started
            if (competition.Status == "Ongoing" || competition.Status == "Completed")
                return BadRequest(new { success = false, message = "Cannot delete ongoing or completed competitions" });

            _context.Competitions.Remove(competition);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Competition deleted successfully" });
        }

        // ===== QUESTION MANAGEMENT =====

        [HttpGet("{competitionId:int}/questions")]
        public async Task<IActionResult> GetQuestions(int competitionId)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var questions = await _context.CompetitionQuestions
                .Where(q => q.CompetitionId == competitionId)
                .OrderBy(q => q.Order)
                .Select(q => new MCQQuestionDTO
                {
                    Id = q.Id,
                    CompetitionId = q.CompetitionId,
                    QuestionText = q.QuestionText,
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD,
                    CorrectAnswer = q.CorrectAnswer,
                    Points = q.Points,
                    QuestionOrder = q.Order,
                    CreatedAt = q.CreatedAt
                })
                .ToListAsync();

            return Ok(new { success = true, data = questions });
        }

        [HttpPost("{competitionId:int}/questions")]
        public async Task<IActionResult> AddQuestion(int competitionId, [FromBody] CreateMCQQuestionDTO dto)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var competition = await _context.Competitions.FindAsync(competitionId);
            if (competition == null)
                return NotFound(new { success = false, message = "Competition not found" });

            var maxOrder = await _context.CompetitionQuestions
                .Where(q => q.CompetitionId == competitionId)
                .MaxAsync(q => (int?)q.Order) ?? 0;

            var question = new CompetitionQuestion
            {
                CompetitionId = competitionId,
                QuestionText = dto.QuestionText,
                OptionA = dto.OptionA,
                OptionB = dto.OptionB,
                OptionC = dto.OptionC,
                OptionD = dto.OptionD,
                CorrectAnswer = dto.CorrectAnswer,
                Points = dto.Points,
                Order = dto.QuestionOrder > 0 ? dto.QuestionOrder : maxOrder + 1,
                CreatedAt = DateTime.UtcNow
            };

            _context.CompetitionQuestions.Add(question);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Question added successfully", data = new { id = question.Id } });
        }

        [HttpPut("{competitionId:int}/questions/{questionId:int}")]
        public async Task<IActionResult> UpdateQuestion(int competitionId, int questionId, [FromBody] UpdateMCQQuestionDTO dto)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var question = await _context.CompetitionQuestions
                .FirstOrDefaultAsync(q => q.Id == questionId && q.CompetitionId == competitionId);

            if (question == null)
                return NotFound(new { success = false, message = "Question not found" });

            if (dto.QuestionText != null) question.QuestionText = dto.QuestionText;
            if (dto.OptionA != null) question.OptionA = dto.OptionA;
            if (dto.OptionB != null) question.OptionB = dto.OptionB;
            if (dto.OptionC != null) question.OptionC = dto.OptionC;
            if (dto.OptionD != null) question.OptionD = dto.OptionD;
            if (dto.CorrectAnswer != null) question.CorrectAnswer = dto.CorrectAnswer;
            if (dto.Points.HasValue) question.Points = dto.Points.Value;
            if (dto.QuestionOrder.HasValue) question.Order = dto.QuestionOrder.Value;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Question updated successfully" });
        }

        [HttpDelete("{competitionId:int}/questions/{questionId:int}")]
        public async Task<IActionResult> DeleteQuestion(int competitionId, int questionId)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var question = await _context.CompetitionQuestions
                .FirstOrDefaultAsync(q => q.Id == questionId && q.CompetitionId == competitionId);

            if (question == null)
                return NotFound(new { success = false, message = "Question not found" });

            _context.CompetitionQuestions.Remove(question);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Question deleted successfully" });
        }

        [HttpPost("{competitionId:int}/questions/import")]
        public async Task<IActionResult> ImportQuestions(int competitionId, [FromBody] ImportQuestionsDTO dto)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var competition = await _context.Competitions.FindAsync(competitionId);
            if (competition == null)
                return NotFound(new { success = false, message = "Competition not found" });

            var maxOrder = await _context.CompetitionQuestions
                .Where(q => q.CompetitionId == competitionId)
                .MaxAsync(q => (int?)q.Order) ?? 0;

            var questions = dto.Questions.Select((q, index) => new CompetitionQuestion
            {
                CompetitionId = competitionId,
                QuestionText = q.QuestionText,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                CorrectAnswer = q.CorrectAnswer,
                Points = q.Points,
                Order = maxOrder + index + 1,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.CompetitionQuestions.AddRange(questions);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = $"{questions.Count} questions imported successfully" });
        }

        // ===== TEAM REGISTRATION MANAGEMENT =====

        [HttpGet("{competitionId:int}/teams")]
        public async Task<IActionResult> GetRegisteredTeams(int competitionId, [FromQuery] string? status = null)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var query = _context.CompetitionRegistrations
                .Where(cr => cr.CompetitionId == competitionId)
                .Include(cr => cr.Team)
                    .ThenInclude(t => t.Clan)
                .Include(cr => cr.Team)
                    .ThenInclude(t => t.Members)
                        .ThenInclude(m => m.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(cr => cr.Status == status);

            var registrations = await query
                .OrderByDescending(cr => cr.RegisteredAt)
                .Select(cr => new TeamRegistrationDTO
                {
                    TeamId = cr.TeamId,
                    TeamName = cr.Team != null ? cr.Team.Name : "Unknown",
                    ClanId = cr.Team != null && cr.Team.Clan != null ? cr.Team.Clan.Id : 0,
                    ClanName = cr.Team != null && cr.Team.Clan != null ? cr.Team.Clan.Name : "Unknown",
                    LeaderId = cr.Team != null ? cr.Team.CreatedBy : 0,
                    LeaderName = cr.Team != null && cr.Team.CreatedByUser != null ? cr.Team.CreatedByUser.Username : "Unknown",
                    MemberCount = cr.Team != null ? cr.Team.Members.Count : 0,
                    Members = cr.Team != null ? cr.Team.Members.Select(m => new CompetitionTeamMemberDTO
                    {
                        UserId = m.UserId,
                        UserName = m.User != null ? m.User.Username : "Unknown",
                        Role = null
                    }).ToList() : new List<CompetitionTeamMemberDTO>(),
                    Status = cr.Status,
                    RegisteredAt = cr.RegisteredAt,
                    RejectionReason = null
                })
                .ToListAsync();

            if (string.IsNullOrWhiteSpace(status) || string.Equals(status, "Participated", StringComparison.OrdinalIgnoreCase))
            {
                var scoreUserIds = await _context.CompetitionScores
                    .Where(cs => cs.CompetitionId == competitionId)
                    .Select(cs => cs.UserId)
                    .Distinct()
                    .ToListAsync();

                if (scoreUserIds.Count > 0)
                {
                    var existingTeamIds = registrations
                        .Select(r => r.TeamId)
                        .ToHashSet();

                    var fallbackTeams = await _context.Teams
                        .Where(t => !existingTeamIds.Contains(t.Id) && t.Members.Any(m => scoreUserIds.Contains(m.UserId)))
                        .Include(t => t.Clan)
                        .Include(t => t.CreatedByUser)
                        .Include(t => t.Members)
                            .ThenInclude(m => m.User)
                        .ToListAsync();

                    var fallbackRegistrations = fallbackTeams
                        .Select(t => new TeamRegistrationDTO
                        {
                            TeamId = t.Id,
                            TeamName = t.Name,
                            ClanId = t.ClanId,
                            ClanName = t.Clan?.Name ?? "Unknown",
                            LeaderId = t.CreatedBy,
                            LeaderName = t.CreatedByUser?.Username ?? "Unknown",
                            MemberCount = t.Members.Count,
                            Members = t.Members.Select(m => new CompetitionTeamMemberDTO
                            {
                                UserId = m.UserId,
                                UserName = m.User?.Username ?? "Unknown",
                                Role = null
                            }).ToList(),
                            Status = "Participated",
                            RegisteredAt = DateTime.UtcNow,
                            RejectionReason = null
                        })
                        .ToList();

                    registrations.AddRange(fallbackRegistrations);
                }
            }

            var allTeamIds = registrations.Select(r => r.TeamId).Distinct().ToList();
            if (allTeamIds.Count > 0)
            {
                var teamMembers = await _context.TeamMembers
                    .Where(tm => allTeamIds.Contains(tm.TeamId))
                    .Select(tm => new { tm.TeamId, tm.UserId })
                    .ToListAsync();

                var scoreRows = await _context.CompetitionScores
                    .Where(cs => cs.CompetitionId == competitionId)
                    .Select(cs => new { cs.UserId, cs.Score })
                    .ToListAsync();

                var scoreMap = scoreRows
                    .GroupBy(s => s.UserId)
                    .ToDictionary(g => g.Key, g => g.Sum(x => x.Score));

                var teamScoreMap = teamMembers
                    .GroupBy(tm => tm.TeamId)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Sum(tm => scoreMap.TryGetValue(tm.UserId, out var userScore) ? userScore : 0)
                    );

                foreach (var registration in registrations)
                {
                    var totalScore = teamScoreMap.TryGetValue(registration.TeamId, out var teamScore)
                        ? teamScore
                        : 0;

                    registration.TotalScore = totalScore;
                    registration.HasParticipated = totalScore > 0;

                    if (registration.Status == "Approved" && registration.HasParticipated)
                        registration.Status = "Participated";
                }
            }

            return Ok(new { success = true, data = registrations });
        }

        [HttpPut("{competitionId:int}/teams/{teamId:int}/approval")]
        public async Task<IActionResult> ApproveRejectTeam(int competitionId, int teamId, [FromBody] TeamApprovalDTO dto)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var registration = await _context.CompetitionRegistrations
                .FirstOrDefaultAsync(cr => cr.CompetitionId == competitionId && cr.TeamId == teamId);

            if (registration == null)
                return NotFound(new { success = false, message = "Team registration not found" });

            registration.Status = dto.Action;

            if (dto.Action == "Approved")
            {
                var team = await _context.Teams
                    .Include(t => t.Members)
                    .FirstOrDefaultAsync(t => t.Id == teamId);

                if (team != null)
                {
                    var memberIds = team.Members.Select(m => m.UserId).Distinct().ToList();
                    var existingUserIds = await _context.CompetitionParticipants
                        .Where(p => p.CompetitionId == competitionId && memberIds.Contains(p.UserId))
                        .Select(p => p.UserId)
                        .ToListAsync();

                    var missing = memberIds.Where(id => !existingUserIds.Contains(id)).ToList();
                    if (missing.Count > 0)
                    {
                        var participantsToAdd = missing.Select(userId => new CompetitionParticipant
                        {
                            CompetitionId = competitionId,
                            UserId = userId,
                            TeamId = team.Id,
                            TeamName = team.Name,
                            Status = "Registered",
                            JoinedAt = DateTime.UtcNow
                        }).ToList();

                        _context.CompetitionParticipants.AddRange(participantsToAdd);
                    }

                    var competition = await _context.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId);
                    if (competition != null)
                    {
                        var totalDistinctParticipants = await _context.CompetitionParticipants
                            .Where(p => p.CompetitionId == competitionId)
                            .Select(p => p.UserId)
                            .Distinct()
                            .CountAsync();

                        competition.ParticipantCount = totalDistinctParticipants + missing.Count;
                        competition.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
            else if (dto.Action == "Rejected")
            {
                var teamMemberUserIds = await _context.TeamMembers
                    .Where(tm => tm.TeamId == teamId)
                    .Select(tm => tm.UserId)
                    .ToListAsync();

                if (teamMemberUserIds.Count > 0)
                {
                    var teamParticipants = await _context.CompetitionParticipants
                        .Where(p => p.CompetitionId == competitionId && p.TeamId == teamId && teamMemberUserIds.Contains(p.UserId))
                        .ToListAsync();

                    if (teamParticipants.Count > 0)
                        _context.CompetitionParticipants.RemoveRange(teamParticipants);

                    var competition = await _context.Competitions.FirstOrDefaultAsync(c => c.Id == competitionId);
                    if (competition != null)
                    {
                        var totalDistinctParticipants = await _context.CompetitionParticipants
                            .Where(p => p.CompetitionId == competitionId)
                            .Select(p => p.UserId)
                            .Distinct()
                            .CountAsync();

                        competition.ParticipantCount = Math.Max(0, totalDistinctParticipants - teamParticipants.Count);
                        competition.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = $"Team {dto.Action.ToLower()} successfully" });
        }

        [HttpPost("{competitionId:int}/teams/bulk-approval")]
        public async Task<IActionResult> BulkApproveRejectTeams(int competitionId, [FromBody] BulkTeamApprovalDTO dto)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var registrations = await _context.CompetitionRegistrations
                .Where(cr => cr.CompetitionId == competitionId && dto.TeamIds.Contains(cr.TeamId))
                .ToListAsync();

            foreach (var reg in registrations)
            {
                reg.Status = dto.Action;
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = $"{registrations.Count} teams {dto.Action.ToLower()} successfully" });
        }

        // ===== SUBMISSION MONITORING =====

        [HttpGet("{competitionId:int}/submissions")]
        public async Task<IActionResult> GetSubmissions(int competitionId, [FromQuery] bool includeAnswers = false)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var competition = await _context.Competitions
                .Include(c => c.Questions)
                .FirstOrDefaultAsync(c => c.Id == competitionId);

            if (competition == null)
                return NotFound(new { success = false, message = "Competition not found" });

            var registrations = await _context.CompetitionRegistrations
                .Where(cr => cr.CompetitionId == competitionId)
                .Include(cr => cr.Team)
                    .ThenInclude(t => t.Clan)
                .ToListAsync();

            // Get user scores for the competition
            var userScores = await _context.CompetitionScores
                .Where(cs => cs.CompetitionId == competitionId)
                .Include(cs => cs.User)
                .ToListAsync();

            var scoreUserIds = userScores
                .Select(s => s.UserId)
                .Distinct()
                .ToList();

            if (scoreUserIds.Any())
            {
                var existingTeamIds = registrations
                    .Select(r => r.TeamId)
                    .ToHashSet();

                var fallbackTeams = await _context.Teams
                    .Where(t => !existingTeamIds.Contains(t.Id) && t.Members.Any(m => scoreUserIds.Contains(m.UserId)))
                    .Include(t => t.Clan)
                    .ToListAsync();

                var fallbackRegistrations = fallbackTeams.Select(t => new CompetitionRegistration
                {
                    CompetitionId = competitionId,
                    TeamId = t.Id,
                    Team = t,
                    Status = "Participated",
                    RegisteredAt = DateTime.UtcNow
                }).ToList();

                registrations.AddRange(fallbackRegistrations);
            }

            // Map to team submissions based on team members
            var submissions = new List<TeamSubmissionDTO>();

            foreach (var reg in registrations)
            {
                if (reg.Team == null) continue;

                var teamMemberIds = await _context.TeamMembers
                    .Where(tm => tm.TeamId == reg.TeamId)
                    .Select(tm => tm.UserId)
                    .ToListAsync();

                var teamUserScores = userScores.Where(s => teamMemberIds.Contains(s.UserId)).ToList();
                var hasSubmitted = teamUserScores.Any();
                var totalScore = teamUserScores.Sum(s => s.Score);

                submissions.Add(new TeamSubmissionDTO
                {
                    TeamId = reg.TeamId,
                    TeamName = reg.Team.Name,
                    ClanId = reg.Team.ClanId,
                    ClanName = reg.Team.Clan?.Name ?? "Unknown",
                    HasSubmitted = hasSubmitted,
                    SubmittedAt = teamUserScores.FirstOrDefault()?.SubmittedAt,
                    TotalScore = totalScore,
                    CorrectAnswers = 0, // Not tracked per question in current model
                    TotalQuestions = competition.Questions.Count,
                    TimeTakenSeconds = hasSubmitted ? (int)(teamUserScores.Max(s => s.SubmittedAt) - competition.StartDate).TotalSeconds : 0,
                    Answers = null // Not supported in current model
                });
            }

            var result = submissions.OrderByDescending(s => s.HasSubmitted).ThenByDescending(s => s.TotalScore).ToList();
            return Ok(new { success = true, data = result });
        }

        // ===== ANALYTICS =====

        [HttpGet("{competitionId:int}/analytics")]
        public async Task<IActionResult> GetAnalytics(int competitionId)
        {
            var userId = GetUserId();
            if (userId == 0 || !await IsAdmin(userId))
                return Unauthorized(new { success = false, message = "Admin access required" });

            var competition = await _context.Competitions
                .Include(c => c.Questions)
                .FirstOrDefaultAsync(c => c.Id == competitionId);

            if (competition == null)
                return NotFound(new { success = false, message = "Competition not found" });

            var registrations = await _context.CompetitionRegistrations
                .Where(cr => cr.CompetitionId == competitionId)
                .CountAsync();

            var scores = await _context.CompetitionScores
                .Where(cs => cs.CompetitionId == competitionId)
                .Include(cs => cs.User)
                .ToListAsync();

            var submittedUsers = scores.Count;
            var avgScore = submittedUsers > 0 ? (decimal)scores.Average(s => s.Score) : 0;
            var highestScore = submittedUsers > 0 ? scores.Max(s => s.Score) : 0;
            var lowestScore = submittedUsers > 0 ? scores.Min(s => s.Score) : 0;

            // Top participants (individual users)
            var topTeams = scores
                .OrderByDescending(s => s.Score)
                .Take(10)
                .Select((s, index) => new TopTeamDTO
                {
                    Rank = index + 1,
                    TeamId = s.UserId,
                    TeamName = s.User?.Username ?? "Unknown",
                    ClanName = "-",
                    Score = s.Score,
                    TimeTakenSeconds = (int)(s.SubmittedAt - competition.StartDate).TotalSeconds
                })
                .ToList();

            var analytics = new CompetitionAnalyticsDTO
            {
                CompetitionId = competitionId,
                CompetitionTitle = competition.Title,
                TotalRegisteredTeams = registrations,
                TotalSubmissions = submittedUsers,
                SubmissionRate = registrations > 0 ? (decimal)submittedUsers / registrations * 100 : 0,
                AverageScore = Math.Round(avgScore, 2),
                HighestScore = highestScore,
                LowestScore = lowestScore,
                QuestionStats = new List<QuestionAnalyticsDTO>(), // Not supported in current model
                TopTeams = topTeams
            };

            return Ok(new { success = true, data = analytics });
        }

        // ===== EXISTING ENDPOINTS =====

        [HttpGet("clans/ranking")]
        public async Task<IActionResult> GetClanRanking()
        {
            var result = await _orchestrationService.GetClanRanking();
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        [HttpPost("{competitionId:int}/suggest-teams")]
        public async Task<IActionResult> SuggestTeams(int competitionId, [FromBody] GenerateTeamSuggestionsDTO? policy)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _orchestrationService.GenerateTeamSuggestions(competitionId, userId, policy);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = result.Message, suggestions = result.Data });
        }

        [HttpGet("{competitionId:int}/team-suggestions")]
        public async Task<IActionResult> GetTeamSuggestions(int competitionId)
        {
            var result = await _orchestrationService.GetTeamSuggestionSummary(competitionId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        [HttpPost("{competitionId:int}/override-teams")]
        public async Task<IActionResult> OverrideTeams(int competitionId, [FromBody] ApplyTeamSuggestionOverrideDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _orchestrationService.ApplyTeamSuggestionOverride(competitionId, userId, dto);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = result.Message, data = result.Data });
        }

        [HttpGet("{competitionId:int}/teams/overview")]
        public async Task<IActionResult> GetTeamOverview(int competitionId)
        {
            var result = await _orchestrationService.GetCompetitionTeamOverview(competitionId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        [HttpGet("{competitionId:int}/members/activity")]
        public async Task<IActionResult> GetMemberActivity(int competitionId)
        {
            var result = await _orchestrationService.GetClanMemberActivity(competitionId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        [HttpGet("{competitionId:int}/dashboard")]
        public async Task<IActionResult> GetCompetitionDashboard(int competitionId)
        {
            var result = await _orchestrationService.GetCompetitionDashboard(competitionId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        [HttpPost("{competitionId:int}/finalize")]
        public async Task<IActionResult> FinalizeCompetition(int competitionId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _scoringService.FinalizeCompetitionAndUpdateLeaderboard(competitionId, userId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, message = result.Message, data = result.Data });
        }

        [HttpGet("{competitionId:int}/leaderboard/teams")]
        public async Task<IActionResult> GetTeamLeaderboard(int competitionId)
        {
            var result = await _scoringService.GetTeamLeaderboard(competitionId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        [HttpGet("{competitionId:int}/leaderboard/clans")]
        public async Task<IActionResult> GetClanLeaderboard(int competitionId)
        {
            var result = await _scoringService.GetClanLeaderboard(competitionId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, data = result.Data });
        }

        [HttpGet("seasons/{season:int}/ranking")]
        public async Task<IActionResult> GetSeasonRanking(int season)
        {
            var result = await _scoringService.GetSeasonalClanRanking(season);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new { success = true, season, data = result.Data });
        }

        private static string ResolveCompetitionPeriod(string? competitionRules, DateTime startDate, DateTime endDate)
        {
            if (!string.IsNullOrWhiteSpace(competitionRules))
            {
                try
                {
                    using var doc = JsonDocument.Parse(competitionRules);
                    if (doc.RootElement.TryGetProperty("competitionPeriod", out var periodEl))
                    {
                        var period = periodEl.GetString();
                        if (!string.IsNullOrWhiteSpace(period))
                            return period;
                    }
                }
                catch
                {
                }
            }

            var durationDays = (endDate - startDate).TotalDays;
            if (durationDays <= 8) return "Weekly";
            if (durationDays <= 35) return "Monthly";
            return "Seasonal";
        }

        private static int ResolveMaxTeamsPerClan(string? competitionRules)
        {
            if (!string.IsNullOrWhiteSpace(competitionRules))
            {
                try
                {
                    using var doc = JsonDocument.Parse(competitionRules);
                    if (doc.RootElement.TryGetProperty("maxTeamsPerClan", out var maxEl) && maxEl.TryGetInt32(out var value) && value > 0)
                        return value;
                }
                catch
                {
                }
            }

            return 2;
        }
    }
}
