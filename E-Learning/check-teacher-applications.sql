-- Check pending teacher applications
SELECT 
    "Id",
    "UserId",
    "ReasonForApplying",
    "ExperienceArea",
    "Status",
    "ApplicationDate",
    "QualificationDetails",
    "ReviewedByAdminId",
    "ReviewDate",
    "AdminRemarks"
FROM "TeacherApplications"
WHERE "Status" = 'Pending'
ORDER BY "ApplicationDate" DESC;

-- Also check the user details for these applications
SELECT u."Id", u."Username", u."Email", u."FirstName", u."LastName", u."IsAdmin", ta."Status"
FROM "Users" u
INNER JOIN "TeacherApplications" ta ON u."Id" = ta."UserId"
WHERE ta."Status" = 'Pending';

-- Count total pending applications
SELECT COUNT(*) as "PendingApplicationsCount" FROM "TeacherApplications" WHERE "Status" = 'Pending';
