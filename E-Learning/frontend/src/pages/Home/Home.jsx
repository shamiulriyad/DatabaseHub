import React, { useMemo } from 'react';
import api from '../../services/api';
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
  Flex,
  Avatar,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaBook, 
  FaUsers, 
  FaTrophy, 
  FaChartLine, 
  FaStar, 
  FaClock, 
  FaGraduationCap,
  FaPlayCircle,
  FaCertificate,
} from 'react-icons/fa';

const fetchPopularCourses = async () => {
  try {
    const { data } = await api.get('/courses/popular');
    return Array.isArray(data?.courses) ? data.courses : [];
  } catch {
    return [];
  }
};

const fetchTrendingCourses = async () => {
  try {
    const { data } = await api.get('/courses/trending');
    return Array.isArray(data?.courses) ? data.courses : [];
  } catch {
    return [];
  }
};

const fetchUniversities = async () => {
  const { data } = await api.get('/universities', { params: { page: 1, pageSize: 12 } });
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
      bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
      color="white"
      py={{ base: 20, md: 32 }}
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
        <Grid templateColumns={{ base: '1fr', lg: '1.2fr 1fr' }} gap={10} alignItems="center">
          <GridItem>
            <SlideFade in offsetY={20}>
              <Badge 
                colorScheme="purple" 
                bg="whiteAlpha.300" 
                color="white" 
                px={3} 
                py={1} 
                borderRadius="full" 
                mb={4}
                fontSize="sm"
              >
                🎓 Learn from Top Universities
              </Badge>
              <Heading 
                as="h1" 
                size="3xl" 
                fontWeight="black" 
                lineHeight="shorter"
                mb={6}
              >
                Learn Without Limits
              </Heading>
              <Text 
                fontSize={{ base: 'lg', md: 'xl' }} 
                color="whiteAlpha.900" 
                mb={8}
                lineHeight="tall"
              >
                Explore thousands of university-backed courses, join vibrant communities, 
                and accelerate your career with skills that matter.
              </Text>
              <HStack spacing={4} flexWrap="wrap">
                <Button 
                  size="lg" 
                  colorScheme="white" 
                  variant="solid"
                  bg="white" 
                  color="purple.600" 
                  _hover={{ bg: 'gray.100', transform: 'translateY(-2px)' }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                  leftIcon={<FaPlayCircle />}
                  onClick={handleExplore}
                  shadow="xl"
                >
                  Explore Courses
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  borderColor="white"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  leftIcon={<FaGraduationCap />}
                  as={Link}
                  to="/register"
                >
                  Join for Free
                </Button>
              </HStack>
              
              {/* Stats */}
              <HStack spacing={8} mt={12} flexWrap="wrap">
                <VStack align="start" spacing={0}>
                  <Heading size="lg">10,000+</Heading>
                  <Text fontSize="sm" color="whiteAlpha.800">Active Students</Text>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Heading size="lg">500+</Heading>
                  <Text fontSize="sm" color="whiteAlpha.800">Expert Instructors</Text>
                </VStack>
                <VStack align="start" spacing={0}>
                  <Heading size="lg">1,200+</Heading>
                  <Text fontSize="sm" color="whiteAlpha.800">Online Courses</Text>
                </VStack>
              </HStack>
            </SlideFade>
          </GridItem>
          
          {/* Hero Image/Illustration */}
          <GridItem display={{ base: 'none', lg: 'block' }}>
            <ScaleFade in initialScale={0.9}>
              <Box 
                position="relative" 
                height="400px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon 
                  as={FaGraduationCap} 
                  boxSize="300px" 
                  color="whiteAlpha.300"
                  filter="drop-shadow(0 20px 40px rgba(0,0,0,0.3))"
                />
              </Box>
            </ScaleFade>
          </GridItem>
        </Grid>
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
    <Badge colorScheme="green" fontSize="sm" px={2}>FREE</Badge>
  ) : (
    <Badge colorScheme="purple" fontSize="sm" px={2}>${course?.discountPrice ?? course?.price}</Badge>
  );

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
      >
        <Link to={`/courses/${course?.id}`}>
          <Box position="relative">
            {imageSrc ? (
              <Image 
                src={imageSrc} 
                alt={course?.title} 
                objectFit="cover" 
                w="100%" 
                h="180px"
                transition="transform 0.3s"
                _hover={{ transform: 'scale(1.05)' }}
              />
            ) : (
              <Box 
                w="100%" 
                h="180px" 
                bgGradient="linear(135deg, purple.400, blue.500)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FaBook} boxSize={12} color="white" opacity={0.7} />
              </Box>
            )}
            <Box position="absolute" top={3} right={3}>
              {priceBadge}
            </Box>
          </Box>
        </Link>
        <CardBody>
          <Stack spacing={3}>
            <Link to={`/courses/${course?.id}`}>
              <Heading 
                size="sm" 
                noOfLines={2} 
                minH="40px"
                _hover={{ color: 'purple.600' }}
                transition="color 0.2s"
              >
                {course?.title}
              </Heading>
            </Link>
            <Text fontSize="sm" color="gray.600" noOfLines={1} fontWeight="500">
              {course?.universityName}
            </Text>
            <HStack spacing={1}>
              <Icon as={FaStar} color="yellow.400" boxSize={4} />
              <Text fontSize="sm" fontWeight="bold">{Number(course?.averageRating || 0).toFixed(1)}</Text>
              <Text fontSize="xs" color="gray.500">({course?.enrollmentCount} students)</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" fontSize="xs" color="gray.600">
              <HStack spacing={1}>
                <Icon as={FaClock} />
                <Text>{course?.durationHours}h</Text>
              </HStack>
              <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                {course?.difficultyLevel}
              </Badge>
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
    <Box py={8}>
      <form onSubmit={onSubmit}>
        <InputGroup size="lg" maxW="800px" mx="auto">
          <InputLeftElement pointerEvents="none" h="full">
            <Icon as={FaBook} color="gray.400" />
          </InputLeftElement>
          <Input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="What do you want to learn today?" 
            bg={useColorModeValue('white', 'gray.800')}
            borderWidth="2px"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
            _hover={{ borderColor: 'purple.400' }}
            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805AD5' }}
            fontSize="md"
            h="56px"
            pl={12}
          />
        </InputGroup>
      </form>
    </Box>
  );
};

