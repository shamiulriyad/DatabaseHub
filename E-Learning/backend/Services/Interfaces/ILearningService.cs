using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface ILearningService
    {
        // Course Content
        Task<ServiceResult<CourseContentDTO>> GetCourseContent(int courseId, int userId);
        Task<ServiceResult<ModuleContentDTO>> GetModuleContent(int moduleId, int userId);
        
        // Lesson Operations
        Task<ServiceResult<LessonDTO>> CreateLesson(int courseId, CreateLessonDTO dto, int teacherId);
        Task<ServiceResult<LessonDTO>> GetLesson(int lessonId, int userId);
        Task<ServiceResult<LessonDTO>> GetLessonById(int lessonId);
        Task<ServiceResult<List<LessonDTO>>> GetCourseLessons(int courseId);
        Task<ServiceResult<LessonDTO>> UpdateLesson(int lessonId, UpdateLessonDTO dto);
        Task<ServiceResult<bool>> DeleteLesson(int lessonId);
        Task<ServiceResult<bool>> MarkLessonComplete(int lessonId, int userId, int enrollmentId);
        Task<ServiceResult<bool>> UpdateLessonWatch(int lessonId, int userId, int enrollmentId, int watchedSeconds);
        Task<ServiceResult<bool>> BookmarkLesson(int lessonId, int userId);
        Task<ServiceResult<List<LessonDTO>>> GetBookmarks(int userId);
        
        // Assignment Operations
        Task<ServiceResult<AssignmentDTO>> CreateAssignment(int courseId, CreateAssignmentDTO dto, int teacherId);
        Task<ServiceResult<AssignmentDTO>> GetAssignment(int assignmentId, int userId);
        Task<ServiceResult<AssignmentDTO>> GetAssignmentById(int assignmentId);
        Task<ServiceResult<List<AssignmentDTO>>> GetCourseAssignments(int courseId);
        Task<ServiceResult<AssignmentDTO>> UpdateAssignment(int assignmentId, UpdateAssignmentDTO dto);
        Task<ServiceResult<bool>> DeleteAssignment(int assignmentId);
        Task<ServiceResult<AssignmentSubmissionDTO>> SubmitAssignment(int assignmentId, int userId, SubmitAssignmentDTO dto);
        Task<ServiceResult<List<AssignmentSubmissionDTO>>> GetAssignmentSubmissions(int assignmentId, int teacherId);
        Task<ServiceResult<bool>> GradeAssignment(int submissionId, int teacherId, GradeAssignmentDTO dto);
        
        // Quiz Operations
        Task<ServiceResult<QuizDTO>> CreateQuiz(int courseId, CreateQuizDTO dto, int teacherId);
        Task<ServiceResult<QuizDTO>> GetQuiz(int quizId, int userId);
        Task<ServiceResult<QuizDTO>> GetQuizById(int quizId);
        Task<ServiceResult<List<QuizDTO>>> GetCourseQuizzes(int courseId);
        Task<ServiceResult<QuizDTO>> UpdateQuiz(int quizId, UpdateQuizDTO dto);
        Task<ServiceResult<bool>> DeleteQuiz(int quizId);
        Task<ServiceResult<QuizAttemptDTO>> StartQuiz(int quizId, int userId);
        Task<ServiceResult<QuizResultDTO>> SubmitQuiz(int quizId, int userId, SubmitQuizDTO dto);
        Task<ServiceResult<QuizResultDTO>> GetQuizResults(int attemptId, int userId);
        
        // Notes Operations
        Task<ServiceResult<NoteDTO>> AddNote(int lessonId, int userId, CreateNoteDTO dto);
        Task<ServiceResult<List<NoteDTO>>> GetCourseNotes(int courseId, int userId);
        
        // Analytics Operations
        Task<ServiceResult<DailyAnalyticsDTO>> GetDailyAnalytics(int userId, DateTime date);
        Task<ServiceResult<WeeklyAnalyticsDTO>> GetWeeklyAnalytics(int userId, DateTime startDate);
        Task<ServiceResult<CourseAnalyticsDTO>> GetCourseAnalytics(int courseId, int teacherId);
    }
}
