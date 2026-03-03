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
        public DbSet<DepartmentRequest> DepartmentRequests => Set<DepartmentRequest>();
        public DbSet<UniversityRequest> UniversityRequests => Set<UniversityRequest>();

        // Course System
        public DbSet<Course> Courses => Set<Course>();
        public DbSet<CoursePart> CourseParts => Set<CoursePart>();
        public DbSet<Module> Modules => Set<Module>();
        public DbSet<Lesson> Lessons => Set<Lesson>();
        public DbSet<CoursePartProgress> CoursePartProgresses => Set<CoursePartProgress>();

        // Student lesson-level progress (time-based)
        public DbSet<StudentLessonProgress> StudentLessonProgresses => Set<StudentLessonProgress>();

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
        // Team System
        public DbSet<Team> Teams => Set<Team>();
        public DbSet<TeamMember> TeamMembers => Set<TeamMember>();

        // Competition Registrations (team-based)
        public DbSet<CompetitionRegistration> CompetitionRegistrations => Set<CompetitionRegistration>();

        // Notification System
        public DbSet<Notification> Notifications => Set<Notification>();

        // Competition System
        public DbSet<Competition> Competitions => Set<Competition>();
        public DbSet<CompetitionParticipant> CompetitionParticipants => Set<CompetitionParticipant>();
        public DbSet<CompetitionScore> CompetitionScores => Set<CompetitionScore>();
        public DbSet<CompetitionQuestion> CompetitionQuestions => Set<CompetitionQuestion>();

        // Clan vs Clan Competition System
        public DbSet<ClanVsClansCompetition> ClanVsClansCompetitions => Set<ClanVsClansCompetition>();
        public DbSet<ClanVsClansCompetitionParticipant> ClanVsClansCompetitionParticipants => Set<ClanVsClansCompetitionParticipant>();
        public DbSet<ClanVsClansCompetitionScore> ClanVsClansCompetitionScores => Set<ClanVsClansCompetitionScore>();
        public DbSet<ClanVsClansCompetitionQuestion> ClanVsClansCompetitionQuestions => Set<ClanVsClansCompetitionQuestion>();

        // Review System
        public DbSet<Review> Reviews => Set<Review>();

        // Payment System
        public DbSet<Payment> Payments => Set<Payment>();

        // Ranking System
        public DbSet<Ranking> Rankings => Set<Ranking>();
        public DbSet<Leaderboard> Leaderboards => Set<Leaderboard>();

        // Teacher Application System
        public DbSet<TeacherApplication> TeacherApplications => Set<TeacherApplication>();

        // Competition Progression System
        public DbSet<UserCompetitionHistory> UserCompetitionHistories => Set<UserCompetitionHistory>();
        public DbSet<ExpRewardRule> ExpRewardRules => Set<ExpRewardRule>();
        public DbSet<LevelThreshold> LevelThresholds => Set<LevelThreshold>();

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
                entity.Property(u => u.Exp).HasDefaultValue(0L);
                entity.Property(u => u.Level).HasDefaultValue(0);
            });

            modelBuilder.Entity<UserCompetitionHistory>(entity =>
            {
                entity.HasIndex(h => new { h.UserId, h.CompetitionId }).IsUnique();
                entity.HasIndex(h => h.CompetitionId);
                entity.HasIndex(h => h.ClanTeamId);
                entity.HasIndex(h => h.Date);
                entity.Property(h => h.Date).HasDefaultValueSql("NOW()");

                entity.HasOne(h => h.User)
                    .WithMany(u => u.CompetitionHistory)
                    .HasForeignKey(h => h.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(h => h.Competition)
                    .WithMany()
                    .HasForeignKey(h => h.CompetitionId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(h => h.ClanTeam)
                    .WithMany()
                    .HasForeignKey(h => h.ClanTeamId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ExpRewardRule>(entity =>
            {
                entity.HasKey(e => e.Position);
            });

            modelBuilder.Entity<LevelThreshold>(entity =>
            {
                entity.HasKey(l => l.Level);
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

            // CoursePart Configuration
            modelBuilder.Entity<CoursePart>(entity =>
            {
                entity.HasIndex(p => p.CourseId);
                entity.HasIndex(p => new { p.CourseId, p.Order });
                entity.Property(p => p.Order).HasDefaultValue(0);
                entity.Property(p => p.IsPreview).HasDefaultValue(false);

                    entity.HasOne(p => p.Course)
                        .WithMany(c => c.CourseParts)
                        .HasForeignKey(p => p.CourseId)
                        .OnDelete(DeleteBehavior.Cascade);
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
                // ClanVsClansCompetition Configuration
                modelBuilder.Entity<ClanVsClansCompetition>(entity =>
                {
                    entity.HasIndex(cvsc => cvsc.ChallengerClanId);
                    entity.HasIndex(cvsc => cvsc.OpponentClanId);
                    entity.HasIndex(cvsc => cvsc.CreatedByUserId);
                    entity.HasIndex(cvsc => cvsc.Status);
                    entity.HasIndex(cvsc => cvsc.CreatedAt);

                    entity.Property(cvsc => cvsc.Status).HasDefaultValue("Pending");
                    entity.Property(cvsc => cvsc.CompetitionType).HasDefaultValue("Programming");
                    entity.Property(cvsc => cvsc.DifficultyLevel).HasDefaultValue("Medium");
                    entity.Property(cvsc => cvsc.ParticipantsPerClan).HasDefaultValue(3);
                    entity.Property(cvsc => cvsc.DurationMinutes).HasDefaultValue(30);
                    entity.Property(cvsc => cvsc.CreatedAt).HasDefaultValueSql("NOW()");
                    entity.Property(cvsc => cvsc.ChallengerReady).HasDefaultValue(false);
                    entity.Property(cvsc => cvsc.OpponentReady).HasDefaultValue(false);
                    entity.Property(cvsc => cvsc.ShowScoresToOpponent).HasDefaultValue(true);
                    entity.Property(cvsc => cvsc.AllowWithdrawal).HasDefaultValue(false);

                    // Challenger Clan relationship
                    entity.HasOne(cvsc => cvsc.ChallengerClan)
                        .WithMany(c => c.ChallengedCompetitions)
                        .HasForeignKey(cvsc => cvsc.ChallengerClanId)
                        .OnDelete(DeleteBehavior.Restrict);

                    // Opponent Clan relationship
                    entity.HasOne(cvsc => cvsc.OpponentClan)
                        .WithMany(c => c.OpponentCompetitions)
                        .HasForeignKey(cvsc => cvsc.OpponentClanId)
                        .OnDelete(DeleteBehavior.Restrict);

                    // Creator relationship
                    entity.HasOne(cvsc => cvsc.CreatedBy)
                        .WithMany()
                        .HasForeignKey(cvsc => cvsc.CreatedByUserId)
                        .OnDelete(DeleteBehavior.Restrict);
                });

                // ClanVsClansCompetitionParticipant Configuration
                modelBuilder.Entity<ClanVsClansCompetitionParticipant>(entity =>
                {
                    entity.HasIndex(cvscm => cvscm.CompetitionId);
                    entity.HasIndex(cvscm => cvscm.UserId);
                    entity.HasIndex(cvscm => cvscm.ClanId);
                    entity.HasIndex(cvscm => new { cvscm.CompetitionId, cvscm.UserId });

                    entity.Property(cvscm => cvscm.Status).HasDefaultValue("Pending");
                    entity.Property(cvscm => cvscm.Score).HasDefaultValue(0);
                    entity.Property(cvscm => cvscm.CorrectAnswers).HasDefaultValue(0);
                    entity.Property(cvscm => cvscm.WrongAnswers).HasDefaultValue(0);
                    entity.Property(cvscm => cvscm.TimeTakenSeconds).HasDefaultValue(0);

                    entity.HasOne(cvscm => cvscm.Competition)
                        .WithMany(cvsc => cvsc.AllParticipants)
                        .HasForeignKey(cvscm => cvscm.CompetitionId)
                        .OnDelete(DeleteBehavior.Cascade);

                    entity.HasOne(cvscm => cvscm.User)
                        .WithMany()
                        .HasForeignKey(cvscm => cvscm.UserId)
                        .OnDelete(DeleteBehavior.Restrict);

                    entity.HasOne(cvscm => cvscm.Clan)
                        .WithMany(c => c.CompetitionParticipants)
                        .HasForeignKey(cvscm => cvscm.ClanId)
                        .OnDelete(DeleteBehavior.Restrict);
                });

                // ClanVsClansCompetitionQuestion Configuration
                modelBuilder.Entity<ClanVsClansCompetitionQuestion>(entity =>
                {
                    entity.HasIndex(cvscq => cvscq.CompetitionId);

                    entity.HasOne(cvscq => cvscq.Competition)
                        .WithMany(cvsc => cvsc.Questions)
                        .HasForeignKey(cvscq => cvscq.CompetitionId)
                        .OnDelete(DeleteBehavior.Cascade);
                });

                // ClanVsClansCompetitionScore Configuration
                modelBuilder.Entity<ClanVsClansCompetitionScore>(entity =>
                {
                    entity.HasIndex(cvscs => cvscs.CompetitionId);
                    entity.HasIndex(cvscs => cvscs.ParticipantId);

                    entity.HasOne(cvscs => cvscs.Competition)
                        .WithMany(cvsc => cvsc.Scores)
                        .HasForeignKey(cvscs => cvscs.CompetitionId)
                        .OnDelete(DeleteBehavior.Cascade);

                    entity.HasOne(cvscs => cvscs.Participant)
                        .WithMany()
                        .HasForeignKey(cvscs => cvscs.ParticipantId)
                        .OnDelete(DeleteBehavior.Cascade);
                });
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

            // Team Configuration
            modelBuilder.Entity<Team>(entity =>
            {
                entity.HasIndex(t => t.ClanId);
                entity.HasIndex(t => t.CreatedBy);
                entity.HasIndex(t => new { t.ClanId, t.Name }).IsUnique();

                entity.Property(t => t.CreatedAt).HasDefaultValueSql("NOW()");

                entity.HasOne(t => t.Clan)
                    .WithMany()
                    .HasForeignKey(t => t.ClanId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(t => t.CreatedByUser)
                    .WithMany()
                    .HasForeignKey(t => t.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // TeamMember Configuration
            modelBuilder.Entity<TeamMember>(entity =>
            {
                entity.HasIndex(tm => new { tm.TeamId, tm.UserId }).IsUnique();
                entity.HasIndex(tm => tm.UserId);

                entity.Property(tm => tm.JoinedAt).HasDefaultValueSql("NOW()");

                entity.HasOne(tm => tm.Team)
                      .WithMany(t => t.Members)
                      .HasForeignKey(tm => tm.TeamId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(tm => tm.User)
                      .WithMany()
                      .HasForeignKey(tm => tm.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // CompetitionRegistration Configuration
            modelBuilder.Entity<CompetitionRegistration>(entity =>
            {
                entity.HasIndex(cr => new { cr.CompetitionId, cr.TeamId }).IsUnique();
                entity.HasIndex(cr => cr.Status);

                entity.Property(cr => cr.Status).HasDefaultValue("Pending");
                entity.Property(cr => cr.RegisteredAt).HasDefaultValueSql("NOW()");

                entity.HasOne(cr => cr.Competition)
                      .WithMany()
                      .HasForeignKey(cr => cr.CompetitionId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(cr => cr.Team)
                      .WithMany()
                      .HasForeignKey(cr => cr.TeamId)
                      .OnDelete(DeleteBehavior.Cascade);
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