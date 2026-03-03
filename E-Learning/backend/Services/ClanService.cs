using backend.Data;
using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Services
{
    public class ClanService : IClanService
    {
        private readonly ApplicationDbContext _context;

        public ClanService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> HasLeadershipRole(int userId)
        {
            return await _context.ClanMembers
                .AnyAsync(m => m.UserId == userId && (m.Role == "Leader" || m.Role == "CoLeader"));
        }

        public async Task<ServiceResult<ClanDTO>> CreateClan(CreateClanDTO dto, int userId)
        {
            try
            {
                // Leadership exclusivity: a user cannot create a clan if already Leader/CoLeader elsewhere
                var hasLeadership = await HasLeadershipRole(userId);
                if (hasLeadership)
                {
                    return ServiceResult<ClanDTO>.FailureResult("User already holds a leadership role in a clan. Creating a new clan is forbidden.");
                }
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
                    FocusSubjects = dto.FocusSubjects != null ? JsonSerializer.Serialize(dto.FocusSubjects) : null,
                    IsPublic = dto.IsPublic,
                    RequireApproval = dto.RequireApproval,
                    MaxMembers = dto.MaxMembers,
                    JoinCriteria = dto.JoinCriteria,
                    CreatedAt = DateTime.UtcNow,
                    MemberCount = 1 // Leader is first member
                };

                _context.Clans.Add(clan);
                await _context.SaveChangesAsync();

               
                var leaderMember = new Models.ClanMember
                {
                    ClanId = clan.Id,
                    UserId = userId,
                    Role = "Leader",
                    JoinedAt = DateTime.UtcNow,
                    ContributionPoints = 0,
                    WeeklyPoints = 0,
                    MonthlyPoints = 0,
                    LastActive = DateTime.UtcNow
                };

                _context.ClanMembers.Add(leaderMember);
                await _context.SaveChangesAsync();

                // Reload with leader navigation for mapping
                await _context.Entry(clan).Reference(c => c.Leader).LoadAsync();
                return ServiceResult<ClanDTO>.SuccessResult(MapToClanDTO(clan, leaderMember));
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanDTO>.FailureResult($"Create clan failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanDTO>> GetClanById(int clanId, int? currentUserId = null)
        {
            try
            {
                var clan = await _context.Clans
                    .Include(c => c.Leader)
                    .Include(c => c.University)
                    .Include(c => c.Department)
                    .FirstOrDefaultAsync(c => c.Id == clanId);

                if (clan == null)
                    return ServiceResult<ClanDTO>.FailureResult("Clan not found");

                ClanMember? membership = null;
                bool hasPendingRequest = false;
                if (currentUserId.HasValue)
                {
                    membership = await _context.ClanMembers
                        .FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == currentUserId.Value);

                    if (membership == null)
                    {
                        hasPendingRequest = await _context.ClanJoinRequests
                            .AnyAsync(r => r.ClanId == clanId && r.UserId == currentUserId.Value && r.Status == "Pending");
                    }
                }

                return ServiceResult<ClanDTO>.SuccessResult(MapToClanDTO(clan, membership, hasPendingRequest));
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanDTO>.FailureResult($"Get clan failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanDTO>>> GetAllClans(int page, int pageSize, int? currentUserId = null)
        {
            try
            {
                var clans = await _context.Clans
                    .Include(c => c.Leader)
                    .Include(c => c.University)
                    .Include(c => c.Department)
                    .OrderByDescending(c => c.TotalPoints)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var clanIds = clans.Select(c => c.Id).ToList();
                var memberships = currentUserId.HasValue
                    ? await _context.ClanMembers
                        .Where(m => m.UserId == currentUserId.Value && clanIds.Contains(m.ClanId))
                        .ToListAsync()
                    : new List<Models.ClanMember>();

                var clanDTOs = clans.Select(c => MapToClanDTO(c, memberships.FirstOrDefault(m => m.ClanId == c.Id))).ToList();
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
        public async Task<ServiceResult<List<ClanDTO>>> SearchClans(ClanSearchFilterDTO filter, int? currentUserId = null)
        {
            try
            {
                var query = _context.Clans
                    .Include(c => c.Leader)
                    .Include(c => c.University)
                    .Include(c => c.Department)
                    .AsQueryable();

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

                var clanIds = clans.Select(c => c.Id).ToList();
                var memberships = currentUserId.HasValue
                    ? await _context.ClanMembers
                        .Where(m => m.UserId == currentUserId.Value && clanIds.Contains(m.ClanId))
                        .ToListAsync()
                    : new List<Models.ClanMember>();

                var clanDTOs = clans.Select(c => MapToClanDTO(c, memberships.FirstOrDefault(m => m.ClanId == c.Id))).ToList();
                return ServiceResult<List<ClanDTO>>.SuccessResult(clanDTOs);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanDTO>>.FailureResult($"Search failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanDTO>> UpdateClan(int clanId, UpdateClanDTO dto, int actorUserId)
        {
            try
            {
                var clan = await _context.Clans.Include(c => c.Leader).FirstOrDefaultAsync(c => c.Id == clanId);
                if (clan == null)
                    return ServiceResult<ClanDTO>.FailureResult("Clan not found");

                var actorMembership = await _context.ClanMembers.FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == actorUserId);
                if (actorUserId != clan.LeaderId && (actorMembership == null || actorMembership.Role != "CoLeader"))
                    return ServiceResult<ClanDTO>.FailureResult("Only clan leader or co-leader can update clan");

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
                if (dto.FocusSubjects != null)
                    clan.FocusSubjects = JsonSerializer.Serialize(dto.FocusSubjects);

                clan.LastActivity = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return ServiceResult<ClanDTO>.SuccessResult(MapToClanDTO(clan, actorMembership));
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanDTO>.FailureResult($"Update clan failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> DeleteClan(int clanId, int actorUserId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<bool>.FailureResult("Clan not found");

                if (clan.LeaderId != actorUserId)
                    return ServiceResult<bool>.FailureResult("Only clan leader can delete clan");

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

        public async Task<ServiceResult<List<ClanMemberDTO>>> GetClanMembers(int clanId, int? currentUserId = null)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<List<ClanMemberDTO>>.FailureResult("Clan not found");

                var members = await _context.ClanMembers
                    .Include(m => m.User)
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
                    TotalComments = m.TotalComments,
                    IsCurrentUser = currentUserId.HasValue && currentUserId.Value == m.UserId
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

                // Check for existing pending request
                var pendingRequest = await _context.ClanJoinRequests
                    .FirstOrDefaultAsync(r => r.ClanId == clanId && r.UserId == userId && r.Status == "Pending");

                if (pendingRequest != null)
                {
                    return ServiceResult<JoinResponseDTO>.FailureResult("You already have a pending join request for this clan");
                }

                // Private clans (!IsPublic) OR clans with RequireApproval should need approval
                bool needsApproval = !clan.IsPublic || clan.RequireApproval;

                // Create join response
                var joinResponse = new JoinResponseDTO
                {
                    ClanId = clanId,
                    UserId = userId,
                    RequestedAt = DateTime.UtcNow,
                    Status = needsApproval ? "Pending" : "Approved"
                };

                if (needsApproval)
                {
                    var newRequest = new Models.ClanJoinRequest
                    {
                        ClanId = clanId,
                        UserId = userId,
                        Message = request?.Message,
                        Status = "Pending",
                        RequestedAt = DateTime.UtcNow
                    };

                    _context.ClanJoinRequests.Add(newRequest);
                    await _context.SaveChangesAsync();

                    joinResponse.Id = newRequest.Id;
                    return ServiceResult<JoinResponseDTO>.SuccessResult(joinResponse);
                }
                else
                {
                    // Automatically add member to clan (only for public clans without approval requirement)
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

        public async Task<ServiceResult<List<ClanDTO>>> GetMyClans(int userId)
        {
            try
            {
                var memberships = await _context.ClanMembers
                    .Include(m => m.Clan)
                        .ThenInclude(c => c.Leader)
                    .Include(m => m.Clan)
                        .ThenInclude(c => c.University)
                    .Include(m => m.Clan)
                        .ThenInclude(c => c.Department)
                    .Where(m => m.UserId == userId)
                    .ToListAsync();

                var clans = memberships.Select(m => MapToClanDTO(m.Clan, m)).ToList();
                return ServiceResult<List<ClanDTO>>.SuccessResult(clans);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanDTO>>.FailureResult($"Get my clans failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<InvitationDTO>>> GetClanInvitations(int userId)
        {
            try
            {
                // Note: Invitation table is not yet implemented; return empty set for the user
                return ServiceResult<List<InvitationDTO>>.SuccessResult(new List<InvitationDTO>());
            }
            catch (Exception ex)
            {
                return ServiceResult<List<InvitationDTO>>.FailureResult($"Get invitations failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> UpdateMemberRole(int clanId, int memberId, string role, int actorUserId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<bool>.FailureResult("Clan not found");

                var actor = await _context.ClanMembers.FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == actorUserId);
                if (actor == null || (actor.Role != "Leader" && actor.Role != "CoLeader"))
                    return ServiceResult<bool>.FailureResult("Only leader or co-leader can update roles");

                var member = await _context.ClanMembers.FirstOrDefaultAsync(m => m.Id == memberId && m.ClanId == clanId);
                if (member == null)
                    return ServiceResult<bool>.FailureResult("Member not found");

                if (member.Role == "Leader")
                    return ServiceResult<bool>.FailureResult("Leader role cannot be changed");

                // Enforce leadership exclusivity across clans
                if (role == "Leader" || role == "CoLeader")
                {
                    var hasLeadershipElsewhere = await _context.ClanMembers
                        .AnyAsync(m => m.UserId == member.UserId && (m.Role == "Leader" || m.Role == "CoLeader") && m.ClanId != clanId);

                    if (hasLeadershipElsewhere)
                        return ServiceResult<bool>.FailureResult("User already has a leadership role in another clan");
                }

                member.Role = role;
                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Update member role failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> RemoveMember(int clanId, int memberId, int actorUserId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<bool>.FailureResult("Clan not found");

                var actor = await _context.ClanMembers.FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == actorUserId);
                if (actor == null || (actor.Role != "Leader" && actor.Role != "CoLeader"))
                    return ServiceResult<bool>.FailureResult("Only leader or co-leader can remove members");

                var member = await _context.ClanMembers.FirstOrDefaultAsync(m => m.Id == memberId && m.ClanId == clanId);
                if (member == null)
                    return ServiceResult<bool>.FailureResult("Member not found");

                if (member.Role == "Leader")
                    return ServiceResult<bool>.FailureResult("Cannot remove clan leader");

                _context.ClanMembers.Remove(member);
                clan.MemberCount = Math.Max(0, clan.MemberCount - 1);
                await _context.SaveChangesAsync();
                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Remove member failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> InviteUser(int clanId, int actorUserId, int invitedUserId)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<bool>.FailureResult("Clan not found");

                // Check if inviter is a leader or admin
                var inviter = await _context.ClanMembers
                    .FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == actorUserId);

                if (inviter == null || (inviter.Role != "Leader" && inviter.Role != "CoLeader"))
                    return ServiceResult<bool>.FailureResult("Only leaders can invite users");

                // Check if invited user is already a member
                var existingMember = await _context.ClanMembers
                    .FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == invitedUserId);

                if (existingMember != null)
                    return ServiceResult<bool>.FailureResult("User is already a member of this clan");

                // For now, directly add member (acts as immediate acceptance)
                var newMember = new Models.ClanMember
                {
                    ClanId = clanId,
                    UserId = invitedUserId,
                    Role = "Member",
                    JoinedAt = DateTime.UtcNow,
                    LastActive = DateTime.UtcNow
                };

                _context.ClanMembers.Add(newMember);
                clan.MemberCount++;
                await _context.SaveChangesAsync();

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

                var computedTotalPoints = members.Sum(m => m.ContributionPoints);
                var computedTotalExp = members.Sum(m => m.User?.Exp ?? 0);
                var computedWeeklyPoints = members.Sum(m => m.WeeklyPoints);
                var computedMonthlyPoints = members.Sum(m => m.MonthlyPoints);

                var resolvedTotalPoints = clan.TotalPoints > 0 ? clan.TotalPoints : computedTotalPoints;
                var resolvedWeeklyPoints = clan.WeeklyPoints > 0 ? clan.WeeklyPoints : computedWeeklyPoints;
                var resolvedMonthlyPoints = clan.MonthlyPoints > 0 ? clan.MonthlyPoints : computedMonthlyPoints;

                if (clan.TotalPoints != resolvedTotalPoints ||
                    clan.WeeklyPoints != resolvedWeeklyPoints ||
                    clan.MonthlyPoints != resolvedMonthlyPoints ||
                    clan.MemberCount != members.Count)
                {
                    clan.TotalPoints = resolvedTotalPoints;
                    clan.WeeklyPoints = resolvedWeeklyPoints;
                    clan.MonthlyPoints = resolvedMonthlyPoints;
                    clan.MemberCount = members.Count;
                    await _context.SaveChangesAsync();
                }

                var stats = new ClanStatsDTO
                {
                    MemberCount = members.Count,    
                    ActiveMembers = members.Count(m => m.LastActive.HasValue && 
                        m.LastActive > DateTime.UtcNow.AddDays(-7)),
                    TotalPoints = resolvedTotalPoints,
                    TotalExp = computedTotalExp,
                    WeeklyPoints = resolvedWeeklyPoints,
                    MonthlyPoints = resolvedMonthlyPoints,
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

                var clanRegisteredCompetitionIds = _context.CompetitionRegistrations
                    .Where(r => r.Status != "Rejected")
                    .Join(
                        _context.Teams.Where(t => t.ClanId == clanId),
                        r => r.TeamId,
                        t => t.Id,
                        (r, t) => r.CompetitionId
                    )
                    .Distinct();

                var query = _context.Competitions
                    .Where(c => c.ClanId == clanId || clanRegisteredCompetitionIds.Contains(c.Id));

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

        public async Task<ServiceResult<List<ClanActivityDTO>>> GetClanActivities(int clanId, int page, int pageSize)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<List<ClanActivityDTO>>.FailureResult("Clan not found");

                // Use posts as simple activity feed for now
                var activities = await _context.Posts
                    .Where(p => p.ClanId == clanId)
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(p => new ClanActivityDTO
                    {
                        Id = p.Id,
                        ActivityType = "PostCreated",
                        Description = p.Title,
                        UserId = p.UserId,
                        UserName = p.User != null ? $"{p.User.FirstName} {p.User.LastName}" : "Unknown",
                        PostId = p.Id,
                        PostTitle = p.Title,
                        PointsEarned = 0,
                        CreatedAt = p.CreatedAt
                    })
                    .ToListAsync();

                return ServiceResult<List<ClanActivityDTO>>.SuccessResult(activities);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanActivityDTO>>.FailureResult($"Get activities failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<PostDTO>>> GetClanPosts(int clanId, int page, int pageSize)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<List<PostDTO>>.FailureResult("Clan not found");

                var posts = await _context.Posts
                    .Include(p => p.User)
                    .Include(p => p.Clan)
                    .Where(p => p.ClanId == clanId)
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var postDtos = posts.Select(MapToPostDTO).ToList();
                return ServiceResult<List<PostDTO>>.SuccessResult(postDtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<PostDTO>>.FailureResult($"Get clan posts failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanLeaderboardDTO>>> GetClanLeaderboard(string? timeframe, int? universityId, int? departmentId, int page, int pageSize)
        {
            try
            {
                var query = _context.Clans
                    .Include(c => c.Leader)
                    .Include(c => c.University)
                    .Include(c => c.Department)
                    .AsQueryable();

                if (universityId.HasValue)
                    query = query.Where(c => c.UniversityId == universityId.Value);
                if (departmentId.HasValue)
                    query = query.Where(c => c.DepartmentId == departmentId.Value);

                query = timeframe?.ToLower() switch
                {
                    "weekly" => query.OrderByDescending(c => c.WeeklyPoints),
                    "monthly" => query.OrderByDescending(c => c.MonthlyPoints),
                    _ => query.OrderByDescending(c => c.TotalPoints)
                };

                var clans = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var leaderboard = clans.Select((c, index) => new ClanLeaderboardDTO
                {
                    Rank = (page - 1) * pageSize + index + 1,
                    Clan = MapToClanDTO(c),
                    TotalPoints = c.TotalPoints,
                    WeeklyPoints = c.WeeklyPoints,
                    MonthlyPoints = c.MonthlyPoints,
                    MemberCount = c.MemberCount,
                    CompetitionWins = c.CompetitionWins,
                    AverageMemberPoints = c.MemberCount > 0 ? (decimal)c.TotalPoints / c.MemberCount : 0
                }).ToList();

                return ServiceResult<List<ClanLeaderboardDTO>>.SuccessResult(leaderboard);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanLeaderboardDTO>>.FailureResult($"Get leaderboard failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanDTO>>> GetTopClans(int count)
        {
            try
            {
                var clans = await _context.Clans
                    .Include(c => c.Leader)
                    .Include(c => c.University)
                    .Include(c => c.Department)
                    .OrderByDescending(c => c.TotalPoints)
                    .Take(count)
                    .ToListAsync();

                var result = clans.Select(c => MapToClanDTO(c)).ToList();
                return ServiceResult<List<ClanDTO>>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanDTO>>.FailureResult($"Get top clans failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<ClanJoinRequestDTO>>> GetPendingJoinRequests(int clanId, int actorUserId)
        {
            try
            {
                var actor = await _context.ClanMembers.FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == actorUserId);
                if (actor == null || (actor.Role != "Leader" && actor.Role != "CoLeader"))
                    return ServiceResult<List<ClanJoinRequestDTO>>.FailureResult("Only leaders can view pending join requests");

                var pending = await _context.ClanJoinRequests
                    .Include(r => r.User)
                    .Where(r => r.ClanId == clanId && r.Status == "Pending")
                    .OrderBy(r => r.RequestedAt)
                    .ToListAsync();

                var dto = pending.Select(r => new ClanJoinRequestDTO
                {
                    Id = r.Id,
                    ClanId = r.ClanId,
                    UserId = r.UserId,
                    UserName = r.User != null ? $"{r.User.FirstName} {r.User.LastName}" : "Unknown",
                    ProfileImageUrl = r.User?.ProfileImageUrl,
                    Status = r.Status,
                    Message = r.Message,
                    RequestedAt = r.RequestedAt,
                    ReviewedAt = r.ReviewedAt,
                    ReviewedByUserId = r.ReviewedByUserId
                }).ToList();

                return ServiceResult<List<ClanJoinRequestDTO>>.SuccessResult(dto);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanJoinRequestDTO>>.FailureResult($"Get pending requests failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> DecideJoinRequest(int clanId, int requestId, int actorUserId, bool approve)
        {
            try
            {
                var clan = await _context.Clans.FindAsync(clanId);
                if (clan == null)
                    return ServiceResult<bool>.FailureResult("Clan not found");

                var actor = await _context.ClanMembers.FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == actorUserId);
                if (actor == null || (actor.Role != "Leader" && actor.Role != "CoLeader"))
                    return ServiceResult<bool>.FailureResult("Only leaders can take action on join requests");

                var request = await _context.ClanJoinRequests
                    .FirstOrDefaultAsync(r => r.Id == requestId && r.ClanId == clanId);

                if (request == null)
                    return ServiceResult<bool>.FailureResult("Join request not found");

                if (request.Status != "Pending")
                    return ServiceResult<bool>.FailureResult("Join request has already been processed");

                if (approve)
                {
                    // Ensure clan capacity
                    if (clan.MemberCount >= clan.MaxMembers)
                        return ServiceResult<bool>.FailureResult("Clan is at maximum capacity");

                    // Avoid duplicates
                    var existingMember = await _context.ClanMembers
                        .FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == request.UserId);

                    if (existingMember == null)
                    {
                        var newMember = new Models.ClanMember
                        {
                            ClanId = clanId,
                            UserId = request.UserId,
                            Role = "Member",
                            JoinedAt = DateTime.UtcNow,
                            LastActive = DateTime.UtcNow
                        };

                        _context.ClanMembers.Add(newMember);
                        clan.MemberCount++;
                    }

                    request.Status = "Approved";
                }
                else
                {
                    request.Status = "Rejected";
                }

                request.ReviewedAt = DateTime.UtcNow;
                request.ReviewedByUserId = actorUserId;

                await _context.SaveChangesAsync();
                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to process join request: {ex.Message}");
            }
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

        private ClanDTO MapToClanDTO(Models.Clan clan, Models.ClanMember? currentMembership = null, bool hasPendingJoinRequest = false)
        {
            var focusSubjects = new List<string>();
            if (!string.IsNullOrWhiteSpace(clan.FocusSubjects))
            {
                try
                {
                    focusSubjects = JsonSerializer.Deserialize<List<string>>(clan.FocusSubjects) ?? new List<string>();
                }
                catch
                {
                    // fallback to comma split
                    focusSubjects = clan.FocusSubjects.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
                }
            }

            var leaderName = clan.Leader != null
                ? $"{clan.Leader.FirstName} {clan.Leader.LastName}"
                : "Unknown";

            return new ClanDTO
            {
                Id = clan.Id,
                Name = clan.Name,
                Tag = clan.Tag,
                Description = clan.Description,
                LeaderId = clan.LeaderId,
                LeaderName = leaderName,
                ProfileImageUrl = clan.Leader?.ProfileImageUrl,
                LogoUrl = clan.LogoUrl,
                BannerUrl = clan.BannerUrl,
                Motto = clan.Motto,
                ClanType = clan.ClanType,
                UniversityId = clan.UniversityId,
                UniversityName = clan.University?.Name,
                DepartmentId = clan.DepartmentId,
                DepartmentName = clan.Department?.Name,
                CourseId = clan.CourseId,
                FocusSubjects = focusSubjects,
                IsPublic = clan.IsPublic,
                RequireApproval = clan.RequireApproval,
                MaxMembers = clan.MaxMembers,
                JoinCriteria = clan.JoinCriteria,
                MemberCount = clan.MemberCount,
                TotalPoints = clan.TotalPoints,
                WeeklyPoints = clan.WeeklyPoints,
                MonthlyPoints = clan.MonthlyPoints,
                Rank = clan.Rank,
                TotalCompetitions = clan.TotalCompetitions,
                CompetitionWins = clan.CompetitionWins,
                TotalPosts = clan.TotalPosts,
                IsMember = currentMembership != null,
                MemberRole = currentMembership?.Role,
                HasPendingJoinRequest = hasPendingJoinRequest,
                CreatedAt = clan.CreatedAt,
                LastActivity = clan.LastActivity
            };
        }

        private PostDTO MapToPostDTO(Models.Post post)
        {
            return new PostDTO
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                UserId = post.UserId,
                UserName = post.User != null ? $"{post.User.FirstName} {post.User.LastName}" : "Unknown",
                ProfileImageUrl = post.User?.ProfileImageUrl,
                UniversityId = post.UniversityId,
                DepartmentId = post.DepartmentId,
                CourseId = post.CourseId,
                ClanId = post.ClanId,
                ClanName = post.Clan?.Name,
                PostType = post.PostType,
                IsExamRelated = post.IsExamRelated,
                ExamTags = string.IsNullOrWhiteSpace(post.ExamTags) ? new List<string>() : post.ExamTags.Split(',').ToList(),
                Subject = post.Subject,
                MediaUrl = post.MediaUrl,
                MediaType = post.MediaType,
                UpvoteCount = post.UpvoteCount,
                DownvoteCount = post.DownvoteCount,
                CommentCount = post.CommentCount,
                ViewCount = post.ViewCount,
                ShareCount = post.ShareCount,
                IsPinned = post.IsPinned,
                IsClosed = post.IsClosed,
                IsReported = post.IsReported,
                BestAnswerId = post.BestAnswerId,
                HasTeacherAnswer = post.HasTeacherAnswer,
                TeacherAnswerId = post.TeacherAnswerId,
                HasUpvoted = false,
                HasDownvoted = false,
                Tags = new List<string>(),
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                LastActivity = post.LastActivity
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

        // ===== HELPER METHODS =====

        /// <summary>
        /// Get user's clan membership to check role-based permissions
        /// </summary>
        public async Task<Models.ClanMember?> GetUserClanMembership(int clanId, int userId)
        {
            return await _context.ClanMembers
                .FirstOrDefaultAsync(m => m.ClanId == clanId && m.UserId == userId);
        }

        // ===== ANNOUNCEMENTS =====
        
        public async Task<ServiceResult<List<ClanAnnouncementDTO>>> GetClanAnnouncements(int clanId, int? currentUserId, int page, int pageSize)
        {
            try
            {
                var announcements = await _context.ClanAnnouncements
                    .Where(a => a.ClanId == clanId)
                    .OrderByDescending(a => a.IsPinned)
                    .ThenByDescending(a => a.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Include(a => a.User)
                    .Include(a => a.Reactions)
                    .ThenInclude(r => r.User)
                    .ToListAsync();

                var dtos = announcements.Select(a => new ClanAnnouncementDTO
                {
                    Id = a.Id,
                    ClanId = a.ClanId,
                    UserId = a.UserId,
                    UserName = a.User.Username,
                    UserProfileImage = a.User.ProfileImageUrl,
                    UserRole = _context.ClanMembers.FirstOrDefault(m => m.ClanId == clanId && m.UserId == a.UserId)?.Role,
                    Title = a.Title,
                    Content = a.Content,
                    Type = a.Type ?? "General",
                    IsPinned = a.IsPinned,
                    ViewCount = a.ViewCount,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    Reactions = a.Reactions
                        .GroupBy(r => r.Emoji)
                        .Select(g => new ReactionSummaryDTO
                        {
                            Emoji = g.Key,
                            Count = g.Count(),
                            UserNames = g.Select(r => r.User.Username).ToList()
                        }).ToList(),
                    MyReaction = currentUserId.HasValue 
                        ? a.Reactions.FirstOrDefault(r => r.UserId == currentUserId.Value)?.Emoji 
                        : null
                }).ToList();

                return ServiceResult<List<ClanAnnouncementDTO>>.SuccessResult(dtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<ClanAnnouncementDTO>>.FailureResult($"Error fetching announcements: {ex.Message}");
            }
        }

        public async Task<ServiceResult<ClanAnnouncementDTO>> CreateAnnouncement(int clanId, int userId, CreateAnnouncementDTO dto)
        {
            try
            {
                var membership = await GetUserClanMembership(clanId, userId);
                if (membership == null || (membership.Role != "Leader" && membership.Role != "CoLeader"))
                    return ServiceResult<ClanAnnouncementDTO>.FailureResult("Only Leaders and Co-Leaders can create announcements");

                var announcement = new Models.ClanAnnouncement
                {
                    ClanId = clanId,
                    UserId = userId,
                    Title = dto.Title,
                    Content = dto.Content,
                    Type = dto.Type,
                    IsPinned = dto.IsPinned,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ClanAnnouncements.Add(announcement);
                await _context.SaveChangesAsync();

                var user = await _context.Users.FindAsync(userId);
                var announcementDto = new ClanAnnouncementDTO
                {
                    Id = announcement.Id,
                    ClanId = announcement.ClanId,
                    UserId = announcement.UserId,
                    UserName = user?.Username ?? "",
                    UserProfileImage = user?.ProfileImageUrl,
                    UserRole = membership.Role,
                    Title = announcement.Title,
                    Content = announcement.Content,
                    Type = announcement.Type ?? "General",
                    IsPinned = announcement.IsPinned,
                    ViewCount = announcement.ViewCount,
                    CreatedAt = announcement.CreatedAt,
                    Reactions = new List<ReactionSummaryDTO>()
                };

                return ServiceResult<ClanAnnouncementDTO>.SuccessResult(announcementDto);
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanAnnouncementDTO>.FailureResult($"Error creating announcement: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> ReactToAnnouncement(int announcementId, int userId, string emoji)
        {
            try
            {
                var existing = await _context.ClanAnnouncementReactions
                    .FirstOrDefaultAsync(r => r.AnnouncementId == announcementId && r.UserId == userId);

                if (existing != null)
                {
                    if (existing.Emoji == emoji)
                    {
                        _context.ClanAnnouncementReactions.Remove(existing);
                    }
                    else
                    {
                        existing.Emoji = emoji;
                    }
                }
                else
                {
                    var reaction = new Models.ClanAnnouncementReaction
                    {
                        AnnouncementId = announcementId,
                        UserId = userId,
                        Emoji = emoji,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.ClanAnnouncementReactions.Add(reaction);
                }

                await _context.SaveChangesAsync();
                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Error reacting to announcement: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> RemoveAnnouncementReaction(int announcementId, int userId)
        {
            try
            {
                var reaction = await _context.ClanAnnouncementReactions
                    .FirstOrDefaultAsync(r => r.AnnouncementId == announcementId && r.UserId == userId);

                if (reaction != null)
                {
                    _context.ClanAnnouncementReactions.Remove(reaction);
                    await _context.SaveChangesAsync();
                }

                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Error removing reaction: {ex.Message}");
            }
        }

        // ===== COMMUNITY POSTS =====

        public async Task<ServiceResult<ClanPostDTO>> CreateClanPost(int clanId, int userId, CreateClanPostDTO dto)
        {
            try
            {
                var membership = await GetUserClanMembership(clanId, userId);
                if (membership == null)
                    return ServiceResult<ClanPostDTO>.FailureResult("You must be a clan member to post");

                var post = new Models.Post
                {
                    Title = string.IsNullOrWhiteSpace(dto.Title) ? (dto.Content?.Length > 100 ? dto.Content.Substring(0, 100) : dto.Content) : dto.Title,
                    Content = dto.Content,
                    UserId = userId,
                    ClanId = clanId,
                    PostType = "Discussion",
                    MediaUrl = dto.MediaUrl,
                    MediaType = dto.MediaType,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Posts.Add(post);
                await _context.SaveChangesAsync();

                var user = await _context.Users.FindAsync(userId);
                var postDto = new ClanPostDTO
                {
                    Id = post.Id,
                    ClanId = post.ClanId.Value,
                    UserId = post.UserId,
                    UserName = user?.Username ?? "",
                    UserProfileImage = user?.ProfileImageUrl,
                    UserRole = membership.Role,
                    Title = post.Title,
                    Content = post.Content,
                    MediaUrl = post.MediaUrl,
                    MediaType = post.MediaType,
                    UpvoteCount = post.UpvoteCount,
                    DownvoteCount = post.DownvoteCount,
                    CommentCount = post.CommentCount,
                    ViewCount = post.ViewCount,
                    IsPinned = post.IsPinned,
                    CreatedAt = post.CreatedAt,
                    Reactions = new List<ReactionSummaryDTO>()
                };

                return ServiceResult<ClanPostDTO>.SuccessResult(postDto);
            }
            catch (Exception ex)
            {
                return ServiceResult<ClanPostDTO>.FailureResult($"Error creating post: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> ReactToPost(int postId, int userId, string emoji)
        {
            try
            {
                var existing = await _context.PostReactions
                    .FirstOrDefaultAsync(r => r.PostId == postId && r.UserId == userId);

                if (existing != null)
                {
                    if (existing.Emoji == emoji)
                    {
                        _context.PostReactions.Remove(existing);
                    }
                    else
                    {
                        existing.Emoji = emoji;
                    }
                }
                else
                {
                    var reaction = new Models.PostReaction
                    {
                        PostId = postId,
                        UserId = userId,
                        Emoji = emoji,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.PostReactions.Add(reaction);
                }

                await _context.SaveChangesAsync();
                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Error reacting to post: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> VoteOnPost(int postId, int userId, int vote)
        {
            try
            {
                var existingVote = await _context.PostVotes
                    .FirstOrDefaultAsync(v => v.PostId == postId && v.UserId == userId);

                var post = await _context.Posts.FindAsync(postId);
                if (post == null)
                    return ServiceResult<bool>.FailureResult("Post not found");

                if (existingVote != null)
                {
                    // Update vote counts
                    if (existingVote.VoteType == 1) post.UpvoteCount--;
                    else post.DownvoteCount--;

                    if (existingVote.VoteType == vote)
                    {
                        // Remove vote if clicking same button
                        _context.PostVotes.Remove(existingVote);
                    }
                    else
                    {
                        // Change vote
                        existingVote.VoteType = vote;
                        if (vote == 1) post.UpvoteCount++;
                        else post.DownvoteCount++;
                    }
                }
                else
                {
                    // New vote
                    var newVote = new Models.PostVote
                    {
                        PostId = postId,
                        UserId = userId,
                        VoteType = vote,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.PostVotes.Add(newVote);

                    if (vote == 1) post.UpvoteCount++;
                    else post.DownvoteCount++;
                }

                await _context.SaveChangesAsync();
                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Error voting on post: {ex.Message}");
            }
        }
    }
}
