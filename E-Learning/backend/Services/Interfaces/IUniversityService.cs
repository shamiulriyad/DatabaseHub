using backend.DTOs;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IUniversityService
    {
        Task<ServiceResult<UniversityDTO>> CreateUniversity(CreateUniversityDTO dto);
        Task<ServiceResult<UniversityDTO>> GetUniversityById(int universityId, int? callerUserId = null);
        // If callerUserId is provided, returned UniversityDTOs will have `CanEdit` set accordingly.
        Task<ServiceResult<List<UniversityDTO>>> GetAllUniversities(int page, int pageSize, int? callerUserId = null);
        
        Task<ServiceResult<UniversityDTO>> UpdateUniversity(int universityId, UpdateUniversityDTO dto, int? callerUserId = null);
        Task<ServiceResult<bool>> DeleteUniversity(int universityId);
        Task<ServiceResult<List<CourseDTO>>> GetUniversityCourses(int universityId, int page, int pageSize);
        Task<ServiceResult<List<TeacherDTO>>> GetUniversityTeachers(int universityId, int page, int pageSize);
        Task<ServiceResult<List<StudentDTO>>> GetUniversityStudents(int universityId, int page, int pageSize);
        Task<ServiceResult<UniversityDetailDTO>> GetUniversityDetails(int universityId, int? callerUserId = null);
        Task<ServiceResult<UniversityStatsDTO>> GetUniversityStats(int universityId);
    }
}
