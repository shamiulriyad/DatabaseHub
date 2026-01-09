# 🎓 E-Learning Platform - Backend API

A comprehensive RESTful API for an E-Learning platform built with ASP.NET Core and PostgreSQL.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: JWT-based authentication with role-based access control (Student, Teacher, Admin)
- **University Management**: Multi-university and department system
- **Course System**: Complete course management with modules, lessons, and content
- **Enrollment System**: Student enrollment with progress tracking
- **Assessment**: Quizzes and assignments with automated grading
- **Community Forum**: Discussion posts, comments, voting system
- **Reviews & Ratings**: Course review and rating system
- **Payment Integration**: Payment processing and transaction management

### Gamification Features
- **Clan System**: Student clans with membership management
- **Competitions**: Academic competitions with leaderboards
- **Ranking System**: Global and course-specific rankings
- **Points & Badges**: Achievement system for student engagement

## 🛠️ Tech Stack

- **Framework**: .NET 8.0 / ASP.NET Core
- **Database**: PostgreSQL with Entity Framework Core
- **Authentication**: JWT Bearer Tokens
- **API Documentation**: Swagger/OpenAPI
- **ORM**: Entity Framework Core with Code-First migrations

## 📋 Prerequisites

- .NET SDK 8.0 or higher
- PostgreSQL 14+
- Visual Studio 2022 / VS Code

🔑 API Endpoints
Authentication
POST /api/auth/register - User registration
POST /api/auth/login - User login
Universities & Departments
GET /api/universities - Get all universities
GET /api/departments - Get departments
Courses
GET /api/courses - Browse courses
POST /api/courses - Create course (Teacher)
GET /api/courses/{id} - Course details
Enrollments
POST /api/enrollments/enroll/{courseId} - Enroll in course
GET /api/enrollments - User enrollments
GET /api/enrollments/{id}/progress - Enrollment progress
Learning
POST /api/learning/complete-lesson - Mark lesson complete
POST /api/learning/submit-quiz - Submit quiz
POST /api/learning/submit-assignment - Submit assignment
Community
GET /api/community/posts - Get posts
POST /api/community/posts - Create post
POST /api/community/posts/{id}/vote - Vote on post
Clans & Competitions
GET /api/clans - Get clans
POST /api/clans - Create clan
GET /api/competitions - Get competitions


👥 User Roles
Student: Enroll, learn, participate in community
Teacher: Create courses, manage content, grade assignments
Admin: Full system access, user management
