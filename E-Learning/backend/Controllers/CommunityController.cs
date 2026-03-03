using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommunityController : ControllerBase
    {
        private readonly ICommunityService _communityService;

        public CommunityController(ICommunityService communityService)
        {
            _communityService = communityService;
        }

        // POSTS

        [HttpGet("posts")]
        public async Task<IActionResult> GetAllPosts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sectionType = null)
        {
            var result = await _communityService.GetAllPosts(page, pageSize, sectionType);
            
            return Ok(new {
                success = result.Success,
                message = result.Message,
                data = result.Data
            });
        }

        [HttpGet("posts/forums")]
        [HttpGet("/api/posts/forums")]
        public async Task<IActionResult> GetForumPosts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _communityService.GetForumPosts(page, pageSize);
            var countResult = await _communityService.GetForumPostsCount();
            var totalCount = countResult.Success ? countResult.Data : 0;
            var safePageSize = pageSize <= 0 ? 10 : pageSize;
            var totalPages = (int)Math.Ceiling((double)totalCount / safePageSize);
            if (totalPages <= 0) totalPages = 1;

            return Ok(new {
                success = result.Success,
                message = result.Message,
                data = new {
                    posts = result.Data,
                    page,
                    pageSize = safePageSize,
                    totalCount,
                    totalPages
                }
            });
        }

        [HttpGet("posts/public")]
        [HttpGet("/api/posts/public")]
        public async Task<IActionResult> GetPublicPosts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _communityService.GetPublicPosts(page, pageSize);
            var countResult = await _communityService.GetPublicPostsCount();
            var totalCount = countResult.Success ? countResult.Data : 0;
            var safePageSize = pageSize <= 0 ? 10 : pageSize;
            var totalPages = (int)Math.Ceiling((double)totalCount / safePageSize);
            if (totalPages <= 0) totalPages = 1;

            return Ok(new {
                success = result.Success,
                message = result.Message,
                data = new {
                    posts = result.Data,
                    page,
                    pageSize = safePageSize,
                    totalCount,
                    totalPages
                }
            });
        }

        [HttpGet("posts/{id}")]
        public async Task<IActionResult> GetPost(int id)
        {
            var result = await _communityService.GetPostById(id);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                post = result.Data
            });
        }

        [Authorize]
        [HttpPost("posts")]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostDTO postDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.CreatePost(postDto, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return CreatedAtAction(nameof(GetPost), new { id = result.Data.Id }, new {
                success = true,
                message = "Post created successfully",
                post = result.Data
            });
        }

        [Authorize]
        [HttpPost("posts/forums")]
        [HttpPost("/api/posts/forums")]
        public async Task<IActionResult> CreateForumPost([FromBody] CreatePostDTO postDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.CreateForumPost(postDto, userId);
            if (!result.Success)
            {
                if (result.Message.Contains("Only admins", StringComparison.OrdinalIgnoreCase))
                    return StatusCode(403, new { success = false, message = result.Message });

                return BadRequest(new { success = false, message = result.Message });
            }

            return CreatedAtAction(nameof(GetPost), new { id = result.Data.Id }, new {
                success = true,
                message = "Forum post created successfully",
                post = result.Data
            });
        }

        [Authorize]
        [HttpPost("posts/public")]
        [HttpPost("/api/posts/public")]
        public async Task<IActionResult> CreatePublicPost([FromBody] CreatePostDTO postDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.CreatePublicPost(postDto, userId);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return CreatedAtAction(nameof(GetPost), new { id = result.Data.Id }, new {
                success = true,
                message = "Public post created successfully",
                post = result.Data
            });
        }

        [Authorize]
        [HttpPut("posts/{id}")]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] UpdatePostDTO postDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.UpdatePost(id, postDto, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Post updated successfully",
                post = result.Data
            });
        }

        [Authorize]
        [HttpDelete("posts/{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.DeletePost(id, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Post deleted successfully"
            });
        }

        [Authorize]
        [HttpPost("posts/{id}/like")]
        public async Task<IActionResult> LikePost(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.LikePost(id, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Post liked successfully"
            });
        }

        [Authorize]
        [HttpPost("posts/{id}/unlike")]
        public async Task<IActionResult> UnlikePost(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.UnlikePost(id, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Post unliked successfully"
            });
        }

        [Authorize]
        [HttpPost("posts/{id}/dislike")]
        public async Task<IActionResult> DislikePost(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.DownvotePost(id, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Post downvoted successfully"
            });
        }

        [Authorize]
        [HttpPost("posts/{id}/react")]
        public async Task<IActionResult> ReactToPost(int id, [FromBody] PostReactionDTO reactionDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.ReactToPost(id, userId, reactionDto.Reaction);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Reaction updated successfully"
            });
        }

        [Authorize]
        [HttpPut("posts/{id}/pin")]
        public async Task<IActionResult> TogglePin(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");

            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.TogglePin(id, userId);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = result.Message
            });
        }

        // COMMENTS

        [HttpGet("posts/{postId}/comments")]
        public async Task<IActionResult> GetPostComments(int postId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _communityService.GetPostComments(postId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                comments = result.Data
            });
        }

        [Authorize]
        [HttpPost("posts/{postId}/comments")]
        public async Task<IActionResult> CreateComment(int postId, [FromBody] CreateCommentDTO commentDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.AddComment(postId, commentDto, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Comment added successfully",
                comment = result.Data
            });
        }

        [Authorize]
        [HttpPut("comments/{id}")]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentDTO commentDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            // Note: UpdateComment method not found in ICommunityService interface
            // This endpoint may need to be removed or the service method needs to be added
            return BadRequest(new { success = false, message = "Update comment functionality not implemented" });

            // Original code:
            // var result = await _communityService.UpdateComment(id, userId, commentDto);
            // if (!result.Success)
            //     return BadRequest(new { success = false, message = result.Message });
            // return Ok(new { success = true, message = "Comment updated successfully", comment = result.Data });
        }

        [Authorize]
        [HttpDelete("comments/{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.DeleteComment(id, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Comment deleted successfully",
                data = result.Data
            });
        }

        [Authorize]
        [HttpPost("comments/{id}/upvote")]
        public async Task<IActionResult> UpvoteComment(int id)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.UpvoteComment(id, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Comment upvoted"
            });
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("comments/{id}/mark-as-answer")]
        public async Task<IActionResult> MarkAsAnswer(int id)
        {
            var teacherId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (teacherId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.MarkAsAnswer(id, teacherId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Marked as teacher answer"
            });
        }

        [Authorize]
        [HttpPost("posts/{postId}/mark-best-answer/{commentId}")]
        public async Task<IActionResult> MarkBestAnswer(int postId, int commentId)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.MarkBestAnswer(commentId, userId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Marked as best answer"
            });
        }

        // EXAM-FOCUSED COMMUNITY

        [HttpGet("exam-questions")]
        public async Task<IActionResult> GetExamQuestions(
            [FromQuery] string? subject = null,
            [FromQuery] string? university = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            // Note: Interface expects courseId, but endpoint receives subject and university
            // This may need service interface update or endpoint redesign
            int courseId = 0; // Placeholder - needs proper implementation
            
            var result = await _communityService.GetExamQuestions(courseId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                questions = result.Data
            });
        }

        [HttpGet("exam-tips")]
        public async Task<IActionResult> GetExamTips(
            [FromQuery] string? subject = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            // Note: Interface expects courseId, but endpoint receives subject
            // This may need service interface update or endpoint redesign
            int courseId = 0; // Placeholder - needs proper implementation
            
            var result = await _communityService.GetExamTips(courseId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                tips = result.Data
            });
        }

        [HttpGet("doubt-solving")]
        public async Task<IActionResult> GetDoubts(
            [FromQuery] string? subject = null,
            [FromQuery] bool? solved = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            // Note: Interface expects courseId, but endpoint receives subject and solved
            // This may need service interface update or endpoint redesign
            int courseId = 0; // Placeholder - needs proper implementation
            
            var result = await _communityService.GetDoubts(courseId, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                doubts = result.Data
            });
        }

        // SEARCH

        [HttpGet("search")]
        public async Task<IActionResult> SearchCommunity(
            [FromQuery] string query,
            [FromQuery] string? type = null, // post, comment, question, tip
            [FromQuery] int? universityId = null,
            [FromQuery] int? courseId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { success = false, message = "Search query is required" });

            var result = await _communityService.SearchCommunity(query, type, universityId, courseId, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                results = result.Data
            });
        }

        [Authorize]
        [HttpGet("my-posts")]
        public async Task<IActionResult> GetMyPosts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.GetUserPosts(userId, page, pageSize);
            var countResult = await _communityService.GetUserPostsCount(userId);
            var totalCount = countResult.Success ? countResult.Data : 0;
            var safePageSize = pageSize <= 0 ? 10 : pageSize;
            var totalPages = (int)Math.Ceiling((double)totalCount / safePageSize);
            if (totalPages <= 0) totalPages = 1;
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                data = new {
                    posts = result.Data,
                    page,
                    pageSize = safePageSize,
                    totalCount,
                    totalPages
                }
            });
        }

        [Authorize]
        [HttpGet("my-comments")]
        public async Task<IActionResult> GetMyComments(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.GetUserComments(userId, page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                comments = result.Data
            });
        }

        // MODERATION

        [Authorize(Roles = "Teacher,Admin")]
        [HttpPost("posts/{id}/report")]
        public async Task<IActionResult> ReportPost(int id, [FromBody] ReportContentDTO reportDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.ReportPost(id, userId, reportDto.Reason);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Post reported successfully"
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("reported-posts")]
        public async Task<IActionResult> GetReportedPosts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.GetReportedPosts(page, pageSize);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                posts = result.Data
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("posts/{id}/resolve-report")]
        public async Task<IActionResult> ResolvePostReport(int id, [FromBody] ResolveReportDTO resolveDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            
            if (adminId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            var result = await _communityService.ResolvePostReport(id, adminId, resolveDto.Action);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "Report resolved successfully"
            });
        }
    }
}