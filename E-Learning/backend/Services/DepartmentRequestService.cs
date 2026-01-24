using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class DepartmentRequestService : IDepartmentRequestService
    {
        private readonly ApplicationDbContext _db;

        public DepartmentRequestService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<ServiceResult<int>> CreateRequest(CreateDepartmentRequestDTO dto, int requestedBy)
        {
            // validate university exists to avoid FK errors
            var universityExists = await _db.Universities.AnyAsync(u => u.Id == dto.UniversityId);
            if (!universityExists) return ServiceResult<int>.FailureResult("Selected university does not exist.");

            // prevent duplicate department name within the same university
            var exists = await _db.DepartmentRequests.AnyAsync(r => r.UniversityId == dto.UniversityId && r.DepartmentName.ToLower() == dto.DepartmentName.ToLower());
            if (exists) return ServiceResult<int>.FailureResult("A similar department request already exists.");

            var req = new DepartmentRequest
            {
                UniversityId = dto.UniversityId,
                DepartmentName = dto.DepartmentName,
                ShortCode = dto.ShortCode,
                RequestedBy = requestedBy,
                Note = dto.Note,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _db.DepartmentRequests.Add(req);
            await _db.SaveChangesAsync();
            return ServiceResult<int>.SuccessResult(req.Id);
        }

        public async Task<ServiceResult<List<DepartmentRequestAdminDTO>>> GetRequests(int? universityId = null, string? status = null, int page = 1, int pageSize = 50)
        {
            var q = _db.Set<DepartmentRequest>().AsQueryable();
            if (universityId.HasValue) q = q.Where(r => r.UniversityId == universityId.Value);
            if (!string.IsNullOrWhiteSpace(status)) q = q.Where(r => r.Status == status);

            var items = await q.OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new DepartmentRequestAdminDTO {
                    Id = r.Id,
                    UniversityId = r.UniversityId,
                    DepartmentName = r.DepartmentName,
                    ShortCode = r.ShortCode,
                    RequestedBy = r.RequestedBy,
                    Status = r.Status,
                    Note = r.Note,
                    CreatedAt = r.CreatedAt,
                    ReviewedAt = r.ReviewedAt
                }).ToListAsync();

            return ServiceResult<List<DepartmentRequestAdminDTO>>.SuccessResult(items);
        }

        public async Task<ServiceResult<bool>> ApproveRequest(int requestId, int adminId)
        {
            var req = await _db.Set<DepartmentRequest>().FindAsync(requestId);
            if (req == null) return ServiceResult<bool>.FailureResult("Request not found");
            if (req.Status != "Pending") return ServiceResult<bool>.FailureResult("Request already reviewed");

            // duplicate check in Departments
            var exists = await _db.Departments.AnyAsync(d => d.UniversityId == req.UniversityId && d.Name.ToLower() == req.DepartmentName.ToLower());
            if (exists) return ServiceResult<bool>.FailureResult("A department with the same name already exists in the selected university.");

            var code = req.ShortCode;
            if (string.IsNullOrWhiteSpace(code))
            {
                code = new string(req.DepartmentName.Where(char.IsLetterOrDigit).ToArray()).ToUpper();
                if (code.Length > 5) code = code.Substring(0, 5);
                if (string.IsNullOrWhiteSpace(code)) code = "DEPT" + DateTime.UtcNow.Ticks.ToString().Substring(0,4);
            }

            var dept = new Department
            {
                Name = req.DepartmentName,
                Code = code,
                UniversityId = req.UniversityId,
                Description = req.Note,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Departments.Add(dept);

            req.Status = "Approved";
            req.ReviewedAt = DateTime.UtcNow;
            _db.Set<DepartmentRequest>().Update(req);

            await _db.SaveChangesAsync();

            // real-time broadcasting removed (SignalR not required for departments)

            return ServiceResult<bool>.SuccessResult(true);
        }

        public async Task<ServiceResult<bool>> RejectRequest(int requestId, int adminId, string? note = null)
        {
            var req = await _db.Set<DepartmentRequest>().FindAsync(requestId);
            if (req == null) return ServiceResult<bool>.FailureResult("Request not found");
            if (req.Status != "Pending") return ServiceResult<bool>.FailureResult("Request already reviewed");

            req.Status = "Rejected";
            req.Note = note ?? req.Note;
            req.ReviewedAt = DateTime.UtcNow;
            _db.Set<DepartmentRequest>().Update(req);
            await _db.SaveChangesAsync();
            return ServiceResult<bool>.SuccessResult(true);
        }
    }
}
