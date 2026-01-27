using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssignmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AssignmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET api/assignments/user
        [HttpGet("user")]
        public async Task<IActionResult> GetUserAssignments()
        {
            var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            if (userId == 0)
                return Unauthorized(new { success = false, message = "Invalid token" });

            // Query assignments that belong to user's enrolled courses and include submission if exists
            var assignments = await _context.Assignments
                .Include(a => a.Course)
                .Where(a => a.IsPublished == true)
                .Select(a => new {
                    a.Id,
                    a.Title,
                    a.DueDate,
                    a.MaxScore,
                    a.CourseId,
                    CourseTitle = a.Course.Title,
                    a.IsMandatory
                })
                .ToListAsync();

            // Load submissions for this user
            var submissions = await _context.AssignmentSubmissions
                .Where(s => s.UserId == userId)
                .ToListAsync();

            var result = assignments.Select(a => new {
                id = a.Id,
                title = a.Title,
                courseId = a.CourseId,
                courseTitle = a.CourseTitle,
                dueDate = a.DueDate,
                maxScore = a.MaxScore,
                isMandatory = a.IsMandatory,
                // attach submission if any
                submission = submissions.FirstOrDefault(s => s.AssignmentId == a.Id)
                    is object ? new {
                        id = submissions.First(s => s.AssignmentId == a.Id).Id,
                        score = submissions.First(s => s.AssignmentId == a.Id).Score,
                        status = submissions.First(s => s.AssignmentId == a.Id).Status,
                        submittedAt = submissions.First(s => s.AssignmentId == a.Id).SubmittedAt,
                    } : null
            }).ToList();

            return Ok(new { success = true, assignments = result });
        }
    }
}
