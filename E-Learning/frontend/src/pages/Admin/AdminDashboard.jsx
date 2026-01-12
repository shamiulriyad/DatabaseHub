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
  StatArrow,
  SimpleGrid,
  VStack,
  HStack,
  Divider,
  Badge,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
  useColorModeValue
} from '@chakra-ui/react';
import {
  FiUsers,
  FiBook,
  FiDollarSign,
  FiTrendingUp,
  FiUserCheck,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiBarChart2,
  FiActivity
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalCourses: 0,
    pendingTeachers: 0,
    activeCourses: 0,
    totalRevenue: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    courseCompletionRate: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchDashboardData();
    // Refresh stats every 15 seconds for real-time updates
    const interval = setInterval(() => {
      console.log('Auto-refreshing admin stats...');
      fetchDashboardData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      console.log('Fetching admin stats...');
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('User:', localStorage.getItem('user'));

      // Fetch platform stats from /api/admin/stats
      const statsRes = await api.get('/admin/stats');

      console.log('Stats response status:', statsRes.status);
      console.log('Stats response data:', statsRes.data);

      if (statsRes.data && statsRes.data.success && statsRes.data.stats) {
        const apiStats = statsRes.data.stats || {};

        // Normalize PascalCase -> camelCase so UI bindings work
        const mappedStats = {
          totalUsers: apiStats.totalUsers ?? apiStats.TotalUsers ?? 0,
          totalTeachers: apiStats.totalTeachers ?? apiStats.TotalTeachers ?? 0,
          totalStudents: apiStats.totalStudents ?? apiStats.TotalStudents ?? 0,
          totalCourses: apiStats.totalCourses ?? apiStats.TotalCourses ?? 0,
          pendingTeachers: apiStats.pendingTeachers ?? apiStats.PendingTeachers ?? 0,
          activeCourses: apiStats.activeCourses ?? apiStats.ActiveCourses ?? 0,
          totalRevenue: apiStats.totalRevenue ?? apiStats.TotalRevenue ?? 0,
          activeUsers: apiStats.activeUsers ?? apiStats.ActiveUsers ?? 0,
          newUsersThisMonth: apiStats.newUsersThisMonth ?? apiStats.NewUsersThisMonth ?? 0,
          courseCompletionRate: apiStats.courseCompletionRate ?? apiStats.CourseCompletionRate ?? 0
        };

        console.log('Setting stats with data:', mappedStats);
        setStats(mappedStats);
        console.log('Stats updated successfully:', mappedStats);
      } else {
        console.error('Invalid stats response structure:', statsRes.data);
        toast({
          title: 'Warning',
          description: 'Stats data not in expected format',
          status: 'warning',
          duration: 3000
        });
      }

      // Fetch pending teacher applications from /api/admin/teacher-approvals/pending
      try {
        const teacherRes = await api.get('/admin/teacher-approvals/pending?page=1&pageSize=5');
        if (teacherRes.data.success) {
          setPendingRequests(teacherRes.data.data || []);
        }
      } catch (teacherError) {
        console.warn('Failed to fetch teacher approvals:', teacherError);
      }

      // Mock recent activities (to be replaced with real API)
      setRecentActivities([
        { action: 'New user registered', user: 'John Doe', time: '5 mins ago' },
        { action: 'Course published', user: 'Teacher Jane', time: '1 hour ago' },
        { action: 'Payment received', user: 'Student Mike', time: '2 hours ago' }
      ]);

      // Mock top courses (to be replaced with real API)
      setTopCourses([
        { title: 'Web Development Bootcamp', students: 245, rating: 4.8 },
        { title: 'Data Science Fundamentals', students: 198, rating: 4.7 },
        { title: 'Mobile App Development', students: 167, rating: 4.6 }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch dashboard data';
      console.error('Final error message:', errorMsg);
      
      toast({
        title: 'Error Fetching Stats',
        description: errorMsg,
        status: 'error',
        duration: 5000
      });
    } finally {
      if (!silent) setLoading(false);
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
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="7xl">
        <VStack align="stretch" spacing={8}>
          {/* Header with Refresh Button */}
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Heading size="xl" mb={2}>Admin Dashboard</Heading>
              <Text color="gray.600">Platform overview and management</Text>
            </Box>
            <Button 
              colorScheme="purple" 
              size="sm"
              onClick={() => {
                console.log('Manual refresh triggered');
                fetchDashboardData();
              }}
              isLoading={loading}
            >
              🔄 Refresh Stats
            </Button>
          </Flex>

          {/* Main Stats */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <Flex align="center" justify="space-between">
                    <VStack align="start" spacing={1}>
                      <StatLabel fontSize="sm" color="gray.600">Total Users</StatLabel>
                      <StatNumber fontSize="3xl">{stats.totalUsers}</StatNumber>
                      <StatHelpText mb={0}>
                        <StatArrow type="increase" />
                        +{stats.newUsersThisMonth} this month
                      </StatHelpText>
                    </VStack>
                    <Icon as={FiUsers} fontSize="40px" color="blue.500" />
                  </Flex>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <Flex align="center" justify="space-between">
                    <VStack align="start" spacing={1}>
                      <StatLabel fontSize="sm" color="gray.600">Total Courses</StatLabel>
                      <StatNumber fontSize="3xl">{stats.totalCourses}</StatNumber>
                      <StatHelpText mb={0}>
                        <StatArrow type="increase" />
                        {stats.activeCourses} active
                      </StatHelpText>
                    </VStack>
                    <Icon as={FiBook} fontSize="40px" color="green.500" />
                  </Flex>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <Flex align="center" justify="space-between">
                    <VStack align="start" spacing={1}>
                      <StatLabel fontSize="sm" color="gray.600">Pending Teachers</StatLabel>
                      <StatNumber fontSize="3xl">{stats.pendingTeachers}</StatNumber>
                      <StatHelpText mb={0}>
                        <Text fontSize="sm" color="orange.500">Needs review</Text>
                      </StatHelpText>
                    </VStack>
                    <Icon as={FiAlertCircle} fontSize="40px" color="orange.500" />
                  </Flex>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <Flex align="center" justify="space-between">
                    <VStack align="start" spacing={1}>
                      <StatLabel fontSize="sm" color="gray.600">Total Revenue</StatLabel>
                      <StatNumber fontSize="3xl">${stats.totalRevenue}</StatNumber>
                      <StatHelpText mb={0}>
                        <StatArrow type="increase" />
                        12% increase
                      </StatHelpText>
                    </VStack>
                    <Icon as={FiDollarSign} fontSize="40px" color="purple.500" />
                  </Flex>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Secondary Stats */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Flex align="center" gap={4}>
                  <Icon as={FiUserCheck} fontSize="32px" color="green.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Teachers</Text>
                    <Text fontSize="2xl" fontWeight="bold">{stats.totalTeachers}</Text>
                  </VStack>
                </Flex>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Flex align="center" gap={4}>
                  <Icon as={FiActivity} fontSize="32px" color="blue.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Active Users</Text>
                    <Text fontSize="2xl" fontWeight="bold">{stats.activeUsers}</Text>
                  </VStack>
                </Flex>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Flex align="center" gap={4}>
                  <Icon as={FiCheckCircle} fontSize="32px" color="teal.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Completion Rate</Text>
                    <Text fontSize="2xl" fontWeight="bold">{stats.courseCompletionRate}%</Text>
                  </VStack>
                </Flex>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Main Content Grid */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            {/* Pending Teacher Requests */}
            <Card bg={cardBg} shadow="md">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">
                    <HStack>
                      <Icon as={FiClock} color="orange.500" />
                      <Text>Pending Teacher Requests</Text>
                      <Badge colorScheme="orange">{stats.pendingTeachers}</Badge>
                    </HStack>
                  </Heading>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    onClick={() => navigate('/admin/teachers')}
                  >
                    View All
                  </Button>
                </Flex>
              </CardHeader>
              <Divider borderColor={borderColor} />
              <CardBody>
                {pendingRequests.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No pending requests
                  </Text>
                ) : (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Email</Th>
                          <Th>Applied</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {pendingRequests.slice(0, 5).map((request) => (
                          <Tr key={request.id}>
                            <Td fontWeight="medium">{request.firstName} {request.lastName}</Td>
                            <Td fontSize="sm">{request.userEmail}</Td>
                            <Td fontSize="sm">
                              {new Date(request.applicationDate).toLocaleDateString()}
                            </Td>
                            <Td>
                              <Button
                                size="xs"
                                colorScheme="purple"
                                onClick={() => navigate('/admin/teachers')}
                              >
                                Review
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card bg={cardBg} shadow="md">
              <CardHeader>
                <Heading size="md">
                  <HStack>
                    <Icon as={FiActivity} color="blue.500" />
                    <Text>Recent Activity</Text>
                  </HStack>
                </Heading>
              </CardHeader>
              <Divider borderColor={borderColor} />
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  {recentActivities.map((activity, index) => (
                    <Box key={index} p={3} bg={bgColor} borderRadius="md">
                      <Text fontSize="sm" fontWeight="medium">{activity.action}</Text>
                      <Text fontSize="xs" color="gray.600">{activity.user}</Text>
                      <Text fontSize="xs" color="gray.500">{activity.time}</Text>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* Top Courses */}
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md">
                  <HStack>
                    <Icon as={FiTrendingUp} color="green.500" />
                    <Text>Top Performing Courses</Text>
                  </HStack>
                </Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/admin/courses')}
                >
                  View All Courses
                </Button>
              </Flex>
            </CardHeader>
            <Divider borderColor={borderColor} />
            <CardBody>
              <VStack align="stretch" spacing={4}>
                {topCourses.map((course, index) => (
                  <Box key={index}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{course.title}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {course.students} students • {course.rating} ⭐
                        </Text>
                      </VStack>
                      <Badge colorScheme="green">#{index + 1}</Badge>
                    </Flex>
                    <Progress value={(course.students / 300) * 100} size="sm" colorScheme="green" />
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <Heading size="md">Quick Actions</Heading>
            </CardHeader>
            <Divider borderColor={borderColor} />
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Button
                  h="100px"
                  flexDirection="column"
                  gap={2}
                  onClick={() => navigate('/admin/teachers')}
                  colorScheme="purple"
                  variant="outline"
                >
                  <Icon as={FiUserCheck} fontSize="32px" />
                  <Text fontSize="sm">Approve Teachers</Text>
                </Button>

                <Button
                  h="100px"
                  flexDirection="column"
                  gap={2}
                  onClick={() => navigate('/admin/users')}
                  colorScheme="blue"
                  variant="outline"
                >
                  <Icon as={FiUsers} fontSize="32px" />
                  <Text fontSize="sm">Manage Users</Text>
                </Button>

                <Button
                  h="100px"
                  flexDirection="column"
                  gap={2}
                  onClick={() => navigate('/admin/courses')}
                  colorScheme="green"
                  variant="outline"
                >
                  <Icon as={FiBook} fontSize="32px" />
                  <Text fontSize="sm">Manage Courses</Text>
                </Button>

                <Button
                  h="100px"
                  flexDirection="column"
                  gap={2}
                  onClick={() => navigate('/admin/settings')}
                  colorScheme="gray"
                  variant="outline"
                >
                  <Icon as={FiBarChart2} fontSize="32px" />
                  <Text fontSize="sm">View Reports</Text>
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
