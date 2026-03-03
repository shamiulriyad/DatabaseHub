namespace backend.DTOs
{
    public class UserProgressionDTO
    {
        public int UserId { get; set; }
        public string Username { get; set; } = null!;
        public long Exp { get; set; }
        public int Level { get; set; }
        public long? NextLevelRequiredExp { get; set; }
        public long ExpToNextLevel { get; set; }
    }

    public class CompetitionHistoryItemDTO
    {
        public int CompetitionId { get; set; }
        public string CompetitionTitle { get; set; } = null!;
        public int ClanTeamId { get; set; }
        public string ClanTeamName { get; set; } = null!;
        public int Position { get; set; }
        public int EarnedExp { get; set; }
        public DateTime Date { get; set; }
    }
}
