using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPostTypeSegregation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Posts",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "public_post");

            migrationBuilder.Sql(@"
                UPDATE ""Posts""
                SET ""Type"" = CASE
                    WHEN ""SectionType"" = 'AdminForum' OR ""PostType"" = 'admin_forum' THEN 'admin_forum'
                    ELSE 'public_post'
                END;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Posts");
        }
    }
}
