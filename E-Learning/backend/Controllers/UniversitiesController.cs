using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services.Interfaces;  
using System.Threading.Tasks;
using System.Collections.Generic;
using backend.Helpers;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UniversitiesController : ControllerBase
    {
        private readonly IUniversityService _universityService;
        private readonly backend.Services.Interfaces.IDepartmentService _departmentService;

        public UniversitiesController(IUniversityService universityService, backend.Services.Interfaces.IDepartmentService departmentService)
        {
            _universityService = universityService;
            _departmentService = departmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUniversities(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            int? callerUserId = null;
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId)) callerUserId = parsedId;

            var result = await _universityService.GetAllUniversities(page, pageSize, callerUserId);
            
            return Ok(new {
                success = result.Success,
                message = result.Message,
                data = result.Data
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUniversity(int id)
        {
            int? callerUserId = null;
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId)) callerUserId = parsedId;

            var result = await _universityService.GetUniversityById(id, callerUserId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                data = result.Data
            });
        }

        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetUniversityDetails(int id)
        {
            int? callerUserId = null;
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId)) callerUserId = parsedId;

            var result = await _universityService.GetUniversityDetails(id, callerUserId);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                data = result.Data
            });
        }

        [HttpGet("{id}/courses")]
        public async Task<IActionResult> GetUniversityCourses(int id,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _universityService.GetUniversityCourses(id, page, pageSize);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                data = result.Data
            });
        }

        [HttpGet("{id}/departments")]
        public async Task<IActionResult> GetUniversityDepartments(int id)
        {
            var result = await _departmentService.GetDepartmentsByUniversity(id);

            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                departments = result.Data
            });
        }

        [HttpGet("{id}/teachers")]
        public async Task<IActionResult> GetUniversityTeachers(int id,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _universityService.GetUniversityTeachers(id, page, pageSize);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                data = result.Data
            });
        }

        [HttpGet("{id}/teachers/debug")]
        public async Task<IActionResult> GetUniversityTeachersDebug(int id)
        {
            var result = await _universityService.GetUniversityTeachersDebug(id);

            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                data = result.Data
            });
        }

        [HttpGet("{id}/students")]
        public async Task<IActionResult> GetUniversityStudents(int id,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _universityService.GetUniversityStudents(id, page, pageSize);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                data = result.Data
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateUniversity([FromBody] CreateUniversityDTO universityDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _universityService.CreateUniversity(universityDto);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return CreatedAtAction(nameof(GetUniversity), new { id = result.Data?.Id }, new {
                success = true,
                message = "University created successfully",
                data = result.Data
            });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUniversity(int id, [FromBody] UpdateUniversityDTO universityDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst("userId");
            var callerUserId = (int?)null;
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsed)) callerUserId = parsed;

            if (callerUserId == null)
                return Unauthorized(new { success = false, message = "Authentication required" });

            var result = await _universityService.UpdateUniversity(id, universityDto, callerUserId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "University updated successfully",
                data = result.Data
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUniversity(int id)
        {
            var result = await _universityService.DeleteUniversity(id);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                message = "University deleted successfully"
            });
        }

        [HttpGet("{id}/stats")]
        public async Task<IActionResult> GetUniversityStats(int id)
        {
            var result = await _universityService.GetUniversityStats(id);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                data = result.Data
            });
        }
    }
}