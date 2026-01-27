Migration options for StudentLessonProgress schema

1) Recommended: use EF Core migrations (dotnet-ef)

From the `backend` folder run (PowerShell):

```powershell
dotnet tool install --global dotnet-ef  # if not installed
dotnet ef migrations add AddStudentLessonProgress
dotnet ef database update
```

This will generate a strongly-typed migration and apply it to your configured database.

2) Quick SQL apply (Postgres example)

If you prefer to apply schema changes manually or cannot run `dotnet ef`, use the provided SQL script:

```powershell
psql "<connection-string>" -f tools/create_student_lesson_progress.sql
```

Replace `<connection-string>` with your Postgres connection string or run the commands inside a DB client.

Notes:
- The project uses EF model classes `Lesson` and `StudentLessonProgress` and registers `StudentLessonProgresses` in `ApplicationDbContext`.
- If you generate an EF migration, ensure you review the generated code before applying.
