-- Migration script: add StudentLessonProgresses table and Lesson columns
-- Postgres-compatible SQL

BEGIN;

ALTER TABLE "Lessons" ADD COLUMN IF NOT EXISTS "VideoType" varchar(50);
ALTER TABLE "Lessons" ADD COLUMN IF NOT EXISTS "Duration" integer;

CREATE TABLE IF NOT EXISTS "StudentLessonProgresses" (
    "Id" serial PRIMARY KEY,
    "UserId" integer NOT NULL,
    "LessonId" integer NOT NULL,
    "WatchedSeconds" integer NOT NULL DEFAULT 0,
    "IsCompleted" boolean NOT NULL DEFAULT false,
    "CompletedAt" timestamp with time zone,
    "LastWatchedAt" timestamp with time zone,
    CONSTRAINT fk_slp_user FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT fk_slp_lesson FOREIGN KEY ("LessonId") REFERENCES "Lessons" ("Id") ON DELETE CASCADE
);

COMMIT;
