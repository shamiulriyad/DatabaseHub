using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCoverImageUrlToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverImageUrl",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ClanVsClansCompetitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ChallengerClanId = table.Column<int>(type: "integer", nullable: false),
                    OpponentClanId = table.Column<int>(type: "integer", nullable: false),
                    CompetitionType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Programming"),
                    DifficultyLevel = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "Medium"),
                    ParticipantsPerClan = table.Column<int>(type: "integer", nullable: false, defaultValue: 3),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ScheduledStartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompetitionStartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompetitionEndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ChallengerReady = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    OpponentReady = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    OpponentResponse = table.Column<string>(type: "text", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: false),
                    WinnerClanStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ChallengerTotalScore = table.Column<int>(type: "integer", nullable: true),
                    OpponentTotalScore = table.Column<int>(type: "integer", nullable: true),
                    ShowScoresToOpponent = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    AllowWithdrawal = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    QuestionIds = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClanVsClansCompetitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitions_Clans_ChallengerClanId",
                        column: x => x.ChallengerClanId,
                        principalTable: "Clans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitions_Clans_OpponentClanId",
                        column: x => x.OpponentClanId,
                        principalTable: "Clans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitions_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClanVsClansCompetitionParticipants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompetitionId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ClanId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    SelectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Score = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CorrectAnswers = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    WrongAnswers = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    UnansweredQuestions = table.Column<int>(type: "integer", nullable: false),
                    TimeTakenSeconds = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    AnswerSubmissions = table.Column<string>(type: "text", nullable: true),
                    ClanVsClansCompetitionId = table.Column<int>(type: "integer", nullable: true),
                    ClanVsClansCompetitionId1 = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClanVsClansCompetitionParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitionParticipants_ClanVsClansCompetitions_~",
                        column: x => x.ClanVsClansCompetitionId,
                        principalTable: "ClanVsClansCompetitions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitionParticipants_ClanVsClansCompetitions~1",
                        column: x => x.ClanVsClansCompetitionId1,
                        principalTable: "ClanVsClansCompetitions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitionParticipants_ClanVsClansCompetitions~2",
                        column: x => x.CompetitionId,
                        principalTable: "ClanVsClansCompetitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitionParticipants_Clans_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitionParticipants_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClanVsClansCompetitionQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompetitionId = table.Column<int>(type: "integer", nullable: false),
                    QuestionText = table.Column<string>(type: "text", nullable: false),
                    Topic = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DifficultyLevel = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    CompetitionType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    OptionA = table.Column<string>(type: "text", nullable: false),
                    OptionB = table.Column<string>(type: "text", nullable: false),
                    OptionC = table.Column<string>(type: "text", nullable: false),
                    OptionD = table.Column<string>(type: "text", nullable: false),
                    CorrectAnswer = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                    Explanation = table.Column<string>(type: "text", nullable: true),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    QuestionOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClanVsClansCompetitionQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitionQuestions_ClanVsClansCompetitions_Com~",
                        column: x => x.CompetitionId,
                        principalTable: "ClanVsClansCompetitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClanVsClansCompetitionScores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CompetitionId = table.Column<int>(type: "integer", nullable: false),
                    ParticipantId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ClanId = table.Column<int>(type: "integer", nullable: false),
                    IndividualScore = table.Column<int>(type: "integer", nullable: false),
                    PointsPerCorrectAnswer = table.Column<int>(type: "integer", nullable: false),
                    NegativePointsPerWrongAnswer = table.Column<int>(type: "integer", nullable: false),
                    ClanContributionToTotal = table.Column<int>(type: "integer", nullable: false),
                    ScoredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClanVsClansCompetitionScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitionScores_ClanVsClansCompetitionParticip~",
                        column: x => x.ParticipantId,
                        principalTable: "ClanVsClansCompetitionParticipants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitionScores_ClanVsClansCompetitions_Compet~",
                        column: x => x.CompetitionId,
                        principalTable: "ClanVsClansCompetitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitionScores_Clans_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClanVsClansCompetitionScores_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitionParticipants_ClanId",
                table: "ClanVsClansCompetitionParticipants",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitionParticipants_ClanVsClansCompetitionId",
                table: "ClanVsClansCompetitionParticipants",
                column: "ClanVsClansCompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitionParticipants_ClanVsClansCompetitionId1",
                table: "ClanVsClansCompetitionParticipants",
                column: "ClanVsClansCompetitionId1");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitionParticipants_CompetitionId",
                table: "ClanVsClansCompetitionParticipants",
                column: "CompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitionParticipants_CompetitionId_UserId",
                table: "ClanVsClansCompetitionParticipants",
                columns: new[] { "CompetitionId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitionParticipants_UserId",
                table: "ClanVsClansCompetitionParticipants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitionQuestions_CompetitionId",
                table: "ClanVsClansCompetitionQuestions",
                column: "CompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitions_ChallengerClanId",
                table: "ClanVsClansCompetitions",
                column: "ChallengerClanId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitions_CreatedAt",
                table: "ClanVsClansCompetitions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitions_CreatedByUserId",
                table: "ClanVsClansCompetitions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitions_OpponentClanId",
                table: "ClanVsClansCompetitions",
                column: "OpponentClanId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitions_Status",
                table: "ClanVsClansCompetitions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitionScores_ClanId",
                table: "ClanVsClansCompetitionScores",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitionScores_CompetitionId",
                table: "ClanVsClansCompetitionScores",
                column: "CompetitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitionScores_ParticipantId",
                table: "ClanVsClansCompetitionScores",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanVsClansCompetitionScores_UserId",
                table: "ClanVsClansCompetitionScores",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClanVsClansCompetitionQuestions");

            migrationBuilder.DropTable(
                name: "ClanVsClansCompetitionScores");

            migrationBuilder.DropTable(
                name: "ClanVsClansCompetitionParticipants");

            migrationBuilder.DropTable(
                name: "ClanVsClansCompetitions");

            migrationBuilder.DropColumn(
                name: "CoverImageUrl",
                table: "Users");
        }
    }
}
