-- Safe test data: insert a CoursePart for CourseId=1 and let LearningService map it to a Lesson
-- Run this against your database (psql or any SQL client) connected to the same DB used by the app.
-- Adjust CourseId if you don't have a course with id=1 in your DB.

BEGIN;

-- Insert a course part (if not exists)
INSERT INTO "CourseParts" ("CourseId","Title","Description","Order","VideoUrl","YouTubeUrl","IsPreview")
SELECT 1, 'Test Part for Lesson API', 'Auto-created test part to exercise GET /api/learning/lesson/{id}', 1, 'https://www.w3schools.com/html/mov_bbb.mp4', NULL, false
WHERE NOT EXISTS (SELECT 1 FROM "CourseParts" WHERE "Id" = 1);

-- If the DB assigned a different id, select the most recent test part id for verification
-- You can fetch courseparts after running this script:
-- SELECT id, courseid, title, videourl, youTubeUrl FROM "CourseParts" WHERE title = 'Test Part for Lesson API';

COMMIT;

-- NOTE: The backend `LearningService.GetLesson` will auto-map a CoursePart to a Lesson when the endpoint is called.
-- After running this script, call the endpoint with a valid JWT (the frontend normally has it) e.g.:
-- curl -H "Authorization: Bearer <JWT>" http://localhost:5145/api/learning/lesson/1

-- If your CourseParts table already has id=1 reserved by other data, change the WHERE condition above to a different id
-- or run an explicit INSERT with specified Id (not recommended unless you know what you're doing).