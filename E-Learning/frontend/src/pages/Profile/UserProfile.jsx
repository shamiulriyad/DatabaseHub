import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import TeacherApplicationModal from '../../components/TeacherApplicationModal';
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
  Badge,
  useColorModeValue,
  Icon,
  Spinner,
  useToast,
  Divider,
  Progress,
} from '@chakra-ui/react';
import {
  FaEdit,
  FaBook,
  FaTrophy,
  FaFire,
  FaCertificate,
  FaEnvelope,
  FaUser,
  FaCalendar,
  FaStar,
  FaGraduationCap,
  FaChartLine,
} from 'react-icons/fa';
import axios from 'axios';

const UserProfile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('linear(135deg, purple.600, blue.600)', 'linear(135deg, purple.700, blue.700)');

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5145/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setProfile(response.data.user);
        // Fetch stats (mock for now)
        setStats({
          enrolledCourses: 5,
          completedCourses: 2,
          certificates: 2,
          totalPoints: 1250,
          currentRank: 'Gold',
          streakDays: 7,
          completionRate: 40,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.error('Error response:', error.response?.data);
      
      // Don't show error toast, just use localStorage data as fallback
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (localUser && localUser.email) {
        setProfile(localUser);
        setStats({
          enrolledCourses: 0,
          completedCourses: 0,
          certificates: 0,
          totalPoints: localUser.totalPoints || 0,
          currentRank: localUser.currentRank || 'Unranked',
          streakDays: 0,
          completionRate: 0,
        });
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load profile data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Box>
    );
  }

  const displayProfile = profile || authUser || JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Box minH="100vh" bg={bgColor} py={12}>
      <Container maxW="6xl">
        {/* Hero Header with Profile */}
        <Box bgGradient={headerBg} borderRadius="2xl" p={{ base: 6, md: 8 }} mb={8} color="white" shadow="2xl">
          <Grid templateColumns={{ base: '1fr', md: 'auto 1fr' }} gap={{ base: 6, md: 8 }} alignItems="center">
            {/* Avatar */}
            <Box display="flex" justifyContent={{ base: 'center', md: 'flex-start' }}>
              <Avatar
                size="2xl"
                name={`${displayProfile.firstName || ''} ${displayProfile.lastName || ''}`}
                src={displayProfile.avatar}
                bg="whiteAlpha.300"
                color="white"
                borderWidth={4}
                borderColor="white"
              />
            </Box>

            {/* Profile Info */}
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={3} w="full">
              <VStack align={{ base: 'center', md: 'flex-start' }} spacing={1} w="full">
                <Heading as="h1" size="2xl" fontWeight="black">
                  {displayProfile.firstName} {displayProfile.lastName}
                </Heading>
                <HStack spacing={2} fontSize="sm" opacity={0.9}>
                  <Icon as={FaUser} />
                  <Text>@{displayProfile.username}</Text>
                </HStack>
              </VStack>

              <HStack spacing={3} wrap="wrap">
                {displayProfile.isStudent && (
                  <Badge colorScheme="cyan" px={3} py={1} borderRadius="full">Student</Badge>
                )}
                {displayProfile.isTeacher && (
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">Teacher</Badge>
                )}
                {displayProfile.isAdmin && (
                  <Badge colorScheme="red" px={3} py={1} borderRadius="full">Admin</Badge>
                )}
                {displayProfile.isCompetitor && (
                  <Badge colorScheme="orange" px={3} py={1} borderRadius="full">Competitor</Badge>
                )}
              </HStack>

              <HStack spacing={6} pt={2}>
                <HStack spacing={2} fontSize="sm" opacity={0.9}>
                  <Icon as={FaEnvelope} />
                  <Text>{displayProfile.email}</Text>
                </HStack>
                <HStack spacing={2} fontSize="sm" opacity={0.9}>
                  <Icon as={FaCalendar} />
                  <Text>
                    Joined {new Date(displayProfile.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </HStack>
              </HStack>

              {/* Action Buttons */}
              <HStack spacing={3} pt={2}>
                <Button
                  size="sm"
                  bg="white"
                  color="purple.600"
                  leftIcon={<FaEdit />}
                  onClick={() => navigate('/profile/edit')}
                  _hover={{ bg: 'gray.100' }}
                  fontWeight="600"
                >
                  Edit Profile
                </Button>
                {!displayProfile.isTeacher && !displayProfile.isAdmin && (
                  <TeacherApplicationModal userId={displayProfile.id} />
                )}
              </HStack>
            </VStack>
          </Grid>
        </Box>

        {/* Statistics Grid */}
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
          {/* Enrolled Courses */}
          <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden" _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s">
            <Box bgGradient="linear(135deg, blue.400, blue.600)" h="3px" />
            <CardBody p={6}>
              <HStack justify="space-between" mb={3}>
                <Icon as={FaBook} fontSize="2xl" color="blue.500" />
                <Text fontSize="xs" color="gray.500" fontWeight="600">ENROLLED</Text>
              </HStack>
              <Heading size="lg" mb={1}>{stats?.enrolledCourses || 0}</Heading>
              <Text fontSize="sm" color="gray.600">Active courses</Text>
            </CardBody>
          </Card>

          {/* Completed Courses */}
          <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden" _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s">
            <Box bgGradient="linear(135deg, green.400, green.600)" h="3px" />
            <CardBody p={6}>
              <HStack justify="space-between" mb={3}>
                <Icon as={FaTrophy} fontSize="2xl" color="green.500" />
                <Text fontSize="xs" color="gray.500" fontWeight="600">COMPLETED</Text>
              </HStack>
              <Heading size="lg" mb={1}>{stats?.completedCourses || 0}</Heading>
              <Text fontSize="sm" color="gray.600">Finished courses</Text>
            </CardBody>
          </Card>

          {/* Certificates */}
          <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden" _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s">
            <Box bgGradient="linear(135deg, purple.400, purple.600)" h="3px" />
            <CardBody p={6}>
              <HStack justify="space-between" mb={3}>
                <Icon as={FaCertificate} fontSize="2xl" color="purple.500" />
                <Text fontSize="xs" color="gray.500" fontWeight="600">CERTIFICATES</Text>
              </HStack>
              <Heading size="lg" mb={1}>{stats?.certificates || 0}</Heading>
              <Text fontSize="sm" color="gray.600">Earned credentials</Text>
            </CardBody>
          </Card>

          {/* Points & Streak */}
          <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden" _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s">
            <Box bgGradient="linear(135deg, orange.400, red.500)" h="3px" />
            <CardBody p={6}>
              <HStack justify="space-between" mb={3}>
                <Icon as={FaFire} fontSize="2xl" color="orange.500" />
                <Text fontSize="xs" color="gray.500" fontWeight="600">STREAK</Text>
              </HStack>
              <Heading size="lg" mb={1}>{stats?.streakDays || 0} days</Heading>
              <Text fontSize="sm" color="gray.600">Keep it up!</Text>
            </CardBody>
          </Card>
        </Grid>

        {/* Progress & Rank Section */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={8}>
          {/* Completion Progress */}
          <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor}>
            <CardBody p={6}>
              <HStack justify="space-between" mb={4}>
                <Heading size="md">Learning Progress</Heading>
                <Icon as={FaChartLine} color="purple.500" />
              </HStack>
              <VStack spacing={6} align="stretch">
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="600">Course Completion</Text>
                    <Text fontSize="sm" color="purple.600" fontWeight="bold">{stats?.completionRate || 0}%</Text>
                  </HStack>
                  <Progress value={stats?.completionRate || 0} colorScheme="purple" borderRadius="full" h="8px" />
                </VStack>
                <Divider />
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Total Points Earned</Text>
                    <Heading size="md" color="yellow.500">{displayProfile.totalPoints || 0}</Heading>
                  </VStack>
                  <Icon as={FaStar} fontSize="3xl" color="yellow.500" />
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Current Rank */}
          <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor}>
            <CardBody p={6}>
              <VStack spacing={6} justify="center" h="full">
                <Icon as={FaTrophy} fontSize="4xl" color="orange.500" />
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="600">CURRENT RANK</Text>
                  <Heading size="lg" color="orange.500">{displayProfile.currentRank || 'Unranked'}</Heading>
                </VStack>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Earn more points to level up your rank
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Card bg={cardBg} shadow="lg" borderWidth="1px" borderColor={borderColor}>
          <CardBody p={6}>
            <Heading size="md" mb={6}>Quick Actions</Heading>
            <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
              <Button
                flexDir="column"
                h="auto"
                py={6}
                variant="outline"
                colorScheme="purple"
                onClick={() => navigate('/profile/enrollments')}
                _hover={{ bg: 'purple.50', borderColor: 'purple.600' }}
                transition="all 0.2s"
              >
                <Icon as={FaBook} fontSize="2xl" mb={2} />
                <Text fontWeight="600">My Courses</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>View & continue</Text>
              </Button>

              <Button
                flexDir="column"
                h="auto"
                py={6}
                variant="outline"
                colorScheme="green"
                onClick={() => navigate('/profile/certificates')}
                _hover={{ bg: 'green.50', borderColor: 'green.600' }}
                transition="all 0.2s"
              >
                <Icon as={FaCertificate} fontSize="2xl" mb={2} />
                <Text fontWeight="600">Certificates</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>View earned</Text>
              </Button>

              <Button
                flexDir="column"
                h="auto"
                py={6}
                variant="outline"
                colorScheme="blue"
                onClick={() => navigate('/profile/assignments')}
                _hover={{ bg: 'blue.50', borderColor: 'blue.600' }}
                transition="all 0.2s"
              >
                <Icon as={FaGraduationCap} fontSize="2xl" mb={2} />
                <Text fontWeight="600">Assignments</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>Submit & review</Text>
              </Button>

              <Button
                flexDir="column"
                h="auto"
                py={6}
                bg="linear(135deg, purple.600, blue.600)"
                color="white"
                onClick={() => navigate('/dashboard')}
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <Icon as={FaChartLine} fontSize="2xl" mb={2} />
                <Text fontWeight="600">Dashboard</Text>
                <Text fontSize="xs" opacity={0.9} mt={1}>View analytics</Text>
              </Button>
            </Grid>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default UserProfile;
