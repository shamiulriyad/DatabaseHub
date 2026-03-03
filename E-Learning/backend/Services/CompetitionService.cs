using backend.Data;
using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using System.Text.Json;

namespace backend.Services
{
    public class CompetitionService : ICompetitionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHostEnvironment _env;

        public CompetitionService(ApplicationDbContext context, IHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        /// <summary>
        /// Check if a user is a clan leader or co-leader for a given clan.
        /// Returns true if they have Leader or CoLeader role in ClanMembers table.
        /// </summary>
        private async Task<bool> IsUserClanLeader(int userId, int clanId)
        {
            var clanMember = await _context.Set<Models.ClanMember>()
                .FirstOrDefaultAsync(cm => cm.UserId == userId && cm.ClanId == clanId);

            return clanMember != null && (clanMember.Role == "Leader" || clanMember.Role == "CoLeader");
        }

        /// <summary>
        /// Get eligible member IDs from clans based on point range criteria
        /// </summary>
        private async Task<List<int>> GetClanMembersWithPointRange(List<int> clanIds, int? minPoints, int? maxPoints)
        {
            var memberIds = new List<int>();

            if (clanIds == null || !clanIds.Any())
                return memberIds;

            // Get all clan members from specified clans
            var clanMembers = await _context.Set<Models.ClanMember>()
                .Where(cm => clanIds.Contains(cm.ClanId))
                .Include(cm => cm.User)
                .ToListAsync();

            // Filter by point range if specified
            foreach (var member in clanMembers)
            {
                if (member.User == null) continue;

                var userPoints = member.User.TotalPoints;
                
                // Check if user points fall within the specified range
                if (minPoints.HasValue && userPoints < minPoints.Value)
                    continue;
                
                if (maxPoints.HasValue && userPoints > maxPoints.Value)
                    continue;

                memberIds.Add(member.UserId);
            }

            return memberIds.Distinct().ToList();
        }

        /// <summary>
        /// Determine creator role based on user flags and database state.
        /// </summary>
        private async Task<(string role, bool autoApprove)> DetermineCreatorRole(int userId, User user, int? clanId)
        {
            // Admin or Teacher: always auto-approve
            if (user.IsAdmin || user.IsTeacher)
                return (user.IsAdmin ? "Admin" : "Teacher", true);

            // ClanLeader: check ClanMembers table; if eligible, auto-approve
            if (clanId.HasValue && clanId > 0)
            {
                if (await IsUserClanLeader(userId, clanId.Value))
                    return ("ClanLeader", true);
            }

            // Student: requires approval
            return ("Student", false);
        }

        
        private string CalculateStatus(DateTime startDate, DateTime endDate, bool isApproved)
        {
            // If not approved, always return pending approval
            if (!isApproved)
                return "PendingApproval";

            var now = DateTime.UtcNow;
            if (now < startDate)
                return "Upcoming";

            if (now < endDate)
                return "Ongoing";

            return "Completed";
        }

        /// <summary>
        /// Create a new competition with approval workflow
        /// </summary>
        public async Task<ServiceResult<CompetitionDTO>> CreateCompetition(CreateCompetitionDTO dto, int userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Title))
                    return ServiceResult<CompetitionDTO>.FailureResult("Title is required");

                if (dto.EndDate <= dto.StartDate)
                    return ServiceResult<CompetitionDTO>.FailureResult("End date must be after start date");

                // Ensure dates are in UTC
                var startDateUtc = dto.StartDate.Kind == DateTimeKind.Utc ? dto.StartDate : dto.StartDate.ToUniversalTime();
                var endDateUtc = dto.EndDate.Kind == DateTimeKind.Utc ? dto.EndDate : dto.EndDate.ToUniversalTime();

                // Validate questions
                if (dto.Questions == null || dto.Questions.Count == 0)
                    return ServiceResult<CompetitionDTO>.FailureResult("At least one question is required");

                foreach (var q in dto.Questions)
                {
                    if (string.IsNullOrWhiteSpace(q.QuestionText))
                        return ServiceResult<CompetitionDTO>.FailureResult("Question text is required");
                    if (string.IsNullOrWhiteSpace(q.OptionA) || string.IsNullOrWhiteSpace(q.OptionB) || 
                        string.IsNullOrWhiteSpace(q.OptionC) || string.IsNullOrWhiteSpace(q.OptionD))
                        return ServiceResult<CompetitionDTO>.FailureResult("All four options (A, B, C, D) are required");
                    if (string.IsNullOrWhiteSpace(q.CorrectAnswer) || 
                        !new[] { "A", "B", "C", "D" }.Contains(q.CorrectAnswer.ToUpper()))
                        return ServiceResult<CompetitionDTO>.FailureResult("Correct answer must be A, B, C, or D");
                }

                var type = (dto.CompetitionType ?? "Quiz").Trim();
                var isPublic = dto.IsPublic;
                
                // Handle allowed members - combine manual selection and clan-based selection
                List<int> finalAllowedMemberIds = new List<int>();
                
