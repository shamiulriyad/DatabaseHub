# Clan-Based Competition Platform (Scalable Design)

## 1) Goal
Admin এমন multi-type competition তৈরি করবে যেখানে:
- competition entity আলাদা থাকবে
- leaderboard per-competition isolated থাকবে
- participation হবে **clan team only**
- per-clan team limit enforce হবে
- performance-based clan suggestion হবে **competition type অনুযায়ী**

---

## 2) Recommended Data Model (Normalized)

> Existing `Competitions`, `Teams`, `Clans`, `CompetitionRegistrations`, `CompetitionScores` টেবিল রেখে incremental migration-friendly extension.

### 2.1 Master Tables

#### `competition_types`
- `id` (PK)
- `code` (unique) — `PROGRAMMING_MCQ`, `DEBUG_FIX`, `QUIZ`
- `name`
- `ranking_strategy` — `SCORE_TIME`, `ACM_PENALTY`, `WEIGHTED_MULTI`
- `default_scoring_config` (jsonb)
- `is_active`
- `created_at`

Indexes:
- unique(`code`)
- index(`is_active`)

#### `competitions` (extend existing)
Add columns:
- `competition_type_id` (FK -> competition_types.id)
- `max_teams_per_clan` (int, required, check > 0)
- `participation_mode` (enum/text) default `CLAN_TEAM_ONLY`
- `ranking_config` (jsonb)
- `submission_policy` (jsonb)

Keep:
- title, description, start/end, status, scoring_system, rules, etc.

Indexes:
- (`competition_type_id`, `status`)
- (`start_date`, `end_date`)

---

### 2.2 Participation Tables

#### `competition_team_entries` (new)
Purpose: specific competition-এ কোন team participate করছে

- `id` (PK)
- `competition_id` (FK)
- `clan_id` (FK)
- `team_id` (FK)
- `entry_status` (`PENDING`,`APPROVED`,`REJECTED`,`WITHDRAWN`)
- `approved_at`, `approved_by`
- `created_at`

Constraints:
- unique(`competition_id`, `team_id`)
- FK consistency (`team.clan_id == clan_id`) service-level + trigger-level validation

Team-limit enforcement:
- DB trigger before insert/update:
  - count approved/pending team entries for (`competition_id`, `clan_id`)
  - reject if count >= `competitions.max_teams_per_clan`

Indexes:
- (`competition_id`, `clan_id`, `entry_status`)
- (`competition_id`, `team_id`)

#### `competition_team_members_snapshot` (new)
Purpose: competition start moment-এ team roster freeze

- `id` (PK)
- `competition_team_entry_id` (FK)
- `user_id` (FK)
- `snapshot_at`

Constraint:
- unique(`competition_team_entry_id`, `user_id`)

---

### 2.3 Submission and Score Tables

#### `competition_submissions` (new unified)
- `id` (PK)
- `competition_id` (FK)
- `competition_type_id` (FK)
- `clan_id` (FK)
- `team_id` (FK)
- `user_id` (nullable FK)
- `question_id` / `problem_id` (nullable)
- `payload` (jsonb) — answer/code/debug patch
- `verdict` (`AC`,`WA`,`TLE`,`PARTIAL`,`MANUAL_PENDING`)
- `raw_score` (numeric)
- `penalty_seconds` (int)
- `submitted_at`
- `evaluated_at`

Indexes:
- (`competition_id`, `team_id`, `submitted_at`)
- (`competition_id`, `verdict`)

#### `competition_team_scores` (materialized/aggregated)
- `id` (PK)
- `competition_id` (FK)
- `team_id` (FK)
- `clan_id` (FK)
- `total_score` (numeric)
- `total_penalty_seconds` (int)
- `last_submission_at`
- `rank_no` (int)
- `tie_break_meta` (jsonb)
- `calculated_at`

Constraints:
- unique(`competition_id`, `team_id`)

Indexes:
- (`competition_id`, `rank_no`)
- (`competition_id`, `clan_id`)

#### `competition_clan_scores` (new)
- `id` (PK)
- `competition_id` (FK)
- `clan_id` (FK)
- `aggregated_score` (numeric)
- `best_n_teams_count` (int)
- `rank_no` (int)
- `calculated_at`

