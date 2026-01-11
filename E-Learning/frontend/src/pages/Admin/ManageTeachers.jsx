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
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tabs,
  Icon,
  Input,
} from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye,
} from 'react-icons/fa';
import axios from 'axios';
import TeacherApplicationReviewModal from '../../components/TeacherApplicationReviewModal';

const ManageTeachers = () => {
  const [applications, setApplications] = useState({
    Pending: [],
    Approved: [],
    Rejected: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const pendingCardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Fetch all applications
      const response = await axios.get('http://localhost:5145/api/teachers/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        console.log('API Response:', response.data.applications);
        const grouped = {
          Pending: [],
          Approved: [],
          Rejected: [],
        };

        response.data.applications.forEach((app) => {
          // Handle both 'status' and 'Status' field names for compatibility
          const appStatus = app.Status || app.status || 'Pending';
          console.log('Grouping app:', app.UserEmail, 'Status:', appStatus);
          grouped[appStatus] = grouped[appStatus] || [];
          grouped[appStatus].push(app);
        });

        console.log('Final grouped applications:', grouped);
        setApplications(grouped);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applications',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewClick = (application) => {
    setSelectedApplication(application);
    setIsReviewModalOpen(true);
  };

  const handleReviewComplete = () => {
    setIsReviewModalOpen(false);
    setSelectedApplication(null);
    fetchApplications();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'yellow';
      case 'Approved':
        return 'green';
      case 'Rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return FaClock;
      case 'Approved':
        return FaCheckCircle;
      case 'Rejected':
        return FaTimesCircle;
      default:
        return null;
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
        {/* Header */}
        <VStack align="start" spacing={4} mb={8}>
          <Heading size="xl">Manage Teacher Applications</Heading>
          <Text color="gray.600">
            Review and approve teacher applications from students
          </Text>
        </VStack>

        {/* Tabs */}
        <Card bg={cardBg} shadow="lg">
          <CardBody p={0}>
            <Tabs>
              <TabList borderBottom="1px solid" borderColor={borderColor}>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FaClock} color="yellow.500" />
                    <Text>
                      Pending ({applications.Pending?.length || 0})
                    </Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FaCheckCircle} color="green.500" />
                    <Text>
                      Approved ({applications.Approved?.length || 0})
                    </Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FaTimesCircle} color="red.500" />
                    <Text>
                      Rejected ({applications.Rejected?.length || 0})
                    </Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Pending Tab */}
                <TabPanel p={6}>
                  {applications.Pending?.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {applications.Pending.map((app) => (
                        <Card
                          key={app.id}
                          bg={pendingCardBg}
                          borderLeft="4px solid"
                          borderLeftColor="yellow.500"
                        >
                          <CardBody>
                            <HStack justify="space-between" align="start">
                              <VStack align="start" spacing={2} flex={1}>
                                <Heading size="sm">
                                  {app.applicantName}
                                </Heading>
                                <Text fontSize="sm" color="gray.600">
                                  {app.applicantEmail}
                                </Text>
                                <Text fontSize="sm">
                                  {app.reasonForApplying}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Applied: {new Date(app.applicationDate).toLocaleDateString()}
                                </Text>
                              </VStack>
                              <Button
                                colorScheme="purple"
                                size="sm"
                                leftIcon={<FaEye />}
                                onClick={() => handleReviewClick(app)}
                              >
                                Review
                              </Button>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500" textAlign="center" py={8}>
                      No pending applications
                    </Text>
                  )}
                </TabPanel>

                {/* Approved Tab */}
                <TabPanel p={6}>
                  {applications.Approved?.length > 0 ? (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr borderBottomColor={borderColor}>
                          <Th>Name</Th>
                          <Th>Email</Th>
                          <Th>Approved Date</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {applications.Approved.map((app) => (
                          <Tr key={app.id} borderBottomColor={borderColor}>
                            <Td fontWeight="bold">{app.applicantName}</Td>
                            <Td>{app.applicantEmail}</Td>
                            <Td>
                              {app.approvedDate
                                ? new Date(app.approvedDate).toLocaleDateString()
                                : 'N/A'}
                            </Td>
                            <Td>
                              <Button
                                size="xs"
                                variant="ghost"
                                leftIcon={<FaEye />}
                                onClick={() => handleReviewClick(app)}
                              >
                                View
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text color="gray.500" textAlign="center" py={8}>
                      No approved applications yet
                    </Text>
                  )}
                </TabPanel>

                {/* Rejected Tab */}
                <TabPanel p={6}>
                  {applications.Rejected?.length > 0 ? (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr borderBottomColor={borderColor}>
                          <Th>Name</Th>
                          <Th>Email</Th>
                          <Th>Rejected Date</Th>
                          <Th>Admin Remarks</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {applications.Rejected.map((app) => (
                          <Tr key={app.id} borderBottomColor={borderColor}>
                            <Td fontWeight="bold">{app.applicantName}</Td>
                            <Td>{app.applicantEmail}</Td>
                            <Td>
                              {app.reviewedDate
                                ? new Date(app.reviewedDate).toLocaleDateString()
                                : 'N/A'}
                            </Td>
                            <Td>{app.adminRemarks || 'No remarks'}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text color="gray.500" textAlign="center" py={8}>
                      No rejected applications
                    </Text>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Container>

      {/* Review Modal */}
      {selectedApplication && (
        <TeacherApplicationReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          application={selectedApplication}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </Box>
  );
};

export default ManageTeachers;
