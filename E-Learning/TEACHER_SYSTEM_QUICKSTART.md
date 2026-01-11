# Teacher Application System - Quick Start Guide

## For Developers

### Database Migration
You'll need to create a migration for the new TeacherApplication table:

```bash
cd backend
dotnet ef migrations add AddTeacherApplicationSystem
dotnet ef database update
```

### Configuration Checklist
- [x] Model created: `TeacherApplication.cs`
- [x] DbSet added to `ApplicationDbContext.cs`
- [x] DTOs created: `TeacherDTOs.cs`
- [x] Service interface: `ITeacherService.cs`
- [x] Service implementation: `TeacherService.cs`
- [x] Controller: `TeachersController.cs`
- [x] Dependency injection in `Program.cs`

### Frontend Files Added/Updated
- [x] `src/components/TeacherApplicationModal.jsx` (NEW)
- [x] `src/components/TeacherApplicationReviewModal.jsx` (NEW)
- [x] `src/pages/Admin/ManageTeachers.jsx` (NEW)
- [x] `src/pages/Profile/UserProfile.jsx` (UPDATED)
- [x] `src/App.js` (UPDATED - added route)

---

## For Users

### Student Perspective

#### Step 1: Register & Login
```
1. Go to /register
2. Fill registration form (no role selection)
3. Account created as Student
4. Can immediately access courses, enroll, etc.
```

#### Step 2: Apply to Become Teacher
```
1. Go to /profile
2. Click "Apply to Become Teacher" button
3. Fill application form:
   - Why do you want to teach?
   - Your qualifications (optional)
   - Areas of expertise (optional)
4. Click "Submit Application"
5. See success message
```

#### Step 3: Wait for Review
```
1. Application shows "Pending" status
2. Check back on profile to see current status
3. Admin will review within 24-48 hours
4. You'll see admin remarks in the modal
```

#### Step 4: If Approved
```
✓ Your role updates to Teacher
✓ New "Teacher Dashboard" option appears
✓ Can now create and manage courses
✓ Still have all student features too
```

#### Step 5: If Rejected
```
✗ Stay as Student with full access
✗ See admin remarks explaining why
→ Can improve and reapply
```

---

### Admin Perspective

#### Access the Dashboard
```
1. Login as admin user
2. Navigate to /admin/manage-teachers
3. See applications by status:
   - Pending (need review)
   - Approved (approved teachers)
   - Rejected (rejected applications)
```

#### Review Application
```
1. Click "Pending" tab
2. Read application summaries
3. Click "Review" button on application
4. Modal opens with full details
5. Add remarks if needed
6. Click "Approve" or "Reject"
7. Application updated immediately
```

#### Monitor Applications
```
- See pending count in tab
- View approved teachers list
- See rejection history
- Filter by status using dropdown
```

---

## API Testing

### Using curl or Postman

#### 1. Apply to Become Teacher
```bash
curl -X POST http://localhost:5145/api/teachers/apply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reasonForApplying": "I have 5 years of teaching experience",
    "qualificationDetails": "Masters in Computer Science",
    "experienceArea": "Web Development, React"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Teacher application submitted successfully. Please wait for admin approval.",
  "application": {
    "id": 1,
    "userId": 5,
    "status": "Pending",
    "applicationDate": "2026-01-10T10:30:00Z",
    ...
  }
}
```

#### 2. Check Application Status
```bash
curl -X GET http://localhost:5145/api/teachers/my-application \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Get All Applications (Admin Only)
```bash
# Get all pending applications
curl -X GET "http://localhost:5145/api/teachers/applications?status=Pending" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Get approved applications
curl -X GET "http://localhost:5145/api/teachers/applications?status=Approved" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### 4. Review Application (Admin Only)
```bash
curl -X POST http://localhost:5145/api/teachers/applications/1/review \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "Approved",
    "adminRemarks": "Great qualifications. Approved!"
  }'
```

Or to reject:
```bash
curl -X POST http://localhost:5145/api/teachers/applications/1/review \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "Rejected",
    "adminRemarks": "Please provide more teaching experience before reapplying."
  }'
```

