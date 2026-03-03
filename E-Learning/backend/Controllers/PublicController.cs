using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class PublicController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public PublicController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("footer")]
        public async Task<IActionResult> GetFooterData()
        {
            var nowYear = DateTime.UtcNow.Year;

            var totalUsers = await _context.Users.CountAsync();
            var totalCourses = await _context.Courses.CountAsync();
            var totalCompetitions = await _context.Competitions.CountAsync();
            var totalUniversities = await _context.Universities.CountAsync();
            var totalDepartments = await _context.Departments.CountAsync();
            var activeClans = await _context.Clans
                .Where(c => c.MemberCount > 0 || (c.LastActivity != null && c.LastActivity > DateTime.UtcNow.AddDays(-30)))
                .CountAsync();

            var section = _configuration.GetSection("FooterSettings");

            var siteName = section["SiteName"] ?? "NextUniVerse";
            var siteDescription = section["SiteDescription"]
                                  ?? "Empowering the next generation of scholars with university-backed courses, vibrant clans, and real competitions that open real doors.";
            var supportEmail = section["SupportEmail"] ?? "hello@nextuniverse.edu";
            var location = section["Location"] ?? "Global · Remote First · Dhaka HQ";
            var supportWindow = section["SupportWindow"] ?? "Support 24/7 · Response within 4h";
            var statusText = section["StatusText"] ?? "All systems operational";

            var socialLinks = new[]
            {
                new
                {
                    key = "facebook",
                    label = "Facebook",
                    href = section["Social:Facebook"] ?? "https://facebook.com",
                    icon = "f"
                },
                new
                {
                    key = "twitter",
                    label = "Twitter",
                    href = section["Social:Twitter"] ?? "https://twitter.com",
                    icon = "𝕏"
                },
                new
                {
                    key = "linkedin",
                    label = "LinkedIn",
                    href = section["Social:LinkedIn"] ?? "https://linkedin.com",
                    icon = "in"
                },
                new
                {
                    key = "instagram",
                    label = "Instagram",
                    href = section["Social:Instagram"] ?? "https://instagram.com",
                    icon = "⌥"
                },
                new
                {
                    key = "youtube",
                    label = "YouTube",
                    href = section["Social:YouTube"] ?? "https://youtube.com",
                    icon = "▶"
                }
            };

            var data = new
            {
                brand = new
                {
                    name = siteName,
                    description = siteDescription,
                    supportEmail,
                    location,
                    supportWindow,
                    statusText
                },
                stats = new[]
                {
                    new { label = "Students", value = totalUsers },
                    new { label = "Courses", value = totalCourses },
                    new { label = "Competitions", value = totalCompetitions }
                },
                links = new
                {
                    platform = new[]
                    {
                        new { label = "Browse Courses", to = "/courses" },
                        new { label = "Universities", to = "/universities" },
                        new { label = "Departments", to = "/departments" },
                        new { label = "Community", to = "/community" },
                        new { label = "Clans", to = "/clans" },
                        new { label = "Competitions", to = "/competitions" }
                    },
                    company = new[]
                    {
                        new { label = "About Us", href = "/about" },
                        new { label = "Blog", href = "#blog" },
                        new { label = "Careers", href = "#careers" },
                        new { label = "Press", href = "#press" },
                        new { label = "Contact", href = "#contact" },
                        new { label = "Partners", href = "#partners" }
                    },
                    support = new[]
                    {
                        new { label = "Help Center", href = "#help" },
                        new { label = "Documentation", href = "#docs" },
                        new { label = "Become Instructor", href = "#instructors" },
                        new { label = "Affiliate Program", href = "#affiliate" },
                        new { label = "System Status", href = "#status" }
                    },
                    legal = new[]
                    {
                        new { label = "Privacy Policy", href = "#privacy" },
                        new { label = "Terms of Service", href = "#terms" },
                        new { label = "Cookie Policy", href = "#cookies" },
                        new { label = "Accessibility", href = "#accessibility" }
                    }
                },
                socials = socialLinks,
                ecosystem = new[]
                {
                    new { icon = "🏛️", label = "Universities", value = (int?)totalUniversities },
                    new { icon = "📐", label = "Departments", value = (int?)totalDepartments },
                    new { icon = "📚", label = "Courses", value = (int?)totalCourses },
                    new { icon = "💬", label = "Community", value = (int?)null },
                    new { icon = "⚔️", label = "Clans", value = (int?)activeClans },
                    new { icon = "🏆", label = "Competitions", value = (int?)totalCompetitions }
                },
                copy = new
                {
                    year = nowYear,
                    text = $"© {nowYear} {siteName}.",
                    suffix = "for learners worldwide."
                }
            };

            return Ok(new { success = true, data });
        }
    }
}
