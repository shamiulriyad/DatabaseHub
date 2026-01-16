-- Debug Competition and Questions
-- Run this query to check competition status and questions

-- 1. Check competitions with their dates and question count
SELECT 
    c.Id,
    c.Title,
    c.StartDate,
    c.EndDate,
    c.IsApproved,
    c.Status,
    c.TotalQuestions,
    c.CreatorId,
    c.CreatorRole,
    c.ParticipantCount,
    c.CreatedAt,
    GETUTCDATE() AS CurrentUTC,
    CASE 
        WHEN c.IsApproved = 0 THEN 'Pending Approval'
        WHEN GETUTCDATE() < c.StartDate THEN 'Upcoming'
        WHEN GETUTCDATE() < c.EndDate THEN 'Ongoing'
        ELSE 'Completed'
    END AS CalculatedStatus,
    (SELECT COUNT(*) FROM CompetitionQuestions WHERE CompetitionId = c.Id) AS ActualQuestionCount
FROM Competitions c
ORDER BY c.CreatedAt DESC;

-- 2. Check questions for each competition
SELECT 
    cq.Id,
    cq.CompetitionId,
    c.Title AS CompetitionTitle,
    cq.QuestionText,
    cq.OptionA,
    cq.OptionB,
    cq.OptionC,
    cq.OptionD,
    cq.CorrectAnswer,
    cq.Points,
    cq.[Order],
    cq.CreatedAt
FROM CompetitionQuestions cq
INNER JOIN Competitions c ON cq.CompetitionId = c.Id
ORDER BY cq.CompetitionId, cq.[Order];

-- 3. Check participants
SELECT 
    cp.Id,
    cp.CompetitionId,
    c.Title AS CompetitionTitle,
    cp.UserId,
    u.UserName,
    cp.Score,
    cp.Rank,
    cp.JoinedAt,
    cp.CompletedAt
FROM CompetitionParticipants cp
INNER JOIN Competitions c ON cp.CompetitionId = c.Id
INNER JOIN Users u ON cp.UserId = u.Id
ORDER BY cp.CompetitionId, cp.JoinedAt;

-- 4. Check specific competition (replace with actual ID)
-- Example: Get details for competition ID = 1
DECLARE @CompetitionId INT = (SELECT TOP 1 Id FROM Competitions ORDER BY CreatedAt DESC);

SELECT 
    'Competition Info' AS InfoType,
    c.Id,
    c.Title,
    c.StartDate,
    c.EndDate,
    GETUTCDATE() AS CurrentUTC,
    CASE 
        WHEN c.IsApproved = 0 THEN 'Pending Approval'
        WHEN GETUTCDATE() < c.StartDate THEN 'Upcoming'
        WHEN GETUTCDATE() < c.EndDate THEN 'Ongoing'
        ELSE 'Completed'
    END AS CurrentStatus,
    DATEDIFF(MINUTE, GETUTCDATE(), c.StartDate) AS MinutesUntilStart,
    DATEDIFF(MINUTE, GETUTCDATE(), c.EndDate) AS MinutesUntilEnd
FROM Competitions c
WHERE c.Id = @CompetitionId;

-- 5. Time comparison check
SELECT 
    GETUTCDATE() AS 'Current UTC Time',
    GETDATE() AS 'Current Local Time',
    DATEDIFF(HOUR, GETUTCDATE(), GETDATE()) AS 'UTC Offset Hours';
