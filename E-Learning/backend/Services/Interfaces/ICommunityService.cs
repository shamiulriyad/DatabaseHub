using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface ICommunityService
    {
        Task<ServiceResult<PostDTO>> CreatePost(CreatePostDTO dto, int userId);
        Task<ServiceResult<PostDTO>> CreateForumPost(CreatePostDTO dto, int userId);
        Task<ServiceResult<PostDTO>> CreatePublicPost(CreatePostDTO dto, int userId);
        Task<ServiceResult<PostDTO>> GetPostById(int postId);
        Task<ServiceResult<List<PostDTO>>> GetAllPosts(int page, int pageSize, string? sectionType = null);
        Task<ServiceResult<List<PostDTO>>> GetForumPosts(int page, int pageSize);
        Task<ServiceResult<List<PostDTO>>> GetPublicPosts(int page, int pageSize);
        Task<ServiceResult<int>> GetForumPostsCount();
        Task<ServiceResult<int>> GetPublicPostsCount();
        Task<ServiceResult<PostDTO>> UpdatePost(int postId, UpdatePostDTO dto, int actorUserId);
        Task<ServiceResult<bool>> DeletePost(int postId, int actorUserId);
        Task<ServiceResult<CommentDTO>> AddComment(int postId, CreateCommentDTO dto, int userId);
        Task<ServiceResult<bool>> DeleteComment(int commentId, int userId);
        Task<ServiceResult<List<CommentDTO>>> GetPostComments(int postId);
        Task<ServiceResult<bool>> ReactToPost(int postId, int userId, string reaction);
        Task<ServiceResult<bool>> TogglePin(int postId, int actorUserId);
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
        Task<ServiceResult<int>> GetUserPostsCount(int userId);
        Task<ServiceResult<List<CommentDTO>>> GetUserComments(int userId, int page, int pageSize);
        Task<ServiceResult<bool>> ReportPost(int postId, int userId, string reason);
        Task<ServiceResult<List<PostDTO>>> GetReportedPosts(int page, int pageSize);
        Task<ServiceResult<bool>> ResolvePostReport(int postId, int adminId, string resolution);
        Task<ServiceResult<SearchResultDTO>> SearchCommunity(string query, string? type, int? universityId, int? courseId, int page, int pageSize);
        Task<ServiceResult<List<PostDTO>>> GetUniversityPosts(int universityId, int page, int pageSize);
        Task<ServiceResult<List<PostDTO>>> GetCoursePosts(int courseId, int page, int pageSize);
    }
}
