// DTOs/DepartmentDTOs.cs
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // Department Create
    public class DepartmentCreateDTO
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; }

        [Required]
        public int UniversityId { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        public string? HeadOfDepartment { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string DepartmentType { get; set; } = "Engineering";
        public bool IsActive { get; set; } = true;
        public string? BannerUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
    }

    // Department Update
    public class DepartmentUpdateDTO
    {
        [MaxLength(200)]
        public string? Name { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        public string? HeadOfDepartment { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? DepartmentType { get; set; }
        public bool? IsActive { get; set; }
    }

    // Department Response
    public class DepartmentDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public int UniversityId { get; set; }
        public string UniversityName { get; set; }
        public string? Description { get; set; }
        public string? BannerUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? HeadOfDepartment { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string DepartmentType { get; set; }
        public int TotalCourses { get; set; }
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public decimal AverageCourseRating { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Department Detail
    public class DepartmentDetailDTO : DepartmentDTO
    {
        public UniversityDTO University { get; set; }
        public List<CourseDTO> Courses { get; set; }
        public List<TeacherDTO> Teachers { get; set; }
        public DepartmentStatsDTO Stats { get; set; }
    }

    // Department Stats
    public class DepartmentStatsDTO
    {
        public int TotalCourses { get; set; }
        public int TotalEnrollments { get; set; }
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public decimal AverageRating { get; set; }
        public decimal AverageCompletionRate { get; set; }
        public Dictionary<string, int> CourseLevelDistribution { get; set; }
        public List<TopCourseDTO> TopCourses { get; set; }
    }

    // Type aliases for interface compatibility
    public class CreateDepartmentDTO : DepartmentCreateDTO { }
    public class UpdateDepartmentDTO : DepartmentUpdateDTO { }
}