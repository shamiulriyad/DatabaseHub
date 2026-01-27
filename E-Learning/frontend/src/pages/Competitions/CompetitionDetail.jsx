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
  Radio,
  RadioGroup,
  Stack,
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
  const [userScore, setUserScore] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);
  const [answersMap, setAnswersMap] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
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
          const lb = leaderRes.data.data;
          setLeaderboard(lb);
          // set current user's rank/score if present
          if (user && lb?.participants && Array.isArray(lb.participants)) {
            const idx = lb.participants.findIndex(p => {
              const pid = p.participantId ?? p.ParticipantId ?? p.participantId;
              return Number(pid) === Number(user.id);
            });
            if (idx >= 0) {
              setUserRank(idx + 1);
              const s = lb.participants[idx].score ?? lb.participants[idx].Score ?? 0;
              setUserScore(s);
            } else {
              setUserRank(null);
              setUserScore(null);
            }
          } else {
            setUserRank(null);
            setUserScore(null);
          }
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
        // reflect new participant locally to avoid full refresh delay
        setCompetition(prev => prev ? ({ ...prev, participantCount: (prev.participantCount || 0) + 1 }) : prev);
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
          const qList = payload.data ?? payload ?? [];
          setQuestions(qList);
          // reset answers for this question set
          const map = {};
          (qList || []).forEach(q => {
            const qid = q.id ?? q.Id;
            map[qid] = map[qid] ?? '';
          });
          setAnswersMap(map);
            // reset feedback/submission state when loading questions
            setQuestionFeedback({});
            setHasSubmitted(false);
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

  // Return style object for an option based on submission feedback
  const getOptionStyle = (qid, optKey) => {
    const fb = questionFeedback[qid];
    if (!hasSubmitted || !fb) return {};
    const sel = (fb.submittedAnswer || '').toString().toUpperCase();
    const corr = (fb.correctAnswer || '').toString().toUpperCase();

    if (optKey === corr) return { color: 'green.600', fontWeight: 'semibold' };
    if (optKey === sel && sel !== corr) return { color: 'red.600', fontWeight: 'semibold' };
    return {};
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
                     {isJoined ? (statusLower === 'upcoming' ? 'Leave' : 'Participated') : 'Join Competition'}
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
                  {user && (
                    <Stat>
                      <StatLabel fontSize="sm">Score</StatLabel>
                      <StatNumber color="purple.500">{userScore ?? 0}</StatNumber>
                    </Stat>
                  )}
                  {user && (
                    <Stat>
                      <StatLabel fontSize="sm">Rank</StatLabel>
                      <StatNumber color="purple.500">{userRank && userRank > 0 ? userRank : 'Pending'}</StatNumber>
                    </Stat>
                  )}
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
                              <RadioGroup
                                onChange={(val) => {
                                  const qid = q.id ?? q.Id;
                                  setAnswersMap(prev => ({ ...prev, [qid]: val }));
                                }}
                                value={answersMap[q.id ?? q.Id] ?? ''}
                                isDisabled={hasSubmitted}
                              >
                                <Stack direction="column">
                                  <Radio value="A">
                                    <Box as="span" sx={getOptionStyle(q.id ?? q.Id, 'A')}>A. {q.optionA ?? q.OptionA}</Box>
                                  </Radio>
                                  <Radio value="B">
                                    <Box as="span" sx={getOptionStyle(q.id ?? q.Id, 'B')}>B. {q.optionB ?? q.OptionB}</Box>
                                  </Radio>
                                  <Radio value="C">
                                    <Box as="span" sx={getOptionStyle(q.id ?? q.Id, 'C')}>C. {q.optionC ?? q.OptionC}</Box>
                                  </Radio>
                                  <Radio value="D">
                                    <Box as="span" sx={getOptionStyle(q.id ?? q.Id, 'D')}>D. {q.optionD ?? q.OptionD}</Box>
                                  </Radio>
                                </Stack>
                              </RadioGroup>
                            </VStack>

                            {/* Participant feedback after submission */}
                            {questionFeedback[q.id ?? q.Id] && (
                              <Box mt={3}>
                                {
                                  // drive feedback message from the same comparison used for styles
                                  (() => {
                                    const fb = questionFeedback[q.id ?? q.Id];
                                    const sel = (fb.submittedAnswer || '').toString().toUpperCase();
                                    const corr = (fb.correctAnswer || '').toString().toUpperCase();
                                    const isCorrectLocal = sel && corr && sel === corr;
                                    if (isCorrectLocal) {
                                      return <Text color="green.600" fontWeight="semibold">Correct — +{fb.pointsAwarded ?? 0} pts</Text>;
                                    }
                                    return <Text color="red.600" fontWeight="semibold">Incorrect — Correct: {fb.correctAnswer}</Text>;
                                  })()
                                }
                              </Box>
                            )}

                            {(user?.isAdmin || (competition && (competition.creatorId === user?.id || competition.creator?.id === user?.id))) && (
                              <Text mt={3} color="green.600" fontWeight="semibold">Correct: {q.correctAnswer ?? q.CorrectAnswer}</Text>
                            )}
                          </CardBody>
                        </Card>
                      ))}
                      {/* Submit answers button for participants */}
                      {!user?.isAdmin && competition && statusLower === 'ongoing' && user && (
                        <Button
                          colorScheme="purple"
                          alignSelf="end"
                          mt={4}
                          isLoading={submitting}
                          onClick={async () => {
                            if (!user) {
                              navigate('/login');
                              return;
                            }
                            // build payload from answersMap (only include answered)
                            const answers = Object.entries(answersMap)
                              .filter(([, val]) => val && val !== '')
                              .map(([qid, val]) => ({ questionId: Number(qid), answer: val }));

                            if (answers.length === 0) {
                              toast({ title: 'No answers', description: 'Please select at least one answer before submitting', status: 'warning', duration: 3000, isClosable: true });
                              return;
                            }

                            try {
                              setSubmitting(true);

                              // If the user hasn't joined yet, attempt to join automatically
                              if (!isJoined) {
                                try {
                                  const joinRes = await competitionApi.post(`/competitions/${id}/join`);
                                  if (joinRes.data?.success) {
                                    setIsJoined(true);
                                  } else {
                                    const msg = (joinRes.data?.message || '').toString().toLowerCase();
                                    // If backend says user is already a participant, treat as joined and continue
                                    if (msg.includes('already a participant')) {
                                      setIsJoined(true);
                                    } else {
                                      toast({ title: 'Not Registered', description: joinRes.data?.message || 'You must join the competition before submitting', status: 'error', duration: 3000, isClosable: true });
                                      setSubmitting(false);
                                      return;
                                    }
                                  }
                                } catch (je) {
                                  const jmsg = (je.response?.data?.message || je.message || '').toString().toLowerCase();
                                  if (jmsg.includes('already a participant')) {
                                    setIsJoined(true);
                                  } else {
                                    toast({ title: 'Join Failed', description: je.response?.data?.message || je.message || 'Failed to join competition', status: 'error', duration: 3000, isClosable: true });
                                    setSubmitting(false);
                                    return;
                                  }
                                }
                              }

                              const payload = { answers };
                              const resp = await competitionService.submitAnswers(id, payload);
                              if (resp && resp.success) {
                                toast({ title: 'Submitted', description: resp.message || 'Answers submitted successfully', status: 'success', duration: 3000, isClosable: true });
                                // show per-question feedback if available
                                const result = resp.data ?? resp.Data ?? resp.data;
                                const qr = result?.questionResults ?? result?.QuestionResults ?? result?.questionresults ?? null;
                                if (qr && Array.isArray(qr)) {
                                  const map = {};
                                  qr.forEach(r => {
                                    const qid = r.questionId ?? r.QuestionId ?? r.questionId;
                                    map[qid] = {
                                      isCorrect: r.isCorrect ?? r.IsCorrect,
                                      correctAnswer: r.correctAnswer ?? r.CorrectAnswer,
                                      submittedAnswer: r.submittedAnswer ?? r.SubmittedAnswer,
                                      pointsAwarded: r.pointsAwarded ?? r.PointsAwarded ?? 0
                                    };
                                  });
                                  setQuestionFeedback(map);
                                  setHasSubmitted(true);
                                }
                                // refresh summary/leaderboard
                                fetchCompetitionDetails();
                                try {
                                  const leaderRes = await competitionApi.get(`/competitions/${id}/leaderboard`);
                                  if (leaderRes.data.success) {
                                    const lb = leaderRes.data.data;
                                    setLeaderboard(lb);
                                    if (user && lb?.participants && Array.isArray(lb.participants)) {
                                      const idx = lb.participants.findIndex(p => {
                                      const pid = p.participantId ?? p.ParticipantId ?? p.participantId;
                                      return Number(pid) === Number(user.id);
                                    });
                                      if (idx >= 0) {
                                        setUserRank(idx + 1);
                                        setUserScore(lb.participants[idx].score ?? 0);
                                      } else {
                                        setUserRank(null);
                                        setUserScore(null);
                                      }
                                    }
                                  }
                                } catch (e) { /* ignore */ }
                              } else {
                                toast({ title: 'Error', description: resp?.message || 'Submission failed', status: 'error', duration: 3000, isClosable: true });
                              }
                            } catch (e) {
                              toast({ title: 'Error', description: e.response?.data?.message || e.message || 'Submission failed', status: 'error', duration: 3000, isClosable: true });
                            } finally {
                              setSubmitting(false);
                            }
                          }}
                        >
                          Submit Answers
                        </Button>
                      )}
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
