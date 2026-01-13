-- ================================
-- SIMPLE CLAN QUERIES FOR TESTING
-- ================================

-- 1. GET ALL CLANS (SIMPLE)
SELECT * FROM "Clans" ORDER BY "TotalPoints" DESC;

-- 2. GET ALL CLAN MEMBERS
SELECT * FROM "ClanMembers" ORDER BY "ClanId", "ContributionPoints" DESC;

-- 3. GET CLANS WITH MEMBER COUNT
SELECT 
    "Id",
    "Name",
    "Tag",
    "TotalPoints",
    "MemberCount",
    "IsPublic",
    "ClanType"
FROM "Clans" 
ORDER BY "TotalPoints" DESC;

-- 4. SEARCH CLANS BY NAME
SELECT * FROM "Clans" 
WHERE "Name" ILIKE '%elite%' 
ORDER BY "TotalPoints" DESC;

-- 5. GET ONE CLAN BY ID
SELECT * FROM "Clans" WHERE "Id" = 1;

-- 2. SEARCH CLANS BY NAME/TAG (CASE INSENSITIVE)
SELECT 
    c.Id,
    c.Name,
    c.Tag,
    c.Description,
    c.ClanType,
    c.TotalPoints,
    c.MemberCount
FROM "Clans" c
WHERE 
    LOWER(c.Name) LIKE LOWER('%Elite%') 
    OR LOWER(c.Tag) LIKE LOWER('%ELITE%')
ORDER BY c.TotalPoints DESC;

-- 3. GET CLANS BY TYPE
SELECT * FROM "Clans"
WHERE ClanType = 'Academic'
ORDER BY TotalPoints DESC;

-- 4. GET PUBLIC CLANS ONLY
SELECT * FROM "Clans"
WHERE IsPublic = true
ORDER BY MemberCount DESC;

-- 5. GET TOP 10 CLANS BY RANKING
SELECT 
    c.Id,
    c.Name,
    c.Tag,
    c.TotalPoints,
    c.MemberCount,
    ROW_NUMBER() OVER (ORDER BY c.TotalPoints DESC) AS Rank
FROM "Clans" c
ORDER BY c.TotalPoints DESC
LIMIT 10;

-- 6. GET CLAN WITH MEMBERS
SELECT 
    c.Id,
    c.Name,
    c.Tag,
    c.TotalPoints,
    COUNT(cm.Id) AS ActualMemberCount,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'UserId', u.Id,
            'UserName', u.Username,
            'Role', cm.Role,
            'JoinedAt', cm.JoinedAt,
            'ContributionPoints', cm.ContributionPoints
        )
    ) AS Members
FROM "Clans" c
LEFT JOIN "ClanMembers" cm ON c.Id = cm.ClanId
LEFT JOIN "Users" u ON cm.UserId = u.Id
WHERE c.Id = 1
GROUP BY c.Id;

-- 7. GET CLAN MEMBERS WITH DETAILS
SELECT 
    cm.Id,
    cm.Role,
    cm.JoinedAt,
    cm.ContributionPoints,
    cm.TotalPosts,
    u.Id AS UserId,
    u.Username,
    u.FirstName || ' ' || u.LastName AS FullName,
    u.ProfileImageUrl,
    u.Email
FROM "ClanMembers" cm
JOIN "Users" u ON cm.UserId = u.Id
WHERE cm.ClanId = 1
ORDER BY 
    CASE cm.Role
        WHEN 'Leader' THEN 1
        WHEN 'CoLeader' THEN 2
        WHEN 'Elder' THEN 3
        ELSE 4
    END,
    cm.ContributionPoints DESC;

-- 8. GET USER'S CLANS
SELECT 
    c.*,
    cm.Role,
    cm.JoinedAt,
    cm.ContributionPoints
FROM "ClanMembers" cm
JOIN "Clans" c ON cm.ClanId = c.Id
WHERE cm.UserId = 1
ORDER BY cm.JoinedAt DESC;

