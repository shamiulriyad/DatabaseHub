import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Text,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Select,
  Input,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Textarea,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FiEdit2, FiEye, FiCheck, FiX, FiTrash2, FiFilter } from 'react-icons/fi';
import api from '../../services/api';

const CompetitionManagement = () => {
  const [competitions, setCompetitions] = useState([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
  const [searchText, setSearchText] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isRejectOpen, onRejectOpen, onRejectClose } = useDisclosure();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  useEffect(() => {
    filterCompetitions();
  }, [filterStatus, searchText, competitions]);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/competitions/admin/all-competitions', {
        params: { page: 1, pageSize: 100 },
      });

      if (response.data.success) {
        const data = response.data.data || [];
        setCompetitions(data);

        // Calculate stats
        const statsData = {
          total: data.length,
          pending: data.filter((c) => !c.isApproved && c.status !== 'Rejected').length,
          approved: data.filter((c) => c.isApproved).length,
          rejected: data.filter((c) => c.status === 'Rejected').length,
        };
        setStats(statsData);

        toast({
          title: 'Success',
          description: `Loaded ${data.length} competitions`,
          status: 'success',
          duration: 2,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to fetch competitions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load competitions',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCompetitions = () => {
    let filtered = competitions;

    // Filter by status
    if (filterStatus === 'pending') {
      filtered = filtered.filter((c) => !c.isApproved && c.status !== 'Rejected');
    } else if (filterStatus === 'approved') {
      filtered = filtered.filter((c) => c.isApproved);
    } else if (filterStatus === 'rejected') {
      filtered = filtered.filter((c) => c.status === 'Rejected');
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter((c) =>
        c.title.toLowerCase().includes(searchText.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        c.creatorName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredCompetitions(filtered);
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const response = await api.post(`/competitions/${id}/approve`);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Competition approved!',
          status: 'success',
          duration: 3,
          isClosable: true,
        });
        fetchCompetitions();
        onViewClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      const response = await api.post(`/competitions/${id}/reject`, {
        reason: rejectReason || 'No reason provided',
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Competition rejected!',
          status: 'success',
          duration: 3,
          isClosable: true,
        });
        setRejectReason('');
        fetchCompetitions();
        onRejectClose();
        onViewClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this competition?')) return;

    try {
      setActionLoading(true);
      const response = await api.delete(`/competitions/${id}`);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Competition deleted!',
          status: 'success',
          duration: 3,
          isClosable: true,
        });
        fetchCompetitions();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (competition) => {
    if (competition.status === 'Rejected') {
      return <Badge colorScheme="red">Rejected</Badge>;
    }
    if (competition.isApproved) {
      return <Badge colorScheme="green">Approved</Badge>;
    }
    return <Badge colorScheme="yellow">Pending</Badge>;
  };

  const getCompetitionTypeBadge = (type) => {
    const colorMap = {
      Academic: 'blue',
      Quiz: 'purple',
      Sports: 'orange',
      Cultural: 'pink',
      Technical: 'cyan',
    };
    return <Badge colorScheme={colorMap[type] || 'gray'}>{type}</Badge>;
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="lg" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack align="stretch" spacing={8}>
        {/* Header */}
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Competition Management
          </Heading>
          <Text color="gray.500">Manage, approve, and monitor all competitions</Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel>Total Competitions</StatLabel>
                <StatNumber>{stats.total}</StatNumber>
                <StatHelpText>All competitions</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel>Pending</StatLabel>
                <StatNumber color="orange.500">{stats.pending}</StatNumber>
                <StatHelpText>Awaiting approval</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel>Approved</StatLabel>
                <StatNumber color="green.500">{stats.approved}</StatNumber>
                <StatHelpText>Active & published</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel>Rejected</StatLabel>
                <StatNumber color="red.500">{stats.rejected}</StatNumber>
                <StatHelpText>Not approved</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
          <CardHeader>
            <Heading size="md">Filters</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>Search by Title or Creator</FormLabel>
                <Input
                  placeholder="Search competitions..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Filter by Status</FormLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Competitions</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Competitions Table */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
          <CardHeader>
            <Heading size="md">
              Competitions ({filteredCompetitions.length})
            </Heading>
          </CardHeader>
          <CardBody>
            {filteredCompetitions.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No competitions found
              </Text>
            ) : (
              <Box overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th>Type</Th>
                      <Th>Creator</Th>
                      <Th>Creator Role</Th>
                      <Th>Status</Th>
                      <Th>Dates</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredCompetitions.map((competition) => (
                      <Tr key={competition.id}>
                        <Td>
                          <Text fontWeight="500" isTruncated maxW="200px">
                            {competition.title}
                          </Text>
                        </Td>
                        <Td>{getCompetitionTypeBadge(competition.competitionType)}</Td>
                        <Td>
                          <Text fontSize="sm">{competition.creatorName || 'N/A'}</Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue">{competition.creatorRole}</Badge>
                        </Td>
                        <Td>{getStatusBadge(competition)}</Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs">
                              {new Date(competition.startDate).toLocaleDateString()}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              to {new Date(competition.endDate).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              leftIcon={<FiEye />}
                              onClick={() => {
                                setSelectedCompetition(competition);
                                onViewOpen();
                              }}
                            >
                              View
                            </Button>
                            {!competition.isApproved && competition.status !== 'Rejected' && (
                              <Button
                                size="sm"
                                colorScheme="green"
                                variant="ghost"
                                leftIcon={<FiCheck />}
                                onClick={() => handleApprove(competition.id)}
                                isLoading={actionLoading}
                              >
                                Approve
                              </Button>
                            )}
                            {!competition.isApproved && competition.status !== 'Rejected' && (
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                leftIcon={<FiX />}
                                onClick={() => {
                                  setSelectedCompetition(competition);
                                  onRejectOpen();
                                }}
                              >
                                Reject
                              </Button>
                            )}
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              leftIcon={<FiTrash2 />}
                              onClick={() => handleDelete(competition.id)}
                              isLoading={actionLoading}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* View Details Modal */}
      {selectedCompetition && (
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
          <ModalOverlay />
          <ModalContent bg={cardBg}>
            <ModalHeader>{selectedCompetition.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Description</Text>
                  <Text>{selectedCompetition.description || 'No description'}</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">Type</Text>
                  {getCompetitionTypeBadge(selectedCompetition.competitionType)}
                </Box>

                <Box>
                  <Text fontWeight="bold">Creator</Text>
                  <Text>
                    {selectedCompetition.creatorName} ({selectedCompetition.creatorRole})
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="bold">Status</Text>
                  {getStatusBadge(selectedCompetition)}
                </Box>

                <Box>
                  <Text fontWeight="bold">Dates</Text>
                  <Text>
                    Start: {new Date(selectedCompetition.startDate).toLocaleString()}
                  </Text>
                  <Text>
                    End: {new Date(selectedCompetition.endDate).toLocaleString()}
                  </Text>
                </Box>

                {selectedCompetition.clanId && (
                  <Box>
                    <Text fontWeight="bold">Clan ID</Text>
                    <Text>{selectedCompetition.clanId}</Text>
                  </Box>
                )}

                <Box>
                  <Text fontWeight="bold">Created On</Text>
                  <Text>{new Date(selectedCompetition.createdAt).toLocaleString()}</Text>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onViewClose}>
                  Close
                </Button>
                {!selectedCompetition.isApproved &&
                  selectedCompetition.status !== 'Rejected' && (
                    <>
                      <Button
                        colorScheme="green"
                        leftIcon={<FiCheck />}
                        onClick={() => handleApprove(selectedCompetition.id)}
                        isLoading={actionLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        colorScheme="red"
                        leftIcon={<FiX />}
                        onClick={() => {
                          onViewClose();
                          setTimeout(onRejectOpen, 300);
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Reject Modal */}
      {selectedCompetition && (
        <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
          <ModalOverlay />
          <ModalContent bg={cardBg}>
            <ModalHeader>Reject Competition</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">{selectedCompetition.title}</Text>
                  <Text fontSize="sm" color="gray.500">
                    ID: {selectedCompetition.id}
                  </Text>
                </Box>

                <FormControl>
                  <FormLabel>Reason for Rejection</FormLabel>
                  <Textarea
                    placeholder="Provide a reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onRejectClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => handleReject(selectedCompetition.id)}
                  isLoading={actionLoading}
                >
                  Reject Competition
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default CompetitionManagement;
