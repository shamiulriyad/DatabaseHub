# ICPC-Style Clan Competition System (Implementation Blueprint)

## 1) Core Rules Enforced

- Participation is **team + clan only** (no solo participant).
- Competition lifecycle is **admin controlled**.
- Team size is fixed as **min 3, max 4** members.
- Multiple challenge types contribute to final score using weighted scoring.

---

## 2) Roles & Responsibilities

### Admin
- Create Weekly / Monthly / Seasonal competitions.
- Define challenge mix and scoring weights:
  - Problem Solving (ICPC)
  - Quiz/MCQ
  - Speed Coding
  - Debugging
  - Logical/Puzzle
  - AI/Simulation (optional)
- Track clan rank/points.
- Generate suggested team count by rank/points.
- Notify clan leaders with suggestion + competition details.
- Finalize scoring, publish leaderboard, finalize seasonal ranking.

### Clan Leader
- Receive notifications.
- Create and manage teams from clan members.
- Register teams to competition.

### Team Member
- Join leader-created team.
- Submit challenge attempts as team participants.

---

## 3) Data Model Additions

Use new tables (script in `backend/tools/icpc_clan_competition_schema.sql`):

- `CompetitionSeasons`
- `ClanCompetitions` (admin-created competition metadata)
- `ClanCompetitionChallengeTypes` (challenge type + weight)
- `ClanCompetitionChallenges` (actual tasks/problems/MCQ sets)
- `ClanCompetitionTeamRegistrations`
- `ClanCompetitionSubmissions`
- `ClanCompetitionTeamScores`
- `ClanCompetitionClanScores`
- `ClanTeamSuggestions`

Existing tables reused:
- `Clans`, `ClanMembers`, `Teams`, `TeamMembers`, `Notifications`.

---

## 4) API Contract (MVP)

### Admin
- `POST /api/admin/clan-competitions`
- `GET /api/admin/clan-competitions`
- `GET /api/admin/clans/ranking`
- `POST /api/admin/clan-competitions/{competitionId}/suggest-teams`
- `POST /api/admin/clan-competitions/{competitionId}/finalize`

### Leader
- `GET /api/clans/{clanId}/team-suggestions`
- `POST /api/clans/{clanId}/teams` (leader only, enforce 3-4)
- `POST /api/clan-competitions/{competitionId}/register-team`

### Team participation
- `GET /api/clan-competitions/{competitionId}/challenges`
- `POST /api/clan-competitions/{competitionId}/teams/{teamId}/submissions`
- `GET /api/clan-competitions/{competitionId}/leaderboard`

### Notifications
- `GET /api/notifications`
- `POST /api/notifications/{id}/read`

---

## 5) Team Suggestion Policy (Deterministic)

- Rank percentile based allocation:
  - Top 10% clans => suggest up to 5 teams
  - Next 20% => up to 3 teams
  - Remaining => 1-2 teams (based on active member count)
- Hard cap by eligible members: `floor(activeMemberCount / 3)`

---

## 6) Scoring Model

For each challenge type `i`, define weight `w_i` where `sum(w_i)=1`.

- Team final score:

`TeamScore = Σ (TypeScore_i × w_i)`

- Clan competition score:

`ClanScore = sum(top N team scores)` (default `N=2`, configurable)

- Seasonal points:

`SeasonClanPoints += CompetitionClanScore`

Tie-breakers:
1. Higher solved/correct count
2. Lower total penalty/time
3. Earlier final accepted timestamp

---

## 7) Background Jobs

- Schedule start/end transitions by UTC.
- Auto-finalize scoring when competition ends.
- Push notifications for:
  - suggestion generated
  - registration open/close
  - result published
- Seasonal closure job every 6 months.

---

## 8) Permission Rules

- Admin endpoints => Admin role only.
- Team creation/assignment => clan leader (or delegated co-leader if enabled).
- Submission endpoints reject if:
  - team not registered,
  - participant not in team,
  - team size outside [3,4],
  - competition not active.

---

## 9) Frontend Deliverables (MVP)

- Admin dashboard:
  - clan rank table (points, rank)
  - competition create form
  - challenge type weight matrix
  - team suggestion + notify action
- Leader panel:
  - notifications
  - suggested teams
  - team formation UI (3-4 enforcement)
- Competition pages:
  - challenge list by type
  - team submissions
  - live leaderboard (team + clan)

---

## 10) Implementation Order

1. Schema + DTO + service interfaces
2. Admin competition endpoints
3. Team suggestion + notifications
4. Team registration + submissions
5. Scoring + leaderboard + seasonal aggregation
6. UI modules (admin, leader, competition)
