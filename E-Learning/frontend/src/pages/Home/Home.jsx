import React, { useMemo } from 'react';

import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
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
  Divider,
  Icon,
  useColorModeValue,
  Fade,
  ScaleFade,
  SlideFade,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

const fetchPopularCourses = async () => {
  const { data } = await axios.get('/api/courses/popular');
  return Array.isArray(data?.courses) ? data.courses : [];
};

const fetchTrendingCourses = async () => {
  const { data } = await axios.get('/api/courses/trending');
  return Array.isArray(data?.courses) ? data.courses : [];
};

const fetchUniversities = async () => {
  const { data } = await axios.get('/api/universities', { params: { page: 1, pageSize: 12 } });
  const d = data?.data;
  if (!d) return [];
  // Handle both paged {items: []} and direct [] responses
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};

const Hero = () => {
  const navigate = useNavigate();
  const handleExplore = () => navigate('/courses');


  return (
    <Box
      position="relative"
      bgGradient="linear(to-r, purple.500, purple.700)"
      color="white"
      py={{ base: 16, md: 24 }}
      textAlign="center"
    >
      <Container maxW="6xl" position="relative" zIndex={1}>
        <SlideFade in offsetY={20}>
          <Heading as="h1" size="2xl" fontWeight="extrabold" color="white" mb={4}>
            Learn Without Limits
          </Heading>
          <Text fontSize={{ base: 'md', md: 'xl' }} color="whiteAlpha.900" mb={6}>
            Explore university-backed courses, join communities, and level up your skills.
          </Text>
          <HStack spacing={3}>
            <Button size="lg" colorScheme="blackAlpha" bg="white" color="purple.700" _hover={{ bg: 'gray.100' }} onClick={handleExplore}>
              Explore Courses
            </Button>
            <Link to="/my-learning">
              <Button size="lg" variant="outline" colorScheme="whiteAlpha">
                Continue Learning
              </Button>
            </Link>
          </HStack>
        </SlideFade>
      </Container>
    </Box>
  );
};

const SectionHeader = ({ title, subtitle, action }) => (
  <HStack justify="space-between" align="end" mb={4}>
    <VStack align="start" spacing={0}>
      <Heading size="lg">{title}</Heading>
      {subtitle && (
        <Text fontSize="sm" color="gray.500">{subtitle}</Text>
      )}
    </VStack>
    {action}
  </HStack>
);

const CourseCard = ({ course }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');
  const imageSrc = course?.thumbnailUrl || undefined;
  const priceBadge = course?.isFree ? (
    <Badge colorScheme="green">Free</Badge>
  ) : (
    <Badge colorScheme="purple">${course?.discountPrice ?? course?.price}</Badge>
  );

  return (
    <ScaleFade in initialScale={0.98}>
      <Card bg={cardBg} borderColor={border} borderWidth="1px" shadow="sm" _hover={{ shadow: 'md', transform: 'translateY(-4px)' }} transition="all 0.2s ease">
        <Link to={`/courses/${course?.id}`}>
          {imageSrc ? (
            <Image src={imageSrc} alt={course?.title} objectFit="cover" w="100%" h="160px" borderTopRadius="md" />
          ) : (
            <Box w="100%" h="160px" borderTopRadius="md" bgGradient="linear(to-r, purple.500, blue.500)" />
          )}
        </Link>
        <CardBody>
          <Stack spacing={2}>
            <HStack justify="space-between" align="start">
              <Badge colorScheme="blue" variant="subtle">{course?.difficultyLevel}</Badge>
              {priceBadge}
            </HStack>
            <Link to={`/courses/${course?.id}`}>
              <Heading size="sm" noOfLines={2}>{course?.title}</Heading>
            </Link>
            <Text fontSize="sm" color="gray.600" noOfLines={1}>{course?.universityName}</Text>
            <HStack spacing={3} pt={1}>
              <HStack spacing={1}>
                <Icon viewBox="0 0 24 24" color="yellow.400"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></Icon>
                <Text fontSize="xs" color="gray.600">{Number(course?.averageRating || 0).toFixed(1)}</Text>
              </HStack>
              <Text fontSize="xs" color="gray.600">{course?.durationHours}h</Text>
              <Text fontSize="xs" color="gray.600">{course?.enrollmentCount} enrolled</Text>
            </HStack>
          </Stack>
        </CardBody>
      </Card>
    </ScaleFade>
  );
};

