import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Avatar,
  Card,
  CardBody,
  Grid,
  GridItem,
  Badge,
  useColorModeValue,
  Icon,
  Spinner,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Center,
} from '@chakra-ui/react';
import {
  FaBook,
  FaTrophy,
  FaFire,
  FaStar,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaArrowLeft,
  FaMedal,
} from 'react-icons/fa';

const fetchUserProfile = async (userId) => {
  const { data } = await api.get(`/auth/user/${userId}`);
  return data?.user;
};

const PublicUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('linear(135deg, purple.600, blue.600)', 'linear(135deg, purple.700, blue.700)');

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['publicUserProfile', userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Container maxW="6xl" py={20}>
          <Center>
            <VStack spacing={4}>
              <Spinner size="xl" color="purple.500" thickness="4px" />
              <Text>Loading profile...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Container maxW="6xl" py={20}>
          <Center>
            <VStack spacing={4}>
              <Icon as={FaUsers} boxSize={16} color="gray.400" />
              <Heading size="lg" color="gray.600">
                User Not Found
              </Heading>
              <Text color="gray.500">The profile you're looking for doesn't exist.</Text>
              <Button colorScheme="purple" onClick={() => navigate(-1)} leftIcon={<FaArrowLeft />}>
                Go Back
              </Button>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="6xl">
        {/* Back Button */}
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          mb={4}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        {/* Profile Header */}
        <Card bg={cardBg} mb={6} overflow="hidden">
          <Box bgGradient={headerBg} h="120px" />
          <CardBody mt={-16}>
            <VStack spacing={4} align="center">
              <Avatar
                size="2xl"
                name={profile.username || profile.firstName}
                src={profile.profileImageUrl}
                border="4px solid"
                borderColor={cardBg}
                shadow="xl"
              />
              <VStack spacing={1} textAlign="center">
                <Heading size="lg">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : profile.username}
                </Heading>
                <Text color="gray.500" fontSize="lg">
                  @{profile.username}
                </Text>
                {profile.email && (
                  <Text color="gray.500" fontSize="sm">
                    {profile.email}
                  </Text>
                )}
              </VStack>

              {/* User Roles */}
              <HStack spacing={2} flexWrap="wrap" justify="center">
                {profile.isStudent && (
                  <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                    Student
                  </Badge>
                )}
                {profile.isTeacher && (
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                    Teacher
                  </Badge>
                )}
                {profile.isCompetitor && (
                  <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                    Competitor
                  </Badge>
                )}
                {profile.isAdmin && (
                  <Badge colorScheme="red" px={3} py={1} borderRadius="full">
                    Admin
                  </Badge>
                )}
              </HStack>

              {/* Bio/Description */}
              {profile.bio && (
                <Text color="gray.600" textAlign="center" maxW="2xl">
                  {profile.bio}
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack spacing={3}>
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg="purple.100"
                    color="purple.600"
                  >
                    <Icon as={FaTrophy} boxSize={6} />
                  </Box>
                  <Box>
                    <StatLabel>Total Points</StatLabel>
                    <StatNumber>{profile.totalPoints || 0}</StatNumber>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack spacing={3}>
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg="blue.100"
                    color="blue.600"
                  >
                    <Icon as={FaMedal} boxSize={6} />
                  </Box>
                  <Box>
                    <StatLabel>Current Rank</StatLabel>
                    <StatNumber fontSize="lg">
                      {profile.currentRank || 'Unranked'}
                    </StatNumber>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack spacing={3}>
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg="green.100"
                    color="green.600"
                  >
                    <Icon as={FaFire} boxSize={6} />
                  </Box>
                  <Box>
                    <StatLabel>Streak</StatLabel>
                    <StatNumber>{profile.streakDays || 0}</StatNumber>
                    <StatHelpText>days</StatHelpText>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack spacing={3}>
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg="orange.100"
                    color="orange.600"
                  >
                    <Icon as={FaBook} boxSize={6} />
                  </Box>
                  <Box>
                    <StatLabel>Courses</StatLabel>
                    <StatNumber>{profile.enrolledCourses || 0}</StatNumber>
                    <StatHelpText>enrolled</StatHelpText>
                  </Box>
                </HStack>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Additional Info */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <Heading size="md" mb={4}>
                  <HStack spacing={2}>
                    <Icon as={FaChartLine} />
                    <Text>Activity</Text>
                  </HStack>
                </Heading>
                <VStack align="stretch" spacing={3} divider={<Divider />}>
                  {profile.enrolledCourses > 0 && (
                    <HStack justify="space-between">
                      <Text color="gray.600">Enrolled Courses</Text>
                      <Badge colorScheme="blue">{profile.enrolledCourses}</Badge>
                    </HStack>
                  )}
                  {profile.completedCourses > 0 && (
                    <HStack justify="space-between">
                      <Text color="gray.600">Completed Courses</Text>
                      <Badge colorScheme="green">{profile.completedCourses}</Badge>
                    </HStack>
                  )}
                  {profile.certificates > 0 && (
                    <HStack justify="space-between">
                      <Text color="gray.600">Certificates</Text>
                      <Badge colorScheme="purple">{profile.certificates}</Badge>
                    </HStack>
                  )}
                  {!profile.enrolledCourses && !profile.completedCourses && (
                    <Text color="gray.500" textAlign="center" py={4}>
                      No activity to display
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <Heading size="md" mb={4}>
                  <HStack spacing={2}>
                    <Icon as={FaShieldAlt} />
                    <Text>Achievements</Text>
                  </HStack>
                </Heading>
                <VStack align="stretch" spacing={3}>
                  {profile.totalPoints >= 1000 && (
                    <HStack>
                      <Icon as={FaStar} color="yellow.400" />
                      <Text fontSize="sm">Points Master</Text>
                    </HStack>
                  )}
                  {profile.streakDays >= 7 && (
                    <HStack>
                      <Icon as={FaFire} color="orange.400" />
                      <Text fontSize="sm">7 Day Streak</Text>
                    </HStack>
                  )}
                  {profile.completedCourses >= 5 && (
                    <HStack>
                      <Icon as={FaBook} color="blue.400" />
                      <Text fontSize="sm">Course Enthusiast</Text>
                    </HStack>
                  )}
                  {!profile.totalPoints && !profile.streakDays && (
                    <Text color="gray.500" textAlign="center" py={4}>
                      No achievements yet
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default PublicUserProfile;
