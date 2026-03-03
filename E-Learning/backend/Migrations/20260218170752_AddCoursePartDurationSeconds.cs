using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCoursePartDurationSeconds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // `Duration` and `VideoType` columns on `Lessons` already exist in the database
            // in some environments. Skip adding them here to avoid duplicate-column errors.
            // migrationBuilder.AddColumn<int>(
            //     name: "Duration",
            //     table: "Lessons",
            //     type: "integer",
            //     nullable: true);

            // migrationBuilder.AddColumn<string>(
            //     name: "VideoType",
            //     table: "Lessons",
            //     type: "text",
            //     nullable: true);

            // `DurationSeconds` column already exists in some environments; skip adding it here.
            // migrationBuilder.AddColumn<int>(
            //     name: "DurationSeconds",
            //     table: "CourseParts",
            //     type: "integer",
            //     nullable: false,
            //     defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "CoursePartProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EnrollmentId = table.Column<int>(type: "integer", nullable: false),
                    CoursePartId = table.Column<int>(type: "integer", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProgressPercentage = table.Column<double>(type: "double precision", nullable: false),
                    TimeSpentMinutes = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoursePartProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CoursePartProgresses_CourseParts_CoursePartId",
                        column: x => x.CoursePartId,
                        principalTable: "CourseParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CoursePartProgresses_Enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "Enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentLessonProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    LessonId = table.Column<int>(type: "integer", nullable: false),
                    WatchedSeconds = table.Column<int>(type: "integer", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastWatchedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentLessonProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentLessonProgresses_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentLessonProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CoursePartProgresses_CoursePartId",
                table: "CoursePartProgresses",
                column: "CoursePartId");

            migrationBuilder.CreateIndex(
                name: "IX_CoursePartProgresses_EnrollmentId",
                table: "CoursePartProgresses",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentLessonProgresses_LessonId",
                table: "StudentLessonProgresses",
                column: "LessonId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentLessonProgresses_UserId",
                table: "StudentLessonProgresses",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CoursePartProgresses");

            migrationBuilder.DropTable(
                name: "StudentLessonProgresses");

            // Columns "Duration" and "VideoType" on "Lessons" were not created by this migration
            // in some environments (they already existed) so we do not drop them here.

            // `DurationSeconds` column on `CourseParts` may already exist; do not drop it here.
            // migrationBuilder.DropColumn(
            //     name: "DurationSeconds",
            //     table: "CourseParts");
        }
    }
}