// How It Works Section
const HowItWorks = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  const steps = [
    {
      icon: FaGraduationCap,
      title: 'Browse Courses',
      description: 'Explore thousands of courses from top universities and expert instructors across various subjects.',
      color: 'purple',
    },
    {
      icon: FaPlayCircle,
      title: 'Enroll & Learn',
      description: 'Start learning immediately with video lessons, quizzes, and hands-on projects at your own pace.',
      color: 'blue',
    },
    {
      icon: FaUsers,
      title: 'Join Community',
      description: 'Connect with fellow learners, participate in discussions, and collaborate on projects.',
      color: 'green',
    },
    {
      icon: FaCertificate,
      title: 'Earn Certificates',
      description: 'Complete courses and earn certificates to showcase your achievements and boost your career.',
      color: 'orange',
    },
  ];

  return (
    <Box py={16} bg={bgColor}>
      <Container maxW="7xl">
        <VStack spacing={3} mb={12} textAlign="center">
          <Heading size="2xl" fontWeight="bold">
            How It Works
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Start your learning journey in four simple steps
          </Text>
        </VStack>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {steps.map((step, idx) => (
            <ScaleFade in key={idx} delay={idx * 0.1}>
              <Card 
                bg={cardBg} 
                shadow="md" 
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{ shadow: 'xl', transform: 'translateY(-8px)' }}
                transition="all 0.3s"
                height="full"
              >
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Flex 
                      w={16} 
                      h={16} 
                      bg={`${step.color}.100`} 
                      color={`${step.color}.600`}
                      borderRadius="xl"
                      align="center"
                      justify="center"
                    >
                      <Icon as={step.icon} boxSize={8} />
                    </Flex>
                    <Badge colorScheme={step.color} fontSize="sm" px={2}>
                      Step {idx + 1}
                    </Badge>
                    <Heading size="md">{step.title}</Heading>
                    <Text color={textColor} fontSize="sm">
                      {step.description}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </ScaleFade>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

// Testimonials Section
const Testimonials = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const roleColor = useColorModeValue('gray.600', 'gray.400');
  
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Developer',
      avatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      text: 'The courses here completely transformed my career! The quality of instruction and the supportive community made learning enjoyable and effective.',
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist',
      avatar: 'https://i.pravatar.cc/150?img=2',
      rating: 5,
      text: 'Excellent platform with high-quality content. The hands-on projects helped me build a strong portfolio that landed me my dream job.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      avatar: 'https://i.pravatar.cc/150?img=3',
      rating: 5,
      text: 'I love the flexibility and the ability to learn at my own pace. The certificates are recognized by employers and add real value to my resume.',
    },
  ];

  return (
    <Box py={16}>
      <Container maxW="7xl">
        <VStack spacing={3} mb={12} textAlign="center">
          <Heading size="2xl" fontWeight="bold">
            What Our Students Say
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Join thousands of satisfied learners who have transformed their careers
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {testimonials.map((testimonial, idx) => (
            <ScaleFade in key={idx} delay={idx * 0.1}>
              <Card 
                bg={cardBg}
                shadow="lg"
                borderWidth="1px"
                borderColor={borderColor}
                _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }}
                transition="all 0.3s"
                height="full"
              >
                <CardBody>
                  <VStack spacing={4} align="start">
                    <HStack spacing={1}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Icon key={i} as={FaStar} color="yellow.400" boxSize={5} />
                      ))}
                    </HStack>
                    <Text fontSize="md" color={textColor} fontStyle="italic" lineHeight="tall">
                      "{testimonial.text}"
                    </Text>
                    <HStack spacing={3} pt={2}>
                      <Avatar src={testimonial.avatar} name={testimonial.name} size="md" />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm">{testimonial.name}</Text>
                        <Text fontSize="xs" color={roleColor}>{testimonial.role}</Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </ScaleFade>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