                if (!isPublic)
                {
                    // Add manually selected members
                    if (dto.AllowedMemberIds != null && dto.AllowedMemberIds.Any())
                    {
                        finalAllowedMemberIds.AddRange(dto.AllowedMemberIds);
                    }

                    // Add clan members based on point range
                    if (dto.AllowedClanIds != null && dto.AllowedClanIds.Any())
                    {
                        var clanMemberIds = await GetClanMembersWithPointRange(
                            dto.AllowedClanIds, 
                            dto.PointRangeMin, 
                            dto.PointRangeMax
                        );
                        finalAllowedMemberIds.AddRange(clanMemberIds);
                    }

                    // Remove duplicates
                    finalAllowedMemberIds = finalAllowedMemberIds.Distinct().ToList();
                }

                var allowedMembersCsv = !isPublic && finalAllowedMemberIds.Any()
                    ? string.Join(',', finalAllowedMemberIds)
                    : null;

                var allowedClansCsv = !isPublic && dto.AllowedClanIds != null && dto.AllowedClanIds.Any()
                    ? string.Join(',', dto.AllowedClanIds.Distinct())
                    : null;

                // Get user to check role
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return ServiceResult<CompetitionDTO>.FailureResult("User not found");

                // Determine creator role and auto-approval
                var (creatorRole, autoApprove) = await DetermineCreatorRole(userId, user, dto.ClanId ?? null);

                // If student creating for a clan but not a leader, still require approval
                if (creatorRole == "Student" && dto.ClanId.HasValue)
                {
                    var isLeader = await IsUserClanLeader(userId, dto.ClanId.Value);
                    if (isLeader)
                        creatorRole = "ClanLeader";
                }

                var competition = new Models.Competition
                {
                    CreatorId = userId,
                    CreatorRole = creatorRole,
                    Title = dto.Title,
                    Description = dto.Description ?? "",
                    CompetitionType = type,
                    StartDate = startDateUtc,
                    EndDate = endDateUtc,
                    ClanId = dto.ClanId,
                    TotalQuestions = dto.Questions.Count,
                    IsApproved = autoApprove,
                    Status = CalculateStatus(startDateUtc, endDateUtc, autoApprove),
                    ParticipantCount = 0,
                    CreatedAt = DateTime.UtcNow,
                    IsPublic = isPublic,
                    AllowedMemberIds = allowedMembersCsv,
                    AllowedClanIds = allowedClansCsv,
                    PointRangeMin = dto.PointRangeMin,
                    PointRangeMax = dto.PointRangeMax
                };

                _context.Competitions.Add(competition);
                await _context.SaveChangesAsync();

                // Create questions
                var questions = dto.Questions.Select((q, index) => new Models.CompetitionQuestion
                {
                    CompetitionId = competition.Id,
                    QuestionText = q.QuestionText,
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD,
                    CorrectAnswer = q.CorrectAnswer.ToUpper(),
                    Points = q.Points > 0 ? q.Points : 1,
                    Order = q.Order > 0 ? q.Order : index + 1,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.CompetitionQuestions.AddRange(questions);
                await _context.SaveChangesAsync();

                // Reload competition with questions for proper DTO mapping
                var savedCompetition = await _context.Competitions
                    .Include(c => c.Questions)
                    .FirstOrDefaultAsync(c => c.Id == competition.Id);

                var message = autoApprove ? "Competition created successfully" : "Competition submitted for approval";
                return ServiceResult<CompetitionDTO>.SuccessResult(MapToCompetitionDTO(savedCompetition ?? competition), message);
            }
            catch (Exception ex)
            {
                var errorMessage = $"Failed to create competition: {ex.Message}";
                if (ex.InnerException != null)
                {
                    errorMessage += $" Inner: {ex.InnerException.Message}";
                }
                return ServiceResult<CompetitionDTO>.FailureResult(errorMessage);
            }
        }

        /// <summary>
        /// Get competition by ID
        /// </summary>
        public async Task<ServiceResult<CompetitionDTO>> GetCompetitionById(int competitionId)
        {
            try
            {
                var competition = await _context.Competitions
                    .Include(c => c.Participants)
                    .Include(c => c.Scores)
                    .Include(c => c.Questions)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<CompetitionDTO>.FailureResult("Competition not found");

                return ServiceResult<CompetitionDTO>.SuccessResult(MapToCompetitionDTO(competition));
            }
            catch (Exception ex)
            {
                return ServiceResult<CompetitionDTO>.FailureResult($"Failed to get competition: {ex.Message}");
            }
        }

