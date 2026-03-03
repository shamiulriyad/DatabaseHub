import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ClanAnnouncements from './ClanAnnouncements';
import ClanCommunity from './ClanCommunity';
import CosmicBg from '../../components/CosmicBg';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  Box, Container, Heading, Text, Button, SimpleGrid, Stack, HStack,
  VStack, Skeleton, SkeletonText, Icon, Avatar, Divider, Tabs,
  TabList, TabPanels, Tab, TabPanel, Grid, useToast, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, Switch, FormControl, FormLabel,
  Input, Flex, AvatarBadge, Progress, Badge,
} from '@chakra-ui/react';
import {
  FaUsers, FaTrophy, FaStar, FaShieldAlt, FaCrown, FaUserPlus,
  FaSignOutAlt, FaCog, FaEdit, FaChartLine, FaCalendar, FaFire,
  FaBolt, FaAward, FaCheckCircle, FaLock, FaGlobe,
} from 'react-icons/fa';
import TeamsPage from '../TeamsPage';

// ─── NEW NEON COLOR PALETTE ───────────────────────────────────────────────────
const N = {
  // Dark base
  void:     '#0a0e27',
  deep:     '#0f1229',
  space:    '#1a1f3a',
  
  // Neon accents
  cyan:     '#00fff5',
  magenta:  '#ff2e97',
  violet:   '#a855f7',
  lime:     '#84cc16',
  orange:   '#ff6b35',
  
  // Soft variants
  cyanSoft:    'rgba(0,255,245,0.15)',
  magentaSoft: 'rgba(255,46,151,0.15)',
  violetSoft:  'rgba(168,85,247,0.15)',
  
  // Text
  text:     '#e2e8f0',
  muted:    '#94a3b8',
  dim:      '#64748b',
};

