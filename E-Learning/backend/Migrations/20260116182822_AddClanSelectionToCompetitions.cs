using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddClanSelectionToCompetitions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AllowedClanIds",
                table: "Competitions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PointRangeMax",
                table: "Competitions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PointRangeMin",
                table: "Competitions",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowedClanIds",
                table: "Competitions");

            migrationBuilder.DropColumn(
                name: "PointRangeMax",
                table: "Competitions");

            migrationBuilder.DropColumn(
                name: "PointRangeMin",
                table: "Competitions");
        }
    }
}
