import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  VStack,
  HStack,
  Divider,
  Badge,
  useToast,
  Progress,
  useColorModeValue,
  Icon,
  Image,
  Avatar,
  Grid,
} from '@chakra-ui/react';
import { FiBook, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import competitionService from '../../services/competitionService';
import { enrollmentService } from '../../services/enrollmentService';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const emptyStateColor = useColorModeValue('gray.100', 'gray.700');
  const progressBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/dashboard');
      console.debug('GET /auth/dashboard response:', response.data);
      const dash = response.data?.dashboard || response.data?.data || {};

      const recentRaw = dash.RecentEnrollments || dash.recentEnrollments || dash.recent_enrollments || [];
      const normalizedEnrollments = (recentRaw || []).map((e) => ({
        id: e.Id ?? e.id,
        courseId: e.CourseId ?? e.courseId ?? e.course?.id,
        courseTitle: e.CourseTitle ?? e.courseTitle ?? e.course?.title ?? e.Course?.Title ?? e.course?.CourseTitle,
        instructor: e.Instructor ?? e.instructor ?? e.course?.teacherName ?? '',
        instructorAvatar: e.InstructorAvatar ?? e.instructorAvatar ?? e.course?.teacherAvatar ?? e.course?.teacher?.profileImageUrl ?? null,
        progress: e.ProgressPercentage ?? e.progressPercentage ?? e.progress ?? e.Progress ?? 0,
        completedLessons: e.CompletedLessons ?? e.completedLessons ?? e.completed_lessons ?? 0,
        totalLessons: e.TotalLessons ?? e.totalLessons ?? e.total_lessons ?? e.CourseTotalLessons ?? e.course?.totalLessons ?? 0,
        status: e.Status ?? e.status,
        enrolledAt: e.EnrolledAt ?? e.enrolledAt ?? e.enrolledAtUtc ?? null,
        bannerUrl: e.CourseBannerUrl ?? e.courseBannerUrl ?? e.course?.bannerUrl ?? e.Course?.BannerUrl ?? null,
      }));

      setEnrollments(normalizedEnrollments || []);

      const statsObj = dash.Stats || dash.stats || {};
      setStats({
        totalEnrolled: statsObj.TotalEnrollments ?? statsObj.totalEnrollments ?? statsObj.total_enrollments ?? 0,
        inProgress: statsObj.OngoingCourses ?? statsObj.ongoingCourses ?? statsObj.ongoing_courses ?? 0,
        completed: statsObj.CompletedCourses ?? statsObj.completedCourses ?? statsObj.completed_courses ?? 0,
      });
    } catch (error) {
      console.warn('Dashboard load failed, falling back to enrollments API', error);
      toast({
        title: 'Failed to load dashboard data',
        description: error.response?.data?.message || error.message || 'Something went wrong.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });

      try {
        const list = await enrollmentService.getUserEnrollments(1, 5);
        const stats = await enrollmentService.getStats();

        const normalized = (list || []).map(e => ({
          id: e.Id ?? e.id,
          courseId: e.CourseId ?? e.courseId ?? e.course?.id,
          courseTitle: e.CourseTitle ?? e.courseTitle ?? e.course?.title ?? e.Course?.Title,
          instructor: e.Instructor ?? e.instructor ?? e.course?.teacherName ?? '',
          instructorAvatar: e.InstructorAvatar ?? e.instructorAvatar ?? e.course?.teacherAvatar ?? e.course?.teacher?.profileImageUrl ?? null,
          progress: e.ProgressPercentage ?? e.progressPercentage ?? e.progress ?? 0,
          completedLessons: e.CompletedLessons ?? e.completedLessons ?? e.completed_lessons ?? 0,
          totalLessons: e.TotalLessons ?? e.totalLessons ?? e.total_lessons ?? e.CourseTotalLessons ?? e.course?.totalLessons ?? 0,
          status: e.Status ?? e.status,
          enrolledAt: e.EnrolledAt ?? e.enrolledAt ?? null,
        }));

        setEnrollments(normalized || []);
        setStats({
          totalEnrolled: stats?.TotalEnrollments ?? stats?.totalEnrollments ?? stats?.total_enrollments ?? (normalized?.length || 0),
          inProgress: stats?.ActiveEnrollments ?? stats?.activeEnrollments ?? 0,
          completed: stats?.CompletedEnrollments ?? stats?.completedEnrollments ?? 0,
        });
      } catch (fallbackErr) {
        console.error('Fallback enrollments load failed', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="7xl" py={8} px={{ base: 4, md: 6 }}>
        <Flex justify="center" align="center" minH="60vh">
          <VStack spacing={4}>
            <Text color="gray.500">Loading dashboard...</Text>
          </VStack>
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8} px={{ base: 4, md: 6 }}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" fontWeight="bold" mb={3}>
            Welcome back, {user?.firstName}! 👋
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Track your learning progress and achievements
          </Text>
        </Box>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          {[
            {
              label: 'Total Enrolled',
              value: stats.totalEnrolled,
              color: 'purple',
              description: 'courses',
            },
            {
              label: 'In Progress',
              value: stats.inProgress,
              color: 'blue',
              description: 'active courses',
            },
            {
              label: 'Completed',
              value: stats.completed,
              color: 'green',
              description: 'courses finished',
            },
          ].map((stat, index) => (
            <Card
              key={index}
              bg={cardBg}
              shadow="lg"
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
              transition="all 0.3s"
            >
              <CardBody p={6}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      {stat.label}
                    </Text>
                    <Heading size="2xl" color={`${stat.color}.600`}>
                      {stat.value}
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      {stat.description}
                    </Text>
                  </Box>
                  <Box 
                    w="50px" 
                    h="50px" 
                    bg={`${stat.color}.100`} 
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="xl" color={`${stat.color}.600`}>
                      {index === 0 ? '📚' : index === 1 ? '🎯' : '🏆'}
                    </Text>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </Grid>

        {/* Recent Courses */}
        <Card
          bg={cardBg}
          shadow="lg"
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
        >
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="lg">Recent Courses</Heading>
                <Text color="gray.500" fontSize="sm">
                  Continue where you left off
                </Text>
              </VStack>
              <Button
                size="md"
                colorScheme="purple"
                variant="outline"
                rightIcon={<FiArrowRight />}
                onClick={() => navigate('/profile/enrollments')}
                _hover={{ bg: 'purple.50', transform: 'translateX(4px)' }}
                transition="all 0.2s"
              >
                View All
              </Button>
            </Flex>
          </CardHeader>
          <Divider my={6} />
          <CardBody>
            {enrollments.length > 0 ? (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                {enrollments.map(enrollment => (
                  <Card
                    key={enrollment.id}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    overflow="hidden"
                    _hover={{ shadow: 'md', borderColor: 'purple.400' }}
                    transition="all 0.3s"
                  >
                    {enrollment.bannerUrl ? (
                      <Image
                        src={enrollment.bannerUrl}
                        alt={enrollment.courseTitle}
                        objectFit="cover"
                        h="140px"
                        w="100%"
                      />
                    ) : (
                      <Box 
                        h="140px" 
                        bgGradient="linear(to-r, purple.500, pink.500)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiBook} color="white" fontSize="3xl" opacity={0.8} />
                      </Box>
                    )}
                    <CardBody p={5}>
                      <VStack align="stretch" spacing={4}>
                        <Flex justify="space-between" align="start">
                          <Badge
                            colorScheme={enrollment.progress === 100 ? 'green' : 'purple'}
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                          >
                            {enrollment.status || 'In Progress'}
                          </Badge>
                          <Text fontSize="sm" color="purple.600" fontWeight="bold">
                            {enrollment.progress}%
                          </Text>
                        </Flex>

                        <Box>
                          <Heading size="md" mb={2} fontWeight="600" lineHeight="tall">
                            {enrollment.courseTitle}
                          </Heading>
                          <Flex align="center" gap={2}>
                            {enrollment.instructorAvatar ? (
                              <Avatar
                                size="sm"
                                name={enrollment.instructor}
                                src={enrollment.instructorAvatar}
                              />
                            ) : (
                              <Avatar
                                size="sm"
                                name={enrollment.instructor}
                                bg="purple.500"
                              />
                            )}
                            <Text fontSize="sm" color="gray.600">
                              {enrollment.instructor || 'Instructor'}
                            </Text>
                          </Flex>
                        </Box>

                        <Progress
                          value={enrollment.progress}
                          colorScheme="purple"
                          borderRadius="full"
                          height="2"
                          bg={progressBg}
                        />

                        {typeof enrollment.totalLessons === 'number' && enrollment.totalLessons > 0 && (
                          <Text fontSize="sm" color="gray.600">
                            {enrollment.completedLessons}/{enrollment.totalLessons} lessons
                          </Text>
                        )}

                        <Button
                          colorScheme="purple"
                          size="md"
                          onClick={() => navigate(`/courses/${enrollment.courseId || enrollment.id}`)}
                          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                          transition="all 0.2s"
                        >
                          {enrollment.progress === 100 ? 'Review Course' : 'Continue Learning'}
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            ) : (
              <VStack spacing={6} py={10} align="center">
                <Box 
                  w="80px" 
                  h="80px" 
                  bg={emptyStateColor}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiBook} w={10} h={10} color="purple.500" />
                </Box>
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="600" color="gray.700">
                    No courses enrolled yet
                  </Text>
                  <Text color="gray.500" textAlign="center">
                    Start your learning journey with our premium courses
                  </Text>
                </VStack>
                <Button
                  colorScheme="purple"
                  size="lg"
                  px={8}
                  onClick={() => navigate('/courses')}
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Browse Courses
                </Button>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Participated Competitions */}
        <Card
          bg={cardBg}
          shadow="lg"
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
        >
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="lg">Competitions</Heading>
                <Text color="gray.500" fontSize="sm">
                  Track your performance and rankings
                </Text>
              </VStack>
              <Button
                size="md"
                colorScheme="purple"
                variant="outline"
                onClick={() => navigate('/my-competitions')}
                _hover={{ bg: 'purple.50' }}
              >
                View All
              </Button>
            </Flex>
          </CardHeader>
          <Divider my={6} />
          <CardBody>
            <ParticipatedSummary />
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default StudentDashboard;

function ParticipatedSummary() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['userCompetitions'],
    queryFn: () => competitionService.getUserCompetitions(),
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const emptyStateColor = useColorModeValue('gray.100', 'gray.700');
  const participationBg = useColorModeValue('purple.50', 'purple.900');

  if (isLoading) {
    return (
      <Flex justify="center" py={8}>
        <Text color="gray.500">Loading competitions...</Text>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Text color="red.500" textAlign="center" py={8}>
        Failed to load competition data
      </Text>
    );
  }

  const count = data?.length || 0;
  const rawLatest = count > 0 ? data[0] : null;
  const latest = rawLatest ? (rawLatest.competition || rawLatest.Competition || null) : null;
  const latestScore = rawLatest ? (rawLatest.participantScore ?? rawLatest.ParticipantScore ?? null) : null;
  const latestRank = rawLatest ? (rawLatest.participantRank ?? rawLatest.ParticipantRank ?? null) : null;

  return (
    <VStack spacing={6} align="stretch">
      <Card bg={participationBg} border="1px" borderColor="purple.200">
        <CardBody p={6}>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={2}>
              <Heading size="md" color="purple.700">
                Participation Overview
              </Heading>
              <Text fontSize="xl" fontWeight="bold">
                {count} Competition{count !== 1 ? 's' : ''}
              </Text>
              <Text color="gray.600">
                Keep competing to improve your skills
              </Text>
            </VStack>
            <Box 
              w="60px" 
              h="60px" 
              bg="purple.100"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="2xl">🏅</Text>
            </Box>
          </Flex>
        </CardBody>
      </Card>

      {latest ? (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          <Card border="1px" borderColor={borderColor} borderRadius="lg">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="lg" fontWeight="600">
                  Latest Competition
                </Text>
                <Heading size="md" color="purple.600">
                  {latest.title}
                </Heading>
                <Divider />
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Your Score
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="green.600">
                      {latestScore ?? '—'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Your Rank
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="blue.600">
                      {latestRank ? `#${latestRank}` : '—'}
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          <Card border="1px" borderColor={borderColor} borderRadius="lg">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="lg" fontWeight="600">
                  Quick Actions
                </Text>
                <Text color="gray.600" fontSize="sm">
                  Ready for your next challenge?
                </Text>
                <Button
                  colorScheme="purple"
                  onClick={() => navigate('/competitions')}
                  size="lg"
                  _hover={{ transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  Join New Competition
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      ) : (
        <Card border="1px" borderColor={borderColor} borderRadius="lg">
          <CardBody p={8} textAlign="center">
            <VStack spacing={4}>
              <Box 
                w="80px" 
                h="80px" 
                bg={emptyStateColor}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="3xl">🎯</Text>
              </Box>
              <VStack spacing={2}>
                <Heading size="md">No Participation Yet</Heading>
                <Text color="gray.600">
                  Test your skills by joining exciting competitions
                </Text>
              </VStack>
              <Button
                colorScheme="purple"
                size="lg"
                onClick={() => navigate('/competitions')}
                px={8}
              >
                Browse Competitions
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}