using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace backend.Services
{
    public interface IClanVsClansCompetitionService
    {
        // Create and manage competitions
        Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> CreateCompetitionAsync(int userId, CreateClanVsClansCompetitionDTO dto);
        Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> GetCompetitionAsync(int competitionId);
        Task<ServiceResult<List<ClanVsClansCompetitionDetailDTO>>> GetClanCompetitionsAsync(int clanId, int page = 1, int pageSize = 20);
        Task<ServiceResult<List<ClanVsClansCompetitionDetailDTO>>> GetPendingChallengesAsync(int clanId);

        // Accept or reject challenges
        Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> AcceptChallengeAsync(int competitionId, int userId);
        Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> RejectChallengeAsync(int competitionId, int userId, string? reason);

        // Participant management
        Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> SelectParticipantsAsync(int competitionId, int userId, List<int> participantIds);
        Task<ServiceResult<string>> ConfirmParticipantSelectionAsync(int competitionId, int clanId);

        // Get questions for competition
        Task<ServiceResult<List<ClanVsClansCompetitionQuestionDTO>>> GetCompetitionQuestionsAsync(int competitionId);

        // Submit answers and calculate scores
        Task<ServiceResult<ClanVsClansCompetitionParticipantDTO>> SubmitAnswerAsync(int competitionId, int userId, SubmitClanVsClansCompetitionAnswerDTO dto);
        Task<ServiceResult<ClanVsClansCompetitionParticipantDTO>> CompleteCompetitionAsync(int competitionId, int userId);

        // Results and leaderboards
        Task<ServiceResult<ClanVsClansCompetitionResultDTO>> GetCompetitionResultsAsync(int competitionId);
        Task<ServiceResult<List<ClanVsClansCompetitionParticipantResultDTO>>> GetClanParticipantResultsAsync(int competitionId, int clanId);

        // Start competition (when time comes)
        Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> StartCompetitionAsync(int competitionId);
    }

    public class ClanVsClansCompetitionService : IClanVsClansCompetitionService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public ClanVsClansCompetitionService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        /// <summary>
        /// Check if a user is a clan leader or co-leader
        /// </summary>
        private async Task<bool> IsUserClanLeaderAsync(int userId, int clanId)
        {
            var member = await _context.ClanMembers
                .FirstOrDefaultAsync(m => m.UserId == userId && m.ClanId == clanId);

            return member != null && (member.Role == "Leader" || member.Role == "CoLeader");
        }

        public async Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> CreateCompetitionAsync(int userId, CreateClanVsClansCompetitionDTO dto)
        {
            try
            {
                // Validate that user is a leader/co-leader of their clan
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("User not found");

                // Get user's clans where they are leader/co-leader
                var userClanMemberships = await _context.ClanMembers
                    .Where(m => m.UserId == userId && (m.Role == "Leader" || m.Role == "CoLeader"))
                    .Select(m => m.ClanId)
                    .ToListAsync();

                if (!userClanMemberships.Any())
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("You must be a clan leader or co-leader to create competitions");

                // Validate opponent clan exists and is different
                var challengerClan = await _context.Clans.FindAsync(userClanMemberships.First());
                var opponentClan = await _context.Clans.FindAsync(dto.OpponentClanId);

                if (opponentClan == null)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Opponent clan not found");

                if (challengerClan == null)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Your clan not found");

                if (challengerClan.Id == opponentClan.Id)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Cannot challenge your own clan");

                // Validate input
                if (dto.ParticipantsPerClan < 1 || dto.ParticipantsPerClan > 10)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Participants per clan must be between 1 and 10");

                if (dto.DurationMinutes < 5 || dto.DurationMinutes > 180)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Duration must be between 5 and 180 minutes");

                // Create competition
                var competition = new ClanVsClansCompetition
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    ChallengerClanId = challengerClan.Id,
                    OpponentClanId = opponentClan.Id,
                    CompetitionType = dto.CompetitionType,
                    DifficultyLevel = dto.DifficultyLevel,
                    ParticipantsPerClan = dto.ParticipantsPerClan,
                    DurationMinutes = dto.DurationMinutes,
                    Status = "Pending",
                    CreatedByUserId = userId,
                    ScheduledStartTime = dto.ScheduledStartTime.HasValue
                        ? DateTime.SpecifyKind(dto.ScheduledStartTime.Value, DateTimeKind.Utc)
                        : null,
                    CreatedAt = DateTime.UtcNow,
                    ShowScoresToOpponent = true,
                    AllowWithdrawal = false
                };

                _context.ClanVsClansCompetitions.Add(competition);
                await _context.SaveChangesAsync();

                // Notify opponent clan leaders
                var opponentLeaders = await _context.ClanMembers
                    .Where(m => m.ClanId == opponentClan.Id && (m.Role == "Leader" || m.Role == "CoLeader"))
                    .Select(m => m.UserId)
                    .ToListAsync();

                foreach (var leaderId in opponentLeaders)
                {
                    await _notificationService.CreateNotification(
                        leaderId,
                        "ClanCompetitionChallenge",
                        "New Challenge Received",
                        $"Clan '{challengerClan.Name}' has challenged your clan to a {dto.CompetitionType} competition!",
                        $"/clans-competitions/{competition.Id}",
                        clanId: competition.OpponentClanId
                    );
                }

                return ServiceResult<ClanVsClansCompetitionDetailDTO>.SuccessResult(
                    await GetCompetitionDTOAsync(competition),
                    "Competition created successfully"
                );
            }
            catch (Exception ex)
            {
                System.Console.Error.WriteLine("Error in CreateCompetitionAsync:\n" + ex.ToString());
                return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult($"Error creating competition: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> GetCompetitionAsync(int competitionId)
        {
            try
            {
                var competition = await _context.ClanVsClansCompetitions
                    .Include(c => c.ChallengerClan)
                    .Include(c => c.OpponentClan)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Competition not found");

                return ServiceResult<ClanVsClansCompetitionDetailDTO>.SuccessResult(
                    await GetCompetitionDTOAsync(competition)
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult($"Error fetching competition: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanVsClansCompetitionDetailDTO>>> GetClanCompetitionsAsync(int clanId, int page = 1, int pageSize = 20)
        {
            try
            {
                var skip = (page - 1) * pageSize;

                var competitions = await _context.ClanVsClansCompetitions
                    .Where(c => c.ChallengerClanId == clanId || c.OpponentClanId == clanId)
                    .Include(c => c.ChallengerClan)
                    .Include(c => c.OpponentClan)
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                var dtos = new List<ClanVsClansCompetitionDetailDTO>();
                foreach (var comp in competitions)
                {
                    dtos.Add(await GetCompetitionDTOAsync(comp));
                }

                return ServiceResult<List<ClanVsClansCompetitionDetailDTO>>.SuccessResult(dtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanVsClansCompetitionDetailDTO>>.FailureResult($"Error fetching clan competitions: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanVsClansCompetitionDetailDTO>>> GetPendingChallengesAsync(int clanId)
        {
            try
            {
                var competitions = await _context.ClanVsClansCompetitions
                    .Where(c => c.OpponentClanId == clanId && c.Status == "Pending")
                    .Include(c => c.ChallengerClan)
                    .Include(c => c.OpponentClan)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                var dtos = new List<ClanVsClansCompetitionDetailDTO>();
                foreach (var comp in competitions)
                {
                    dtos.Add(await GetCompetitionDTOAsync(comp));
                }

                return ServiceResult<List<ClanVsClansCompetitionDetailDTO>>.SuccessResult(dtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanVsClansCompetitionDetailDTO>>.FailureResult($"Error fetching pending challenges: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> AcceptChallengeAsync(int competitionId, int userId)
        {
            try
            {
                var competition = await _context.ClanVsClansCompetitions
                    .Include(c => c.ChallengerClan)
                    .Include(c => c.OpponentClan)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Competition not found");

                if (competition.Status != "Pending")
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Competition is not pending");

                // Check if user is opponent clan leader
                if (!await IsUserClanLeaderAsync(userId, competition.OpponentClanId))
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Only opponent clan leader can accept this challenge");

                var now = DateTime.UtcNow;
                competition.Status = "Ongoing";
                competition.OpponentResponse = "Accepted";
                competition.CompetitionStartTime = now;
                competition.ChallengerReady = true;
                competition.OpponentReady = true;
                competition.UpdatedAt = now;

                var existingParticipants = await _context.ClanVsClansCompetitionParticipants
                    .Where(p => p.CompetitionId == competitionId)
                    .ToListAsync();

                if (existingParticipants.Count == 0)
                {
                    var challengerMembers = await _context.ClanMembers
                        .Where(m => m.ClanId == competition.ChallengerClanId)
                        .OrderBy(m => m.JoinedAt)
                        .Take(competition.ParticipantsPerClan)
                        .Select(m => m.UserId)
                        .ToListAsync();

                    var opponentMembers = await _context.ClanMembers
                        .Where(m => m.ClanId == competition.OpponentClanId)
                        .OrderBy(m => m.JoinedAt)
                        .Take(competition.ParticipantsPerClan)
                        .Select(m => m.UserId)
                        .ToListAsync();

                    if (challengerMembers.Count < competition.ParticipantsPerClan || opponentMembers.Count < competition.ParticipantsPerClan)
                        return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Both clans must have enough members to start the competition");

                    foreach (var memberId in challengerMembers)
                    {
                        _context.ClanVsClansCompetitionParticipants.Add(new ClanVsClansCompetitionParticipant
                        {
                            CompetitionId = competitionId,
                            UserId = memberId,
                            ClanId = competition.ChallengerClanId,
                            Status = "Started",
                            SelectedAt = now,
                            StartedAt = now
                        });
                    }

                    foreach (var memberId in opponentMembers)
                    {
                        _context.ClanVsClansCompetitionParticipants.Add(new ClanVsClansCompetitionParticipant
                        {
                            CompetitionId = competitionId,
                            UserId = memberId,
                            ClanId = competition.OpponentClanId,
                            Status = "Started",
                            SelectedAt = now,
                            StartedAt = now
                        });
                    }
                }
                else
                {
                    foreach (var participant in existingParticipants)
                    {
                        participant.Status = "Started";
                        participant.StartedAt ??= now;
                    }
                }

                await _context.SaveChangesAsync();

                // Notify challenger clan leaders
                await NotifyAboutAcceptance(competition, true);

                return ServiceResult<ClanVsClansCompetitionDetailDTO>.SuccessResult(
                    await GetCompetitionDTOAsync(competition),
                    "Challenge accepted successfully"
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult($"Error accepting challenge: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> RejectChallengeAsync(int competitionId, int userId, string? reason)
        {
            try
            {
                var competition = await _context.ClanVsClansCompetitions
                    .Include(c => c.ChallengerClan)
                    .Include(c => c.OpponentClan)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Competition not found");

                if (competition.Status != "Pending")
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Competition is not pending");

                // Check if user is opponent clan leader
                if (!await IsUserClanLeaderAsync(userId, competition.OpponentClanId))
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Only opponent clan leader can reject this challenge");

                competition.Status = "Rejected";
                competition.OpponentResponse = "Rejected";
                competition.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Notify challenger clan leaders
                var challengers = await _context.ClanMembers
                    .Where(m => m.ClanId == competition.ChallengerClanId && (m.Role == "Leader" || m.Role == "CoLeader"))
                    .Select(m => m.UserId)
                    .ToListAsync();

                foreach (var leaderId in challengers)
                {
                    await _notificationService.CreateNotification(
                        leaderId,
                        "ClanCompetitionRejected",
                        "Challenge Rejected",
                        $"Clan '{competition.OpponentClan?.Name}' has rejected your competition challenge.",
                        $"/clans-competitions/{competition.Id}",
                        clanId: competition.ChallengerClanId
                    );
                }

                return ServiceResult<ClanVsClansCompetitionDetailDTO>.SuccessResult(
                    await GetCompetitionDTOAsync(competition),
                    "Challenge rejected successfully"
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult($"Error rejecting challenge: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> SelectParticipantsAsync(int competitionId, int userId, List<int> participantIds)
        {
            try
            {
                var competition = await _context.ClanVsClansCompetitions
                    .Include(c => c.ChallengerClan)
                    .Include(c => c.OpponentClan)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Competition not found");

                // Determine which clan the user belongs to
                int userClanId = 0;
                bool isChallengerClan = false;

                if (await IsUserClanLeaderAsync(userId, competition.ChallengerClanId))
                {
                    userClanId = competition.ChallengerClanId;
                    isChallengerClan = true;
                }
                else if (await IsUserClanLeaderAsync(userId, competition.OpponentClanId))
                {
                    userClanId = competition.OpponentClanId;
                    isChallengerClan = false;
                }
                else
                {
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("You are not a leader of either participating clan");
                }

                // Validate participant count
                if (participantIds.Count != competition.ParticipantsPerClan)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult(
                        $"You must select exactly {competition.ParticipantsPerClan} participants");

                // Validate participants belong to the clan
                var clanMembers = await _context.ClanMembers
                    .Where(m => m.ClanId == userClanId)
                    .Select(m => m.UserId)
                    .ToListAsync();

                foreach (var participantId in participantIds)
                {
                    if (!clanMembers.Contains(participantId))
                        return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult(
                            "All selected participants must be members of your clan");
                }

                // Remove existing participants for this clan
                var existingParticipants = await _context.ClanVsClansCompetitionParticipants
                    .Where(p => p.CompetitionId == competitionId && p.ClanId == userClanId)
                    .ToListAsync();

                _context.ClanVsClansCompetitionParticipants.RemoveRange(existingParticipants);

                // Add new participants
                foreach (var participantId in participantIds)
                {
                    var participant = new ClanVsClansCompetitionParticipant
                    {
                        CompetitionId = competitionId,
                        UserId = participantId,
                        ClanId = userClanId,
                        Status = "Selected",
                        SelectedAt = DateTime.UtcNow
                    };
                    _context.ClanVsClansCompetitionParticipants.Add(participant);
                }

                // Update ready status
                if (isChallengerClan)
                    competition.ChallengerReady = true;
                else
                    competition.OpponentReady = true;

                await _context.SaveChangesAsync();

                return ServiceResult<ClanVsClansCompetitionDetailDTO>.SuccessResult(
                    await GetCompetitionDTOAsync(competition),
                    "Participants selected successfully"
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult($"Error selecting participants: {ex.Message}");
            }
        }

        public async Task<ServiceResult<string>> ConfirmParticipantSelectionAsync(int competitionId, int clanId)
        {
            try
            {
                var competition = await _context.ClanVsClansCompetitions
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<string>.FailureResult("Competition not found");

                if (clanId == competition.ChallengerClanId)
                    competition.ChallengerReady = true;
                else if (clanId == competition.OpponentClanId)
                    competition.OpponentReady = true;
                else
                    return ServiceResult<string>.FailureResult("Clan is not part of this competition");

                // If both are ready, competition can start
                if (competition.ChallengerReady && competition.OpponentReady)
                {
                    competition.Status = "Ready";
                }

                await _context.SaveChangesAsync();

                return ServiceResult<string>.SuccessResult("Participants confirmed successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<string>.FailureResult($"Error confirming selection: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanVsClansCompetitionQuestionDTO>>> GetCompetitionQuestionsAsync(int competitionId)
        {
            try
            {
                var questions = await _context.ClanVsClansCompetitionQuestions
                    .Where(q => q.CompetitionId == competitionId)
                    .OrderBy(q => q.QuestionOrder)
                    .ToListAsync();

                var dtos = questions.Select(q => new ClanVsClansCompetitionQuestionDTO
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD,
                    Points = q.Points,
                    QuestionOrder = q.QuestionOrder,
                    Topic = q.Topic,
                    DifficultyLevel = q.DifficultyLevel
                }).ToList();

                return ServiceResult<List<ClanVsClansCompetitionQuestionDTO>>.SuccessResult(dtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanVsClansCompetitionQuestionDTO>>.FailureResult($"Error fetching questions: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanVsClansCompetitionParticipantDTO>> SubmitAnswerAsync(int competitionId, int userId, SubmitClanVsClansCompetitionAnswerDTO dto)
        {
            try
            {
                var participant = await _context.ClanVsClansCompetitionParticipants
                    .FirstOrDefaultAsync(p => p.CompetitionId == competitionId && p.UserId == userId);

                if (participant == null)
                    return ServiceResult<ClanVsClansCompetitionParticipantDTO>.FailureResult("Participant not found in this competition");

                var question = await _context.ClanVsClansCompetitionQuestions
                    .FirstOrDefaultAsync(q => q.Id == dto.QuestionId && q.CompetitionId == competitionId);

                if (question == null)
                    return ServiceResult<ClanVsClansCompetitionParticipantDTO>.FailureResult("Question not found");

                // Check if answer is correct
                bool isCorrect = question.CorrectAnswer.ToUpper() == dto.Answer.ToUpper();

                if (isCorrect)
                {
                    participant.CorrectAnswers++;
                    participant.Score += question.Points;
                }
                else
                {
                    participant.WrongAnswers++;
                }

                // Store answer submission
                var answerSubmission = new { questionId = dto.QuestionId, answer = dto.Answer, isCorrect };
                // Will implement answer storage in a future update

                await _context.SaveChangesAsync();

                return ServiceResult<ClanVsClansCompetitionParticipantDTO>.SuccessResult(
                    GetParticipantDTO(participant),
                    "Answer submitted successfully"
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanVsClansCompetitionParticipantDTO>.FailureResult($"Error submitting answer: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanVsClansCompetitionParticipantDTO>> CompleteCompetitionAsync(int competitionId, int userId)
        {
            try
            {
                var participant = await _context.ClanVsClansCompetitionParticipants
                    .FirstOrDefaultAsync(p => p.CompetitionId == competitionId && p.UserId == userId);

                if (participant == null)
                    return ServiceResult<ClanVsClansCompetitionParticipantDTO>.FailureResult("Participant not found");

                participant.Status = "Completed";
                participant.CompletedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Check if all participants have completed, then calculate scores
                var competition = await _context.ClanVsClansCompetitions
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition != null)
                {
                    var allParticipants = await _context.ClanVsClansCompetitionParticipants
                        .Where(p => p.CompetitionId == competitionId)
                        .ToListAsync();

                    if (allParticipants.All(p => p.Status == "Completed"))
                    {
                        await CalculateCompetitionResultsAsync(competitionId);
                    }
                }

                return ServiceResult<ClanVsClansCompetitionParticipantDTO>.SuccessResult(GetParticipantDTO(participant));
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanVsClansCompetitionParticipantDTO>.FailureResult($"Error completing competition: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanVsClansCompetitionResultDTO>> GetCompetitionResultsAsync(int competitionId)
        {
            try
            {
                var competition = await _context.ClanVsClansCompetitions
                    .Include(c => c.ChallengerClan)
                    .Include(c => c.OpponentClan)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<ClanVsClansCompetitionResultDTO>.FailureResult("Competition not found");

                if (competition.Status != "Completed")
                    return ServiceResult<ClanVsClansCompetitionResultDTO>.FailureResult("Competition has not been completed yet");

                var challengerParticipants = await _context.ClanVsClansCompetitionParticipants
                    .Where(p => p.CompetitionId == competitionId && p.ClanId == competition.ChallengerClanId)
                    .Include(p => p.User)
                    .OrderByDescending(p => p.Score)
                    .ToListAsync();

                var opponentParticipants = await _context.ClanVsClansCompetitionParticipants
                    .Where(p => p.CompetitionId == competitionId && p.ClanId == competition.OpponentClanId)
                    .Include(p => p.User)
                    .OrderByDescending(p => p.Score)
                    .ToListAsync();

                var result = new ClanVsClansCompetitionResultDTO
                {
                    CompetitionId = competitionId,
                    ChallengerClan = competition.ChallengerClan != null ? new ClanBasicDTO
                    {
                        Id = competition.ChallengerClan.Id,
                        Name = competition.ChallengerClan.Name,
                        Tag = competition.ChallengerClan.Tag,
                        LogoUrl = competition.ChallengerClan.LogoUrl,
                        MemberCount = competition.ChallengerClan.MemberCount
                    } : new ClanBasicDTO
                    {
                        Id = 0,
                        Name = "Unknown",
                        Tag = "",
                        LogoUrl = null,
                        MemberCount = 0
                    },
                    OpponentClan = competition.OpponentClan != null ? new ClanBasicDTO
                    {
                        Id = competition.OpponentClan.Id,
                        Name = competition.OpponentClan.Name,
                        Tag = competition.OpponentClan.Tag,
                        LogoUrl = competition.OpponentClan.LogoUrl,
                        MemberCount = competition.OpponentClan.MemberCount
                    } : new ClanBasicDTO
                    {
                        Id = 0,
                        Name = "Unknown",
                        Tag = "",
                        LogoUrl = null,
                        MemberCount = 0
                    },
                    ChallengerTotalScore = competition.ChallengerTotalScore ?? 0,
                    OpponentTotalScore = competition.OpponentTotalScore ?? 0,
                    WinnerClan = competition.WinnerClanStatus ?? "",
                    ChallengerResults = challengerParticipants.Select((p, index) => new ClanVsClansCompetitionParticipantResultDTO
                    {
                        UserId = p.UserId,
                        UserName = p.User?.Username ?? "Unknown",
                        Score = p.Score,
                        CorrectAnswers = p.CorrectAnswers,
                        WrongAnswers = p.WrongAnswers,
                        UnansweredQuestions = p.UnansweredQuestions,
                        TimeTakenSeconds = p.TimeTakenSeconds,
                        Rank = index + 1
                    }).ToList(),
                    OpponentResults = opponentParticipants.Select((p, index) => new ClanVsClansCompetitionParticipantResultDTO
                    {
                        UserId = p.UserId,
                        UserName = p.User?.Username ?? "Unknown",
                        Score = p.Score,
                        CorrectAnswers = p.CorrectAnswers,
                        WrongAnswers = p.WrongAnswers,
                        UnansweredQuestions = p.UnansweredQuestions,
                        TimeTakenSeconds = p.TimeTakenSeconds,
                        Rank = index + 1
                    }).ToList(),
                    CompletedAt = competition.CompetitionEndTime ?? DateTime.UtcNow
                };

                return ServiceResult<ClanVsClansCompetitionResultDTO>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanVsClansCompetitionResultDTO>.FailureResult($"Error fetching results: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanVsClansCompetitionParticipantResultDTO>>> GetClanParticipantResultsAsync(int competitionId, int clanId)
        {
            try
            {
                var participants = await _context.ClanVsClansCompetitionParticipants
                    .Where(p => p.CompetitionId == competitionId && p.ClanId == clanId)
                    .Include(p => p.User)
                    .OrderByDescending(p => p.Score)
                    .ToListAsync();

                var results = participants.Select((p, index) => new ClanVsClansCompetitionParticipantResultDTO
                {
                    UserId = p.UserId,
                    UserName = p.User?.Username ?? "Unknown",
                    Score = p.Score,
                    CorrectAnswers = p.CorrectAnswers,
                    WrongAnswers = p.WrongAnswers,
                    UnansweredQuestions = p.UnansweredQuestions,
                    TimeTakenSeconds = p.TimeTakenSeconds,
                    Rank = index + 1
                }).ToList();

                return ServiceResult<List<ClanVsClansCompetitionParticipantResultDTO>>.SuccessResult(results);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanVsClansCompetitionParticipantResultDTO>>.FailureResult($"Error fetching results: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanVsClansCompetitionDetailDTO>> StartCompetitionAsync(int competitionId)
        {
            try
            {
                var competition = await _context.ClanVsClansCompetitions
                    .Include(c => c.ChallengerClan)
                    .Include(c => c.OpponentClan)
                    .FirstOrDefaultAsync(c => c.Id == competitionId);

                if (competition == null)
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Competition not found");

                if (competition.Status != "Ready" && competition.Status != "Scheduled")
                    return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult("Competition cannot be started in its current status");

                competition.Status = "Ongoing";
                competition.CompetitionStartTime = DateTime.UtcNow;

                // Mark all participants as started
                var participants = await _context.ClanVsClansCompetitionParticipants
                    .Where(p => p.CompetitionId == competitionId && p.Status == "Selected")
                    .ToListAsync();

                foreach (var participant in participants)
                {
                    participant.Status = "Started";
                    participant.StartedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return ServiceResult<ClanVsClansCompetitionDetailDTO>.SuccessResult(
                    await GetCompetitionDTOAsync(competition),
                    "Competition started successfully"
                );
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanVsClansCompetitionDetailDTO>.FailureResult($"Error starting competition: {ex.Message}");
            }
        }

        // Helper Methods
        private async Task<ClanVsClansCompetitionDetailDTO> GetCompetitionDTOAsync(ClanVsClansCompetition competition)
        {
            var challengerParticipants = await _context.ClanVsClansCompetitionParticipants
                .Where(p => p.CompetitionId == competition.Id && p.ClanId == competition.ChallengerClanId)
                .Include(p => p.User)
                .ToListAsync();

            var opponentParticipants = await _context.ClanVsClansCompetitionParticipants
                .Where(p => p.CompetitionId == competition.Id && p.ClanId == competition.OpponentClanId)
                .Include(p => p.User)
                .ToListAsync();

            return new ClanVsClansCompetitionDetailDTO
            {
                Id = competition.Id,
                Title = competition.Title,
                Description = competition.Description,
                ChallengerClan = competition.ChallengerClan != null ? new ClanBasicDTO
                {
                    Id = competition.ChallengerClan.Id,
                    Name = competition.ChallengerClan.Name,
                    Tag = competition.ChallengerClan.Tag,
                    LogoUrl = competition.ChallengerClan.LogoUrl,
                    MemberCount = competition.ChallengerClan.MemberCount
                } : new ClanBasicDTO
                {
                    Id = 0,
                    Name = "Unknown",
                    Tag = "",
                    LogoUrl = null,
                    MemberCount = 0
                },
                OpponentClan = competition.OpponentClan != null ? new ClanBasicDTO
                {
                    Id = competition.OpponentClan.Id,
                    Name = competition.OpponentClan.Name,
                    Tag = competition.OpponentClan.Tag,
                    LogoUrl = competition.OpponentClan.LogoUrl,
                    MemberCount = competition.OpponentClan.MemberCount
                } : new ClanBasicDTO
                {
                    Id = 0,
                    Name = "Unknown",
                    Tag = "",
                    LogoUrl = null,
                    MemberCount = 0
                },
                CompetitionType = competition.CompetitionType,
                DifficultyLevel = competition.DifficultyLevel,
                ParticipantsPerClan = competition.ParticipantsPerClan,
                DurationMinutes = competition.DurationMinutes,
                Status = competition.Status,
                CreatedAt = competition.CreatedAt,
                ScheduledStartTime = competition.ScheduledStartTime,
                CompetitionStartTime = competition.CompetitionStartTime,
                CompetitionEndTime = competition.CompetitionEndTime,
                ChallengerParticipants = challengerParticipants.Select(p => GetParticipantDTO(p)).ToList(),
                OpponentParticipants = opponentParticipants.Select(p => GetParticipantDTO(p)).ToList(),
                ChallengerTotalScore = competition.ChallengerTotalScore,
                OpponentTotalScore = competition.OpponentTotalScore,
                WinnerClanStatus = competition.WinnerClanStatus ?? "",
                ChallengerReady = competition.ChallengerReady,
                OpponentReady = competition.OpponentReady,
                OpponentResponse = competition.OpponentResponse
            };
        }

        private ClanVsClansCompetitionParticipantDTO GetParticipantDTO(ClanVsClansCompetitionParticipant participant)
        {
            return new ClanVsClansCompetitionParticipantDTO
            {
                Id = participant.Id,
                UserId = participant.UserId,
                UserName = participant.User?.Username ?? "Unknown",
                ProfileImageUrl = participant.User?.ProfileImageUrl,
                Status = participant.Status,
                Score = participant.Score,
                CorrectAnswers = participant.CorrectAnswers,
                WrongAnswers = participant.WrongAnswers,
                UnansweredQuestions = participant.UnansweredQuestions,
                TimeTakenSeconds = participant.TimeTakenSeconds,
                SelectedAt = participant.SelectedAt,
                StartedAt = participant.StartedAt,
                CompletedAt = participant.CompletedAt
            };
        }

        private async Task CalculateCompetitionResultsAsync(int competitionId)
        {
            var competition = await _context.ClanVsClansCompetitions
                .FirstOrDefaultAsync(c => c.Id == competitionId);

            if (competition == null) return;

            // Get all participants grouped by clan
            var challengerParticipants = await _context.ClanVsClansCompetitionParticipants
                .Where(p => p.CompetitionId == competitionId && p.ClanId == competition.ChallengerClanId)
                .ToListAsync();

            var opponentParticipants = await _context.ClanVsClansCompetitionParticipants
                .Where(p => p.CompetitionId == competitionId && p.ClanId == competition.OpponentClanId)
                .ToListAsync();

            // Calculate total scores
            int challengerTotalScore = challengerParticipants.Sum(p => p.Score);
            int opponentTotalScore = opponentParticipants.Sum(p => p.Score);

            competition.ChallengerTotalScore = challengerTotalScore;
            competition.OpponentTotalScore = opponentTotalScore;
            competition.Status = "Completed";
            competition.CompetitionEndTime = DateTime.UtcNow;

            // Determine winner
            if (challengerTotalScore > opponentTotalScore)
            {
                competition.WinnerClanStatus = "ChallengerWon";
            }
            else if (opponentTotalScore > challengerTotalScore)
            {
                competition.WinnerClanStatus = "OpponentWon";
            }
            else
            {
                competition.WinnerClanStatus = "Draw";
            }

            await AwardCompetitionExpAsync(competitionId);

            await _context.SaveChangesAsync();
        }

        private async Task AwardCompetitionExpAsync(int competitionId)
        {
            await EnsureProgressionDefaultsAsync();

            var participants = await _context.ClanVsClansCompetitionParticipants
                .Where(p => p.CompetitionId == competitionId)
                .OrderByDescending(p => p.Score)
                .ThenBy(p => p.TimeTakenSeconds ?? int.MaxValue)
                .ToListAsync();

            if (participants.Count == 0)
                return;

            var rewardRules = await _context.ExpRewardRules
                .AsNoTracking()
                .OrderBy(r => r.Position)
                .ToListAsync();

            var levelThresholds = await _context.LevelThresholds
                .AsNoTracking()
                .OrderBy(t => t.RequiredExp)
                .ToListAsync();

            var participantUserIds = participants.Select(p => p.UserId).Distinct().ToList();
            var users = await _context.Users
                .Where(u => participantUserIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u);

            var teamIdByUser = await _context.TeamMembers
                .Where(tm => participantUserIds.Contains(tm.UserId))
                .GroupBy(tm => tm.UserId)
                .Select(g => new { UserId = g.Key, TeamId = g.Select(x => x.TeamId).FirstOrDefault() })
                .ToDictionaryAsync(x => x.UserId, x => x.TeamId);

            var teamIdByClan = await _context.Teams
                .Where(t => participants.Select(p => p.ClanId).Contains(t.ClanId))
                .GroupBy(t => t.ClanId)
                .Select(g => new { ClanId = g.Key, TeamId = g.Select(x => x.Id).FirstOrDefault() })
                .ToDictionaryAsync(x => x.ClanId, x => x.TeamId);

            var participantClanIds = participants.Select(p => p.ClanId).Distinct().ToList();
            var missingClanTeamIds = participantClanIds.Where(clanId => !teamIdByClan.ContainsKey(clanId) || teamIdByClan[clanId] <= 0).ToList();

            if (missingClanTeamIds.Count > 0)
            {
                var clans = await _context.Clans
                    .Where(c => missingClanTeamIds.Contains(c.Id))
                    .ToListAsync();

                foreach (var clan in clans)
                {
                    var autoTeam = new Team
                    {
                        Name = $"{clan.Name} Auto Team",
                        ClanId = clan.Id,
                        CreatedBy = clan.LeaderId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Teams.Add(autoTeam);
                    await _context.SaveChangesAsync();
                    teamIdByClan[clan.Id] = autoTeam.Id;
                }
            }

            var existingHistoryUserIds = await _context.UserCompetitionHistories
                .Where(h => h.CompetitionId == competitionId)
                .Select(h => h.UserId)
                .ToListAsync();

            var existingHistories = existingHistoryUserIds.ToHashSet();

            for (var index = 0; index < participants.Count; index++)
            {
                var participant = participants[index];
                if (existingHistories.Contains(participant.UserId))
                    continue;

                if (!users.TryGetValue(participant.UserId, out var user))
                    continue;

                var position = index + 1;
                var earnedExp = GetExpForPosition(position, rewardRules);
                var clanTeamId = 0;

                if (teamIdByUser.TryGetValue(participant.UserId, out var userTeamId) && userTeamId > 0)
                    clanTeamId = userTeamId;
                else if (teamIdByClan.TryGetValue(participant.ClanId, out var clanTeamIdFallback) && clanTeamIdFallback > 0)
                    clanTeamId = clanTeamIdFallback;

                if (clanTeamId == 0)
                {
                    user.Exp += earnedExp;
                    user.Level = CalculateLevelFromThreshold(user.Exp, levelThresholds);
                    user.UpdatedAt = DateTime.UtcNow;
                    continue;
                }

                _context.UserCompetitionHistories.Add(new UserCompetitionHistory
                {
                    UserId = participant.UserId,
                    CompetitionId = competitionId,
                    ClanTeamId = clanTeamId,
                    Position = position,
                    EarnedExp = earnedExp,
                    Date = DateTime.UtcNow
                });

                user.Exp += earnedExp;
                user.Level = CalculateLevelFromThreshold(user.Exp, levelThresholds);
                user.UpdatedAt = DateTime.UtcNow;
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

        private static int GetExpForPosition(int position, IReadOnlyList<ExpRewardRule> rewardRules)
        {
            if (rewardRules.Count == 0)
                return Math.Max(100, 3000 - ((position - 1) * 500));

            var exact = rewardRules.FirstOrDefault(r => r.Position == position);
            if (exact != null)
                return exact.ExpAmount;

            var lastRule = rewardRules.OrderBy(r => r.Position).Last();
            if (position > lastRule.Position)
            {
                var penaltyStep = Math.Max(50, lastRule.ExpAmount / 5);
                var reduced = lastRule.ExpAmount - ((position - lastRule.Position) * penaltyStep);
                return Math.Max(100, reduced);
            }

            return Math.Max(100, 3000 - ((position - 1) * 500));
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

        private async Task NotifyAboutAcceptance(ClanVsClansCompetition competition, bool accepted)
        {
            var challengerLeaders = await _context.ClanMembers
                .Where(m => m.ClanId == competition.ChallengerClanId && (m.Role == "Leader" || m.Role == "CoLeader"))
                .Select(m => m.UserId)
                .ToListAsync();

            string message = accepted
                ? $"Clan '{competition.OpponentClan?.Name}' has accepted your competition challenge!"
                : $"Clan '{competition.OpponentClan?.Name}' has rejected your competition challenge.";

            foreach (var leaderId in challengerLeaders)
            {
                await _notificationService.CreateNotification(
                    leaderId,
                    accepted ? "ClanCompetitionAccepted" : "ClanCompetitionRejected",
                    accepted ? "Challenge Accepted" : "Challenge Rejected",
                    message,
                    $"/clans-competitions/{competition.Id}",
                    clanId: accepted ? competition.OpponentClanId : competition.ChallengerClanId
                );
            }
        }
    }
}


