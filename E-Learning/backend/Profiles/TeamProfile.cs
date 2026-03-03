using AutoMapper;
using backend.DTOs;
using backend.Models;

namespace backend.Profiles
{
    public class TeamProfile : Profile
    {
        public TeamProfile()
        {
            CreateMap<Team, backend.DTOs.TeamInfoDTO>();
            CreateMap<TeamCreateDTO, Team>();
            CreateMap<TeamMember, TeamMemberDTO>()
                .ForMember(d => d.UserName, opt => opt.MapFrom(s => s.User != null ? (s.User.FirstName + " " + s.User.LastName) : null));
        }
    }
}
