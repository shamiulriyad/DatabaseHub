import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  Flex,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  VStack,
  HStack,
  Divider,
  Badge,
  Spinner,
  useToast,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
import { FiBook, FiUsers, FiStar, FiDollarSign, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalReviews: 0,
    averageRating: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Fetch user profile
        const profileRes = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeacher(profileRes.data.user);

        // Fetch teacher's courses
        const coursesRes = await axios.get('/api/courses/created-courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(coursesRes.data.courses || []);

        // Calculate stats
        const totalStudents = coursesRes.data.courses?.reduce((sum, course) => sum + (course.totalEnrolled || 0), 0) || 0;
        const avgRating = coursesRes.data.courses?.length > 0 
          ? (coursesRes.data.courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / coursesRes.data.courses.length).toFixed(2)
          : 0;

        setStats({
          totalCourses: coursesRes.data.courses?.length || 0,
          totalStudents: totalStudents,
          totalReviews: 0,
          averageRating: parseFloat(avgRating),
          totalEarnings: 0
        });

      } catch (error) {
        console.error('Error fetching dashboard:', error);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setTeacher(user);
        toast({
          title: 'Note',
          description: 'Using cached data. Some information may not be up-to-date.',
          status: 'info',
          duration: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header */}
      <VStack align="stretch" spacing={8}>
        {/* Welcome Section */}
        <Box bg="gradient.blue" borderRadius="lg" p={6} color="white">
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={2}>
              <Heading size="lg">Welcome back, {teacher?.firstName}! 👋</Heading>
              <Text fontSize="md">Manage your courses and track student progress</Text>
            </VStack>
            <Button
              size="lg"
              bg="white"
              color="blue.600"
              onClick={() => navigate('/teacher/create-course')}
              leftIcon={<FiPlus />}
              _hover={{ bg: 'gray.100' }}
            >
              Create Course
            </Button>
          </Flex>
        </Box>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <Flex align="center" gap={3}>
                  <Icon as={FiBook} fontSize="24px" color="blue.500" />
                  <VStack align="start" spacing={0}>
                    <StatLabel>Total Courses</StatLabel>
                    <StatNumber>{stats.totalCourses}</StatNumber>
                  </VStack>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <Flex align="center" gap={3}>
                  <Icon as={FiUsers} fontSize="24px" color="green.500" />
                  <VStack align="start" spacing={0}>
                    <StatLabel>Total Students</StatLabel>
                    <StatNumber>{stats.totalStudents}</StatNumber>
                  </VStack>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <Flex align="center" gap={3}>
                  <Icon as={FiStar} fontSize="24px" color="yellow.500" />
                  <VStack align="start" spacing={0}>
                    <StatLabel>Avg Rating</StatLabel>
                    <StatNumber>{stats.averageRating}</StatNumber>
                  </VStack>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <Flex align="center" gap={3}>
                  <Icon as={FiDollarSign} fontSize="24px" color="purple.500" />
                  <VStack align="start" spacing={0}>
                    <StatLabel>Total Earnings</StatLabel>
                    <StatNumber>${stats.totalEarnings}</StatNumber>
                  </VStack>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <Flex align="center" gap={3}>
                  <Icon as={FiTrendingUp} fontSize="24px" color="orange.500" />
                  <VStack align="start" spacing={0}>
                    <StatLabel>Total Reviews</StatLabel>
                    <StatNumber>{stats.totalReviews}</StatNumber>
                  </VStack>
                </Flex>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Courses Section */}
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Your Courses</Heading>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => navigate('/teacher/manage-courses')}
              >
                Manage All
              </Button>
            </Flex>
          </CardHeader>
          <Divider />
          <CardBody>
            {courses.length === 0 ? (
              <VStack py={8} spacing={4}>
                <Text color="gray.500">No courses created yet</Text>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiPlus />}
                  onClick={() => navigate('/teacher/create-course')}
                >
                  Create Your First Course
                </Button>
              </VStack>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Course Title</Th>
                      <Th>Status</Th>
                      <Th>Students</Th>
                      <Th>Rating</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {courses.slice(0, 5).map((course) => (
                      <Tr key={course.id}>
                        <Td>
                          <Flex align="center" gap={3}>
                            <Box>
                              <Text fontWeight="bold">{course.title}</Text>
                              <Text fontSize="sm" color="gray.500">{course.category}</Text>
                            </Box>
                          </Flex>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              course.status === 'Approved' ? 'green' :
                              course.status === 'Pending' ? 'yellow' :
                              'red'
                            }
                          >
                            {course.status}
                          </Badge>
                        </Td>
                        <Td>{course.totalEnrolled || 0}</Td>
                        <Td>
                          <Flex align="center" gap={1}>
                            <Icon as={FiStar} color="yellow.500" />
                            <Text>{course.averageRating || 0}</Text>
                          </Flex>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/courses/${course.id}/edit`)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => navigate(`/teacher/course/${course.id}/submissions`)}
                            >
                              Submissions
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Quick Links */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card cursor="pointer" _hover={{ shadow: 'md' }} onClick={() => navigate('/teacher/create-course')}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiPlus} fontSize="32px" color="blue.500" />
                <Text fontWeight="bold" textAlign="center">Create Course</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card cursor="pointer" _hover={{ shadow: 'md' }} onClick={() => navigate('/teacher/manage-courses')}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiBook} fontSize="32px" color="green.500" />
                <Text fontWeight="bold" textAlign="center">My Courses</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card cursor="pointer" _hover={{ shadow: 'md' }} onClick={() => navigate('/teacher/submissions')}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiUsers} fontSize="32px" color="orange.500" />
                <Text fontWeight="bold" textAlign="center">Submissions</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card cursor="pointer" _hover={{ shadow: 'md' }} onClick={() => navigate('/teacher/reviews')}>
            <CardBody>
              <VStack spacing={3}>
                <Icon as={FiStar} fontSize="32px" color="yellow.500" />
                <Text fontWeight="bold" textAlign="center">Reviews</Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default TeacherDashboard;
