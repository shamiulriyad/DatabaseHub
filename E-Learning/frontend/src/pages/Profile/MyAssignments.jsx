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
  Grid,
  useColorModeValue,
  Spinner,
  Icon,
  Progress,
} from '@chakra-ui/react';
import {
  FaArrowLeft,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaUpload,
} from 'react-icons/fa';

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      // Mock data for demonstration
      setTimeout(() => {
        setAssignments([
          {
            id: 1,
            title: 'Build a Todo App with React',
            courseTitle: 'Complete React Development',
            dueDate: '2026-01-20',
            status: 'Pending',
            score: null,
            maxScore: 100,
            submittedDate: null,
          },
          {
            id: 2,
            title: 'JavaScript ES6 Features',
            courseTitle: 'Advanced JavaScript',
            dueDate: '2025-12-25',
            status: 'Graded',
            score: 95,
            maxScore: 100,
            submittedDate: '2025-12-20',
          },
          {
            id: 3,
            title: 'REST API Implementation',
            courseTitle: 'Node.js Backend Development',
            dueDate: '2026-01-15',
            status: 'Submitted',
            score: null,
            maxScore: 100,
            submittedDate: '2026-01-12',
          },
          {
            id: 4,
            title: 'CSS Flexbox Layout',
            courseTitle: 'Complete React Development',
            dueDate: '2026-01-05',
            status: 'Overdue',
            score: null,
            maxScore: 100,
            submittedDate: null,
          },
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Graded':
        return 'green';
      case 'Submitted':
        return 'blue';
      case 'Pending':
        return 'orange';
      case 'Overdue':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Graded':
        return FaCheckCircle;
      case 'Submitted':
        return FaUpload;
      case 'Overdue':
        return FaExclamationCircle;
      default:
        return FaClock;
    }
  };

  const handleViewAssignment = (assignmentId) => {
    navigate(`/assignments/${assignmentId}`);
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
            <Heading size="lg">My Assignments</Heading>
            <HStack spacing={2}>
              <Badge colorScheme="orange">
                {assignments.filter((a) => a.status === 'Pending').length} Pending
              </Badge>
              <Badge colorScheme="red">
                {assignments.filter((a) => a.status === 'Overdue').length} Overdue
              </Badge>
            </HStack>
          </HStack>

          {assignments.length === 0 ? (
            <Card bg={cardBg} shadow="md">
              <CardBody p={12} textAlign="center">
                <Icon as={FaFileAlt} fontSize="5xl" color="gray.400" mb={4} />
                <Heading size="md" mb={2}>No Assignments</Heading>
                <Text color="gray.600" mb={4}>
                  You don't have any assignments yet
                </Text>
                <Button colorScheme="purple" onClick={() => navigate('/courses')}>
                  Explore Courses
                </Button>
              </CardBody>
            </Card>
          ) : (
            <Grid templateColumns={{ base: '1fr' }} gap={4}>
              {assignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  bg={cardBg}
                  shadow="md"
                  borderLeft="4px"
                  borderColor={`${getStatusColor(assignment.status)}.500`}
                >
                  <CardBody p={6}>
                    <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
                      {/* Assignment Info */}
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <VStack align="flex-start" spacing={1}>
                            <Heading size="md">{assignment.title}</Heading>
                            <Text color="gray.600" fontSize="sm">
                              {assignment.courseTitle}
                            </Text>
                          </VStack>
                          <Badge
                            colorScheme={getStatusColor(assignment.status)}
                            px={3}
                            py={1}
                            fontSize="sm"
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <Icon as={getStatusIcon(assignment.status)} />
                            {assignment.status}
                          </Badge>
                        </HStack>

                        <HStack spacing={6} fontSize="sm" color="gray.600">
                          <HStack>
                            <Icon as={FaClock} />
                            <Text>
                              Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Text>
                          </HStack>
                          {assignment.submittedDate && (
                            <HStack>
                              <Icon as={FaUpload} />
                              <Text>
                                Submitted: {new Date(assignment.submittedDate).toLocaleDateString()}
                              </Text>
                            </HStack>
                          )}
                        </HStack>

                        {assignment.status === 'Graded' && assignment.score !== null && (
                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" fontWeight="600">Score</Text>
                              <Text fontSize="lg" fontWeight="bold" color="green.500">
                                {assignment.score}/{assignment.maxScore}
                              </Text>
                            </HStack>
                            <Progress
                              value={(assignment.score / assignment.maxScore) * 100}
                              colorScheme="green"
                              borderRadius="md"
                              height="8px"
                            />
                          </Box>
                        )}
                      </VStack>

                      {/* Action Button */}
                      <VStack justify="center">
                        <Button
                          w="full"
                          colorScheme={getStatusColor(assignment.status)}
                          onClick={() => handleViewAssignment(assignment.id)}
                        >
                          {assignment.status === 'Pending' || assignment.status === 'Overdue'
                            ? 'Submit Assignment'
                            : assignment.status === 'Submitted'
                            ? 'View Submission'
                            : 'View Details'}
                        </Button>
                      </VStack>
                    </Grid>
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

export default MyAssignments;