Constraint:
- unique(`competition_id`, `clan_id`)

---

### 2.4 Performance & Suggestion Analytics

#### `clan_type_performance_stats` (new)
Type-wise rolling performance (suggestion engine input)

- `id` (PK)
- `clan_id` (FK)
- `competition_type_id` (FK)
- `contests_played`
- `avg_rank`
- `avg_score`
- `top3_finishes`
- `win_rate`
- `recent_form_score` (last N competitions weighted)
- `updated_at`

Constraint:
- unique(`clan_id`, `competition_type_id`)

Indexes:
- (`competition_type_id`, `recent_form_score` desc)

#### `competition_clan_suggestions` (new)
Admin create-time recommendation snapshot

- `id` (PK)
- `competition_id` (FK)
- `clan_id` (FK)
- `suggested_teams`
- `confidence_score`
- `reason_json` (jsonb)
- `created_at`

Constraint:
- unique(`competition_id`, `clan_id`)

---

## 3) Backend Architecture (Modular)

### 3.1 Bounded Modules
- `CompetitionAdminModule`
  - create/edit/delete competition
  - manage type + limit + settings
- `ParticipationModule`
  - team entry validation
  - clan cap enforcement
  - roster snapshot
- `SubmissionModule`
  - submission intake
  - evaluator dispatch by type
- `RankingModule`
  - team leaderboard calc
  - clan leaderboard calc
  - publish/freeze ranks
- `SuggestionModule`
  - performance features compute
  - clan recommendation for new competition
- `AnalyticsModule`
  - type-wise clan performance dashboard

### 3.2 Service Contracts (suggested interfaces)
- `ICompetitionTypeResolver`
- `ICompetitionEntryValidator`
- `ISubmissionEvaluator` (strategy by competition type)
- `IRankingCalculator`
- `IClanSuggestionService`
- `ICompetitionStatsUpdater`

### 3.3 Pattern
- Use **Strategy Pattern** for type-specific scoring/ranking:
  - `ProgrammingMcqRankingStrategy`
  - `DebugFixRankingStrategy`
  - `QuizRankingStrategy`
- Use background jobs (Hangfire/Quartz hosted service) for:
  - leaderboard recompute
  - stats materialization
  - suggestion precompute

---

## 4) Leaderboard Logic

## 4.1 Team Rank (per competition)
Sort key:
1. `total_score` desc
2. `total_penalty_seconds` asc
3. `last_submission_at` asc
4. `team_id` asc (deterministic tie-break)

Pseudo:
```text
team_rows = aggregate(competition_submissions by team)
sorted = order(team_rows, -score, +penalty, +last_submission, +team_id)
assign rank_no sequentially (or dense rank based on policy)
```

## 4.2 Clan Rank (same competition)
- Each clan’s **best N teams** count করবে (`N = competition.clan_aggregation_top_n` or default 1/2)
- clan score = sum(top N team scores)
- tie-break:
  1) lower total penalty of selected teams
  2) best single team rank

This guarantees one competition leaderboard অন্য competitionের সাথে mix হবে না.

---

## 5) Performance-Based Suggestion Algorithm

Input: `target_competition_type_id`

Feature per clan:
- `f1 = normalized_recent_form_score`
- `f2 = normalized_avg_score`
- `f3 = inverse_normalized_avg_rank`
- `f4 = win_rate`
- `f5 = active_team_capacity` (eligible teams/members)

Weighted score:
```text
suggestion_score = 0.35*f1 + 0.25*f2 + 0.20*f3 + 0.10*f4 + 0.10*f5
```

Suggested team count:
```text
capacity = min(clan_possible_teams, competition.max_teams_per_clan)
base = round(suggestion_score * max_teams_per_clan)
suggested_teams = clamp(base, 1, capacity)
```

Output:
- top clans list
- confidence score
- explainable reasons (last 5 contests in same type, avg rank, win rate)

Cold-start rule:
- যদি target type-এ historical data না থাকে, fallback = global clan performance + activity score.

---

## 6) Admin Workflow (End-to-End)

