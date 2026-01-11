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
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiBook, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    inProgress: 0,
    completed: 0,
    totalPoints: 0,
    averageGrade: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch enrollments
      try {
        const enrollRes = await api.get('/enrollments/user');
        
        if (enrollRes.data.success && enrollRes.data.data) {
          setEnrollments(enrollRes.data.data.slice(0, 5)); // Show 5 most recent
          
          // Calculate stats
          const completed = enrollRes.data.data.filter(e => e.status === 'Completed').length;
          const inProgress = enrollRes.data.data.filter(e => e.status === 'In Progress').length;
          
          setStats(prev => ({
            ...prev,
            totalEnrolled: enrollRes.data.data.length,
            completed: completed,
            inProgress: inProgress
          }));
        }
      } catch (err) {
        console.error('Error fetching enrollments:', err);
      }

      // Fetch assignments
      try {
        const assignRes = await api.get('/assignments/user');
        
        if (assignRes.data.success && assignRes.data.data) {
          setAssignments(assignRes.data.data.slice(0, 5)); // Show 5 most recent
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
      }

      // Update with user data
      if (user) {
        setStats(prev => ({
          ...prev,
          totalPoints: user.totalPoints || 0,
          averageGrade: user.averageGrade || 0
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="purple.500" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Welcome back, {user?.firstName}! 👋
          </Heading>
          <Text color="gray.500">
            Here's an overview of your learning progress
          </Text>
        </Box>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Total Enrolled</StatLabel>
                <StatNumber color="purple.500" fontSize="2xl">{stats.totalEnrolled}</StatNumber>
                <StatHelpText>courses</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>In Progress</StatLabel>
                <StatNumber color="blue.500" fontSize="2xl">{stats.inProgress}</StatNumber>
                <StatHelpText>active courses</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Completed</StatLabel>
                <StatNumber color="green.500" fontSize="2xl">{stats.completed}</StatNumber>
                <StatHelpText>courses finished</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Total Points</StatLabel>
                <StatNumber color="orange.500" fontSize="2xl">{stats.totalPoints}</StatNumber>
                <StatHelpText>earned</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Average Grade</StatLabel>
                <StatNumber color="teal.500" fontSize="2xl">
                  {stats.averageGrade.toFixed(1)}%
                </StatNumber>
                <StatHelpText>overall</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Recent Courses */}
        <Card bg={cardBg}>
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Recent Courses</Heading>
              <Button 
                size="sm" 
                colorScheme="purple" 
                variant="outline"
                onClick={() => navigate('/profile/enrollments')}
              >
                View All
              </Button>
            </Flex>
          </CardHeader>
          <Divider my={4} />
          <CardBody>
            {enrollments.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {enrollments.map(enrollment => (
                  <Box key={enrollment.id} p={4} bg={bgColor} rounded="lg">
                    <HStack justify="space-between" mb={3}>
                      <VStack align="start" spacing={1}>
                        <Heading size="sm">{enrollment.courseTitle}</Heading>
                        <HStack spacing={2}>
                          <Badge colorScheme="purple">{enrollment.status}</Badge>
                          {enrollment.progress && (
                            <Text fontSize="sm" color="gray.500">
                              {enrollment.progress}% complete
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                      <Button 
                        size="sm" 
                        colorScheme="purple"
                        onClick={() => navigate(`/courses/${enrollment.courseId}`)}
                      >
                        Continue
                      </Button>
                    </HStack>
                    {enrollment.progress && (
                      <Progress value={enrollment.progress} colorScheme="purple" rounded="full" />
                    )}
                  </Box>
                ))}
              </VStack>
            ) : (
              <VStack spacing={4} py={8} align="center">
                <Icon as={FiBook} w={12} h={12} color="gray.300" />
                <Text color="gray.500">No courses enrolled yet</Text>
                <Button 
                  colorScheme="purple"
                  onClick={() => navigate('/courses')}
                >
                  Browse Courses
                </Button>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Pending Assignments */}
        <Card bg={cardBg}>
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Pending Assignments</Heading>
              <Button 
                size="sm" 
                colorScheme="purple" 
                variant="outline"
                onClick={() => navigate('/profile/assignments')}
              >
                View All
              </Button>
            </Flex>
          </CardHeader>
          <Divider my={4} />
          <CardBody>
            {assignments.length > 0 ? (
              <TableContainer>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Assignment</Th>
                      <Th>Course</Th>
                      <Th>Due Date</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {assignments.map(assignment => (
                      <Tr key={assignment.id}>
                        <Td>{assignment.title}</Td>
                        <Td>{assignment.courseTitle}</Td>
                        <Td>
                          {assignment.dueDate 
                            ? new Date(assignment.dueDate).toLocaleDateString()
                            : 'N/A'
                          }
                        </Td>
                        <Td>
                          <Badge colorScheme={
                            assignment.status === 'Submitted' ? 'green' :
                            assignment.status === 'Graded' ? 'blue' : 'orange'
                          }>
                            {assignment.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <VStack spacing={4} py={8} align="center">
                <Icon as={FiCheckCircle} w={12} h={12} color="gray.300" />
                <Text color="gray.500">No pending assignments</Text>
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default StudentDashboard;
