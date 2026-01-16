# Competition Questions Debugging Guide

## Problem
Competition created successfully but participants cannot see questions.

## Root Causes & Solutions

### 1. **DateTime/Timezone Issue** (Most Likely)
**Problem:** Frontend sends local time, backend treats as UTC or vice versa.

**Example:**
- You create competition with start time: Jan 16, 2025 10:48 PM (Bangladesh Time = UTC+6)
- Backend stores as: Jan 16, 2025 10:48 PM UTC
- Current UTC time: Jan 16, 2025 4:48 PM UTC
- Status calculated as "Upcoming" because 4:48 PM < 10:48 PM
- Participant cannot see questions until "Ongoing"

**Solution Options:**

#### Option A: Test with current UTC time
```javascript
// In frontend CompetitionCreate component
const now = new Date();
const startTime = new Date(now.getTime() + 1000); // 1 second from now
const endTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now

const dto = {
  title: "Test Competition",
  description: "Testing question visibility",
  startDate: startTime.toISOString(), // Send in ISO format
  endDate: endTime.toISOString(),
  questions: [
    {
      questionText: "What is 2+2?",
      optionA: "3",
      optionB: "4",
      optionC: "5",
      optionD: "6",
      correctAnswer: "B",
      points: 1,
      order: 1
    }
  ]
};
```

#### Option B: Fix frontend to send ISO UTC strings
```javascript
// Make sure dates are sent in ISO 8601 UTC format
const formattedDto = {
  ...dto,
  startDate: new Date(dto.startDate).toISOString(),
  endDate: new Date(dto.endDate).toISOString()
};

await competitionService.createCompetition(formattedDto);
```

---

### 2. **User Not Registered as Participant**
**Problem:** Must call JoinCompetition before accessing questions.

**Solution:**
```javascript
// 1. Create competition
const competition = await competitionService.createCompetition(dto);

// 2. Join competition (as a different user, NOT creator/admin)
await competitionService.joinCompetition(competition.id);

// 3. Now fetch questions
const questions = await competitionService.getParticipantQuestions(competition.id);
```

**Note:** Creator and admins CANNOT join their own competitions!

---

### 3. **Competition Status Not "Ongoing"**
**Problem:** Questions only visible when status = "Ongoing"

**Statuses:**
- `PendingApproval` - Waiting for admin approval
- `Upcoming` - Before start date
- `Ongoing` - Between start and end date ✅ **ONLY THIS STATUS**
- `Completed` - After end date

**Check Status:**
```sql
-- Run this SQL to check competition status
SELECT 
    c.Id,
    c.Title,
    c.StartDate,
    c.EndDate,
    c.IsApproved,
    GETUTCDATE() AS CurrentUTC,
    CASE 
        WHEN c.IsApproved = 0 THEN 'PendingApproval'
        WHEN GETUTCDATE() < c.StartDate THEN 'Upcoming'
        WHEN GETUTCDATE() < c.EndDate THEN 'Ongoing'
        ELSE 'Completed'
    END AS CalculatedStatus,
    DATEDIFF(MINUTE, GETUTCDATE(), c.StartDate) AS MinutesUntilStart
FROM Competitions c
WHERE c.Id = YOUR_COMPETITION_ID;
```

---

## Step-by-Step Testing

### Step 1: Run Debug SQL
Run the query in `debug-competition-status.sql` to check:
- Current UTC time
- Competition start/end dates
- Calculated status
- Number of questions saved
- Registered participants

### Step 2: Test API Endpoints Manually

#### A. Create Competition (as admin/teacher)
```http
POST /api/competitions
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "title": "Test Competition",
  "description": "Testing questions",
  "startDate": "2025-01-16T16:00:00Z",  // Current UTC time
  "endDate": "2025-01-16T18:00:00Z",    // 2 hours later
  "competitionType": "Quiz",
  "questions": [
    {
      "questionText": "What is 2+2?",
      "optionA": "3",
      "optionB": "4",
      "optionC": "5",
      "optionD": "6",
      "correctAnswer": "B",
      "points": 1,
      "order": 1
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Test Competition",
    "status": "Ongoing",  // Should be Ongoing if within start-end range
    "totalQuestions": 1,
    "questions": []  // Empty for security (use dedicated endpoints)
  }
}
```

