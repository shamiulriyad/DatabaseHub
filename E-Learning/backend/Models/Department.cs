using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Departments")]
    public class Department
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = null!; // CSE, BBA, EEE, Civil, Mechanical, etc.

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = null!; // CSE, BBA, EEE

        [Required]
        public int UniversityId { get; set; }

        public string? Description { get; set; }
        public string? BannerUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? HeadOfDepartment { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }

        // Department Stats
        public int TotalCourses { get; set; } = 0;
        public int TotalStudents { get; set; } = 0;
        public int TotalTeachers { get; set; } = 0;
        public decimal AverageCourseRating { get; set; } = 0;

        // Department Type
        [MaxLength(50)]
        public string DepartmentType { get; set; } = "Engineering"; // Engineering, Business, Science, Arts

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // Navigation Properties
        [ForeignKey("UniversityId")]
        public virtual University University { get; set; } = null!;

        public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    }
}