// ─── GLOBAL STYLES + ANIMATIONS ───────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap');

    body {
      background: ${N.void};
      color: ${N.text};
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
    }

    ::selection { background: ${N.cyan}; color: #000; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: ${N.deep}; }
    ::-webkit-scrollbar-thumb { 
      background: linear-gradient(180deg, ${N.cyan}, ${N.magenta});
      border-radius: 10px;
    }

    /* Keyframes */
    @keyframes neonPulse {
      0%, 100% { 
        text-shadow: 0 0 10px ${N.cyan}, 0 0 20px ${N.cyan}, 0 0 30px ${N.cyan};
        filter: brightness(1);
      }
      50% { 
        text-shadow: 0 0 20px ${N.cyan}, 0 0 40px ${N.cyan}, 0 0 60px ${N.cyan};
        filter: brightness(1.3);
      }
    }

    @keyframes borderGlow {
      0%, 100% { border-color: ${N.cyan}; box-shadow: 0 0 20px rgba(0,255,245,0.3); }
      50% { border-color: ${N.magenta}; box-shadow: 0 0 30px rgba(255,46,151,0.4); }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes rotate360 {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 0 30px rgba(0,255,245,0.4); }
      50% { box-shadow: 0 0 60px rgba(255,46,151,0.6); }
    }

    /* Neon Glass Card */
    .neon-glass {
      background: linear-gradient(135deg, rgba(26,31,58,0.7), rgba(15,18,41,0.9));
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0,255,245,0.2);
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .neon-glass::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(0,255,245,0.05), rgba(255,46,151,0.05));
      opacity: 0;
      transition: opacity 0.4s;
    }
    .neon-glass:hover::before { opacity: 1; }
    .neon-glass:hover {
      transform: translateY(-8px);
      border-color: rgba(0,255,245,0.5);
      box-shadow: 0 20px 60px rgba(0,255,245,0.2), 0 0 40px rgba(255,46,151,0.1);
    }

    /* Neon Border Effect */
    .neon-border {
      position: relative;
      padding: 2px;
      background: linear-gradient(135deg, ${N.cyan}, ${N.magenta}, ${N.violet});
      border-radius: 20px;
      animation: rotate360 4s linear infinite;
    }
    .neon-border-inner {
      background: ${N.deep};
      border-radius: 18px;
      position: relative;
      z-index: 1;
    }

    /* Stat Card Glow */
    .stat-glow {
      animation: glowPulse 3s ease-in-out infinite;
    }

    /* Member Card Hologram */
    .member-holo {
      background: linear-gradient(135deg, rgba(0,255,245,0.08), rgba(168,85,247,0.08));
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,255,245,0.3);
      border-radius: 16px;
      transition: all 0.3s;
      cursor: pointer;
      position: relative;
    }
    .member-holo::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent,
        rgba(0,255,245,0.1),
        transparent
      );
      transform: rotate(45deg);
      transition: all 0.6s;
    }
    .member-holo:hover::after {
      left: 100%;
    }
    .member-holo:hover {
      border-color: ${N.cyan};
      box-shadow: 0 10px 40px rgba(0,255,245,0.3);
      transform: translateY(-6px);
    }

    /* Neon Tab */
    .neon-tab {
      color: ${N.muted};
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 12px 24px;
      border-radius: 12px;
      transition: all 0.3s;
      border: 1px solid transparent;
      position: relative;
    }
    .neon-tab:hover {
      color: ${N.cyan};
      background: rgba(0,255,245,0.1);
    }
    .neon-tab[aria-selected=true] {
      color: #000;
      background: linear-gradient(135deg, ${N.cyan}, ${N.magenta});
      border-color: ${N.cyan};
      box-shadow: 0 0 20px rgba(0,255,245,0.5), 0 4px 16px rgba(0,0,0,0.3);
      font-weight: 700;
    }

    /* Reveal Animation */
    .reveal { animation: slideUp 0.8s ease both; }
    .reveal-1 { animation: slideUp 0.8s 0.1s ease both; }
    .reveal-2 { animation: slideUp 0.8s 0.2s ease both; }
    .reveal-3 { animation: slideUp 0.8s 0.3s ease both; }

    /* Neon Text */
    .neon-text {
      font-family: 'Orbitron', sans-serif;
      color: ${N.cyan};
      text-shadow: 0 0 10px ${N.cyan}, 0 0 20px ${N.cyan};
    }

    /* Grid Pattern Background */
    .grid-bg {
      background-image: 
        linear-gradient(rgba(0,255,245,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,245,0.03) 1px, transparent 1px);
      background-size: 50px 50px;
    }
  `}</style>
);

// ─── API Fetchers (unchanged) ─────────────────────────────────────────────────
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

// ─── NEON STAT CARD ───────────────────────────────────────────────────────────
const NeonStat = ({ icon, label, value, color = N.cyan }) => (
  <Box className="neon-glass stat-glow" p={6}>
    <HStack spacing={4}>
      <Box w="56px" h="56px" borderRadius="14px" display="flex" alignItems="center"
        justifyContent="center" position="relative"
        style={{ background:`linear-gradient(135deg, ${color}22, ${color}11)`,
          border:`1px solid ${color}44`, boxShadow:`0 0 20px ${color}33` }}>
        <Icon as={icon} boxSize={6} style={{ color, filter:`drop-shadow(0 0 8px ${color})` }} />
      </Box>
      <VStack spacing={0} align="flex-start" flex={1}>
        <Text fontSize="10px" fontWeight="700" letterSpacing="0.15em" textTransform="uppercase"
          style={{ color:N.dim }}>
          {label}
        </Text>
        <Text fontSize="2xl" fontWeight="900" fontFamily="'Orbitron', sans-serif"
          style={{ color, textShadow:`0 0 10px ${color}` }}>
          {value}
        </Text>
      </VStack>
    </HStack>
  </Box>
);

// ─── HOLOGRAM MEMBER CARD ─────────────────────────────────────────────────────
const HoloMember = ({ member, navigate }) => {
  const roleColors = {
    Leader:   N.orange,
    CoLeader: N.magenta,
    Elder:    N.violet,
    Member:   N.cyan,
  };
  const roleIcons = { Leader:FaCrown, CoLeader:FaAward, Elder:FaStar, Member:null };
  const rc = roleColors[member.role] || N.cyan;

  return (
    <Box className="member-holo" p={5} onClick={() => navigate(`/profile/${member.userId}`)}>
      <Stack spacing={4}>
        <HStack spacing={3}>
          <Box position="relative">
            <Avatar src={member.avatarUrl} name={member.userName} size="lg"
              style={{ border:`2px solid ${rc}`, boxShadow:`0 0 20px ${rc}55` }} />
            {member.role === 'Leader' && (
              <Box position="absolute" top="-6px" right="-6px" w="24px" h="24px"
                borderRadius="full" display="flex" alignItems="center" justifyContent="center"
                style={{ background:`linear-gradient(135deg, ${N.orange}, ${N.magenta})`,
                  boxShadow:`0 0 15px ${N.orange}` }}>
                <Icon as={FaCrown} color="#000" boxSize={3} />
              </Box>
            )}
          </Box>
          <VStack spacing={0} align="flex-start" flex={1}>
            <Text fontWeight="700" fontSize="md" fontFamily="'Orbitron', sans-serif"
              style={{ color:N.text }}>
              {member.userName}
            </Text>
            <HStack spacing={2}>
              {roleIcons[member.role] && (
                <Icon as={roleIcons[member.role]} boxSize={3} style={{ color:rc }} />
              )}
              <Text fontSize="xs" fontWeight="600" letterSpacing="0.05em"
                style={{ color:rc, textShadow:`0 0 8px ${rc}` }}>
                {member.role.toUpperCase()}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        <Box h="1px" style={{ background:`linear-gradient(90deg, transparent, ${rc}44, transparent)` }} />

        <HStack justify="space-between">
          <VStack spacing={0} align="flex-start">
            <Text fontSize="9px" fontWeight="600" letterSpacing="0.1em" textTransform="uppercase"
              style={{ color:N.dim }}>
              Points
            </Text>
            <Text fontSize="lg" fontWeight="800" fontFamily="'Orbitron', sans-serif"
              style={{ color:N.cyan, textShadow:`0 0 10px ${N.cyan}` }}>
              {member.contributionPoints?.toLocaleString()}
            </Text>
          </VStack>
          <VStack spacing={0} align="flex-end">
            <Text fontSize="9px" fontWeight="600" letterSpacing="0.1em" textTransform="uppercase"
              style={{ color:N.dim }}>
              Posts
            </Text>
            <Text fontSize="lg" fontWeight="800" fontFamily="'Orbitron', sans-serif"
              style={{ color:N.text }}>
              {member.totalPosts}
            </Text>
          </VStack>
        </HStack>
      </Stack>
    </Box>
  );
};

// ─── COMPETITION HOLOGRAM CARD ────────────────────────────────────────────────
const CompHolo = ({ comp, navigate }) => {
  const statusColors = {
    Upcoming:  N.cyan,
    Ongoing:   N.lime,
    Completed: N.dim,
    Cancelled: '#ef4444',
  };
  const sc = statusColors[comp.status] || N.cyan;

  return (
    <Box className="neon-glass" p={6}>
      <Stack spacing={4}>
        <HStack justify="space-between" align="flex-start">
          <Heading fontSize="md" fontWeight="700" fontFamily="'Orbitron', sans-serif"
            style={{ color:N.text }} flex={1}>
            {comp.title}
          </Heading>
          <Badge px={3} py={1} borderRadius="full" fontSize="9px" fontWeight="700"
            letterSpacing="0.1em" textTransform="uppercase"
            style={{ background:`${sc}22`, color:sc, border:`1px solid ${sc}44` }}>
            {comp.status}
          </Badge>
        </HStack>
        {comp.description && (
          <Text fontSize="sm" lineHeight="1.7" noOfLines={2} style={{ color:N.muted }}>
            {comp.description}
          </Text>
        )}
        <HStack justify="space-between" fontSize="xs">
          <HStack spacing={2}>
            <Icon as={FaCalendar} style={{ color:N.dim }} />
            <Text style={{ color:N.dim }}>
              {new Date(comp.startDate).toLocaleDateString('en-US', {
                month:'short', day:'numeric', year:'numeric'
              })}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Icon as={FaUsers} style={{ color:N.cyan }} />
            <Text fontWeight="700" fontFamily="'Orbitron', sans-serif"
              style={{ color:N.cyan }}>
              {comp.participantCount}
            </Text>
          </HStack>
        </HStack>

        <Button
          size="sm"
          w="full"
          borderRadius="full"
          fontWeight="700"
          color="#000"
          onClick={() => navigate(`/competitions/${comp.id}`)}
          style={{
            background: comp.status === 'Completed'
              ? `linear-gradient(135deg, ${N.violet}, ${N.magenta})`
              : `linear-gradient(135deg, ${N.cyan}, ${N.lime})`,
            boxShadow: `0 0 20px ${comp.status === 'Completed' ? N.violet : N.cyan}66`,
          }}
          _hover={{ transform: 'translateY(-2px)' }}
        >
          {comp.status === 'Completed' ? 'VIEW DETAILS' : 'COMPETE NOW'}
        </Button>
      </Stack>
    </Box>
  );
};

// ─── LOADING HOLOGRAM ─────────────────────────────────────────────────────────
const LoadingHolo = () => (
  <Box minH="100vh" className="grid-bg" style={{ background:N.void }}>
    <GlobalStyles />
    <Container maxW="7xl" py={16}>
      <Stack spacing={6}>
        <Skeleton h="300px" borderRadius="24px" startColor={N.space} endColor={N.deep} />
        <SimpleGrid columns={{ base:2, md:4 }} spacing={4}>
          {[...Array(4)].map((_,i) => (
            <Skeleton key={i} h="120px" borderRadius="20px" startColor={N.space} endColor={N.deep} />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  </Box>
);

// ─── NOT FOUND ────────────────────────────────────────────────────────────────
const NotFoundHolo = ({ navigate }) => (
  <Box minH="100vh" className="grid-bg" style={{ background:N.void }}
    display="flex" alignItems="center" justifyContent="center">
    <GlobalStyles />
    <VStack spacing={6} textAlign="center">
      <Text fontSize="80px" style={{ animation:'neonPulse 2s ease-in-out infinite' }}>⚠️</Text>
      <Heading fontFamily="'Orbitron', sans-serif" fontSize="3xl" className="neon-text">
        CLAN NOT FOUND
      </Heading>
      <Text style={{ color:N.muted }}>
        The clan you're looking for doesn't exist or has been removed.
      </Text>
      <Button size="lg" px={10} borderRadius="full" fontWeight="700" color="#000"
        style={{ background:`linear-gradient(135deg, ${N.cyan}, ${N.magenta})`,
          boxShadow:`0 0 30px ${N.cyan}66` }}
        _hover={{ transform:'scale(1.05)', boxShadow:`0 0 50px ${N.cyan}` }}
        transition="all 0.3s"
        onClick={() => navigate('/clans')}>
        BROWSE CLANS
      </Button>
    </VStack>
  </Box>
);

// ─── MAIN CLAN DETAIL ─────────────────────────────────────────────────────────
const ClanDetail = () => {
  const { clanId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [joinStatus, setJoinStatus] = React.useState('idle');
  const [userRole, setUserRole] = React.useState(null);
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

  React.useEffect(() => {
    if (clan?.isMember && members && user) {
      const userMember = members.find(m => m.userId === user.id);
      if (userMember) { setUserRole(userMember.role); setJoinStatus('member'); }
    } else if (clan?.hasPendingJoinRequest) {
      setJoinStatus('pending');
    } else {
      setJoinStatus('idle'); setUserRole(null);
    }
  }, [clan, members, user]);

  const invalidateClanData = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey:['clan',clanId] });
    queryClient.invalidateQueries({ queryKey:['clanMembers',clanId] });
    queryClient.invalidateQueries({ queryKey:['clanStats',clanId] });
    queryClient.invalidateQueries({ queryKey:['clanCompetitions',clanId] });
    queryClient.invalidateQueries({ queryKey:['clanPendingJoinRequests',clanId] });
  }, [clanId, queryClient]);

  const joinMutation = useMutation({
    mutationFn: () => api.post(`/clans/${clanId}/join`),
    onSuccess: ({ data }) => {
      const status = data?.membership?.status;
      if (status === 'Pending') {
        setJoinStatus('pending');
        toast({ title:'Join request sent', status:'info', duration:4000 });
      } else {
        setJoinStatus('member');
        toast({ title:'Joined clan!', status:'success', duration:3000 });
      }
      invalidateClanData();
    },
    onError: (error) => {
      toast({ title:'Failed to join', description:error.response?.data?.message,
        status:'error', duration:4000 });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => api.post(`/clans/${clanId}/leave`),
    onSuccess: () => {
      setJoinStatus('idle');
      toast({ title:'Left clan', status:'success', duration:3000 });
      invalidateClanData();
    },
    onError: (error) => {
      toast({ title:'Failed to leave', description:error.response?.data?.message,
        status:'error', duration:4000 });
    },
  });

  const isMember = joinStatus === 'member';
  const isLeader = userRole === 'Leader';
  const isLeaderOrCoLeader = userRole === 'Leader' || userRole === 'CoLeader';
  const hasLeadership = ['Leader','CoLeader','Elder'].includes(userRole);
  const atCapacity = clan && clan.memberCount >= clan.maxMembers;
  const totalClanExp = Number(
    stats?.totalExp ??
    stats?.TotalExp ??
    stats?.totalPoints ??
    stats?.TotalPoints ??
    clan?.totalExp ??
    clan?.TotalExp ??
    clan?.totalPoints ??
    clan?.TotalPoints ??
    0
  );

  const { data: pendingRequests = [], isLoading: pendingRequestsLoading } = useQuery({
    queryKey: ['clanPendingJoinRequests', clanId],
    queryFn: () => fetchPendingJoinRequests(clanId),
    enabled: !!clanId && isLeaderOrCoLeader,
  });

  const decideJoinRequestMutation = useMutation({
    mutationFn: ({ requestId, action }) =>
      api.post(`/clans/${clanId}/join-requests/${requestId}/decision`, { action }),
    onSuccess: (_, variables) => {
      invalidateClanData();
      toast({ title: variables.action === 'approve' ? 'Approved!' : 'Rejected',
        status:'success', duration:3000 });
    },
    onError: (error) => {
      toast({ title:'Failed', description:error.response?.data?.message,
        status:'error', duration:4000 });
    },
  });

  const handleJoinRequestDecision = (requestId, action) => {
    decideJoinRequestMutation.mutate({ requestId, action });
  };

  const privacyMutation = useMutation({
    mutationFn: (payload) => api.put(`/clans/${clanId}`, payload),
    onSuccess: () => {
      invalidateClanData();
      toast({ title:'Settings updated', status:'success', duration:3000 });
      closePrivacy();
    },
    onError: (error) => {
      toast({ title:'Failed', description:error.response?.data?.message,
        status:'error', duration:4000 });
    },
  });

  const handleSavePrivacy = () => {
    privacyMutation.mutate({
      isPublic: privacyIsPublic,
      requireApproval: privacyRequireApproval,
      joinCriteria: privacyJoinCriteria,
    });
  };

  if (clanLoading) return <LoadingHolo />;
  if (!clan) return <NotFoundHolo navigate={navigate} />;

  return (
    <Box minH="100vh" className="grid-bg" bg="#070B1A" position="relative">
      <CosmicBg />
      <GlobalStyles />

      {/* Floating orbs */}
      <Box position="fixed" top="-200px" right="-200px" w="600px" h="600px" borderRadius="full"
        style={{ background:`radial-gradient(circle, ${N.cyan}22, transparent 70%)`,
          filter:'blur(80px)', pointerEvents:'none', zIndex:0 }} />
      <Box position="fixed" bottom="-200px" left="-200px" w="600px" h="600px" borderRadius="full"
        style={{ background:`radial-gradient(circle, ${N.magenta}22, transparent 70%)`,
          filter:'blur(80px)', pointerEvents:'none', zIndex:0 }} />

      {/* Hero */}
      <Box position="relative" zIndex={1} overflow="hidden">
        {/* Banner */}
        {clan.bannerUrl && (
          <Box position="absolute" inset={0} overflow="hidden">
            <Box as="img" src={clan.bannerUrl} alt={clan.name}
              style={{ width:'100%', height:'100%', objectFit:'cover',
                filter:'blur(5px) brightness(0.3) saturate(1.5)' }} />
            <Box position="absolute" inset={0}
              style={{ background:`linear-gradient(to bottom, ${N.void}00, ${N.void})` }} />
          </Box>
        )}

        <Container maxW="7xl" py={{ base:16, md:24 }} position="relative" zIndex={2}>
          <Grid templateColumns={{ base:'1fr', md:'auto 1fr auto' }} gap={8} alignItems="center"
            className="reveal">
            {/* Logo */}
            <Box>
              <Box className="neon-border" w="140px" h="140px">
                <Box className="neon-border-inner" w="100%" h="100%" borderRadius="18px"
                  display="flex" alignItems="center" justifyContent="center">
                  {clan.logoUrl ? (
                    <Avatar src={clan.logoUrl} name={clan.name} size="2xl" />
                  ) : (
                    <Text fontSize="60px">🏰</Text>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Info */}
            <Stack spacing={4}>
              <HStack spacing={3} flexWrap="wrap">
                <Badge px={3} py={1} borderRadius="full" fontSize="9px" fontWeight="700"
                  letterSpacing="0.1em" textTransform="uppercase"
                  style={{ background:N.violetSoft, color:N.violet, border:`1px solid ${N.violet}44` }}>
                  {clan.clanType}
                </Badge>
                <Badge px={3} py={1} borderRadius="full" fontSize="9px" fontWeight="700"
                  letterSpacing="0.1em" textTransform="uppercase"
                  style={{ background: clan.isPublic ? `${N.lime}22` : `${N.orange}22`,
                    color: clan.isPublic ? N.lime : N.orange,
                    border: `1px solid ${clan.isPublic ? N.lime+'44' : N.orange+'44'}` }}>
                  {clan.isPublic ? '🌐 PUBLIC' : '🔒 PRIVATE'}
                </Badge>
              </HStack>

              <Heading fontFamily="'Orbitron', sans-serif" fontWeight="900"
                fontSize={{ base:'3xl', md:'4xl' }} letterSpacing="-0.01em"
                className="neon-text" style={{ animation:'neonPulse 3s ease-in-out infinite' }}>
                {clan.name} <Box as="span" style={{ color:N.magenta }}>[{clan.tag}]</Box>
              </Heading>

              {clan.motto && (
                <Text fontSize="md" fontStyle="italic" style={{ color:N.muted }}>
                  "{clan.motto}"
                </Text>
              )}

              {clan.universityName && (
                <HStack spacing={2}>
                  <Icon as={FaShieldAlt} style={{ color:N.violet }} boxSize={4} />
                  <Text fontSize="sm" fontWeight="600" style={{ color:N.text }}>
                    {clan.universityName}
                  </Text>
                </HStack>
              )}
            </Stack>

            {/* Actions */}
            <VStack spacing={3} minW={{ base:'full', md:'220px' }}>
              {isMember ? (
                <>
                  {isLeaderOrCoLeader && (
                    <>
                      <Button size="md" w="full" borderRadius="full" fontWeight="700" color="#000"
                        leftIcon={<Icon as={FaEdit} />}
                        style={{ background:`linear-gradient(135deg, ${N.cyan}, ${N.violet})`,
                          boxShadow:`0 0 20px ${N.cyan}66` }}
                        _hover={{ transform:'translateY(-3px)', boxShadow:`0 0 40px ${N.cyan}` }}
                        onClick={() => navigate(`/clans/${clanId}/edit`)}>
                        EDIT
                      </Button>
                      <Button size="md" w="full" borderRadius="full" fontWeight="700" color="#000"
                        leftIcon={<Icon as={FaCog} />}
                        style={{ background:`linear-gradient(135deg, ${N.magenta}, ${N.orange})`,
                          boxShadow:`0 0 20px ${N.magenta}66` }}
                        _hover={{ transform:'translateY(-3px)', boxShadow:`0 0 40px ${N.magenta}` }}
                        onClick={() => navigate(`/clans/${clanId}/members`)}>
                        MANAGE
                      </Button>
                    </>
                  )}
                  <Button size="md" w="full" borderRadius="full" fontWeight="700"
                    bg="transparent" leftIcon={<Icon as={FaSignOutAlt} />}
                    style={{ border:`2px solid #ef4444`, color:'#ef4444' }}
                    _hover={{ bg:'rgba(239,68,68,0.1)' }}
                    onClick={() => leaveMutation.mutate()}
                    isLoading={leaveMutation.isLoading}>
                    LEAVE
                  </Button>
                </>
              ) : (
                <Button size="md" w="full" borderRadius="full" fontWeight="700" color="#000"
                  leftIcon={<Icon as={FaUserPlus} />}
                  style={{ background: atCapacity || joinStatus === 'pending'
                    ? N.dim : `linear-gradient(135deg, ${N.cyan}, ${N.magenta})`,
                    boxShadow: atCapacity || joinStatus === 'pending'
                      ? 'none' : `0 0 30px ${N.cyan}66`,
                    opacity: atCapacity || joinStatus === 'pending' ? 0.5 : 1 }}
                  _hover={{ transform: atCapacity || joinStatus === 'pending' ? 'none' : 'translateY(-3px)',
                    boxShadow: atCapacity || joinStatus === 'pending' ? 'none' : `0 0 50px ${N.cyan}` }}
                  onClick={() => joinMutation.mutate()}
                  isLoading={joinMutation.isLoading}
                  isDisabled={joinStatus === 'pending' || atCapacity}>
                  {atCapacity ? 'FULL' : joinStatus === 'pending' ? 'PENDING' : 'JOIN'}
                </Button>
              )}
            </VStack>
          </Grid>
        </Container>
      </Box>

      {/* Stats */}
      <Box py={10} position="relative" zIndex={1}
        style={{ borderTop:`1px solid ${N.cyan}22`, borderBottom:`1px solid ${N.cyan}22` }}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base:2, md:4 }} spacing={4} className="reveal-1">
            <NeonStat icon={FaUsers} label="Members"
              value={`${clan.memberCount}/${clan.maxMembers}`} color={N.cyan} />
            <NeonStat icon={FaTrophy} label="Competitions"
              value={competitions?.length || 0} color={N.magenta} />
            <NeonStat icon={FaFire} label="Total EXP"
              value={totalClanExp.toLocaleString()} color={N.lime} />
            <NeonStat icon={FaChartLine} label="Win Rate"
              value={stats?.winRate ? `${(stats.winRate*100).toFixed(1)}%` : '0%'} color={N.violet} />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Tabs */}
      <Container maxW="7xl" py={12} position="relative" zIndex={1}>
        <Tabs variant="unstyled" className="reveal-2">
          <TabList gap={2} flexWrap="wrap" mb={10}>
            <Tab className="neon-tab">⚡ OVERVIEW</Tab>
            {isMember && <Tab className="neon-tab">📢 ANNOUNCEMENTS</Tab>}
            {isMember && <Tab className="neon-tab">💬 COMMUNITY</Tab>}
            <Tab className="neon-tab">👥 MEMBERS</Tab>
            <Tab className="neon-tab">🛡️ TEAMS</Tab>
            <Tab className="neon-tab">🏆 COMPETITIONS</Tab>
            <Tab className="neon-tab">📊 STATS</Tab>
            {hasLeadership && <Tab className="neon-tab">⚙️ MANAGE</Tab>}
          </TabList>

          <TabPanels>
            {/* Overview */}
            <TabPanel px={0}>
              <Grid templateColumns={{ base:'1fr', lg:'2fr 1fr' }} gap={8}>
                <Stack spacing={6}>
                  <Box className="neon-glass" p={7}>
                    <Heading fontSize="lg" fontWeight="700" fontFamily="'Orbitron', sans-serif"
                      className="neon-text" mb={4}>
                      ABOUT CLAN
                    </Heading>
                    <Text fontSize="sm" lineHeight="1.8" style={{ color:N.muted }}>
                      {clan.description || 'No description.'}
                    </Text>
                  </Box>

                  <Box className="neon-glass" p={7}>
                    <Heading fontSize="lg" fontWeight="700" fontFamily="'Orbitron', sans-serif"
                      className="neon-text" mb={5}>
                      🏆 RECENT BATTLES
                    </Heading>
                    <Stack spacing={4}>
                      {competitions && competitions.length > 0 ? (
                        competitions.slice(0,3).map(c => <CompHolo key={c.id} comp={c} navigate={navigate} />)
                      ) : (
                        <Text fontSize="sm" textAlign="center" py={8} style={{ color:N.dim }}>
                          No competitions yet
                        </Text>
                      )}
                    </Stack>
                  </Box>
                </Stack>

                <Stack spacing={6}>
                  <Box className="neon-glass" p={6}>
                    <Heading fontSize="md" fontWeight="700" fontFamily="'Orbitron', sans-serif"
                      className="neon-text" mb={5}>
                      TOP WARRIORS
                    </Heading>
                    <VStack spacing={3} align="stretch">
                      {stats?.topMembers?.slice(0,5).map((m, i) => (
                        <HStack key={i} spacing={3} px={4} py={3} borderRadius="12px"
                          cursor="pointer"
                          onClick={() => navigate(`/profile/${m.userId}`)}
                          style={{ background: i === 0 ? `${N.orange}11` : 'transparent',
                            border: i === 0 ? `1px solid ${N.orange}44` : '1px solid transparent' }}
                          _hover={{ background:`${N.cyan}11`, borderColor:`${N.cyan}44` }}
                          transition="all 0.3s">
                          <Text fontSize="sm" fontWeight="900" fontFamily="'Orbitron', sans-serif"
                            w="24px" textAlign="center"
                            style={{ color: i === 0 ? N.orange : N.dim }}>
                            {i + 1}
                          </Text>
                          <Text fontSize="sm" fontWeight="600" flex={1} style={{ color:N.text }}>
                            {m.userName}
                          </Text>
                          <Text fontSize="sm" fontWeight="800" fontFamily="'Orbitron', sans-serif"
                            style={{ color:N.cyan, textShadow:`0 0 8px ${N.cyan}` }}>
                            {m.contributionPoints?.toLocaleString()}
                          </Text>
                          {i === 0 && <Icon as={FaCrown} style={{ color:N.orange }} />}
                        </HStack>
                      ))}
                    </VStack>
                  </Box>

                  <Box className="neon-glass" p={6}>
                    <Heading fontSize="md" fontWeight="700" fontFamily="'Orbitron', sans-serif"
                      className="neon-text" mb={5}>
                      CLAN INFO
                    </Heading>
                    <Stack spacing={3}>
                      {[
                        { label:'LEADER', value:clan.leaderName },
                        { label:'CREATED', value:new Date(clan.createdAt).toLocaleDateString() },
                        { label:'CAPACITY', value:clan.maxMembers },
                      ].map((d,i) => (
                        <HStack key={i} justify="space-between" px={4} py={3} borderRadius="10px"
                          style={{ background:`${N.cyan}05`, border:`1px solid ${N.cyan}22` }}>
                          <Text fontSize="10px" fontWeight="700" letterSpacing="0.1em"
                            style={{ color:N.dim }}>
                            {d.label}
                          </Text>
                          <Text fontSize="sm" fontWeight="600" style={{ color:N.text }}>
                            {d.value}
                          </Text>
                        </HStack>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
            </TabPanel>

            {/* Teams */}
            <TabPanel px={0}>
              <TeamsPage clanId={clanId} clan={clan} currentUser={user} />
            </TabPanel>

            {isMember && (
              <TabPanel px={0}>
                <ClanAnnouncements userRole={userRole} />
              </TabPanel>
            )}

            {isMember && (
              <TabPanel px={0}>
                <ClanCommunity />
              </TabPanel>
            )}

            <TabPanel px={0}>
              {membersLoading ? (
                <SimpleGrid columns={{ base:1, md:2, lg:3 }} spacing={5}>
                  {[...Array(6)].map((_,i) => (
                    <Skeleton key={i} h="160px" borderRadius="16px" startColor={N.space} endColor={N.deep} />
                  ))}
                </SimpleGrid>
              ) : members && members.length > 0 ? (
                <SimpleGrid columns={{ base:1, md:2, lg:3 }} spacing={5}>
                  {members.map(m => <HoloMember key={m.userId} member={m} navigate={navigate} />)}
                </SimpleGrid>
              ) : (
                <Box py={20} textAlign="center">
                  <Text fontSize="64px" mb={2}>👥</Text>
                  <Text style={{ color:N.dim }}>No members</Text>
                </Box>
              )}
            </TabPanel>

            <TabPanel px={0}>
              {competitionsLoading ? (
                <SimpleGrid columns={{ base:1, md:2 }} spacing={5}>
                  {[...Array(4)].map((_,i) => (
                    <Skeleton key={i} h="140px" borderRadius="16px" startColor={N.space} endColor={N.deep} />
                  ))}
                </SimpleGrid>
              ) : competitions && competitions.length > 0 ? (
                <SimpleGrid columns={{ base:1, md:2 }} spacing={5}>
                  {competitions.map(c => <CompHolo key={c.id} comp={c} navigate={navigate} />)}
                </SimpleGrid>
              ) : (
                <Box py={20} textAlign="center">
                  <Text fontSize="64px" mb={2}>🏆</Text>
                  <Text style={{ color:N.dim }}>No competitions</Text>
                </Box>
              )}
            </TabPanel>

            <TabPanel px={0}>
              <Stack spacing={6}>
                <Box className="neon-glass" p={7}>
                  <Heading fontSize="lg" fontWeight="700" fontFamily="'Orbitron', sans-serif"
                    className="neon-text" mb={6}>
                    PERFORMANCE
                  </Heading>
                  <SimpleGrid columns={{ base:1, md:3 }} spacing={5}>
                    {[
                      { label:'WIN RATE', value:stats?.winRate ? `${(stats.winRate*100).toFixed(1)}%` : '0%', color:N.cyan },
                      { label:'WEEKLY', value:stats?.weeklyPoints?.toLocaleString() || '0', color:N.magenta },
                      { label:'MONTHLY', value:stats?.monthlyPoints?.toLocaleString() || '0', color:N.violet },
                    ].map((s,i) => (
                      <VStack key={i} spacing={2} px={5} py={4} borderRadius="14px"
                        style={{ background:`${s.color}11`, border:`1px solid ${s.color}33` }}>
                        <Text fontSize="9px" fontWeight="700" letterSpacing="0.15em"
                          style={{ color:N.dim }}>
                          {s.label}
                        </Text>
                        <Text fontSize="3xl" fontWeight="900" fontFamily="'Orbitron', sans-serif"
                          style={{ color:s.color, textShadow:`0 0 15px ${s.color}` }}>
                          {s.value}
                        </Text>
                      </VStack>
                    ))}
                  </SimpleGrid>
                </Box>

                {stats?.memberRoleDistribution && (
                  <Box className="neon-glass" p={7}>
                    <Heading fontSize="lg" fontWeight="700" fontFamily="'Orbitron', sans-serif"
                      className="neon-text" mb={6}>
                      ROLE DISTRIBUTION
                    </Heading>
                    <Stack spacing={4}>
                      {Object.entries(stats.memberRoleDistribution).map(([role, count]) => (
                        <HStack key={role} justify="space-between">
                          <Text fontSize="sm" fontWeight="600" style={{ color:N.muted }}>
                            {role}
                          </Text>
                          <HStack spacing={3} flex={1} maxW="400px">
                            <Progress value={(count/clan.memberCount)*100} flex={1}
                              borderRadius="full" h="6px" bg={N.deep}
                              sx={{ '& > div': { background:`linear-gradient(90deg, ${N.cyan}, ${N.magenta})` } }} />
                            <Text fontSize="sm" fontWeight="800" fontFamily="'Orbitron', sans-serif"
                              style={{ color:N.cyan, minWidth:'30px', textAlign:'right' }}>
                              {count}
                            </Text>
                          </HStack>
                        </HStack>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </TabPanel>

            {hasLeadership && (
              <TabPanel px={0}>
                <Stack spacing={6}>
                  {isLeaderOrCoLeader && (
                    <Box className="neon-glass" p={7}>
                      <HStack justify="space-between" mb={6}>
                        <Heading fontSize="lg" fontWeight="700" fontFamily="'Orbitron', sans-serif"
                          className="neon-text">
                          PRIVACY
                        </Heading>
                        <Button size="sm" borderRadius="full" fontWeight="700" color="#000" px={6}
                          style={{ background:`linear-gradient(135deg, ${N.cyan}, ${N.magenta})`,
                            boxShadow:`0 0 20px ${N.cyan}66` }}
                          _hover={{ boxShadow:`0 0 40px ${N.cyan}` }}
                          onClick={openPrivacy}>
                          EDIT
                        </Button>
                      </HStack>
                      <Stack spacing={3}>
                        <HStack justify="space-between" px={4} py={3} borderRadius="10px"
                          style={{ background:`${N.cyan}05`, border:`1px solid ${N.cyan}22` }}>
                          <Text fontSize="xs" style={{ color:N.muted }}>Visibility</Text>
                          <Text fontSize="sm" fontWeight="700"
                            style={{ color: clan.isPublic ? N.lime : N.orange }}>
                            {clan.isPublic ? 'PUBLIC' : 'PRIVATE'}
                          </Text>
                        </HStack>
                      </Stack>
                    </Box>
                  )}

                  {isLeaderOrCoLeader && (
                    <Box className="neon-glass" p={7}>
                      <HStack justify="space-between" mb={6}>
                        <Heading fontSize="lg" fontWeight="700" fontFamily="'Orbitron', sans-serif"
                          className="neon-text">
                          PENDING REQUESTS
                        </Heading>
                        <Badge px={3} py={1} borderRadius="full" fontSize="10px" fontWeight="700"
                          style={{ background:N.cyanSoft, color:N.cyan }}>
                          {pendingRequests?.length || 0}
                        </Badge>
                      </HStack>
                      <Stack spacing={4}>
                        {pendingRequests && pendingRequests.length > 0 ? (
                          pendingRequests.map(req => {
                            const isProcessing = decideJoinRequestMutation.isLoading
                              && decideJoinRequestMutation.variables?.requestId === req.id;
                            return (
                              <Box key={req.id} className="neon-glass" p={5}>
                                <Stack spacing={4}>
                                  <HStack spacing={3}>
                                    <Avatar src={req.avatarUrl} name={req.userName} size="md"
                                      style={{ border:`2px solid ${N.cyan}` }}
                                      cursor="pointer"
                                      onClick={() => navigate(`/profile/${req.userId}`)} />
                                    <VStack spacing={0} align="flex-start" flex={1}>
                                      <Text fontWeight="700" style={{ color:N.text }}>
                                        {req.userName}
                                      </Text>
                                      <Text fontSize="xs" style={{ color:N.dim }}>
                                        {new Date(req.requestedAt).toLocaleDateString()}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                  <HStack spacing={3}>
                                    <Button size="sm" flex={1} borderRadius="full" fontWeight="700" color="#000"
                                      style={{ background:`linear-gradient(135deg, ${N.lime}, ${N.cyan})` }}
                                      _hover={{ boxShadow:`0 0 20px ${N.lime}` }}
                                      isLoading={isProcessing}
                                      onClick={() => handleJoinRequestDecision(req.id, 'approve')}>
                                      ✓ ACCEPT
                                    </Button>
                                    <Button size="sm" flex={1} borderRadius="full" fontWeight="700"
                                      bg="transparent" style={{ border:`2px solid #ef4444`, color:'#ef4444' }}
                                      _hover={{ bg:'rgba(239,68,68,0.1)' }}
                                      isLoading={isProcessing}
                                      onClick={() => handleJoinRequestDecision(req.id, 'reject')}>
                                      ✕ REJECT
                                    </Button>
                                  </HStack>
                                </Stack>
                              </Box>
                            );
                          })
                        ) : (
                          <Text fontSize="sm" textAlign="center" py={8} style={{ color:N.dim }}>
                            No pending requests
                          </Text>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Container>

      <Modal isOpen={isPrivacyOpen} onClose={closePrivacy} size="lg">
        <ModalOverlay bg="rgba(0,0,0,0.8)" backdropFilter="blur(10px)" />
        <ModalContent bg={N.deep} border={`2px solid ${N.cyan}`} borderRadius="24px"
          style={{ boxShadow:`0 0 60px ${N.cyan}66` }}>
          <ModalHeader fontFamily="'Orbitron', sans-serif" className="neon-text">
            PRIVACY SETTINGS
          </ModalHeader>
          <ModalCloseButton style={{ color:N.text }} />
          <ModalBody pb={6}>
            <Stack spacing={6}>
              <FormControl display="flex" alignItems="center" justifyContent="space-between"
                px={5} py={4} borderRadius="14px"
                style={{ background:N.cyanSoft, border:`1px solid ${N.cyan}33` }}>
                <FormLabel htmlFor="public" mb={0} fontWeight="700" style={{ color:N.text }}>
                  PUBLIC CLAN
                </FormLabel>
                <Switch id="public" size="lg" colorScheme="cyan"
                  isChecked={privacyIsPublic}
                  onChange={(e) => setPrivacyIsPublic(e.target.checked)} />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between"
                px={5} py={4} borderRadius="14px"
                style={{ background:N.cyanSoft, border:`1px solid ${N.cyan}33` }}>
                <FormLabel htmlFor="approval" mb={0} fontWeight="700" style={{ color:N.text }}>
                  REQUIRE APPROVAL
                </FormLabel>
                <Switch id="approval" size="lg" colorScheme="cyan"
                  isChecked={privacyRequireApproval}
                  onChange={(e) => setPrivacyRequireApproval(e.target.checked)} />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="700" fontSize="sm" style={{ color:N.text }}>
                  JOIN CRITERIA
                </FormLabel>
                <Input
                  value={privacyJoinCriteria}
                  onChange={(e) => setPrivacyJoinCriteria(e.target.value)}
                  placeholder="e.g. Min rank, points..."
                  size="lg"
                  borderRadius="14px"
                  bg={N.space}
                  borderColor={N.cyan+'44'}
                  style={{ color:N.text }}
                  _placeholder={{ color:N.dim }}
                  _focus={{ borderColor:N.cyan, boxShadow:`0 0 0 1px ${N.cyan}` }}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3} w="100%">
              <Button flex={1} borderRadius="full" fontWeight="700" onClick={closePrivacy}
                bg="transparent" style={{ border:`2px solid ${N.dim}`, color:N.dim }}
                _hover={{ borderColor:N.text, color:N.text }}>
                CANCEL
              </Button>
              <Button flex={1} borderRadius="full" fontWeight="700" color="#000"
                style={{ background:`linear-gradient(135deg, ${N.cyan}, ${N.magenta})`,
                  boxShadow:`0 0 30px ${N.cyan}66` }}
                _hover={{ boxShadow:`0 0 50px ${N.cyan}` }}
                onClick={handleSavePrivacy}
                isLoading={privacyMutation.isLoading}>
                SAVE
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ClanDetail;