// Call to Action Section
const CallToAction = () => {
  return (
    <Box 
      py={20} 
      bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
      color="white"
      position="relative"
      overflow="hidden"
    >
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
        <VStack spacing={8} textAlign="center">
          <Heading size="2xl" fontWeight="black">
            Ready to Start Learning?
          </Heading>
          <Text fontSize="xl" maxW="2xl" lineHeight="tall">
            Join our community of learners and start your journey towards success today. 
            Access thousands of courses from anywhere, anytime.
          </Text>
          <HStack spacing={4} pt={4} flexWrap="wrap" justify="center">
            <Button 
              size="lg" 
              bg="white" 
              color="purple.600"
              _hover={{ bg: 'gray.100', transform: 'translateY(-2px)' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
              leftIcon={<FaGraduationCap />}
              as={Link}
              to="/register"
              shadow="xl"
              px={8}
            >
              Get Started for Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              borderColor="white"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              as={Link}
              to="/courses"
              px={8}
            >
              Browse Courses
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

const Home = () => {
  const pageBg = useColorModeValue('white', 'gray.900');
  const emptyStateBg = useColorModeValue('gray.50', 'gray.800');

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
      {/* Hero Section */}
      <Hero />

      {/* Search Bar */}
      <Container maxW="7xl">
        <Fade in>
          <SearchBar />
        </Fade>
      </Container>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Featured/Popular Courses Section */}
      <Container maxW="7xl" py={16}>
        <Box>
          <SectionHeader
            title="Featured Courses"
            subtitle="Highly rated courses from top instructors"
            action={
              <Button 
                variant="ghost" 
                colorScheme="purple" 
                as={Link} 
                to="/courses"
                rightIcon={<Icon as={FaChartLine} />}
              >
                View All Courses
              </Button>
            }
          />
          {loadingPopular ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={`popular-skel-${i}`}>
                  <Skeleton h="180px" />
                  <CardBody>
                    <SkeletonText noOfLines={5} spacing={3} />
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : errorPopular ? (
            <Box p={8} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl" textAlign="center">
              <Icon as={FaBook} boxSize={12} color="red.400" mb={3} />
              <Text color="red.600" fontWeight="500">Failed to load courses. Please try again later.</Text>
            </Box>
          ) : popular.length === 0 ? (
            <Box p={12} textAlign="center" bg={emptyStateBg} borderRadius="xl">
              <Icon as={FaBook} boxSize={16} color="gray.400" mb={4} />
              <Heading size="md" color="gray.600" mb={2}>No courses available yet</Heading>
              <Text color="gray.500">Check back soon for exciting new courses!</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {popular.slice(0, 8).map((c) => (<CourseCard key={c?.id} course={c} />))}
            </SimpleGrid>
          )}
        </Box>

        {/* Trending Courses */}
        <Box mt={16}>
          <SectionHeader
            title="Trending Now"
            subtitle="Popular courses gaining momentum"
            action={
              <Button 
                variant="ghost" 
                colorScheme="purple" 
                as={Link} 
                to="/courses"
                rightIcon={<Icon as={FaTrophy} />}
              >
                Explore More
              </Button>
            }
          />
          {loadingTrending ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={`trending-skel-${i}`}>
                  <Skeleton h="180px" />
                  <CardBody>
                    <SkeletonText noOfLines={5} spacing={3} />
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : errorTrending ? (
            <Box p={8} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl" textAlign="center">
              <Icon as={FaBook} boxSize={12} color="red.400" mb={3} />
              <Text color="red.600" fontWeight="500">Failed to load trending courses. Please try again later.</Text>
            </Box>
          ) : trending.length === 0 ? (
            <Box p={12} textAlign="center" bg={emptyStateBg} borderRadius="xl">
              <Icon as={FaTrophy} boxSize={16} color="gray.400" mb={4} />
              <Heading size="md" color="gray.600" mb={2}>No trending courses yet</Heading>
              <Text color="gray.500">Be the first to discover new trending courses!</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {trending.slice(0, 8).map((c) => (<CourseCard key={c?.id} course={c} />))}
            </SimpleGrid>
          )}
        </Box>

        {/* Top Universities */}
        <Box mt={16}>
          <SectionHeader
            title="Top Universities"
            subtitle="Learn from prestigious institutions worldwide"
            action={
              <Button 
                variant="ghost" 
                colorScheme="purple" 
                as={Link} 
                to="/courses"
                rightIcon={<Icon as={FaGraduationCap} />}
              >
                View All
              </Button>
            }
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
            <Box p={8} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl" textAlign="center">
              <Icon as={FaGraduationCap} boxSize={12} color="red.400" mb={3} />
              <Text color="red.600" fontWeight="500">Failed to load universities. Please try again later.</Text>
            </Box>
          ) : unis.length === 0 ? (
            <Box p={12} textAlign="center" bg={emptyStateBg} borderRadius="xl">
              <Icon as={FaGraduationCap} boxSize={16} color="gray.400" mb={4} />
              <Heading size="md" color="gray.600" mb={2}>No universities available</Heading>
              <Text color="gray.500">Universities will be added soon!</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {unis.slice(0, 8).map((u) => (<UniversityCard key={u?.id} uni={u} />))}
            </SimpleGrid>
          )}
        </Box>
      </Container>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Call to Action Section */}
      <CallToAction />
    </Box>
  );
};

export default Home;
