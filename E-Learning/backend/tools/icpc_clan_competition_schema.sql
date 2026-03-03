-- ICPC-style clan competition schema extension
-- Safe to run after backing up DB and reviewing naming compatibility.

-- 1) Seasons
IF OBJECT_ID('CompetitionSeasons', 'U') IS NULL
BEGIN
    CREATE TABLE CompetitionSeasons (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(120) NOT NULL,
        StartDate DATETIME2 NOT NULL,
        EndDate DATETIME2 NOT NULL,
        IsActive BIT NOT NULL DEFAULT(0),
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;

-- 2) Clan competitions (admin controlled)
IF OBJECT_ID('ClanCompetitions', 'U') IS NULL
BEGIN
    CREATE TABLE ClanCompetitions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        CompetitionPeriod NVARCHAR(20) NOT NULL, -- Weekly/Monthly/Seasonal
        SeasonId INT NULL,
        StartAt DATETIME2 NOT NULL,
        EndAt DATETIME2 NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT('Draft'), -- Draft/Scheduled/Active/Completed/Finalized
        TeamMinSize INT NOT NULL DEFAULT(3),
        TeamMaxSize INT NOT NULL DEFAULT(4),
        TopTeamsCountForClanScore INT NOT NULL DEFAULT(2),
        CreatedByAdminId INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_ClanCompetitions_Season FOREIGN KEY (SeasonId) REFERENCES CompetitionSeasons(Id),
        CONSTRAINT FK_ClanCompetitions_Admin FOREIGN KEY (CreatedByAdminId) REFERENCES Users(Id)
    );
END;

-- 3) Competition challenge type configuration (weights)
IF OBJECT_ID('ClanCompetitionChallengeTypes', 'U') IS NULL
BEGIN
    CREATE TABLE ClanCompetitionChallengeTypes (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CompetitionId INT NOT NULL,
        ChallengeType NVARCHAR(30) NOT NULL, -- ProblemSolving/Quiz/Speed/Debugging/Logical/AI
        Weight DECIMAL(6,4) NOT NULL,
        IsEnabled BIT NOT NULL DEFAULT(1),
        CONSTRAINT FK_ChallengeTypes_Competition FOREIGN KEY (CompetitionId) REFERENCES ClanCompetitions(Id)
    );
END;

-- 4) Challenges
IF OBJECT_ID('ClanCompetitionChallenges', 'U') IS NULL
BEGIN
    CREATE TABLE ClanCompetitionChallenges (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CompetitionId INT NOT NULL,
        ChallengeType NVARCHAR(30) NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        MaxScore INT NOT NULL,
        TimeLimitSeconds INT NULL,
        MetadataJson NVARCHAR(MAX) NULL,
        IsActive BIT NOT NULL DEFAULT(1),
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Challenges_Competition FOREIGN KEY (CompetitionId) REFERENCES ClanCompetitions(Id)
    );
END;

-- 5) Team registration (no solo)
IF OBJECT_ID('ClanCompetitionTeamRegistrations', 'U') IS NULL
BEGIN
    CREATE TABLE ClanCompetitionTeamRegistrations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CompetitionId INT NOT NULL,
        ClanId INT NOT NULL,
        TeamId INT NOT NULL,
        RegisteredByUserId INT NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT('Registered'), -- Registered/Active/Completed/Disqualified/Withdrawn
        RegisteredAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_TeamReg_Competition FOREIGN KEY (CompetitionId) REFERENCES ClanCompetitions(Id),
        CONSTRAINT FK_TeamReg_Clan FOREIGN KEY (ClanId) REFERENCES Clans(Id),
        CONSTRAINT FK_TeamReg_Team FOREIGN KEY (TeamId) REFERENCES Teams(Id),
        CONSTRAINT FK_TeamReg_User FOREIGN KEY (RegisteredByUserId) REFERENCES Users(Id)
    );

    CREATE UNIQUE INDEX UX_TeamReg_Competition_Team
    ON ClanCompetitionTeamRegistrations(CompetitionId, TeamId);
END;

