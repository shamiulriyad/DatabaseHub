import React, { useState, useEffect } from 'react';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  FaClock,
  FaEye,
} from 'react-icons/fa';
import api from '../../services/api';

const AdminPanel = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    // Initial fetch
    fetchPendingTeachers();

  
    const interval = setInterval(() => {
      fetchPendingTeachers();
    }, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPendingTeachers = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setApiError('No authentication token found. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Fetch pending applications from TeachersController
      const response = await api.get(
        '/teachers/applications?status=Pending'
      );

      console.log('API Response:', response.data);

      if (response.data.success) {
        const applications = response.data.applications || [];
        setPendingTeachers(applications);
        
        // Only show success toast on initial load with data
        if (applications.length > 0 && pendingTeachers.length === 0) {
          toast({
            title: 'Loaded',
            description: `Found ${applications.length} pending application(s)`,
            status: 'success',
            duration: 2,
            isClosable: true,
          });
        }
      } else {
        const errorMsg = response.data.message || 'Failed to fetch applications';
        setApiError(errorMsg);
        console.error('API Error:', errorMsg);
        
        // Only show toast for actual errors (not 409 conflicts)
        if (!response.data.message?.includes('Admin')) {
          toast({
            title: 'Error',
            description: errorMsg,
            status: 'error',
            duration: 3,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch pending teachers';
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Bad request - Check admin status';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized - Please log out and log in again';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      console.error('Fetch Error Details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        fullError: error
      });
      
      // Only show toast for non-409 errors
      if (error.response?.status !== 409) {
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 3,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewClick = (teacher) => {
    setSelectedTeacher(teacher);
    setAdminRemarks('');
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedTeacher) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: 'Error',
          description: 'Authentication token not found. Please log in again.',
          status: 'error',
          duration: 3,
          isClosable: true,
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log('Approving application:', selectedTeacher.id);
      
      const response = await api.post(
        `/teachers/applications/${selectedTeacher.id}/review`,
        {
          applicationId: selectedTeacher.id,
          decision: 'Approved',
          adminRemarks: adminRemarks || '',
        }
      );

      console.log('Approve response:', response.data);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Teacher application approved successfully!',
          status: 'success',
          duration: 3,
          isClosable: true,
        });
        setIsReviewModalOpen(false);
        setSelectedTeacher(null);
        setAdminRemarks('');
        fetchPendingTeachers();
      }
    } catch (error) {
      console.error('Approve error:', error.response?.data || error.message);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve application',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTeacher) return;
    
    if (!adminRemarks.trim()) {
      toast({
        title: 'Required',
        description: 'Please provide remarks for rejection',
        status: 'warning',
        duration: 3,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: 'Error',
          description: 'Authentication token not found. Please log in again.',
          status: 'error',
          duration: 3,
          isClosable: true,
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log('Rejecting application:', selectedTeacher.id);
      
      const response = await api.post(
        `/teachers/applications/${selectedTeacher.id}/review`,
        {
          applicationId: selectedTeacher.id,
          decision: 'Rejected',
          adminRemarks: adminRemarks,
        }
      );

      console.log('Reject response:', response.data);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Teacher application rejected successfully!',
          status: 'success',
          duration: 3,
          isClosable: true,
        });
        setIsReviewModalOpen(false);
        setSelectedTeacher(null);
        setAdminRemarks('');
        fetchPendingTeachers();
      }
    } catch (error) {
      console.error('Reject error:', error.response?.data || error.message);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject application',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
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
        {/* Header with Refresh Button */}
        <VStack align="start" spacing={4} mb={8}>
          <HStack justify="space-between" width="100%">
            <VStack align="start" spacing={2}>
              <Heading size="xl">Teacher Application Management</Heading>
              <Text color="gray.600">
                Review and approve/reject pending teacher applications from students
              </Text>
            </VStack>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={fetchPendingTeachers}
              isLoading={isLoading}
              spinnerPlacement="end"
            >
              Refresh
            </Button>
          </HStack>
        </VStack>

        {/* Error Banner */}
        {apiError && (
          <Box
            bg="red.50"
            border="1px"
            borderColor="red.200"
            borderRadius="md"
            p={4}
            mb={6}
          >
            <Text color="red.800" fontSize="sm">
              <strong>Error:</strong> {apiError}
            </Text>
          </Box>
        )}

        {/* Statistics Card */}
        <Card bg={cardBg} shadow="md" mb={6}>
          <CardBody>
            <HStack spacing={8}>
              <VStack spacing={1}>
                <Heading size="lg" color="yellow.500">
                  {pendingTeachers.length}
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Pending Applications
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Teachers Table */}
        <Card bg={cardBg} shadow="lg">
          <CardBody p={0}>
            {isLoading && pendingTeachers.length === 0 ? (
              <Box py={12} textAlign="center">
                <Spinner size="lg" color="purple.500" mb={4} />
                <Text color="gray.500">Loading pending applications...</Text>
              </Box>
            ) : pendingTeachers.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr borderBottomColor={borderColor} borderBottomWidth="2px">
                      <Th>Full Name</Th>
                      <Th>Email</Th>
                      <Th>Experience Area</Th>
                      <Th>Application Date</Th>
                      <Th>Status</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingTeachers.map((teacher) => (
                      <Tr key={teacher.id} borderBottomColor={borderColor}>
                        <Td fontWeight="bold">
                          {teacher.FirstName} {teacher.LastName}
                        </Td>
                        <Td>{teacher.UserEmail}</Td>
                        <Td>{teacher.ExperienceArea || 'N/A'}</Td>
                        <Td>
                          {new Date(teacher.ApplicationDate).toLocaleDateString()}
                        </Td>
                        <Td>
                          <Badge colorScheme="yellow" variant="solid">
                            <HStack spacing={1}>
                              <FaClock />
                              <span>{teacher.Status}</span>
                            </HStack>
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            colorScheme="purple"
                            size="sm"
                            leftIcon={<FaEye />}
                            onClick={() => handleReviewClick(teacher)}
                          >
                            Review
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box py={12} textAlign="center">
                <Text color="gray.500" fontSize="lg">
                  No pending teacher applications at the moment
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </Container>

      {/* Review Modal */}
      {selectedTeacher && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedTeacher(null);
            setAdminRemarks('');
          }}
          size="lg"
        >
          <ModalOverlay />
          <ModalContent bg={cardBg}>
            <ModalHeader>Review Teacher Application</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6} align="stretch">
                {/* Applicant Information */}
                <Box>
                  <Heading size="sm" mb={3}>
                    Applicant Information
                  </Heading>
                  <VStack align="start" spacing={2} pl={4}>
                    <HStack>
                      <Text fontWeight="bold" w="120px">
                        Name:
                      </Text>
                      <Text>
                        {selectedTeacher.FirstName} {selectedTeacher.LastName}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold" w="120px">
                        Email:
                      </Text>
                      <Text>{selectedTeacher.UserEmail}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold" w="120px">
                        Username:
                      </Text>
                      <Text>{selectedTeacher.UserName}</Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Application Details */}
                <Box>
                  <Heading size="sm" mb={3}>
                    Application Details
                  </Heading>
                  <VStack align="start" spacing={3} pl={4}>
                    <Box>
                      <Text fontWeight="bold" mb={1}>
                        Reason for Applying:
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedTeacher.ReasonForApplying}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={1}>
                        Experience Area:
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedTeacher.ExperienceArea || 'N/A'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb={1}>
                        Qualification Details:
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedTeacher.QualificationDetails || 'N/A'}
                      </Text>
                    </Box>
                  </VStack>
                </Box>

                {/* Admin Remarks */}
                <FormControl>
                  <FormLabel fontWeight="bold">
                    Admin Remarks (Required for rejection)
                  </FormLabel>
                  <Textarea
                    placeholder="Add your remarks or feedback..."
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    rows={4}
                    size="sm"
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setSelectedTeacher(null);
                    setAdminRemarks('');
                  }}
                >
                  Close
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleReject}
                  isLoading={isSubmitting}
                >
                  Reject
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleApprove}
                  isLoading={isSubmitting}
                >
                  Approve
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default AdminPanel;