1. Admin opens `/admin/clan-competitions`
2. Clicks **Create Competition**
3. Sets:
   - title, schedule
   - competition type
   - max teams per clan
   - ranking policy (score/time, top-N clan aggregation)
4. System fetches clan suggestions (`/suggestions?type=...`)
5. Admin approves/overrides suggested clans/teams
6. Competition published
7. Clans register teams (limit enforced)
8. Competition runs → submissions evaluated
9. Leaderboard recalculated (real-time বা interval)
10. Finalize competition → freeze ranks + update type-wise stats

---

## 7) API Blueprint

### Competition Admin
- `POST /api/admin/clan-competitions`
- `PUT /api/admin/clan-competitions/{id}`
- `DELETE /api/admin/clan-competitions/{id}`
- `GET /api/admin/clan-competitions/{id}`

### Suggestions
- `GET /api/admin/clan-competitions/suggestions?competitionTypeId={id}`
- `POST /api/admin/clan-competitions/{id}/suggestions/refresh`

### Entries
- `POST /api/clan-competitions/{id}/entries`
- `GET /api/clan-competitions/{id}/entries`
- `PATCH /api/clan-competitions/{id}/entries/{entryId}/status`

### Leaderboards
- `GET /api/clan-competitions/{id}/leaderboard/teams`
- `GET /api/clan-competitions/{id}/leaderboard/clans`
- `POST /api/admin/clan-competitions/{id}/leaderboard/recalculate`
- `POST /api/admin/clan-competitions/{id}/finalize`

### Analytics
- `GET /api/admin/clans/performance?competitionTypeId={id}`
- `GET /api/admin/clans/{clanId}/performance-history`

---

## 8) Scalability Notes

- Use Redis cache for hot leaderboard reads (`competition:{id}:leaderboard:*`)
- Write-heavy submissions append-only রাখুন; aggregation async job-এ করুন
- Partition `competition_submissions` by `competition_id` or `submitted_at` (high volume হলে)
- Add optimistic concurrency token on `competitions` for admin edits
- Use outbox/event pattern for finalize notifications/stats update

---

## 9) Migration Path from Current Codebase

1. Add `competition_types` and seed rows
2. Extend `Competitions` with `competition_type_id`, `max_teams_per_clan`
3. Add `competition_team_entries` + trigger for clan cap
4. Introduce `competition_submissions` and map existing score writes gradually
5. Build `RankingModule` to compute into `competition_team_scores` and `competition_clan_scores`
6. Add `clan_type_performance_stats` updater job after finalize
7. Connect frontend admin page with new endpoints and suggestion API

---

## 10) Minimal SQL Skeleton (PostgreSQL style)

```sql
create table competition_types (
  id bigserial primary key,
  code varchar(50) not null unique,
  name varchar(120) not null,
  ranking_strategy varchar(30) not null,
  default_scoring_config jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table competitions
  add column if not exists competition_type_id bigint references competition_types(id),
  add column if not exists max_teams_per_clan int not null default 1,
  add column if not exists participation_mode varchar(30) not null default 'CLAN_TEAM_ONLY',
  add column if not exists ranking_config jsonb;

create table competition_team_entries (
  id bigserial primary key,
  competition_id bigint not null references competitions(id) on delete cascade,
  clan_id bigint not null references clans(id),
  team_id bigint not null references teams(id),
  entry_status varchar(20) not null default 'PENDING',
  approved_at timestamptz,
  approved_by bigint references users(id),
  created_at timestamptz not null default now(),
  unique (competition_id, team_id)
);

create index idx_entries_comp_clan_status
  on competition_team_entries (competition_id, clan_id, entry_status);
```

---

## 11) Why this design matches your requirements

- Multi-type competitions: `competition_types` + strategy based evaluation
- Separate leaderboard: score/rank table keyed by `competition_id`
- Clan-team-only participation: `participation_mode` + entry validator
- Max teams per clan: `max_teams_per_clan` + DB trigger + service check
- Performance suggestion: `clan_type_performance_stats` + weighted recommender
- Future expansion: new competition type add = new strategy + config, no schema rewrite
