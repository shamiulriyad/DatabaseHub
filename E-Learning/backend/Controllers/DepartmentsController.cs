using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentsController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDepartments(
            [FromQuery] int? universityId = null,
            [FromQuery] string? search = null,
            [FromQuery] string? departmentType = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (universityId.HasValue)
            {
                var uniResult = await _departmentService.GetDepartmentsByUniversity(universityId.Value);

                if (!uniResult.Success)
                    return BadRequest(new { success = false, message = uniResult.Message, errors = uniResult.Errors });

                return Ok(new {
                    success = true,
                    departments = uniResult.Data
                });
            }

            var result = await _departmentService.GetAllDepartments(page, pageSize);

            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message, errors = result.Errors });

            return Ok(new {
                success = true,
                departments = result.Data
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDepartment(int id)
        {
            var result = await _departmentService.GetDepartmentById(id);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                department = result.Data
            });
        }

        [HttpGet("{id}/courses")]
        public async Task<IActionResult> GetDepartmentCourses(int id,
            [FromQuery] string? difficulty = null,
            [FromQuery] bool? isFree = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _departmentService.GetDepartmentCourses(id, page, pageSize);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                courses = result.Data
            });
        }

        // GetDepartmentTeachers method not implemented in service interface

        [HttpGet("{id}/stats")]
        public async Task<IActionResult> GetDepartmentStats(int id)
        {
            var result = await _departmentService.GetDepartmentStats(id);
            
            if (!result.Success)
                return NotFound(new { success = false, message = result.Message });

            return Ok(new {
                success = true,
                stats = result.Data
            });
        }

        // GetPopularDepartments method not implemented in service interface

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentDTO departmentDto)
        {
            // Departments are centrally managed. New departments can only be created
            // via the Department Request -> Admin Approve flow. Direct creation by
            // Admin through this endpoint is intentionally disabled.
            return Task.FromResult<IActionResult>(Forbid("Direct department creation is disabled. Submit a Department Add Request for admin approval."));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public Task<IActionResult> UpdateDepartment(int id, [FromBody] UpdateDepartmentDTO departmentDto)
        {
            // Editing departments directly is disabled; use the Department Requests approval flow.
            return Task.FromResult<IActionResult>(Forbid("Direct department updates are disabled. Use the Department Request approval workflow."));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public Task<IActionResult> DeleteDepartment(int id)
        {
            // Deletion of departments is centrally controlled. Prevent direct deletes.
            return Task.FromResult<IActionResult>(Forbid("Direct department deletion is disabled. Use the admin workflows for deprecation/removal."));
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchDepartments(
            [FromQuery] string query,
            [FromQuery] int? universityId = null)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { success = false, message = "Search query is required" });

            var result = await _departmentService.SearchDepartments(query, universityId);
            
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });
            
            return Ok(new {
                success = true,
                departments = result.Data
            });
        }
    }
}