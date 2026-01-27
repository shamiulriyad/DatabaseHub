import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import TeacherApplicationModal from '../../components/TeacherApplicationModal';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Avatar,
  Card,
  CardBody,
  Grid,
  Badge,
  useColorModeValue,
  Icon,
  Spinner,
  useToast,
  
  
} from '@chakra-ui/react';
import {
  FaEdit,
  FaBook,
  FaTrophy,
  FaEnvelope,
  FaUser,
  FaCalendar,
  
  FaChartLine,
  FaUsers,
} from 'react-icons/fa';
import api from '../../services/api';

const UserProfile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myClans, setMyClans] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('linear(135deg, purple.600, blue.600)', 'linear(135deg, purple.700, blue.700)');
  const headerTextColor = useColorModeValue('gray.700', 'gray.200');

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfileData = async () => {
    try {
      // Load profile via api wrapper (adds token header)
      const response = await api.get('/auth/profile');
      if (response.data?.success) {
        setProfile(response.data.user);
      }

      // Fetch aggregated dashboard data for stats and clans if available
      try {
        const dashRes = await api.get('/auth/dashboard');
        if (dashRes.data?.success && dashRes.data.dashboard) {
          const d = dashRes.data.dashboard;
          // Dashboard may include stats with different casing/shapes (Stats, stats)
          const statsSrc = d.stats || d.Stats || {};

          const enrolledCourses = statsSrc.totalEnrollments ?? statsSrc.TotalEnrollments ?? statsSrc.enrolledCourses ?? statsSrc.EnrolledCourses ?? d.recentEnrollments?.length ?? 0;
          const completedCourses = statsSrc.completedCourses ?? statsSrc.CompletedCourses ?? d.completedCourses ?? d.CompletedCourses ?? 0;
          
          setStats({
            enrolledCourses,
            completedCourses,
            
          });
          setMyClans(d.myClans || d.MyClans || []);
        } else {
          // Fallback: try clans endpoint directly
          const clansResp = await api.get('/clans/my-clans');
          if (clansResp.data?.success) setMyClans(clansResp.data.clans || []);
        }
      } catch (e) {
        console.warn('Failed to fetch dashboard/clans:', e.response?.data || e.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.error('Error response:', error.response?.data);
      
      // Don't show error toast, just use localStorage data as fallback
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (localUser && localUser.email) {
        setProfile(localUser);
        setStats({
          enrolledCourses: 0,
          completedCourses: 0,
          totalPoints: localUser.totalPoints || 0,
          currentRank: localUser.currentRank || 'Unranked',
          completionRate: 0,
        });
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load profile data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Box>
    );
  }

  const normalizeProfile = (p) => {
    if (!p) return {};
    const currentClan = p.currentClan || p.CurrentClan || null;
    return {
      id: p.id ?? p.Id,
      username: p.username ?? p.Username,
      email: p.email ?? p.Email,
      firstName: p.firstName ?? p.FirstName,
      lastName: p.lastName ?? p.LastName,
      profileImageUrl: p.profileImageUrl ?? p.ProfileImageUrl ?? p.profileImage ?? p.ProfileImage,
      coverImageUrl: p.coverImageUrl ?? p.CoverImageUrl ?? p.coverImage ?? p.CoverImage,
      bio: p.bio ?? p.Bio,
      phoneNumber: p.phoneNumber ?? p.PhoneNumber,
      createdAt: p.createdAt ?? p.CreatedAt,
      totalPoints: p.totalPoints ?? p.TotalPoints,
      currentRank: p.currentRank ?? p.CurrentRank,
      isStudent: p.isStudent ?? p.IsStudent,
      isTeacher: p.isTeacher ?? p.IsTeacher,
      isAdmin: p.isAdmin ?? p.IsAdmin,
      isCompetitor: p.isCompetitor ?? p.IsCompetitor,
      usernameDisplay: p.username ?? p.Username ?? p.userName,
      avatar: p.avatar ?? p.Avatar,
      currentClan: currentClan
        ? {
            clanId: currentClan.clanId ?? currentClan.ClanId ?? currentClan.ClanId,
            clanName: currentClan.clanName ?? currentClan.ClanName ?? currentClan.ClanName,
            clanTag: currentClan.clanTag ?? currentClan.ClanTag ?? currentClan.ClanTag,
            clanLogoUrl: currentClan.clanLogoUrl ?? currentClan.ClanLogoUrl ?? currentClan.clanLogoUrl,
            role: currentClan.role ?? currentClan.Role,
            contributionPoints: currentClan.contributionPoints ?? currentClan.ContributionPoints,
            joinedAt: currentClan.joinedAt ?? currentClan.JoinedAt,
          }
        : null,
      // keep original object as fallback for any other fields
      _raw: p,
    };
  };

  const displayProfile = normalizeProfile(profile || authUser || JSON.parse(localStorage.getItem('user') || '{}'));

  const determineRole = (clan) => {
    if (!clan) return null;
    const userId = authUser?.id ?? authUser?.userId ?? displayProfile.id ?? null;
    const memberRole = clan.memberRole ?? clan.role ?? clan.userRole ?? null;
    if (memberRole) return memberRole;
    const leaderId = clan.leaderId ?? clan.leader?.id ?? clan.LeaderId ?? clan.Leader?.Id ?? clan.leaderUserId;
    if (leaderId && userId && String(leaderId) === String(userId)) return 'Leader';
    const coLeaderIds = clan.coLeaderIds ?? clan.coLeaders ?? clan.coLeaderIdsList ?? clan.coLeaderUserIds;
    if (Array.isArray(coLeaderIds) && userId && coLeaderIds.some((id) => String(id) === String(userId))) return 'CoLeader';
    return null;
  };

  return (
    <Box minH="100vh" bg={bgColor} py={12}>
      <Container maxW="6xl">
        {/* Hero Header with Profile */}
        <Box
          borderRadius="2xl"
          p={{ base: 0, md: 0 }}
          mb={8}
          color="white"
          shadow="2xl"
          overflow="hidden"
          bgGradient={!displayProfile.coverImageUrl ? headerBg : undefined}
        >
          {displayProfile.coverImageUrl ? (
            <Box position="relative" h={{ base: '180px', md: '220px' }} w="100%" bg="gray.100" overflow="hidden">
              <img src={displayProfile.coverImageUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Box position="absolute" top={0} left={0} w="100%" h="100%" bg="rgba(0,0,0,0.6)" />
            </Box>
          ) : (
            <Box h={{ base: '120px', md: '160px' }} />
          )}
          <Grid templateColumns={{ base: '1fr', md: 'auto 1fr' }} gap={{ base: 6, md: 8 }} alignItems="center" p={{ base: 6, md: 8 }}>
            {/* Avatar */}
            <Box display="flex" justifyContent={{ base: 'center', md: 'flex-start' }}>
              <Avatar
                size="2xl"
                name={`${displayProfile.firstName || ''} ${displayProfile.lastName || ''}`}
                src={displayProfile.profileImageUrl || displayProfile.avatar}
                bg="whiteAlpha.200"
                color="white"
                borderWidth={4}
                borderColor="whiteAlpha.900"
              />
            </Box>

            {/* Profile Info */}
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={3} w="full">
              <VStack align={{ base: 'center', md: 'flex-start' }} spacing={1} w="full" color="black">
                <Heading as="h1" size="2xl" fontWeight="black" textShadow="0 1px 4px rgba(0,0,0,0.6)">
                  {displayProfile.firstName} {displayProfile.lastName}
                </Heading>
                <HStack spacing={2} fontSize="sm" opacity={0.9}>
                  <Icon as={FaUser} />
                  <Text>@{displayProfile.username}</Text>
                </HStack>
              </VStack>

              <HStack spacing={3} wrap="wrap">
                {displayProfile.isStudent && (
                  <Badge colorScheme="cyan" px={3} py={1} borderRadius="full">Student</Badge>
                )}
                {displayProfile.isTeacher && (
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">Teacher</Badge>
                )}
                {displayProfile.isAdmin && (
                  <Badge colorScheme="red" px={3} py={1} borderRadius="full">Admin</Badge>
                )}
                {displayProfile.isCompetitor && (
                  <Badge colorScheme="orange" px={3} py={1} borderRadius="full">Competitor</Badge>
                )}
              </HStack>

              <HStack spacing={6} pt={2} color={headerTextColor}>
                <HStack spacing={2} fontSize="sm" opacity={0.9}>
                  <Icon as={FaEnvelope} />
                  <Text color={headerTextColor}>{displayProfile.email}</Text>
                </HStack>
                <HStack spacing={2} fontSize="sm" opacity={0.9}>
                  <Icon as={FaCalendar} />
                  <Text color={headerTextColor}>
                    Joined {new Date(displayProfile.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </HStack>
              </HStack>

              {/* Action Buttons */}
              <HStack spacing={3} pt={2}>
                <Button
                  size="sm"
                  bg="white"
                  color="purple.600"
                  leftIcon={<FaEdit />}
                  onClick={() => navigate('/profile/edit')}
                  _hover={{ bg: 'gray.100' }}
                  fontWeight="600"
                >
                  Edit Profile
                </Button>
                {!displayProfile.isTeacher && !displayProfile.isAdmin && (
                  <TeacherApplicationModal userId={displayProfile.id} />
                )}
              </HStack>
            </VStack>
          </Grid>
        </Box>

        {/* Statistics Grid (Certificates & Streak removed) */}
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6} mb={8}>
          {/* Enrolled Courses */}
          <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden" _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s">
            <Box bgGradient="linear(135deg, blue.400, blue.600)" h="3px" />
            <CardBody p={6}>
              <HStack justify="space-between" mb={3}>
                <Icon as={FaBook} fontSize="2xl" color="blue.500" />
                <Text fontSize="xs" color="gray.500" fontWeight="600">ENROLLED</Text>
              </HStack>
              <Heading size="lg" mb={1}>{stats?.enrolledCourses || 0}</Heading>
              <Text fontSize="sm" color="gray.600">Active courses</Text>
            </CardBody>
          </Card>

          {/* Completed Courses */}
          <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden" _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s">
            <Box bgGradient="linear(135deg, green.400, green.600)" h="3px" />
            <CardBody p={6}>
              <HStack justify="space-between" mb={3}>
                <Icon as={FaTrophy} fontSize="2xl" color="green.500" />
                <Text fontSize="xs" color="gray.500" fontWeight="600">COMPLETED</Text>
              </HStack>
              <Heading size="lg" mb={1}>{stats?.completedCourses || 0}</Heading>
              <Text fontSize="sm" color="gray.600">Finished courses</Text>
            </CardBody>
          </Card>

          {/* Points card removed */}
        </Grid>

        {/* My Clans: show all memberships if available, otherwise fallback to currentClan */}
        <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor} mb={8}>
          <CardBody p={6}>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">My Clans</Heading>
              <Icon as={FaUsers} color="purple.500" fontSize="xl" />
            </HStack>

            {myClans && myClans.length > 0 ? (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                {myClans.map((clan) => {
                  const id = clan.id ?? clan.clanId;
                  const banner = clan.bannerUrl ?? clan.coverUrl ?? clan.banner ?? clan.coverImageUrl ?? clan.bannerImage;
                  const logo = clan.clanLogoUrl ?? clan.logoUrl ?? clan.logo ?? clan.avatar;
                  const name = clan.clanName ?? clan.name;
                  const tag = clan.clanTag ?? clan.tag;
                  const role = determineRole(clan) ?? 'Member';
                  const members = clan.memberCount ?? clan.membersCount ?? clan.members ?? null;
                  const points = clan.contributionPoints ?? clan.points ?? clan.contribution;

                  return (
                    <Card
                      key={id}
                      borderWidth="1px"
                      borderColor={borderColor}
                      _hover={{ shadow: 'md', transform: 'translateY(-4px)' }}
                      cursor="pointer"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/clans/${id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/clans/${id}`); }}
                      overflow="hidden"
                    >
                      {banner ? (
                        <Box h="90px" w="100%" bg="gray.100" overflow="hidden">
                          <img src={banner} alt="clan banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                      ) : (
                        <Box h="24px" bg="gray.50" />
                      )}

                      <CardBody>
                        <HStack spacing={4} align="center">
                          {logo ? (
                            <Avatar size="lg" src={logo} name={name} />
                          ) : (
                            <Box w="56px" h="56px" bg="purple.100" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                              <Text fontWeight="black" fontSize="lg" color="purple.600">{(tag || (name || '').charAt(0))}</Text>
                            </Box>
                          )}

                          <VStack align="start" spacing={0}>
                            <Heading size="sm">{name}</Heading>
                            <HStack spacing={2}>
                              {role ? (
                                <Badge colorScheme={role === 'Leader' ? 'red' : role === 'CoLeader' ? 'orange' : 'green'}>
                                  {role}
                                </Badge>
                              ) : (
                                <Badge colorScheme="green">Member</Badge>
                              )}
                              {tag && <Badge>{tag}</Badge>}
                            </HStack>
                            <HStack spacing={3} pt={2}>
                              {typeof members === 'number' && (
                                <Text fontSize="xs" color="gray.600">Members: {members}</Text>
                              )}
                              {typeof points === 'number' && (
                                <Text fontSize="xs" color="gray.600">Points: {points}</Text>
                              )}
                            </HStack>
                          </VStack>

                          <Box ml="auto">
                            <Button size="sm" colorScheme="purple" onClick={(e) => { e.stopPropagation(); navigate(`/clans/${id}`); }}>
                              View Clan
                            </Button>
                          </Box>
                        </HStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </Grid>
            ) : displayProfile.currentClan ? (
              <HStack spacing={4} align="center">
                {displayProfile.currentClan.clanLogoUrl ? (
                  <Avatar size="lg" src={displayProfile.currentClan.clanLogoUrl} name={displayProfile.currentClan.clanName} />
                ) : (
                  <Box w="60px" h="60px" bg="purple.100" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                    <Text fontWeight="black" fontSize="2xl" color="purple.600">{displayProfile.currentClan.clanTag || (displayProfile.currentClan.clanName || '').charAt(0)}</Text>
                  </Box>
                )}
                <VStack align="start" spacing={0}>
                  <Heading size="md">{displayProfile.currentClan.clanName}</Heading>
                  <HStack spacing={2}>
                    {displayProfile.currentClan.clanTag && <Badge>{displayProfile.currentClan.clanTag}</Badge>}
                    {(() => {
                      const r = determineRole(displayProfile.currentClan) ?? displayProfile.currentClan.role ?? null;
                      return r ? (
                        <Badge colorScheme={r === 'Leader' ? 'red' : r === 'CoLeader' ? 'orange' : 'green'}>{r}</Badge>
                      ) : null;
                    })()}
                  </HStack>
                </VStack>
                <Box ml="auto">
                  <Button colorScheme="purple" onClick={() => navigate(`/clans/${displayProfile.currentClan.clanId}`)}>View Clan</Button>
                </Box>
              </HStack>
            ) : (
              <Text color="gray.600">You're not in a clan yet.</Text>
            )}
          </CardBody>
        </Card>

        
      </Container>
    </Box>
  );
};

export default UserProfile;
