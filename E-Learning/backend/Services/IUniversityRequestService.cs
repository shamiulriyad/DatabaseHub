using backend.DTOs;

namespace backend.Services
{
    public interface IUniversityRequestService
    {
        Task<ServiceResult<int>> CreateRequest(CreateUniversityRequestDTO dto, int requestedBy);
        Task<ServiceResult<List<UniversityRequestAdminDTO>>> GetRequests(string? status = null, int page = 1, int pageSize = 50);
        Task<ServiceResult<UniversityDTO>> ApproveRequest(int requestId, int adminId);
        Task<ServiceResult<bool>> RejectRequest(int requestId, int adminId, string? note = null);
    }
}