#### B. Join Competition (as student)
```http
POST /api/competitions/1/join
Authorization: Bearer YOUR_STUDENT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Joined competition successfully"
}
```

#### C. Get Questions (as joined student)
```http
GET /api/competitions/1/participant/questions
Authorization: Bearer YOUR_STUDENT_TOKEN
```

**Expected Response (if Ongoing):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "competitionId": 1,
      "questionText": "What is 2+2?",
      "optionA": "3",
      "optionB": "4",
      "optionC": "5",
      "optionD": "6",
      "correctAnswer": "B",
      "points": 1,
      "order": 1
    }
  ]
}
```

**Expected Response (if Upcoming):**
```json
{
  "success": false,
  "error": "Questions are only visible during contest. Current status: Upcoming. Current time (UTC): 2025-01-16 15:30:00. Contest starts: 2025-01-16 16:00:00 UTC. Contest starts in 30 minutes."
}
```

---

## Common Errors & Fixes

### Error: "Questions are only visible during contest"
**Cause:** Status is not "Ongoing"
**Fix:** 
1. Check current UTC time vs competition dates
2. Ensure competition is approved (IsApproved = true)
3. Wait until contest starts, or adjust start/end dates

### Error: "You must be a registered participant"
**Cause:** User hasn't called JoinCompetition
**Fix:** Call `/api/competitions/{id}/join` first

### Error: "Creator/admin cannot participate"
**Cause:** Trying to join own competition or admin joining
**Fix:** Use a different user account (student)

### Error: "Competition not found"
**Cause:** Wrong competition ID
**Fix:** Check database for correct ID

---

## Frontend Date Handling Best Practices

### ✅ CORRECT: Send ISO UTC strings
```javascript
const createCompetition = async (formData) => {
  const dto = {
    title: formData.title,
    description: formData.description,
    // Convert to ISO UTC string
    startDate: new Date(formData.startDate).toISOString(),
    endDate: new Date(formData.endDate).toISOString(),
    questions: formData.questions
  };
  
  return await api.post('/api/competitions', dto);
};
```

### ❌ WRONG: Send raw date objects or local strings
```javascript
// Don't do this:
startDate: formData.startDate,  // Could be "01/16/2025 10:48 PM"
startDate: new Date(),          // Will serialize with timezone
```

---

## Quick Test Script

Run this in VS Code REST Client or Postman:

```http
### 1. Login as admin
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "Admin123!"
}

### Store token from response, then:

### 2. Create competition with CURRENT time
@now = {{$datetime iso8601}}
@twoHoursLater = {{$datetime iso8601 offset 2 hour}}

POST http://localhost:5000/api/competitions
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Real-Time Test",
  "description": "Testing with current UTC time",
  "startDate": "{{now}}",
  "endDate": "{{twoHoursLater}}",
  "questions": [
    {
      "questionText": "Test question?",
      "optionA": "A",
      "optionB": "B",
      "optionC": "C",
      "optionD": "D",
      "correctAnswer": "A",
      "points": 1,
      "order": 1
    }
  ]
}

### 3. Join (use student token)
POST http://localhost:5000/api/competitions/1/join
Authorization: Bearer STUDENT_TOKEN_HERE

### 4. Get questions
GET http://localhost:5000/api/competitions/1/participant/questions
Authorization: Bearer STUDENT_TOKEN_HERE
```

---

## Next Steps

1. **Run the debug SQL** (`debug-competition-status.sql`)
2. **Check the error message** - it now includes detailed timing info
3. **Verify timezone handling** - frontend should send ISO UTC strings
4. **Test with current time** - create competition starting "now"
5. **Verify participant registration** - must join before viewing questions

If still not working, share:
- Output from debug SQL
- Exact error message from API
- Frontend code for creating competition
- Current server UTC time vs start date
