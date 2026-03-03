**Project Schema Overview**

This document summarizes the entities (models) used in the project and their relationships. It groups related entities by domain and provides a high-level Graphviz DOT diagram you can render with `dot` or a PlantUML alternative.

**How to render**
- Install Graphviz and run: `dot -Tpng docs/schema/high_level_er.dot -o docs/schema/high_level_er.png` to get a PNG.
- Or paste the DOT into an online graphviz renderer.

**Legend**
- PK = Primary Key
- FK = Foreign Key
- 1 = one, * = many

**Domains covered**
- Auth / Users
- Courses & Content (Course / Module / Lesson)
- Enrollment & Progress
- Payments
- Community (Posts / Comments / Votes)
- Clans
- Competitions
- Notifications & Admin (TeacherApplications, Department/University requests)

---

**1. Auth / Users**
- `User` (PK: `Id`)
  - notable fields: `UserName`, `Email`, `PasswordHash`, `IsTeacher`, `Points`, `Rank`, `ProfileImageUrl`, `Roles`.
- Relationships
  - `User` 1 — * `Enrollment` (UserId)
  - `User` 1 — * `Payment` (UserId)
  - `User` 1 — * `Post` (AuthorId)
  - `User` 1 — * `Comment` (AuthorId)
  - `User` 1 — * `Notification` (RecipientId)
  - `User` 1 — * `TeacherApplication` (ApplicantId)
  - `User` * — * `Clan` via `ClanMember` (UserId, ClanId)
  - `User` * — * `Competition` via `CompetitionParticipant` (UserId, CompetitionId)

**2. Courses & Content**
- `Course` (PK: `Id`)
  - notable fields: `Title`, `Description`, `Price`, `Category`, `Level`, `CreatorId` (User/Teacher), `UniversityId` (optional)
- `Module` (PK: `Id`)
  - fields: `CourseId` (FK)
- `Lesson` (PK: `Id`)
  - fields: `ModuleId` (FK), `Content`, `Duration`
- `CoursePart` if present: groups content pieces inside module/lesson
- `Review` (PK: `Id`) — FK `CourseId`, `UserId`
- Relationships
  - `Course` 1 — * `Module`  (CourseId)
  - `Module` 1 — * `Lesson` (ModuleId)
  - `Course` 1 — * `Review` (CourseId)
  - `Course` 1 — * `Enrollment` (CourseId)

**3. Enrollment & Progress**
- `Enrollment` (PK: `Id`)
  - fields: `UserId` (FK), `CourseId` (FK), `Progress`, `Grade`, `Status` (enrolled/completed)
- `LessonProgress` (PK: `Id`)
  - fields: `UserId`, `LessonId`, `Completed`, `LastWatchedAt`
- Relationships
  - `User` 1 — * `Enrollment` — 1 `Course`
  - `User` 1 — * `LessonProgress` — 1 `Lesson`

**4. Payments**
- `Payment` (PK: `Id`)
  - fields: `UserId`, `EnrollmentId` (nullable), `Amount`, `Provider`, `TransactionId`, `Status`, `CreatedAt`
- Relationships
  - `Payment` * — 1 `User`
  - `Payment` * — 1 `Enrollment` (optional link)

**5. Community (Posts / Comments / Votes)**
- `Post` (PK: `Id`)
  - fields: `AuthorId` (User), `Title`, `Content`, `CreatedAt`, `Tags` (JSON/array)
- `Comment` (PK: `Id`) — FK `PostId`, `AuthorId`
- `PostVote` (PK: `Id`) — FK `PostId`, `UserId`, `Value`
- `CommentVote` (PK: `Id`) — FK `CommentId`, `UserId`, `Value`
- `Post` 1 — * `Comment`
- `Post` 1 — * `PostVote`
- `Comment` 1 — * `CommentVote`

**6. Clans**
- `Clan` (PK: `Id`)
  - fields: `Name`, `Tag`, `LeaderId` (User), `FocusSubjects` (JSON/array), `Description`, `Stats` (members count, points)
- `ClanMember` (PK: `Id`) — FK `ClanId`, `UserId`, `Role` (member/officer)
- `ClanAnnouncement` (PK: `Id`) — FK `ClanId`, `AuthorId`
- `ClanJoinRequest` (PK: `Id`) — FK `ClanId`, `UserId`, `Status`
- Relationships
  - `Clan` 1 — * `ClanMember` — 1 `User`
  - `Clan` 1 — * `ClanAnnouncement`
  - `Clan` 1 — * `ClanJoinRequest`

**7. Competitions**
- `Competition` (PK: `Id`)
  - fields: `Title`, `Description`, `StartAt`, `EndAt`, `Type`, `Prize`, `CreatorId`
