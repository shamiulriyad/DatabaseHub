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
} from '@chakra-ui/react';
import {
  FaUsers,
  FaTrophy,
  FaSearch,
  FaPlus,
  FaFire,
  FaShieldAlt,
  FaCrown,
} from 'react-icons/fa';

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
  const cardBg = useColorModeValue('white', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');
  const navigate = useNavigate();

  return (
    <ScaleFade in initialScale={0.98}>
      <Card
        bg={cardBg}
        borderColor={border}
        borderWidth="1px"
        shadow="sm"
        _hover={{ shadow: 'xl', transform: 'translateY(-8px)', borderColor: 'purple.400' }}
        transition="all 0.3s ease"
        cursor="pointer"
        overflow="hidden"
        onClick={() => navigate(`/clans/${clan.id}`)}
      >
        {/* Banner */}
        <Box position="relative" h="120px">
          {clan.bannerUrl ? (
            <Image
              src={clan.bannerUrl}
              alt={clan.name}
              w="100%"
              h="100%"
            />
          ) : (
            <Box
              w="100%"
              h="100%"
              bgGradient="linear(to-r, gray.300, gray.400)"
            />
          )}
          {/* Rank Badge */}
          {clan.rank && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              fontSize="sm"
              py={1}
              borderRadius="full"
            >
              <HStack spacing={1}>
                <Icon as={FaTrophy} />
                <Text>{clan.rank}</Text>
              </HStack>
            </Badge>
          )}
        </Box>

        <CardBody>
          <Stack spacing={3}>
            {/* Logo and Name */}
            <HStack spacing={3}>
              {clan.logoUrl ? (
                <Image
                  src={clan.logoUrl}
                  alt={clan.name}
                  boxSize="50px"
                  borderRadius="md"
                  border="2px solid"
                  borderColor={border}
                />
              ) : (
                <Box
                  boxSize="50px"
                  borderRadius="md"
                  bgGradient="linear(to-r, purple.500, blue.500)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FaShieldAlt} boxSize={6} color="white" />
                </Box>
              )}
              <VStack align="start" spacing={0} flex={1}>
                <HStack>
                  <Heading size="sm" noOfLines={1}>
                    {clan.name}
                  </Heading>
                  {!clan.isPublic && (
                    <Icon as={FaCrown} color="yellow.500" boxSize={3} />
                  )}
                </HStack>
                <Badge colorScheme="purple" fontSize="xs">
                  [{clan.tag}]
                </Badge>
              </VStack>
            </HStack>

            {/* Description */}
            <Text fontSize="sm" color="gray.600" noOfLines={2} minH="40px">
              {clan.description}
            </Text>

            {/* Stats */}
            <HStack spacing={4} fontSize="sm">
              <HStack spacing={1}>
                <Icon as={FaUsers} color="purple.500" />
                <Text fontWeight="bold">{clan.memberCount}</Text>
                <Text color="gray.500">members</Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FaTrophy} color="yellow.500" />
                <Text fontWeight="bold">{clan.totalPoints}</Text>
                <Text color="gray.500">pts</Text>
              </HStack>
            </HStack>

            <Divider />

            {/* Type and Status */}
            <HStack justify="space-between" fontSize="xs">
              <Badge colorScheme="blue" variant="subtle">
                {clan.clanType}
              </Badge>
              <Badge colorScheme={clan.isPublic ? 'green' : 'orange'}>
                {clan.isPublic ? 'Public' : 'Private'}
              </Badge>
            </HStack>
          </Stack>
        </CardBody>
      </Card>
    </ScaleFade>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <Box
      position="relative"
      bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
      color="white"
      py={{ base: 16, md: 24 }}
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity="0.1"
        bgImage="url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      />

      <Container maxW="7xl" position="relative" zIndex={1}>
        <VStack spacing={6} textAlign="center">
          <Badge
            colorScheme="purple"
            bg="whiteAlpha.300"
            color="white"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
          >
            🏆 Join the Best Learning Clans
          </Badge>
          <Heading
            as="h1"
            size="2xl"
            fontWeight="black"
            lineHeight="shorter"
          >
            Find Your Clan. Learn Together.
          </Heading>
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            color="whiteAlpha.900"
            maxW="2xl"
          >
            Join academic clans, compete in challenges, earn points, and climb the leaderboards
            with your team.
          </Text>
          <HStack spacing={4}>
            <Button
              size="lg"
              colorScheme="white"
              variant="solid"
              bg="white"
              color="purple.600"
              _hover={{ bg: 'gray.100', transform: 'translateY(-2px)' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
              leftIcon={<FaPlus />}
              onClick={() => navigate('/clans/create')}
              shadow="xl"
            >
              Create Clan
            </Button>
            <Button
              size="lg"
              variant="outline"
              borderColor="white"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              leftIcon={<FaSearch />}
            >
              Browse Clans
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

const ClanList = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
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

  return (
    <Box bg={bgColor} minH="100vh">
      <Hero />

      <Container maxW="7xl" py={10}>
        {/* Filters */}
        <Box
          bg={useColorModeValue('white', 'gray.700')}
          p={6}
          borderRadius="lg"
          shadow="sm"
          mb={8}
        >
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }}
            gap={4}
          >
            <GridItem colSpan={{ base: 1, md: 2, lg: 2 }}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search clans..."
                  value={filters.query}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </GridItem>

            <Select
              placeholder="All Types"
              value={filters.clanType}
              onChange={handleTypeChange}
            >
              <option value="Academic">Academic</option>
              <option value="Competitive">Competitive</option>
              <option value="Social">Social</option>
              <option value="StudyGroup">Study Group</option>
            </Select>

            <Select
              placeholder="All Access"
              value={filters.isPublic}
              onChange={handleAccessChange}
            >
              <option value="true">Public</option>
              <option value="false">Private</option>
            </Select>

            <Select
              placeholder="Sort By"
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="rank">Rank</option>
              <option value="members">Members</option>
              <option value="points">Points</option>
              <option value="recent">Recent</option>
            </Select>
          </Grid>
        </Box>

        {/* Stats Bar */}
        <HStack
          spacing={6}
          mb={8}
          fontSize="sm"
          color={useColorModeValue('gray.600', 'gray.400')}
          flexWrap="wrap"
        >
          <HStack>
            <Icon as={FaFire} color="orange.500" />
            <Text>
              <strong>{clans?.length || 0}</strong> clans found
            </Text>
          </HStack>
        </HStack>

        {/* Clans Grid */}
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <Box position="relative" h="120px">
                  <Skeleton height="120px" />
                </Box>
                <CardBody>
                  <Stack spacing={3}>
                    <HStack>
                      <Skeleton boxSize="50px" borderRadius="md" />
                      <VStack align="start" flex={1}>
                        <SkeletonText noOfLines={1} width="100px" />
                        <SkeletonText noOfLines={1} width="60px" />
                      </VStack>
                    </HStack>
                    <SkeletonText noOfLines={2} />
                    <Skeleton height="20px" />
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
          <VStack spacing={4} py={20}>
            <Icon as={FaUsers} boxSize={20} color="gray.400" />
            <Heading size="lg" color="gray.600">
              No clans found
            </Heading>
            <Text color="gray.500">Try adjusting your search filters</Text>
            <Button
              colorScheme="purple"
              leftIcon={<FaPlus />}
              as={Link}
              to="/clans/create"
            >
              Create Your Clan
            </Button>
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default ClanList;
