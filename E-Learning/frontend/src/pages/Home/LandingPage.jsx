import React, { useRef } from 'react';
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
  FaUserFriends,
  FaMedal,
  FaFire,
  FaUniversity,
  FaChalkboardTeacher,
  FaShieldAlt,
} from 'react-icons/fa';

const LandingPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
                  onClick={scrollToFeatures}
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
      <Container maxW="7xl" py={20} ref={featuresRef}>
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

      {/* ===== COMMUNITY / CLAN SECTION ===== */}
      <Box py={20} bgGradient="linear(135deg, purple.50, blue.50)" _dark={{ bgGradient: "linear(135deg, purple.900, blue.900)" }}>
        <Container maxW="7xl">
          <VStack spacing={12} align="center">
            <VStack spacing={4} textAlign="center">
              <Badge colorScheme="purple" variant="solid" px={3} py={1} borderRadius="full" fontSize="sm">
                Community-Driven Learning
              </Badge>
              <Heading size="2xl" fontWeight="black">
                Learn Together, Grow Together
              </Heading>
              <Text fontSize="lg" color={textColor} maxW="2xl">
                Join learning clans, compete with peers, and achieve your goals as a team
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
              <Card 
                bg={cardBg} 
                borderWidth="1px" 
                borderColor={borderColor}
                shadow="lg"
                _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
                transition="all 0.3s"
              >
                <CardBody textAlign="center" py={8}>
                  <Icon as={FaUserFriends} fontSize="4xl" color="purple.500" mb={4} />
                  <Heading size="md" mb={2}>Create & Join Clans</Heading>
                  <Text fontSize="sm" color={textColor}>Form study groups and learning communities</Text>
                </CardBody>
              </Card>

              <Card 
                bg={cardBg} 
                borderWidth="1px" 
                borderColor={borderColor}
                shadow="lg"
                _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
                transition="all 0.3s"
              >
                <CardBody textAlign="center" py={8}>
                  <Icon as={FaTrophy} fontSize="4xl" color="yellow.500" mb={4} />
                  <Heading size="md" mb={2}>Competitions</Heading>
                  <Text fontSize="sm" color={textColor}>Challenge yourself with clan-based contests</Text>
                </CardBody>
              </Card>

              <Card 
                bg={cardBg} 
                borderWidth="1px" 
                borderColor={borderColor}
                shadow="lg"
                _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
                transition="all 0.3s"
              >
                <CardBody textAlign="center" py={8}>
                  <Icon as={FaMedal} fontSize="4xl" color="orange.500" mb={4} />
                  <Heading size="md" mb={2}>Leaderboards</Heading>
                  <Text fontSize="sm" color={textColor}>Track progress and climb the rankings</Text>
                </CardBody>
              </Card>

              <Card 
                bg={cardBg} 
                borderWidth="1px" 
                borderColor={borderColor}
                shadow="lg"
                _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
                transition="all 0.3s"
              >
                <CardBody textAlign="center" py={8}>
                  <Icon as={FaFire} fontSize="4xl" color="red.500" mb={4} />
                  <Heading size="md" mb={2}>Rewards & Badges</Heading>
                  <Text fontSize="sm" color={textColor}>Earn achievements for your accomplishments</Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Button
              size="lg"
              bgGradient="linear(135deg, purple.600, blue.600)"
              color="white"
              _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }}
              transition="all 0.3s"
              as={RouterLink}
              to="/clans"
              rightIcon={<FaArrowRight />}
              fontWeight="bold"
            >
              Explore Clans
            </Button>
          </VStack>
        </Container>
      </Box>

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

      {/* ===== UNIVERSITY & INSTITUTION SECTION ===== */}
      <Container maxW="7xl" py={20}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
          {/* Text Content */}
          <VStack spacing={6} align="flex-start">
            <VStack spacing={3} align="flex-start">
              <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                Built for Universities & Institutions
              </Badge>
              <Heading size="xl" fontWeight="black">
                Enterprise-Grade Learning Management
              </Heading>
              <Text color={textColor} fontSize="lg">
                Empower your institution with comprehensive tools for students, faculty, and administrators
              </Text>
            </VStack>

            <List spacing={3}>
              <ListItem display="flex" alignItems="center" gap={3}>
                <Icon as={FaUniversity} color="blue.500" boxSize={5} flexShrink={0} />
                <Text fontWeight="500">University-based learning groups</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center" gap={3}>
                <Icon as={FaChalkboardTeacher} color="blue.500" boxSize={5} flexShrink={0} />
                <Text fontWeight="500">Department-wise course management</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center" gap={3}>
                <Icon as={FaChartLine} color="blue.500" boxSize={5} flexShrink={0} />
                <Text fontWeight="500">Student performance analytics</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center" gap={3}>
                <Icon as={FaShieldAlt} color="blue.500" boxSize={5} flexShrink={0} />
                <Text fontWeight="500">Secure and role-based access</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center" gap={3}>
                <Icon as={FaUserCheck} color="blue.500" boxSize={5} flexShrink={0} />
                <Text fontWeight="500">Faculty and teacher control panels</Text>
              </ListItem>
            </List>

            <Button
              mt={4}
              size="lg"
              colorScheme="blue"
              _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
              transition="all 0.3s"
              rightIcon={<FaArrowRight />}
              fontWeight="bold"
            >
              For Universities
            </Button>
          </VStack>

          {/* University Grid / Visual */}
          <SimpleGrid columns={2} spacing={6}>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md" textAlign="center">
              <CardBody py={8}>
                <Icon as={FaUniversity} fontSize="5xl" color="blue.500" mb={3} />
                <Text fontSize="sm" fontWeight="bold" color={textColor}>Multi-University Support</Text>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md" textAlign="center">
              <CardBody py={8}>
                <Icon as={FaUsers} fontSize="5xl" color="purple.500" mb={3} />
                <Text fontSize="sm" fontWeight="bold" color={textColor}>10,000+ Students</Text>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md" textAlign="center">
              <CardBody py={8}>
                <Icon as={FaChalkboardTeacher} fontSize="5xl" color="green.500" mb={3} />
                <Text fontSize="sm" fontWeight="bold" color={textColor}>500+ Faculty</Text>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md" textAlign="center">
              <CardBody py={8}>
                <Icon as={FaShieldAlt} fontSize="5xl" color="red.500" mb={3} />
                <Text fontSize="sm" fontWeight="bold" color={textColor}>Enterprise Security</Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Grid>
      </Container>

      {/* ===== TRUSTED BY COLLEGES & UNIVERSITIES SECTION ===== */}
      <Box bg={useColorModeValue('white', 'gray.800')} py={20}>
        <Container maxW="7xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={16} alignItems="center">
            {/* Left Side - University Logos Grid */}
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={8} opacity={0.6} filter="grayscale(100%)">
              {/* University Logo Placeholders */}
              <Box 
                bg={useColorModeValue('gray.100', 'gray.700')} 
                borderRadius="lg" 
                p={8} 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                h="120px"
                border="1px solid"
                borderColor={borderColor}
              >
                <VStack spacing={1}>
                  <Icon as={FaUniversity} fontSize="3xl" color="gray.600" />
                  <Text fontSize="xs" fontWeight="bold" color="gray.600">University A</Text>
                </VStack>
              </Box>

              <Box 
                bg={useColorModeValue('gray.100', 'gray.700')} 
                borderRadius="lg" 
                p={8} 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                h="120px"
                border="1px solid"
                borderColor={borderColor}
              >
                <VStack spacing={1}>
                  <Icon as={FaUniversity} fontSize="3xl" color="gray.600" />
                  <Text fontSize="xs" fontWeight="bold" color="gray.600">University B</Text>
                </VStack>
              </Box>

              <Box 
                bg={useColorModeValue('gray.100', 'gray.700')} 
                borderRadius="lg" 
                p={8} 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                h="120px"
                border="1px solid"
                borderColor={borderColor}
              >
                <VStack spacing={1}>
                  <Icon as={FaUniversity} fontSize="3xl" color="gray.600" />
                  <Text fontSize="xs" fontWeight="bold" color="gray.600">University C</Text>
                </VStack>
              </Box>

              <Box 
                bg={useColorModeValue('gray.100', 'gray.700')} 
                borderRadius="lg" 
                p={8} 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                h="120px"
                border="1px solid"
                borderColor={borderColor}
              >
                <VStack spacing={1}>
                  <Icon as={FaUniversity} fontSize="3xl" color="gray.600" />
                  <Text fontSize="xs" fontWeight="bold" color="gray.600">University D</Text>
                </VStack>
              </Box>

              <Box 
                bg={useColorModeValue('gray.100', 'gray.700')} 
                borderRadius="lg" 
                p={8} 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                h="120px"
                border="1px solid"
                borderColor={borderColor}
              >
                <VStack spacing={1}>
                  <Icon as={FaUniversity} fontSize="3xl" color="gray.600" />
                  <Text fontSize="xs" fontWeight="bold" color="gray.600">University E</Text>
                </VStack>
              </Box>

              <Box 
                bg={useColorModeValue('gray.100', 'gray.700')} 
                borderRadius="lg" 
                p={8} 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                h="120px"
                border="1px solid"
                borderColor={borderColor}
              >
                <VStack spacing={1}>
                  <Icon as={FaUniversity} fontSize="3xl" color="gray.600" />
                  <Text fontSize="xs" fontWeight="bold" color="gray.600">University F</Text>
                </VStack>
              </Box>
            </SimpleGrid>

            {/* Right Side - Text Content */}
            <VStack spacing={6} align="flex-start">
              <Heading size="xl" fontWeight="black" lineHeight="1.3">
                Join colleges and universities worldwide that choose EduLearn
              </Heading>
              <Text color={textColor} fontSize="lg">
                Powering learning, collaboration, and competition at scale.
              </Text>
              <Button
                size="lg"
                colorScheme="blue"
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                transition="all 0.3s"
                fontWeight="bold"
                px={8}
              >
                For Universities
              </Button>
            </VStack>
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
              <Text color={textColor} mb={2}>
                Start your learning journey today and unlock your potential.
              </Text>
              <Text fontSize="md" fontWeight="semibold" color="purple.600" _dark={{ color: "purple.300" }} mb={6}>
                Join learners, clans, and universities worldwide
              </Text>
              <VStack spacing={3} w="full">
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
                <Button
                  w="full"
                  size="lg"
                  variant="outline"
                  colorScheme="purple"
                  borderWidth="2px"
                  _hover={{ bg: 'purple.50', transform: 'translateY(-2px)' }}
                  _dark={{ _hover: { bg: 'purple.900' } }}
                  transition="all 0.3s"
                  as={RouterLink}
                  to="/clans"
                  fontWeight="bold"
                  rightIcon={<FaUserFriends />}
                >
                  Join a Clan
                </Button>
              </VStack>
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
