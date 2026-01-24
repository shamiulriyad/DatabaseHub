-- SQL Queries used in the project (examples)

-- 1) Create tables (sample)
CREATE TABLE Competitions (
  Id INT PRIMARY KEY IDENTITY(1,1),
  Title VARCHAR(256) NOT NULL,
  Description TEXT,
  StartDate DATETIME,
  EndDate DATETIME,
  IsApproved BIT DEFAULT 0,
  CreatorId INT,
  CreatedAt DATETIME DEFAULT GETUTCDATE()
);

CREATE TABLE CompetitionQuestions (
  Id INT PRIMARY KEY IDENTITY(1,1),
  CompetitionId INT NOT NULL,
  QuestionText TEXT NOT NULL,
  OptionA VARCHAR(512),
  OptionB VARCHAR(512),
  OptionC VARCHAR(512),
  OptionD VARCHAR(512),
  CorrectAnswer CHAR(1),
  Points INT DEFAULT 1,
  [Order] INT DEFAULT 0,
  CreatedAt DATETIME DEFAULT GETUTCDATE(),
  FOREIGN KEY (CompetitionId) REFERENCES Competitions(Id)
);

-- 2) Insert sample question
INSERT INTO CompetitionQuestions (CompetitionId, QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Points, [Order])
VALUES (1, 'What is 2+2?', '3', '4', '5', '6', 'B', 1, 1);

-- 3) Get participant-visible questions (example logic handled in backend):
SELECT q.Id, q.QuestionText, q.OptionA, q.OptionB, q.OptionC, q.OptionD, q.Points, q.[Order]
FROM CompetitionQuestions q
JOIN Competitions c ON c.Id = q.CompetitionId
WHERE q.CompetitionId = @competitionId
ORDER BY q.[Order];

-- 4) Participant registration
CREATE TABLE CompetitionParticipants (
  Id INT PRIMARY KEY IDENTITY(1,1),
  CompetitionId INT NOT NULL,
  UserId INT NOT NULL,
  JoinedAt DATETIME DEFAULT GETUTCDATE(),
  FOREIGN KEY (CompetitionId) REFERENCES Competitions(Id)
);

INSERT INTO CompetitionParticipants (CompetitionId, UserId) VALUES (1, 123);

-- Add more queries used in your features here.
