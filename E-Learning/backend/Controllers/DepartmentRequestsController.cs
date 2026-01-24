using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentRequestsController : ControllerBase
    {
        private readonly IDepartmentRequestService _requestService;
        private readonly ILogger<DepartmentRequestsController> _logger;

        public DepartmentRequestsController(IDepartmentRequestService requestService, ILogger<DepartmentRequestsController> logger)
        {
            _requestService = requestService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDepartmentRequestDTO dto)
        {
            if (dto == null) return BadRequest(new { success = false, message = "Invalid request payload" });
            _logger.LogInformation("Create DepartmentRequest called. Payload: {@dto}", dto);
            if (dto.UniversityId <= 0) return BadRequest(new { success = false, message = "Invalid universityId" });
            if (string.IsNullOrWhiteSpace(dto.DepartmentName)) return BadRequest(new { success = false, message = "DepartmentName is required" });
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = 0;
            if (User?.Identity?.IsAuthenticated == true)
            {
                int.TryParse(User.FindFirst("userId")?.Value ?? "0", out userId);
            }

            var result = await _requestService.CreateRequest(dto, userId);
            if (!result.Success) _logger.LogWarning("DepartmentRequest creation failed: {message}", result.Message);
            if (!result.Success) return BadRequest(new { success = false, message = result.Message });
            _logger.LogInformation("DepartmentRequest created with id {id}", result.Data);
            return Ok(new { success = true, requestId = result.Data });
        }
    }
}
