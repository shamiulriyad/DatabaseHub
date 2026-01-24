import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
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
  ScaleFade,
  Select,
  Grid,
  GridItem,
  Divider,
  Flex,
  IconButton,
  Tag,
  useBreakpointValue,
  AspectRatio,
  Tooltip,
} from '@chakra-ui/react';
import {
  FaUsers,
  FaTrophy,
  FaSearch,
  FaPlus,
  FaFire,
  FaShieldAlt,
  FaCrown,
  FaFilter,
  FaGlobe,
  FaLock,
  FaStar,
  FaChartLine,
  FaHashtag,
} from 'react-icons/fa';
import { FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';
import { MdPublic, MdLock } from 'react-icons/md';

const fetchClans = async ({ queryKey }) => {
  const [, filters] = queryKey;
  const params = new URLSearchParams();
  
  if (filters.query) params.append('query', filters.query);
  if (filters.clanType) params.append('clanType', filters.clanType);
  if (filters.isPublic !== '') params.append('isPublic', filters.isPublic);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  params.append('sortOrder', 'desc');
  params.append('page', filters.page || 1);
  params.append('pageSize', 20);

  const { data } = await api.get(`/clans/search?${params.toString()}`);
  return data?.clans || [];
};

const ClanCard = ({ clan }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const bannerBg = useColorModeValue('gray.100', 'gray.700');
  const bannerIconColor = useColorModeValue('gray.400', 'gray.500');
  const logoBg = useColorModeValue('gray.100', 'gray.700');
  const navigate = useNavigate();

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      shadow="sm"
      _hover={{ 
        shadow: 'md', 
        borderColor: useColorModeValue('purple.300', 'purple.500'),
        transform: 'translateY(-2px)'
      }}
      transition="all 0.2s ease"
      cursor="pointer"
      overflow="hidden"
      onClick={() => navigate(`/clans/${clan.id}`)}
      h="100%"
    >
      {/* Banner */}
      <AspectRatio ratio={16/9} position="relative" overflow="hidden">
        <Box position="relative" w="100%" h="100%">
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
              bg={bannerBg}
              w="100%"
              h="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FaShieldAlt} boxSize={8} color={bannerIconColor} />
            </Box>
          )}

          {/* Rank Badge */}
          {clan.rank && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme="yellow"
              fontSize="xs"
              py={1}
              px={2}
              borderRadius="md"
              shadow="sm"
            >
              <HStack spacing={1}>
                <Icon as={FaTrophy} />
                <Text fontWeight="bold">#{clan.rank}</Text>
              </HStack>
            </Badge>
          )}
        </Box>
      </AspectRatio>

      <CardBody p={4}>
        <Stack spacing={3}>
          {/* Logo and Name */}
          <HStack spacing={3} align="start">
            {clan.logoUrl ? (
              <Image
                src={clan.logoUrl}
                alt={clan.name}
                boxSize="48px"
                borderRadius="md"
                border="1px solid"
                borderColor={borderColor}
              />
            ) : (
              <Box
                boxSize="48px"
                borderRadius="md"
                bg={logoBg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px solid"
                borderColor={borderColor}
              >
                <Icon as={FaShieldAlt} boxSize={5} color={secondaryTextColor} />
              </Box>
            )}
            
            <VStack align="start" spacing={1} flex={1}>
              <HStack>
                <Heading size="sm" fontWeight="semibold" color={textColor}>
                  {clan.name}
                </Heading>
                {!clan.isPublic && (
                  <Tooltip label="Private Clan">
                    <Icon as={MdLock} color="yellow.500" boxSize={3} />
                  </Tooltip>
                )}
              </HStack>
              <Badge
                colorScheme="gray"
                variant="subtle"
                fontSize="xs"
                fontWeight="normal"
              >
                [{clan.tag}]
              </Badge>
            </VStack>
          </HStack>

          {/* Description */}
          <Text
            fontSize="sm"
            color={secondaryTextColor}
            noOfLines={2}
            lineHeight="short"
          >
            {clan.description || 'No description provided'}
          </Text>

          {/* Stats */}
          <HStack spacing={4} fontSize="sm">
            <HStack spacing={1.5}>
              <Icon as={FiUsers} color="purple.500" boxSize={3.5} />
              <Text fontWeight="medium" color={textColor}>
                {clan.memberCount}
              </Text>
              <Text color={secondaryTextColor} fontSize="xs">
                members
              </Text>
            </HStack>
            <HStack spacing={1.5}>
              <Icon as={FiAward} color="yellow.500" boxSize={3.5} />
              <Text fontWeight="medium" color={textColor}>
                {clan.totalPoints?.toLocaleString() || '0'}
              </Text>
              <Text color={secondaryTextColor} fontSize="xs">
                pts
              </Text>
            </HStack>
          </HStack>

          <Divider borderColor={borderColor} />

          {/* Type and Access */}
          <Flex justify="space-between" fontSize="xs">
            <Badge
              colorScheme="gray"
              variant="subtle"
              borderRadius="sm"
              px={2}
              py={1}
            >
              {clan.clanType}
            </Badge>
            <Badge
              colorScheme={clan.isPublic ? 'green' : 'orange'}
              variant="subtle"
              borderRadius="sm"
              px={2}
              py={1}
            >
              <HStack spacing={1}>
                <Icon as={clan.isPublic ? MdPublic : MdLock} boxSize={2.5} />
                <Text>{clan.isPublic ? 'Public' : 'Private'}</Text>
              </HStack>
            </Badge>
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <Box
      position="relative"
      bg={useColorModeValue('gray.50', 'gray.900')}
      borderBottom="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      py={{ base: 12, md: 16 }}
    >
      <Container maxW="7xl">
        <VStack spacing={6} textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            fontWeight="bold"
            color={useColorModeValue('gray.800', 'white')}
            lineHeight="shorter"
          >
            Find Your Learning Clan
          </Heading>
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            color={useColorModeValue('gray.600', 'gray.300')}
            maxW="2xl"
            lineHeight="tall"
          >
            Join academic clans, collaborate with peers, and achieve learning goals together.
          </Text>
          <Button
            size="lg"
            colorScheme="purple"
            leftIcon={<FaPlus />}
            onClick={() => navigate('/clans/create')}
            shadow="md"
            _hover={{ shadow: 'lg' }}
          >
            Create Clan
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

const ClanList = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  
  const [filters, setFilters] = useState({
    query: '',
    clanType: '',
    isPublic: '',
    sortBy: 'rank',
    page: 1,
  });

  const { data: clans, isLoading } = useQuery({
    queryKey: ['clans', filters],
    queryFn: fetchClans,
  });

  const handleSearchChange = (e) => {
    setFilters({ ...filters, query: e.target.value, page: 1 });
  };

  const handleTypeChange = (e) => {
    setFilters({ ...filters, clanType: e.target.value, page: 1 });
  };

  const handleAccessChange = (e) => {
    setFilters({ ...filters, isPublic: e.target.value, page: 1 });
  };

  const handleSortChange = (value) => {
    setFilters({ ...filters, sortBy: value, page: 1 });
  };

  // Quick filter options
  const quickFilters = [
    { label: 'All', value: '', icon: FaGlobe },
    { label: 'Top Rated', value: 'top', icon: FaStar },
    { label: 'Most Active', value: 'active', icon: FaFire },
    { label: 'Newest', value: 'new', icon: FaChartLine },
  ];

  return (
    <Box minH="100vh" bg={useColorModeValue('white', 'gray.900')}>
      <Hero />

      <Container maxW="7xl" py={8}>
        {/* Quick Filters */}
        <Box mb={8}>
          <HStack spacing={2} mb={4}>
            <Icon as={FaFilter} color={secondaryTextColor} />
            <Text fontSize="sm" color={secondaryTextColor} fontWeight="medium">
              Quick Filters:
            </Text>
          </HStack>
          <Flex gap={2} flexWrap="wrap">
            {quickFilters.map((filter) => (
              <Button
                key={filter.value}
                size="sm"
                variant={filters.sortBy === filter.value ? 'solid' : 'outline'}
                colorScheme="purple"
                leftIcon={<Icon as={filter.icon} />}
                onClick={() => handleSortChange(filter.value)}
                borderRadius="md"
              >
                {filter.label}
              </Button>
            ))}
          </Flex>
        </Box>

        {/* Main Filters */}
        <Box
          bg={useColorModeValue('gray.50', 'gray.800')}
          p={6}
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
          mb={8}
        >
          <VStack spacing={6} align="stretch">
            <Heading size="md" color={textColor}>
              Find Your Clan
            </Heading>
            
            <Grid
              templateColumns={{
                base: '1fr',
                md: '2fr 1fr 1fr 1fr',
              }}
              gap={4}
            >
              {/* Search */}
              <GridItem>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search clans by name, tag, or description..."
                    value={filters.query}
                    onChange={handleSearchChange}
                    bg="white"
                    _dark={{ bg: 'gray.700' }}
                  />
                </InputGroup>
              </GridItem>

              {/* Type */}
              <GridItem>
                <Select
                  placeholder="All Types"
                  value={filters.clanType}
                  onChange={handleTypeChange}
                  bg="white"
                  _dark={{ bg: 'gray.700' }}
                >
                  <option value="Academic">Academic</option>
                  <option value="Competitive">Competitive</option>
                  <option value="Social">Social</option>
                  <option value="StudyGroup">Study Group</option>
                </Select>
              </GridItem>

              {/* Access */}
              <GridItem>
                <Select
                  placeholder="Access Type"
                  value={filters.isPublic}
                  onChange={handleAccessChange}
                  bg="white"
                  _dark={{ bg: 'gray.700' }}
                >
                  <option value="true">Public</option>
                  <option value="false">Private</option>
                </Select>
              </GridItem>

              {/* Sort */}
              <GridItem>
                <Select
                  placeholder="Sort By"
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  bg="white"
                  _dark={{ bg: 'gray.700' }}
                >
                  <option value="rank">Rank</option>
                  <option value="members">Members</option>
                  <option value="points">Points</option>
                  <option value="recent">Recent</option>
                </Select>
              </GridItem>
            </Grid>
          </VStack>
        </Box>

        {/* Results Header */}
        <Flex
          justify="space-between"
          align="center"
          mb={6}
        >
          <VStack align="start" spacing={1}>
            <Heading size="lg" color={textColor}>
              Discover Clans
            </Heading>
            <Text color={secondaryTextColor} fontSize="sm">
              Join a community that matches your learning goals
            </Text>
          </VStack>
          
          <Tag
            colorScheme="purple"
            size="lg"
            borderRadius="md"
            variant="subtle"
          >
            <HStack spacing={2}>
              <Text fontWeight="medium">
                {clans?.length || 0} CLANS AVAILABLE
              </Text>
            </HStack>
          </Tag>
        </Flex>

        {/* Clans Grid */}
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <AspectRatio ratio={16/9}>
                  <Skeleton />
                </AspectRatio>
                <CardBody p={4}>
                  <Stack spacing={3}>
                    <HStack>
                      <Skeleton boxSize="48px" borderRadius="md" />
                      <VStack align="start" flex={1} spacing={1}>
                        <Skeleton height="20px" width="70%" />
                        <Skeleton height="16px" width="40%" />
                      </VStack>
                    </HStack>
                    <SkeletonText noOfLines={2} spacing={2} />
                    <HStack spacing={3}>
                      <Skeleton height="20px" width="60px" />
                      <Skeleton height="20px" width="60px" />
                    </HStack>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : clans && clans.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {clans.map((clan) => (
              <ClanCard key={clan.id} clan={clan} />
            ))}
          </SimpleGrid>
        ) : (
          <Box
            textAlign="center"
            py={12}
            border="2px dashed"
            borderColor={borderColor}
            borderRadius="lg"
          >
            <VStack spacing={4}>
              <Icon as={FaUsers} boxSize={12} color={secondaryTextColor} />
              <VStack spacing={2}>
                <Heading size="md" color={textColor}>
                  No clans found
                </Heading>
                <Text color={secondaryTextColor} maxW="md">
                  Try adjusting your search filters or create your own clan
                </Text>
              </VStack>
              <Button
                colorScheme="purple"
                leftIcon={<FaPlus />}
                as={Link}
                to="/clans/create"
                mt={4}
              >
                Create Your Clan
              </Button>
            </VStack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ClanList;