using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface ICommunityService
    {
        Task<ServiceResult<PostDTO>> CreatePost(CreatePostDTO dto, int userId);
        Task<ServiceResult<PostDTO>> GetPostById(int postId);
        Task<ServiceResult<List<PostDTO>>> GetAllPosts(int page, int pageSize);
        Task<ServiceResult<PostDTO>> UpdatePost(int postId, UpdatePostDTO dto);
        Task<ServiceResult<bool>> DeletePost(int postId);
        Task<ServiceResult<CommentDTO>> AddComment(int postId, CreateCommentDTO dto, int userId);
        Task<ServiceResult<bool>> DeleteComment(int commentId, int userId);
        Task<ServiceResult<List<CommentDTO>>> GetPostComments(int postId);
        Task<ServiceResult<bool>> LikePost(int postId, int userId);
        Task<ServiceResult<bool>> UnlikePost(int postId, int userId);
        Task<ServiceResult<bool>> DownvotePost(int postId, int userId);
        Task<ServiceResult<bool>> UpvoteComment(int commentId, int userId);
        Task<ServiceResult<bool>> DownvoteComment(int commentId, int userId);
        Task<ServiceResult<bool>> MarkAsAnswer(int commentId, int userId);
        Task<ServiceResult<bool>> MarkBestAnswer(int commentId, int userId);
        Task<ServiceResult<List<PostDTO>>> GetExamQuestions(int courseId);
        Task<ServiceResult<List<PostDTO>>> GetExamTips(int courseId);
        Task<ServiceResult<List<PostDTO>>> GetDoubts(int courseId, int page, int pageSize);
        Task<ServiceResult<List<PostDTO>>> GetUserPosts(int userId, int page, int pageSize);
        Task<ServiceResult<List<CommentDTO>>> GetUserComments(int userId, int page, int pageSize);
        Task<ServiceResult<bool>> ReportPost(int postId, int userId, string reason);
        Task<ServiceResult<List<PostDTO>>> GetReportedPosts(int page, int pageSize);
        Task<ServiceResult<bool>> ResolvePostReport(int postId, int adminId, string resolution);
        Task<ServiceResult<SearchResultDTO>> SearchCommunity(string query, string? type, int? universityId, int? courseId, int page, int pageSize);
        Task<ServiceResult<List<PostDTO>>> GetUniversityPosts(int universityId, int page, int pageSize);
        Task<ServiceResult<List<PostDTO>>> GetCoursePosts(int courseId, int page, int pageSize);
    }
}
