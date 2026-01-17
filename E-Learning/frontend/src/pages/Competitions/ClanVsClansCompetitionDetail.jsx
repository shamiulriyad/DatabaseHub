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
  useToast,
  Badge,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import competitionApi from '../../services/api';

const ClanVsClansCompetitionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [clanMembers, setClanMembers] = useState([]);
  const [userClanId, setUserClanId] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'orange',
      Scheduled: 'blue',
      Ongoing: 'purple',
      Completed: 'green',
      Rejected: 'red',
      Cancelled: 'gray',
    };
    return colors[status] || 'gray';
  };

  // Fetch competition details
  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const response = await competitionApi.get(`/clan-vs-clans-competitions/${id}`);
        if (response.data.success) {
          setCompetition(response.data.data);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load competition details',
          status: 'error',
        });
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
  }, [id, toast]);

  // Determine user's clan and fetch members
  useEffect(() => {
    if (competition && user) {
      let userClan = null;
      if (competition.challengerClan.id) {
        // Check if user is in challenger clan (you would need user clan membership info)
        userClan = competition.challengerClan.id;
        setUserClanId(competition.challengerClan.id);
      } else if (competition.opponentClan.id) {
        userClan = competition.opponentClan.id;
        setUserClanId(competition.opponentClan.id);
      }

      if (userClan) {
        fetchClanMembers(userClan);
      }
    }
  }, [competition, user]);

  const fetchClanMembers = async (clanId) => {
    try {
      const response = await competitionApi.get(`/clans/${clanId}/members`);
      if (response.data.success) {
        setClanMembers(response.data.data || []);
      }
    } catch (error) {
      console.warn('Could not fetch clan members:', error);
    }
  };

  const handleAcceptChallenge = async () => {
    if (!competition) return;

    try {
      setActionLoading(true);
      const response = await competitionApi.post(`/clan-vs-clans-competitions/${competition.id}/accept`);

      if (response.data.success) {
        setCompetition(response.data.data);
        toast({
          title: 'Success',
          description: 'Challenge accepted! Now select your participants.',
          status: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to accept challenge',
        status: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectChallenge = async () => {
    if (!competition) return;

    try {
      setActionLoading(true);
      const response = await competitionApi.post(`/clan-vs-clans-competitions/${competition.id}/reject`, {
        rejectionReason: rejectionReason,
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Challenge rejected',
          status: 'success',
        });
        navigate(-1);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject challenge',
        status: 'error',
      });
    } finally {
      setActionLoading(false);
      onClose();
    }
  };

  const handleSelectParticipants = async () => {
    if (selectedParticipants.length !== competition.participantsPerClan) {
      toast({
        title: 'Error',
        description: `Please select exactly ${competition.participantsPerClan} participants`,
        status: 'error',
      });
      return;
    }

    try {
      setActionLoading(true);
      const response = await competitionApi.post(
        `/clan-vs-clans-competitions/${competition.id}/select-participants`,
        {
          selectedUserIds: selectedParticipants,
        }
      );

      if (response.data.success) {
        setCompetition(response.data.data);
        setSelectedParticipants([]);
        toast({
          title: 'Success',
          description: 'Participants selected successfully',
          status: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to select participants',
        status: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container py={8}>
        <VStack justify="center" align="center" minH="400px">
          <Spinner size="xl" />
          <Text>Loading competition details...</Text>
        </VStack>
      </Container>
    );
  }

  if (!competition) {
    return (
      <Container py={8}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <Heading size="md">Competition Not Found</Heading>
            <Text>The competition you're looking for doesn't exist.</Text>
          </Box>
        </Alert>
      </Container>
    );
  }

  const isUserChallengerLeader = competition.challengerClan?.id === userClanId;
  const isUserOpponentLeader = competition.opponentClan?.id === userClanId;
  const isPending = competition.status === 'Pending';
  const isScheduled = competition.status === 'Scheduled';

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={2}>
              <Heading size="lg">{competition.title}</Heading>
              <Badge colorScheme={getStatusColor(competition.status)}>
                {competition.status}
              </Badge>
            </VStack>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </HStack>
          {competition.description && <Text color="gray.600">{competition.description}</Text>}
        </Box>

        {/* Clans Face-Off */}
        <Card>
          <CardBody>
            <Heading size="sm" mb={6}>
              Competition Matchup
            </Heading>
            <SimpleGrid columns={3} spacing={8} align="center">
              {/* Challenger */}
              <Box>
                <VStack spacing={4} textAlign="center">
                  {competition.challengerClan?.logoUrl && (
                    <img
                      src={competition.challengerClan.logoUrl}
                      alt={competition.challengerClan.name}
                      width={80}
                      height={80}
                      style={{ borderRadius: '8px' }}
                    />
                  )}
                  <Box>
                    <Heading size="sm">{competition.challengerClan?.name}</Heading>
                    <Text color="gray.600">{competition.challengerClan?.memberCount} members</Text>
                  </Box>
                  {competition.challengerReady && (
                    <Badge colorScheme="green">Ready</Badge>
                  )}
                </VStack>
              </Box>

              {/* VS */}
              <Box textAlign="center">
                <Heading size="lg" color="gray.400">
                  VS
                </Heading>
              </Box>

              {/* Opponent */}
              <Box>
                <VStack spacing={4} textAlign="center">
                  {competition.opponentClan?.logoUrl && (
                    <img
                      src={competition.opponentClan.logoUrl}
                      alt={competition.opponentClan.name}
                      width={80}
                      height={80}
                      style={{ borderRadius: '8px' }}
                    />
                  )}
                  <Box>
                    <Heading size="sm">{competition.opponentClan?.name}</Heading>
                    <Text color="gray.600">{competition.opponentClan?.memberCount} members</Text>
                  </Box>
                  {competition.opponentReady && (
                    <Badge colorScheme="green">Ready</Badge>
                  )}
                </VStack>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Competition Details */}
        <Card>
          <CardBody>
            <SimpleGrid columns={3} spacing={8}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Type
                </Text>
                <Badge colorScheme="blue">{competition.competitionType}</Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Difficulty
                </Text>
                <Badge colorScheme="orange">{competition.difficultyLevel}</Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Duration
                </Text>
                <Text fontWeight="bold">{competition.durationMinutes} minutes</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Participants per Clan
                </Text>
                <Text fontWeight="bold">{competition.participantsPerClan} participants</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Created
                </Text>
                <Text fontWeight="bold">
                  {new Date(competition.createdAt).toLocaleDateString()}
                </Text>
              </Box>
              {competition.scheduledStartTime && (
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Scheduled Start
                  </Text>
                  <Text fontWeight="bold">
                    {new Date(competition.scheduledStartTime).toLocaleString()}
                  </Text>
                </Box>
              )}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Actions based on status */}
        {isPending && isUserOpponentLeader && (
          <HStack spacing={4}>
            <Button
              colorScheme="green"
              size="lg"
              isLoading={actionLoading}
              onClick={handleAcceptChallenge}
            >
              Accept Challenge
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              size="lg"
              onClick={onOpen}
            >
              Reject Challenge
            </Button>
          </HStack>
        )}

        {/* Participant Selection */}
        {(isScheduled || competition.status === 'Ready') && (isUserChallengerLeader || isUserOpponentLeader) && (
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="sm">Select Participants</Heading>
                <Text color="gray.600">
                  Select {competition.participantsPerClan} participants from your clan to compete.
                </Text>

                <Box maxH="400px" overflowY="auto">
                  <VStack spacing={3} align="stretch">
                    {clanMembers.map((member) => (
                      <Card
                        key={member.id}
                        cursor="pointer"
                        bg={
                          selectedParticipants.includes(member.id)
                            ? 'blue.50'
                            : 'white'
                        }
                        onClick={() => {
                          if (selectedParticipants.includes(member.id)) {
                            setSelectedParticipants(
                              selectedParticipants.filter((id) => id !== member.id)
                            );
                          } else if (
                            selectedParticipants.length <
                            competition.participantsPerClan
                          ) {
                            setSelectedParticipants([
                              ...selectedParticipants,
                              member.id,
                            ]);
                          }
                        }}
                      >
                        <CardBody>
                          <HStack justify="space-between">
                            <HStack>
                              {member.profileImageUrl && (
                                <img
                                  src={member.profileImageUrl}
                                  alt={member.username}
                                  width={40}
                                  height={40}
                                  style={{ borderRadius: '50%' }}
                                />
                              )}
                              <Box>
                                <Text fontWeight="bold">
                                  {member.firstName} {member.lastName}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  @{member.username}
                                </Text>
                              </Box>
                            </HStack>
                            <Box>
                              {selectedParticipants.includes(member.id) && (
                                <Badge colorScheme="green">Selected</Badge>
                              )}
                              <Text fontSize="sm" color="gray.600">
                                {member.totalPoints} points
                              </Text>
                            </Box>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>

                <Text fontSize="sm" color="gray.600">
                  Selected: {selectedParticipants.length}/{competition.participantsPerClan}
                </Text>

                <Button
                  colorScheme="blue"
                  size="lg"
                  isLoading={actionLoading}
                  isDisabled={selectedParticipants.length !== competition.participantsPerClan}
                  onClick={handleSelectParticipants}
                >
                  Confirm Participants
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Questions Preview */}
        <Card>
          <CardBody>
            <Heading size="sm" mb={4}>
              Questions ({competition.challengerParticipants?.length || 0} total)
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Questions will be revealed when the competition starts.
            </Text>
          </CardBody>
        </Card>

        {/* Results (if completed) */}
        {competition.status === 'Completed' && (
          <Card bg="green.50">
            <CardBody>
              <Heading size="sm" mb={4}>
                Results
              </Heading>
              <SimpleGrid columns={3} spacing={8}>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    {competition.challengerClan?.name}
                  </Text>
                  <Heading size="lg" color="blue.600">
                    {competition.challengerTotalScore}
                  </Heading>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.600">
                    Winner
                  </Text>
                  <Badge colorScheme="gold" size="lg">
                    {competition.winnerClanStatus}
                  </Badge>
                </Box>
                <Box textAlign="right">
                  <Text fontSize="sm" color="gray.600">
                    {competition.opponentClan?.name}
                  </Text>
                  <Heading size="lg" color="blue.600">
                    {competition.opponentTotalScore}
                  </Heading>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Reject Challenge Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Challenge</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Are you sure you want to reject this challenge?</Text>
              <FormControl>
                <FormLabel>Reason (optional)</FormLabel>
                <Textarea
                  placeholder="Tell the challenger clan why you're rejecting..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              isLoading={actionLoading}
              onClick={handleRejectChallenge}
            >
              Reject Challenge
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ClanVsClansCompetitionDetail;
