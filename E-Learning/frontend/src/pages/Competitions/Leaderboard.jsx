import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardBody,
  Spinner,
  useToast,
  Select,
  VStack,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import competitionApi from '../../services/api';

const getLeaderboardDisplayName = (participant) => {
  const participantType = String(participant?.participantType ?? participant?.ParticipantType ?? '').toLowerCase();
  const teamOrClanName = participant?.teamName
    ?? participant?.TeamName
    ?? participant?.team?.name
    ?? participant?.Team?.Name
    ?? participant?.clanName
    ?? participant?.ClanName;

  if (participantType === 'team' && teamOrClanName) return teamOrClanName;
  return teamOrClanName || participant?.participantName || participant?.ParticipantName || 'Unknown';
};

const Leaderboard = () => {
  const [competitionId, setCompetitionId] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const response = await competitionApi.get('/competitions', { params: { page: 1, pageSize: 100 } });
      if (response.data.success) {
        const comps = response.data.data || [];
        setCompetitions(comps);
        if (comps.length > 0) {
          setCompetitionId(comps[0].id);
          fetchLeaderboard(comps[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch competitions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load competitions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchLeaderboard = async (id) => {
    try {
      setLoading(true);
      const response = await competitionApi.get(`/competitions/${id}/leaderboard`);
      if (response.data.success) {
        setLeaderboard(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load leaderboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompetitionChange = (e) => {
    const id = parseInt(e.target.value);
    setCompetitionId(id);
    fetchLeaderboard(id);
  };

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Icon as={FaTrophy} color="yellow.400" w={6} h={6} />;
      case 2:
        return <Icon as={FaMedal} color="gray.400" w={6} h={6} />;
      case 3:
        return <Icon as={FaMedal} color="orange.400" w={6} h={6} />;
      default:
        return null;
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'yellow';
    if (rank === 2) return 'gray';
    if (rank === 3) return 'orange';
    return 'gray';
  };

  return (
    <Box bg="gray.50" minH="calc(100vh - 100px)" py={8}>
      <Container maxW="6xl">
        {/* Header */}
        <VStack align="start" spacing={6} mb={8}>
          <Heading as="h1" size="2xl" color="purple.600">
            Competition Leaderboards
          </Heading>

          {/* Competition Selector */}
          <Card bg="card.bg" w="full" shadow="md">
            <CardBody>
              <HStack spacing={4}>
                <Text fontWeight="bold" minW="200px">
                  Select Competition:
                </Text>
                <Select
                  value={competitionId || ''}
                  onChange={handleCompetitionChange}
                  placeholder="Choose a competition"
                  maxW="400px"
                >
                  {competitions.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.title}
                    </option>
                  ))}
                </Select>
              </HStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Leaderboard */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={20}>
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : leaderboard?.participants && leaderboard.participants.length > 0 ? (
          <Card bg="card.bg" shadow="lg">
            <CardBody>
              <Box overflowX="auto">
                <Table variant="striped" colorScheme="gray">
                  <Thead>
                    <Tr bg="purple.50">
                      <Th w="10%">Rank</Th>
                      <Th>Participant</Th>
                      <Th>Type</Th>
                      <Th isNumeric>Score</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {leaderboard.participants.map((participant, idx) => (
                      <Tr
                        key={idx}
                        bg={idx < 3 ? `${getRankColor(idx + 1)}.50` : 'white'}
                      >
                        <Td>
                          <HStack spacing={2}>
                            {getMedalIcon(idx + 1)}
                            <Text fontWeight="bold" color={`${getRankColor(idx + 1)}.600`}>
                              #{idx + 1}
                            </Text>
                          </HStack>
                        </Td>
                        <Td fontWeight="500">{getLeaderboardDisplayName(participant)}</Td>
                        <Td>
                          <Badge colorScheme="blue">
                            {participant.participantType}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="bold" color="purple.600" fontSize="lg">
                            {participant.score}
                          </Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              participant.status === 'Completed'
                                ? 'green'
                                : participant.status === 'Started'
                                ? 'yellow'
                                : 'gray'
                            }
                          >
                            {participant.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <Text mt={4} fontSize="sm" color="gray.500" textAlign="center">
                Last updated: {new Date(leaderboard.lastUpdatedAt).toLocaleString()}
              </Text>
            </CardBody>
          </Card>
        ) : (
          <Card bg="card.bg" shadow="md">
            <CardBody>
              <Text color="gray.500" textAlign="center" py={10}>
                No leaderboard data available for this competition
              </Text>
            </CardBody>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default Leaderboard;
