import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Button,
  useDisclosure,
  Text,
  VStack,
  Heading,
  HStack,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { AddIcon, ChatIcon, StarIcon, ViewIcon } from '@chakra-ui/icons';
import { FaUsers, FaFire, FaChartLine } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import CreatePost from './CreatePost';
import PostList from './PostList';
import Forum from './Forum';
import CosmicBg from '../../components/CosmicBg';

// ── Glassmorphism stat card ────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, gradientFrom, gradientTo }) => (
  <Box
    flexShrink={0}
    minW="180px"
    p={5}
    borderRadius="2xl"
    bg="rgba(255,255,255,0.04)"
    border="1px solid"
    borderColor="whiteAlpha.100"
    backdropFilter="blur(10px)"
    boxShadow="0 4px 24px rgba(0,0,0,0.2)"
    transition="transform 0.2s ease, box-shadow 0.2s ease"
    _hover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
  >
    <HStack spacing={4} align="center">
      <Box
        p={3}
        borderRadius="xl"
        bgGradient={`linear(to-br, ${gradientFrom}, ${gradientTo})`}
        boxShadow={`0 4px 14px ${color}55`}
      >
        <Icon as={icon} boxSize={5} color="white" />
      </Box>
      <Box>
        <Text fontSize="xs" color="whiteAlpha.500" fontWeight="medium" letterSpacing="wide" textTransform="uppercase">
          {label}
        </Text>
        <Text fontSize="2xl" fontWeight="extrabold" color="white" lineHeight="1.2">
          {value}
        </Text>
      </Box>
    </HStack>
  </Box>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const CommunityPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [, setActiveTab] = useState(0);

  // ── Data fetching ──────────────────────────────────────────────────────
  // BUG FIX: Two separate queries were fetching pageSize:10000 unnecessarily.
  // Merged into one shared query for allPostsData; derive count from it.
  const { data: myPostsData } = useQuery({
    queryKey: ['myPostsCount'],
    queryFn: () => communityAPI.getMyPosts(),
    enabled: !!localStorage.getItem('token'),
    select: (response) => {
      const payload = response?.data ?? {};
      if (Array.isArray(payload?.data?.posts)) return payload.data.posts.length;
      if (Array.isArray(payload.posts)) return payload.posts.length;
      if (Array.isArray(payload.data)) return payload.data.length;
      if (Array.isArray(payload)) return payload.length;
      return 0;
    },
  });

  const { data: allPostsData } = useQuery({
    queryKey: ['allPostsData'],
    queryFn: () => communityAPI.getPublicPosts({ page: 1, pageSize: 10000 }),
    select: (response) => {
      const payload = response?.data ?? {};
      if (Array.isArray(payload?.data?.posts)) return payload.data.posts;
      if (Array.isArray(payload.posts)) return payload.posts;
      if (Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // BUG FIX: was using a separate allPostsCount query — now derived from allPostsData
  const allPostsCount = allPostsData?.length ?? 0;

  const activeMembersCount = useMemo(() => {
    try {
      const posts = allPostsData || [];
      const ids = new Set();
      posts.forEach((p) => {
        const id =
          p?.user?.id ?? p?.userId ?? p?.UserId ??
          p?.createdBy ?? p?.createdById ?? p?.authorId;
        if (id != null) ids.add(String(id));
      });
      return ids.size;
    } catch {
      return 0;
    }
  }, [allPostsData]);

  const formatCount = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  const stats = [
    { icon: FaUsers,     label: 'Active Members', value: formatCount(activeMembersCount), color: '#48BB78', gradientFrom: 'green.400',  gradientTo: 'teal.500'   },
    { icon: FaFire,      label: 'Total Posts',    value: formatCount(allPostsCount),       color: '#ED8936', gradientFrom: 'orange.400', gradientTo: 'red.500'    },
    { icon: FaChartLine, label: 'Active Today',   value: '28',                             color: '#4299E1', gradientFrom: 'blue.400',   gradientTo: 'purple.500' },
  ];

  // Forum posts (admin announcements) count
  const { data: forumPostsData } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => communityAPI.getForumPosts({ page: 1, pageSize: 10000 }),
    select: (response) => {
      const payload = response?.data ?? {};
      if (Array.isArray(payload?.data?.posts)) return payload.data.posts;
      if (Array.isArray(payload.posts)) return payload.posts;
      if (Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const forumCount = forumPostsData?.length ?? 0;

  // ── Tab config ─────────────────────────────────────────────────────────
  const tabs = [
    { icon: ChatIcon,  label: 'All Posts', badge: allPostsCount, badgeColor: 'blue'   },
    { icon: StarIcon,  label: 'My Posts',  badge: myPostsData || 0, badgeColor: 'green'  },
    { icon: ViewIcon,  label: 'Forums',    badge: forumCount || 0, badgeColor: 'purple' },
  ];

  return (
    <Box
      minH="100vh"
      position="relative"
      bg="
        radial-gradient(ellipse 100% 55% at 50% -5%, rgba(79,46,229,0.14) 0%, transparent 55%),
        radial-gradient(ellipse 40% 30% at 95% 85%, rgba(217,119,6,0.06) 0%, transparent 50%),
        #03030d
      "
    >
      <CosmicBg />

      <Container maxW="container.xl" py={10}>
        <VStack spacing={10} align="stretch">

        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <Flex
          justify="space-between"
          align={{ base: 'start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={6}
        >
          <Box>
            {/* Eyebrow label */}
            <HStack mb={3} spacing={2}>
              <Box w={6} h="2px" bg="purple.700" borderRadius="full" />
              <Text fontSize="xs" fontWeight="bold" color="purple.700" letterSpacing="widest" textTransform="uppercase">
                Community Hub
              </Text>
            </HStack>

            <Heading
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="extrabold"
              color="white"
              lineHeight="1.15"
              mb={3}
            >
              Connect &{' '}
              <Box as="span" bgGradient="linear(to-r, purple.700, pink.500)" bgClip="text">
                Grow Together
              </Box>
            </Heading>
            <Text fontSize="md" color="whiteAlpha.500" maxW="lg">
              Share your thoughts, join discussions, and connect with like-minded learners in our vibrant community.
            </Text>
          </Box>

            <Button
              leftIcon={<AddIcon />}
              size="lg"
              px={7}
              py={6}
              borderRadius="xl"
              fontWeight="bold"
              bgGradient="linear(to-r, purple.700, pink.600)"
              color="white"
              boxShadow="0 4px 20px rgba(92,50,160,0.45)"
              _hover={{
                bgGradient: 'linear(to-r, purple.600, pink.500)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 28px rgba(92,50,160,0.55)',
              }}
              transition="all 0.25s"
              onClick={onOpen}
            >
            Create Post
          </Button>
        </Flex>

        {/* ── Stat Cards ──────────────────────────────────────────────── */}
        <HStack
          spacing={4}
          overflowX="auto"
          pb={2}
          sx={{
            '&::-webkit-scrollbar': { height: '4px' },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.15)', borderRadius: '8px' },
          }}
        >
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </HStack>

        {/* ── Create Post Modal ────────────────────────────────────────── */}
        <CreatePost isOpen={isOpen} onClose={onClose} />

        {/* ── Tabs Panel ──────────────────────────────────────────────── */}
        <Box
          borderRadius="2xl"
          overflow="hidden"
          bg="#0d0d26"
          border="1px solid"
          borderColor="rgba(124,58,237,0.16)"
          backdropFilter="blur(12px)"
          boxShadow="0 8px 40px rgba(0,0,0,0.3)"
        >
          <Tabs colorScheme="purple" onChange={setActiveTab} variant="unstyled" isLazy>
            {/* Custom Tab Bar */}
            <Box
              px={6}
              pt={5}
              pb={0}
              borderBottom="1px solid"
              borderColor="rgba(255,255,255,0.05)"
              bg="#0a0a20"
            >
              <TabList gap={2}>
                {tabs.map((tab, i) => (
                  <Tab
                    key={i}
                    py={3}
                    px={5}
                    borderRadius="lg"
                    fontSize="sm"
                    fontWeight="semibold"
                    color="whiteAlpha.500"
                    transition="all 0.2s"
                    _selected={{
                      color: 'white',
                      bg: 'rgba(92,50,160,0.18)',
                      borderBottom: '2px solid',
                      borderColor: 'purple.700',
                      borderRadius: 'lg',
                    }}
                    _hover={{ color: 'whiteAlpha.800', bg: 'whiteAlpha.50' }}
                  >
                    <HStack spacing={2}>
                      <Icon as={tab.icon} boxSize={4} />
                      <Text>{tab.label}</Text>
                      <Badge
                        borderRadius="full"
                        px={2}
                        fontSize="10px"
                        colorScheme={tab.badgeColor}
                        variant="solid"
                        opacity={0.85}
                      >
                        {tab.badge}
                      </Badge>
                    </HStack>
                  </Tab>
                ))}
              </TabList>
            </Box>

            <TabPanels>
              <TabPanel p={0}><PostList type="all" /></TabPanel>
              <TabPanel p={0}><PostList type="my" /></TabPanel>
              <TabPanel p={0}><Forum /></TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* ── Community Guidelines Banner ──────────────────────────────── */}
        <Box
          p={6}
          borderRadius="2xl"
          bgGradient="linear(135deg, rgba(63,15,115,0.35), rgba(180,30,100,0.18))"
          border="1px solid"
          borderColor="purple.800"
          backdropFilter="blur(10px)"
          boxShadow="0 4px 24px rgba(63,15,115,0.25)"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Box
                p={3}
                borderRadius="xl"
                bgGradient="linear(to-br, purple.700, pink.600)"
                boxShadow="0 4px 12px rgba(92,50,160,0.45)"
              >
                <Text fontSize="xl">📋</Text>
              </Box>
              <Box>
                <Heading size="sm" color="white" mb={1}>
                  Community Guidelines
                </Heading>
                <Text color="whiteAlpha.500" fontSize="sm" maxW="lg">
                  Be respectful, stay on topic, and help keep our community a welcoming space for everyone.
                </Text>
              </Box>
            </HStack>
            <Button
              variant="outline"
              size="sm"
              borderRadius="lg"
              borderColor="purple.700"
              color="purple.500"
              _hover={{ bg: 'purple.900', borderColor: 'purple.600' }}
            >
              Learn More
            </Button>
          </Flex>
        </Box>

        </VStack>
      </Container>
    </Box>
  );
};

export default CommunityPage;