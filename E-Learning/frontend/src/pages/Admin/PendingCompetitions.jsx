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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import competitionApi from '../../services/api';

const PendingCompetitions = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const response = await competitionApi.get('/competitions/pending-competitions', {
        params: { page: 1, pageSize: 50 }
      });

      if (response.data.success) {
        setPending(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch pending:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending competitions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const response = await competitionApi.post(`/competitions/${id}/approve`);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Competition approved!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchPending();
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      const response = await competitionApi.post(`/competitions/${id}/reject`);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Competition rejected and removed',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchPending();
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (id) => {
    setSelectedId(id);
    onOpen();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box bg="gray.50" minH="calc(100vh - 100px)" py={8}>
      <Container maxW="7xl">
        <VStack align="stretch" spacing={6}>
          <Heading as="h1" size="2xl" color="purple.600">
            Pending Competitions
          </Heading>

          {loading ? (
            <Box display="flex" justifyContent="center" py={20}>
              <Spinner size="xl" color="purple.500" />
            </Box>
          ) : pending.length === 0 ? (
            <Box
              bg="card.bg"
              rounded="lg"
              p={8}
              textAlign="center"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Text color="gray.500" fontSize="lg">
                No pending competitions to review
              </Text>
            </Box>
          ) : (
            <Box bg="card.bg" rounded="lg" shadow="md" borderWidth="1px" borderColor="gray.200" overflowX="auto">
              <Table variant="simple">
                <Thead bg="purple.50">
                  <Tr>
                    <Th>Title</Th>
                    <Th>Creator Role</Th>
                    <Th>Type</Th>
                    <Th>Start Date</Th>
                    <Th>End Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pending.map((comp) => (
                    <Tr key={comp.id} _hover={{ bg: 'gray.50' }}>
                      <Td fontWeight="bold">{comp.title}</Td>
                      <Td>
                        <Badge colorScheme="blue">{comp.creatorRole}</Badge>
                      </Td>
                      <Td>{comp.competitionType}</Td>
                      <Td fontSize="sm">{formatDate(comp.startDate)}</Td>
                      <Td fontSize="sm">{formatDate(comp.endDate)}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => openActionModal(comp.id)}
                          >
                            Review
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </VStack>
      </Container>

      {/* Action Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Competition Review</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Do you want to approve or reject this competition?
            </Text>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                colorScheme="red"
                isLoading={actionLoading}
                onClick={() => handleReject(selectedId)}
              >
                Reject
              </Button>
              <Button
                colorScheme="green"
                isLoading={actionLoading}
                onClick={() => handleApprove(selectedId)}
              >
                Approve
              </Button>
              <Button variant="ghost" onClick={onClose} isDisabled={actionLoading}>
                Cancel
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PendingCompetitions;