-- 9. SEARCH CLANS WITH FILTERS (ADVANCED)
SELECT 
    c.Id,
    c.Name,
    c.Tag,
    c.Description,
    c.ClanType,
    c.IsPublic,
    c.TotalPoints,
    c.MemberCount,
    c.MaxMembers,
    c.LogoUrl,
    c.BannerUrl,
    ROW_NUMBER() OVER (ORDER BY c.TotalPoints DESC) AS Rank
FROM "Clans" c
WHERE 
    (c.Name ILIKE '%search%' OR c.Tag ILIKE '%search%' OR c.Description ILIKE '%search%')
    AND (c.ClanType = 'Academic' OR 'Academic' IS NULL)
    AND (c.IsPublic = true OR true IS NULL)
    AND c.MemberCount >= 0
    AND c.MemberCount <= 500
ORDER BY c.TotalPoints DESC
LIMIT 20 OFFSET 0;

-- 10. GET CLAN STATISTICS
SELECT 
    c.Id,
    c.Name,
    c.TotalPoints,
    c.MemberCount,
    COUNT(DISTINCT cm.UserId) AS ActiveMembers,
    SUM(cm.TotalPosts) AS TotalClanPosts,
    AVG(cm.ContributionPoints) AS AvgContribution,
    MAX(cm.ContributionPoints) AS TopContributor
FROM "Clans" c
LEFT JOIN "ClanMembers" cm ON c.Id = cm.ClanId
WHERE c.Id = 1
GROUP BY c.Id;

-- 11. GET CLAN LEADERBOARD (RANKED)
SELECT 
    ROW_NUMBER() OVER (ORDER BY TotalPoints DESC, MemberCount DESC) AS Rank,
    Id,
    Name,
    Tag,
    ClanType,
    TotalPoints,
    MemberCount,
    IsPublic
FROM "Clans"
ORDER BY TotalPoints DESC, MemberCount DESC
LIMIT 50;

-- 12. INSERT NEW CLAN
INSERT INTO "Clans" (
    Name, 
    Tag, 
    Description, 
    Motto,
    ClanType, 
    IsPublic, 
    LeaderId, 
    MaxMembers,
    RequireApproval,
    CreatedAt
) VALUES (
    'Elite Coders',
    'ELITE',
    'Top programming clan for competitive coders',
    'Code. Compete. Conquer.',
    'Academic',
    true,
    1,  -- Leader User ID
    100,
    false,
    NOW()
) RETURNING *;

-- 13. UPDATE CLAN INFO
UPDATE "Clans"
SET 
    Name = 'Updated Clan Name',
    Description = 'Updated description',
    LogoUrl = 'https://example.com/logo.png',
    UpdatedAt = NOW()
WHERE Id = 1
RETURNING *;

-- 14. ADD MEMBER TO CLAN
INSERT INTO "ClanMembers" (
    ClanId,
    UserId,
    Role,
    JoinedAt,
    Status
) VALUES (
    1,  -- Clan ID
    5,  -- User ID
    'Member',
    NOW(),
    'Active'
) RETURNING *;

-- 15. UPDATE MEMBER ROLE
UPDATE "ClanMembers"
SET 
    Role = 'Elder',
    UpdatedAt = NOW()
WHERE ClanId = 1 AND UserId = 5
RETURNING *;

-- 16. INCREMENT CLAN POINTS
UPDATE "Clans"
SET 
    TotalPoints = TotalPoints + 100,
    UpdatedAt = NOW()
WHERE Id = 1
RETURNING TotalPoints;

-- 17. INCREMENT MEMBER CONTRIBUTION
UPDATE "ClanMembers"
SET 
    ContributionPoints = ContributionPoints + 50,
    TotalPosts = TotalPosts + 1,
    UpdatedAt = NOW()
WHERE ClanId = 1 AND UserId = 5
RETURNING *;

