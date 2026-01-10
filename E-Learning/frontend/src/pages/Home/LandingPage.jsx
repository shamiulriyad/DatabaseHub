import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Image,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { FaCheckCircle, FaUsers, FaClock, FaCertificate, FaArrowRight, FaPlay } from 'react-icons/fa';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  // Redirect authenticated users to home
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: FaUsers,
      title: 'Learn from Experts',
      description: 'Access courses taught by industry professionals and university instructors',
      color: 'purple',
    },
    {
      icon: FaClock,
      title: 'Learn at Your Pace',
      description: 'Study whenever and wherever you want. No deadlines, full flexibility',
      color: 'blue',
    },
    {
      icon: FaCertificate,
      title: 'Earn Certificates',
      description: 'Receive recognized certificates that boost your professional profile',
      color: 'green',
    },
  ];

  const benefits = [
    'Access 1,200+ courses from top universities',
    'Learn from 500+ expert instructors worldwide',
    'Get personalized learning recommendations',
    'Join a supportive community of 10,000+ learners',
    'Earn verifiable certificates',
    'Participate in competitions and earn badges',
  ];

  return (
    <Box minH="100vh">
      {/* Hero Section */}
      <Box
        bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={{ base: 24, md: 32 }}
        position="relative"
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
          <VStack spacing={8} textAlign="center">
            <Badge
              colorScheme="purple"
              bg="whiteAlpha.300"
              color="white"
              px={4}
              py={2}
              fontSize="md"
              borderRadius="full"
            >
              🚀 Welcome to NextUniVerse
            </Badge>
            
            <Heading
              size="3xl"
              fontWeight="black"
              lineHeight="1.1"
              maxW="3xl"
            >
              Transform Your Future Through Education
            </Heading>
            
            <Text fontSize="xl" maxW="2xl" lineHeight="tall" opacity={0.95}>
              Access world-class education from top universities and instructors. 
              Learn new skills, earn certificates, and unlock amazing career opportunities.
            </Text>

            <HStack spacing={4} pt={4} flexWrap="wrap" justify="center">
              <Button
                size="lg"
                bg="white"
                color="purple.600"
                _hover={{ bg: 'gray.100', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                as={RouterLink}
                to="/register"
                fontWeight="bold"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                as={RouterLink}
                to="/"
                rightIcon={<Icon as={FaArrowRight} />}
              >
                Explore Courses
              </Button>
            </HStack>

            {/* Stats */}
            <SimpleGrid columns={{ base: 3, md: 3 }} spacing={4} pt={8} maxW="lg">
              <VStack>
                <Text fontSize="2xl" fontWeight="bold">10K+</Text>
                <Text fontSize="sm">Active Learners</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold">1.2K+</Text>
                <Text fontSize="sm">Quality Courses</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold">500+</Text>
                <Text fontSize="sm">Expert Instructors</Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Key Features */}
      <Container maxW="7xl" py={16}>
        <Heading textAlign="center" size="xl" mb={4}>
          Why Choose NextUniVerse?
        </Heading>
        <Text textAlign="center" color={textColor} maxW="2xl" mx="auto" mb={12}>
          Everything you need to succeed in your learning journey
        </Text>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {features.map((feature, idx) => (
            <Card key={idx} bg={cardBg} shadow="md" _hover={{ shadow: 'lg' }} transition="all 0.3s">
              <CardBody>
                <VStack spacing={4} align="start">
                  <Flex
                    w={16}
                    h={16}
                    bg={`${feature.color}.100`}
                    color={`${feature.color}.600`}
                    borderRadius="lg"
                    align="center"
                    justify="center"
                  >
                    <Icon as={feature.icon} boxSize={8} />
                  </Flex>
                  <Heading size="md">{feature.title}</Heading>
                  <Text color={textColor} fontSize="sm" lineHeight="tall">
                    {feature.description}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* Benefits Section */}
      <Box bg={bgColor} py={16}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={12} alignItems="center">
            <VStack spacing={6} align="start">
              <Heading size="xl">
                Everything You Need to Succeed
              </Heading>
              <Text color={textColor} fontSize="md" lineHeight="tall">
                NextUniVerse provides comprehensive tools and resources to support your learning journey from start to finish.
              </Text>
              <VStack spacing={3} align="start">
                {benefits.map((benefit, idx) => (
                  <HStack key={idx} spacing={3}>
                    <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
                    <Text color={textColor}>{benefit}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>

            <Box
              bg={`linear(135deg, purple.400, blue.400)`}
              borderRadius="xl"
              h={400}
              display="flex"
              alignItems="center"
              justifyContent="center"
              shadow="lg"
              position="relative"
            >
              <VStack spacing={4}>
                <Icon as={FaPlay} boxSize={16} color="white" opacity={0.9} />
                <Text color="white" fontSize="lg" fontWeight="bold">
                  Watch Our Story
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Success Stories */}
      <Container maxW="7xl" py={16}>
        <Heading textAlign="center" size="xl" mb={4}>
          Success Stories
        </Heading>
        <Text textAlign="center" color={textColor} maxW="2xl" mx="auto" mb={12}>
          See how NextUniVerse learners are transforming their careers
        </Text>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {[
            {
              name: 'Sarah Johnson',
              role: 'Software Developer',
              story: 'Completed 5 courses and got promoted within 6 months. NextUniVerse helped me master new technologies.',
              image: 'https://i.pravatar.cc/150?img=1',
            },
            {
              name: 'Michael Chen',
              role: 'Data Scientist',
              story: 'Transitioned careers from finance to data science using courses on NextUniVerse. Best decision ever!',
              image: 'https://i.pravatar.cc/150?img=2',
            },
            {
              name: 'Emily Rodriguez',
              role: 'Product Manager',
              story: 'The flexible learning schedule allowed me to upskill while working. Now I\'m managing a team!',
              image: 'https://i.pravatar.cc/150?img=3',
            },
          ].map((story, idx) => (
            <Card key={idx} bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={4}>
                  <Image
                    src={story.image}
                    alt={story.name}
                    borderRadius="full"
                    boxSize={16}
                  />
                  <VStack spacing={2} textAlign="center">
                    <Heading size="sm">{story.name}</Heading>
                    <Text fontSize="sm" color="purple.500" fontWeight="600">
                      {story.role}
                    </Text>
                    <Text fontSize="sm" color={textColor} lineHeight="tall">
                      "{story.story}"
                    </Text>
                  </VStack>
                  <HStack spacing={1}>
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} as={FaCheckCircle} color="yellow.400" boxSize={4} />
                    ))}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* How It Works */}
      <Box bg={bgColor} py={16}>
        <Container maxW="7xl">
          <Heading textAlign="center" size="xl" mb={12}>
            How to Get Started
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            {[
              {
                number: '1',
                title: 'Sign Up',
                description: 'Create a free NextUniVerse account in just 2 minutes',
              },
              {
                number: '2',
                title: 'Choose Courses',
                description: 'Browse and select from 1,200+ courses across all subjects',
              },
              {
                number: '3',
                title: 'Start Learning',
                description: 'Learn at your own pace with lifetime access to courses',
              },
              {
                number: '4',
                title: 'Earn Certificate',
                description: 'Complete courses and earn recognized certificates',
              },
            ].map((step, idx) => (
              <Card key={idx} bg={cardBg}>
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Box
                      w={12}
                      h={12}
                      bg="purple.600"
                      color="white"
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      fontSize="lg"
                    >
                      {step.number}
                    </Box>
                    <Heading size="md">{step.title}</Heading>
                    <Text color={textColor} fontSize="sm">
                      {step.description}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box
        bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={16}
      >
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="2xl" fontWeight="black">
              Ready to Transform Your Future?
            </Heading>
            <Text fontSize="lg" maxW="2xl">
              Join thousands of learners on NextUniVerse and start your journey to success today.
            </Text>
            <HStack spacing={4}>
              <Button
                size="lg"
                bg="white"
                color="purple.600"
                _hover={{ bg: 'gray.100' }}
                as={RouterLink}
                to="/register"
                fontWeight="bold"
              >
                Sign Up for Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                as={RouterLink}
                to="/"
              >
                View Courses
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
