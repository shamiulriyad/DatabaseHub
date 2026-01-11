## Teacher Application Workflow - Visual Guide

```
┌─────────────────────────────────────────────────────────────────┐
│                     REGISTRATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

  Student Registration
        │
        ├─ All users register as STUDENT
        ├─ No role selection at signup
        ├─ JWT token generated
        └─ Immediate access to student features


┌─────────────────────────────────────────────────────────────────┐
│                TEACHER APPLICATION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. USER INITIATES APPLICATION
   ┌──────────────────┐
   │ Student Profile  │
   │   (logged in)    │
   └────────┬─────────┘
            │
            ├─ Click "Apply to Become Teacher"
            │
            ├─ Opens Modal Dialog
            │
            ├─ Fills form:
            │   • Reason for applying
            │   • Qualifications
            │   • Area of expertise
            │
            └─ Clicks "Submit Application"
                    │
                    ▼

2. BACKEND PROCESSING
   ┌──────────────────────────────────┐
   │  POST /api/teachers/apply        │
   │  [ApplyTeacherDTO]               │
   └────────┬─────────────────────────┘
            │
            ├─ Validate user exists
            ├─ Check not already teacher
            ├─ Check no pending application
            │
            ├─ Create TeacherApplication record
            │  • Status = "Pending"
            │  • ApplicationDate = NOW
            │
            └─ Return success response
                    │
                    ▼

3. APPLICATION STORED IN DATABASE
   ┌──────────────────────────────────┐
   │    TeacherApplications Table      │
   │  ┌──────────────────────────────┐ │
   │  │ id: 1                        │ │
   │  │ user_id: 5                   │ │
   │  │ status: "Pending"            │ │
   │  │ reason_for_applying: "..."   │ │
   │  │ application_date: 2026-01-10 │ │
   │  │ reviewed_date: null          │ │
   │  │ reviewed_by_admin_id: null   │ │
   │  │ admin_remarks: null          │ │
   │  └──────────────────────────────┘ │
   └──────────────────────────────────┘
                    │
                    ▼

4. ADMIN REVIEWS APPLICATION
   ┌──────────────────────────────────┐
   │    Admin Dashboard                │
   │  /admin/manage-teachers           │
   └────────┬─────────────────────────┘
            │
            ├─ Shows PENDING tab with applications
            │
            ├─ Admin clicks "Review"
            │
            ├─ Opens Review Modal with:
            │   • Applicant info
            │   • Application details
            │   • Decision buttons (Approve/Reject)
            │   • Remarks textarea
            │
            ├─ Admin enters remarks
            │
            └─ Admin clicks "Approve" OR "Reject"
                    │
          ┌─────────┴──────────┐
          ▼                    ▼

5A. APPROVAL PATH          5B. REJECTION PATH
    │                          │
    ├─ POST /api/teachers/    ├─ POST /api/teachers/
    │  applications/{id}/review│  applications/{id}/review
    │  [decision: "Approved"]   │  [decision: "Rejected"]
    │                          │
    ├─ Update User:            ├─ Keep User as Student:
    │  • IsTeacher = true      │  • IsTeacher = false
    │  • IsStudent = true      │  • IsStudent = true
    │  • (keeps student role)  │  (user can reapply later)
    │                          │
    ├─ Update Application:     ├─ Update Application:
    │  • status = "Approved"   │  • status = "Rejected"
    │  • reviewed_date = NOW   │  • reviewed_date = NOW
    │  • reviewed_by_admin_id  │  • reviewed_by_admin_id
    │  • approved_date = NOW   │  • admin_remarks = "..."
    │                          │
    ├─ Regenerate JWT with    ├─ Keep existing JWT
    │  Teacher claims          │  (no changes needed)
    │                          │
    └─ Send notification       └─ Send notification
       "Approved!"                "Application Rejected"


┌─────────────────────────────────────────────────────────────────┐
│                   POST-DECISION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

IF APPROVED:
  ┌────────────────────────────────────┐
  │ User is now a TEACHER              │
  ├────────────────────────────────────┤
  │ New Capabilities:                  │
  │  ✓ Create courses                  │
  │  ✓ Upload course materials         │
  │  ✓ View student submissions        │
  │  ✓ Grade assignments               │
  │  ✓ Access teacher dashboard        │
  │  ✓ Still has student features      │
  └────────────────────────────────────┘

IF REJECTED:
  ┌────────────────────────────────────┐
  │ User remains a STUDENT             │
  ├────────────────────────────────────┤
  │ Options:                           │
  │  • Can reapply after improvements  │
  │  • Can see admin remarks           │
  │  • Can contact support             │
  │  • Full student features available │
  └────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    STATUS TRANSITIONS                           │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │  STUDENT    │
                    │ (Default)   │
                    └──────┬──────┘
                           │
                    Clicks "Apply"
                           │
                           ▼
                    ┌──────────────┐
                    │ APPLICATION  │
                    │   PENDING    │ ◄── Can only have ONE pending
                    └──┬───────┬───┘
         ┌──────────────┘       └──────────────┐
         │                                     │
    Admin Approves                        Admin Rejects
         │                                     │
         ▼                                     ▼
    ┌─────────────┐                      ┌──────────────┐
    │  APPROVED   │                      │  REJECTED    │
    ├─────────────┤                      ├──────────────┤
    │ IsTeacher=1 │                      │ IsStudent=1  │
    │IsStudent=1  │                      │ IsTeacher=0  │
    └─────────────┘                      └──────────────┘
         │                                     │
         │                                     │
         │ (User is now teacher)              │ Can apply again
         │                                     │
         ▼                                     ▼
    ┌──────────────┐                    ┌──────────────┐
    │   Teacher    │                    │   Student    │
    │ Dashboard    │                    │ Can reapply  │
    │  Features    │                    │  later       │
    └──────────────┘                    └──────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      ENDPOINT HIERARCHY                         │
└─────────────────────────────────────────────────────────────────┘

User Endpoints:
├── POST   /api/teachers/apply
│           └─ Submit teacher application
│
├── GET    /api/teachers/my-application
│           └─ Get current application status
│
└── GET    /api/teachers/has-pending-application
            └─ Quick check if pending

Admin Endpoints:
├── GET    /api/teachers/applications
│           ├─ ?status=Pending    (Filter by status)
│           ├─ ?status=Approved
│           └─ ?status=Rejected
│
├── GET    /api/teachers/applications/{id}
│           └─ Get single application details
│
└── POST   /api/teachers/applications/{id}/review
            └─ Submit approval/rejection decision


┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                            │
└─────────────────────────────────────────────────────────────────┘

FRONTEND                          BACKEND                 DATABASE
─────────────────────────────────────────────────────────────────

UserProfile.jsx
    │
    ├─ Shows user info
    ├─ Shows roles (Student, Teacher, etc)
    └─ [Apply to Become Teacher] button
         │
         ▼
TeacherApplicationModal.jsx
    │
    ├─ Opens dialog
    ├─ Shows form
    └─ POST /api/teachers/apply
         │
         ▼
    TeachersController
    │
    ├─ Validates input
    └─ Calls TeacherService
         │
         ▼
    TeacherService
    │
    ├─ Business logic
    └─ Saves to database
         │
         ▼
    ApplicationDbContext
    │
    ├─ Creates TeacherApplication record
    └─ Saves to Users & TeacherApplications tables
         │
         ▼
    DATABASE
    │
    ├─ Users table (IsTeacher stays false)
    └─ TeacherApplications table
       {
         id: 1,
         user_id: 5,
         status: "Pending",
         reason_for_applying: "...",
         application_date: 2026-01-10,
         reviewed_date: null,
         admin_remarks: null
       }


┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN REVIEW FLOW                          │
└─────────────────────────────────────────────────────────────────┘

Admin Dashboard
    │
    └─ /admin/manage-teachers
         │
         ├─ Fetches from GET /api/teachers/applications
         │
         ├─ Shows in tabs:
         │   • Pending (5)
         │   • Approved (12)
         │   • Rejected (3)
         │
         └─ For Pending applications:
              │
              ├─ Card shows:
              │   • Applicant name
              │   • Email
              │   • Reason (truncated)
              │   • Application date
              │   • [Review] button
              │
              └─ Clicks [Review]
                   │
                   ▼
              TeacherApplicationReviewModal
              │
              ├─ Shows full application:
              │   • All user info
              │   • Full reason text
              │   • Qualifications
              │   • Expertise areas
              │
              ├─ Admin actions:
              │   • Enters remarks (required for rejection)
              │   • Clicks [Approve] OR [Reject]
              │
              └─ POST /api/teachers/applications/{id}/review
                   │
                   ▼
              TeachersController.ReviewApplication()
              │
              ├─ Validates admin role
              ├─ Updates TeacherApplication:
              │   • status = "Approved" or "Rejected"
              │   • reviewed_date = NOW
              │   • reviewed_by_admin_id = admin_id
              │   • admin_remarks = "..."
              │
              └─ If Approved:
                   │
                   ├─ Updates User record:
                   │   • IsTeacher = true
                   │   • IsStudent = true (keeps both)
                   │
                   └─ Regenerates JWT with new claims
                       (next login will have teacher role)


This visual guide shows the complete workflow from registration through
teacher application and approval/rejection process.
