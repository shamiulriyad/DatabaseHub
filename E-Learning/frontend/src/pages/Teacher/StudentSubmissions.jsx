import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  useToast,
  Spinner,
  Flex,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Divider
} from '@chakra-ui/react';
import { FiArrowLeft, FiStar, FiMessageSquare } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const StudentSubmissions = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [gradeComment, setGradeComment] = useState('');
  const [gradeScore, setGradeScore] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, filterStatus]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch course details
      const courseRes = await axios.get(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(courseRes.data.course);

      // Fetch submissions from API
      try {
        const submissionsRes = await axios.get(`/api/courses/${courseId}/submissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = submissionsRes.data.submissions || submissionsRes.data || [];
        setSubmissions(filterStatus === 'All' ? data : data.filter(s => s.status === filterStatus));
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
        setSubmissions([]);
        toast({ title: 'Error', description: 'Unable to load submissions', status: 'error', duration: 3000 });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load submissions',
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!gradeScore || !selectedSubmission) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a score',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    try {
      setSubmittingGrade(true);
      const token = localStorage.getItem('token');

      // API call to submit grade
      await axios.post(`/api/courses/submissions/${selectedSubmission.id}/grade`, 
        { score: parseFloat(gradeScore), comment: gradeComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistically update local state
      setSubmissions(submissions.map(s => 
        s.id === selectedSubmission.id 
          ? { ...s, score: parseFloat(gradeScore), comment: gradeComment, status: 'Graded' }
          : s
      ));

      toast({
        title: 'Success',
        description: 'Grade submitted successfully',
        status: 'success',
        duration: 3000
      });

      setGradeScore('');
      setGradeComment('');
      onClose();
    } catch (error) {
      console.error('Error submitting grade:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit grade',
        status: 'error',
        duration: 3000
      });
    } finally {
      setSubmittingGrade(false);
    }
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeScore(submission.score ? submission.score.toString() : '');
    setGradeComment(submission.comment || '');
    onOpen();
  };

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
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <HStack spacing={4} pb={4} borderBottom="1px solid #e2e8f0">
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            onClick={() => navigate('/teacher/manage-courses')}
          >
            Back
          </Button>
          <VStack align="start" spacing={0}>
            <Heading size="lg">Student Submissions</Heading>
            {course && <Text color="gray.600">{course.title}</Text>}
          </VStack>
        </HStack>

        {/* Filters */}
        <HStack spacing={4}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            maxW="200px"
          >
            <option value="All">All Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Graded">Graded</option>
            <option value="Pending">Pending</option>
          </Select>
        </HStack>

        {/* Submissions Table */}
        {submissions.length === 0 ? (
          <Card>
            <CardBody>
              <VStack py={12} spacing={4}>
                <Heading size="md" color="gray.500">No Submissions</Heading>
                <Text color="gray.500">No student submissions found for this course</Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr bg="gray.50">
                      <Th>Student</Th>
                      <Th>Assignment</Th>
                      <Th>Submitted</Th>
                      <Th>Status</Th>
                      <Th>Score</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {submissions.map(submission => (
                      <Tr key={submission.id} borderBottom="1px solid #e2e8f0">
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{submission.studentName}</Text>
                            <Text fontSize="sm" color="gray.500">{submission.studentEmail}</Text>
                          </VStack>
                        </Td>
                        <Td>{submission.assignmentTitle}</Td>
                        <Td>
                          <Text fontSize="sm">
                            {new Date(submission.submittedAt).toLocaleDateString()} {new Date(submission.submittedAt).toLocaleTimeString()}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={submission.status === 'Graded' ? 'green' : 'yellow'}
                          >
                            {submission.status}
                          </Badge>
                        </Td>
                        <Td>
                          {submission.score !== null ? (
                            <Flex align="center" gap={1}>
                              <Icon as={FiStar} color="yellow.500" />
                              <Text fontWeight="bold">{submission.score}/100</Text>
                            </Flex>
                          ) : (
                            <Text color="gray.500">—</Text>
                          )}
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => openGradeModal(submission)}
                          >
                            {submission.score !== null ? 'Edit' : 'Grade'}
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        )}

        {/* Grade Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Grade Submission
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                {selectedSubmission && (
                  <>
                    <Box w="100%" bg="gray.50" p={4} borderRadius="md">
                      <Grid templateColumns="1fr 1fr" gap={4}>
                        <GridItem>
                          <Text fontSize="sm" color="gray.600">Student</Text>
                          <Text fontWeight="bold">{selectedSubmission.studentName}</Text>
                        </GridItem>
                        <GridItem>
                          <Text fontSize="sm" color="gray.600">Assignment</Text>
                          <Text fontWeight="bold">{selectedSubmission.assignmentTitle}</Text>
                        </GridItem>
                      </Grid>
                    </Box>

                    <FormControl isRequired>
                      <FormLabel fontWeight="bold">Score (out of 100)</FormLabel>
                      <Input
                        type="number"
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        placeholder="Enter score"
                        min="0"
                        max="100"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="bold">Feedback Comment</FormLabel>
                      <Textarea
                        value={gradeComment}
                        onChange={(e) => setGradeComment(e.target.value)}
                        placeholder="Provide feedback to the student..."
                        rows={4}
                      />
                    </FormControl>
                  </>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleGradeSubmission}
                  isLoading={submittingGrade}
                >
                  Submit Grade
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default StudentSubmissions;
