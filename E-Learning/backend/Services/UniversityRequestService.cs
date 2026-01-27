using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace backend.Services
{
    public class UniversityRequestService : IUniversityRequestService
    {
        private readonly ApplicationDbContext _db;

        public UniversityRequestService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<ServiceResult<int>> CreateRequest(CreateUniversityRequestDTO dto, int requestedBy)
        {
            // prevent duplicates by name
            var exists = await _db.Universities.AnyAsync(u => u.Name.ToLower() == dto.Name.ToLower());
            if (exists)
                return ServiceResult<int>.FailureResult("A university with the same name already exists.");

            var req = new UniversityRequest
            {
                Name = dto.Name,
                Description = dto.Description,
                Website = dto.Website,
                RequestedBy = requestedBy,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _db.Add(req);
            await _db.SaveChangesAsync();
            return ServiceResult<int>.SuccessResult(req.Id);
        }

        public async Task<ServiceResult<List<UniversityRequestAdminDTO>>> GetRequests(string? status = null, int page = 1, int pageSize = 50)
        {
            var q = _db.Set<UniversityRequest>().AsQueryable();
            if (!string.IsNullOrWhiteSpace(status)) q = q.Where(r => r.Status == status);

            var items = await q.OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new UniversityRequestAdminDTO {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Website = r.Website,
                    RequestedBy = r.RequestedBy,
                    Status = r.Status,
                    Note = r.Note,
                    CreatedAt = r.CreatedAt,
                    ReviewedAt = r.ReviewedAt
                }).ToListAsync();

            return ServiceResult<List<UniversityRequestAdminDTO>>.SuccessResult(items);
        }

        public async Task<ServiceResult<UniversityDTO>> ApproveRequest(int requestId, int adminId)
        {
            var req = await _db.Set<UniversityRequest>().FindAsync(requestId);
            if (req == null) return ServiceResult<UniversityDTO>.FailureResult("Request not found");
            if (req.Status != "Pending") return ServiceResult<UniversityDTO>.FailureResult("Request already reviewed");

            // duplicate check
            var exists = await _db.Universities.AnyAsync(u => u.Name.ToLower() == req.Name.ToLower());
            if (exists) return ServiceResult<UniversityDTO>.FailureResult("A university with same name already exists");

            var uni = new Models.University
            {
                Name = req.Name,
                Code = await GenerateUniqueCodeAsync(req.Name),
                Description = req.Description,
                Website = req.Website,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _db.Universities.Add(uni);

            req.Status = "Approved";
            req.ReviewedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            var dto = new UniversityDTO
            {
                Id = uni.Id,
                Name = uni.Name,
                Description = uni.Description,
                Website = uni.Website,
                LogoUrl = uni.LogoUrl,
                BannerUrl = uni.BannerUrl,
                Location = uni.Location,
                EstablishedYear = uni.EstablishedYear,
                IsActive = uni.IsActive,
                CreatedAt = uni.CreatedAt
            };

            return ServiceResult<UniversityDTO>.SuccessResult(dto, "University created and approved");
        }

        public async Task<ServiceResult<bool>> RejectRequest(int requestId, int adminId, string? note = null)
        {
            var req = await _db.Set<UniversityRequest>().FindAsync(requestId);
            if (req == null) return ServiceResult<bool>.FailureResult("Request not found");
            if (req.Status != "Pending") return ServiceResult<bool>.FailureResult("Request already reviewed");

            req.Status = "Rejected";
            req.Note = note ?? req.Note;
            req.ReviewedAt = DateTime.UtcNow;
            // Do not call Update(req) to avoid marking all properties modified
            // (prevents sending unspecified DateTime kinds back to the DB).
            await _db.SaveChangesAsync();
            return ServiceResult<bool>.SuccessResult(true);
        }

        private async Task<string> GenerateUniqueCodeAsync(string name)
        {
            // create a slug-like code from the name
            var baseCode = Regex.Replace(name?.Trim().ToLower() ?? string.Empty, "[^a-z0-9]+", "-").Trim('-');
            if (string.IsNullOrEmpty(baseCode)) baseCode = "university";
            // limit to 50 chars (DTO max)
            if (baseCode.Length > 50) baseCode = baseCode.Substring(0, 50);

            var code = baseCode;
            var suffix = 0;
            while (await _db.Universities.AnyAsync(u => u.Code == code))
            {
                suffix++;
                var suffixStr = $"-{suffix}";
                var maxBaseLen = 50 - suffixStr.Length;
                var truncated = baseCode.Length > maxBaseLen ? baseCode.Substring(0, maxBaseLen) : baseCode;
                code = truncated + suffixStr;
            }

            return code;
        }
    }
}