-- 6) Submissions
IF OBJECT_ID('ClanCompetitionSubmissions', 'U') IS NULL
BEGIN
    CREATE TABLE ClanCompetitionSubmissions (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        CompetitionId INT NOT NULL,
        TeamId INT NOT NULL,
        ClanId INT NOT NULL,
        ChallengeId INT NOT NULL,
        SubmittedByUserId INT NOT NULL,
        AttemptNo INT NOT NULL DEFAULT(1),
        PayloadJson NVARCHAR(MAX) NULL,
        Verdict NVARCHAR(30) NOT NULL DEFAULT('Pending'), -- Pending/Accepted/WrongAnswer/RuntimeError/TimeLimit/Scored
        Score INT NOT NULL DEFAULT(0),
        PenaltySeconds INT NOT NULL DEFAULT(0),
        SubmittedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        EvaluatedAt DATETIME2 NULL,
        CONSTRAINT FK_Sub_Competition FOREIGN KEY (CompetitionId) REFERENCES ClanCompetitions(Id),
        CONSTRAINT FK_Sub_Team FOREIGN KEY (TeamId) REFERENCES Teams(Id),
        CONSTRAINT FK_Sub_Clan FOREIGN KEY (ClanId) REFERENCES Clans(Id),
        CONSTRAINT FK_Sub_Challenge FOREIGN KEY (ChallengeId) REFERENCES ClanCompetitionChallenges(Id),
        CONSTRAINT FK_Sub_User FOREIGN KEY (SubmittedByUserId) REFERENCES Users(Id)
    );

    CREATE INDEX IX_Sub_Competition_Team ON ClanCompetitionSubmissions(CompetitionId, TeamId);
    CREATE INDEX IX_Sub_Competition_Challenge ON ClanCompetitionSubmissions(CompetitionId, ChallengeId);
END;

-- 7) Aggregated team scores
IF OBJECT_ID('ClanCompetitionTeamScores', 'U') IS NULL
BEGIN
    CREATE TABLE ClanCompetitionTeamScores (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        CompetitionId INT NOT NULL,
        TeamId INT NOT NULL,
        ClanId INT NOT NULL,
        TotalScore DECIMAL(12,2) NOT NULL DEFAULT(0),
        PenaltySeconds INT NOT NULL DEFAULT(0),
        ScoreBreakdownJson NVARCHAR(MAX) NULL,
        RankNo INT NULL,
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_TeamScore_Competition FOREIGN KEY (CompetitionId) REFERENCES ClanCompetitions(Id),
        CONSTRAINT FK_TeamScore_Team FOREIGN KEY (TeamId) REFERENCES Teams(Id),
        CONSTRAINT FK_TeamScore_Clan FOREIGN KEY (ClanId) REFERENCES Clans(Id)
    );

    CREATE UNIQUE INDEX UX_TeamScore_Competition_Team
    ON ClanCompetitionTeamScores(CompetitionId, TeamId);
END;

-- 8) Aggregated clan scores
IF OBJECT_ID('ClanCompetitionClanScores', 'U') IS NULL
BEGIN
    CREATE TABLE ClanCompetitionClanScores (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        CompetitionId INT NOT NULL,
        ClanId INT NOT NULL,
        TotalScore DECIMAL(12,2) NOT NULL DEFAULT(0),
        RankNo INT NULL,
        TeamCount INT NOT NULL DEFAULT(0),
        ScoreBreakdownJson NVARCHAR(MAX) NULL,
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ClanScore_Competition FOREIGN KEY (CompetitionId) REFERENCES ClanCompetitions(Id),
        CONSTRAINT FK_ClanScore_Clan FOREIGN KEY (ClanId) REFERENCES Clans(Id)
    );

    CREATE UNIQUE INDEX UX_ClanScore_Competition_Clan
    ON ClanCompetitionClanScores(CompetitionId, ClanId);
END;

-- 9) Suggested team plan to leaders
IF OBJECT_ID('ClanTeamSuggestions', 'U') IS NULL
BEGIN
    CREATE TABLE ClanTeamSuggestions (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        CompetitionId INT NOT NULL,
        ClanId INT NOT NULL,
        SuggestedTeamCount INT NOT NULL,
        SuggestionJson NVARCHAR(MAX) NULL,
        GeneratedByAdminId INT NOT NULL,
        GeneratedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        IsNotified BIT NOT NULL DEFAULT(0),
        NotifiedAt DATETIME2 NULL,
        CONSTRAINT FK_Suggestion_Competition FOREIGN KEY (CompetitionId) REFERENCES ClanCompetitions(Id),
        CONSTRAINT FK_Suggestion_Clan FOREIGN KEY (ClanId) REFERENCES Clans(Id),
        CONSTRAINT FK_Suggestion_Admin FOREIGN KEY (GeneratedByAdminId) REFERENCES Users(Id)
    );

    CREATE UNIQUE INDEX UX_Suggestion_Competition_Clan
    ON ClanTeamSuggestions(CompetitionId, ClanId);
END;
