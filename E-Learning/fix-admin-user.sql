-- Check all users and their admin status
SELECT Id, Username, Email, IsAdmin, IsStudent, IsTeacher FROM "Users" ORDER BY Id;

-- Find the admin user (replace with actual ID if you know it)
-- Then run the update below to set IsAdmin = true:

-- UPDATE "Users" SET IsAdmin = true WHERE Id = 1; -- Replace 1 with your admin user ID
-- After update, verify:
-- SELECT Id, Username, Email, IsAdmin FROM "Users" WHERE Id = 1;
