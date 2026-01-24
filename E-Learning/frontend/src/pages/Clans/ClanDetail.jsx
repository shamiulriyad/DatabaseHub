import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ClanAnnouncements from './ClanAnnouncements';
import ClanCommunity from './ClanCommunity';

import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Badge,
  Stack,
  HStack,
  VStack,
  Skeleton,
  SkeletonText,
  Icon,
  useColorModeValue,
  Avatar,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Switch,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import {
  FaUsers,
  FaTrophy,
  FaStar,
  FaShieldAlt,
  FaCrown,
  FaUserPlus,
  FaSignOutAlt,
  FaCog,
  FaChartLine,
  FaCalendar,
  FaMedal,
} from 'react-icons/fa';

const fetchClanDetails = async (clanId) => {
  const { data } = await api.get(`/clans/${clanId}`);
  return data?.clan;
};

const fetchClanMembers = async (clanId) => {
  const { data } = await api.get(`/clans/${clanId}/members`);
  return data?.members || [];
};

const fetchClanStats = async (clanId) => {
  const { data } = await api.get(`/clans/${clanId}/stats`);
  return data?.stats;
};

const fetchClanCompetitions = async (clanId) => {
  const { data } = await api.get(`/clans/${clanId}/competitions`);
  return data?.competitions || [];
};

const fetchPendingJoinRequests = async (clanId) => {
  const { data } = await api.get(`/clans/${clanId}/join-requests/pending`);
  return data?.requests || [];
};

