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

        public CommunityService(ApplicationDbContext context, Microsoft.AspNetCore.SignalR.IHubContext<backend.Hubs.CommunityHub>? hubContext = null)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<ServiceResult<PostDTO>> CreatePost(CreatePostDTO dto, int userId)
        {
            // Validate DTO
            if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Content))
                return ServiceResult<PostDTO>.FailureResult("Title and Content are required.");


            var post = new Models.Post
            {
                Title = dto.Title,
                Content = dto.Content,
                UserId = userId,
                UniversityId = dto.UniversityId,
                DepartmentId = dto.DepartmentId,
                CourseId = dto.CourseId,
                ClanId = dto.ClanId,
                PostType = dto.PostType ?? "Discussion",
                IsExamRelated = dto.IsExamRelated,
                ExamTags = dto.ExamTags != null ? System.Text.Json.JsonSerializer.Serialize(dto.ExamTags) : null,
                Subject = dto.Subject,
                MediaUrl = dto.MediaUrl,
                MediaType = dto.MediaType,
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
            var author = _context.Users.Find(userId);

            var postDto = new DTOs.PostDTO
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                UserId = post.UserId,
                UserName = author != null ? (author.FirstName + " " + author.LastName) : "Anonymous",
                ProfileImageUrl = author?.ProfileImageUrl,
                PostType = post.PostType,
                IsExamRelated = post.IsExamRelated,
                ExamTags = dto.ExamTags ?? new List<string>(),
                Subject = post.Subject,
                MediaUrl = post.MediaUrl,
                MediaType = post.MediaType,
                CreatedAt = post.CreatedAt
            };

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

            var postDto = new DTOs.PostDTO
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                UserId = post.UserId,
                UserName = _context.Users.Find(post.UserId) != null ? (_context.Users.Find(post.UserId).FirstName + " " + _context.Users.Find(post.UserId).LastName) : null,
                ProfileImageUrl = _context.Users.Find(post.UserId)?.ProfileImageUrl,
                PostType = post.PostType,
                IsExamRelated = post.IsExamRelated,
                ExamTags = post.ExamTags != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(post.ExamTags) ?? new List<string>() : new List<string>(),
                Subject = post.Subject,
                MediaUrl = post.MediaUrl,
                MediaType = post.MediaType,
                CreatedAt = post.CreatedAt
            };
            return Task.FromResult(ServiceResult<PostDTO>.SuccessResult(postDto));
        }

        public Task<ServiceResult<List<PostDTO>>> GetAllPosts(int page, int pageSize)
        {
            var posts = _context.Posts
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
                IsExamRelated = post.IsExamRelated,
                ExamTags = post.ExamTags != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(post.ExamTags) ?? new List<string>() : new List<string>(),
                Subject = post.Subject,
                MediaUrl = post.MediaUrl,
                MediaType = post.MediaType,
                CreatedAt = post.CreatedAt
            }).ToList();

            return Task.FromResult(ServiceResult<List<PostDTO>>.SuccessResult(postDtos));
        }

        public Task<ServiceResult<PostDTO>> UpdatePost(int postId, UpdatePostDTO dto)
        {
            var post = _context.Posts.Find(postId);
            if (post == null)
                return Task.FromResult(ServiceResult<PostDTO>.FailureResult("Post not found"));

            if (!string.IsNullOrWhiteSpace(dto.Title)) post.Title = dto.Title;
            if (!string.IsNullOrWhiteSpace(dto.Content)) post.Content = dto.Content;
            if (!string.IsNullOrWhiteSpace(dto.PostType)) post.PostType = dto.PostType;
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
                IsExamRelated = post.IsExamRelated,
                ExamTags = post.ExamTags != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(post.ExamTags) ?? new List<string>() : new List<string>(),
                Subject = post.Subject,
                MediaUrl = post.MediaUrl,
                MediaType = post.MediaType,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt
            };
            return Task.FromResult(ServiceResult<PostDTO>.SuccessResult(postDto, "Post updated successfully"));
        }

        public Task<ServiceResult<bool>> DeletePost(int postId)
        {
            var post = _context.Posts.Find(postId);
            if (post == null)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Post not found"));

            _context.Posts.Remove(post);
            _context.SaveChanges();
            return Task.FromResult(ServiceResult<bool>.SuccessResult(true, "Post deleted successfully"));
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

            var commentDto = new DTOs.CommentDTO
            {
                Id = comment.Id,
                Content = comment.Content,
                UserId = comment.UserId,
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

            var commentDtos = comments.Select(comment => new DTOs.CommentDTO
            {
                Id = comment.Id,
                Content = comment.Content,
                UserId = comment.UserId,
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
            }).ToList();

            return Task.FromResult(ServiceResult<List<CommentDTO>>.SuccessResult(commentDtos));
        }

        public Task<ServiceResult<bool>> LikePost(int postId, int userId)
        {
            var post = _context.Posts.Find(postId);
            if (post == null)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Post not found"));

            var existingVote = _context.PostVotes.FirstOrDefault(v => v.PostId == postId && v.UserId == userId);
            if (existingVote != null && existingVote.VoteType == 1)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Already upvoted"));

            if (existingVote == null)
            {
                _context.PostVotes.Add(new Models.PostVote { PostId = postId, UserId = userId, VoteType = 1, CreatedAt = DateTime.UtcNow });
            }
            else
            {
                existingVote.VoteType = 1;
            }
            post.UpvoteCount++;
            _context.SaveChanges();
            return Task.FromResult(ServiceResult<bool>.SuccessResult(true, "Post upvoted"));
        }

        public Task<ServiceResult<bool>> UnlikePost(int postId, int userId)
        {
            var post = _context.Posts.Find(postId);
            if (post == null)
                return Task.FromResult(ServiceResult<bool>.FailureResult("Post not found"));

            var existingVote = _context.PostVotes.FirstOrDefault(v => v.PostId == postId && v.UserId == userId);
            if (existingVote == null || existingVote.VoteType != 1)
                return Task.FromResult(ServiceResult<bool>.FailureResult("No upvote to remove"));

            _context.PostVotes.Remove(existingVote);
            post.UpvoteCount = Math.Max(0, post.UpvoteCount - 1);
            _context.SaveChanges();
            return Task.FromResult(ServiceResult<bool>.SuccessResult(true, "Upvote removed"));
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
