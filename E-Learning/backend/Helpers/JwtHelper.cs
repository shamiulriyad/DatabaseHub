using backend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Helpers
{
    public interface IJwtHelper
    {
        string GenerateToken(User user);
        int? ValidateToken(string token);
    }

    public class JwtHelper : IJwtHelper
    {
        private readonly IConfiguration _configuration;

        public JwtHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"] ?? "default-secret-key");
            
            var claims = new List<Claim>
            {
                new Claim("userId", user.Id.ToString()),
                new Claim("email", user.Email),
                new Claim("username", user.Username),
                new Claim(ClaimTypes.Name, user.Username)
            };

            // Add roles based on dynamic role system
            if (user.IsStudent)
                claims.Add(new Claim(ClaimTypes.Role, "Student"));
            // Only add Teacher role if approved (not pending approval)
            if (user.IsTeacher && !user.TeacherPendingApproval)
                claims.Add(new Claim(ClaimTypes.Role, "Teacher"));
            if (user.IsAdmin)
                claims.Add(new Claim(ClaimTypes.Role, "Admin"));
            if (user.IsCompetitor)
                claims.Add(new Claim(ClaimTypes.Role, "Competitor"));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public int? ValidateToken(string token)
        {
            if (string.IsNullOrEmpty(token))
                return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"] ?? "default-secret-key");

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var userId = int.Parse(jwtToken.Claims.First(x => x.Type == "userId").Value);

                return userId;
            }
            catch
            {
                return null;
            }
        }
    }
}