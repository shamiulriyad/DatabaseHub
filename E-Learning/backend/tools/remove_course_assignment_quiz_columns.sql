-- Remove course-level assignment/quiz option columns from Courses table
-- DB: PostgreSQL
-- Safe to run multiple times (uses IF EXISTS)

BEGIN;

-- 1) Optional: verify current columns before dropping
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'Courses'
--   AND column_name IN (
--     'TotalQuizzes',
--     'TotalAssignments',
--     'TotalQuizAttempts',
--     'TotalAssignmentSubmissions'
--   )
-- ORDER BY column_name;

-- 2) Drop columns from Courses
ALTER TABLE "Courses"
  DROP COLUMN IF EXISTS "TotalQuizzes",
  DROP COLUMN IF EXISTS "TotalAssignments",
  DROP COLUMN IF EXISTS "TotalQuizAttempts",
  DROP COLUMN IF EXISTS "TotalAssignmentSubmissions";

COMMIT;

-- 3) Optional: verify after drop
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'Courses'
--   AND column_name IN (
--     'TotalQuizzes',
--     'TotalAssignments',
--     'TotalQuizAttempts',
--     'TotalAssignmentSubmissions'
--   );
