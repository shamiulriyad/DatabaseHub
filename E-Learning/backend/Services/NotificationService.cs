using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<List<NotificationDTO>>> GetNotifications(int userId, bool? unreadOnly, int page, int pageSize)
        {
            try
            {
                var query = _context.Notifications
                    .Where(n => n.UserId == userId);

                if (unreadOnly == true)
                {
                    query = query.Where(n => !n.IsRead);
                }

                var notifications = await query
                    .OrderByDescending(n => n.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(n => new NotificationDTO
                    {
                        Id = n.Id,
                        Type = n.Type,
                        Title = n.Title,
                        Message = n.Message,
                        ActionUrl = n.ActionUrl,
                        ClanId = n.ClanId,
                        ClanName = n.Clan != null ? n.Clan.Name : null,
                        FromUserId = n.FromUserId,
                        FromUserName = n.FromUser != null ? n.FromUser.Username : null,
                        FromUserImage = n.FromUser != null ? n.FromUser.ProfileImageUrl : null,
                        IsRead = n.IsRead,
                        CreatedAt = n.CreatedAt
                    })
                    .ToListAsync();

                return ServiceResult<List<NotificationDTO>>.SuccessResult(notifications);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<NotificationDTO>>.FailureResult($"Error fetching notifications: {ex.Message}");
            }
        }

        public async Task<ServiceResult<int>> GetUnreadCount(int userId)
        {
            try
            {
                var count = await _context.Notifications
                    .CountAsync(n => n.UserId == userId && !n.IsRead);

                return ServiceResult<int>.SuccessResult(count);
            }
            catch (Exception ex)
            {
                return ServiceResult<int>.FailureResult($"Error getting unread count: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> MarkAsRead(int notificationId, int userId)
        {
            try
            {
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

                if (notification == null)
                    return ServiceResult<bool>.FailureResult("Notification not found");

                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Error marking notification as read: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> MarkAllAsRead(int userId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Error marking all as read: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> DeleteNotification(int notificationId, int userId)
        {
            try
            {
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

                if (notification == null)
                    return ServiceResult<bool>.FailureResult("Notification not found");

                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();

                return ServiceResult<bool>.SuccessResult(true);
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Error deleting notification: {ex.Message}");
            }
        }

        public async Task<ServiceResult<NotificationDTO>> CreateNotification(
            int userId, 
            string type, 
            string title, 
            string message, 
            string? actionUrl = null, 
            int? clanId = null, 
            int? fromUserId = null)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = userId,
                    Type = type,
                    Title = title,
                    Message = message,
                    ActionUrl = actionUrl,
                    ClanId = clanId,
                    FromUserId = fromUserId,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                var dto = new NotificationDTO
                {
                    Id = notification.Id,
                    Type = notification.Type,
                    Title = notification.Title,
                    Message = notification.Message,
                    ActionUrl = notification.ActionUrl,
                    ClanId = notification.ClanId,
                    FromUserId = notification.FromUserId,
                    IsRead = notification.IsRead,
                    CreatedAt = notification.CreatedAt
                };

                return ServiceResult<NotificationDTO>.SuccessResult(dto);
            }
            catch (Exception ex)
            {
                return ServiceResult<NotificationDTO>.FailureResult($"Error creating notification: {ex.Message}");
            }
        }
    }
}
