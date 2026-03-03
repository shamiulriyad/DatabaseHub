-- Remove assignment/quiz tables from database
-- DB: PostgreSQL
-- WARNING: This permanently deletes table structure + data

BEGIN;

-- Optional pre-check
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN (
--     'Assignments',
--     'AssignmentSubmissions',
--     'Quizzes',
--     'QuizQuestions',
--     'QuizSubmissions'
--   )
-- ORDER BY table_name;

DROP TABLE IF EXISTS "AssignmentSubmissions" CASCADE;
DROP TABLE IF EXISTS "Assignments" CASCADE;
DROP TABLE IF EXISTS "QuizSubmissions" CASCADE;
DROP TABLE IF EXISTS "QuizQuestions" CASCADE;
DROP TABLE IF EXISTS "Quizzes" CASCADE;

COMMIT;

-- Optional post-check
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN (
--     'Assignments',
--     'AssignmentSubmissions',
--     'Quizzes',
--     'QuizQuestions',
--     'QuizSubmissions'
--   )
-- ORDER BY table_name;
