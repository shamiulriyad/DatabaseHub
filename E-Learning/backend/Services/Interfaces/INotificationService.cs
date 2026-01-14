using backend.DTOs;

namespace backend.Services.Interfaces
{
    public interface INotificationService
    {
        Task<ServiceResult<List<NotificationDTO>>> GetNotifications(int userId, bool? unreadOnly, int page, int pageSize);
        Task<ServiceResult<int>> GetUnreadCount(int userId);
        Task<ServiceResult<bool>> MarkAsRead(int notificationId, int userId);
        Task<ServiceResult<bool>> MarkAllAsRead(int userId);
        Task<ServiceResult<bool>> DeleteNotification(int notificationId, int userId);
        Task<ServiceResult<NotificationDTO>> CreateNotification(int userId, string type, string title, string message, string? actionUrl = null, int? clanId = null, int? fromUserId = null);
    }
}
