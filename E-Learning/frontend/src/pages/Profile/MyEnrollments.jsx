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
  Card,
  CardBody,
  Image,
  Badge,
  Progress,
  Grid,
  useColorModeValue,
  Spinner,
  Icon,
  Flex,
  Avatar,
} from '@chakra-ui/react';
import { FaArrowLeft, FaBook, FaPlay, FaClock, FaStar, FaUser } from 'react-icons/fa';
import api from '../../services/api';

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const backToProfileHoverBg = useColorModeValue('gray.100', 'gray.700');
  const progressBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    console.log('MyEnrollments mounted. User:', user);
    fetchEnrollments();
    const handler = (e) => {
      console.log('Received enrollmentUpdated event:', e?.detail);
      // small delay to allow backend DB transaction to commit
      setTimeout(() => fetchEnrollments(), 800);
    };
    window.addEventListener('enrollmentUpdated', handler);
    return () => window.removeEventListener('enrollmentUpdated', handler);
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/enrollments');
      console.debug('GET /enrollments response (raw):', response.data);

      let raw = [];
      if (response.data) {
        if (Array.isArray(response.data)) raw = response.data;
        else if (response.data.data && Array.isArray(response.data.data)) raw = response.data.data;
        else if (response.data.success && Array.isArray(response.data.data)) raw = response.data.data;
        else raw = [];
      }

        const normalized = raw.map(e => ({
        id: e.Id ?? e.id,
        courseId: e.CourseId ?? e.courseId ?? e.course?.id ?? null,
        courseTitle: e.CourseTitle ?? e.courseTitle ?? e.title ?? e.course?.title,
        instructor: e.Instructor ?? e.instructor ?? e.course?.teacherName ?? '',
        instructorAvatar: e.InstructorAvatar ?? e.instructorAvatar ?? e.course?.teacherAvatar ?? e.course?.teacher?.profileImageUrl ?? null,
        progress: e.ProgressPercentage ?? e.progressPercentage ?? e.progress ?? 0,
        // try TotalLessons, fallback to CourseTotalLessons if present
        totalLessons: e.TotalLessons ?? e.totalLessons ?? e.total_lessons ?? e.CourseTotalLessons ?? e.course?.totalLessons ?? 0,
        completedLessons: (e.CompletedLessons ?? e.completedLessons ?? e.completed_lessons ?? 0) || (
          // if completed missing but we have progress and total, compute it on the client as a last resort
          (function() {
            const pct = e.ProgressPercentage ?? e.progressPercentage ?? e.progress ?? 0;
            const total = e.TotalLessons ?? e.totalLessons ?? e.total_lessons ?? e.CourseTotalLessons ?? e.course?.totalLessons ?? 0;
            if (total && pct) return Math.round((pct / 100) * total);
            return 0;
          })()
        ),
        status: e.Status ?? e.status ?? '',
        enrolledDate: e.EnrolledAt ?? e.enrolledAt ?? e.enrolledDate ?? null,
        rating: e.Rating ?? e.rating ?? 0,
        bannerUrl: e.CourseBannerUrl ?? e.courseBannerUrl ?? e.course?.bannerUrl ?? e.course?.BannerUrl ?? null,
      }));
      setEnrollments(normalized);
      console.debug('Normalized enrollments:', normalized);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
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

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="6xl">
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          mb={6}
          onClick={() => navigate('/profile')}
          _hover={{ bg: backToProfileHoverBg }}
        >
          Back to Profile
        </Button>

        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={2}>
              <Heading size="lg" fontWeight="bold">
                My Courses
              </Heading>
              <Text color="gray.600">
                {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
              </Text>
            </VStack>
            <Button
              colorScheme="purple"
              onClick={() => navigate('/courses')}
              size="lg"
              px={6}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              Browse More Courses
            </Button>
          </Flex>

          {enrollments.length === 0 ? (
            <Card bg={cardBg} shadow="lg" borderRadius="xl">
              <CardBody p={12} textAlign="center">
                <Icon as={FaBook} fontSize="5xl" color="purple.500" mb={4} />
                <Heading size="md" mb={2} color="gray.700">
                  No Enrollments Yet
                </Heading>
                <Text color="gray.600" mb={6} fontSize="lg">
                  Start your learning journey today!
                </Text>
                <Button
                  colorScheme="purple"
                  size="lg"
                  onClick={() => navigate('/courses')}
                  px={8}
                >
                  Explore Courses
                </Button>
              </CardBody>
            </Card>
          ) : (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
              {enrollments.map((enrollment) => (
                <Card
                  key={enrollment.id}
                  bg={cardBg}
                  shadow="lg"
                  borderRadius="xl"
                  border="1px"
                  borderColor={borderColor}
                  transition="all 0.3s"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: 'xl',
                    borderColor: enrollment.progress === 100 ? 'green.400' : 'purple.400',
                  }}
                  overflow="hidden"
                  position="relative"
                >
                  {/* Progress ribbon */}
                  <Box
                    position="absolute"
                    top={0}
                    right={0}
                    bg={enrollment.progress === 100 ? 'green.500' : 'purple.500'}
                    color="white"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="bold"
                    borderBottomLeftRadius="md"
                    zIndex={2}
                  >
                    {enrollment.progress}%
                  </Box>

                  {enrollment.bannerUrl ? (
                    <Image
                      src={enrollment.bannerUrl}
                      alt={enrollment.courseTitle}
                      objectFit="cover"
                      w="100%"
                      h="160px"
                      borderTopRadius="xl"
                    />
                  ) : (
                    <Box
                      bgGradient="linear(to-r, purple.600, pink.600)"
                      h="160px"
                      borderTopRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FaBook} fontSize="4xl" color="white" opacity={0.8} />
                    </Box>
                  )}

                  <CardBody p={5}>
                    <VStack align="stretch" spacing={4}>
                      {/* Course Header */}
                      <Flex justify="space-between" align="center">
                        <Badge
                          colorScheme={enrollment.progress === 100 ? 'green' : 'blue'}
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {enrollment.status}
                        </Badge>
                        <HStack spacing={1}>
                          <Icon as={FaStar} color="yellow.400" />
                          <Text fontWeight="bold" fontSize="sm">
                            {enrollment.rating}
                          </Text>
                        </HStack>
                      </Flex>

                      {/* Course Info */}
                      <Box>
                        <Heading size="md" mb={2} fontWeight="700" lineHeight="tall">
                          {enrollment.courseTitle}
                        </Heading>
                        <Flex align="center" gap={2}>
                          <Avatar
                            size="xs"
                            name={enrollment.instructor}
                            src={enrollment.instructorAvatar}
                            bg="purple.500"
                          />
                          <Text color="gray.600" fontSize="sm">
                            By {enrollment.instructor}
                          </Text>
                        </Flex>
                      </Box>

                      {/* Progress Bar */}
                      <Box>
                        <Flex justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            Progress
                          </Text>
                          <Text fontSize="sm" fontWeight="bold" color="purple.600">
                            {enrollment.completedLessons}/{enrollment.totalLessons} lessons
                          </Text>
                        </Flex>
                        <Progress
                          value={enrollment.progress}
                          colorScheme={enrollment.progress === 100 ? 'green' : 'purple'}
                          borderRadius="full"
                          height="8px"
                          bg={progressBg}
                        />
                      </Box>

                      {/* Enrollment Date */}
                      <Flex align="center" gap={2} color="gray.500" fontSize="sm">
                        <Icon as={FaClock} />
                        <Text>
                          Enrolled {new Date(enrollment.enrolledDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </Flex>

                      {/* Action Button */}
                      <Button
                        colorScheme={enrollment.progress === 100 ? 'green' : 'purple'}
                        leftIcon={<FaPlay />}
                        onClick={() => navigate(`/courses/${enrollment.courseId || enrollment.id}`)}
                        size="lg"
                        mt={2}
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'md',
                        }}
                        transition="all 0.2s"
                      >
                        {enrollment.progress === 100 ? 'Review Course' : 'Continue Learning'}
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default MyEnrollments;