# Admin Teacher Approval System - Testing Guide

## Prerequisites
- Backend running on `http://localhost:5145`
- Frontend running on `http://localhost:3000` (or configured port)
- Database with sample data or test users

## Test Scenarios

### Scenario 1: Non-Admin User Access
**Objective**: Verify non-admin users cannot access admin panel

**Steps**:
1. Login with a regular user account (non-admin)
2. Try to navigate to `http://localhost:3000/admin/teachers`
3. Should be redirected to home page

**Expected Result**: ✅ Non-admin users are blocked from accessing the panel

---

### Scenario 2: Admin User Access
**Objective**: Verify admin users can access the admin panel

**Steps**:
1. Login with admin account
2. Navigate to `/admin/teachers`
3. Verify the page loads with pending applications

**Expected Result**: ✅ Admin panel loads successfully with teacher list

---

### Scenario 3: View Pending Applications
**Objective**: Verify pending applications are displayed correctly

**Steps**:
1. As admin user, navigate to `/admin/teachers`
2. Check that the pending applications table shows:
   - Full Name
   - Email
   - Experience Area
   - Application Date
   - Review button

**Expected Result**: ✅ Table displays all required information

---

### Scenario 4: Approve Application
**Objective**: Verify approving an application sets IsTeacher flag

**Steps**:
1. Click "Review" button on a pending application
2. In the modal, review the applicant details
3. Leave the Admin Remarks field empty (optional for approval)
4. Click "Approve" button
5. Verify success toast appears
6. Check database: User.IsTeacher should be `true`

**Expected Result**: ✅ 
- Application marked as Approved
- User.IsTeacher = true
- Success notification shown
- Table refreshes

---

### Scenario 5: Reject Application
**Objective**: Verify rejecting an application stores remarks

**Steps**:
1. Click "Review" button on a pending application
2. In the modal, add remarks: "Qualifications not sufficient"
3. Click "Reject" button
4. Verify success toast appears
5. Check database: Application.Status = "Rejected", AdminRemarks populated

**Expected Result**: ✅
- Application marked as Rejected
- Remarks saved correctly
- Success notification shown

---

### Scenario 6: Reject Without Remarks
**Objective**: Verify rejection requires remarks

**Steps**:
1. Click "Review" button on a pending application
2. Leave Admin Remarks empty
3. Click "Reject" button

**Expected Result**: ✅ Warning toast appears: "Please provide remarks for rejection"

---

### Scenario 7: JWT Token Update
**Objective**: Verify approved user gets updated JWT token

**Steps**:
1. Approve a teacher application
2. Have that user logout and login again
3. Check if `isTeacher = true` in the JWT payload
4. User should now be able to access teacher dashboard

**Expected Result**: ✅
- User gets new JWT token with Teacher role
- User can access `/teacher` routes
- User appears in teacher dashboard

---

## Backend API Testing (Using Postman/Insomnia)

### Get Pending Applications
```
GET http://localhost:5145/api/teachers/applications?status=Pending
Headers:
  Authorization: Bearer <admin-token>
```

**Expected Response**:
```json
{
  "success": true,
  "count": 2,
  "applications": [
    {
      "id": 1,
      "userId": 5,
      "firstName": "John",
      "lastName": "Doe",
      "userName": "johndoe",
      "userEmail": "john@example.com",
      "status": "Pending",
      "applicationDate": "2024-01-10T10:00:00Z",
      "reasonForApplying": "I want to teach programming",
      "experienceArea": "Software Development",
      "qualificationDetails": "B.Sc in Computer Science"
    }
  ]
}
```

### Approve Application
```
POST http://localhost:5145/api/teachers/applications/1/review
Headers:
  Authorization: Bearer <admin-token>
Body:
{
  "decision": "Approved",
  "adminRemarks": "Great credentials!"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Application approved successfully",
  "application": {
    "id": 1,
    "status": "Approved",
    "approvedDate": "2024-01-11T14:30:00Z"
  }
}
```

### Reject Application
```
POST http://localhost:5145/api/teachers/applications/2/review
Headers:
  Authorization: Bearer <admin-token>
Body:
{
  "decision": "Rejected",
  "adminRemarks": "Insufficient teaching experience required"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Application rejected successfully",
  "application": {
    "id": 2,
    "status": "Rejected",
    "reviewedDate": "2024-01-11T14:30:00Z",
    "adminRemarks": "Insufficient teaching experience required"
  }
}
```

---

## Common Issues & Solutions

### Issue: "No pending applications" appears
**Solution**: 
- Create a test user account
- Have them apply to become a teacher via the application form
- Wait for the application to be created
- Then approve/reject it

### Issue: Admin user sees empty table
**Solution**:
- Verify user has `isAdmin = true` in database
- Check browser console for API errors
- Verify token is valid and not expired
- Check browser DevTools Network tab to see API response

### Issue: Approve button not working
**Solution**:
- Check browser console for errors
- Verify JWT token has Admin role claim
- Ensure backend is running
- Check API response in Network tab

### Issue: User still cannot access teacher routes after approval
**Solution**:
- User must logout and login again
- JWT token is only updated at login
- Check user.isTeacher flag is true in database
- Verify new JWT token has Teacher role

---

## Success Criteria

All of the following should be true:
- ✅ Non-admins cannot access `/admin/teachers`
- ✅ Admins can view pending teacher applications
- ✅ Admins can approve applications and set IsTeacher = true
- ✅ Admins can reject applications with remarks
- ✅ Approved users get Teacher role in new JWT token
- ✅ Success/error messages display correctly
- ✅ Table refreshes after action
- ✅ No unhandled errors in console

---

## Database Queries for Verification

### Check pending applications
```sql
SELECT * FROM TeacherApplications WHERE Status = 'Pending';
```

### Check approved teacher
```sql
SELECT Id, FirstName, LastName, Email, IsTeacher FROM Users WHERE Id = 5;
```

### Check JWT content (decode at jwt.io)
The token should contain:
```json
{
  "userId": "5",
  "email": "john@example.com",
  "username": "johndoe",
  "role": ["Student", "Teacher"],  // Teacher added after approval
  "iat": 1234567890,
  "exp": 1234654290
}
```
