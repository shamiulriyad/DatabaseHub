using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TeacherIdVerificationUpgrade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdBackImagePath",
                table: "TeacherApplications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IdFrontImagePath",
                table: "TeacherApplications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IdNumber",
                table: "TeacherApplications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IdType",
                table: "TeacherApplications",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(
                @"UPDATE ""TeacherApplications""
                SET ""IdType"" = 'legacy_record'
                WHERE ""IdType"" = '' OR ""IdType"" IS NULL;

                UPDATE ""TeacherApplications""
                SET ""IdFrontImagePath"" = '/Uploads/teacher-ids/legacy/front-placeholder.png'
                WHERE ""IdFrontImagePath"" = '' OR ""IdFrontImagePath"" IS NULL;

                UPDATE ""TeacherApplications""
                SET ""IdBackImagePath"" = '/Uploads/teacher-ids/legacy/back-placeholder.png'
                WHERE ""IdBackImagePath"" = '' OR ""IdBackImagePath"" IS NULL;

                UPDATE ""TeacherApplications""
                SET ""IdNumber"" = CONCAT('LEGACY-', ""Id"")
                WHERE ""IdNumber"" = '' OR ""IdNumber"" IS NULL;");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherApplications_IdNumber",
                table: "TeacherApplications",
                column: "IdNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TeacherApplications_IdNumber",
                table: "TeacherApplications");

            migrationBuilder.DropColumn(
                name: "IdBackImagePath",
                table: "TeacherApplications");

            migrationBuilder.DropColumn(
                name: "IdFrontImagePath",
                table: "TeacherApplications");

            migrationBuilder.DropColumn(
                name: "IdNumber",
                table: "TeacherApplications");

            migrationBuilder.DropColumn(
                name: "IdType",
                table: "TeacherApplications");
        }
    }
}