const UniversityCard = ({ uni }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');
  return (
    <ScaleFade in initialScale={0.98}>
      <Card bg={cardBg} borderColor={border} borderWidth="1px" shadow="sm" _hover={{ shadow: 'md', transform: 'translateY(-4px)' }} transition="all 0.2s ease">
        {uni?.bannerUrl ? (
          <Image src={uni.bannerUrl} alt={uni?.name} objectFit="cover" w="100%" h="120px" borderTopRadius="md" />
        ) : (
          <Box w="100%" h="120px" borderTopRadius="md" bgGradient="linear(to-r, teal.500, green.500)" />
        )}
        <CardBody>
          <Stack spacing={2}>
            <HStack spacing={3} align="center">
              {uni?.logoUrl ? (
                <Image src={uni.logoUrl} alt={uni?.name} boxSize="32px" borderRadius="sm" />
              ) : (
                <Box boxSize="32px" borderRadius="sm" bg="gray.200" />
              )}
              <Heading size="sm" noOfLines={1}>{uni?.name}</Heading>
            </HStack>
            <HStack spacing={3}>
              <Badge colorScheme="purple">{uni?.totalCourses ?? 0} courses</Badge>
              {typeof uni?.averageCourseRating !== 'undefined' && (
                <Badge colorScheme="yellow">★ {Number(uni?.averageCourseRating || 0).toFixed(1)}</Badge>
              )}
              {uni?.location && <Badge variant="outline" colorScheme="gray">{uni.location}</Badge>}
            </HStack>
          </Stack>
        </CardBody>
      </Card>
    </ScaleFade>
  );
};

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/courses?search=${encodeURIComponent(query.trim())}`);
    else navigate('/courses');
  };
  return (
    <Box py={6}>
      <form onSubmit={onSubmit}>
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none">
            <Icon viewBox="0 0 24 24" color="gray.400"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></Icon>
          </InputLeftElement>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses, universities, topics..." bg={useColorModeValue('white', 'gray.800')} />
        </InputGroup>
      </form>
    </Box>
  );
};

const Home = () => {
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const featureBorder = useColorModeValue('gray.200', 'gray.700');
  const featureText = useColorModeValue('gray.600', 'gray.300');

  const { data: popularCourses, isLoading: loadingPopular, isError: errorPopular } = useQuery({
    queryKey: ['courses', 'popular'],
    queryFn: fetchPopularCourses,
    staleTime: 1000 * 60 * 5,
  });

  const { data: trendingCourses, isLoading: loadingTrending, isError: errorTrending } = useQuery({
    queryKey: ['courses', 'trending'],
    queryFn: fetchTrendingCourses,
    staleTime: 1000 * 60 * 5,
  });

  const { data: universities, isLoading: loadingUniversities, isError: errorUniversities } = useQuery({
    queryKey: ['universities', { page: 1, pageSize: 12 }],
    queryFn: fetchUniversities,
    staleTime: 1000 * 60 * 5,
  });

  const popular = useMemo(() => popularCourses || [], [popularCourses]);
  const trending = useMemo(() => trendingCourses || [], [trendingCourses]);
  const unis = useMemo(() => universities || [], [universities]);

  return (
    <Box bg={pageBg} minH="100vh">
      {/* Hero */}
      <Hero />

      {/* Search */}
      <Container maxW="6xl">
        <Fade in>
          <SearchBar />
        </Fade>

        {/* Features */}
        <Fade in>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} py={10}>
            {[
              { title: '📚 Comprehensive Courses', desc: 'High-quality courses across multiple subjects' },
              { title: '👥 Community Learning', desc: 'Learn and collaborate with other students' },
              { title: '🏆 Gamification', desc: 'Earn points, badges, and compete on leaderboards' },
              { title: '📊 Track Progress', desc: 'Monitor your learning progress in real-time' },
            ].map((f, idx) => (
              <ScaleFade in key={`feature-${idx}`}>
                <Card shadow="sm" borderWidth="1px" borderColor={featureBorder}>
                  <CardBody textAlign="center">
                    <Heading size="sm" mb={2}>{f.title}</Heading>
                    <Text color={featureText}>{f.desc}</Text>
                  </CardBody>
                </Card>
              </ScaleFade>
            ))}
          </SimpleGrid>
        </Fade>

        {/* Popular Courses */}
        <Box mt={8}>
          <SectionHeader
            title="Popular Courses"
            subtitle="Highly rated and widely enrolled"
            action={<Link to="/courses"><Button variant="ghost" colorScheme="purple">View all</Button></Link>}
          />
          {loadingPopular ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={`popular-skel-${i}`}>
                  <Skeleton h="160px" />
                  <CardBody>
                    <SkeletonText noOfLines={4} spacing={3} />
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : errorPopular ? (
            <Box p={4} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
              <Text color="red.600">Failed to load popular courses. Please try again.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {popular.map((c) => (<CourseCard key={c?.id} course={c} />))}
            </SimpleGrid>
          )}
        </Box>

        {/* Trending Courses */}
        <Box mt={10}>
          <SectionHeader
            title="Trending Now"
            subtitle="Courses gaining momentum this week"
            action={<Link to="/courses"><Button variant="ghost" colorScheme="purple">Explore</Button></Link>}
          />
          {loadingTrending ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={`trending-skel-${i}`}>
                  <Skeleton h="160px" />
                  <CardBody>
                    <SkeletonText noOfLines={4} spacing={3} />
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : errorTrending ? (
            <Box p={4} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
              <Text color="red.600">Failed to load trending courses. Please try again.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {trending.map((c) => (<CourseCard key={c?.id} course={c} />))}
            </SimpleGrid>
          )}
        </Box>

        {/* Top Universities */}
        <Box mt={10}>
          <SectionHeader
            title="Top Universities"
            subtitle="Trusted institutions and partners"
            action={<Link to="/courses"><Button variant="ghost" colorScheme="purple">Browse Courses</Button></Link>}
          />
          {loadingUniversities ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={`uni-skel-${i}`}>
                  <Skeleton h="120px" />
                  <CardBody>
                    <SkeletonText noOfLines={3} spacing={3} />
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : errorUniversities ? (
            <Box p={4} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
              <Text color="red.600">Failed to load universities. Please try again.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {unis.map((u) => (<UniversityCard key={u?.id} uni={u} />))}
            </SimpleGrid>
          )}
        </Box>

        <Divider my={12} />
      </Container>
    </Box>
  );
};

export default Home;