-- 18. GET AVAILABLE CLANS TO JOIN (PUBLIC + NOT FULL)
SELECT 
    c.*,
    c.MaxMembers - c.MemberCount AS SlotsAvailable
FROM "Clans" c
WHERE 
    c.IsPublic = true
    AND c.MemberCount < c.MaxMembers
    AND c.Id NOT IN (
        SELECT ClanId FROM "ClanMembers" WHERE UserId = 1
    )
ORDER BY c.TotalPoints DESC;

-- 19. CHECK IF USER IS CLAN MEMBER
SELECT EXISTS (
    SELECT 1 FROM "ClanMembers"
    WHERE ClanId = 1 AND UserId = 5 AND Status = 'Active'
) AS IsMember;

-- 20. REMOVE MEMBER FROM CLAN
DELETE FROM "ClanMembers"
WHERE ClanId = 1 AND UserId = 5
RETURNING *;

-- 21. GET CLAN WITH FULL DETAILS
SELECT 
    c.*,
    u.Username AS LeaderUsername,
    u.FirstName || ' ' || u.LastName AS LeaderName,
    u.ProfileImageUrl AS LeaderAvatar,
    COUNT(DISTINCT cm.UserId) AS TotalMembers,
    COUNT(DISTINCT CASE WHEN cm.Role = 'Elder' THEN cm.UserId END) AS ElderCount,
    COUNT(DISTINCT CASE WHEN cm.Role = 'CoLeader' THEN cm.UserId END) AS CoLeaderCount
FROM "Clans" c
LEFT JOIN "Users" u ON c.LeaderId = u.Id
LEFT JOIN "ClanMembers" cm ON c.Id = cm.ClanId
WHERE c.Id = 1
GROUP BY c.Id, u.Username, u.FirstName, u.LastName, u.ProfileImageUrl;

-- 22. GET TOP CONTRIBUTORS IN CLAN
SELECT 
    cm.UserId,
    u.Username,
    u.FirstName || ' ' || u.LastName AS FullName,
    u.ProfileImageUrl,
    cm.Role,
    cm.ContributionPoints,
    cm.TotalPosts,
    cm.JoinedAt
FROM "ClanMembers" cm
JOIN "Users" u ON cm.UserId = u.Id
WHERE cm.ClanId = 1
ORDER BY cm.ContributionPoints DESC
LIMIT 10;

-- 23. GET CLAN ACTIVITY SUMMARY (LAST 30 DAYS)
SELECT 
    c.Id,
    c.Name,
    COUNT(DISTINCT cm.UserId) AS ActiveMembers,
    SUM(cm.TotalPosts) AS TotalPosts,
    SUM(cm.ContributionPoints) AS TotalContribution
FROM "Clans" c
LEFT JOIN "ClanMembers" cm ON c.Id = cm.ClanId
WHERE c.Id = 1
GROUP BY c.Id;

-- 24. DELETE CLAN (CASCADE DELETE MEMBERS)
DELETE FROM "Clans"
WHERE Id = 1
RETURNING *;

-- 25. COMPLEX SEARCH WITH PAGINATION
WITH RankedClans AS (
    SELECT 
        c.*,
        ROW_NUMBER() OVER (ORDER BY 
            CASE WHEN 'rank' = 'rank' THEN c.TotalPoints END DESC,
            CASE WHEN 'members' = 'rank' THEN c.MemberCount END DESC,
            c.CreatedAt DESC
        ) AS RowNum,
        COUNT(*) OVER() AS TotalCount
    FROM "Clans" c
    WHERE 
        (c.Name ILIKE '%' || 'search' || '%' OR 'search' IS NULL)
        AND (c.ClanType = 'Academic' OR 'Academic' IS NULL)
        AND (c.IsPublic = true OR NULL IS NULL)
)
SELECT *
FROM RankedClans
WHERE RowNum BETWEEN 1 AND 20  -- Page 1, 20 per page
ORDER BY RowNum;
