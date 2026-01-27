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
  Flex,
  AvatarBadge,
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
  FaFire,
  FaBolt,
  FaAward,
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
  const cardBg = useColorModeValue('white', 'gray.800');
  const iconBg = useColorModeValue(`${color}.50`, `${color}.900`);
  const iconColor = useColorModeValue(`${color}.500`, `${color}.300`);
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Card 
      bg={cardBg} 
      shadow="sm" 
      borderWidth="1px" 
      borderColor={borderColor}
      _hover={{ 
        shadow: 'md', 
        borderColor: `${color}.300`,
        transform: 'translateY(-2px)'
      }}
      transition="all 0.2s ease"
    >
      <CardBody p={3}>
        <VStack spacing={2} align="center">
          <Box
            p={2}
            borderRadius="lg"
            bg={iconBg}
            color={iconColor}
          >
            <Icon as={icon} boxSize={4} />
          </Box>
          <VStack spacing={0} align="center">
            <Text 
              fontSize="xs" 
              color="gray.500" 
              fontWeight="600"
              textTransform="uppercase"
            >
              {label}
            </Text>
            <Heading 
              size="md" 
              fontWeight="800"
              color={`${color}.600`}
            >
              {value}
            </Heading>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const MemberCard = ({ member }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('purple.50', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  
  const roleColor = {
    Leader: 'yellow',
    CoLeader: 'orange',
    Elder: 'purple',
    Member: 'blue',
  };

  const roleIcon = {
    Leader: FaCrown,
    CoLeader: FaAward,
    Elder: FaStar,
    Member: null,
  };

  return (
    <Card 
      bg={cardBg} 
      shadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      cursor="pointer"
      onClick={() => navigate(`/profile/${member.userId}`)}
      _hover={{ 
        bg: hoverBg, 
        transform: 'translateY(-4px)', 
        shadow: 'xl',
        borderColor: `${roleColor[member.role]}.300`
      }}
      transition="all 0.3s ease"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        w="80px"
        h="80px"
        bgGradient={`linear(to-br, ${roleColor[member.role]}.100, transparent)`}
        opacity={0.3}
        borderRadius="0 0 0 100%"
      />
      <CardBody p={5} position="relative">
        <HStack spacing={4} align="start">
          <Box position="relative">
            <Avatar
              name={member.userName}
              src={member.profileImageUrl}
              size="lg"
              borderWidth="3px"
              borderColor={`${roleColor[member.role]}.400`}
              shadow="md"
            >
              {member.role === 'Leader' && (
                <AvatarBadge 
                  boxSize="1.25em" 
                  bg="yellow.400"
                  borderColor="white"
                  borderWidth="2px"
                >
                  <Icon as={FaCrown} boxSize={3} color="white" />
                </AvatarBadge>
              )}
            </Avatar>
          </Box>
          <VStack align="start" spacing={2} flex={1}>
            <HStack spacing={2} align="center">
              <Text fontWeight="700" fontSize="md" lineHeight="1">
                {member.userName}
              </Text>
              {roleIcon[member.role] && (
                <Icon 
                  as={roleIcon[member.role]} 
                  color={`${roleColor[member.role]}.500`} 
                  boxSize={3.5} 
                />
              )}
            </HStack>
            <Badge 
              colorScheme={roleColor[member.role]} 
              fontSize="xs"
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {member.role}
            </Badge>
            <HStack spacing={4} fontSize="xs" color="gray.500" mt={1} fontWeight="500">
              <HStack spacing={1.5}>
                <Icon as={FaTrophy} boxSize={3.5} color="yellow.500" />
                <Text fontWeight="600">{member.contributionPoints}</Text>
                <Text>pts</Text>
              </HStack>
              <Box w="1px" h="12px" bg="gray.300" />
              <HStack spacing={1.5}>
                <Icon as={FaFire} boxSize={3.5} color="orange.500" />
                <Text fontWeight="600">{member.totalPosts}</Text>
                <Text>posts</Text>
              </HStack>
            </HStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

const CompetitionCard = ({ competition }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  
  const statusColor = {
    Upcoming: 'blue',
    Ongoing: 'green',
    Completed: 'gray',
    Cancelled: 'red',
  };

  return (
    <Card 
      bg={cardBg} 
      shadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{ 
        shadow: 'xl', 
        borderColor: `${statusColor[competition.status]}.300`,
        transform: 'translateY(-4px)'
      }}
      transition="all 0.3s ease"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        w="100px"
        h="100px"
        bgGradient={`linear(to-br, ${statusColor[competition.status]}.100, transparent)`}
        opacity={0.4}
        borderRadius="0 0 0 100%"
      />
      <CardBody p={5} position="relative">
        <Stack spacing={4}>
          <HStack justify="space-between" align="start">
            <Heading size="sm" fontWeight="700" noOfLines={2} flex={1}>
              {competition.title}
            </Heading>
            <Badge 
              colorScheme={statusColor[competition.status]}
              fontSize="xs"
              px={3}
              py={1.5}
              borderRadius="full"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {competition.status}
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.600" noOfLines={3} lineHeight="1.6">
            {competition.description}
          </Text>
          <Divider />
          <HStack justify="space-between" fontSize="xs" color="gray.500" fontWeight="500">
            <HStack spacing={1.5}>
              <Icon as={FaCalendar} boxSize={3.5} />
              <Text>
                {new Date(competition.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </HStack>
            <HStack spacing={1.5}>
              <Icon as={FaUsers} boxSize={3.5} />
              <Text fontWeight="600">{competition.participantCount}</Text>
              <Text>participants</Text>
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
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tabBg = useColorModeValue('white', 'gray.800');
  
  const [joinStatus, setJoinStatus] = React.useState('idle');
  const [userRole, setUserRole] = React.useState(null);
  
  const { 
    isOpen: isPrivacyOpen, 
    onOpen: openPrivacy, 
    onClose: closePrivacy 
  } = useDisclosure();
  
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
          isClosable: true,
        });
      } else {
        setJoinStatus('member');
        toast({
          title: 'Joined clan',
          status: 'success',
          duration: 3000,
          isClosable: true,
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
        isClosable: true,
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
        isClosable: true,
      });
      invalidateClanData();
    },
    onError: (error) => {
      toast({
        title: 'Failed to leave clan',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 4000,
        isClosable: true,
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

  // Fix: Move useColorModeValue out of callback
  const pendingRequestBg = useColorModeValue('purple.50', 'gray.700');
  const topMemberHoverBg = useColorModeValue('purple.50', 'gray.700');
  const topMemberBg = useColorModeValue('yellow.50', 'yellow.900');
  const modalFormBg = useColorModeValue('gray.50', 'gray.700');
  const joinCriteriaBg = useColorModeValue('purple.50', 'gray.700');
  const clanInfoBg = useColorModeValue('gray.50', 'gray.700');
  const statWeeklyBg = useColorModeValue('purple.50', 'gray.700');
  const statMonthlyBg = useColorModeValue('blue.50', 'gray.700');

  const decideJoinRequestMutation = useMutation({
    mutationFn: ({ requestId, action }) =>
      api.post(`/clans/${clanId}/join-requests/${requestId}/decision`, { action }),
    onSuccess: (_, variables) => {
      invalidateClanData();
      toast({
        title: variables.action === 'approve' ? 'Request approved' : 'Request rejected',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to process request',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 4000,
        isClosable: true,
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
      toast({ 
        title: 'Privacy settings updated', 
        status: 'success', 
        duration: 3000,
        isClosable: true,
      });
      closePrivacy();
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update privacy settings', 
        description: error.response?.data?.message || 'Something went wrong', 
        status: 'error', 
        duration: 4000,
        isClosable: true,
      });
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
          <Skeleton height="350px" mb={8} borderRadius="xl" />
          <SimpleGrid columns={{ base: 2, md: 4, lg: 5 }} spacing={6} mb={8}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height="120px" borderRadius="xl" />
            ))}
          </SimpleGrid>
          <Skeleton height="500px" borderRadius="xl" />
        </Container>
      </Box>
    );
  }

  if (!clan) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Container maxW="7xl" py={20}>
          <VStack spacing={8}>
            <Box
              p={8}
              borderRadius="full"
              bgGradient="linear(to-br, purple.100, blue.100)"
            >
              <Icon as={FaShieldAlt} boxSize={24} color="purple.500" />
            </Box>
            <Heading size="xl" color="gray.600" fontWeight="800">
              Clan not found
            </Heading>
            <Text color="gray.500" fontSize="lg">
              The clan you're looking for doesn't exist or has been removed.
            </Text>
            <Button 
              colorScheme="purple" 
              onClick={() => navigate('/clans')}
              size="lg"
              px={8}
              borderRadius="full"
              shadow="lg"
              _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
              leftIcon={<FaShieldAlt />}
            >
              Browse Clans
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" pb={10}>
      {/* Compact Banner Section */}
      <Box
        position="relative"
        h={{ base: '150px', md: '200px' }}
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
            bgGradient="linear(135deg, purple.500 0%, purple.600 25%, blue.500 75%, blue.600 100%)"
          />
        )}
        {/* Enhanced Overlay with pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-b, transparent 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.8) 100%)"
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          backgroundImage="repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)"
        />
      </Box>

      <Container maxW="7xl" position="relative" mt={{ base: -10, md: -12 }}>
        {/* Compact Clan Header Card */}
        <Card
          bg={cardBg}
          shadow="lg"
          mb={6}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
        >
          <CardBody p={{ base: 4, md: 5 }}>
            <Flex gap={4} alignItems="start" direction={{ base: 'column', md: 'row' }}>
              {/* Logo */}
              <Box flexShrink={0}>
                {clan.logoUrl ? (
                  <Image
                    src={clan.logoUrl}
                    alt={clan.name}
                    boxSize={{ base: '70px', md: '90px' }}
                    borderRadius="lg"
                    border="3px solid"
                    borderColor="white"
                    shadow="md"
                    objectFit="cover"
                  />
                ) : (
                  <Flex
                    boxSize={{ base: '70px', md: '90px' }}
                    borderRadius="lg"
                    bgGradient="linear(135deg, purple.500, blue.500)"
                    alignItems="center"
                    justifyContent="center"
                    border="3px solid"
                    borderColor="white"
                    shadow="md"
                  >
                    <Icon as={FaShieldAlt} boxSize={8} color="white" />
                  </Flex>
                )}
              </Box>

              {/* Clan Info */}
              <VStack align="start" spacing={2} flex={1} minW={0}>
                <HStack spacing={2} flexWrap="wrap">
                  <Heading 
                    size="lg" 
                    fontWeight="800"
                    bgGradient="linear(to-r, purple.600, blue.500)"
                    bgClip="text"
                  >
                    {clan.name}
                  </Heading>
                  <Badge 
                    colorScheme="purple" 
                    fontSize="sm" 
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontWeight="600"
                  >
                    [{clan.tag}]
                  </Badge>
                </HStack>
                {clan.motto && (
                  <Text 
                    fontSize="sm" 
                    fontStyle="italic" 
                    color="gray.600"
                    noOfLines={1}
                  >
                    "{clan.motto}"
                  </Text>
                )}
                <Text color="gray.600" fontSize="sm" noOfLines={2}>
                  {clan.description}
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  <Badge colorScheme="blue" fontSize="xs" px={2} py={0.5}>
                    {clan.clanType}
                  </Badge>
                  <Badge colorScheme={clan.isPublic ? 'green' : 'orange'} fontSize="xs" px={2} py={0.5}>
                    {clan.isPublic ? 'Public' : 'Private'}
                  </Badge>
                  {clan.requireApproval && (
                    <Badge colorScheme="orange" fontSize="xs" px={2} py={0.5}>
                      Approval Required
                    </Badge>
                  )}
                  {clan.universityName && (
                    <Badge variant="outline" colorScheme="purple" fontSize="xs" px={2} py={0.5}>
                      {clan.universityName}
                    </Badge>
                  )}
                </HStack>
              </VStack>

              {/* Action Buttons - Right Side */}
              <VStack spacing={2} flexShrink={0} minW={{ base: 'full', md: '160px' }}>
                {isMember ? (
                  <>
                    {isLeaderOrCoLeader && (
                      <Button
                        colorScheme="purple"
                        leftIcon={<FaCog />}
                        w="full"
                        onClick={() => navigate(`/clans/${clanId}/members`)}
                        size="sm"
                        borderRadius="lg"
                        fontWeight="600"
                      >
                        Manage Clan
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      colorScheme="red"
                      leftIcon={<FaSignOutAlt />}
                      w="full"
                      size="sm"
                      borderRadius="lg"
                      fontWeight="600"
                      onClick={() => leaveMutation.mutate()}
                      isLoading={leaveMutation.isLoading}
                    >
                      Leave Clan
                    </Button>
                  </>
                ) : (
                  <Button
                    colorScheme="purple"
                    leftIcon={<FaUserPlus />}
                    w="full"
                    size="sm"
                    borderRadius="lg"
                    fontWeight="600"
                    onClick={() => joinMutation.mutate()}
                    isLoading={joinMutation.isLoading}
                    isDisabled={joinStatus === 'pending' || atCapacity}
                  >
                    {atCapacity ? 'Clan Full' : joinStatus === 'pending' ? 'Pending' : 'Join'}
                  </Button>
                )}
              </VStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Compact Stats Grid */}
        <SimpleGrid 
          columns={{ base: 2, md: 4, lg: 5 }} 
          spacing={3} 
          mb={6}
        >
          <StatCard
            icon={FaUsers}
            label="Members"
            value={clan.memberCount}
            color="purple"
          />
          <StatCard
            icon={FaTrophy}
            label="Total Points"
            value={clan.totalPoints.toLocaleString()}
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

        {/* Compact Tabs Section */}
        <Card 
          bg={tabBg} 
          shadow="md"
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
        >
          <Tabs colorScheme="purple" size="sm">
            <TabList 
              px={4} 
              pt={3}
              pb={2}
              overflowX="auto"
              gap={1}
              css={{
                '&::-webkit-scrollbar': {
                  height: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#CBD5E0',
                  borderRadius: '2px',
                },
              }}
            >
              <Tab 
                fontWeight="600" 
                fontSize="xs"
                px={3}
                py={1.5}
                _selected={{ 
                  color: 'purple.600', 
                  borderBottomWidth: '2px',
                  borderBottomColor: 'purple.600'
                }}
              >
                📊 Overview
              </Tab>
              {isMember && (
                <Tab 
                  fontWeight="600"
                  fontSize="xs"
                  px={3}
                  py={1.5}
                  _selected={{ 
                    color: 'purple.600', 
                    borderBottomWidth: '2px',
                    borderBottomColor: 'purple.600'
                  }}
                >
                  📢 Announcements
                </Tab>
              )}
              {isMember && (
                <Tab 
                  fontWeight="600"
                  fontSize="xs"
                  px={3}
                  py={1.5}
                  _selected={{ 
                    color: 'purple.600', 
                    borderBottomWidth: '2px',
                    borderBottomColor: 'purple.600'
                  }}
                >
                  💬 Community
                </Tab>
              )}
              <Tab 
                fontWeight="600"
                fontSize="xs"
                px={3}
                py={1.5}
                _selected={{ 
                  color: 'purple.600', 
                  borderBottomWidth: '2px',
                  borderBottomColor: 'purple.600'
                }}
              >
                👥 Members ({members?.length || 0})
              </Tab>
              <Tab 
                fontWeight="600"
                fontSize="xs"
                px={3}
                py={1.5}
                _selected={{ 
                  color: 'purple.600', 
                  borderBottomWidth: '2px',
                  borderBottomColor: 'purple.600'
                }}
              >
                🏆 Competitions ({competitions?.length || 0})
              </Tab>
              <Tab 
                fontWeight="600"
                fontSize="xs"
                px={3}
                py={1.5}
                _selected={{ 
                  color: 'purple.600', 
                  borderBottomWidth: '2px',
                  borderBottomColor: 'purple.600'
                }}
              >
                📈 Statistics
              </Tab>
              {hasLeadership && (
                <Tab 
                  fontWeight="600"
                  fontSize="xs"
                  px={3}
                  py={1.5}
                  _selected={{ 
                    color: 'purple.600', 
                    borderBottomWidth: '2px',
                    borderBottomColor: 'purple.600'
                  }}
                >
                  <Icon as={FaCog} mr={1} boxSize={2.5} />
                  Management
                </Tab>
              )}
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel p={6}>
                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
                  <GridItem>
                    <Card
                      bg={cardBg}
                      mb={6}
                      shadow="lg"
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="xl"
                    >
                      <CardBody p={6}>
                        <Heading size="md" mb={4} fontWeight="800">
                          🏰 About Clan
                        </Heading>
                        <Stack spacing={4}>
                          <Text color="gray.700" lineHeight="1.8" fontSize="md">
                            {clan.description}
                          </Text>
                          {clan.joinCriteria && (
                            <>
                              <Divider />
                              <Box>
                                <Text fontWeight="700" mb={2} color="gray.800" fontSize="md">
                                  ✅ Join Criteria
                                </Text>
                                <Text fontSize="sm" color="gray.600" lineHeight="1.6" bg={joinCriteriaBg} p={3} borderRadius="lg">
                                  {clan.joinCriteria}
                                </Text>
                              </Box>
                            </>
                          )}
                        </Stack>
                      </CardBody>
                    </Card>

                    <Box>
                      <Heading size="md" mb={5} fontWeight="800">
                        🏆 Recent Competitions
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        {competitionsLoading ? (
                          [...Array(2)].map((_, i) => (
                            <Card key={i} borderRadius="xl">
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
                          <Card gridColumn="1/-1" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                            <CardBody py={8}>
                              <VStack spacing={3}>
                                <Icon as={FaTrophy} boxSize={12} color="gray.300" />
                                <Text color="gray.500" textAlign="center" fontWeight="600">
                                  No competitions yet
                                </Text>
                                <Text color="gray.400" textAlign="center" fontSize="sm">
                                  Check back later for upcoming events
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        )}
                      </SimpleGrid>
                    </Box>
                  </GridItem>

                  <GridItem>
                    <Card bg={cardBg} mb={6} shadow="lg" borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                      <CardBody p={6}>
                        <Heading size="sm" mb={5} fontWeight="800">
                          ⭐ Top Members
                        </Heading>
                        <Stack spacing={2}>
                          {stats?.topMembers?.slice(0, 5).map((member, index) => (
                            <HStack 
                              key={member.userId} 
                              spacing={3}
                              cursor="pointer"
                              p={4}
                              borderRadius="xl"
                              bg={index === 0 ? topMemberBg : 'transparent'}
                              borderWidth={index === 0 ? "2px" : "1px"}
                              borderColor={index === 0 ? "yellow.400" : borderColor}
                              _hover={{ 
                                bg: topMemberHoverBg,
                                transform: 'translateX(4px)',
                                borderColor: 'purple.300'
                              }}
                              onClick={() => navigate(`/profile/${member.userId}`)}
                              transition="all 0.2s ease"
                            >
                              <Badge 
                                colorScheme={index === 0 ? 'yellow' : index === 1 ? 'gray' : index === 2 ? 'orange' : 'purple'}
                                borderRadius="full"
                                w={8}
                                h={8}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="sm"
                                fontWeight="800"
                              >
                                {index + 1}
                              </Badge>
                              <Avatar
                                size="sm"
                                name={member.userName}
                                src={member.profileImage}
                                borderWidth="2px"
                                borderColor={index === 0 ? 'yellow.400' : 'gray.300'}
                              />
                              <VStack align="start" spacing={0} flex={1}>
                                <Text fontSize="sm" fontWeight="700">
                                  {member.userName}
                                </Text>
                                <HStack spacing={1.5}>
                                  <Icon as={FaTrophy} boxSize={3} color="yellow.500" />
                                  <Text fontSize="xs" color="gray.500" fontWeight="600">
                                    {member.contributionPoints.toLocaleString()} points
                                  </Text>
                                </HStack>
                              </VStack>
                              {index === 0 && <Icon as={FaCrown} color="yellow.500" boxSize={5} />}
                            </HStack>
                          ))}
                        </Stack>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                      <CardBody p={6}>
                        <Heading size="sm" mb={5} fontWeight="800">
                          ℹ️ Clan Information
                        </Heading>
                        <Stack spacing={4} fontSize="sm">
                          <HStack justify="space-between" p={3} bg={clanInfoBg} borderRadius="lg">
                            <HStack spacing={2}>
                              <Icon as={FaCrown} color="yellow.500" boxSize={4} />
                              <Text color="gray.600" fontWeight="600">Leader:</Text>
                            </HStack>
                            <Text fontWeight="700">{clan.leaderName}</Text>
                          </HStack>
                          <HStack justify="space-between" p={3} bg={clanInfoBg} borderRadius="lg">
                            <HStack spacing={2}>
                              <Icon as={FaCalendar} color="blue.500" boxSize={4} />
                              <Text color="gray.600" fontWeight="600">Created:</Text>
                            </HStack>
                            <Text fontWeight="700">
                              {new Date(clan.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Text>
                          </HStack>
                          <HStack justify="space-between" p={3} bg={clanInfoBg} borderRadius="lg">
                            <HStack spacing={2}>
                              <Icon as={FaUsers} color="purple.500" boxSize={4} />
                              <Text color="gray.600" fontWeight="600">Max Members:</Text>
                            </HStack>
                            <Text fontWeight="700">{clan.maxMembers}</Text>
                          </HStack>
                          {clan.requireApproval && (
                            <Badge 
                              colorScheme="orange"
                              alignSelf="start"
                              px={4}
                              py={2}
                              borderRadius="full"
                              fontSize="sm"
                              fontWeight="700"
                            >
                              ✓ Requires Approval
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
                <TabPanel p={6}>
                  <ClanAnnouncements userRole={userRole} />
                </TabPanel>
              )}

              {/* Community Tab - Members Only */}
              {isMember && (
                <TabPanel p={6}>
                  <ClanCommunity />
                </TabPanel>
              )}

              {/* Members Tab */}
              <TabPanel p={6}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                  {membersLoading ? (
                    [...Array(6)].map((_, i) => (
                      <Card key={i} borderRadius="xl">
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
                    <Card gridColumn="1/-1" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                      <CardBody py={8}>
                        <VStack spacing={3}>
                          <Icon as={FaUsers} boxSize={12} color="gray.300" />
                          <Text color="gray.500" textAlign="center" fontWeight="600">
                            No members yet
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </SimpleGrid>
              </TabPanel>

              {/* Competitions Tab */}
              <TabPanel p={6}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                  {competitionsLoading ? (
                    [...Array(6)].map((_, i) => (
                      <Card key={i} borderRadius="xl">
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
                    <Card gridColumn="1/-1" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                      <CardBody py={8}>
                        <VStack spacing={3}>
                          <Icon as={FaTrophy} boxSize={12} color="gray.300" />
                          <Text color="gray.500" textAlign="center" fontWeight="600">
                            No competitions yet
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </SimpleGrid>
              </TabPanel>

              {/* Statistics Tab */}
              <TabPanel p={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                    <CardBody p={6}>
                      <Heading size="sm" mb={6} fontWeight="800">
                        📊 Performance Metrics
                      </Heading>
                      <Stack spacing={6}>
                        <Box>
                          <HStack justify="space-between" mb={3}>
                            <HStack spacing={2}>
                              <Icon as={FaBolt} color="yellow.500" boxSize={4} />
                              <Text fontSize="sm" color="gray.600" fontWeight="700">Win Rate</Text>
                            </HStack>
                            <Text fontSize="lg" fontWeight="800" color="purple.600">
                              {stats?.winRate
                                ? `${(stats.winRate * 100).toFixed(1)}%`
                                : '0%'}
                            </Text>
                          </HStack>
                          <Progress
                            value={stats?.winRate ? stats.winRate * 100 : 0}
                            colorScheme="purple"
                            size="lg"
                            borderRadius="full"
                            hasStripe
                          />
                        </Box>
                        <Divider />
                        <SimpleGrid columns={2} spacing={5}>
                          <Box p={4} bg={statWeeklyBg} borderRadius="xl">
                            <Stat>
                              <StatLabel color="gray.600" fontSize="xs" fontWeight="700" textTransform="uppercase">Weekly Points</StatLabel>
                              <StatNumber fontSize="2xl" fontWeight="800" color="purple.600">
                                {stats?.weeklyPoints?.toLocaleString() || 0}
                              </StatNumber>
                            </Stat>
                          </Box>
                          <Box p={4} bg={statMonthlyBg} borderRadius="xl">
                            <Stat>
                              <StatLabel color="gray.600" fontSize="xs" fontWeight="700" textTransform="uppercase">Monthly Points</StatLabel>
                              <StatNumber fontSize="2xl" fontWeight="800" color="blue.600">
                                {stats?.monthlyPoints?.toLocaleString() || 0}
                              </StatNumber>
                            </Stat>
                          </Box>
                        </SimpleGrid>
                      </Stack>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                    <CardBody p={6}>
                      <Heading size="sm" mb={6} fontWeight="800">
                        👥 Member Distribution
                      </Heading>
                      <Stack spacing={4}>
                        {stats?.memberRoleDistribution &&
                          Object.entries(stats.memberRoleDistribution).map(
                            ([role, count]) => (
                              <HStack key={role} justify="space-between" p={4} bg={clanInfoBg} borderRadius="xl">
                                <HStack spacing={3}>
                                  <Box
                                    w={4}
                                    h={4}
                                    borderRadius="full"
                                    bg={
                                      role === 'Leader' ? 'yellow.500' :
                                      role === 'CoLeader' ? 'orange.500' :
                                      role === 'Elder' ? 'purple.500' : 'blue.500'
                                    }
                                    shadow="md"
                                  />
                                  <Text fontSize="sm" fontWeight="700">{role}</Text>
                                </HStack>
                                <Badge 
                                  colorScheme={
                                    role === 'Leader' ? 'yellow' :
                                    role === 'CoLeader' ? 'orange' :
                                    role === 'Elder' ? 'purple' : 'blue'
                                  }
                                  fontSize="md"
                                  px={4}
                                  py={1.5}
                                  borderRadius="full"
                                  fontWeight="800"
                                >
                                  {count}
                                </Badge>
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
                <TabPanel p={6}>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {isLeaderOrCoLeader && (
                      <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor} borderRadius="xl" gridColumn={{ md: "1 / -1" }} maxW="2xl" mx="auto" w="full">
                        <CardBody p={6}>
                          <HStack justify="space-between" mb={6} align="center">
                            <HStack spacing={3}>
                              <Icon as={FaUserPlus} color="purple.500" boxSize={6} />
                              <Heading size="sm" fontWeight="800">
                                Pending Join Requests
                              </Heading>
                            </HStack>
                            <Badge 
                              colorScheme="yellow"
                              fontSize="lg"
                              px={4}
                              py={2}
                              borderRadius="full"
                              fontWeight="800"
                            >
                              {pendingRequests?.length || 0}
                            </Badge>
                          </HStack>

                          {pendingRequestsLoading ? (
                            <Stack spacing={4}>
                              {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} height="100px" borderRadius="xl" />
                              ))}
                            </Stack>
                          ) : pendingRequests && pendingRequests.length > 0 ? (
                            <Stack spacing={4}>
                              {pendingRequests.map((req) => {
                                const isProcessing =
                                  decideJoinRequestMutation.isLoading &&
                                  decideJoinRequestMutation.variables?.requestId === req.id;

                                return (
                                  <Box
                                    key={req.id}
                                    p={5}
                                    borderRadius="xl"
                                    bg={pendingRequestBg}
                                    borderWidth="2px"
                                    borderColor="transparent"
                                    _hover={{ borderColor: 'purple.300', shadow: 'md' }}
                                    transition="all 0.2s ease"
                                  >
                                    <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                                      <HStack flex={1} align="start" spacing={4}>
                                        <Avatar
                                          size="md"
                                          name={req.userName}
                                          src={req.profileImageUrl}
                                          cursor="pointer"
                                          onClick={() => navigate(`/profile/${req.userId}`)}
                                          borderWidth="3px"
                                          borderColor="purple.400"
                                        />
                                        <VStack align="start" spacing={2} flex={1}>
                                          <Text 
                                            fontSize="md" 
                                            fontWeight="800"
                                            cursor="pointer"
                                            _hover={{ color: 'purple.500' }}
                                            onClick={() => navigate(`/profile/${req.userId}`)}
                                          >
                                            {req.userName}
                                          </Text>
                                          <Text fontSize="xs" color="gray.500" fontWeight="600">
                                            📅 Requested {new Date(req.requestedAt).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </Text>
                                          {req.message && (
                                            <Text 
                                              fontSize="sm" 
                                              color="gray.700" 
                                              noOfLines={2}
                                              fontStyle="italic"
                                              bg={cardBg}
                                              p={3}
                                              borderRadius="lg"
                                              borderLeftWidth="3px"
                                              borderLeftColor="purple.400"
                                            >
                                              "{req.message}"
                                            </Text>
                                          )}
                                        </VStack>
                                      </HStack>
                                      <VStack spacing={2}>
                                        <Button
                                          size="sm"
                                          colorScheme="purple"
                                          variant="outline"
                                          w="full"
                                          borderRadius="lg"
                                          fontWeight="700"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/profile/${req.userId}`);
                                          }}
                                        >
                                          👤 View Profile
                                        </Button>
                                        <Button
                                          size="sm"
                                          colorScheme="green"
                                          w="full"
                                          borderRadius="lg"
                                          fontWeight="700"
                                          isLoading={isProcessing && decideJoinRequestMutation.variables?.action === 'approve'}
                                          onClick={() => handleJoinRequestDecision(req.id, 'approve')}
                                          leftIcon={<Text>✓</Text>}
                                        >
                                          Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          colorScheme="red"
                                          variant="outline"
                                          w="full"
                                          borderRadius="lg"
                                          fontWeight="700"
                                          isLoading={isProcessing && decideJoinRequestMutation.variables?.action === 'reject'}
                                          onClick={() => handleJoinRequestDecision(req.id, 'reject')}
                                          leftIcon={<Text>✕</Text>}
                                        >
                                          Reject
                                        </Button>
                                      </VStack>
                                    </Flex>
                                  </Box>
                                );
                              })}
                            </Stack>
                          ) : (
                            <VStack py={8} spacing={3}>
                              <Icon as={FaUserPlus} boxSize={12} color="gray.300" />
                              <Text color="gray.500" textAlign="center" fontWeight="600">
                                No pending requests
                              </Text>
                              <Text color="gray.400" textAlign="center" fontSize="sm">
                                New join requests will appear here
                              </Text>
                            </VStack>
                          )}
                        </CardBody>
                      </Card>
                    )}
                  </SimpleGrid>
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Card>

        {/* Enhanced Settings Modal */}
        <Modal isOpen={isPrivacyOpen} onClose={closePrivacy} isCentered size="lg">
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent borderRadius="2xl" mx={4}>
            <ModalHeader fontWeight="800" fontSize="2xl" pt={6}>
              🔒 Privacy Settings
            </ModalHeader>
            <ModalCloseButton top={6} right={6} />
            <ModalBody pb={6}>
              <Stack spacing={6}>
                <FormControl display="flex" alignItems="center" p={4} bg={modalFormBg} borderRadius="xl">
                  <FormLabel htmlFor="isPublic" mb="0" flex="1" fontWeight="700">
                    🌐 Public Clan
                  </FormLabel>
                  <Switch 
                    id="isPublic" 
                    isChecked={privacyIsPublic} 
                    onChange={(e) => setPrivacyIsPublic(e.target.checked)} 
                    colorScheme="purple"
                    size="lg"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center" p={4} bg={modalFormBg} borderRadius="xl">
                  <FormLabel htmlFor="requireApproval" mb="0" flex="1" fontWeight="700">
                    ✓ Require Approval to Join
                  </FormLabel>
                  <Switch 
                    id="requireApproval" 
                    isChecked={privacyRequireApproval} 
                    onChange={(e) => setPrivacyRequireApproval(e.target.checked)} 
                    colorScheme="purple"
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="700" fontSize="md">📝 Join Criteria (optional)</FormLabel>
                  <Input 
                    value={privacyJoinCriteria || ''} 
                    onChange={(e) => setPrivacyJoinCriteria(e.target.value)} 
                    placeholder="e.g. Minimum rank, points, etc."
                    size="lg"
                    borderRadius="xl"
                    borderWidth="2px"
                    bg={modalFormBg}
                    _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                  />
                </FormControl>
              </Stack>
            </ModalBody>

            <ModalFooter pb={6} gap={3}>
              <Button 
                variant="ghost" 
                onClick={closePrivacy}
                size="lg"
                borderRadius="xl"
                fontWeight="700"
              >
                Cancel
              </Button>
              <Button 
                colorScheme="purple" 
                onClick={handleSavePrivacy} 
                isLoading={privacyMutation.isLoading}
                size="lg"
                borderRadius="xl"
                fontWeight="700"
                px={8}
                shadow="md"
              >
                💾 Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default ClanDetail;