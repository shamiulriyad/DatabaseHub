using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadsController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadsController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [Authorize(Roles = "Teacher,Admin")]
        [HttpPost("image")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "No file provided" });

            var uploadsRoot = Path.Combine(_env.WebRootPath ?? "wwwroot", "Uploads", "courses");
            if (!Directory.Exists(uploadsRoot)) Directory.CreateDirectory(uploadsRoot);

            var ext = Path.GetExtension(file.FileName);
            var fileName = System.Guid.NewGuid().ToString() + ext;
            var filePath = Path.Combine(uploadsRoot, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return URL relative to web root
            var url = $"/Uploads/courses/{fileName}";

            return Ok(new { success = true, url });
        }

        [Authorize(Roles = "Teacher,Admin")]
        [HttpPost("video")]
        public async Task<IActionResult> UploadVideo([FromForm] IFormFile file, [FromForm] double? durationSeconds)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "No file provided" });

            // Basic server-side checks: file size limit and provided duration (frontend should provide duration)
            const long maxFileBytes = 200L * 1024 * 1024; // 200 MB
            if (file.Length > maxFileBytes)
                return BadRequest(new { success = false, message = "Video file is too large (max 200 MB)" });

            if (!durationSeconds.HasValue)
                return BadRequest(new { success = false, message = "Video duration is required for validation" });

            if (durationSeconds.Value > 300)
                return BadRequest(new { success = false, message = "Video duration must be 5 minutes (300 seconds) or less" });

            var allowed = new[] { ".mp4", ".webm", ".mov", ".mkv", ".ogg" };
            var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant() ?? "";
            if (!allowed.Contains(ext))
                return BadRequest(new { success = false, message = "Unsupported video format" });

            var uploadsRoot = Path.Combine(_env.WebRootPath ?? "wwwroot", "Uploads", "videos");
            if (!Directory.Exists(uploadsRoot)) Directory.CreateDirectory(uploadsRoot);

            var fileName = System.Guid.NewGuid().ToString() + ext;
            var filePath = Path.Combine(uploadsRoot, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var url = $"/Uploads/videos/{fileName}";
            return Ok(new { success = true, url });
        }
    }
}