        /// <summary>
        /// Get competition questions for participants
        /// </summary>
        public async Task<ServiceResult<List<CompetitionQuestionDTO>>> GetCompetitionQuestions(int competitionId)
        {
            try
            {
                var competition = await _context.Competitions
                    .Include(c => c.Questions)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<List<CompetitionQuestionDTO>>.FailureResult("Competition not found");

                var questions = competition.Questions
                    .OrderBy(q => q.Order)
                    .Select(q => new CompetitionQuestionDTO
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
                        Order = q.Order,
                        CreatedAt = q.CreatedAt
                    })
                    .ToList();

                return ServiceResult<List<CompetitionQuestionDTO>>.SuccessResult(questions);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CompetitionQuestionDTO>>.FailureResult($"Failed to get competition questions: {ex.Message}");
            }
        }

        /// <summary>
        /// ADMIN ENDPOINT: Get questions for competition creators/admins (anytime access)
        /// Codeforces-style: Admins can see questions before contest starts
        /// </summary>
        public async Task<ServiceResult<List<CompetitionQuestionDTO>>> GetAdminQuestions(int competitionId, int userId)
        {
            try
            {
                var competition = await _context.Competitions
                    .Include(c => c.Questions)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<List<CompetitionQuestionDTO>>.FailureResult("Competition not found");

                // Only creator or admin can access
                var user = await _context.Users.FindAsync(userId);
                if (competition.CreatorId != userId && (user == null || !user.IsAdmin))
                    return ServiceResult<List<CompetitionQuestionDTO>>.FailureResult("Unauthorized: Only creators and admins can access questions");

                var questions = competition.Questions
                    .OrderBy(q => q.Order)
                    .Select(q => new CompetitionQuestionDTO
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
                        Order = q.Order,
                        CreatedAt = q.CreatedAt
                    })
                    .ToList();

                return ServiceResult<List<CompetitionQuestionDTO>>.SuccessResult(questions, "Admin questions retrieved");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CompetitionQuestionDTO>>.FailureResult($"Failed to get admin questions: {ex.Message}");
            }
        }

        /// <summary>
        /// PARTICIPANT ENDPOINT: Get questions for registered participants (ONLY during Ongoing status)
        /// Codeforces-style: Questions only visible when contest is running
        /// </summary>
        public async Task<ServiceResult<List<CompetitionQuestionDTO>>> GetParticipantQuestions(int competitionId, int userId)
        {
            try
            {
                var competition = await _context.Competitions
                    .Include(c => c.Questions)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<List<CompetitionQuestionDTO>>.FailureResult("Competition not found");

                // Check status: MUST be Ongoing
                var currentStatus = CalculateStatus(competition.StartDate, competition.EndDate, competition.IsApproved);
                
                if (currentStatus != "Ongoing")
                {
                    var now = DateTime.UtcNow;
                    var message = $"Questions are only visible during contest. " +
                                $"Current status: {currentStatus}. " +
                                $"Current time (UTC): {now:yyyy-MM-dd HH:mm:ss}. " +
                                $"Contest starts: {competition.StartDate:yyyy-MM-dd HH:mm:ss} UTC. " +
                                $"Contest ends: {competition.EndDate:yyyy-MM-dd HH:mm:ss} UTC.";
                    
                    if (currentStatus == "Upcoming")
                    {
                        var timeUntilStart = competition.StartDate - now;
                        message += $" Contest starts in {timeUntilStart.TotalMinutes:F0} minutes.";
                    }
                    
                    return ServiceResult<List<CompetitionQuestionDTO>>.FailureResult(message);
                }

                // Check if user is a registered participant (or approved team member for team-based contests)
                var participant = await EnsureParticipantAccessAsync(competition, userId);
                if (participant == null)
                    return ServiceResult<List<CompetitionQuestionDTO>>.FailureResult("You must be a registered participant to view questions");

                var questions = competition.Questions
                    .OrderBy(q => q.Order)
                    .Select(q => new CompetitionQuestionDTO
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
                        Order = q.Order,
                        CreatedAt = q.CreatedAt
                    })
                    .ToList();

                return ServiceResult<List<CompetitionQuestionDTO>>.SuccessResult(questions, "Participant questions retrieved");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CompetitionQuestionDTO>>.FailureResult($"Failed to get participant questions: {ex.Message}");
            }
        }

        /// <summary>
        /// Submit participant answers for a competition (bulk submit).
        /// Calculates score, updates CompetitionScore and participant Score/Status.
        /// </summary>
        public async Task<ServiceResult<CompetitionResultWithFeedbackDTO>> SubmitCompetitionAnswers(int competitionId, int userId, SubmitCompetitionAnswersDTO dto)
        {
            try
            {
                var competition = await _context.Competitions
                    .Include(c => c.Questions)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<CompetitionResultWithFeedbackDTO>.FailureResult("Competition not found");

                // Only allow during Ongoing
                var currentStatus = CalculateStatus(competition.StartDate, competition.EndDate, competition.IsApproved);
                if (currentStatus != "Ongoing")
                    return ServiceResult<CompetitionResultWithFeedbackDTO>.FailureResult("Competition is not accepting answers at this time");

                // Participant must be registered
                var participant = await EnsureParticipantAccessAsync(competition, userId);

                if (participant == null)
                    return ServiceResult<CompetitionResultWithFeedbackDTO>.FailureResult("You are not a registered participant");

                if (dto == null || dto.Answers == null || dto.Answers.Count == 0)
                    return ServiceResult<CompetitionResultWithFeedbackDTO>.FailureResult("No answers submitted");

                // Evaluate answers and build per-question feedback
                int totalScore = 0;
                int correct = 0;
                int wrong = 0;
                var feedbacks = new List<DTOs.CompetitionQuestionFeedbackDTO>();

                foreach (var a in dto.Answers)
                {
                    var q = competition.Questions.FirstOrDefault(x => x.Id == a.QuestionId);
                    if (q == null) continue; // ignore unknown question id

                    var submitted = (a.Answer ?? string.Empty).Trim().ToUpper();
                    var correctAns = (q.CorrectAnswer ?? string.Empty).Trim().ToUpper();

                    var isCorrect = submitted == correctAns;
                    var pointsAwarded = isCorrect ? q.Points : 0;

                    if (isCorrect)
                    {
                        totalScore += q.Points;
                        correct++;
                    }
                    else
                    {
                        wrong++;
                    }

                    feedbacks.Add(new DTOs.CompetitionQuestionFeedbackDTO
                    {
                        QuestionId = q.Id,
                        SubmittedAnswer = submitted,
                        CorrectAnswer = correctAns,
                        IsCorrect = isCorrect,
                        PointsAwarded = pointsAwarded
                    });
                }

                // Update or create CompetitionScore
                var score = await _context.CompetitionScores
                    .FirstOrDefaultAsync(s => s.CompetitionId == competitionId && s.UserId == userId);

                if (score == null)
                {
                    score = new Models.CompetitionScore
                    {
                        CompetitionId = competitionId,
                        UserId = userId,
                        Score = totalScore,
                        Rank = 0,
                        SubmittedAt = DateTime.UtcNow
                    };
                    _context.CompetitionScores.Add(score);
                }
                else
                {
                    score.Score = totalScore;
                    score.SubmittedAt = DateTime.UtcNow;
                }

                // Update participant
                participant.Score = totalScore;
                participant.Status = "Completed";
                participant.CompletedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var resultDto = new CompetitionResultWithFeedbackDTO
                {
                    CompetitionId = competitionId,
                    ParticipantId = participant.Id,
                    FinalScore = totalScore,
                    FinalRank = score.Rank,
                    Result = "Submitted",
                    SubmittedAt = score.SubmittedAt
                };

                // attach feedback
                resultDto.QuestionResults = feedbacks;

                return ServiceResult<CompetitionResultWithFeedbackDTO>.SuccessResult(resultDto, "Answers submitted successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<CompetitionResultWithFeedbackDTO>.FailureResult($"Failed to submit answers: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all APPROVED competitions with pagination (public listing)
        /// </summary>
        public async Task<ServiceResult<List<CompetitionDTO>>> GetAllCompetitions(int page, int pageSize)
        {
            try
            {
                var competitions = await _context.Competitions
                    .Where(c => c.IsApproved)  // Only approved competitions
                    .AsNoTracking()
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var dtos = competitions.Select(MapToCompetitionDTO).ToList();
                return ServiceResult<List<CompetitionDTO>>.SuccessResult(dtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CompetitionDTO>>.FailureResult($"Failed to get competitions: {ex.Message}");
            }
        }

        /// <summary>
        /// Get pending (unapproved) competitions for admin review
        /// </summary>
        public async Task<ServiceResult<List<PendingCompetitionDTO>>> GetPendingCompetitions(int page, int pageSize)
        {
            try
            {
                var pending = await _context.Competitions
                    .Where(c => !c.IsApproved && c.CreatorRole == "Student")  // Only student submissions
                    .AsNoTracking()
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new PendingCompetitionDTO
                    {
                        Id = c.Id,
                        Title = c.Title,
                        Description = c.Description,
                        CompetitionType = c.CompetitionType,
                        CreatorId = c.CreatorId,
                        CreatorRole = c.CreatorRole,
                        CreatedAt = c.CreatedAt,
                        StartDate = c.StartDate,
                        EndDate = c.EndDate,
                        ClanId = c.ClanId
                    })
                    .ToListAsync();

                return ServiceResult<List<PendingCompetitionDTO>>.SuccessResult(pending);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<PendingCompetitionDTO>>.FailureResult($"Failed to get pending competitions: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all competitions (pending, approved, rejected) for admin management
        /// </summary>
        public async Task<ServiceResult<List<CompetitionDTO>>> GetAllCompetitionsForAdmin(int page, int pageSize)
        {
            try
            {
                var competitions = await _context.Competitions
                    .AsNoTracking()
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var dtos = competitions.Select(MapToCompetitionDTO).ToList();
                return ServiceResult<List<CompetitionDTO>>.SuccessResult(dtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CompetitionDTO>>.FailureResult($"Failed to get all competitions: {ex.Message}");
            }
        }

        /// <summary>
        /// Approve a pending competition (admin only)
        /// </summary>
        public async Task<ServiceResult<CompetitionDTO>> ApproveCompetition(int competitionId, int adminId)
        {
            try
            {
                var competition = await _context.Competitions.FindAsync(competitionId);
                if (competition == null)
                    return ServiceResult<CompetitionDTO>.FailureResult("Competition not found");

                if (competition.IsApproved)
                    return ServiceResult<CompetitionDTO>.FailureResult("Competition is already approved");

                competition.IsApproved = true;
                competition.ApprovedBy = adminId;
                competition.ApprovedAt = DateTime.UtcNow;
                competition.Status = CalculateStatus(competition.StartDate, competition.EndDate, true);

                await _context.SaveChangesAsync();

                return ServiceResult<CompetitionDTO>.SuccessResult(MapToCompetitionDTO(competition), "Competition approved successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<CompetitionDTO>.FailureResult($"Failed to approve competition: {ex.Message}");
            }
        }

        /// <summary>
        /// Reject a pending competition (admin only)
        /// </summary>
        public async Task<ServiceResult<bool>> RejectCompetition(int competitionId, int adminId)
        {
            try
            {
                var competition = await _context.Competitions.FindAsync(competitionId);
                if (competition == null)
                    return ServiceResult<bool>.FailureResult("Competition not found");

                if (competition.IsTeamBased)
                    return ServiceResult<bool>.FailureResult("This is a clan team-based competition. Register your team instead of joining individually.");

                if (competition.IsApproved)
                    return ServiceResult<bool>.FailureResult("Cannot reject an already-approved competition");

                _context.Competitions.Remove(competition);
                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true, "Competition rejected and removed");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to reject competition: {ex.Message}");
            }
        }

        /// <summary>
        /// Update competition details
        /// </summary>
        public async Task<ServiceResult<CompetitionDTO>> UpdateCompetition(int competitionId, UpdateCompetitionDTO dto)
        {
            try
            {
                var competition = await _context.Competitions.FindAsync(competitionId);
                if (competition == null)
                    return ServiceResult<CompetitionDTO>.FailureResult("Competition not found");

                // Validate dates if provided
                if (dto.StartDate.HasValue && dto.EndDate.HasValue)
                {
                    if (dto.EndDate <= dto.StartDate)
                        return ServiceResult<CompetitionDTO>.FailureResult("End date must be after start date");
                }

                // Update fields
                if (!string.IsNullOrWhiteSpace(dto.Title))
                    competition.Title = dto.Title;

                if (!string.IsNullOrWhiteSpace(dto.Description))
                    competition.Description = dto.Description;

                if (dto.StartDate.HasValue)
                    competition.StartDate = dto.StartDate.Value;

                if (dto.EndDate.HasValue)
                    competition.EndDate = dto.EndDate.Value;

                if (dto.IsPublic.HasValue)
                    competition.IsPublic = dto.IsPublic.Value;

                // Handle allowed members - combine manual selection and clan-based selection
                if (dto.AllowedMemberIds != null || dto.AllowedClanIds != null || 
                    dto.PointRangeMin.HasValue || dto.PointRangeMax.HasValue)
                {
                    List<int> finalAllowedMemberIds = new List<int>();
                    
                    if (!competition.IsPublic)
                    {
                        // Add manually selected members
                        if (dto.AllowedMemberIds != null && dto.AllowedMemberIds.Any())
                        {
                            finalAllowedMemberIds.AddRange(dto.AllowedMemberIds);
                        }
                        else if (!string.IsNullOrWhiteSpace(competition.AllowedMemberIds))
                        {
                            // Keep existing members if not updating
                            var existing = competition.AllowedMemberIds
                                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                                .Select(id => int.TryParse(id, out var parsed) ? parsed : (int?)null)
                                .Where(id => id.HasValue)
                                .Select(id => id!.Value)
                                .ToList();
                            finalAllowedMemberIds.AddRange(existing);
                        }

                        // Add clan members based on point range
                        if (dto.AllowedClanIds != null && dto.AllowedClanIds.Any())
                        {
                            var clanMemberIds = await GetClanMembersWithPointRange(
                                dto.AllowedClanIds, 
                                dto.PointRangeMin ?? competition.PointRangeMin, 
                                dto.PointRangeMax ?? competition.PointRangeMax
                            );
                            finalAllowedMemberIds.AddRange(clanMemberIds);
                        }

                        // Remove duplicates
                        finalAllowedMemberIds = finalAllowedMemberIds.Distinct().ToList();
                    }

                    competition.AllowedMemberIds = competition.IsPublic || !finalAllowedMemberIds.Any()
                        ? null
                        : string.Join(',', finalAllowedMemberIds);
                }

                if (dto.AllowedClanIds != null)
                {
                    competition.AllowedClanIds = competition.IsPublic || dto.AllowedClanIds.Count == 0
                        ? null
                        : string.Join(',', dto.AllowedClanIds.Distinct());
                }

                if (dto.PointRangeMin.HasValue)
                    competition.PointRangeMin = dto.PointRangeMin.Value;

                if (dto.PointRangeMax.HasValue)
                    competition.PointRangeMax = dto.PointRangeMax.Value;

                competition.Status = CalculateStatus(competition.StartDate, competition.EndDate, competition.IsApproved);
                competition.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ServiceResult<CompetitionDTO>.SuccessResult(MapToCompetitionDTO(competition), "Competition updated successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<CompetitionDTO>.FailureResult($"Failed to update competition: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete a competition
        /// </summary>
        public async Task<ServiceResult<bool>> DeleteCompetition(int competitionId)
        {
            try
            {
                var competition = await _context.Competitions.FindAsync(competitionId);
                if (competition == null)
                    return ServiceResult<bool>.FailureResult("Competition not found");

                // Delete associated participants and scores first
                var participants = await _context.CompetitionParticipants
                    .Where(p => p.CompetitionId == competitionId)
                    .ToListAsync();

                var scores = await _context.CompetitionScores
                    .Where(s => s.CompetitionId == competitionId)
                    .ToListAsync();

                _context.CompetitionParticipants.RemoveRange(participants);
                _context.CompetitionScores.RemoveRange(scores);
                _context.Competitions.Remove(competition);

                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true, "Competition deleted successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to delete competition: {ex.Message}");
            }
        }

        /// <summary>
        /// User joins a competition
        /// </summary>
        public async Task<ServiceResult<bool>> JoinCompetition(int competitionId, int userId)
        {
            try
            {
                var competition = await _context.Competitions.FindAsync(competitionId);
                if (competition == null)
                    return ServiceResult<bool>.FailureResult("Competition not found");

                // CODEFORCES RULE: Creator and Admin cannot participate
                if (competition.CreatorId == userId)
                    return ServiceResult<bool>.FailureResult("Creators and admins cannot participate in their own competitions");

                // Check if user is admin (from User table)
                var user = await _context.Users.FindAsync(userId);
                if (user != null && user.IsAdmin)
                    return ServiceResult<bool>.FailureResult("Admins cannot participate in competitions");

                // Check if competition is approved (skip in Development for easier testing)
                if (!competition.IsApproved && !_env.IsDevelopment())
                    return ServiceResult<bool>.FailureResult("This competition is awaiting admin approval");

                // If private, ensure user is allowed (skip in Development for easier testing)
                if (!competition.IsPublic && !_env.IsDevelopment())
                {
                    var allowedIds = (competition.AllowedMemberIds ?? string.Empty)
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(id => int.TryParse(id, out var parsed) ? parsed : (int?)null)
                        .Where(id => id.HasValue)
                        .Select(id => id!.Value)
                        .ToHashSet();

                    if (!allowedIds.Contains(userId))
                        return ServiceResult<bool>.FailureResult("This competition is private. You are not on the allowed list.");
                }

                // Check if user is already a participant
                var existingParticipant = await _context.CompetitionParticipants
                    .FirstOrDefaultAsync(p => p.CompetitionId == competitionId && p.UserId == userId);

                if (existingParticipant != null)
                    return ServiceResult<bool>.FailureResult("You are already a participant in this competition");

                // Check capacity
                if (competition.ParticipantCount >= competition.MaxParticipants)
                    return ServiceResult<bool>.FailureResult("Competition is at full capacity");

                var currentStatus = CalculateStatus(competition.StartDate, competition.EndDate, competition.IsApproved);

                // Accept registrations only when upcoming or actively ongoing
                if (currentStatus != "Upcoming" && currentStatus != "Ongoing")
                    return ServiceResult<bool>.FailureResult("This competition is not accepting new participants");

                // Add participant
                var participant = new Models.CompetitionParticipant
                {
                    CompetitionId = competitionId,
                    UserId = userId,
                    Status = "Registered",
                    JoinedAt = DateTime.UtcNow
                };

                _context.CompetitionParticipants.Add(participant);
                competition.ParticipantCount++;

                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true, "Successfully joined competition");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to join competition: {ex.Message}");
            }
        }

        /// <summary>
        /// User leaves a competition
        /// </summary>
        public async Task<ServiceResult<bool>> LeaveCompetition(int competitionId, int userId)
        {
            try
            {
                var competition = await _context.Competitions.FindAsync(competitionId);
                if (competition == null)
                    return ServiceResult<bool>.FailureResult("Competition not found");

                var participant = await _context.CompetitionParticipants
                    .FirstOrDefaultAsync(p => p.CompetitionId == competitionId && p.UserId == userId);

                if (participant == null)
                    return ServiceResult<bool>.FailureResult("You are not a participant in this competition");

                // Only allow leaving before the competition starts
                var currentStatus = CalculateStatus(competition.StartDate, competition.EndDate, competition.IsApproved);
                if (currentStatus != "Upcoming")
                    return ServiceResult<bool>.FailureResult("Cannot leave a competition that has already started");

                _context.CompetitionParticipants.Remove(participant);
                competition.ParticipantCount = Math.Max(0, competition.ParticipantCount - 1);

                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true, "Successfully left competition");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to leave competition: {ex.Message}");
            }
        }

        /// <summary>
        /// Get competition leaderboard
        /// </summary>
        public async Task<ServiceResult<CompetitionLeaderboardDTO>> GetCompetitionLeaderboard(int competitionId, int page, int pageSize)
        {
            try
            {
                var competition = await _context.Competitions.FindAsync(competitionId);
                if (competition == null)
                    return ServiceResult<CompetitionLeaderboardDTO>.FailureResult("Competition not found");

                // If leaderboard is hidden, return empty
                if (!competition.ShowLeaderboard)
                    return ServiceResult<CompetitionLeaderboardDTO>.FailureResult("Leaderboard is not available for this competition");

                var participants = await _context.CompetitionParticipants
                    .Where(p => p.CompetitionId == competitionId && p.Score.HasValue)
                    .OrderByDescending(p => p.Score)
                    .ThenBy(p => p.Rank)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new CompetitionParticipantDTO
                    {
                        ParticipantId = p.UserId,
                        ParticipantName = !string.IsNullOrWhiteSpace(p.TeamName)
                            ? p.TeamName
                            : ((($"{p.User.FirstName} {p.User.LastName}").Trim().Length > 0)
                                ? ($"{p.User.FirstName} {p.User.LastName}").Trim()
                                : (p.User.Username ?? "Unknown")),
                        ParticipantType = string.IsNullOrEmpty(p.TeamName) ? "Individual" : "Team",
                        Score = (int)(p.Score ?? 0),
                        Rank = p.Rank ?? 0,
                        Status = p.Status
                    })
                    .ToListAsync();

                var leaderboard = new CompetitionLeaderboardDTO
                {
                    Participants = participants,
                    LastUpdatedAt = DateTime.UtcNow
                };

                return ServiceResult<CompetitionLeaderboardDTO>.SuccessResult(leaderboard);
            }
            catch (Exception ex)
            {
                return ServiceResult<CompetitionLeaderboardDTO>.FailureResult($"Failed to get leaderboard: {ex.Message}");
            }
        }

        /// <summary>
        /// Get competitions that a user has joined
        /// </summary>
        public async Task<ServiceResult<List<UserCompetitionDTO>>> GetUserCompetitions(int userId)
        {
            try
            {
                var participantEntries = await _context.CompetitionParticipants
                    .Where(p => p.UserId == userId)
                    .Include(p => p.Competition)
                    .ThenInclude(c => c.Questions)
                    .Include(p => p.User)
                    .ToListAsync();

                var userCompetitions = new List<UserCompetitionDTO>();

                foreach (var p in participantEntries)
                {
                    var dto = new UserCompetitionDTO
                    {
                        Competition = MapToCompetitionDTO(p.Competition),
                        ParticipantScore = p.Score.HasValue ? (int?)p.Score.Value : null,
                        ParticipantRank = p.Rank,
                        JoinedAt = p.JoinedAt,
                        ParticipantStatus = p.Status
                    };

                    // If rank is not set on participant row, try to compute from scores table
                    if (!dto.ParticipantRank.HasValue || dto.ParticipantRank.Value <= 0)
                    {
                        try
                        {
                            var rankedUserIds = await _context.CompetitionParticipants
                                .Where(x => x.CompetitionId == p.CompetitionId && x.Score.HasValue)
                                .OrderByDescending(x => x.Score)
                                .Select(x => x.UserId)
                                .ToListAsync();

                            var idx = rankedUserIds.IndexOf(userId);
                            if (idx >= 0)
                                dto.ParticipantRank = idx + 1;
                        }
                        catch
                        {
                            // ignore failures to compute rank and leave as null
                        }
                    }

                    userCompetitions.Add(dto);
                }

                userCompetitions = userCompetitions
                    .OrderByDescending(uc => uc.Competition.CreatedAt)
                    .ToList();

                return ServiceResult<List<UserCompetitionDTO>>.SuccessResult(userCompetitions);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<UserCompetitionDTO>>.FailureResult($"Failed to get user competitions: {ex.Message}");
            }
        }

        /// <summary>
        /// Get statistics for a competition
        /// </summary>
        public async Task<ServiceResult<CompetitionStatsDTO>> GetCompetitionStats(int competitionId)
        {
            try
            {
                var competition = await _context.Competitions
                    .Include(c => c.Participants)
                    .Include(c => c.Scores)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<CompetitionStatsDTO>.FailureResult("Competition not found");

                var participantsWithScores = competition.Participants
                    .Where(p => p.Score.HasValue)
                    .ToList();

                var averageScore = participantsWithScores.Any()
                    ? participantsWithScores.Average(p => p.Score ?? 0)
                    : 0;

                var highestScore = participantsWithScores.Any()
                    ? participantsWithScores.Max(p => p.Score ?? 0)
                    : 0;

                var stats = new CompetitionStatsDTO
                {
                    TotalParticipants = competition.ParticipantCount,
                    ActiveParticipants = competition.Participants.Count(p => p.Status == "Started" || p.Status == "Completed"),
                    AverageScore = (decimal)averageScore,
                    HighestScore = (int)highestScore
                };

                return ServiceResult<CompetitionStatsDTO>.SuccessResult(stats);
            }
            catch (Exception ex)
            {
                return ServiceResult<CompetitionStatsDTO>.FailureResult($"Failed to get competition stats: {ex.Message}");
            }
        }

        /// <summary>
        /// Map Competition model to CompetitionDTO
        /// </summary>
        private CompetitionDTO MapToCompetitionDTO(Models.Competition competition)
        {
            var currentStatus = CalculateStatus(competition.StartDate, competition.EndDate, competition.IsApproved);
            var competitionPeriod = ResolveCompetitionPeriod(competition.CompetitionRules, competition.StartDate, competition.EndDate);

            // CODEFORCES RULE: Don't include questions in main DTO
            // Participants must call specific endpoints to view questions (only when Ongoing)
            var allowedIds = new List<int>();
            if (!string.IsNullOrWhiteSpace(competition.AllowedMemberIds))
            {
                allowedIds = competition.AllowedMemberIds
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(id => int.TryParse(id, out var parsed) ? parsed : (int?)null)
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .Distinct()
                    .ToList();
            }

            var allowedClanIds = new List<int>();
            if (!string.IsNullOrWhiteSpace(competition.AllowedClanIds))
            {
                allowedClanIds = competition.AllowedClanIds
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(id => int.TryParse(id, out var parsed) ? parsed : (int?)null)
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .Distinct()
                    .ToList();
            }

            return new CompetitionDTO
            {
                Id = competition.Id,
                Title = competition.Title,
                Description = competition.Description,
                CompetitionType = competition.CompetitionType,
                CompetitionPeriod = competitionPeriod,
                StartDate = competition.StartDate,
                EndDate = competition.EndDate,
                Status = currentStatus.ToLower(),
                MaxParticipants = competition.MaxParticipants,
                IsTeamBased = competition.IsTeamBased,
                TeamSize = competition.TeamSize,
                ClanId = competition.ClanId,
                CourseId = competition.CourseId,
                CreatorId = competition.CreatorId,
                CreatorRole = competition.CreatorRole,
                IsApproved = competition.IsApproved,
                IsPublic = competition.IsPublic,
                AllowedMemberIds = allowedIds,
                AllowedClanIds = allowedClanIds.Any() ? allowedClanIds : null,
                PointRangeMin = competition.PointRangeMin,
                PointRangeMax = competition.PointRangeMax,
                ParticipantCount = competition.ParticipantCount,
                PrizePool = (int)(competition.PrizeAmount ?? 0),
                CreatedAt = competition.CreatedAt,
                Questions = new List<CompetitionQuestionDTO>() // Empty - use dedicated endpoints
            };
        }

        private async Task<Models.CompetitionParticipant?> EnsureParticipantAccessAsync(Models.Competition competition, int userId)
        {
            var participant = await _context.CompetitionParticipants
                .FirstOrDefaultAsync(p => p.CompetitionId == competition.Id && p.UserId == userId);

            if (participant != null)
                return participant;

            if (!competition.IsTeamBased)
                return null;

            var approvedTeam = await _context.CompetitionRegistrations
                .Where(r => r.CompetitionId == competition.Id && (r.Status == "Approved" || r.Status == "Participated"))
                .Join(
                    _context.TeamMembers.Where(tm => tm.UserId == userId),
                    r => r.TeamId,
                    tm => tm.TeamId,
                    (r, tm) => new { r.TeamId, Registration = r }
                )
                .FirstOrDefaultAsync();

            if (approvedTeam == null)
            {
                var currentStatus = CalculateStatus(competition.StartDate, competition.EndDate, competition.IsApproved);
                if (currentStatus == "Ongoing")
                {
                    var pendingTeam = await _context.CompetitionRegistrations
                        .Where(r => r.CompetitionId == competition.Id && r.Status == "Pending")
                        .Join(
                            _context.TeamMembers.Where(tm => tm.UserId == userId),
                            r => r.TeamId,
                            tm => tm.TeamId,
                            (r, tm) => new { r.TeamId, Registration = r }
                        )
                        .FirstOrDefaultAsync();

                    if (pendingTeam != null)
                    {
                        pendingTeam.Registration.Status = "Approved";
                        approvedTeam = pendingTeam;
                    }
                }
            }

            if (approvedTeam == null)
                return null;

            var team = await _context.Teams.FirstOrDefaultAsync(t => t.Id == approvedTeam.TeamId);

            participant = new Models.CompetitionParticipant
            {
                CompetitionId = competition.Id,
                UserId = userId,
                TeamId = approvedTeam.TeamId,
                TeamName = team?.Name,
                Status = "Registered",
                JoinedAt = DateTime.UtcNow
            };

            _context.CompetitionParticipants.Add(participant);

            var currentCount = await _context.CompetitionParticipants
                .Where(p => p.CompetitionId == competition.Id)
                .Select(p => p.UserId)
                .Distinct()
                .CountAsync();

            competition.ParticipantCount = currentCount + 1;
            competition.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return participant;
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
    }
}