- `CompetitionParticipant` (PK: `Id`) — FK `CompetitionId`, `UserId`, `Score`, `Rank`
- `CompetitionQuestion` (PK: `Id`) — FK `CompetitionId`, `QuestionPayload`
- `CompetitionScore` (PK: `Id`) — FK `CompetitionId`, `UserId`, `Value`
- Relationships
  - `Competition` 1 — * `CompetitionParticipant`
  - `Competition` 1 — * `CompetitionQuestion`

**8. Notifications & Admin**
- `Notification` (PK: `Id`) — FK `RecipientId` (User), `SenderId` (nullable), `Type`, `Payload` (JSON), `IsRead`
- `TeacherApplication` (PK: `Id`) — FK `ApplicantId` (User), `Status`, `Portfolio` (JSON)
- `DepartmentRequest` / `UniversityRequest` entities link to `University` and `User` for administrative flows.

---

**High-level Graphviz DOT (overview)**

Save below as `docs/schema/high_level_er.dot` and render with Graphviz for a visual overview.

```
// docs/schema/high_level_er.dot
digraph ER {
  rankdir=LR;
  node [shape=record, fontname=Helvetica];

  User [label="{User|PK Id\lUserName\lEmail\lIsTeacher\lPoints\lRank\l}" ];
  Course [label="{Course|PK Id\lTitle\lPrice\lCategory\lCreatorId\l}" ];
  Module [label="{Module|PK Id\lCourseId (FK)\lTitle\l}" ];
  Lesson [label="{Lesson|PK Id\lModuleId (FK)\lTitle\l}" ];
  Enrollment [label="{Enrollment|PK Id\lUserId (FK)\lCourseId (FK)\lProgress\lStatus\l}" ];
  Payment [label="{Payment|PK Id\lUserId (FK)\lEnrollmentId (FK)\lAmount\lStatus\l}" ];

  Post [label="{Post|PK Id\lAuthorId (FK)\lTitle\lContent\l}" ];
  Comment [label="{Comment|PK Id\lPostId (FK)\lAuthorId (FK)\lContent\l}" ];
  PostVote [label="{PostVote|PK Id\lPostId (FK)\lUserId (FK)\lValue\l}" ];

  Clan [label="{Clan|PK Id\lName\lLeaderId\lFocusSubjects\l}" ];
  ClanMember [label="{ClanMember|PK Id\lClanId (FK)\lUserId (FK)\lRole\l}" ];

  Competition [label="{Competition|PK Id\lTitle\lStartAt\lEndAt\l}" ];
  CompetitionParticipant [label="{CompetitionParticipant|PK Id\lCompetitionId (FK)\lUserId (FK)\lScore\l}" ];

  // relationships
  User -> Enrollment [label="1..*", dir=both];
  Course -> Enrollment [label="1..*", dir=both];
  Course -> Module [label="1..*", dir=both];
  Module -> Lesson [label="1..*", dir=both];

  User -> Payment [label="1..*"];
  Enrollment -> Payment [label="0..1"];

  User -> Post [label="1..*"];
  Post -> Comment [label="1..*"];
  User -> Comment [label="1..*"];
  Post -> PostVote [label="0..*"];

  Clan -> ClanMember [label="1..*"];
  User -> ClanMember [label="1..*"];

  Competition -> CompetitionParticipant [label="1..*"];
  User -> CompetitionParticipant [label="1..*"];
}
```

---

**Notes, cardinalities and implementation details**
- Many join tables (e.g., `ClanMember`, `CompetitionParticipant`, `PostVote`) implement many-to-many relationships with additional metadata (role, score, value).
- Several fields are stored as JSON/JSONB (e.g., `FocusSubjects`, `Tags`, `Answers`, `Payload`) for flexibility — represented in models as arrays or object fields.
- `Enrollment` is the central pivot linking `User` and `Course` and ties to `Payment` and progress tracking.
- `LessonProgress` tracks per-lesson completion per user which enables fine-grained progress reporting.
- `Notification` is general-purpose with `Payload` to accommodate many notification types (comment, grade, clan invite, competition result).

---

**Files created**
- `docs/schema/ER_Diagrams.md` (this file)
- `docs/schema/high_level_er.dot` (DOT file created alongside)

If you want, I can:
- export PNG/SVG diagrams using Graphviz and add them to `docs/schema/`,
- generate PlantUML versions,
- produce a separate detailed DOT per domain (Courses, Community, Clans, Competitions), or
- create SQL DDL per entity grouped the same way (I previously generated full DDL).

Which of the above follow-ups do you want next?