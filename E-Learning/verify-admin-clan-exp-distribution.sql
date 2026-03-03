-- Admin Clan Competition EXP Verification
-- Rule:
--   Rank 1  -> 1000
--   Rank 2  ->  800
--   Rank 3  ->  500
--   Rank 4-10 -> 300
--   Rank 11+  -> 50
--
-- Usage:
--   1) Set target competition ID below
--   2) Run queries after finalize endpoint completes

-- ===== 1) Set target competition =====
-- Replace 123 with your competition id
WITH params AS (
  SELECT 123::int AS competition_id
),
expected_history AS (
  SELECT
    h."UserId",
    h."CompetitionId",
    h."ClanTeamId",
    h."Position",
    h."EarnedExp",
    CASE
      WHEN h."Position" = 1 THEN 1000
      WHEN h."Position" = 2 THEN 800
      WHEN h."Position" = 3 THEN 500
      WHEN h."Position" BETWEEN 4 AND 10 THEN 300
      ELSE 50
    END AS expected_exp
  FROM "UserCompetitionHistories" h
  JOIN params p ON h."CompetitionId" = p.competition_id
)
SELECT
  eh."UserId",
  eh."CompetitionId",
  eh."ClanTeamId",
  eh."Position",
  eh."EarnedExp",
  eh.expected_exp,
  (eh."EarnedExp" - eh.expected_exp) AS exp_diff
FROM expected_history eh
ORDER BY eh."Position", eh."UserId";

-- ===== 2) Only mismatches (should return 0 rows) =====
WITH params AS (
  SELECT 123::int AS competition_id
),
expected_history AS (
  SELECT
    h."UserId",
    h."CompetitionId",
    h."ClanTeamId",
    h."Position",
    h."EarnedExp",
    CASE
      WHEN h."Position" = 1 THEN 1000
      WHEN h."Position" = 2 THEN 800
      WHEN h."Position" = 3 THEN 500
      WHEN h."Position" BETWEEN 4 AND 10 THEN 300
      ELSE 50
    END AS expected_exp
  FROM "UserCompetitionHistories" h
  JOIN params p ON h."CompetitionId" = p.competition_id
)
SELECT *
FROM expected_history
WHERE "EarnedExp" <> expected_exp
ORDER BY "Position", "UserId";

-- ===== 3) Summary by rank bracket =====
WITH params AS (
  SELECT 123::int AS competition_id
),
base AS (
  SELECT
    h."Position",
    h."EarnedExp",
    CASE
      WHEN h."Position" = 1 THEN '1st'
      WHEN h."Position" = 2 THEN '2nd'
      WHEN h."Position" = 3 THEN '3rd'
      WHEN h."Position" BETWEEN 4 AND 10 THEN '4th-10th'
      ELSE '11th+'
    END AS rank_bucket
  FROM "UserCompetitionHistories" h
  JOIN params p ON h."CompetitionId" = p.competition_id
)
SELECT
  rank_bucket,
  COUNT(*) AS user_count,
  MIN("EarnedExp") AS min_exp,
  MAX("EarnedExp") AS max_exp,
  AVG("EarnedExp") AS avg_exp
FROM base
GROUP BY rank_bucket
ORDER BY CASE rank_bucket
  WHEN '1st' THEN 1
  WHEN '2nd' THEN 2
  WHEN '3rd' THEN 3
  WHEN '4th-10th' THEN 4
  ELSE 5
END;

-- ===== 4) User-level before/after sanity (if you captured baseline in temp table) =====
-- Optional pattern:
-- CREATE TEMP TABLE tmp_exp_before AS
-- SELECT u."Id" AS user_id, u."Exp" AS exp_before
-- FROM "Users" u
-- JOIN "UserCompetitionHistories" h ON h."UserId" = u."Id"
-- WHERE h."CompetitionId" = 123;
--
-- After finalize:
-- SELECT b.user_id, b.exp_before, u."Exp" AS exp_after, (u."Exp" - b.exp_before) AS exp_delta
-- FROM tmp_exp_before b
-- JOIN "Users" u ON u."Id" = b.user_id
-- ORDER BY exp_delta DESC;
