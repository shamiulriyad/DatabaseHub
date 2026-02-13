import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Input,
  Button,
  Badge,
  Avatar,
  Image,
  InputGroup,
  InputLeftElement,
  Select,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
  Tooltip,
  Spinner,
  useToast,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from '@chakra-ui/react';
import {
  Search,
  Plus,
  Users,
  TrendingUp,
  Star,
  Lock,
  Globe,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// API Service
const searchClans = async (params) => {
  const queryParams = new URLSearchParams();
  
  if (params.query) queryParams.append('query', params.query);
  if (params.clanType) queryParams.append('clanType', params.clanType);
  if (params.isPublic !== null && params.isPublic !== undefined) {
    queryParams.append('isPublic', params.isPublic);
  }
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.page) queryParams.append('page', params.page);
  if (params.pageSize) queryParams.append('pageSize', params.pageSize);

  const response = await fetch(`/api/clans/search?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Add auth token if needed
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch clans');
  }

  return await response.json();
};

// Skeleton Card for Loading State
const ClanCardSkeleton = () => (
  <Box
    bg="rgba(20, 20, 30, 0.6)"
    backdropFilter="blur(20px)"
    border="1px solid"
    borderColor="rgba(99, 102, 241, 0.15)"
    borderRadius="24px"
    overflow="hidden"
  >
    <Skeleton height="160px" />
    <Box px="24px" mt="-50px" position="relative" zIndex={2}>
      <SkeletonCircle size="100px" />
    </Box>
    <VStack align="stretch" p="20px 24px 24px" spacing={3}>
      <Skeleton height="24px" width="60%" />
      <SkeletonText mt={2} noOfLines={2} spacing={2} />
      <Skeleton height="40px" mt={4} />
    </VStack>
  </Box>
);

// Floating Particle Component
const Particle = ({ delay, duration, left, top }) => (
  <Box
    position="absolute"
    w="2px"
    h="2px"
    bg="rgba(147, 197, 253, 0.6)"
    borderRadius="full"
    left={left}
    top={top}
    animation={`particleFloat ${duration}s linear infinite`}
    sx={{
      animationDelay: delay,
      '@keyframes particleFloat': {
        '0%': {
          transform: 'translateY(0) translateX(0)',
          opacity: 0,
        },
        '10%': {
          opacity: 1,
        },
        '90%': {
          opacity: 1,
        },
        '100%': {
          transform: 'translateY(-100vh) translateX(100px)',
          opacity: 0,
        },
      },
    }}
  />
);

// Clan Card Component
const ClanCard = ({ clan, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      position="relative"
      bg="rgba(20, 20, 30, 0.6)"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="rgba(99, 102, 241, 0.15)"
      borderRadius="24px"
      overflow="hidden"
      cursor="pointer"
      transition="all 0.5s cubic-bezier(0.23, 1, 0.32, 1)"
      animation={`cardFadeIn 0.6s ease-out both`}
      onClick={() => onClick(clan.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _hover={{
        transform: 'translateY(-12px)',
        borderColor: 'rgba(99, 102, 241, 0.4)',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4), 0 0 80px rgba(99, 102, 241, 0.2)',
      }}
      sx={{
        animationDelay: `${index * 0.1}s`,
        '@keyframes cardFadeIn': {
          from: {
            opacity: 0,
            transform: 'translateY(30px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      {/* Banner */}
      <Box position="relative" h="160px" overflow="hidden">
        <Image
          src={clan.bannerUrl || clan.banner || clan.bannerImage || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=300&fit=crop'}
          alt={clan.name}
          w="100%"
          h="100%"
          objectFit="cover"
          transition="transform 0.5s ease"
          transform={isHovered ? 'scale(1.1)' : 'scale(1)'}
          fallbackSrc="https://via.placeholder.com/800x300/1e1e2d/6366f1?text=Clan+Banner"
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-b, transparent, rgba(10, 10, 15, 0.9))"
        />
        
        {/* Rank Badge */}
        {clan.rank && (
          <Badge
            position="absolute"
            top="16px"
            left="16px"
            px="16px"
            py="8px"
            bg="rgba(0, 0, 0, 0.7)"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="rgba(255, 215, 0, 0.3)"
            borderRadius="8px"
            color="gold"
            fontSize="14px"
            fontWeight="700"
          >
            #{clan.rank}
          </Badge>
        )}

        {/* Privacy Badge */}
        <Tooltip label={clan.isPublic ? 'Public Clan' : 'Private Clan'}>
          <Flex
            position="absolute"
            top="16px"
            right="16px"
            w="36px"
            h="36px"
            align="center"
            justify="center"
            bg="rgba(0, 0, 0, 0.7)"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={clan.isPublic ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
            borderRadius="8px"
            color={clan.isPublic ? '#22c55e' : '#ef4444'}
          >
            <Icon as={clan.isPublic ? Globe : Lock} size={14} />
          </Flex>
        </Tooltip>
      </Box>

      {/* Avatar */}
      <Box position="relative" mt="-50px" px="24px" zIndex={2}>
        <Box position="relative" display="inline-block">
          <Avatar
            src={clan.avatar || clan.logoUrl || clan.logo}
            name={clan.name}
            size="xl"
            border="4px solid"
            borderColor="rgba(20, 20, 30, 0.8)"
          />
          {isHovered && (
            <Box
              position="absolute"
              top="-4px"
              left="-4px"
              right="-4px"
              bottom="-4px"
              borderRadius="full"
              bgGradient="linear(135deg, #6366f1, #8b5cf6, #ec4899)"
              zIndex={-1}
              opacity={0.6}
              animation="rotate 3s linear infinite"
              sx={{
                '@keyframes rotate': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Content */}
      <VStack align="stretch" p="20px 24px 24px" spacing={3}>
        {/* Header */}
        <Flex align="center" gap={2} flexWrap="wrap">
          <Heading size="md" color="white" fontWeight="700" noOfLines={1}>
            {clan.name}
          </Heading>
          {clan.tag && (
            <Badge
              px="10px"
              py="4px"
              bg="rgba(99, 102, 241, 0.2)"
              borderRadius="6px"
              color="#a5b4fc"
              fontSize="12px"
              fontWeight="600"
              fontFamily="'Courier New', monospace"
            >
              [{clan.tag}]
            </Badge>
          )}
        </Flex>

        {/* Badges */}
        {clan.badges && clan.badges.length > 0 && (
          <Flex gap={2} flexWrap="wrap">
            {clan.badges.map((badge, i) => (
              <Badge
                key={i}
                px="12px"
                py="4px"
                bgGradient="linear(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))"
                border="1px solid"
                borderColor="rgba(99, 102, 241, 0.3)"
                borderRadius="6px"
                color="#c7d2fe"
                fontSize="11px"
                fontWeight="600"
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                {badge}
              </Badge>
            ))}
          </Flex>
        )}

        {/* Description */}
        <Text color="#94a3b8" fontSize="14px" lineHeight="1.6" minH="44px" noOfLines={2}>
          {clan.description || 'No description available'}
        </Text>

        {/* Stats */}
        <Flex
          gap={5}
          pt={4}
          borderTop="1px solid"
          borderColor="rgba(99, 102, 241, 0.1)"
          flexWrap="wrap"
        >
          <Flex align="center" gap={1.5} color="#94a3b8" fontSize="13px">
            <Icon as={Users} size={16} color="#6366f1" />
            <Text>{clan.memberCount || clan.members || 0}</Text>
          </Flex>
          <Flex align="center" gap={1.5} color="#94a3b8" fontSize="13px">
            <Icon as={TrendingUp} size={16} color="#6366f1" />
            <Text>{(clan.totalPoints || clan.points || 0).toLocaleString()} pts</Text>
          </Flex>
          {clan.rating && (
            <Flex align="center" gap={1.5} color="#94a3b8" fontSize="13px">
              <Icon as={Star} size={16} color="#fbbf24" />
              <Text>{clan.rating}</Text>
            </Flex>
          )}
        </Flex>

        {/* Join Button */}
        <Button
          w="100%"
          mt={2}
          bg="rgba(99, 102, 241, 0.1)"
          border="1px solid"
          borderColor="rgba(99, 102, 241, 0.3)"
          borderRadius="12px"
          color="#a5b4fc"
          fontSize="15px"
          fontWeight="600"
          position="relative"
          overflow="hidden"
          _hover={{
            bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))',
            borderColor: 'rgba(99, 102, 241, 0.5)',
            color: 'white',
            transform: 'translateY(-2px)',
          }}
        >
          View Clan
        </Button>
      </VStack>
    </Box>
  );
};

// Main Component
const ClanListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [clanType, setClanType] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build query params
  const queryParams = {
    query: debouncedSearch,
    clanType: clanType || undefined,
    isPublic: privacyFilter === 'public' ? true : privacyFilter === 'private' ? false : undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    pageSize,
  };

  // React Query for data fetching
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['clans', queryParams],
    queryFn: () => searchClans(queryParams),
    keepPreviousData: true,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Generate random particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: 15 + Math.random() * 10,
  }));

  const quickFilters = ['All', 'Top Rated', 'Most Active', 'Newest'];

  // Handle quick filter clicks
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);

    switch (filter) {
      case 'Top Rated':
        setSortBy('rating');
        setSortOrder('desc');
        break;
      case 'Most Active':
        setSortBy('memberCount');
        setSortOrder('desc');
        break;
      case 'Newest':
        setSortBy('createdAt');
        setSortOrder('desc');
        break;
      default:
        setSortBy('rank');
        setSortOrder('asc');
    }
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle clan type filter
  const handleClanTypeChange = (e) => {
    setClanType(e.target.value);
    setCurrentPage(1);
  };

  // Handle privacy filter
  const handlePrivacyChange = (e) => {
    setPrivacyFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setCurrentPage(1);

    switch (value) {
      case 'rank':
        setSortBy('rank');
        setSortOrder('asc');
        break;
      case 'members':
        setSortBy('memberCount');
        setSortOrder('desc');
        break;
      case 'points':
        setSortBy('totalPoints');
        setSortOrder('desc');
        break;
      case 'rating':
        setSortBy('rating');
        setSortOrder('desc');
        break;
      default:
        setSortBy('rank');
        setSortOrder('asc');
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to create clan page
  const handleCreateClan = () => {
    navigate('/clans/create');
  };

  // Navigate to clan detail
  const handleClanClick = (clanId) => {
    navigate(`/clans/${clanId}`);
  };

  // Get clans from response
  const clans = data?.clans || [];
  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 1;

  // Show error toast
  React.useEffect(() => {
    if (isError) {
      toast({
        title: 'Error loading clans',
        description: error?.message || 'Failed to fetch clans',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isError, error, toast]);

  return (
    <Box minH="100vh" bg="#0a0a0f" color="white" position="relative" overflow="hidden">
      {/* Background Effects */}
      <Box position="fixed" top={0} left={0} w="100%" h="100%" pointerEvents="none" zIndex={0}>
        {/* Gradient Orbs */}
        <Box
          position="absolute"
          w="600px"
          h="600px"
          top="-200px"
          left="-200px"
          borderRadius="50%"
          filter="blur(120px)"
          opacity={0.4}
          bg="radial-gradient(circle, #6366f1, transparent)"
          animation="float 20s infinite ease-in-out"
          sx={{
            '@keyframes float': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '33%': { transform: 'translate(50px, -50px) scale(1.1)' },
              '66%': { transform: 'translate(-50px, 50px) scale(0.9)' },
            },
          }}
        />
        <Box
          position="absolute"
          w="500px"
          h="500px"
          bottom="-150px"
          right="-150px"
          borderRadius="50%"
          filter="blur(120px)"
          opacity={0.4}
          bg="radial-gradient(circle, #8b5cf6, transparent)"
          animation="float 20s infinite ease-in-out 7s"
        />
        <Box
          position="absolute"
          w="400px"
          h="400px"
          top="50%"
          right="20%"
          borderRadius="50%"
          filter="blur(120px)"
          opacity={0.4}
          bg="radial-gradient(circle, #ec4899, transparent)"
          animation="float 20s infinite ease-in-out 14s"
        />

        {/* Particles */}
        {particles.map((particle) => (
          <Particle key={particle.id} {...particle} />
        ))}
      </Box>

      {/* Hero Section */}
      <Box position="relative" zIndex={1} pt="120px" pb="80px" textAlign="center">
        <Container maxW="container.lg">
          <VStack spacing={6} animation="fadeInUp 1s ease-out">
            {/* Badge */}
            <Flex
              align="center"
              gap={2}
              px={5}
              py={2}
              bg="rgba(99, 102, 241, 0.1)"
              border="1px solid"
              borderColor="rgba(99, 102, 241, 0.3)"
              borderRadius="50px"
              color="#a5b4fc"
              fontSize="14px"
              fontWeight="500"
              animation="float 3s ease-in-out infinite"
            >
              <Icon as={Sparkles} size={16} />
              <Text>Discover Your Tribe</Text>
            </Flex>

            {/* Title */}
            <Heading
              fontSize={{ base: '48px', md: '60px', lg: '76px' }}
              fontWeight="800"
              lineHeight="1.1"
              letterSpacing="-0.02em"
            >
              Find Your Learning{' '}
              <Text
                as="span"
                bgGradient="linear(135deg, #6366f1, #8b5cf6, #ec4899)"
                bgClip="text"
                animation="gradient-shift 8s ease infinite"
                sx={{
                  backgroundSize: '200% 200%',
                  '@keyframes gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                  },
                }}
              >
                Clan
              </Text>
            </Heading>

            {/* Subtitle */}
            <Text fontSize="20px" color="#94a3b8" maxW="600px">
              Join forces with like-minded learners and achieve mastery together
            </Text>

            {/* CTA Button */}
            <Button
              size="lg"
              leftIcon={<Icon as={Plus} />}
              bgGradient="linear(135deg, #6366f1, #8b5cf6)"
              color="white"
              px={10}
              py={6}
              fontSize="16px"
              fontWeight="600"
              borderRadius="12px"
              onClick={handleCreateClan}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)',
              }}
              transition="all 0.3s ease"
            >
              Create Clan
            </Button>
          </VStack>

          {/* Decorative Rings */}
          <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" pointerEvents="none">
            {[400, 600, 800].map((size, i) => (
              <Box
                key={i}
                position="absolute"
                w={`${size}px`}
                h={`${size}px`}
                border="2px solid"
                borderColor="rgba(99, 102, 241, 0.2)"
                borderRadius="50%"
                animation={`ringPulse 8s ease-in-out infinite ${i * 2.5}s`}
                sx={{
                  '@keyframes ringPulse': {
                    '0%, 100%': {
                      transform: 'translate(-50%, -50%) scale(1)',
                      opacity: 0.2,
                    },
                    '50%': {
                      transform: 'translate(-50%, -50%) scale(1.1)',
                      opacity: 0.05,
                    },
                  },
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Search & Filters Section */}
      <Box position="relative" zIndex={1} py={10}>
        <Container maxW="container.xl">
          <VStack spacing={8}>
            {/* Search Bar */}
            <Box w="100%" maxW="700px" mx="auto">
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={Search} color="#64748b" />
                </InputLeftElement>
                <Input
                  placeholder="Search clans by name, tag, or description..."
                  value={searchTerm}
                  onChange={handleSearch}
                  bg="rgba(30, 30, 45, 0.6)"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="rgba(99, 102, 241, 0.2)"
                  borderRadius="16px"
                  color="white"
                  fontSize="16px"
                  h="56px"
                  pl="56px"
                  _placeholder={{ color: '#64748b' }}
                  _focus={{
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                    boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1), 0 8px 24px rgba(0, 0, 0, 0.2)',
                  }}
                />
              </InputGroup>
            </Box>

            {/* Quick Filters */}
            <Flex gap={3} flexWrap="wrap" justify="center">
              {quickFilters.map((filter) => (
                <Button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  bg={activeFilter === filter ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))' : 'rgba(30, 30, 45, 0.5)'}
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor={activeFilter === filter ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.2)'}
                  borderRadius="12px"
                  color={activeFilter === filter ? 'white' : '#94a3b8'}
                  fontSize="14px"
                  fontWeight="500"
                  px={7}
                  _hover={{
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-2px)',
                  }}
                >
                  {filter}
                </Button>
              ))}
            </Flex>

            {/* Advanced Filters */}
            <Flex gap={3} flexWrap="wrap" justify="center">
              <Select
                maxW="200px"
                bg="rgba(30, 30, 45, 0.5)"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="rgba(99, 102, 241, 0.2)"
                borderRadius="12px"
                color="#94a3b8"
                fontSize="14px"
                value={clanType}
                onChange={handleClanTypeChange}
                _hover={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
              >
                <option value="" style={{ background: '#1e1e2d' }}>All Types</option>
                <option value="study" style={{ background: '#1e1e2d' }}>Study Groups</option>
                <option value="project" style={{ background: '#1e1e2d' }}>Project Teams</option>
                <option value="mentorship" style={{ background: '#1e1e2d' }}>Mentorship</option>
                <option value="competition" style={{ background: '#1e1e2d' }}>Competition</option>
              </Select>
              <Select
                maxW="200px"
                bg="rgba(30, 30, 45, 0.5)"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="rgba(99, 102, 241, 0.2)"
                borderRadius="12px"
                color="#94a3b8"
                fontSize="14px"
                value={privacyFilter}
                onChange={handlePrivacyChange}
                _hover={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
              >
                <option value="" style={{ background: '#1e1e2d' }}>Public & Private</option>
                <option value="public" style={{ background: '#1e1e2d' }}>Public Only</option>
                <option value="private" style={{ background: '#1e1e2d' }}>Private Only</option>
              </Select>
              <Select
                maxW="200px"
                bg="rgba(30, 30, 45, 0.5)"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="rgba(99, 102, 241, 0.2)"
                borderRadius="12px"
                color="#94a3b8"
                fontSize="14px"
                onChange={handleSortChange}
                _hover={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}
              >
                <option value="rank" style={{ background: '#1e1e2d' }}>Sort: Rank</option>
                <option value="members" style={{ background: '#1e1e2d' }}>Sort: Members</option>
                <option value="points" style={{ background: '#1e1e2d' }}>Sort: Points</option>
                <option value="rating" style={{ background: '#1e1e2d' }}>Sort: Rating</option>
              </Select>
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* Clans Grid */}
      <Box position="relative" zIndex={1} py={10} pb={20}>
        <Container maxW="container.xl">
          {/* Loading State with Skeletons */}
          {isLoading && (
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
              gap={8}
              mb={16}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <ClanCardSkeleton key={i} />
              ))}
            </Grid>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <Flex justify="center" align="center" minH="400px">
              <VStack spacing={4}>
                <Text color="#ef4444" fontSize="18px" fontWeight="600">
                  Failed to load clans
                </Text>
                <Text color="#94a3b8" fontSize="14px">
                  {error?.message || 'An error occurred'}
                </Text>
                <Button
                  onClick={() => refetch()}
                  bg="rgba(99, 102, 241, 0.1)"
                  border="1px solid"
                  borderColor="rgba(99, 102, 241, 0.3)"
                  color="#a5b4fc"
                  _hover={{
                    bg: 'rgba(99, 102, 241, 0.2)',
                  }}
                >
                  Try Again
                </Button>
              </VStack>
            </Flex>
          )}

          {/* Empty State */}
          {!isLoading && !isError && clans.length === 0 && (
            <Flex justify="center" align="center" minH="400px">
              <VStack spacing={4}>
                <Text color="#94a3b8" fontSize="18px" fontWeight="600">
                  No clans found
                </Text>
                <Text color="#64748b" fontSize="14px">
                  Try adjusting your search or filters
                </Text>
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm('')}
                    size="sm"
                    bg="rgba(99, 102, 241, 0.1)"
                    border="1px solid"
                    borderColor="rgba(99, 102, 241, 0.3)"
                    color="#a5b4fc"
                  >
                    Clear Search
                  </Button>
                )}
              </VStack>
            </Flex>
          )}

          {/* Clans Grid */}
          {!isLoading && !isError && clans.length > 0 && (
            <>
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
                gap={8}
                mb={16}
              >
                {clans.map((clan, index) => (
                  <ClanCard
                    key={clan.id}
                    clan={clan}
                    index={index}
                    onClick={handleClanClick}
                  />
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Flex align="center" justify="center" gap={4}>
                  <Button
                    w="44px"
                    h="44px"
                    minW="44px"
                    bg="rgba(30, 30, 45, 0.5)"
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor="rgba(99, 102, 241, 0.2)"
                    borderRadius="12px"
                    color="#94a3b8"
                    isDisabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    _hover={{
                      borderColor: 'rgba(99, 102, 241, 0.5)',
                      transform: 'translateY(-2px)',
                    }}
                    _disabled={{
                      opacity: 0.4,
                      cursor: 'not-allowed',
                    }}
                  >
                    <Icon as={ChevronLeft} />
                  </Button>

                  <Flex gap={2}>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }

                      return (
                        <Box
                          key={page}
                          w={page === currentPage ? '32px' : '10px'}
                          h="10px"
                          bg={page === currentPage ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99, 102, 241, 0.3)'}
                          borderRadius={page === currentPage ? '5px' : 'full'}
                          cursor="pointer"
                          transition="all 0.3s ease"
                          onClick={() => handlePageChange(page)}
                          _hover={{
                            bg: page === currentPage ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99, 102, 241, 0.5)',
                            transform: 'scale(1.2)',
                          }}
                        />
                      );
                    })}
                  </Flex>

                  <Button
                    w="44px"
                    h="44px"
                    minW="44px"
                    bg="rgba(30, 30, 45, 0.5)"
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor="rgba(99, 102, 241, 0.2)"
                    borderRadius="12px"
                    color="#94a3b8"
                    isDisabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    _hover={{
                      borderColor: 'rgba(99, 102, 241, 0.5)',
                      transform: 'translateY(-2px)',
                    }}
                    _disabled={{
                      opacity: 0.4,
                      cursor: 'not-allowed',
                    }}
                  >
                    <Icon as={ChevronRight} />
                  </Button>
                </Flex>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ClanListPage;