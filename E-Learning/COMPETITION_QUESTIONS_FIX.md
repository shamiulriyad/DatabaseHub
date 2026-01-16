# Competition Questions Fix - Participant Flow

## Problem
Questions were being created in the database but **not being fetched or served** to participants when they accessed competition details. Participants had no way to see the questions during the competition flow.

## Root Causes
1. **Missing Include**: `GetCompetitionById()` didn't include `.Include(c => c.Questions)`
2. **Missing Navigation Property**: `Competition` model lacked the `Questions` collection
3. **Missing DTO Property**: `CompetitionDTO` didn't have a `Questions` property
4. **Incomplete Mapping**: `MapToCompetitionDTO()` didn't map questions to the DTO

## Solution Implemented

### 1. Added Navigation Property to Competition Model
**File**: [backend/Models/Competition.cs](backend/Models/Competition.cs)

```csharp
public virtual ICollection<CompetitionQuestion> Questions { get; set; } = new List<CompetitionQuestion>();
```

### 2. Added Questions Property to CompetitionDTO
**File**: [backend/DTOs/CompetitionDTOs.cs](backend/DTOs/CompetitionDTOs.cs)

```csharp
public List<CompetitionQuestionDTO> Questions { get; set; } = new List<CompetitionQuestionDTO>();
```

### 3. Updated GetCompetitionById to Include Questions
**File**: [backend/Services/CompetitionService.cs](backend/Services/CompetitionService.cs) - Line 168

```csharp
var competition = await _context.Competitions
    .Include(c => c.Participants)
    .Include(c => c.Scores)
    .Include(c => c.Questions)  // <-- ADDED
    .FirstOrDefaultAsync(c => c.Id == competitionId);
```

### 4. Updated MapToCompetitionDTO to Map Questions
**File**: [backend/Services/CompetitionService.cs](backend/Services/CompetitionService.cs) - Line 621

```csharp
Questions = competition.Questions?.Select(q => new CompetitionQuestionDTO
{
    Id = q.Id,
    CompetitionId = q.CompetitionId,
    QuestionText = q.QuestionText,
    OptionA = q.OptionA,
    OptionB = q.OptionB,
    OptionC = q.OptionC,
    OptionD = q.OptionD,
    CorrectAnswer = q.CorrectAnswer,
    Points = q.Points,
    Order = q.Order,
    CreatedAt = q.CreatedAt
}).OrderBy(q => q.Order).ToList() ?? new List<CompetitionQuestionDTO>()
```

### 5. Added Dedicated Questions Endpoint (Bonus)
**File**: [backend/Controllers/CompetitionsController.cs](backend/Controllers/CompetitionsController.cs#L49)

```
GET /api/competitions/{id}/questions
```

This endpoint allows participants to fetch questions separately if needed.

### 6. Added Service Interface Method
**File**: [backend/Services/Interfaces/ICompetitionService.cs](backend/Services/Interfaces/ICompetitionService.cs#L10)

```csharp
Task<ServiceResult<List<CompetitionQuestionDTO>>> GetCompetitionQuestions(int competitionId);
```

### 7. Implemented GetCompetitionQuestions Service
**File**: [backend/Services/CompetitionService.cs](backend/Services/CompetitionService.cs#L188)

```csharp
public async Task<ServiceResult<List<CompetitionQuestionDTO>>> GetCompetitionQuestions(int competitionId)
{
    // Fetches and returns questions for a competition, ordered by question order
}
```

## API Usage

### Option 1: Get Competition with Questions (Recommended)
```http
GET /api/competitions/{competitionId}
```

Response includes:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Quiz Competition",
    "questions": [
      {
        "id": 1,
        "competitionId": 1,
        "questionText": "What is...?",
        "optionA": "...",
        "optionB": "...",
        "optionC": "...",
        "optionD": "...",
        "correctAnswer": "A",
        "points": 1,
        "order": 1,
        "createdAt": "2026-01-16T..."
      }
    ]
  }
}
```

### Option 2: Get Questions Only
```http
GET /api/competitions/{competitionId}/questions
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    { "id": 1, "questionText": "...", ... }
  ]
}
```

## Verification Steps
1. ✅ Build succeeds without errors
2. ✅ Competition model has Questions collection
3. ✅ CompetitionDTO includes Questions
4. ✅ GetCompetitionById includes questions in query
5. ✅ Questions are properly mapped with order preserved
6. ✅ Dedicated endpoint available for fetching questions

## Database Notes
- No migration needed - the `CompetitionQuestions` table already exists
- Foreign key relationship is already configured in `CompetitionQuestion.cs`
- Questions maintain order via the `Order` field (default: 1)

## Next Steps
1. Test API endpoints with real competition data
2. Verify questions display correctly in frontend participant flow
3. Confirm answer validation works with `CorrectAnswer` field
4. Monitor for performance issues with large question sets (add pagination if needed)
