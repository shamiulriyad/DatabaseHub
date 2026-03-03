using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    public class MonthCountDTO
    {
        public string Period { get; set; } = string.Empty; // e.g., "2026-02" or "Feb 2026"
        public int Count { get; set; }
    }

    public class ChartDataDTO
    {
        public List<string> Labels { get; set; } = new List<string>();
        public List<decimal> Data { get; set; } = new List<decimal>();
    }

    public class CompetitionParticipationDTO
    {
        public int CompetitionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int ParticipantCount { get; set; }
    }

    public class AdminHomepageDTO
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalUniversities { get; set; }
        public int TotalDepartments { get; set; }
        public int TotalCourses { get; set; }
        public int ActiveClans { get; set; }
        public int OngoingCompetitions { get; set; }
        public decimal Revenue { get; set; }

        // Charts
        public List<MonthCountDTO> MonthlyUserRegistrations { get; set; } = new List<MonthCountDTO>();
        public List<MonthCountDTO> MonthlyCourseEnrollments { get; set; } = new List<MonthCountDTO>();
        public List<MonthCountDTO> MonthlyCompetitionParticipants { get; set; } = new List<MonthCountDTO>();

        // Chart-friendly object for front-end convenience
        public Dictionary<string, ChartDataDTO> Charts { get; set; } = new Dictionary<string, ChartDataDTO>();

        // Top competitions by participation
        public List<CompetitionParticipationDTO> TopCompetitions { get; set; } = new List<CompetitionParticipationDTO>();

        // Optional snapshots
        public int TotalEnrollments { get; set; }
    }
}
