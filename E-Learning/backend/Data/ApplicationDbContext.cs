using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Users
        public DbSet<User> Users => Set<User>();

        // University System
        public DbSet<University> Universities => Set<University>();
        public DbSet<Department> Departments => Set<Department>();

        // Course System
        public DbSet<Course> Courses => Set<Course>();
        public DbSet<Module> Modules => Set<Module>();
        public DbSet<Lesson> Lessons => Set<Lesson>();

        // Learning System
        public DbSet<Enrollment> Enrollments => Set<Enrollment>();
        public DbSet<Quiz> Quizzes => Set<Quiz>();
        public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
        public DbSet<QuizSubmission> QuizSubmissions => Set<QuizSubmission>();
        public DbSet<Assignment> Assignments => Set<Assignment>();
        public DbSet<AssignmentSubmission> AssignmentSubmissions => Set<AssignmentSubmission>();
        public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();

        // Community System
        public DbSet<Post> Posts => Set<Post>();
        public DbSet<Comment> Comments => Set<Comment>();
        public DbSet<PostVote> PostVotes => Set<PostVote>();
        public DbSet<CommentVote> CommentVotes => Set<CommentVote>();

        // Clan System
        public DbSet<Clan> Clans => Set<Clan>();
        public DbSet<ClanMember> ClanMembers => Set<ClanMember>();
        public DbSet<ClanJoinRequest> ClanJoinRequests => Set<ClanJoinRequest>();
        public DbSet<ClanAnnouncement> ClanAnnouncements => Set<ClanAnnouncement>();
        public DbSet<ClanAnnouncementReaction> ClanAnnouncementReactions => Set<ClanAnnouncementReaction>();
        public DbSet<PostReaction> PostReactions => Set<PostReaction>();

        // Notification System
        public DbSet<Notification> Notifications => Set<Notification>();

        // Competition System
        public DbSet<Competition> Competitions => Set<Competition>();
        public DbSet<CompetitionParticipant> CompetitionParticipants => Set<CompetitionParticipant>();
        public DbSet<CompetitionScore> CompetitionScores => Set<CompetitionScore>();
        public DbSet<CompetitionQuestion> CompetitionQuestions => Set<CompetitionQuestion>();

        // Review System
        public DbSet<Review> Reviews => Set<Review>();

        // Payment System
        public DbSet<Payment> Payments => Set<Payment>();

        // Ranking System
        public DbSet<Ranking> Rankings => Set<Ranking>();
        public DbSet<Leaderboard> Leaderboards => Set<Leaderboard>();

        // Teacher Application System
        public DbSet<TeacherApplication> TeacherApplications => Set<TeacherApplication>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.HasIndex(u => u.Username).IsUnique();
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("NOW()");
                entity.Property(u => u.TotalPoints).HasDefaultValue(0);
                entity.Property(u => u.IsStudent).HasDefaultValue(true);
            });

            // University Configuration
            modelBuilder.Entity<University>(entity =>
            {
                entity.HasIndex(u => u.Code).IsUnique();
                entity.HasIndex(u => u.Name);
                entity.Property(u => u.IsActive).HasDefaultValue(true);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("NOW()");
            });

            // Department Configuration
            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasIndex(d => new { d.UniversityId, d.Code }).IsUnique();
                entity.HasIndex(d => d.Name);
                entity.Property(d => d.IsActive).HasDefaultValue(true);
                entity.Property(d => d.CreatedAt).HasDefaultValueSql("NOW()");
                
                entity.HasOne(d => d.University)
                    .WithMany(u => u.Departments)
                    .HasForeignKey(d => d.UniversityId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Course Configuration
            modelBuilder.Entity<Course>(entity =>
            {
                entity.HasIndex(c => c.CourseCode).IsUnique();
                entity.HasIndex(c => new { c.UniversityId, c.DepartmentId });
                entity.HasIndex(c => c.TeacherId);
                entity.HasIndex(c => c.Status);
                entity.HasIndex(c => c.IsFree);
                entity.HasIndex(c => c.DifficultyLevel);
                entity.HasIndex(c => c.CreatedAt);
                
                entity.Property(c => c.IsFree).HasDefaultValue(true);
                entity.Property(c => c.Status).HasDefaultValue("Pending");
                entity.Property(c => c.DifficultyLevel).HasDefaultValue("Beginner");
                entity.Property(c => c.EnrollmentCount).HasDefaultValue(0);
                entity.Property(c => c.AverageRating).HasDefaultValue(0);
                entity.Property(c => c.CreatedAt).HasDefaultValueSql("NOW()");
                
                entity.HasOne(c => c.University)
                    .WithMany(u => u.Courses)
                    .HasForeignKey(c => c.UniversityId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(c => c.Department)
                    .WithMany(d => d.Courses)
                    .HasForeignKey(c => c.DepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(c => c.Teacher)
                    .WithMany(u => u.CreatedCourses)
                    .HasForeignKey(c => c.TeacherId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Enrollment Configuration
            modelBuilder.Entity<Enrollment>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CourseId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.EnrolledAt);
                
                entity.Property(e => e.EnrolledAt).HasDefaultValueSql("NOW()");
                entity.Property(e => e.Status).HasDefaultValue("Active");
                entity.Property(e => e.ProgressPercentage).HasDefaultValue(0);
                
                entity.HasOne(e => e.User)
                    .WithMany(u => u.Enrollments)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.Course)
                    .WithMany(c => c.Enrollments)
                    .HasForeignKey(e => e.CourseId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Quiz Configuration
            modelBuilder.Entity<Quiz>(entity =>
            {
                entity.HasIndex(q => q.CourseId);
                entity.HasIndex(q => new { q.CourseId, q.ModuleId, q.LessonId });
                entity.HasIndex(q => q.IsPublished);
                
                entity.Property(q => q.IsPublished).HasDefaultValue(false);
                entity.Property(q => q.AllowRetake).HasDefaultValue(true);
                entity.Property(q => q.MaxAttempts).HasDefaultValue(3);
                entity.Property(q => q.PassingScore).HasDefaultValue(70);
                entity.Property(q => q.CreatedAt).HasDefaultValueSql("NOW()");
            });

            // Assignment Configuration
            modelBuilder.Entity<Assignment>(entity =>
            {
                entity.HasIndex(a => a.CourseId);
                entity.HasIndex(a => new { a.CourseId, a.ModuleId, a.LessonId });
                entity.HasIndex(a => a.DueDate);
                
                entity.Property(a => a.MaxScore).HasDefaultValue(100);
                entity.Property(a => a.PassingScore).HasDefaultValue(50);
                entity.Property(a => a.AllowLateSubmission).HasDefaultValue(false);
                entity.Property(a => a.IsPublished).HasDefaultValue(false);
                entity.Property(a => a.CreatedAt).HasDefaultValueSql("NOW()");
            });

            // AssignmentSubmission Configuration
            modelBuilder.Entity<AssignmentSubmission>(entity =>
            {
                entity.HasIndex(asub => asub.UserId);
                entity.HasIndex(asub => asub.AssignmentId);
                entity.HasIndex(asub => new { asub.UserId, asub.AssignmentId });
                entity.HasIndex(asub => asub.Status);
                entity.HasIndex(asub => asub.SubmittedAt);

                entity.Property(asub => asub.Status).HasDefaultValue("Submitted");
                entity.Property(asub => asub.IsGraded).HasDefaultValue(false);
                entity.Property(asub => asub.IsLate).HasDefaultValue(false);
                entity.Property(asub => asub.IsResubmission).HasDefaultValue(false);
                entity.Property(asub => asub.SubmittedAt).HasDefaultValueSql("NOW()");
                entity.Property(asub => asub.MaxScore).HasPrecision(18, 2);
                entity.Property(asub => asub.Score).HasPrecision(18, 2);
                entity.Property(asub => asub.LatePenalty).HasPrecision(18, 2);

                // Relationship with User (Submitter)
                entity.HasOne(asub => asub.User)
                    .WithMany()
                    .HasForeignKey(asub => asub.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relationship with Assignment
                entity.HasOne(asub => asub.Assignment)
                    .WithMany()
                    .HasForeignKey(asub => asub.AssignmentId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Relationship with User (Grader/Teacher)
                entity.HasOne(asub => asub.Grader)
                    .WithMany()
                    .HasForeignKey(asub => asub.GradedBy)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Clan Join Requests
            modelBuilder.Entity<ClanJoinRequest>(entity =>
            {
                entity.HasIndex(r => new { r.ClanId, r.UserId, r.Status });
                entity.Property(r => r.Status).HasMaxLength(20).HasDefaultValue("Pending");
                entity.Property(r => r.RequestedAt).HasDefaultValueSql("NOW()");

                entity.HasOne(r => r.Clan)
                    .WithMany()
                    .HasForeignKey(r => r.ClanId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.User)
                    .WithMany()
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Post Configuration (Community)
            modelBuilder.Entity<Post>(entity =>
            {
                entity.HasIndex(p => p.UserId);
                entity.HasIndex(p => p.CourseId);
                entity.HasIndex(p => p.UniversityId);
                entity.HasIndex(p => p.DepartmentId);
                entity.HasIndex(p => p.ClanId);
                entity.HasIndex(p => p.PostType);
                entity.HasIndex(p => p.IsExamRelated);
                entity.HasIndex(p => p.CreatedAt);
                
                entity.Property(p => p.PostType).HasDefaultValue("Discussion");
                entity.Property(p => p.IsExamRelated).HasDefaultValue(false);
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
                entity.Property(p => p.UpvoteCount).HasDefaultValue(0);
                entity.Property(p => p.ViewCount).HasDefaultValue(0);
            });

            // Clan Configuration
            modelBuilder.Entity<Clan>(entity =>
            {
                entity.HasIndex(c => c.Name).IsUnique();
                entity.HasIndex(c => c.Tag).IsUnique();
                entity.HasIndex(c => c.LeaderId);
                entity.HasIndex(c => c.ClanType);
                entity.HasIndex(c => c.Rank);
                
                entity.Property(c => c.ClanType).HasDefaultValue("Academic");
                entity.Property(c => c.IsPublic).HasDefaultValue(true);
                entity.Property(c => c.RequireApproval).HasDefaultValue(false);
                entity.Property(c => c.MaxMembers).HasDefaultValue(100);
                entity.Property(c => c.MemberCount).HasDefaultValue(1);
                entity.Property(c => c.CreatedAt).HasDefaultValueSql("NOW()");
            });

            // ClanMember Configuration
            modelBuilder.Entity<ClanMember>(entity =>
            {
                entity.HasIndex(cm => new { cm.UserId, cm.ClanId }).IsUnique();
                entity.HasIndex(cm => cm.ClanId);
                entity.HasIndex(cm => cm.Role);
                // DB-level guard: a user can have only one leadership role across clans
                // Creates a partial/filtered unique index on UserId for leadership roles
                entity.HasIndex(cm => cm.UserId)
                      .IsUnique()
                      .HasFilter("Role IN ('Leader','CoLeader')");
                
                entity.Property(cm => cm.Role).HasDefaultValue("Member");
                entity.Property(cm => cm.JoinedAt).HasDefaultValueSql("NOW()");
                entity.Property(cm => cm.ContributionPoints).HasDefaultValue(0);
                entity.Property(cm => cm.ReceiveNotifications).HasDefaultValue(true);
            });

            // Competition Configuration
            modelBuilder.Entity<Competition>(entity =>
            {
                entity.HasIndex(c => c.CompetitionType);
                entity.HasIndex(c => c.Status);
                entity.HasIndex(c => c.StartDate);
                entity.HasIndex(c => c.EndDate);
                entity.HasIndex(c => new { c.UniversityId, c.DepartmentId, c.CourseId });
                
                entity.Property(c => c.CompetitionType).HasDefaultValue("Quiz");
                entity.Property(c => c.Status).HasDefaultValue("Upcoming");
                entity.Property(c => c.MaxParticipants).HasDefaultValue(100);
                entity.Property(c => c.IsTeamBased).HasDefaultValue(false);
                entity.Property(c => c.TeamSize).HasDefaultValue(1);
                entity.Property(c => c.ParticipantCount).HasDefaultValue(0);
                entity.Property(c => c.CreatedAt).HasDefaultValueSql("NOW()");
            });

            // CompetitionParticipant Configuration
            modelBuilder.Entity<CompetitionParticipant>(entity =>
            {
                entity.HasIndex(cp => new { cp.CompetitionId, cp.UserId }).IsUnique();
                entity.HasIndex(cp => cp.Status);
                entity.HasIndex(cp => cp.JoinedAt);
            });

            // Review Configuration
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasIndex(r => new { r.UserId, r.CourseId }).IsUnique();
                entity.HasIndex(r => r.CourseId);
                entity.HasIndex(r => r.Rating);
                entity.HasIndex(r => r.CreatedAt);
                
                entity.Property(r => r.Rating).IsRequired();
                entity.Property(r => r.IsApproved).HasDefaultValue(true);
                entity.Property(r => r.HelpfulCount).HasDefaultValue(0);
                entity.Property(r => r.CreatedAt).HasDefaultValueSql("NOW()");
            });

            // Payment Configuration
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasIndex(p => p.UserId);
                entity.HasIndex(p => p.CourseId);
                entity.HasIndex(p => p.TransactionId).IsUnique();
                entity.HasIndex(p => p.Status);
                entity.HasIndex(p => p.CreatedAt);
                
                entity.Property(p => p.Status).HasDefaultValue("Pending");
                entity.Property(p => p.Currency).HasDefaultValue("BDT");
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
                entity.Property(p => p.PlatformCommission).HasPrecision(18, 2);
                entity.Property(p => p.TeacherEarning).HasPrecision(18, 2);
                entity.Property(p => p.Amount).HasPrecision(18, 2);
            });

            // Configure JSON columns for PostgreSQL
            modelBuilder.Entity<User>()
                .Property(u => u.Badges)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Course>()
                .Property(c => c.ImportantTopics)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Course>()
                .Property(c => c.PreviousQuestions)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Course>()
                .Property(c => c.CourseMaterials)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Course>()
                .Property(c => c.Tags)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Lesson>()
                .Property(l => l.Attachments)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Lesson>()
                .Property(l => l.References)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Post>()
                .Property(p => p.ExamTags)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Clan>()
                .Property(c => c.FocusSubjects)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<QuizSubmission>()
                .Property(qs => qs.UserAnswers)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Competition>()
                .Property(c => c.CompetitionRules)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Competition>()
                .Property(c => c.ScoringSystem)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Assignment>()
                .Property(a => a.Rubric)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<AssignmentSubmission>()
                .Property(a => a.RubricScores)
                .HasColumnType("jsonb");
            
            modelBuilder.Entity<Payment>()
                .Property(p => p.PaymentDetails)
                .HasColumnType("jsonb");
        }
    }
}