---

## Database Queries

### View All Pending Applications
```sql
SELECT 
  ta.id,
  u.username,
  u.email,
  ta.reason_for_applying,
  ta.application_date,
  ta.status
FROM teacher_applications ta
JOIN users u ON ta.user_id = u.id
WHERE ta.status = 'Pending'
ORDER BY ta.application_date DESC;
```

### View Approval Stats
```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM teacher_applications), 2) as percentage
FROM teacher_applications
GROUP BY status;
```

### Find Specific User's Application
```sql
SELECT *
FROM teacher_applications
WHERE user_id = 5
ORDER BY application_date DESC
LIMIT 1;
```

### View Reviews by Admin
```sql
SELECT 
  ta.id,
  u.username,
  ta.status,
  admin.username as reviewed_by_admin,
  ta.reviewed_date,
  ta.admin_remarks
FROM teacher_applications ta
JOIN users u ON ta.user_id = u.id
LEFT JOIN users admin ON ta.reviewed_by_admin_id = admin.id
WHERE ta.status IN ('Approved', 'Rejected')
ORDER BY ta.reviewed_date DESC;
```

---

## Environment Variables/Config

No additional environment variables needed. Uses existing:
- `ConnectionString` → TeacherApplications table
- `JwtSettings` → Token generation
- Existing CORS configuration

---

## Troubleshooting

### Issue: "You already have a pending teacher application"
**Solution:** A user can only have one pending application at a time. They must wait for admin review before reapplying.

### Issue: User not seeing "Apply to Become Teacher" button
**Solution:** Button only shows if:
- User is logged in
- User is NOT already a teacher
- User is NOT an admin

### Issue: Admin not seeing applications in dashboard
**Solution:** 
1. Verify user is admin (IsAdmin = true in database)
2. Check JWT token includes Admin role claim
3. Verify database has TeacherApplications table
4. Check browser console for API errors

### Issue: Application status not updating after admin approval
**Solution:**
1. Check browser cache (hard refresh)
2. User needs to logout/login to get new JWT with teacher role
3. Verify database transaction completed
4. Check backend logs for errors

---

## Files Created/Modified

### Backend Files Created:
```
backend/Models/TeacherApplication.cs
backend/DTOs/TeacherDTOs.cs
backend/Services/Interfaces/ITeacherService.cs
backend/Services/TeacherService.cs
backend/Controllers/TeachersController.cs
```

### Backend Files Modified:
```
backend/Program.cs (added service registration)
backend/Data/ApplicationDbContext.cs (added DbSet)
```

### Frontend Files Created:
```
frontend/src/components/TeacherApplicationModal.jsx
frontend/src/components/TeacherApplicationReviewModal.jsx
frontend/src/pages/Admin/ManageTeachers.jsx
```

### Frontend Files Modified:
```
frontend/src/pages/Profile/UserProfile.jsx (added button & import)
frontend/src/App.js (added admin route)
```

### Documentation Files Created:
```
TEACHER_APPLICATION_WORKFLOW.md (comprehensive guide)
TEACHER_WORKFLOW_DIAGRAM.md (visual diagrams)
```

---

## Next Steps

### Immediate:
1. Run database migration
2. Test backend endpoints with Postman
3. Test frontend UI
4. Verify JWT token includes claims

### Near Term:
1. Add email notifications
2. Implement document upload for applications
3. Add application deadline/review SLA
4. Create email templates for decisions

### Long Term:
1. Implement teacher badges/levels
2. Add automated verification checks
3. Create teacher onboarding workflow
4. Implement teacher rating system

---

## Support

For questions or issues:
1. Check the TEACHER_APPLICATION_WORKFLOW.md for detailed info
2. Review the TEACHER_WORKFLOW_DIAGRAM.md for visual explanation
3. Check API responses in browser console
4. Review backend logs for errors

**Last Updated:** January 10, 2026
**Status:** ✅ Ready for Testing
