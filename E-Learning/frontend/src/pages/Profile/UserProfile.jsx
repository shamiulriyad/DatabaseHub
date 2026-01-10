import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="6xl">
        {/* Profile Header */}
        <Card bg={cardBg} shadow="lg" mb={6}>
          <CardBody p={8}>
            <HStack spacing={6} align="flex-start">
              <Avatar
                size="2xl"
                name={`${displayProfile.firstName || ''} ${displayProfile.lastName || ''}`}
                src={displayProfile.avatar}
                bg="purple.500"
                color="white"
              />
              <VStack align="flex-start" spacing={3} flex={1}>
                <HStack w="full" justify="space-between">
                  <VStack align="flex-start" spacing={1}>
                    <Heading size="lg">
                      {displayProfile.firstName} {displayProfile.lastName}
                    </Heading>
                    <HStack spacing={2}>
                      <Icon as={FaEnvelope} color="gray.500" />
                      <Text color="gray.600">{displayProfile.email}</Text>
                    </HStack>
                    {displayProfile.username && (
                      <HStack spacing={2}>
                        <Icon as={FaUser} color="gray.500" />
                        <Text color="gray.600">@{displayProfile.username}</Text>
                      </HStack>
                    )}
                  </VStack>
                  <Button
                    leftIcon={<FaEdit />}
                    colorScheme="purple"
                    onClick={() => navigate('/profile/edit')}
                  >
                    Edit Profile
                  </Button>
                </HStack>

                <HStack spacing={4} mt={2}>
                  {displayProfile.isStudent && (
                    <Badge colorScheme="blue" px={3} py={1}>Student</Badge>
                  )}
                  {displayProfile.isTeacher && (
                    <Badge colorScheme="green" px={3} py={1}>Teacher</Badge>
                  )}
                  {displayProfile.isAdmin && (
                    <Badge colorScheme="red" px={3} py={1}>Admin</Badge>
                  )}
                  {displayProfile.isCompetitor && (
                    <Badge colorScheme="orange" px={3} py={1}>Competitor</Badge>
                  )}
                </HStack>

                <HStack spacing={2} color="gray.500" fontSize="sm">
                  <Icon as={FaCalendar} />
                  <Text>
                    Joined {new Date(displayProfile.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Statistics */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }} gap={4} mb={6}>
          <Card bg={cardBg} shadow="md">
            <CardBody textAlign="center">
              <Icon as={FaBook} fontSize="3xl" color="blue.500" mb={2} />
              <Text fontSize="2xl" fontWeight="bold">{stats?.enrolledCourses || 0}</Text>
              <Text fontSize="sm" color="gray.600">Enrolled</Text>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md">
            <CardBody textAlign="center">
              <Icon as={FaTrophy} fontSize="3xl" color="green.500" mb={2} />
              <Text fontSize="2xl" fontWeight="bold">{stats?.completedCourses || 0}</Text>
              <Text fontSize="sm" color="gray.600">Completed</Text>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md">
            <CardBody textAlign="center">
              <Icon as={FaCertificate} fontSize="3xl" color="purple.500" mb={2} />
              <Text fontSize="2xl" fontWeight="bold">{stats?.certificates || 0}</Text>
              <Text fontSize="sm" color="gray.600">Certificates</Text>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md">
            <CardBody textAlign="center">
              <Icon as={FaStar} fontSize="3xl" color="yellow.500" mb={2} />
              <Text fontSize="2xl" fontWeight="bold">{displayProfile.totalPoints || 0}</Text>
              <Text fontSize="sm" color="gray.600">Points</Text>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md">
            <CardBody textAlign="center">
              <Icon as={FaTrophy} fontSize="3xl" color="orange.500" mb={2} />
              <Text fontSize="2xl" fontWeight="bold">{displayProfile.currentRank || 'Unranked'}</Text>
              <Text fontSize="sm" color="gray.600">Rank</Text>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md">
            <CardBody textAlign="center">
              <Icon as={FaFire} fontSize="3xl" color="red.500" mb={2} />
              <Text fontSize="2xl" fontWeight="bold">{stats?.streakDays || 0}</Text>
              <Text fontSize="sm" color="gray.600">Day Streak</Text>
            </CardBody>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Card bg={cardBg} shadow="lg">
          <CardBody p={6}>
            <Heading size="md" mb={4}>Quick Actions</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
              <Button
                variant="outline"
                colorScheme="purple"
                leftIcon={<FaBook />}
                onClick={() => navigate('/profile/enrollments')}
                w="full"
              >
                My Courses
              </Button>
              <Button
                variant="outline"
                colorScheme="green"
                leftIcon={<FaCertificate />}
                onClick={() => navigate('/profile/certificates')}
                w="full"
              >
                Certificates
              </Button>
              <Button
                variant="outline"
                colorScheme="blue"
                leftIcon={<FaEdit />}
                onClick={() => navigate('/profile/assignments')}
                w="full"
              >
                Assignments
              </Button>
              <Button
                variant="outline"
                colorScheme="orange"
                leftIcon={<FaTrophy />}
                onClick={() => navigate('/dashboard')}
                w="full"
              >
                Dashboard
              </Button>
            </Grid>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default UserProfile;
