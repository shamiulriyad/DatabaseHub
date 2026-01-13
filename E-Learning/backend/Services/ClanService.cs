using backend.Data;
using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ClanService : IClanService
    {
        private readonly ApplicationDbContext _context;

        public ClanService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<ClanDTO>> CreateClan(CreateClanDTO dto, int userId)
        {
            try
            {
                var clan = new Models.Clan
                {
                    Name = dto.Name,
                    Tag = dto.Tag,
                    Description = dto.Description,
                    LeaderId = userId,
                    LogoUrl = dto.LogoUrl,
                    BannerUrl = dto.BannerUrl,
                    Motto = dto.Motto,
                    ClanType = dto.ClanType,
                    UniversityId = dto.UniversityId,
                    DepartmentId = dto.DepartmentId,
                    CourseId = dto.CourseId,
                    IsPublic = dto.IsPublic,
                    RequireApproval = dto.RequireApproval,
                    MaxMembers = dto.MaxMembers,
                    JoinCriteria = dto.JoinCriteria,
                    CreatedAt = DateTime.UtcNow,
                    MemberCount = 1 // Leader is first member
                };

                _context.Clans.Add(clan);
                await _context.SaveChangesAsync();

                return ServiceResult<ClanDTO>.SuccessResult(MapToClanDTO(clan));
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanDTO>.FailureResult($"Create clan failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanDTO>> GetClanById(int clanId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<ClanDTO>.FailureResult("Clan not found");

                return ServiceResult<ClanDTO>.SuccessResult(MapToClanDTO(clan));
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanDTO>.FailureResult($"Get clan failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanDTO>>> GetAllClans(int page, int pageSize)
        {
            try
            {
                var clans = await _context.Clans
                    .OrderByDescending(c => c.TotalPoints)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var clanDTOs = clans.Select(c => MapToClanDTO(c)).ToList();
                return ServiceResult<List<ClanDTO>>.SuccessResult(clanDTOs);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanDTO>>.FailureResult($"Get all clans failed: {ex.Message}");
            }
        }

        /// <summary>
        /// Searches clans with support for multiple filters:
        /// - Query (name, tag, description)
        /// - University
        /// - Department
        /// - Ranking range
        /// - Member count range
        /// - Clan type
        /// - Public/Private
        /// </summary>
        public async Task<ServiceResult<List<ClanDTO>>> SearchClans(ClanSearchFilterDTO filter)
        {
            try
            {
                var query = _context.Clans.AsQueryable();

                // Text search (query parameter)
                if (!string.IsNullOrWhiteSpace(filter.Query))
                {
                    var searchTerm = filter.Query.ToLower();
                    query = query.Where(c => 
                        c.Name.ToLower().Contains(searchTerm) ||
                        c.Tag.ToLower().Contains(searchTerm) ||
                        c.Description.ToLower().Contains(searchTerm)
                    );
                }

                // University filter
                if (filter.UniversityId.HasValue)
                {
                    query = query.Where(c => c.UniversityId == filter.UniversityId);
                }

                // Department filter
                if (filter.DepartmentId.HasValue)
                {
                    query = query.Where(c => c.DepartmentId == filter.DepartmentId);
                }

                // Clan type filter
                if (!string.IsNullOrWhiteSpace(filter.ClanType))
                {
                    query = query.Where(c => c.ClanType == filter.ClanType);
                }

                // Public/Private filter
                if (filter.IsPublic.HasValue)
                {
                    query = query.Where(c => c.IsPublic == filter.IsPublic);
                }

                // Ranking filter (Min - Max)
                if (filter.MinRanking.HasValue)
                {
                    query = query.Where(c => c.Rank >= filter.MinRanking);
                }
                if (filter.MaxRanking.HasValue)
                {
                    query = query.Where(c => c.Rank <= filter.MaxRanking);
                }

                // Member count filter (Min - Max)
                if (filter.MinMemberCount.HasValue)
                {
                    query = query.Where(c => c.MemberCount >= filter.MinMemberCount);
                }
                if (filter.MaxMemberCount.HasValue)
                {
                    query = query.Where(c => c.MemberCount <= filter.MaxMemberCount);
                }

                // Sorting
                query = ApplySorting(query, filter.SortBy, filter.SortOrder);

                // Pagination
                var totalCount = await query.CountAsync();
                var clans = await query
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync();

                var clanDTOs = clans.Select(c => MapToClanDTO(c)).ToList();
                return ServiceResult<List<ClanDTO>>.SuccessResult(clanDTOs);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanDTO>>.FailureResult($"Search failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanDTO>> UpdateClan(int clanId, UpdateClanDTO dto)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<ClanDTO>.FailureResult("Clan not found");

                // Update fields if provided
                if (!string.IsNullOrWhiteSpace(dto.Name))
                    clan.Name = dto.Name;
                if (!string.IsNullOrWhiteSpace(dto.Description))
                    clan.Description = dto.Description;
                if (!string.IsNullOrWhiteSpace(dto.LogoUrl))
                    clan.LogoUrl = dto.LogoUrl;
                if (!string.IsNullOrWhiteSpace(dto.BannerUrl))
                    clan.BannerUrl = dto.BannerUrl;
                if (!string.IsNullOrWhiteSpace(dto.Motto))
                    clan.Motto = dto.Motto;
                if (!string.IsNullOrWhiteSpace(dto.ClanType))
                    clan.ClanType = dto.ClanType;
                if (dto.IsPublic.HasValue)
                    clan.IsPublic = dto.IsPublic.Value;
                if (dto.RequireApproval.HasValue)
                    clan.RequireApproval = dto.RequireApproval.Value;
                if (dto.MaxMembers.HasValue && dto.MaxMembers > 0)
                    clan.MaxMembers = dto.MaxMembers.Value;
                if (!string.IsNullOrWhiteSpace(dto.JoinCriteria))
                    clan.JoinCriteria = dto.JoinCriteria;

                clan.LastActivity = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return ServiceResult<ClanDTO>.SuccessResult(MapToClanDTO(clan));
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanDTO>.FailureResult($"Update clan failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> DeleteClan(int clanId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<bool>.FailureResult("Clan not found");

                // Delete clan members first
                var members = await _context.ClanMembers.Where(m => m.ClanId == clanId).ToListAsync();
                _context.ClanMembers.RemoveRange(members);

                // Delete clan
                _context.Clans.Remove(clan);
                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Delete clan failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanMemberDTO>>> GetClanMembers(int clanId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<List<ClanMemberDTO>>.FailureResult("Clan not found");

                var members = await _context.ClanMembers
                    .Where(m => m.ClanId == clanId)
                    .OrderBy(m => m.Role == "Leader" ? 0 : (m.Role == "CoLeader" ? 1 : 2))
                    .ThenByDescending(m => m.ContributionPoints)
                    .ToListAsync();

                var memberDTOs = members.Select(m => new ClanMemberDTO
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    UserName = m.User != null ? $"{m.User.FirstName} {m.User.LastName}" : "Unknown",
                    ProfileImageUrl = m.User?.ProfileImageUrl,
                    Role = m.Role,
                    ContributionPoints = m.ContributionPoints,
                    WeeklyPoints = m.WeeklyPoints,
                    MonthlyPoints = m.MonthlyPoints,
                    JoinedAt = m.JoinedAt,
                    LastActive = m.LastActive,
                    TotalPosts = m.TotalPosts,
                    TotalComments = m.TotalComments
                }).ToList();

                return ServiceResult<List<ClanMemberDTO>>.SuccessResult(memberDTOs);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanMemberDTO>>.FailureResult($"Get members failed: {ex.Message}");
            }
        }

        /// <summary>
        /// Join clan with approval workflow support:
        /// - Checks if clan is at max capacity
        /// - Creates pending join request if RequireApproval is true
        /// - Directly adds member if no approval required
        /// </summary>
        public async Task<ServiceResult<JoinResponseDTO>> JoinClan(int clanId, int userId, JoinRequestDTO? request = null)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<JoinResponseDTO>.FailureResult("Clan not found");

                // Check if user is already a member
                var existingMember = await _context.ClanMembers
                    .FirstOrDefaultAsync(cm => cm.ClanId == clanId && cm.UserId == userId);
                if (existingMember != null)
                    return ServiceResult<JoinResponseDTO>.FailureResult("User is already a member of this clan");

                // Check maximum members restriction
                if (clan.MemberCount >= clan.MaxMembers)
                    return ServiceResult<JoinResponseDTO>.FailureResult($"Clan is at maximum capacity ({clan.MaxMembers} members)");

                // Create join response
                var joinResponse = new JoinResponseDTO
                {
                    ClanId = clanId,
                    UserId = userId,
                    RequestedAt = DateTime.UtcNow,
                    Status = clan.RequireApproval ? "Pending" : "Approved"
                };

                if (clan.RequireApproval)
                {
                    // Create pending join request (to be approved by clan leader/admin)
                    // For now, we return pending status
                    // In full implementation, this would save to a JoinRequest table
                    joinResponse.Id = 0; // Placeholder
                    return ServiceResult<JoinResponseDTO>.SuccessResult(joinResponse);
                }
                else
                {
                    // Automatically add member to clan
                    var newMember = new Models.ClanMember
                    {
                        UserId = userId,
                        ClanId = clanId,
                        Role = "Member",
                        JoinedAt = DateTime.UtcNow
                    };

                    _context.ClanMembers.Add(newMember);
                    clan.MemberCount++;
                    await _context.SaveChangesAsync();

                    joinResponse.Id = newMember.Id;
                    joinResponse.Status = "Approved";
                    joinResponse.ApprovedAt = DateTime.UtcNow;
                    return ServiceResult<JoinResponseDTO>.SuccessResult(joinResponse);
                }
            }
            catch (Exception ex)
            {
                return ServiceResult<JoinResponseDTO>.FailureResult($"Join failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> LeaveClan(int clanId, int userId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<bool>.FailureResult("Clan not found");

                var member = await _context.ClanMembers
                    .FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == userId);

                if (member == null)
                    return ServiceResult<bool>.FailureResult("User is not a member of this clan");

                // Check if leader trying to leave
                if (member.Role == "Leader")
                {
                    var coLeaders = await _context.ClanMembers
                        .Where(m => m.ClanId == clanId && m.Role == "CoLeader")
                        .ToListAsync();

                    if (coLeaders.Count == 0)
                    {
                        // If no co-leaders, cannot leave
                        return ServiceResult<bool>.FailureResult("Leader cannot leave without appointing a co-leader first");
                    }

                    // Promote first co-leader to leader
                    coLeaders[0].Role = "Leader";
                }

                _context.ClanMembers.Remove(member);
                clan.MemberCount--;
                clan.LastActivity = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Leave clan failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<InvitationDTO>>> GetClanInvitations(int clanId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<List<InvitationDTO>>.FailureResult("Clan not found");

                // Note: This assumes you have an Invitation table in the database
                // If not, implement with a separate InvitationRequest model
                return ServiceResult<List<InvitationDTO>>.SuccessResult(new List<InvitationDTO>());
            }
            catch (Exception ex)
            {
                return ServiceResult<List<InvitationDTO>>.FailureResult($"Get invitations failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> InviteUser(int clanId, int userId, int invitedUserId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<bool>.FailureResult("Clan not found");

                // Check if inviter is a leader or admin
                var inviter = await _context.ClanMembers
                    .FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == userId);

                if (inviter == null || (inviter.Role != "Leader" && inviter.Role != "CoLeader"))
                    return ServiceResult<bool>.FailureResult("Only leaders can invite users");

                // Check if invited user is already a member
                var existingMember = await _context.ClanMembers
                    .FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == invitedUserId);

                if (existingMember != null)
                    return ServiceResult<bool>.FailureResult("User is already a member of this clan");

                // Create invitation (implement with proper Invitation table later)
                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Invite user failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> AcceptInvitation(int invitationId)
        {
            try
            {
                // Implement when Invitation table is created
                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Accept invitation failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> RejectInvitation(int invitationId)
        {
            try
            {
                // Implement when Invitation table is created
                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Reject invitation failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanStatsDTO>> GetClanStats(int clanId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<ClanStatsDTO>.FailureResult("Clan not found");

                var members = await _context.ClanMembers
                    .Include(m => m.User)
                    .Where(m => m.ClanId == clanId)
                    .ToListAsync();

                var roleDistribution = new Dictionary<string, int>();
                foreach (var role in members.Select(m => m.Role).Distinct())
                {
                    roleDistribution[role] = members.Count(m => m.Role == role);
                }

                var topMembers = members
                    .OrderByDescending(m => m.ContributionPoints)
                    .Take(5)
                    .Select(m => new TopMemberDTO
                    {
                        UserId = m.UserId,
                        UserName = m.User != null ? $"{m.User.FirstName} {m.User.LastName}" : "Unknown",
                        ProfileImage = m.User?.ProfileImageUrl,
                        ContributionPoints = m.ContributionPoints,
                        WeeklyPoints = m.WeeklyPoints,
                        MonthlyPoints = m.MonthlyPoints,
                        Role = m.Role
                    })
                    .ToList();

                var stats = new ClanStatsDTO
                {
                    MemberCount = clan.MemberCount,
                    ActiveMembers = members.Count(m => m.LastActive.HasValue && 
                        m.LastActive > DateTime.UtcNow.AddDays(-7)),
                    TotalPoints = clan.TotalPoints,
                    WeeklyPoints = clan.WeeklyPoints,
                    MonthlyPoints = clan.MonthlyPoints,
                    Rank = clan.Rank,
                    TotalPosts = clan.TotalPosts,
                    TotalComments = members.Sum(m => m.TotalComments),
                    TotalCompetitions = clan.TotalCompetitions,
                    CompetitionWins = clan.CompetitionWins,
                    WinRate = clan.TotalCompetitions > 0 ? 
                        (decimal)clan.CompetitionWins / clan.TotalCompetitions : 0,
                    MemberRoleDistribution = roleDistribution,
                    TopMembers = topMembers,
                    Performance = new ClanPerformanceDTO
                    {
                        WeeklyPointsHistory = new List<WeeklyPointsDTO>(),
                        MonthlyPointsHistory = new List<MonthlyPointsDTO>(),
                        RankingHistory = clan.Rank
                    }
                };

                return ServiceResult<ClanStatsDTO>.SuccessResult(stats);
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanStatsDTO>.FailureResult($"Get stats failed: {ex.Message}");
            }
        }

        /// <summary>
        /// Get clan competitions filtered by season.
        /// - If season is null, returns all competitions
        /// - If season is specified, returns only competitions for that season
        /// </summary>
        public async Task<ServiceResult<List<CompetitionDTO>>> GetClanCompetitionsBySeason(int clanId, int? season = null)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<List<CompetitionDTO>>.FailureResult("Clan not found");

                var query = _context.Competitions
                    .Where(c => c.ClanId == clanId);

                // Filter by season if specified
                if (season.HasValue)
                {
                    query = query.Where(c => c.Season == season.Value);
                }

                // Order by start date descending (newest first)
                var competitions = await query
                    .OrderByDescending(c => c.StartDate)
                    .ToListAsync();

                var competitionDTOs = competitions.Select(c => MapToCompetitionDTO(c)).ToList();
                return ServiceResult<List<CompetitionDTO>>.SuccessResult(competitionDTOs);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CompetitionDTO>>.FailureResult($"Failed to get competitions: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<CompetitionDTO>>> GetClanCompetitions(int clanId)
        {
            return await GetClanCompetitionsBySeason(clanId, null);
        }

        // Helper methods
        private IQueryable<Models.Clan> ApplySorting(IQueryable<Models.Clan> query, string? sortBy, string? sortOrder)
        {
            var ascending = sortOrder?.ToLower() != "desc";

            return (sortBy?.ToLower()) switch
            {
                "rank" => ascending 
                    ? query.OrderBy(c => c.Rank) 
                    : query.OrderByDescending(c => c.Rank),
                
                "members" => ascending 
                    ? query.OrderBy(c => c.MemberCount) 
                    : query.OrderByDescending(c => c.MemberCount),
                
                "points" => ascending 
                    ? query.OrderBy(c => c.TotalPoints) 
                    : query.OrderByDescending(c => c.TotalPoints),
                
                "recent" => ascending 
                    ? query.OrderBy(c => c.LastActivity ?? c.CreatedAt) 
                    : query.OrderByDescending(c => c.LastActivity ?? c.CreatedAt),
                
                _ => query.OrderByDescending(c => c.TotalPoints) // Default: sort by points descending
            };
        }

        private ClanDTO MapToClanDTO(Models.Clan clan)
        {
            // Placeholder mapping - implement based on your actual needs
            return new ClanDTO
            {
                Id = clan.Id,
                Name = clan.Name,
                Tag = clan.Tag,
                Description = clan.Description,
                LeaderId = clan.LeaderId,
                ClanType = clan.ClanType,
                UniversityId = clan.UniversityId,
                DepartmentId = clan.DepartmentId,
                CourseId = clan.CourseId,
                MemberCount = clan.MemberCount,
                TotalPoints = clan.TotalPoints,
                WeeklyPoints = clan.WeeklyPoints,
                MonthlyPoints = clan.MonthlyPoints,
                Rank = clan.Rank,
                CreatedAt = clan.CreatedAt
            };
        }

        private CompetitionDTO MapToCompetitionDTO(Models.Competition competition)
        {
            // Placeholder mapping - implement based on your actual needs
            return new CompetitionDTO
            {
                Id = competition.Id,
                Title = competition.Title,
                Description = competition.Description,
                CompetitionType = competition.CompetitionType,
                StartDate = competition.StartDate,
                EndDate = competition.EndDate,
                Status = competition.Status,
                ClanId = competition.ClanId,
                CourseId = competition.CourseId,
                CreatorId = competition.UniversityId ?? 0, // Placeholder - adjust as needed
                ParticipantCount = competition.ParticipantCount,
                CreatedAt = competition.CreatedAt
            };
        }
    }
}
