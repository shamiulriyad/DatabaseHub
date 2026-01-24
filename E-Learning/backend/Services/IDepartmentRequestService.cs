using backend.DTOs;

namespace backend.Services
{
    public interface IDepartmentRequestService
    {
        Task<ServiceResult<int>> CreateRequest(CreateDepartmentRequestDTO dto, int requestedBy);
        Task<ServiceResult<List<DepartmentRequestAdminDTO>>> GetRequests(int? universityId = null, string? status = null, int page = 1, int pageSize = 50);
        Task<ServiceResult<bool>> ApproveRequest(int requestId, int adminId);
        Task<ServiceResult<bool>> RejectRequest(int requestId, int adminId, string? note = null);
    }
}
