-- Idempotent fix: add columns used by code if they don't exist
-- Run this against your Postgres DB used by the app.

BEGIN;

ALTER TABLE "Lessons" ADD COLUMN IF NOT EXISTS "VideoType" varchar(50);
ALTER TABLE "Lessons" ADD COLUMN IF NOT EXISTS "Duration" integer;

COMMIT;

-- After running: restart backend and test GET /api/learning/lesson/1 with a valid JWT.
-- Example psql command (adjust user/password/db):
-- psql "postgresql://postgres:YOUR_PW@localhost:5432/elearning_db" -f "e:\My all Project\DatabaseHub\E-Learning\backend\tools\add_lesson_columns_if_missing.sql"