import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Card,
  CardBody,
  Badge,
  Icon,
  Spinner,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
} from '@chakra-ui/react';
import { FaUsers, FaTrophy, FaFire, FaClock, FaArrowRight } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import competitionApi from '../../services/api';
import { competitionService } from '../../services/competitionService';

const CompetitionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [competition, setCompetition] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  const statusLower = useMemo(() => competition?.status?.toLowerCase() || '', [competition]);

  useEffect(() => {
    fetchCompetitionDetails();
  }, [id, user]);

  const fetchCompetitionDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch competition details
      const compRes = await competitionApi.get(`/competitions/${id}`);
      if (compRes.data.success) {
        setCompetition(compRes.data.data);
      }

      // Fetch leaderboard
      try {
        const leaderRes = await competitionApi.get(`/competitions/${id}/leaderboard`);
        if (leaderRes.data.success) {
          setLeaderboard(leaderRes.data.data);
        }
      } catch (e) {
        console.warn('Failed to fetch leaderboard:', e.message);
      }

      // Fetch stats
      try {
        const statsRes = await competitionApi.get(`/competitions/${id}/stats`);
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (e) {
        console.warn('Failed to fetch stats:', e.message);
      }

      // Check if user is already a participant (uses authenticated endpoint)
      if (user) {
        try {
          const myComps = await competitionService.getUserCompetitions();
          const alreadyJoined = myComps?.some((c) => c.id === Number(id));
          setIsJoined(Boolean(alreadyJoined));
        } catch (e) {
          console.warn('Failed to check participation:', e.message);
          setIsJoined(false);
        }
      } else {
        setIsJoined(false);
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load competition',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCompetition = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setJoiningLoading(true);
      const response = await competitionApi.post(`/competitions/${id}/join`);
      
      if (response.data.success) {
        setIsJoined(true);
        toast({
          title: 'Success',
          description: 'You have joined the competition!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Refresh competition data
        fetchCompetitionDetails();
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to join competition',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to join competition',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setJoiningLoading(false);
    }
  };

  const handleLeaveCompetition = async () => {
    if (!window.confirm('Are you sure you want to leave this competition?')) {
      return;
    }

    try {
      setJoiningLoading(true);
      const response = await competitionApi.post(`/competitions/${id}/leave`);
      
      if (response.data.success) {
        setIsJoined(false);
        toast({
          title: 'Success',
          description: 'You have left the competition',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchCompetitionDetails();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to leave competition',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setJoiningLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!competition) return;
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      if (!user) {
        setQuestionsError('Please login to view competition questions');
        setQuestions([]);
        return;
      }

      const isAdmin = user?.isAdmin;
      const isCreator = competition && (competition.creatorId === user?.id || competition.creator?.id === user?.id);

      let res = null;
      if (isAdmin || isCreator) {
        res = await competitionService.getAdminQuestions(id);
        const payload = res?.data ?? res;
        setQuestions(payload?.data ?? payload ?? []);
      } else {
        // participant endpoint will enforce status and registration
        res = await competitionService.getParticipantQuestions(id);
        const payload = res?.data ?? res;
        if (!payload || payload.success === false) {
          setQuestionsError(payload?.message || 'Questions are not available');
          setQuestions([]);
        } else {
          setQuestions(payload.data ?? payload ?? []);
        }
      }
    } catch (e) {
      setQuestionsError(e.response?.data?.message || e.message || 'Failed to load questions');
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    if (tabIndex === 3 && competition) {
      fetchQuestions();
    }
  }, [tabIndex, competition, user]);

  const getStatusColor = (status) => {
    const statusMap = {
      'upcoming': 'blue',
      'ongoing': 'green',
      'completed': 'gray'
    };
    return statusMap[status?.toLowerCase()] || 'blue';
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="calc(100vh - 100px)">
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  if (!competition) {
    return (
      <Container maxW="7xl" py={8}>
        <Text color="gray.500">Competition not found</Text>
      </Container>
    );
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 100px)" py={8}>
      <Container maxW="7xl">
        {/* Header */}
        <Card bg="white" shadow="lg" mb={8} borderWidth="1px" borderColor="gray.200">
          <CardBody>
            <VStack align="start" spacing={4}>
              <HStack justify="space-between" w="full">
                <VStack align="start" spacing={2}>
                  <Heading as="h1" size="2xl" color="purple.600">
                    {competition.title}
                  </Heading>
                  <HStack>
                    <Badge
                      colorScheme={getStatusColor(competition.status)}
                      fontSize="md"
                      px={3}
                      py={1}
                    >
                      {competition.status}
                    </Badge>
                    {!competition.isPublic && (
                      <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
                        Private
                      </Badge>
                    )}
                  </HStack>
                </VStack>
                {user && (
                  <>
                    {competition.isPublic || (competition.allowedMemberIds && competition.allowedMemberIds.includes(user.id)) ? (
                      <Button
                        colorScheme={isJoined ? 'gray' : 'purple'}
                        size="lg"
                        isLoading={joiningLoading}
                        onClick={isJoined && statusLower === 'upcoming' ? handleLeaveCompetition : handleJoinCompetition}
                        isDisabled={isJoined && statusLower !== 'upcoming'}
                      >
                        {isJoined ? (statusLower === 'upcoming' ? 'Leave' : 'Joined') : 'Join Competition'}
                      </Button>
                    ) : (
                      <VStack align="end">
                        <Badge colorScheme="red" fontSize="md" px={4} py={2}>
                          Private - Access Restricted
                        </Badge>
                        <Text fontSize="sm" color="gray.500">
                          You are not on the allowed list
                        </Text>
                      </VStack>
                    )}
                  </>
                )}
              </HStack>

              <Text color="gray.600" fontSize="lg">
                {competition.description}
              </Text>

              {/* Quick Stats */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                <Stat>
                  <StatLabel fontSize="sm">Participants</StatLabel>
                  <StatNumber color="purple.500">{competition.participantCount}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize="sm">Prize Pool</StatLabel>
                  <StatNumber color="orange.500">
                    {competition.prizePool > 0 ? `$${competition.prizePool}` : 'N/A'}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize="sm">Start Date</StatLabel>
                  <StatNumber fontSize="xs">{formatDate(competition.startDate)}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize="sm">End Date</StatLabel>
                  <StatNumber fontSize="xs">{formatDate(competition.endDate)}</StatNumber>
                </Stat>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Tabs */}
        <Tabs variant="soft-rounded" colorScheme="purple" index={tabIndex} onChange={(i) => setTabIndex(i)}>
          <TabList bg="white" p={4} rounded="lg" mb={6}>
            <Tab>Overview</Tab>
            <Tab>Leaderboard</Tab>
            <Tab>Statistics</Tab>
            <Tab>Questions</Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <Card bg="white" shadow="md">
                <CardBody>
                  <VStack align="start" spacing={6}>
                    <Box>
                      <Heading as="h3" size="md" mb={2}>
                        About This Competition
                      </Heading>
                      <Text color="gray.600">
                        {competition.description || 'No description provided'}
                      </Text>
                    </Box>

                    <Box>
                      <Heading as="h3" size="md" mb={2}>
                        Competition Type
                      </Heading>
                      <Badge colorScheme="cyan">{competition.competitionType}</Badge>
                    </Box>

                    <Box>
                      <Heading as="h3" size="md" mb={2}>
                        Key Information
                      </Heading>
                      <VStack align="start" spacing={2} color="gray.600">
                        <HStack>
                          <Icon as={FaClock} />
                          <Text>Duration: {formatDate(competition.startDate)} - {formatDate(competition.endDate)}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaUsers} />
                          <Text>Max Participants: {competition.maxParticipants}</Text>
                        </HStack>
                        {competition.isTeamBased && (
                          <HStack>
                            <Icon as={FaUsers} />
                            <Text>Team Size: {competition.teamSize} members</Text>
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Leaderboard Tab */}
            <TabPanel>
              <Card bg="white" shadow="md">
                <CardBody>
                  {leaderboard?.participants && leaderboard.participants.length > 0 ? (
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr bg="purple.50">
                            <Th>Rank</Th>
                            <Th>Participant</Th>
                            <Th>Type</Th>
                            <Th isNumeric>Score</Th>
                            <Th>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {leaderboard.participants.map((participant, idx) => (
                            <Tr key={idx}>
                              <Td fontWeight="bold">{idx + 1}</Td>
                              <Td>{participant.participantName}</Td>
                              <Td>
                                <Badge colorScheme="blue">
                                  {participant.participantType}
                                </Badge>
                              </Td>
                              <Td isNumeric fontWeight="bold" color="purple.600">
                                {participant.score}
                              </Td>
                              <Td>
                                <Badge colorScheme={participant.status === 'Completed' ? 'green' : 'yellow'}>
                                  {participant.status}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  ) : (
                    <Text color="gray.500">No leaderboard data available yet</Text>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Statistics Tab */}
            <TabPanel>
              <Card bg="white" shadow="md">
                <CardBody>
                  {stats ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Stat>
                        <StatLabel>Total Participants</StatLabel>
                        <StatNumber color="purple.500" fontSize="3xl">
                          {stats.totalParticipants}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Active Participants</StatLabel>
                        <StatNumber color="green.500" fontSize="3xl">
                          {stats.activeParticipants}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Average Score</StatLabel>
                        <StatNumber color="blue.500" fontSize="3xl">
                          {stats.averageScore.toFixed(2)}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Highest Score</StatLabel>
                        <StatNumber color="orange.500" fontSize="3xl">
                          {stats.highestScore}
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>
                  ) : (
                    <Text color="gray.500">Statistics not available</Text>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
            {/* Questions Tab */}
            <TabPanel>
              <Card bg="white" shadow="md">
                <CardBody>
                  {questionsLoading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                      <Spinner />
                    </Box>
                  ) : questionsError ? (
                    <Text color="red.500">{questionsError}</Text>
                  ) : questions && questions.length > 0 ? (
                    <VStack align="stretch" spacing={4}>
                      {questions.map((q, idx) => (
                        <Card key={q.id || idx} borderWidth="1px" borderColor="gray.100">
                          <CardBody>
                            <HStack justify="space-between">
                              <Heading size="sm">Question {idx + 1} — {q.points ?? q.Points} pts</Heading>
                              <Badge colorScheme="purple">Order: {q.order ?? q.Order}</Badge>
                            </HStack>
                            <Text mt={3} color="gray.700">{q.questionText ?? q.QuestionText}</Text>

                            <VStack align="start" mt={3} spacing={2}>
                              <Text>A. {q.optionA ?? q.OptionA}</Text>
                              <Text>B. {q.optionB ?? q.OptionB}</Text>
                              <Text>C. {q.optionC ?? q.OptionC}</Text>
                              <Text>D. {q.optionD ?? q.OptionD}</Text>
                            </VStack>

                            {(user?.isAdmin || (competition && (competition.creatorId === user?.id || competition.creator?.id === user?.id))) && (
                              <Text mt={3} color="green.600" fontWeight="semibold">Correct: {q.correctAnswer ?? q.CorrectAnswer}</Text>
                            )}
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500">No questions available</Text>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default CompetitionDetail;