const StatCard = ({ icon, label, value, color }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={cardBg} borderColor={border} borderWidth="1px">
      <CardBody>
        <HStack spacing={4}>
          <Box
            p={3}
            borderRadius="lg"
            bg={`${color}.100`}
            color={`${color}.600`}
          >
            <Icon as={icon} boxSize={6} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" color="gray.600">
              {label}
            </Text>
            <Heading size="md">{value}</Heading>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

const MemberCard = ({ member }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  const roleColor = {
    Leader: 'yellow',
    CoLeader: 'orange',
    Elder: 'purple',
    Member: 'gray',
  };

  return (
    <Card 
      bg={cardBg} 
      borderColor={border} 
      borderWidth="1px" 
      size="sm"
      cursor="pointer"
      onClick={() => navigate(`/profile/${member.userId}`)}
      _hover={{ bg: hoverBg, transform: 'translateY(-2px)', shadow: 'md' }}
      transition="all 0.2s"
    >
      <CardBody>
        <HStack spacing={3}>
          <Avatar
            name={member.userName}
            src={member.profileImageUrl}
            size="md"
          />
          <VStack align="start" spacing={0} flex={1}>
            <HStack>
              <Text fontWeight="bold" fontSize="sm">
                {member.userName}
              </Text>
              {member.role === 'Leader' && (
                <Icon as={FaCrown} color="yellow.500" boxSize={3} />
              )}
            </HStack>
            <Badge colorScheme={roleColor[member.role]} fontSize="xs">
              {member.role}
            </Badge>
            <HStack spacing={3} fontSize="xs" color="gray.600" mt={1}>
              <HStack spacing={1}>
                <Icon as={FaTrophy} boxSize={3} />
                <Text>{member.contributionPoints} pts</Text>
              </HStack>
              <Text>•</Text>
              <Text>{member.totalPosts} posts</Text>
            </HStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

const CompetitionCard = ({ competition }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');

  const statusColor = {
    Upcoming: 'blue',
    Ongoing: 'green',
    Completed: 'gray',
    Cancelled: 'red',
  };

  return (
    <Card bg={cardBg} borderColor={border} borderWidth="1px">
      <CardBody>
        <Stack spacing={3}>
          <HStack justify="space-between">
            <Heading size="sm" noOfLines={1}>
              {competition.title}
            </Heading>
            <Badge colorScheme={statusColor[competition.status]}>
              {competition.status}
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.600" noOfLines={2}>
            {competition.description}
          </Text>
          <Divider />
          <HStack justify="space-between" fontSize="xs" color="gray.600">
            <HStack spacing={1}>
              <Icon as={FaCalendar} />
              <Text>
                {new Date(competition.startDate).toLocaleDateString()}
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FaUsers} />
              <Text>{competition.participantCount} participants</Text>
            </HStack>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
};

const ClanDetail = () => {
  const { clanId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('white', 'gray.700');
  const memberCardBg = useColorModeValue('gray.50', 'gray.700');
  const topMembersHoverBg = useColorModeValue('gray.50', 'gray.600');
  const [joinStatus, setJoinStatus] = React.useState('idle');
  const [userRole, setUserRole] = React.useState(null); // 'Leader', 'CoLeader', 'Elder', 'Member'
  const { isOpen: isPrivacyOpen, onOpen: openPrivacy, onClose: closePrivacy } = useDisclosure();
  const [privacyIsPublic, setPrivacyIsPublic] = React.useState(true);
  const [privacyRequireApproval, setPrivacyRequireApproval] = React.useState(false);
  const [privacyJoinCriteria, setPrivacyJoinCriteria] = React.useState('');

  const { data: clan, isLoading: clanLoading } = useQuery({
    queryKey: ['clan', clanId],
    queryFn: () => fetchClanDetails(clanId),
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['clanMembers', clanId],
    queryFn: () => fetchClanMembers(clanId),
    enabled: !!clanId,
  });

  const { data: stats } = useQuery({
    queryKey: ['clanStats', clanId],
    queryFn: () => fetchClanStats(clanId),
    enabled: !!clanId,
  });

  const { data: competitions, isLoading: competitionsLoading } = useQuery({
    queryKey: ['clanCompetitions', clanId],
    queryFn: () => fetchClanCompetitions(clanId),
    enabled: !!clanId,
  });

  // Determine user's role in clan
  React.useEffect(() => {
    if (clan?.isMember && members && user) {
      const userMember = members.find(m => m.userId === user.id);
      if (userMember) {
        setUserRole(userMember.role);
        setJoinStatus('member');
      }
    } else if (clan?.hasPendingJoinRequest) {
      setJoinStatus('pending');
    } else {
      setJoinStatus('idle');
      setUserRole(null);
    }
  }, [clan, members, user]);

  const invalidateClanData = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['clan', clanId] });
    queryClient.invalidateQueries({ queryKey: ['clanMembers', clanId] });
    queryClient.invalidateQueries({ queryKey: ['clanStats', clanId] });
    queryClient.invalidateQueries({ queryKey: ['clanCompetitions', clanId] });
    queryClient.invalidateQueries({ queryKey: ['clanPendingJoinRequests', clanId] });
  }, [clanId, queryClient]);

  const joinMutation = useMutation({
    mutationFn: () => api.post(`/clans/${clanId}/join`),
    onSuccess: ({ data }) => {
      const status = data?.membership?.status;
      if (status === 'Pending') {
        setJoinStatus('pending');
        toast({
          title: 'Join request sent',
          description: 'Waiting for clan leader approval',
          status: 'info',
          duration: 4000,
        });
      } else {
        setJoinStatus('member');
        toast({
          title: 'Joined clan',
          status: 'success',
          duration: 3000,
        });
      }
      invalidateClanData();
    },
    onError: (error) => {
      toast({
        title: 'Failed to join clan',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 4000,
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => api.post(`/clans/${clanId}/leave`),
    onSuccess: () => {
      setJoinStatus('idle');
      toast({
        title: 'Left clan',
        status: 'success',
        duration: 3000,
      });
      invalidateClanData();
    },
    onError: (error) => {
      toast({
        title: 'Failed to leave clan',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 4000,
      });
    },
  });

  // Derived states
  const isMember = joinStatus === 'member';
  const isLeader = userRole === 'Leader';
  const isLeaderOrCoLeader = userRole === 'Leader' || userRole === 'CoLeader';
  const hasLeadership = ['Leader', 'CoLeader', 'Elder'].includes(userRole);
  const atCapacity = clan && clan.memberCount >= clan.maxMembers;
  const needsApproval = clan && (!clan.isPublic || clan.requireApproval);
  const joinButtonLabel =
    joinStatus === 'pending'
      ? 'Join Request Pending'
      : needsApproval
      ? 'Request to Join'
      : 'Join Clan';

  const {
    data: pendingRequests = [],
    isLoading: pendingRequestsLoading,
  } = useQuery({
    queryKey: ['clanPendingJoinRequests', clanId],
    queryFn: () => fetchPendingJoinRequests(clanId),
    enabled: !!clanId && isLeaderOrCoLeader,
  });

  const decideJoinRequestMutation = useMutation({
    mutationFn: ({ requestId, action }) =>
      api.post(`/clans/${clanId}/join-requests/${requestId}/decision`, { action }),
    onSuccess: (_, variables) => {
      invalidateClanData();
      toast({
        title: variables.action === 'approve' ? 'Request approved' : 'Request rejected',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to process request',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 4000,
      });
    },
  });

  const handleJoinRequestDecision = (requestId, action) => {
    decideJoinRequestMutation.mutate({ requestId, action });
  };

  const privacyMutation = useMutation({
    mutationFn: (payload) => api.put(`/clans/${clanId}`, payload),
    onSuccess: () => {
      invalidateClanData();
      toast({ title: 'Privacy settings updated', status: 'success', duration: 3000 });
      closePrivacy();
    },
    onError: (error) => {
      toast({ title: 'Failed to update privacy settings', description: error.response?.data?.message || 'Something went wrong', status: 'error', duration: 4000 });
    },
  });

  const handleSavePrivacy = () => {
    const payload = {
      isPublic: privacyIsPublic,
      requireApproval: privacyRequireApproval,
      joinCriteria: privacyJoinCriteria,
    };
    privacyMutation.mutate(payload);
  };

  if (clanLoading) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Container maxW="7xl" py={10}>
          <Skeleton height="300px" mb={8} borderRadius="lg" />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardBody>
                  <SkeletonText noOfLines={3} />
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    );
  }

  if (!clan) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Container maxW="7xl" py={20}>
          <VStack spacing={4}>
            <Icon as={FaShieldAlt} boxSize={20} color="gray.400" />
            <Heading size="lg" color="gray.600">
              Clan not found
            </Heading>
            <Button colorScheme="purple" onClick={() => navigate('/clans')}>
              Browse Clans
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Banner Section */}
      <Box
        position="relative"
        h={{ base: '200px', md: '300px' }}
        overflow="hidden"
      >
        {clan.bannerUrl ? (
          <Image
            src={clan.bannerUrl}
            alt={clan.name}
            objectFit="cover"
            w="100%"
            h="100%"
          />
        ) : (
          <Box
            w="100%"
            h="100%"
            bgGradient="linear(135deg, purple.400, blue.500)"
          />
        )}
        {/* Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-b, transparent, blackAlpha.700)"
        />
      </Box>

      <Container maxW="7xl" position="relative" mt={-20}>
        {/* Clan Header Card */}
        <Card
          bg={cardBg}
          shadow="xl"
          mb={8}
        >
          <CardBody>
            <Grid
              templateColumns={{ base: '1fr', md: 'auto 1fr auto' }}
              gap={6}
              alignItems="center"
            >
              <GridItem>
                {clan.logoUrl ? (
                          <Image
                            src={clan.logoUrl}
                            alt={clan.name}
                            boxSize={{ base: '80px', md: '120px' }}
                            borderRadius="lg"
                            border="4px solid"
                            borderColor={borderColor}
                            shadow="lg"
                          />
                        ) : (
                          <Box
                            boxSize={{ base: '80px', md: '120px' }}
                            borderRadius="lg"
                            bgGradient="linear(to-r, purple.500, blue.500)"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            border="4px solid"
                            borderColor={borderColor}
                            shadow="lg"
                          >
                            <Icon as={FaShieldAlt} boxSize={10} color="white" />
                          </Box>
                        )}
              </GridItem>

              <GridItem>
                <VStack align="start" spacing={2}>
                  <HStack spacing={3} flexWrap="wrap">
                    <Heading size="xl">{clan.name}</Heading>
                    <Badge colorScheme="purple" fontSize="md" px={3}>
                      [{clan.tag}]
                    </Badge>
                    {!clan.isPublic && (
                      <Icon as={FaCrown} color="yellow.500" boxSize={5} />
                    )}
                  </HStack>
                  {clan.motto && (
                    <Text fontSize="lg" fontStyle="italic" color="gray.600">
                      "{clan.motto}"
                    </Text>
                  )}
                  <Text color="gray.600">{clan.description}</Text>
                  <HStack spacing={4} flexWrap="wrap">
                    <Badge colorScheme="blue">{clan.clanType}</Badge>
                    <Badge colorScheme={clan.isPublic ? 'green' : 'orange'}>
                      {clan.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    {clan.requireApproval && (
                      <Badge colorScheme="orange">Requires Approval</Badge>
                    )}
                    {clan.universityName && (
                      <Badge variant="outline">{clan.universityName}</Badge>
                    )}
                  </HStack>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack spacing={3} w="full">
                  {isMember ? (
                    <>
                      {isLeaderOrCoLeader && (
                        <Button
                          colorScheme="purple"
                          leftIcon={<FaCog />}
                          w="full"
                          onClick={() => navigate(`/clans/${clanId}/members`)}
                        >
                          Manage
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        colorScheme="red"
                        leftIcon={<FaSignOutAlt />}
                        w="full"
                        size="sm"
                        onClick={() => leaveMutation.mutate()}
                        isLoading={leaveMutation.isLoading}
                      >
                        Leave
                      </Button>
                    </>
                  ) : (
                    <Button
                      colorScheme="purple"
                      leftIcon={<FaUserPlus />}
                      w="full"
                      onClick={() => joinMutation.mutate()}
                      isLoading={joinMutation.isLoading}
                      isDisabled={joinStatus === 'pending' || atCapacity}
                    >
                      {atCapacity ? 'Clan is Full' : joinButtonLabel}
                    </Button>
                  )}
                </VStack>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 2, md: 4, lg: 5 }} spacing={4} mb={8}>
          <StatCard
            icon={FaUsers}
            label="Members"
            value={clan.memberCount}
            color="purple"
          />
          <StatCard
            icon={FaTrophy}
            label="Total Points"
            value={clan.totalPoints}
            color="yellow"
          />
          <StatCard
            icon={FaMedal}
            label="Rank"
            value={`#${clan.rank}`}
            color="blue"
          />
          <StatCard
            icon={FaChartLine}
            label="Competitions"
            value={clan.totalCompetitions}
            color="green"
          />
          <StatCard
            icon={FaStar}
            label="Wins"
            value={clan.competitionWins}
            color="orange"
          />
        </SimpleGrid>

        {/* Tabs Section */}
        <Tabs colorScheme="purple">
          <TabList>
            <Tab>Overview</Tab>
            {isMember && <Tab>📢 Announcements</Tab>}
            {isMember && <Tab>💬 Community</Tab>}
            <Tab>Members ({members?.length || 0})</Tab>
            <Tab>Competitions ({competitions?.length || 0})</Tab>
            <Tab>Statistics</Tab>
            {hasLeadership && <Tab icon={<FaCog />}>Management</Tab>}
            {isLeader && <Tab icon={<FaCog />}>Settings</Tab>}
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
                <GridItem>
                  <Card
                    bg={cardBg}
                    mb={6}
                  >
                    <CardBody>
                      <Heading size="md" mb={4}>
                        About
                      </Heading>
                      <Stack spacing={3}>
                        <Text>{clan.description}</Text>
                        {clan.joinCriteria && (
                          <>
                            <Divider />
                            <Box>
                              <Text fontWeight="bold" mb={2}>
                                Join Criteria:
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {clan.joinCriteria}
                              </Text>
                            </Box>
                          </>
                        )}
                      </Stack>
                    </CardBody>
                  </Card>

                  <Heading size="md" mb={4}>
                    Recent Competitions
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {competitionsLoading ? (
                      [...Array(2)].map((_, i) => (
                        <Card key={i}>
                          <CardBody>
                            <SkeletonText noOfLines={4} />
                          </CardBody>
                        </Card>
                      ))
                    ) : competitions && competitions.length > 0 ? (
                      competitions.slice(0, 4).map((comp) => (
                        <CompetitionCard key={comp.id} competition={comp} />
                      ))
                    ) : (
                      <Text color="gray.500" gridColumn="1/-1">
                        No competitions yet
                      </Text>
                    )}
                  </SimpleGrid>
                </GridItem>

                <GridItem>
                  <Card bg={cardBg} mb={6}>
                    <CardBody>
                      <Heading size="sm" mb={4}>
                        Top Members
                      </Heading>
                      <Stack spacing={3}>
                        {stats?.topMembers
                          ?.slice(0, 5)
                          .map((member, index) => (
                            <HStack 
                              key={member.userId} 
                              spacing={3}
                              cursor="pointer"
                              p={2}
                              borderRadius="md"
                              _hover={{ bg: topMembersHoverBg }}
                              onClick={() => navigate(`/profile/${member.userId}`)}
                              transition="all 0.2s"
                            >
                              <Badge colorScheme="purple">{index + 1}</Badge>
                              <Avatar
                                size="sm"
                                name={member.userName}
                                src={member.profileImage}
                              />
                              <VStack align="start" spacing={0} flex={1}>
                                <Text fontSize="sm" fontWeight="bold">
                                  {member.userName}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {member.contributionPoints} points
                                </Text>
                              </VStack>
                            </HStack>
                          ))}
                      </Stack>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardBody>
                      <Heading size="sm" mb={4}>
                        Clan Info
                      </Heading>
                      <Stack spacing={3} fontSize="sm">
                        <HStack justify="space-between">
                          <Text color="gray.600">Leader:</Text>
                          <Text fontWeight="bold">{clan.leaderName}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.600">Created:</Text>
                          <Text>
                            {new Date(clan.createdAt).toLocaleDateString()}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.600">Max Members:</Text>
                          <Text>{clan.maxMembers}</Text>
                        </HStack>
                        {clan.requireApproval && (
                          <Badge colorScheme="orange">
                            Requires Approval
                          </Badge>
                        )}
                      </Stack>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </TabPanel>

            {/* Announcements Tab - Members Only */}
            {isMember && (
              <TabPanel>
                <ClanAnnouncements userRole={userRole} />
              </TabPanel>
            )}

            {/* Community Tab - Members Only */}
            {isMember && (
              <TabPanel>
                <ClanCommunity />
              </TabPanel>
            )}

            {/* Members Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {membersLoading ? (
                  [...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardBody>
                        <SkeletonText noOfLines={3} />
                      </CardBody>
                    </Card>
                  ))
                ) : members && members.length > 0 ? (
                  members.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))
                ) : (
                  <Text color="gray.500" gridColumn="1/-1">
                    No members yet
                  </Text>
                )}
              </SimpleGrid>
            </TabPanel>

            {/* Competitions Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {competitionsLoading ? (
                  [...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardBody>
                        <SkeletonText noOfLines={4} />
                      </CardBody>
                    </Card>
                  ))
                ) : competitions && competitions.length > 0 ? (
                  competitions.map((comp) => (
                    <CompetitionCard key={comp.id} competition={comp} />
                  ))
                ) : (
                  <Text color="gray.500" gridColumn="1/-1">
                    No competitions yet
                  </Text>
                )}
              </SimpleGrid>
            </TabPanel>

            {/* Statistics Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Performance
                    </Heading>
                    <Stack spacing={4}>
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm">Win Rate</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {stats?.winRate
                              ? `${(stats.winRate * 100).toFixed(1)}%`
                              : '0%'}
                          </Text>
                        </HStack>
                        <Progress
                          value={stats?.winRate ? stats.winRate * 100 : 0}
                          colorScheme="purple"
                          size="sm"
                          borderRadius="full"
                        />
                      </Box>
                      <Divider />
                      <SimpleGrid columns={2} spacing={4}>
                        <Stat size="sm">
                          <StatLabel>Weekly Points</StatLabel>
                          <StatNumber>{stats?.weeklyPoints || 0}</StatNumber>
                        </Stat>
                        <Stat size="sm">
                          <StatLabel>Monthly Points</StatLabel>
                          <StatNumber>{stats?.monthlyPoints || 0}</StatNumber>
                        </Stat>
                      </SimpleGrid>
                    </Stack>
                  </CardBody>
                </Card>

                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Member Roles
                    </Heading>
                    <Stack spacing={3}>
                      {stats?.memberRoleDistribution &&
                        Object.entries(stats.memberRoleDistribution).map(
                          ([role, count]) => (
                            <HStack key={role} justify="space-between">
                              <Text fontSize="sm">{role}</Text>
                              <Badge colorScheme="purple">{count}</Badge>
                            </HStack>
                          )
                        )}
                    </Stack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Management Tab (Leaders & CoLeaders) */}
            {hasLeadership && (
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {isLeaderOrCoLeader && (
                    <Card bg={cardBg}>
                      <CardBody>
                        <HStack justify="space-between" mb={4} align="center">
                          <Heading size="sm">Pending Join Requests</Heading>
                          <Badge colorScheme="yellow">
                            {pendingRequests?.length || 0}
                          </Badge>
                        </HStack>

                        {pendingRequestsLoading ? (
                          <Stack spacing={3}>
                            {[...Array(3)].map((_, i) => (
                              <Skeleton key={i} height="64px" borderRadius="md" />
                            ))}
                          </Stack>
                        ) : pendingRequests && pendingRequests.length > 0 ? (
                          <Stack spacing={3}>
                            {pendingRequests.map((req) => {
                              const isProcessing =
                                decideJoinRequestMutation.isLoading &&
                                decideJoinRequestMutation.variables?.requestId === req.id;

                              return (
                                <HStack
                                  key={req.id}
                                  align="flex-start"
                                  p={3}
                                  borderRadius="lg"
                                  bg={memberCardBg}
                                  spacing={3}
                                >
                                  <Avatar
                                    size="sm"
                                    name={req.userName}
                                    src={req.profileImageUrl}
                                    cursor="pointer"
                                    onClick={() => navigate(`/profile/${req.userId}`)}
                                  />
                                  <VStack align="start" spacing={1} flex={1}>
                                    <Text 
                                      fontSize="sm" 
                                      fontWeight="bold"
                                      cursor="pointer"
                                      _hover={{ color: 'purple.500' }}
                                      onClick={() => navigate(`/profile/${req.userId}`)}
                                    >
                                      {req.userName}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                      Requested {new Date(req.requestedAt).toLocaleString()}
                                    </Text>
                                    {req.message && (
                                      <Text fontSize="xs" color="gray.700" noOfLines={2}>
                                        "{req.message}"
                                      </Text>
                                    )}
                                  </VStack>
                                  <VStack spacing={2}>
                                    <Button
                                      size="xs"
                                      colorScheme="blue"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/profile/${req.userId}`);
                                      }}
                                    >
                                      View Profile
                                    </Button>
                                    <Button
                                      size="xs"
                                      colorScheme="green"
                                      isLoading={isProcessing && decideJoinRequestMutation.variables?.action === 'approve'}
                                      onClick={() => handleJoinRequestDecision(req.id, 'approve')}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="xs"
                                      colorScheme="red"
                                      variant="outline"
                                      isLoading={isProcessing && decideJoinRequestMutation.variables?.action === 'reject'}
                                      onClick={() => handleJoinRequestDecision(req.id, 'reject')}
                                    >
                                      Reject
                                    </Button>
                                  </VStack>
                                </HStack>
                              );
                            })}
                          </Stack>
                        ) : (
                          <Text color="gray.500">No pending requests</Text>
                        )}
                      </CardBody>
                    </Card>
                  )}

                  {/* Member Management */}
                  <Card bg={cardBg}>
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="sm">Member Management</Heading>
                        <Icon as={FaUsers} color="purple.500" />
                      </HStack>
                      <Stack spacing={3}>
                        {members
                          ?.filter((m) => m.role !== 'Leader')
                          .slice(0, 5)
                          .map((member) => (
                            <HStack
                              key={member.id}
                              p={3}
                              borderRadius="lg"
                              bg={memberCardBg}
                              justify="space-between"
                            >
                              <HStack spacing={2} flex={1}>
                                <Avatar
                                  size="sm"
                                  name={member.userName}
                                  src={member.profileImage}
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="bold">
                                    {member.userName}
                                  </Text>
                                  <Badge colorScheme="blue" fontSize="xs">
                                    {member.role}
                                  </Badge>
                                </VStack>
                              </HStack>
                              <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => alert('Remove feature coming soon')}
                              >
                                Remove
                              </Button>
                            </HStack>
                          ))}
                      </Stack>
                    </CardBody>
                  </Card>

                  {/* Recruitment */}
                  <Card bg={cardBg}>
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="sm">Recruitment</Heading>
                        <Icon as={FaUserPlus} color="green.500" />
                      </HStack>
                      <VStack spacing={4}>
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={2}>
                            Clan Capacity
                          </Text>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="xs">
                              {clan.memberCount}/{clan.maxMembers}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {Math.round(
                                (clan.memberCount / clan.maxMembers) * 100
                              )}
                              %
                            </Text>
                          </HStack>
                          <Progress
                            value={(clan.memberCount / clan.maxMembers) * 100}
                            colorScheme="green"
                            size="sm"
                            borderRadius="full"
                          />
                        </Box>
                        <Button
                          w="full"
                          colorScheme="green"
                          size="sm"
                          onClick={() =>
                            alert('Invite feature coming soon')
                          }
                        >
                          Invite Members
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Competition Control */}
                  <Card bg={cardBg}>
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="sm">Competition Control</Heading>
                        <Icon as={FaTrophy} color="orange.500" />
                      </HStack>
                      <VStack spacing={3}>
                        <Text fontSize="sm" color="gray.600">
                          Manage clan competitions and teams
                        </Text>
                        <Button
                          w="full"
                          colorScheme="orange"
                          size="sm"
                          onClick={() =>
                            navigate(`/clans/${clanId}/competitions`)
                          }
                        >
                          Manage Competitions
                        </Button>
                        <Text fontSize="xs" color="gray.500">
                          Active: {competitions?.length || 0}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Quick Stats */}
                  <Card bg={cardBg}>
                    <CardBody>
                      <Heading size="sm" mb={4}>
                        Management Stats
                      </Heading>
                      <Stack spacing={3}>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Pending Requests</Text>
                          <Badge colorScheme="yellow">{pendingRequests?.length || 0}</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Pending Invites</Text>
                          <Badge colorScheme="blue">0</Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Leadership</Text>
                          <Badge colorScheme="purple">{userRole}</Badge>
                        </HStack>
                      </Stack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </TabPanel>
            )}

            {/* Settings Tab (Leader Only) */}
            {isLeader && (
              <TabPanel>
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack align="start" spacing={6}>
                      <Box w="full">
                        <Heading size="sm" mb={4}>
                          Clan Settings
                        </Heading>
                        <Stack spacing={3}>
                          <Button
                            w="full"
                            variant="outline"
                            colorScheme="purple"
                            onClick={() =>
                              navigate(`/clans/${clanId}/edit`)
                            }
                          >
                            Edit Clan Info
                          </Button>
                          <Button
                            w="full"
                            variant="outline"
                            colorScheme="blue"
                            onClick={() => {
                              setPrivacyIsPublic(Boolean(clan?.isPublic));
                              setPrivacyRequireApproval(Boolean(clan?.requireApproval));
                              setPrivacyJoinCriteria(clan?.joinCriteria || '');
                              openPrivacy();
                            }}
                          >
                            Privacy Settings
                          </Button>
                          <Button
                            w="full"
                            variant="outline"
                            colorScheme="orange"
                            onClick={() =>
                              alert('Role management coming soon')
                            }
                          >
                            Role Management
                          </Button>
                        </Stack>
                      </Box>
                      <Divider />
                      <Box w="full">
                        <Text fontSize="sm" fontWeight="bold" color="red.500" mb={3}>
                          Danger Zone
                        </Text>
                        <Button
                          w="full"
                          colorScheme="red"
                          variant="outline"
                          onClick={() =>
                            alert('Delete clan feature coming soon')
                          }
                        >
                          Delete Clan
                        </Button>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>

        <Modal isOpen={isPrivacyOpen} onClose={closePrivacy} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Privacy Settings</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel htmlFor="isPublic" mb="0">Public Clan</FormLabel>
                <Switch id="isPublic" isChecked={privacyIsPublic} onChange={(e) => setPrivacyIsPublic(e.target.checked)} />
              </FormControl>

              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel htmlFor="requireApproval" mb="0">Require Approval to Join</FormLabel>
                <Switch id="requireApproval" isChecked={privacyRequireApproval} onChange={(e) => setPrivacyRequireApproval(e.target.checked)} />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Join Criteria (optional)</FormLabel>
                <Input value={privacyJoinCriteria || ''} onChange={(e) => setPrivacyJoinCriteria(e.target.value)} placeholder="e.g. Min rank, points, etc." />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={closePrivacy}>Cancel</Button>
              <Button colorScheme="purple" onClick={handleSavePrivacy} isLoading={privacyMutation.isLoading}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </Container>
    </Box>
  );
};

export default ClanDetail;
