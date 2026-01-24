using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/department-requests")]
    [Authorize(Roles = "Admin")]
    public class DepartmentRequestsAdminController : ControllerBase
    {
        private readonly IDepartmentRequestService _requestService;

        public DepartmentRequestsAdminController(IDepartmentRequestService requestService)
        {
            _requestService = requestService;
        }

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] int? universityId = null, [FromQuery] string? status = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var result = await _requestService.GetRequests(universityId, status, page, pageSize);
            if (!result.Success) return BadRequest(new { success = false, message = result.Message });
            return Ok(new { success = true, requests = result.Data });
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var result = await _requestService.ApproveRequest(id, adminId);
            if (!result.Success) return BadRequest(new { success = false, message = result.Message });
            return Ok(new { success = true });
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] DepartmentRequestRejectDTO dto)
        {
            var adminId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            var result = await _requestService.RejectRequest(id, adminId, dto?.Note);
            if (!result.Success) return BadRequest(new { success = false, message = result.Message });
            return Ok(new { success = true });
        }
    }

    public class DepartmentRequestRejectDTO { public string? Note { get; set; } }
}
