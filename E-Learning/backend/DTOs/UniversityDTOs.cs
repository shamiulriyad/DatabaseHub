// DTOs/UniversityDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // University Create
    public class UniversityCreateDTO
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Website { get; set; }
        public string? Location { get; set; }
        public string? EstablishedYear { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public bool IsActive { get; set; } = true;
    }

    // University Update
    public class UniversityUpdateDTO
    {
        [MaxLength(200)]
        public string? Name { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Website { get; set; }
        public string? Location { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public bool? IsActive { get; set; }
    }

    // University Response
    public class UniversityDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? Website { get; set; }
        public string? Location { get; set; }
        public string? EstablishedYear { get; set; }
        public int TotalCourses { get; set; }
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public int TotalEnrollments { get; set; }
        public int UniversityRank { get; set; }
        public decimal AverageCourseRating { get; set; }
        public bool IsActive { get; set; }
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        // Indicates whether the current caller can edit this university
        public bool CanEdit { get; set; } = false;
    }

    // University Detail
    public class UniversityDetailDTO : UniversityDTO
    {
        public List<DepartmentDTO> Departments { get; set; }
        public List<CourseDTO> PopularCourses { get; set; }
        public List<TeacherDTO> TopTeachers { get; set; }
        public UniversityStatsDTO Stats { get; set; }
    }

    // University Stats
    public class UniversityStatsDTO
    {
        public int TotalDepartments { get; set; }
        public int TotalCourses { get; set; }
        public int TotalEnrollments { get; set; }
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public decimal AverageRating { get; set; }
        public int ActiveCompetitions { get; set; }
        public int ActiveClans { get; set; }
        public Dictionary<string, int> DepartmentDistribution { get; set; }
    }

    // Type aliases for interface compatibility
    public class CreateUniversityDTO : UniversityCreateDTO { }
    public class UpdateUniversityDTO : UniversityUpdateDTO { }
    public class StudentDTO : UserDTO { }
}