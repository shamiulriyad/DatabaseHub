import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Badge,
  Progress,
  Grid,
  useColorModeValue,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { FaArrowLeft, FaBook, FaPlay, FaClock, FaStar } from 'react-icons/fa';
import axios from 'axios';

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5145/api/enrollments/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setEnrollments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      // Mock data for demonstration
      setEnrollments([
        {
          id: 1,
          courseTitle: 'Complete React Development',
          instructor: 'John Doe',
          progress: 75,
          totalLessons: 50,
          completedLessons: 38,
          status: 'In Progress',
          enrolledDate: '2026-01-01',
          rating: 4.5,
        },
        {
          id: 2,
          courseTitle: 'Advanced JavaScript',
          instructor: 'Jane Smith',
          progress: 100,
          totalLessons: 40,
          completedLessons: 40,
          status: 'Completed',
          enrolledDate: '2025-12-15',
          rating: 5.0,
        },
        {
          id: 3,
          courseTitle: 'Node.js Backend Development',
          instructor: 'Mike Johnson',
          progress: 45,
          totalLessons: 60,
          completedLessons: 27,
          status: 'In Progress',
          enrolledDate: '2026-01-05',
          rating: 4.8,
        },
      ]);
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
        >
          Back to Profile
        </Button>

        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Heading size="lg">My Courses</Heading>
            <Button colorScheme="purple" onClick={() => navigate('/courses')}>
              Browse More Courses
            </Button>
          </HStack>

          {enrollments.length === 0 ? (
            <Card bg={cardBg} shadow="md">
              <CardBody p={12} textAlign="center">
                <Icon as={FaBook} fontSize="5xl" color="gray.400" mb={4} />
                <Heading size="md" mb={2}>No Enrollments Yet</Heading>
                <Text color="gray.600" mb={4}>Start your learning journey today!</Text>
                <Button colorScheme="purple" onClick={() => navigate('/courses')}>
                  Explore Courses
                </Button>
              </CardBody>
            </Card>
          ) : (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} bg={cardBg} shadow="md" borderLeft="4px" borderColor={enrollment.progress === 100 ? 'green.500' : 'purple.500'}>
                  <CardBody p={6}>
                    <VStack align="stretch" spacing={4}>
                      {/* Course Header */}
                      <HStack justify="space-between">
                        <Badge
                          colorScheme={enrollment.progress === 100 ? 'green' : 'blue'}
                          px={3}
                          py={1}
                        >
                          {enrollment.status}
                        </Badge>
                        <HStack spacing={1}>
                          <Icon as={FaStar} color="yellow.400" />
                          <Text fontWeight="bold">{enrollment.rating}</Text>
                        </HStack>
                      </HStack>

                      {/* Course Info */}
                      <VStack align="stretch" spacing={2}>
                        <Heading size="md">{enrollment.courseTitle}</Heading>
                        <Text color="gray.600" fontSize="sm">By {enrollment.instructor}</Text>
                      </VStack>

                      {/* Progress */}
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.600">Progress</Text>
                          <Text fontSize="sm" fontWeight="bold">{enrollment.progress}%</Text>
                        </HStack>
                        <Progress
                          value={enrollment.progress}
                          colorScheme={enrollment.progress === 100 ? 'green' : 'purple'}
                          borderRadius="md"
                          height="8px"
                        />
                        <Text fontSize="sm" color="gray.600" mt={1}>
                          {enrollment.completedLessons} of {enrollment.totalLessons} lessons completed
                        </Text>
                      </Box>

                      {/* Details */}
                      <HStack spacing={4} fontSize="sm" color="gray.600">
                        <HStack>
                          <Icon as={FaClock} />
                          <Text>Enrolled {new Date(enrollment.enrolledDate).toLocaleDateString()}</Text>
                        </HStack>
                      </HStack>

                      {/* Action Button */}
                      <Button
                        colorScheme={enrollment.progress === 100 ? 'green' : 'purple'}
                        leftIcon={<FaPlay />}
                        onClick={() => navigate(`/courses/${enrollment.id}`)}
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
