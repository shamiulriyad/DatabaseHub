using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Universities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    LogoUrl = table.Column<string>(type: "text", nullable: true),
                    BannerUrl = table.Column<string>(type: "text", nullable: true),
                    Website = table.Column<string>(type: "text", nullable: true),
                    Location = table.Column<string>(type: "text", nullable: true),
                    EstablishedYear = table.Column<string>(type: "text", nullable: true),
                    ContactEmail = table.Column<string>(type: "text", nullable: true),
                    ContactPhone = table.Column<string>(type: "text", nullable: true),
                    TotalCourses = table.Column<int>(type: "integer", nullable: false),
                    TotalStudents = table.Column<int>(type: "integer", nullable: false),
                    TotalTeachers = table.Column<int>(type: "integer", nullable: false),
                    TotalEnrollments = table.Column<int>(type: "integer", nullable: false),
                    UniversityRank = table.Column<int>(type: "integer", nullable: false),
                    AverageCourseRating = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Universities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ProfileImageUrl = table.Column<string>(type: "text", nullable: true),
                    Bio = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsStudent = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsTeacher = table.Column<bool>(type: "boolean", nullable: false),
                    IsCompetitor = table.Column<bool>(type: "boolean", nullable: false),
                    IsAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    TotalPoints = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CurrentRank = table.Column<int>(type: "integer", nullable: false),
                    Badges = table.Column<string>(type: "jsonb", nullable: true),
                    TotalCoursesEnrolled = table.Column<int>(type: "integer", nullable: false),
                    TotalCoursesCompleted = table.Column<int>(type: "integer", nullable: false),
                    AverageGrade = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalQuizzesTaken = table.Column<int>(type: "integer", nullable: false),
                    TotalAssignmentsSubmitted = table.Column<int>(type: "integer", nullable: false),
                    StreakDays = table.Column<int>(type: "integer", nullable: false),
                    LastActive = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLogin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UniversityId = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    HeadOfDepartment = table.Column<string>(type: "text", nullable: true),
                    ContactEmail = table.Column<string>(type: "text", nullable: true),
                    ContactPhone = table.Column<string>(type: "text", nullable: true),
                    TotalCourses = table.Column<int>(type: "integer", nullable: false),
                    TotalStudents = table.Column<int>(type: "integer", nullable: false),
                    TotalTeachers = table.Column<int>(type: "integer", nullable: false),
                    AverageCourseRating = table.Column<decimal>(type: "numeric", nullable: false),
                    DepartmentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Departments_Universities_UniversityId",
                        column: x => x.UniversityId,
                        principalTable: "Universities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Clans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Tag = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    LeaderId = table.Column<int>(type: "integer", nullable: false),
                    LogoUrl = table.Column<string>(type: "text", nullable: true),
                    BannerUrl = table.Column<string>(type: "text", nullable: true),
                    Motto = table.Column<string>(type: "text", nullable: true),
                    ClanType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Academic"),
                    UniversityId = table.Column<int>(type: "integer", nullable: true),
                    DepartmentId = table.Column<int>(type: "integer", nullable: true),
                    CourseId = table.Column<int>(type: "integer", nullable: true),
                    FocusSubjects = table.Column<string>(type: "jsonb", nullable: true),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    RequireApproval = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    MaxMembers = table.Column<int>(type: "integer", nullable: false, defaultValue: 100),
                    JoinCriteria = table.Column<string>(type: "text", nullable: true),
                    MemberCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    TotalPoints = table.Column<int>(type: "integer", nullable: false),
                    WeeklyPoints = table.Column<int>(type: "integer", nullable: false),
                    MonthlyPoints = table.Column<int>(type: "integer", nullable: false),
                    Rank = table.Column<int>(type: "integer", nullable: false),
                    TotalCompetitions = table.Column<int>(type: "integer", nullable: false),
                    CompetitionWins = table.Column<int>(type: "integer", nullable: false),
                    TotalPosts = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    LastActivity = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Clans_Users_LeaderId",
                        column: x => x.LeaderId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Leaderboards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    GlobalRank = table.Column<int>(type: "integer", nullable: false),
                    TotalPoints = table.Column<int>(type: "integer", nullable: false),
                    CoursesCompleted = table.Column<int>(type: "integer", nullable: false),
                    QuizzesAttempted = table.Column<int>(type: "integer", nullable: false),
                    CorrectAnswers = table.Column<int>(type: "integer", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leaderboards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Leaderboards_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ShortDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FullDescription = table.Column<string>(type: "text", nullable: false),
                    UniversityId = table.Column<int>(type: "integer", nullable: false),
                    DepartmentId = table.Column<int>(type: "integer", nullable: false),
                    TeacherId = table.Column<int>(type: "integer", nullable: false),
                    CourseCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CourseType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ExamFocus = table.Column<string>(type: "text", nullable: true),
                    ExamPattern = table.Column<string>(type: "text", nullable: true),
                    ImportantTopics = table.Column<string>(type: "jsonb", nullable: true),
                    PreviousQuestions = table.Column<string>(type: "jsonb", nullable: true),
                    IsFree = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Price = table.Column<decimal>(type: "numeric", nullable: true),
                    DiscountPrice = table.Column<decimal>(type: "numeric", nullable: true),
                    PlatformCommission = table.Column<decimal>(type: "numeric", nullable: true),
                    TeacherEarning = table.Column<decimal>(type: "numeric", nullable: true),
                    TotalModules = table.Column<int>(type: "integer", nullable: false),
                    TotalLessons = table.Column<int>(type: "integer", nullable: false),
                    TotalQuizzes = table.Column<int>(type: "integer", nullable: false),
                    TotalAssignments = table.Column<int>(type: "integer", nullable: false),
                    DurationHours = table.Column<int>(type: "integer", nullable: false),
                    DifficultyLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Beginner"),
                    ThumbnailUrl = table.Column<string>(type: "text", nullable: true),
                    PreviewVideoUrl = table.Column<string>(type: "text", nullable: true),
                    CourseMaterials = table.Column<string>(type: "jsonb", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    ApprovedBy = table.Column<int>(type: "integer", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true),
                    EnrollmentCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    AverageRating = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    TotalReviews = table.Column<int>(type: "integer", nullable: false),
                    TotalCompleted = table.Column<int>(type: "integer", nullable: false),
                    TotalQuizAttempts = table.Column<int>(type: "integer", nullable: false),
                    TotalAssignmentSubmissions = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsSelfPaced = table.Column<bool>(type: "boolean", nullable: false),
                    Tags = table.Column<string>(type: "jsonb", nullable: true),
                    Keywords = table.Column<string>(type: "text", nullable: true),
                    ViewCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Courses_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Courses_Universities_UniversityId",
                        column: x => x.UniversityId,
                        principalTable: "Universities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Courses_Users_ApprovedBy",
                        column: x => x.ApprovedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Courses_Users_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClanMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ClanId = table.Column<int>(type: "integer", nullable: false),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Member"),
                    ContributionPoints = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    WeeklyPoints = table.Column<int>(type: "integer", nullable: false),
                    MonthlyPoints = table.Column<int>(type: "integer", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    LastActive = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalPosts = table.Column<int>(type: "integer", nullable: false),
                    TotalComments = table.Column<int>(type: "integer", nullable: false),
                    ReceiveNotifications = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClanMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClanMembers_Clans_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClanMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Modules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    EstimatedDuration = table.Column<int>(type: "integer", nullable: false),
                    LearningObjectives = table.Column<string>(type: "text", nullable: true),
                    HasVideo = table.Column<bool>(type: "boolean", nullable: false),
                    HasPDF = table.Column<bool>(type: "boolean", nullable: false),
                    HasSlides = table.Column<bool>(type: "boolean", nullable: false),
                    HasQuiz = table.Column<bool>(type: "boolean", nullable: false),
                    HasAssignment = table.Column<bool>(type: "boolean", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    CompletionPoints = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Modules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Modules_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    CourseId = table.Column<int>(type: "integer", nullable: true),
                    PaymentFor = table.Column<string>(type: "text", nullable: true),
                    PaymentMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TransactionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PlatformCommission = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TeacherEarning = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PlatformEarning = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "BDT"),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    PaymentProvider = table.Column<string>(type: "text", nullable: true),
                    PaymentDetails = table.Column<string>(type: "jsonb", nullable: true),
                    IsRefunded = table.Column<bool>(type: "boolean", nullable: false),
                    RefundAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    RefundedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RefundReason = table.Column<string>(type: "text", nullable: true),
                    InvoiceNumber = table.Column<string>(type: "text", nullable: true),
                    InvoiceUrl = table.Column<string>(type: "text", nullable: true),
                    TaxAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    DiscountAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Payments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Posts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    UniversityId = table.Column<int>(type: "integer", nullable: true),
                    DepartmentId = table.Column<int>(type: "integer", nullable: true),
                    CourseId = table.Column<int>(type: "integer", nullable: true),
                    ClanId = table.Column<int>(type: "integer", nullable: true),
                    PostType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Discussion"),
                    IsExamRelated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ExamTags = table.Column<string>(type: "jsonb", nullable: true),
                    Subject = table.Column<string>(type: "text", nullable: true),
                    MediaUrl = table.Column<string>(type: "text", nullable: true),
                    MediaType = table.Column<string>(type: "text", nullable: true),
                    UpvoteCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    DownvoteCount = table.Column<int>(type: "integer", nullable: false),
                    CommentCount = table.Column<int>(type: "integer", nullable: false),
                    ViewCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ShareCount = table.Column<int>(type: "integer", nullable: false),
                    IsPinned = table.Column<bool>(type: "boolean", nullable: false),
                    IsClosed = table.Column<bool>(type: "boolean", nullable: false),
                    IsReported = table.Column<bool>(type: "boolean", nullable: false),
                    ReportCount = table.Column<int>(type: "integer", nullable: false),
                    BestAnswerId = table.Column<int>(type: "integer", nullable: true),
                    HasTeacherAnswer = table.Column<bool>(type: "boolean", nullable: false),
                    TeacherAnswerId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastActivity = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Posts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Posts_Clans_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clans",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Posts_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Posts_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Posts_Universities_UniversityId",
                        column: x => x.UniversityId,
                        principalTable: "Universities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Posts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rankings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    CourseId = table.Column<int>(type: "integer", nullable: true),
                    UniversityId = table.Column<int>(type: "integer", nullable: true),
                    ClanId = table.Column<int>(type: "integer", nullable: true),
                    RankPosition = table.Column<int>(type: "integer", nullable: false),
                    TotalPoints = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rankings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rankings_Clans_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clans",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Rankings_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Rankings_Universities_UniversityId",
                        column: x => x.UniversityId,
                        principalTable: "Universities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Rankings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Lessons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: true),
                    ModuleId = table.Column<int>(type: "integer", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    ContentType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    VideoUrl = table.Column<string>(type: "text", nullable: true),
                    PdfUrl = table.Column<string>(type: "text", nullable: true),
                    SlidesUrl = table.Column<string>(type: "text", nullable: true),
                    ExternalLink = table.Column<string>(type: "text", nullable: true),
                    VideoDuration = table.Column<int>(type: "integer", nullable: true),
                    VideoProvider = table.Column<string>(type: "text", nullable: true),
                    IsPreview = table.Column<bool>(type: "boolean", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    CompletionPoints = table.Column<int>(type: "integer", nullable: false),
                    IsImportantForExam = table.Column<bool>(type: "boolean", nullable: false),
                    ExamNotes = table.Column<string>(type: "text", nullable: true),
                    Attachments = table.Column<string>(type: "jsonb", nullable: true),
                    References = table.Column<string>(type: "jsonb", nullable: true),
                    ViewCount = table.Column<int>(type: "integer", nullable: false),
                    CompletionCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lessons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Lessons_Modules_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "Modules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Enrollments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    EnrollmentType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastAccessed = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedModules = table.Column<int>(type: "integer", nullable: false),
                    TotalModules = table.Column<int>(type: "integer", nullable: false),
                    CompletedLessons = table.Column<int>(type: "integer", nullable: false),
                    TotalLessons = table.Column<int>(type: "integer", nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "numeric", nullable: false, defaultValue: 0m),
                    QuizAverage = table.Column<decimal>(type: "numeric", nullable: true),
                    AssignmentAverage = table.Column<decimal>(type: "numeric", nullable: true),
                    FinalGrade = table.Column<decimal>(type: "numeric", nullable: true),
                    GradeLetter = table.Column<string>(type: "text", nullable: true),
                    PointsEarned = table.Column<int>(type: "integer", nullable: false),
                    QuizPoints = table.Column<int>(type: "integer", nullable: false),
                    AssignmentPoints = table.Column<int>(type: "integer", nullable: false),
                    CompletionPoints = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Active"),
                    AmountPaid = table.Column<decimal>(type: "numeric", nullable: true),
                    PaymentId = table.Column<int>(type: "integer", nullable: true),
                    PaymentStatus = table.Column<string>(type: "text", nullable: true),
                    CertificateEarned = table.Column<bool>(type: "boolean", nullable: false),
                    CertificateUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Enrollments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Enrollments_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Enrollments_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalTable: "Payments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Enrollments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Comments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Content = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    PostId = table.Column<int>(type: "integer", nullable: false),
                    ParentCommentId = table.Column<int>(type: "integer", nullable: true),
                    Depth = table.Column<int>(type: "integer", nullable: false),
                    UpvoteCount = table.Column<int>(type: "integer", nullable: false),
                    DownvoteCount = table.Column<int>(type: "integer", nullable: false),
                    ReplyCount = table.Column<int>(type: "integer", nullable: false),
                    IsAnswer = table.Column<bool>(type: "boolean", nullable: false),
                    IsTeacherAnswer = table.Column<bool>(type: "boolean", nullable: false),
                    IsBestAnswer = table.Column<bool>(type: "boolean", nullable: false),
                    IsReported = table.Column<bool>(type: "boolean", nullable: false),
                    ReportCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comments_Comments_ParentCommentId",
                        column: x => x.ParentCommentId,
                        principalTable: "Comments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Comments_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PostVotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PostId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    VoteType = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostVotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PostVotes_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PostVotes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Assignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    ModuleId = table.Column<int>(type: "integer", nullable: true),
                    LessonId = table.Column<int>(type: "integer", nullable: true),
                    MaxScore = table.Column<int>(type: "integer", nullable: false, defaultValue: 100),
                    PassingScore = table.Column<int>(type: "integer", nullable: false, defaultValue: 50),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AllowLateSubmission = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LateSubmissionDays = table.Column<int>(type: "integer", nullable: true),
                    LatePenaltyPercentage = table.Column<decimal>(type: "numeric", nullable: true),
                    AttachmentUrl = table.Column<string>(type: "text", nullable: true),
                    SampleSolutionUrl = table.Column<string>(type: "text", nullable: true),
                    SubmissionFormat = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Instructions = table.Column<string>(type: "text", nullable: true),
                    Rubric = table.Column<string>(type: "jsonb", nullable: true),
                    AssignmentPoints = table.Column<int>(type: "integer", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsMandatory = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Assignments_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Assignments_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Assignments_Modules_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "Modules",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Quizzes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    ModuleId = table.Column<int>(type: "integer", nullable: true),
                    LessonId = table.Column<int>(type: "integer", nullable: true),
                    TimeLimit = table.Column<int>(type: "integer", nullable: false),
                    TotalQuestions = table.Column<int>(type: "integer", nullable: false),
                    PassingScore = table.Column<int>(type: "integer", nullable: false, defaultValue: 70),
                    MaxScore = table.Column<int>(type: "integer", nullable: false),
                    ShuffleQuestions = table.Column<bool>(type: "boolean", nullable: false),
                    ShuffleOptions = table.Column<bool>(type: "boolean", nullable: false),
                    ShowCorrectAnswers = table.Column<bool>(type: "boolean", nullable: false),
                    ShowResultsImmediately = table.Column<bool>(type: "boolean", nullable: false),
                    AllowRetake = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    MaxAttempts = table.Column<int>(type: "integer", nullable: false, defaultValue: 3),
                    RequirePassword = table.Column<bool>(type: "boolean", nullable: false),
                    QuizPassword = table.Column<string>(type: "text", nullable: true),
                    AvailableFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AvailableUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsMandatory = table.Column<bool>(type: "boolean", nullable: false),
                    QuizPoints = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quizzes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quizzes_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Quizzes_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Quizzes_Modules_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "Modules",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LessonProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EnrollmentId = table.Column<int>(type: "integer", nullable: false),
                    LessonId = table.Column<int>(type: "integer", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProgressPercentage = table.Column<double>(type: "double precision", nullable: false),
                    TimeSpentMinutes = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LessonProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LessonProgresses_Enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "Enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LessonProgresses_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: false),
                    ContentRating = table.Column<int>(type: "integer", nullable: true),
                    TeachingRating = table.Column<int>(type: "integer", nullable: true),
                    ExamPreparationRating = table.Column<int>(type: "integer", nullable: true),
                    MaterialQualityRating = table.Column<int>(type: "integer", nullable: true),
                    HelpfulCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    UnhelpfulCount = table.Column<int>(type: "integer", nullable: false),
                    HasTeacherResponse = table.Column<bool>(type: "boolean", nullable: false),
                    TeacherResponse = table.Column<string>(type: "text", nullable: true),
                    TeacherRespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsVerifiedPurchase = table.Column<bool>(type: "boolean", nullable: false),
                    EnrollmentId = table.Column<int>(type: "integer", nullable: true),
                    IsReported = table.Column<bool>(type: "boolean", nullable: false),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "Enrollments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Reviews_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CommentVotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CommentId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    VoteType = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommentVotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommentVotes_Comments_CommentId",
                        column: x => x.CommentId,
                        principalTable: "Comments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CommentVotes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    AssignmentId = table.Column<int>(type: "integer", nullable: false),
                    AnswerText = table.Column<string>(type: "text", nullable: true),
                    AttachmentUrl = table.Column<string>(type: "text", nullable: true),
                    FileName = table.Column<string>(type: "text", nullable: true),
                    FileType = table.Column<string>(type: "text", nullable: true),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    Score = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Grade = table.Column<string>(type: "text", nullable: true),
                    IsGraded = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    GradedBy = table.Column<int>(type: "integer", nullable: true),
                    Feedback = table.Column<string>(type: "text", nullable: true),
                    RubricScores = table.Column<string>(type: "jsonb", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsLate = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LatePenalty = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Submitted"),
                    IsResubmission = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    OriginalSubmissionId = table.Column<int>(type: "integer", nullable: true),
                    PointsEarned = table.Column<int>(type: "integer", nullable: false),
                    AssignmentId1 = table.Column<int>(type: "integer", nullable: true),
                    EnrollmentId = table.Column<int>(type: "integer", nullable: true),
                    UserId1 = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssignmentSubmissions_Assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssignmentSubmissions_Assignments_AssignmentId1",
                        column: x => x.AssignmentId1,
                        principalTable: "Assignments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AssignmentSubmissions_Enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "Enrollments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AssignmentSubmissions_Users_GradedBy",
                        column: x => x.GradedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_AssignmentSubmissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssignmentSubmissions_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Competitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CompetitionType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Quiz"),
                    UniversityId = table.Column<int>(type: "integer", nullable: true),
                    DepartmentId = table.Column<int>(type: "integer", nullable: true),
                    CourseId = table.Column<int>(type: "integer", nullable: true),
                    ClanId = table.Column<int>(type: "integer", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    IsLive = table.Column<bool>(type: "boolean", nullable: false),
                    MaxParticipants = table.Column<int>(type: "integer", nullable: false, defaultValue: 100),
                    IsTeamBased = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    TeamSize = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    AllowMultipleAttempts = table.Column<bool>(type: "boolean", nullable: false),
                    QuizId = table.Column<int>(type: "integer", nullable: true),
                    AssignmentId = table.Column<int>(type: "integer", nullable: true),
                    CompetitionRules = table.Column<string>(type: "jsonb", nullable: true),
                    TotalQuestions = table.Column<int>(type: "integer", nullable: false),
                    MaxScore = table.Column<int>(type: "integer", nullable: false),
                    ScoringSystem = table.Column<string>(type: "jsonb", nullable: true),
                    ShowLeaderboard = table.Column<bool>(type: "boolean", nullable: false),
                    PrizeDescription = table.Column<string>(type: "text", nullable: true),
                    PrizeAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    PrizeBadge = table.Column<string>(type: "text", nullable: true),
                    PrizePoints = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Upcoming"),
                    ParticipantCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ViewCount = table.Column<int>(type: "integer", nullable: false),
                    FirstPlacePoints = table.Column<int>(type: "integer", nullable: false),
                    SecondPlacePoints = table.Column<int>(type: "integer", nullable: false),
                    ThirdPlacePoints = table.Column<int>(type: "integer", nullable: false),
                    ParticipationPoints = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Competitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Competitions_Assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Competitions_Clans_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clans",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Competitions_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Competitions_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Competitions_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Competitions_Universities_UniversityId",
                        column: x => x.UniversityId,
                        principalTable: "Universities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuizId = table.Column<int>(type: "integer", nullable: false),
                    QuestionText = table.Column<string>(type: "text", nullable: false),
                    QuestionType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    OptionA = table.Column<string>(type: "text", nullable: true),
                    OptionB = table.Column<string>(type: "text", nullable: true),
                    OptionC = table.Column<string>(type: "text", nullable: true),
                    OptionD = table.Column<string>(type: "text", nullable: true),
                    OptionE = table.Column<string>(type: "text", nullable: true),
                    CorrectAnswer = table.Column<string>(type: "text", nullable: false),
                    MultipleCorrectAnswers = table.Column<string>(type: "text", nullable: true),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    DifficultyLevel = table.Column<int>(type: "integer", nullable: false),
                    Explanation = table.Column<string>(type: "text", nullable: true),
                    Tags = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizQuestions_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    QuizId = table.Column<int>(type: "integer", nullable: false),
                    AttemptNumber = table.Column<int>(type: "integer", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    TotalQuestions = table.Column<int>(type: "integer", nullable: false),
                    CorrectAnswers = table.Column<int>(type: "integer", nullable: false),
                    WrongAnswers = table.Column<int>(type: "integer", nullable: false),
                    Percentage = table.Column<decimal>(type: "numeric", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TimeTaken = table.Column<int>(type: "integer", nullable: true),
                    IsPassed = table.Column<bool>(type: "boolean", nullable: false),
                    IsGraded = table.Column<bool>(type: "boolean", nullable: false),
                    UserAnswers = table.Column<string>(type: "jsonb", nullable: true),
                    ManualGrade = table.Column<decimal>(type: "numeric", nullable: true),
                    TeacherFeedback = table.Column<string>(type: "text", nullable: true),
                    PointsEarned = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EnrollmentId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizSubmissions_Enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "Enrollments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_QuizSubmissions_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuizSubmissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompetitionParticipants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    CompetitionId = table.Column<int>(type: "integer", nullable: false),
                    TeamId = table.Column<int>(type: "integer", nullable: true),
                    TeamName = table.Column<string>(type: "text", nullable: true),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Score = table.Column<decimal>(type: "numeric", nullable: true),
                    Rank = table.Column<int>(type: "integer", nullable: true),
                    TimeTaken = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    WonPrize = table.Column<bool>(type: "boolean", nullable: false),
                    PrizeWon = table.Column<string>(type: "text", nullable: true),
                    PointsEarned = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitionParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetitionParticipants_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompetitionParticipants_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompetitionScores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompetitionId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    Rank = table.Column<int>(type: "integer", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitionScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetitionScores_Competitions_CompetitionId",
                        column: x => x.CompetitionId,
                        principalTable: "Competitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompetitionScores_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_CourseId",
                table: "Assignments",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_CourseId_ModuleId_LessonId",
                table: "Assignments",
                columns: new[] { "CourseId", "ModuleId", "LessonId" });

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_DueDate",
                table: "Assignments",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_LessonId",
                table: "Assignments",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_ModuleId",
                table: "Assignments",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentSubmissions_AssignmentId",
                table: "AssignmentSubmissions",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentSubmissions_AssignmentId1",
                table: "AssignmentSubmissions",
                column: "AssignmentId1");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentSubmissions_EnrollmentId",
                table: "AssignmentSubmissions",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentSubmissions_GradedBy",
                table: "AssignmentSubmissions",
                column: "GradedBy");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentSubmissions_Status",
                table: "AssignmentSubmissions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentSubmissions_SubmittedAt",
                table: "AssignmentSubmissions",
                column: "SubmittedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentSubmissions_UserId",
                table: "AssignmentSubmissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentSubmissions_UserId_AssignmentId",
                table: "AssignmentSubmissions",
                columns: new[] { "UserId", "AssignmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentSubmissions_UserId1",
                table: "AssignmentSubmissions",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_ClanMembers_ClanId",
                table: "ClanMembers",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanMembers_Role",
                table: "ClanMembers",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_ClanMembers_UserId_ClanId",
                table: "ClanMembers",
                columns: new[] { "UserId", "ClanId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clans_ClanType",
                table: "Clans",
                column: "ClanType");

            migrationBuilder.CreateIndex(
                name: "IX_Clans_LeaderId",
                table: "Clans",
                column: "LeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_Clans_Name",
                table: "Clans",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clans_Rank",
                table: "Clans",
                column: "Rank");

            migrationBuilder.CreateIndex(
                name: "IX_Clans_Tag",
                table: "Clans",
                column: "Tag",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ParentCommentId",
                table: "Comments",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_PostId",
                table: "Comments",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_UserId",
                table: "Comments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CommentVotes_CommentId",
                table: "CommentVotes",
                column: "CommentId");

            migrationBuilder.CreateIndex(
                name: "IX_CommentVotes_UserId",
                table: "CommentVotes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionParticipants_CompetitionId",
                table: "CompetitionParticipants",
                column: "CompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionParticipants_UserId",
                table: "CompetitionParticipants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_AssignmentId",
                table: "Competitions",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_ClanId",
                table: "Competitions",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_CompetitionType",
                table: "Competitions",
                column: "CompetitionType");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_CourseId",
                table: "Competitions",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_DepartmentId",
                table: "Competitions",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_EndDate",
                table: "Competitions",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_QuizId",
                table: "Competitions",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_StartDate",
                table: "Competitions",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_Status",
                table: "Competitions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_UniversityId_DepartmentId_CourseId",
                table: "Competitions",
                columns: new[] { "UniversityId", "DepartmentId", "CourseId" });

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionScores_CompetitionId",
                table: "CompetitionScores",
                column: "CompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionScores_UserId",
                table: "CompetitionScores",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_ApprovedBy",
                table: "Courses",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_CourseCode",
                table: "Courses",
                column: "CourseCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Courses_CreatedAt",
                table: "Courses",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_DepartmentId",
                table: "Courses",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_DifficultyLevel",
                table: "Courses",
                column: "DifficultyLevel");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_IsFree",
                table: "Courses",
                column: "IsFree");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_Status",
                table: "Courses",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_TeacherId",
                table: "Courses",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_UniversityId_DepartmentId",
                table: "Courses",
                columns: new[] { "UniversityId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_Name",
                table: "Departments",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_UniversityId_Code",
                table: "Departments",
                columns: new[] { "UniversityId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_CourseId",
                table: "Enrollments",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_EnrolledAt",
                table: "Enrollments",
                column: "EnrolledAt");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_PaymentId",
                table: "Enrollments",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_Status",
                table: "Enrollments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_UserId",
                table: "Enrollments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_UserId_CourseId",
                table: "Enrollments",
                columns: new[] { "UserId", "CourseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Leaderboards_UserId",
                table: "Leaderboards",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonProgresses_EnrollmentId",
                table: "LessonProgresses",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_LessonProgresses_LessonId",
                table: "LessonProgresses",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_ModuleId",
                table: "Lessons",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_Modules_CourseId",
                table: "Modules",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CourseId",
                table: "Payments",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CreatedAt",
                table: "Payments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_Status",
                table: "Payments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TransactionId",
                table: "Payments",
                column: "TransactionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_UserId",
                table: "Payments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_ClanId",
                table: "Posts",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_CourseId",
                table: "Posts",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_CreatedAt",
                table: "Posts",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_DepartmentId",
                table: "Posts",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_IsExamRelated",
                table: "Posts",
                column: "IsExamRelated");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_PostType",
                table: "Posts",
                column: "PostType");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_UniversityId",
                table: "Posts",
                column: "UniversityId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_UserId",
                table: "Posts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PostVotes_PostId",
                table: "PostVotes",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_PostVotes_UserId",
                table: "PostVotes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_QuizId",
                table: "QuizQuestions",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizSubmissions_EnrollmentId",
                table: "QuizSubmissions",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizSubmissions_QuizId",
                table: "QuizSubmissions",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizSubmissions_UserId",
                table: "QuizSubmissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Quizzes_CourseId",
                table: "Quizzes",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Quizzes_CourseId_ModuleId_LessonId",
                table: "Quizzes",
                columns: new[] { "CourseId", "ModuleId", "LessonId" });

            migrationBuilder.CreateIndex(
                name: "IX_Quizzes_IsPublished",
                table: "Quizzes",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_Quizzes_LessonId",
                table: "Quizzes",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_Quizzes_ModuleId",
                table: "Quizzes",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_Rankings_ClanId",
                table: "Rankings",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_Rankings_CourseId",
                table: "Rankings",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Rankings_UniversityId",
                table: "Rankings",
                column: "UniversityId");

            migrationBuilder.CreateIndex(
                name: "IX_Rankings_UserId",
                table: "Rankings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CourseId",
                table: "Reviews",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CreatedAt",
                table: "Reviews",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_EnrollmentId",
                table: "Reviews",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_Rating",
                table: "Reviews",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId_CourseId",
                table: "Reviews",
                columns: new[] { "UserId", "CourseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Universities_Code",
                table: "Universities",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Universities_Name",
                table: "Universities",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssignmentSubmissions");

            migrationBuilder.DropTable(
                name: "ClanMembers");

            migrationBuilder.DropTable(
                name: "CommentVotes");

            migrationBuilder.DropTable(
                name: "CompetitionParticipants");

            migrationBuilder.DropTable(
                name: "CompetitionScores");

            migrationBuilder.DropTable(
                name: "Leaderboards");

            migrationBuilder.DropTable(
                name: "LessonProgresses");

            migrationBuilder.DropTable(
                name: "PostVotes");

            migrationBuilder.DropTable(
                name: "QuizQuestions");

            migrationBuilder.DropTable(
                name: "QuizSubmissions");

            migrationBuilder.DropTable(
                name: "Rankings");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "Comments");

            migrationBuilder.DropTable(
                name: "Competitions");

            migrationBuilder.DropTable(
                name: "Enrollments");

            migrationBuilder.DropTable(
                name: "Posts");

            migrationBuilder.DropTable(
                name: "Assignments");

            migrationBuilder.DropTable(
                name: "Quizzes");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Clans");

            migrationBuilder.DropTable(
                name: "Lessons");

            migrationBuilder.DropTable(
                name: "Modules");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Universities");
        }
    }
}
