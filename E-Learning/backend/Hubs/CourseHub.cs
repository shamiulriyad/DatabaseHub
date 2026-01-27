using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    public class CourseHub : Hub
    {
        // Join a course-specific group to receive live updates about that course
        public Task JoinCourseGroup(string courseGroup)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, courseGroup);
        }

        // Leave course group
        public Task LeaveCourseGroup(string courseGroup)
        {
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, courseGroup);
        }

        // Convenience: join a user-specific group (e.g. user-<id>)
        public Task JoinUserGroup(string userGroup)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, userGroup);
        }

        public Task LeaveUserGroup(string userGroup)
        {
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, userGroup);
        }
    }
}
