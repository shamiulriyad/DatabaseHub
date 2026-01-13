using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddClanJoinRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Season",
                table: "Competitions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ClanJoinRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClanId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    RequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewedByUserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClanJoinRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClanJoinRequests_Clans_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClanJoinRequests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clans_CourseId",
                table: "Clans",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_Clans_DepartmentId",
                table: "Clans",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Clans_UniversityId",
                table: "Clans",
                column: "UniversityId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanJoinRequests_ClanId_UserId_Status",
                table: "ClanJoinRequests",
                columns: new[] { "ClanId", "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ClanJoinRequests_UserId",
                table: "ClanJoinRequests",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Clans_Courses_CourseId",
                table: "Clans",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Clans_Departments_DepartmentId",
                table: "Clans",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Clans_Universities_UniversityId",
                table: "Clans",
                column: "UniversityId",
                principalTable: "Universities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clans_Courses_CourseId",
                table: "Clans");

            migrationBuilder.DropForeignKey(
                name: "FK_Clans_Departments_DepartmentId",
                table: "Clans");

            migrationBuilder.DropForeignKey(
                name: "FK_Clans_Universities_UniversityId",
                table: "Clans");

            migrationBuilder.DropTable(
                name: "ClanJoinRequests");

            migrationBuilder.DropIndex(
                name: "IX_Clans_CourseId",
                table: "Clans");

            migrationBuilder.DropIndex(
                name: "IX_Clans_DepartmentId",
                table: "Clans");

            migrationBuilder.DropIndex(
                name: "IX_Clans_UniversityId",
                table: "Clans");

            migrationBuilder.DropColumn(
                name: "Season",
                table: "Competitions");
        }
    }
}
