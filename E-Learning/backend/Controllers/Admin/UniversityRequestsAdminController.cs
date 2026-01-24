using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/university-requests")]
    [Authorize(Roles = "Admin")]
    public class UniversityRequestsAdminController : ControllerBase
    {
        private readonly IUniversityRequestService _service;

        public UniversityRequestsAdminController(IUniversityRequestService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] string? status = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var res = await _service.GetRequests(status, page, pageSize);
            if (!res.Success) return BadRequest(new { message = res.Message });
            return Ok(res.Data);
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var userIdStr = User?.Claims?.FirstOrDefault(c => c.Type == "id")?.Value;
            int userId = 0; int.TryParse(userIdStr, out userId);
            var res = await _service.ApproveRequest(id, userId);
            if (!res.Success) return BadRequest(new { message = res.Message });
            return Ok(new { success = true });
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] object? body)
        {
            var note = (body as dynamic)?.note as string;
            var userIdStr = User?.Claims?.FirstOrDefault(c => c.Type == "id")?.Value;
            int userId = 0; int.TryParse(userIdStr, out userId);
            var res = await _service.RejectRequest(id, userId, note);
            if (!res.Success) return BadRequest(new { message = res.Message });
            return Ok(new { success = true });
        }
    }
}
