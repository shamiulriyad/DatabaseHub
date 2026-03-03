using backend.Data;
using backend.DTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace backend.Services
{
    public class CommunityService : ICommunityService
    {
        private readonly ApplicationDbContext _context;
        private readonly Microsoft.AspNetCore.SignalR.IHubContext<backend.Hubs.CommunityHub>? _hubContext;
        private readonly INotificationService? _notificationService;
        private const string AdminForumSectionType = "AdminForum";
        private const string AdminForumType = "admin_forum";
        private const string PublicPostType = "public_post";

        public CommunityService(
            ApplicationDbContext context,
            Microsoft.AspNetCore.SignalR.IHubContext<backend.Hubs.CommunityHub>? hubContext = null,
            INotificationService? notificationService = null)
        {
            _context = context;
            _hubContext = hubContext;
            _notificationService = notificationService;
        }

        public Task<ServiceResult<PostDTO>> CreateForumPost(CreatePostDTO dto, int userId)
        {
            dto.SectionType = AdminForumSectionType;
            dto.Type = AdminForumType;
            dto.PostType = string.IsNullOrWhiteSpace(dto.PostType) ? AdminForumType : dto.PostType;
            return CreatePost(dto, userId);
        }

        public Task<ServiceResult<PostDTO>> CreatePublicPost(CreatePostDTO dto, int userId)
        {
            dto.SectionType = null;
            dto.Type = PublicPostType;
            if (string.Equals(dto.PostType, AdminForumType, StringComparison.OrdinalIgnoreCase))
            {
                dto.PostType = "Discussion";
            }
            return CreatePost(dto, userId);
        }

        public async Task<ServiceResult<PostDTO>> CreatePost(CreatePostDTO dto, int userId)
        {
            // Validate DTO
            if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Content))
                return ServiceResult<PostDTO>.FailureResult("Title and Content are required.");

            var author = _context.Users.Find(userId);
            if (author == null)
                return ServiceResult<PostDTO>.FailureResult("User not found");

            var isAdminForum = string.Equals(dto.SectionType, AdminForumSectionType, StringComparison.OrdinalIgnoreCase);
            if (isAdminForum && !author.IsAdmin)
                return ServiceResult<PostDTO>.FailureResult("Only admins can create forum announcements.");

            var normalizedType = string.Equals(dto.Type, AdminForumType, StringComparison.OrdinalIgnoreCase) || isAdminForum
                ? AdminForumType
                : PublicPostType;

            if (normalizedType == AdminForumType && !author.IsAdmin)
                return ServiceResult<PostDTO>.FailureResult("Only admins can create forum announcements.");


            var post = new Models.Post
            {
                Title = dto.Title,
                Content = dto.Content,
                UserId = userId,
                UniversityId = dto.UniversityId,
                DepartmentId = dto.DepartmentId,
                CourseId = dto.CourseId,
                ClanId = dto.ClanId,
                PostType = string.IsNullOrWhiteSpace(dto.PostType)
                    ? (normalizedType == AdminForumType ? AdminForumType : "Discussion")
                    : dto.PostType,
                Type = normalizedType,
                IsExamRelated = dto.IsExamRelated,
                ExamTags = dto.ExamTags != null ? System.Text.Json.JsonSerializer.Serialize(dto.ExamTags) : null,
                Subject = dto.Subject,
                MediaUrl = dto.MediaUrl,
                MediaType = dto.MediaType,
                SectionType = normalizedType == AdminForumType ? AdminForumSectionType : dto.SectionType,
                UpvoteCount = 0,
                DownvoteCount = 0,
                CommentCount = 0,
                ViewCount = 0,
                ShareCount = 0,
                IsPinned = false,
                IsClosed = false,
                IsReported = false,
                ReportCount = 0,
                CreatedAt = DateTime.UtcNow,
                LastActivity = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            _context.SaveChanges();

            // Map to PostDTO (simplified, add more fields as needed)
            // Populate author info from Users table to ensure authorship is always from authenticated user

            var postDto = new DTOs.PostDTO
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                UserId = post.UserId,
                UserName = author != null ? (author.FirstName + " " + author.LastName) : "Anonymous",
                ProfileImageUrl = author?.ProfileImageUrl,
                PostType = post.PostType,
                Type = post.Type,
                IsExamRelated = post.IsExamRelated,
                ExamTags = dto.ExamTags ?? new List<string>(),
                Subject = post.Subject,
                MediaUrl = post.MediaUrl,
                MediaType = post.MediaType,
                UpvoteCount = post.UpvoteCount,
                DownvoteCount = post.DownvoteCount,
                CommentCount = post.CommentCount,
                CreatedAt = post.CreatedAt
                ,
                SectionType = post.SectionType
            };

            if (normalizedType == AdminForumType && _notificationService != null)
            {
                try
                {
                    var userIds = _context.Users.Select(u => u.Id).ToList();
                    foreach (var recipientId in userIds)
                    {
                        await _notificationService.CreateNotification(
                            recipientId,
                            "community_forum_post",
                            "New admin forum announcement",
                            post.Title,
                            "/community"
                        );
                    }
                }
                catch
                {
                }
            }

            // Broadcast real-time event if hub is available
            try
            {
                if (_hubContext != null)
                {
                    // Use SendAsync if available; fall back to SendCoreAsync to avoid missing extension method in some target frameworks
                    try
                    {
                        await _hubContext.Clients.All.SendAsync("PostCreated", postDto);
                    }
                    catch (System.MissingMethodException)
                    {
                        await _hubContext.Clients.All.SendCoreAsync("PostCreated", new object[] { postDto });
                    }
                }
            }
            catch
            {
                // Swallow hub errors to avoid breaking post creation
            }

            return ServiceResult<DTOs.PostDTO>.SuccessResult(postDto, "Post created successfully");
        }

        public Task<ServiceResult<PostDTO>> GetPostById(int postId)
        {
            var post = _context.Posts.Find(postId);
            if (post == null)
                return Task.FromResult(ServiceResult<PostDTO>.FailureResult("Post not found"));
            // Build a PostDetailDTO including author and comments so frontend can render full post page
            var authorEntity = _context.Users.Find(post.UserId);

            var postDto = new DTOs.PostDetailDTO
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                UserId = post.UserId,
                UserName = authorEntity != null ? (authorEntity.FirstName + " " + authorEntity.LastName) : null,
                ProfileImageUrl = authorEntity?.ProfileImageUrl,
                UpvoteCount = post.UpvoteCount,
                DownvoteCount = post.DownvoteCount,
                PostType = post.PostType,
                IsExamRelated = post.IsExamRelated,
                ExamTags = post.ExamTags != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(post.ExamTags) ?? new List<string>() : new List<string>(),
                Subject = post.Subject,
                MediaUrl = post.MediaUrl,
                MediaType = post.MediaType,
                CreatedAt = post.CreatedAt,
                SectionType = post.SectionType,
                // Author DTO
                Author = authorEntity != null ? new DTOs.UserDTO {
                    Id = authorEntity.Id,
                    Username = authorEntity.Username,
                    Email = authorEntity.Email,
                    FirstName = authorEntity.FirstName,
                    LastName = authorEntity.LastName,
                    ProfileImageUrl = authorEntity.ProfileImageUrl,
                    CoverImageUrl = authorEntity.CoverImageUrl,
                    CreatedAt = authorEntity.CreatedAt
                }! : null
            };

            // Load comments for this post (top-level only)
            var comments = _context.Comments.Where(c => c.PostId == postId && c.ParentCommentId == null)
                .OrderByDescending(c => c.CreatedAt)
                .ToList();

            var commentDtos = comments.Select(comment => {
                var author = _context.Users.Find(comment.UserId);
                return new DTOs.CommentDTO
                {
                    Id = comment.Id,
                    Content = comment.Content,
                    UserId = comment.UserId,
                    UserName = author != null ? (author.FirstName + " " + author.LastName) : null,
                    ProfileImageUrl = author?.ProfileImageUrl,
                    PostId = comment.PostId,
                    ParentCommentId = comment.ParentCommentId,
                    Depth = comment.Depth,
                    UpvoteCount = comment.UpvoteCount,
                    DownvoteCount = comment.DownvoteCount,
                    ReplyCount = comment.ReplyCount,
                    IsAnswer = comment.IsAnswer,
                    IsTeacherAnswer = comment.IsTeacherAnswer,
                    IsBestAnswer = comment.IsBestAnswer,
                    CreatedAt = comment.CreatedAt
                };
            }).ToList();

            postDto.Comments = commentDtos;
            postDto.CommentCount = commentDtos.Count;

            // Ensure detail counts are present
            postDto.UpvoteCount = post.UpvoteCount;
            postDto.DownvoteCount = post.DownvoteCount;

            return Task.FromResult(ServiceResult<PostDTO>.SuccessResult(postDto));
        }

        public Task<ServiceResult<List<PostDTO>>> GetAllPosts(int page, int pageSize, string? sectionType = null)
        {
            var query = _context.Posts.AsQueryable();

            if (!string.IsNullOrWhiteSpace(sectionType))
            {
                // If a sectionType is requested, only return posts for that section
                query = query.Where(p => p.SectionType == sectionType);
            }
            else
            {
                // Default list returns only public posts
                query = query.Where(p =>
                    (p.Type == PublicPostType || string.IsNullOrEmpty(p.Type)) &&
                    (string.IsNullOrEmpty(p.SectionType) || p.SectionType != AdminForumSectionType));
            }

            var posts = query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var postDtos = posts.Select(post => new DTOs.PostDTO
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                UserId = post.UserId,
                UserName = _context.Users.Find(post.UserId) != null ? (_context.Users.Find(post.UserId).FirstName + " " + _context.Users.Find(post.UserId).LastName) : null,
                ProfileImageUrl = _context.Users.Find(post.UserId)?.ProfileImageUrl,
                PostType = post.PostType,
                Type = string.IsNullOrWhiteSpace(post.Type) ? PublicPostType : post.Type,
                IsExamRelated = post.IsExamRelated,
                ExamTags = post.ExamTags != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(post.ExamTags) ?? new List<string>() : new List<string>(),
                Subject = post.Subject,
                MediaUrl = post.MediaUrl,
                MediaType = post.MediaType,
                SectionType = post.SectionType,
                UpvoteCount = post.UpvoteCount,
                DownvoteCount = post.DownvoteCount,
                CommentCount = post.CommentCount,
                CreatedAt = post.CreatedAt
            }).ToList();

            return Task.FromResult(ServiceResult<List<PostDTO>>.SuccessResult(postDtos));
        }

        public Task<ServiceResult<List<PostDTO>>> GetForumPosts(int page, int pageSize)
        {
            var posts = _context.Posts
                .Where(p => p.Type == AdminForumType || p.SectionType == AdminForumSectionType)
                .OrderByDescending(p => p.IsPinned)
                .ThenByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var postDtos = posts.Select(post => {
                var author = _context.Users.Find(post.UserId);
                return new DTOs.PostDTO
                {
                    Id = post.Id,
                    Title = post.Title,
                    Content = post.Content,
                    UserId = post.UserId,
                    UserName = author != null ? (author.FirstName + " " + author.LastName) : null,
                    ProfileImageUrl = author?.ProfileImageUrl,
                    PostType = post.PostType,
                    Type = AdminForumType,
                    IsExamRelated = post.IsExamRelated,
                    ExamTags = post.ExamTags != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(post.ExamTags) ?? new List<string>() : new List<string>(),
                    Subject = post.Subject,
                    MediaUrl = post.MediaUrl,
                    MediaType = post.MediaType,
                    SectionType = AdminForumSectionType,
                    UpvoteCount = post.UpvoteCount,
                    DownvoteCount = post.DownvoteCount,
                    CommentCount = post.CommentCount,
                    CreatedAt = post.CreatedAt
                };
            }).ToList();

            return Task.FromResult(ServiceResult<List<PostDTO>>.SuccessResult(postDtos));
        }

        public Task<ServiceResult<int>> GetForumPostsCount()
        {
            var count = _context.Posts.Count(p => p.Type == AdminForumType || p.SectionType == AdminForumSectionType);
            return Task.FromResult(ServiceResult<int>.SuccessResult(count));
        }

        public Task<ServiceResult<List<PostDTO>>> GetPublicPosts(int page, int pageSize)
        {
            var posts = _context.Posts
                .Where(p =>
                    (p.Type == PublicPostType || string.IsNullOrEmpty(p.Type)) &&
                    (string.IsNullOrEmpty(p.SectionType) || p.SectionType != AdminForumSectionType))
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var postDtos = posts.Select(post => {
                var author = _context.Users.Find(post.UserId);
                return new DTOs.PostDTO
                {
                    Id = post.Id,
                    Title = post.Title,
                    Content = post.Content,
                    UserId = post.UserId,
                    UserName = author != null ? (author.FirstName + " " + author.LastName) : null,
                    ProfileImageUrl = author?.ProfileImageUrl,
                    PostType = post.PostType,
                    Type = PublicPostType,
                    IsExamRelated = post.IsExamRelated,
                    ExamTags = post.ExamTags != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(post.ExamTags) ?? new List<string>() : new List<string>(),
                    Subject = post.Subject,
                    MediaUrl = post.MediaUrl,
                    MediaType = post.MediaType,
                    SectionType = post.SectionType,
                    UpvoteCount = post.UpvoteCount,
                    DownvoteCount = post.DownvoteCount,
                    CommentCount = post.CommentCount,
                    CreatedAt = post.CreatedAt
                };
            }).ToList();

            return Task.FromResult(ServiceResult<List<PostDTO>>.SuccessResult(postDtos));
        }

        public Task<ServiceResult<int>> GetPublicPostsCount()
        {
            var count = _context.Posts.Count(p =>
                (p.Type == PublicPostType || string.IsNullOrEmpty(p.Type)) &&
                (string.IsNullOrEmpty(p.SectionType) || p.SectionType != AdminForumSectionType));
            return Task.FromResult(ServiceResult<int>.SuccessResult(count));
        }

        public Task<ServiceResult<PostDTO>> UpdatePost(int postId, UpdatePostDTO dto, int actorUserId)
        {
            var post = _context.Posts.Find(postId);
            if (post == null)
                return Task.FromResult(ServiceResult<PostDTO>.FailureResult("Post not found"));

            var actor = _context.Users.Find(actorUserId);
            if (actor == null)
                return Task.FromResult(ServiceResult<PostDTO>.FailureResult("User not found"));

            var isAdmin = actor.IsAdmin;
            var isAdminForumPost = string.Equals(post.SectionType, AdminForumSectionType, StringComparison.OrdinalIgnoreCase);

            if (isAdminForumPost && !isAdmin)
                return Task.FromResult(ServiceResult<PostDTO>.FailureResult("Only admins can edit forum announcements."));

            if (!isAdmin && post.UserId != actorUserId)
                return Task.FromResult(ServiceResult<PostDTO>.FailureResult("You can only edit your own posts."));

            if (!string.IsNullOrWhiteSpace(dto.SectionType) &&
                string.Equals(dto.SectionType, AdminForumSectionType, StringComparison.OrdinalIgnoreCase) &&
                !isAdmin)
            {
                return Task.FromResult(ServiceResult<PostDTO>.FailureResult("Only admins can move posts to forum announcements."));
            }

            if (!string.IsNullOrWhiteSpace(dto.Title)) post.Title = dto.Title;
            if (!string.IsNullOrWhiteSpace(dto.Content)) post.Content = dto.Content;
            if (!string.IsNullOrWhiteSpace(dto.PostType)) post.PostType = dto.PostType;
            if (!string.IsNullOrWhiteSpace(dto.SectionType))
            {
                post.SectionType = string.Equals(dto.SectionType, AdminForumSectionType, StringComparison.OrdinalIgnoreCase)
                    ? AdminForumSectionType
                    : dto.SectionType;
            }
            if (!string.IsNullOrWhiteSpace(dto.Type))
            {
                var requestedType = dto.Type.Trim().ToLowerInvariant();
                if (requestedType == AdminForumType && !isAdmin)
                    return Task.FromResult(ServiceResult<PostDTO>.FailureResult("Only admins can set admin_forum type."));

                if (requestedType == AdminForumType || requestedType == PublicPostType)
                    post.Type = requestedType;
            }

            if (isAdminForumPost)
                post.Type = AdminForumType;
            else if (string.IsNullOrWhiteSpace(post.Type))
                post.Type = PublicPostType;
            if (dto.IsExamRelated.HasValue) post.IsExamRelated = dto.IsExamRelated.Value;
            if (dto.ExamTags != null) post.ExamTags = System.Text.Json.JsonSerializer.Serialize(dto.ExamTags);
            if (!string.IsNullOrWhiteSpace(dto.Subject)) post.Subject = dto.Subject;
            if (!string.IsNullOrWhiteSpace(dto.MediaUrl)) post.MediaUrl = dto.MediaUrl;
            if (!string.IsNullOrWhiteSpace(dto.MediaType)) post.MediaType = dto.MediaType;
            post.UpdatedAt = DateTime.UtcNow;

            _context.SaveChanges();

            var postDto = new DTOs.PostDTO
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                UserId = post.UserId,
                PostType = post.PostType,
                Type = string.IsNullOrWhiteSpace(post.Type) ? PublicPostType : post.Type,
                IsExamRelated = post.IsExamRelated,
                ExamTags = post.ExamTags != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(post.ExamTags) ?? new List<string>() : new List<string>(),
                Subject = post.Subject,
                MediaUrl = post.MediaUrl,
                MediaType = post.MediaType,
                SectionType = post.SectionType,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt
            };
            return Task.FromResult(ServiceResult<PostDTO>.SuccessResult(postDto, "Post updated successfully"));
        }

        public Task<ServiceResult<bool>> DeletePost(int postId, int actorUserId)
        {
            var post = _context.Posts.Find(postId);
            if (post == null)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Post not found"));

            var actor = _context.Users.Find(actorUserId);
            if (actor == null)
                return Task.FromResult(ServiceResult<bool>.FailureResult("User not found"));

            var isAdmin = actor.IsAdmin;
            var isAdminForumPost = string.Equals(post.SectionType, AdminForumSectionType, StringComparison.OrdinalIgnoreCase);

            if (isAdminForumPost && !isAdmin)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Only admins can delete forum announcements."));

            if (!isAdmin && post.UserId != actorUserId)
                return Task.FromResult(ServiceResult<bool>.FailureResult("You can only delete your own posts."));

            _context.Posts.Remove(post);
            _context.SaveChanges();
            return Task.FromResult(ServiceResult<bool>.SuccessResult(true, "Post deleted successfully"));
        }

        public Task<ServiceResult<bool>> TogglePin(int postId, int actorUserId)
        {
            var actor = _context.Users.Find(actorUserId);
            if (actor == null || !actor.IsAdmin)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Only admins can pin or unpin posts."));

            var post = _context.Posts.Find(postId);
            if (post == null)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Post not found"));

            post.IsPinned = !post.IsPinned;
            post.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();

            return Task.FromResult(ServiceResult<bool>.SuccessResult(true, post.IsPinned ? "Post pinned" : "Post unpinned"));
        }

        public Task<ServiceResult<CommentDTO>> AddComment(int postId, CreateCommentDTO dto, int userId)
        {
            var post = _context.Posts.Find(postId);
            if (post == null)
                return Task.FromResult(ServiceResult<CommentDTO>.FailureResult("Post not found"));
            if (string.IsNullOrWhiteSpace(dto.Content))
                return Task.FromResult(ServiceResult<CommentDTO>.FailureResult("Content required"));

            var comment = new Models.Comment
            {
                Content = dto.Content,
                UserId = userId,
                PostId = postId,
                ParentCommentId = dto.ParentCommentId,
                IsAnswer = dto.IsAnswer,
                CreatedAt = DateTime.UtcNow
            };
            _context.Comments.Add(comment);
            _context.SaveChanges();

            var author = _context.Users.Find(userId);

            var commentDto = new DTOs.CommentDTO
            {
                Id = comment.Id,
                Content = comment.Content,
                UserId = comment.UserId,
                UserName = author != null ? (author.FirstName + " " + author.LastName) : null,
                ProfileImageUrl = author?.ProfileImageUrl,
                PostId = comment.PostId,
                ParentCommentId = comment.ParentCommentId,
                Depth = comment.Depth,
                UpvoteCount = comment.UpvoteCount,
                DownvoteCount = comment.DownvoteCount,
                ReplyCount = comment.ReplyCount,
                IsAnswer = comment.IsAnswer,
                IsTeacherAnswer = comment.IsTeacherAnswer,
                IsBestAnswer = comment.IsBestAnswer,
                CreatedAt = comment.CreatedAt
            };
            return Task.FromResult(ServiceResult<CommentDTO>.SuccessResult(commentDto, "Comment added successfully"));
        }

        public Task<ServiceResult<bool>> DeleteComment(int commentId, int userId)
        {
            var comment = _context.Comments.Find(commentId);
            if (comment == null)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Comment not found"));
            if (comment.UserId != userId)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Unauthorized"));

            _context.Comments.Remove(comment);
            _context.SaveChanges();
            return Task.FromResult(ServiceResult<bool>.SuccessResult(true, "Comment deleted successfully"));
        }

        public Task<ServiceResult<List<CommentDTO>>> GetPostComments(int postId)
        {
            var comments = _context.Comments.Where(c => c.PostId == postId && c.ParentCommentId == null)
                .OrderByDescending(c => c.CreatedAt)
                .ToList();

            var commentDtos = comments.Select(comment => {
                var author = _context.Users.Find(comment.UserId);
                return new DTOs.CommentDTO
                {
                    Id = comment.Id,
                    Content = comment.Content,
                    UserId = comment.UserId,
                    UserName = author != null ? (author.FirstName + " " + author.LastName) : null,
                    ProfileImageUrl = author?.ProfileImageUrl,
                    PostId = comment.PostId,
                    ParentCommentId = comment.ParentCommentId,
                    Depth = comment.Depth,
                    UpvoteCount = comment.UpvoteCount,
                    DownvoteCount = comment.DownvoteCount,
                    ReplyCount = comment.ReplyCount,
                    IsAnswer = comment.IsAnswer,
                    IsTeacherAnswer = comment.IsTeacherAnswer,
                    IsBestAnswer = comment.IsBestAnswer,
                    CreatedAt = comment.CreatedAt
                };
            }).ToList();

            return Task.FromResult(ServiceResult<List<CommentDTO>>.SuccessResult(commentDtos));
        }

        public Task<ServiceResult<bool>> ReactToPost(int postId, int userId, string reaction)
        {
            if (string.IsNullOrWhiteSpace(reaction))
                return Task.FromResult(ServiceResult<bool>.FailureResult("Reaction is required"));

            var normalized = reaction.Trim().ToLowerInvariant();
            var existingVote = _context.PostVotes.FirstOrDefault(v => v.PostId == postId && v.UserId == userId);

            if (normalized is "dislike" or "downvote")
            {
                var target = existingVote?.VoteType == -1 ? 0 : -1;
                return ApplyPostVote(postId, userId, target);
            }

            var likeTarget = existingVote?.VoteType == 1 ? 0 : 1;
            return ApplyPostVote(postId, userId, likeTarget);
        }

        private Task<ServiceResult<bool>> ApplyPostVote(int postId, int userId, int targetVote)
        {
            var post = _context.Posts.Find(postId);
            if (post == null)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Post not found"));

            var existingVote = _context.PostVotes.FirstOrDefault(v => v.PostId == postId && v.UserId == userId);
            var previousVote = existingVote?.VoteType ?? 0;

            if (targetVote == 0)
            {
                if (existingVote != null)
                {
                    _context.PostVotes.Remove(existingVote);
                }
            }
            else if (existingVote == null)
            {
                _context.PostVotes.Add(new Models.PostVote
                {
                    PostId = postId,
                    UserId = userId,
                    VoteType = targetVote,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else
            {
                existingVote.VoteType = targetVote;
            }

            if (previousVote == 1) post.UpvoteCount = Math.Max(0, post.UpvoteCount - 1);
            if (previousVote == -1) post.DownvoteCount = Math.Max(0, post.DownvoteCount - 1);
            if (targetVote == 1) post.UpvoteCount++;
            if (targetVote == -1) post.DownvoteCount++;

            _context.SaveChanges();
            return Task.FromResult(ServiceResult<bool>.SuccessResult(true));
        }

        public Task<ServiceResult<bool>> LikePost(int postId, int userId)
        {
            return ApplyPostVote(postId, userId, 1);
        }

        public Task<ServiceResult<bool>> UnlikePost(int postId, int userId)
        {
            return ApplyPostVote(postId, userId, 0);
        }

        public Task<ServiceResult<bool>> DownvotePost(int postId, int userId)
        {
            return ApplyPostVote(postId, userId, -1);
        }

        public Task<ServiceResult<bool>> UpvoteComment(int commentId, int userId)
        {
            var comment = _context.Comments.Find(commentId);
            if (comment == null)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Comment not found"));

            var existingVote = _context.CommentVotes.FirstOrDefault(v => v.CommentId == commentId && v.UserId == userId);
            if (existingVote != null && existingVote.VoteType == 1)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Already upvoted"));

            if (existingVote == null)
            {
                _context.CommentVotes.Add(new Models.CommentVote { CommentId = commentId, UserId = userId, VoteType = 1, CreatedAt = DateTime.UtcNow });
            }
            else
            {
                existingVote.VoteType = 1;
            }
            comment.UpvoteCount++;
            _context.SaveChanges();
            return Task.FromResult(ServiceResult<bool>.SuccessResult(true, "Comment upvoted"));
        }

        public Task<ServiceResult<bool>> DownvoteComment(int commentId, int userId)
        {
            var comment = _context.Comments.Find(commentId);
            if (comment == null)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Comment not found"));

            var existingVote = _context.CommentVotes.FirstOrDefault(v => v.CommentId == commentId && v.UserId == userId);
            if (existingVote != null && existingVote.VoteType == -1)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Already downvoted"));

            if (existingVote == null)
            {
                _context.CommentVotes.Add(new Models.CommentVote { CommentId = commentId, UserId = userId, VoteType = -1, CreatedAt = DateTime.UtcNow });
            }
            else
            {
                existingVote.VoteType = -1;
            }
            comment.DownvoteCount++;
            _context.SaveChanges();
            return Task.FromResult(ServiceResult<bool>.SuccessResult(true, "Comment downvoted"));
        }

        public Task<ServiceResult<bool>> MarkAsAnswer(int commentId, int userId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> MarkBestAnswer(int commentId, int userId)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<PostDTO>>> GetExamQuestions(int courseId)
            => Task.FromResult(ServiceResult<List<PostDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<PostDTO>>> GetExamTips(int courseId)
            => Task.FromResult(ServiceResult<List<PostDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<PostDTO>>> GetDoubts(int courseId, int page, int pageSize)
            => Task.FromResult(ServiceResult<List<PostDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<PostDTO>>> GetUserPosts(int userId, int page, int pageSize)
        {
            var posts = _context.Posts
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var postDtos = posts.Select(post => {
                var author = _context.Users.Find(post.UserId);
                return new DTOs.PostDTO
                {
                    Id = post.Id,
                    Title = post.Title,
                    Content = post.Content,
                    UserId = post.UserId,
                    UserName = author != null ? (author.FirstName + " " + author.LastName) : null,
                    ProfileImageUrl = author?.ProfileImageUrl,
                    PostType = post.PostType,
                    Type = string.IsNullOrWhiteSpace(post.Type) ? PublicPostType : post.Type,
                    IsExamRelated = post.IsExamRelated,
                    ExamTags = post.ExamTags != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(post.ExamTags) ?? new List<string>() : new List<string>(),
                    Subject = post.Subject,
                    MediaUrl = post.MediaUrl,
                    MediaType = post.MediaType,
                    CreatedAt = post.CreatedAt
                };
            }).ToList();

            return Task.FromResult(ServiceResult<List<PostDTO>>.SuccessResult(postDtos));
        }

        public Task<ServiceResult<int>> GetUserPostsCount(int userId)
        {
            var count = _context.Posts.Count(p => p.UserId == userId);
            return Task.FromResult(ServiceResult<int>.SuccessResult(count));
        }

        public Task<ServiceResult<List<CommentDTO>>> GetUserComments(int userId, int page, int pageSize)
            => Task.FromResult(ServiceResult<List<CommentDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> ReportPost(int postId, int userId, string reason)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<PostDTO>>> GetReportedPosts(int page, int pageSize)
            => Task.FromResult(ServiceResult<List<PostDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<bool>> ResolvePostReport(int postId, int adminId, string resolution)
            => Task.FromResult(ServiceResult<bool>.FailureResult("Not implemented"));

        public Task<ServiceResult<SearchResultDTO>> SearchCommunity(string query, string? type, int? universityId, int? courseId, int page, int pageSize)
            => Task.FromResult(ServiceResult<SearchResultDTO>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<PostDTO>>> GetUniversityPosts(int universityId, int page, int pageSize)
            => Task.FromResult(ServiceResult<List<PostDTO>>.FailureResult("Not implemented"));

        public Task<ServiceResult<List<PostDTO>>> GetCoursePosts(int courseId, int page, int pageSize)
            => Task.FromResult(ServiceResult<List<PostDTO>>.FailureResult("Not implemented"));
    }
}
