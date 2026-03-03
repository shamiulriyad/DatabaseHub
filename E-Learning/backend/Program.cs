using backend.Data;
using backend.Helpers;
using backend.Middleware;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "NextUniVerse API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Database Configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"] ?? "your-secret-key-minimum-32-characters-long-here");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("Content-Length", "X-JSON-Response");
    });
});

// Register Helpers
builder.Services.AddSingleton<IJwtHelper, JwtHelper>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUniversityService, UniversityService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<ILearningService, LearningService>();
builder.Services.AddScoped<ICommunityService, CommunityService>();
builder.Services.AddScoped<IClanService, ClanService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<ICompetitionService, CompetitionService>();
builder.Services.AddScoped<ICompetitionRegistrationService, CompetitionRegistrationService>();
builder.Services.AddScoped<IClanVsClansCompetitionService, ClanVsClansCompetitionService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IRankingService, RankingService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IClanCompetitionOrchestrationService, ClanCompetitionOrchestrationService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IDepartmentRequestService, DepartmentRequestService>();
builder.Services.AddScoped<IUniversityRequestService, UniversityRequestService>();
builder.Services.AddScoped<IClanCompetitionOrchestrationService, ClanCompetitionOrchestrationService>();
builder.Services.AddScoped<IClanCompetitionScoringService, ClanCompetitionScoringService>();
builder.Services.AddHostedService<CompetitionLifecycleScheduler>();


// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add SignalR for real-time updates
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS must be applied before authentication
app.UseCors("AllowReactApp");

// Custom Middleware
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<JwtMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
// Serve uploaded static files from wwwroot/uploads
app.UseStaticFiles();

app.MapControllers();

// Map SignalR hubs (match frontend which prefixes API routes with `/api`)
app.MapHub<backend.Hubs.CommunityHub>("/api/hubs/community");
// Course hub for live course/teacher updates
app.MapHub<backend.Hubs.CourseHub>("/api/hubs/courses");

// Apply any pending EF Core migrations on startup (creates missing tables)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<backend.Data.ApplicationDbContext>();
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        // If migration fails, rethrow so the host doesn't start silently in a bad state
        Console.WriteLine($"Database migration failed: {ex.Message}");
        throw;
    }
}

app.Run();