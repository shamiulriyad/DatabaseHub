using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddApprovalFieldsToCompetitions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CompetitionParticipants_CompetitionId",
                table: "CompetitionParticipants");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "Competitions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovedBy",
                table: "Competitions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatorId",
                table: "Competitions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CreatorRole",
                table: "Competitions",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "Competitions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Competitions_CreatorId",
                table: "Competitions",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionParticipants_CompetitionId_UserId",
                table: "CompetitionParticipants",
                columns: new[] { "CompetitionId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionParticipants_JoinedAt",
                table: "CompetitionParticipants",
                column: "JoinedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionParticipants_Status",
                table: "CompetitionParticipants",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_Competitions_Users_CreatorId",
                table: "Competitions",
                column: "CreatorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Competitions_Users_CreatorId",
                table: "Competitions");

            migrationBuilder.DropIndex(
                name: "IX_Competitions_CreatorId",
                table: "Competitions");

            migrationBuilder.DropIndex(
                name: "IX_CompetitionParticipants_CompetitionId_UserId",
                table: "CompetitionParticipants");

            migrationBuilder.DropIndex(
                name: "IX_CompetitionParticipants_JoinedAt",
                table: "CompetitionParticipants");

            migrationBuilder.DropIndex(
                name: "IX_CompetitionParticipants_Status",
                table: "CompetitionParticipants");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "Competitions");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "Competitions");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "Competitions");

            migrationBuilder.DropColumn(
                name: "CreatorRole",
                table: "Competitions");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "Competitions");

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionParticipants_CompetitionId",
                table: "CompetitionParticipants",
                column: "CompetitionId");
        }
    }
}
