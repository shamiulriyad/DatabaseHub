using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UniversityRequestsController : ControllerBase
    {
        private readonly IUniversityRequestService _service;

        public UniversityRequestsController(IUniversityRequestService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateUniversityRequestDTO dto)
        {
            var userIdStr = User?.Claims?.FirstOrDefault(c => c.Type == "id")?.Value;
            int userId = 0;
            int.TryParse(userIdStr, out userId);
            var res = await _service.CreateRequest(dto, userId);
            if (!res.Success) return BadRequest(new { message = res.Message });
            return Ok(new { id = res.Data });
        }
    }
}
