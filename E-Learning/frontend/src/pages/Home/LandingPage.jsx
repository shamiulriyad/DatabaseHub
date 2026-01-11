import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

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
  Grid,
  Badge,
  Divider,
  List,
  ListItem,
} from '@chakra-ui/react';
import { 
  FaCheckCircle, 
  FaUsers, 
  FaClock, 
  FaCertificate, 
  FaArrowRight, 
  FaRocket,
  FaTrophy,
  FaGraduationCap,
  FaChartLine,
  FaUserCheck,
  FaLock,
} from 'react-icons/fa';

const LandingPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const features = [
    {
      icon: FaGraduationCap,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and university faculty with real-world experience',
      color: 'purple',
    },
    {
      icon: FaClock,
      title: 'Learn Your Way',
      description: 'Study at your own pace, on any device. No deadlines, pure flexibility',
      color: 'blue',
    },
    {
      icon: FaTrophy,
      title: 'Earn Credentials',
      description: 'Get recognized certificates and achievements to boost your career',
      color: 'green',
    },
  ];

  const benefits = [
    { icon: FaUsers, text: '10,000+ active learners and growing' },
    { icon: FaCertificate, text: '1,200+ courses from top universities' },
    { icon: FaCheckCircle, text: '500+ expert instructors worldwide' },
    { icon: FaCertificate, text: 'Recognized digital certificates' },
    { icon: FaChartLine, text: 'Track your progress & growth' },
    { icon: FaRocket, text: 'Join a supportive learning community' },
  ];

  return (
    <Box minH="100vh">
      {/* ===== HERO SECTION ===== */}
      <Box
        bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={{ base: 20, md: 32 }}
        position="relative"
        overflow="hidden"
      >
        {/* Animated Background */}
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
          <Grid templateColumns={{ base: '1fr', lg: '1.2fr 1fr' }} gap={12} alignItems="center">
            <VStack spacing={8} align={{ base: 'center', lg: 'flex-start' }} textAlign={{ base: 'center', lg: 'left' }}>
              <Badge
                colorScheme="cyan"
                bg="whiteAlpha.25"
                color="white"
                px={4}
                py={2}
                fontSize="sm"
                borderRadius="full"
                fontWeight="bold"
              >
                ✨ Welcome to NextUniVerse
              </Badge>
              
              <Box>
                <Heading
                  as="h1"
                  size="4xl"
                  fontWeight="black"
                  lineHeight="1.1"
                  mb={4}
                >
                  Transform Your Future
                </Heading>
                <Heading
                  as="h2"
                  size="xl"
                  fontWeight="300"
                  lineHeight="1.5"
                  opacity={0.95}
                >
                  Through World-Class Education
                </Heading>
              </Box>
              
              <Text fontSize="lg" maxW="lg" lineHeight="tall" opacity={0.9}>
                Access thousands of university-backed courses, learn from industry experts, and unlock your potential. Join thousands of successful learners today.
              </Text>

              <HStack spacing={4} pt={4}>
                <Button
                  size="lg"
                  bg="white"
                  color="purple.600"
                  _hover={{ bg: 'gray.100', transform: 'translateY(-2px)', shadow: 'xl' }}
                  transition="all 0.3s"
                  as={RouterLink}
                  to="/register"
                  fontWeight="bold"
                  shadow="lg"
                  leftIcon={<FaRocket />}
                >
                  Start Learning Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="white"
                  borderWidth="2px"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.2' }}
                  transition="all 0.3s"
                  as={RouterLink}
                  to="/courses"
                  rightIcon={<FaArrowRight />}
                  fontWeight="bold"
                >
                  Explore Now
                </Button>
              </HStack>

              {/* Quick Stats */}
              <HStack spacing={8} pt={8} divider={<Divider orientation="vertical" opacity={0.3} h="12" />}>
                <VStack spacing={1}>
                  <Text fontSize="2xl" fontWeight="black">10K+</Text>
                  <Text fontSize="xs" opacity={0.8}>Learners</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="2xl" fontWeight="black">1.2K+</Text>
                  <Text fontSize="xs" opacity={0.8}>Courses</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="2xl" fontWeight="black">500+</Text>
                  <Text fontSize="xs" opacity={0.8}>Instructors</Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Hero Illustration */}
            <Box display={{ base: 'none', lg: 'flex' }} justifyContent="center" alignItems="center" minH="400px">
              <Box position="relative">
                <Icon 
                  as={FaGraduationCap} 
                  boxSize="200px" 
                  opacity={0.2}
                  filter="drop-shadow(0 20px 40px rgba(0,0,0,0.3))"
                />
              </Box>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* ===== FEATURES SECTION ===== */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={12} align="center">
          <VStack spacing={4} textAlign="center">
            <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="full">
              Why Choose Us
            </Badge>
            <Heading size="2xl" fontWeight="black">
              Everything You Need to Succeed
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="2xl">
              Comprehensive learning platform with premium features designed for your success
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
            {features.map((feature, idx) => (
              <Card 
                key={idx} 
                bg={cardBg} 
                borderWidth="1px"
                borderColor={borderColor}
                shadow="md"
                _hover={{ shadow: 'xl', transform: 'translateY(-4px)', borderColor: `${feature.color}.500` }} 
                transition="all 0.3s"
                overflow="hidden"
              >
                <Box h="1px" bgGradient={`linear(to-r, ${feature.color}.400, transparent)`} />
                <CardBody>
                  <VStack spacing={4} align="flex-start">
                    <Box
                      w="16"
                      h="16"
                      bg={`${feature.color}.100`}
                      color={`${feature.color}.600`}
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      _dark={{ bg: `${feature.color}.900`, color: `${feature.color}.300` }}
                    >
                      <Icon as={feature.icon} boxSize={8} />
                    </Box>
                    <VStack spacing={2} align="flex-start">
                      <Heading size="md">{feature.title}</Heading>
                      <Text color={textColor} fontSize="sm" lineHeight="tall">
                        {feature.description}
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* ===== BENEFITS SECTION ===== */}
      <Box bg={bgColor} py={20}>
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
            {/* Benefits List */}
            <VStack spacing={6} align="flex-start">
              <VStack spacing={3} align="flex-start">
                <Heading size="lg" fontWeight="black">
                  Join a Global Community
                </Heading>
                <Text color={textColor} fontSize="lg">
                  Get access to premium learning resources and connect with learners worldwide
                </Text>
              </VStack>

              <List spacing={4}>
                {benefits.map((benefit, idx) => (
                  <ListItem key={idx} display="flex" alignItems="center" gap={4}>
                    <Icon as={benefit.icon} color="purple.500" boxSize={5} flexShrink={0} />
                    <Text fontWeight="500">{benefit.text}</Text>
                  </ListItem>
                ))}
              </List>

              <Button
                mt={4}
                size="lg"
                bgGradient="linear(135deg, purple.600, blue.600)"
                color="white"
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                transition="all 0.3s"
                as={RouterLink}
                to="/courses"
                rightIcon={<FaArrowRight />}
              >
                Browse Courses
              </Button>
            </VStack>

            {/* Stats Cards */}
            <SimpleGrid columns={2} spacing={6}>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md">
                <CardBody p={6} textAlign="center">
                  <Icon as={FaTrophy} fontSize="3xl" color="yellow.500" mb={3} />
                  <Text fontSize="sm" color={textColor} mb={2}>Achievement Rate</Text>
                  <Heading size="lg">92%</Heading>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md">
                <CardBody p={6} textAlign="center">
                  <Icon as={FaUserCheck} fontSize="3xl" color="green.500" mb={3} />
                  <Text fontSize="sm" color={textColor} mb={2}>Job Success</Text>
                  <Heading size="lg">87%</Heading>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md">
                <CardBody p={6} textAlign="center">
                  <Icon as={FaChartLine} fontSize="3xl" color="blue.500" mb={3} />
                  <Text fontSize="sm" color={textColor} mb={2}>Avg. Salary Growth</Text>
                  <Heading size="lg">+45%</Heading>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md">
                <CardBody p={6} textAlign="center">
                  <Icon as={FaLock} fontSize="3xl" color="purple.500" mb={3} />
                  <Text fontSize="sm" color={textColor} mb={2}>Data Privacy</Text>
                  <Heading size="lg">100%</Heading>
                </CardBody>
              </Card>
            </SimpleGrid>
          </Grid>
        </Container>
      </Box>

      {/* ===== CTA SECTION ===== */}
      <Box py={20}>
        <Container maxW="md">
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="xl">
            <CardBody p={12} textAlign="center">
              <Icon as={FaRocket} fontSize="4xl" color="purple.500" mb={4} />
              <Heading size="lg" mb={3}>Ready to Transform?</Heading>
              <Text color={textColor} mb={6}>
                Start your learning journey today and unlock your potential. Join thousands of successful learners.
              </Text>
              <Button
                w="full"
                size="lg"
                bgGradient="linear(135deg, purple.600, blue.600)"
                color="white"
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                transition="all 0.3s"
                as={RouterLink}
                to="/register"
                fontWeight="bold"
              >
                Get Started Free
              </Button>
              <Text fontSize="sm" color="gray.500" mt={4}>
                No credit card required
              </Text>
            </CardBody>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
