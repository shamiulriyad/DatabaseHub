import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  HStack,
  Card,
  CardBody,
  useToast,
  Alert,
  AlertIcon,
  Select,
  SimpleGrid,
  Badge,
  
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import competitionApi from '../../services/api';

const ClanVsClansCompetitionCreate = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetchingClans, setFetchingClans] = useState(false);
  const [userClans, setUserClans] = useState([]);
  const [availableClans, setAvailableClans] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    competitionType: 'Programming',
    difficultyLevel: 'Medium',
    participantsPerClan: 3,
    durationMinutes: 30,
    opponentClanId: '',
    scheduledStartTime: '',
  });

  const [questions, setQuestions] = useState([
    {
      questionText: '',
      topic: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      points: 10,
    },
  ]);

  const [currentStep, setCurrentStep] = useState('details'); // details, questions, review, submit

  // Fetch all clan/role/permission data from /api/competitions/create-context
  useEffect(() => {
    const fetchCreateContext = async () => {
      setFetchingClans(true);
      try {
        const response = await competitionApi.get('/competitions/create-context');
        if (response.data.success) {
          // All clans user is a member of
          setAvailableClans(response.data.clans || []);
          // Only leader/co-leader clans
          setUserClans(response.data.leaderClans || []);
        }
      } catch (error) {
        console.warn('Could not fetch create context:', error);
      } finally {
        setFetchingClans(false);
      }
    };
    if (user) {
      fetchCreateContext();
    }
  }, [user]);

  if (!user) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <Heading size="md">Not Authenticated</Heading>
            <Text>You must be logged in to create a clan vs clan competition.</Text>
          </Box>
        </Alert>
      </Container>
    );
  }

  if (userClans.length === 0) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <Heading size="md">Not a Clan Leader</Heading>
            <Text>
              You must be a leader or co-leader of a clan to create a clan vs clan competition.
            </Text>
          </Box>
        </Alert>
      </Container>
    );
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'participantsPerClan' || name === 'durationMinutes'
          ? parseInt(value)
          : name === 'opponentClanId'
          ? parseInt(value)
          : value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        topic: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        points: 10,
      },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const validateDetails = () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Competition title is required',
        status: 'error',
      });
      return false;
    }

    if (!formData.opponentClanId) {
      toast({
        title: 'Error',
        description: 'Please select an opponent clan',
        status: 'error',
      });
      return false;
    }

    if (formData.participantsPerClan < 1 || formData.participantsPerClan > 10) {
      toast({
        title: 'Error',
        description: 'Participants per clan must be between 1 and 10',
        status: 'error',
      });
      return false;
    }

    if (formData.durationMinutes < 5 || formData.durationMinutes > 180) {
      toast({
        title: 'Error',
        description: 'Duration must be between 5 and 180 minutes',
        status: 'error',
      });
      return false;
    }

    return true;
  };

  const validateQuestions = () => {
    if (questions.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one question is required',
        status: 'error',
      });
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast({
          title: 'Error',
          description: `Question ${i + 1}: Question text is required`,
          status: 'error',
        });
        return false;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        toast({
          title: 'Error',
          description: `Question ${i + 1}: All four options are required`,
          status: 'error',
        });
        return false;
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
        toast({
          title: 'Error',
          description: `Question ${i + 1}: Correct answer must be A, B, C, or D`,
          status: 'error',
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateDetails() || !validateQuestions()) {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        competitionType: formData.competitionType,
        difficultyLevel: formData.difficultyLevel,
        participantsPerClan: formData.participantsPerClan,
        durationMinutes: formData.durationMinutes,
        opponentClanId: formData.opponentClanId,
        scheduledStartTime: formData.scheduledStartTime || null,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          topic: q.topic,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          points: q.points,
        })),
      };

      const response = await competitionApi.post('/clan-vs-clans-competitions', payload);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Clan vs clan competition created successfully!',
          status: 'success',
          duration: 3000,
        });
        navigate(`/clans/competitions/${response.data.data.id}`);
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to create competition',
          status: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
      });
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChallengerClan = () => {
    return userClans[0]; // Using first clan as challenger
  };

  const getOpponentClan = () => {
    return availableClans.find((c) => c.id === parseInt(formData.opponentClanId));
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Create Clan vs Clan Competition
          </Heading>
          <Text color="gray.600">
            Challenge another clan to an MCQ-based competition. Test programming knowledge with
            focused questions covering algorithms, data structures, and coding concepts.
          </Text>
        </Box>

        <Tabs
          index={['details', 'questions', 'review'].indexOf(currentStep)}
          onChange={(index) =>
            setCurrentStep(['details', 'questions', 'review'][index])
          }
        >
          <TabList>
            <Tab>Competition Details</Tab>
            <Tab>Add Questions</Tab>
            <Tab>Review & Submit</Tab>
          </TabList>

          <TabPanels>
            {/* Step 1: Competition Details */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Challenger Info */}
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Your Clan (Challenger)
                    </Heading>
                    {getChallengerClan() && (
                      <HStack spacing={4}>
                        {getChallengerClan().logoUrl && (
                          <img
                            src={getChallengerClan().logoUrl}
                            alt={getChallengerClan().name}
                            width={60}
                            height={60}
                            style={{ borderRadius: '8px' }}
                          />
                        )}
                        <Box>
                          <Heading size="sm">{getChallengerClan().name}</Heading>
                          <Text color="gray.600">{getChallengerClan().memberCount} members</Text>
                        </Box>
                      </HStack>
                    )}
                  </CardBody>
                </Card>

                {/* Title and Description */}
                <FormControl isRequired>
                  <FormLabel>Competition Title</FormLabel>
                  <Input
                    name="title"
                    placeholder="e.g., Spring 2026 Programming Challenge"
                    value={formData.title}
                    onChange={handleFormChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    placeholder="Optional description for this competition"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                  />
                </FormControl>

                {/* Opponent Clan Selection */}
                <FormControl isRequired>
                  <FormLabel>Challenge Opponent Clan</FormLabel>
                  <Select
                    name="opponentClanId"
                    value={formData.opponentClanId}
                    onChange={handleFormChange}
                    placeholder="Select a clan to challenge"
                    isDisabled={fetchingClans}
                  >
                    {fetchingClans ? (
                      <option>Loading clans...</option>
                    ) : (
                      availableClans
                        .filter((c) => c.id !== getChallengerClan().id)
                        .map((clan) => (
                          <option key={clan.id} value={clan.id}>
                            {clan.name} ({clan.memberCount} members)
                          </option>
                        ))
                    )}
                  </Select>
                </FormControl>

                {getOpponentClan() && (
                  <Card bg="blue.50">
                    <CardBody>
                      <Heading size="sm" mb={2}>
                        Opponent Clan Details
                      </Heading>
                      <HStack spacing={4}>
                        {getOpponentClan().logoUrl && (
                          <img
                            src={getOpponentClan().logoUrl}
                            alt={getOpponentClan().name}
                            width={50}
                            height={50}
                            style={{ borderRadius: '8px' }}
                          />
                        )}
                        <Box>
                          <Text>
                            <strong>{getOpponentClan().name}</strong>
                          </Text>
                          <Text color="gray.600">{getOpponentClan().memberCount} members</Text>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>
                )}

                {/* Competition Type and Settings */}
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Competition Type</FormLabel>
                    <Select
                      name="competitionType"
                      value={formData.competitionType}
                      onChange={handleFormChange}
                    >
                      <option value="Programming">Programming</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Mixed">Mixed</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select
                      name="difficultyLevel"
                      value={formData.difficultyLevel}
                      onChange={handleFormChange}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Participants per Clan</FormLabel>
                    <Input
                      type="number"
                      name="participantsPerClan"
                      value={formData.participantsPerClan}
                      onChange={handleFormChange}
                      min={1}
                      max={10}
                    />
                    <Text fontSize="sm" color="gray.600">
                      Each clan will select this many participants
                    </Text>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <Input
                      type="number"
                      name="durationMinutes"
                      value={formData.durationMinutes}
                      onChange={handleFormChange}
                      min={5}
                      max={180}
                    />
                    <Text fontSize="sm" color="gray.600">
                      Time limit for answering all questions
                    </Text>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Scheduled Start Time (Optional)</FormLabel>
                  <Input
                    type="datetime-local"
                    name="scheduledStartTime"
                    value={formData.scheduledStartTime}
                    onChange={handleFormChange}
                  />
                  <Text fontSize="sm" color="gray.600">
                    Leave empty to start immediately after both clans select participants
                  </Text>
                </FormControl>

                <Button
                  colorScheme="blue"
                  onClick={() => setCurrentStep('questions')}
                  size="lg"
                >
                  Next: Add Questions
                </Button>
              </VStack>
            </TabPanel>

            {/* Step 2: Add Questions */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="sm" mb={2}>
                    Add MCQ Questions
                  </Heading>
                  <Text color="gray.600" mb={4}>
                    Add questions focused on programming concepts, algorithms, and logic. Both
                    clans will answer the same questions.
                  </Text>
                </Box>

                {questions.map((question, index) => (
                  <Card key={index} variant="outline">
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="sm">Question {index + 1}</Heading>
                          {questions.length > 1 && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeQuestion(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </HStack>

                        <SimpleGrid columns={2} spacing={4}>
                          <FormControl isRequired>
                            <FormLabel>Topic/Area</FormLabel>
                            <Input
                              placeholder="e.g., Arrays, Sorting, Recursion"
                              value={question.topic}
                              onChange={(e) =>
                                handleQuestionChange(index, 'topic', e.target.value)
                              }
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel>Points</FormLabel>
                            <Input
                              type="number"
                              value={question.points}
                              onChange={(e) =>
                                handleQuestionChange(index, 'points', parseInt(e.target.value))
                              }
                              min={1}
                              max={100}
                            />
                          </FormControl>
                        </SimpleGrid>

                        <FormControl isRequired>
                          <FormLabel>Question Text</FormLabel>
                          <Textarea
                            placeholder="Write your question here"
                            value={question.questionText}
                            onChange={(e) =>
                              handleQuestionChange(index, 'questionText', e.target.value)
                            }
                            rows={3}
                          />
                        </FormControl>

                        <SimpleGrid columns={2} spacing={4}>
                          {['A', 'B', 'C', 'D'].map((option) => (
                            <FormControl key={option} isRequired>
                              <FormLabel>Option {option}</FormLabel>
                              <Input
                                placeholder={`Option ${option}`}
                                value={question[`option${option}`]}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    index,
                                    `option${option}`,
                                    e.target.value
                                  )
                                }
                              />
                            </FormControl>
                          ))}
                        </SimpleGrid>

                        <FormControl isRequired>
                          <FormLabel>Correct Answer</FormLabel>
                          <Select
                            value={question.correctAnswer}
                            onChange={(e) =>
                              handleQuestionChange(index, 'correctAnswer', e.target.value)
                            }
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </Select>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}

                <Button
                  colorScheme="gray"
                  variant="outline"
                  onClick={addQuestion}
                  width="full"
                >
                  + Add Another Question
                </Button>

                <HStack spacing={4} justify="space-between">
                  <Button variant="outline" onClick={() => setCurrentStep('details')}>
                    Back
                  </Button>
                  <Button colorScheme="blue" onClick={() => setCurrentStep('review')}>
                    Next: Review
                  </Button>
                </HStack>
              </VStack>
            </TabPanel>

            {/* Step 3: Review & Submit */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="sm">Review Your Competition</Heading>

                <Card>
                  <CardBody>
                    <SimpleGrid columns={2} spacing={6}>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Title
                        </Text>
                        <Text>{formData.title}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Type
                        </Text>
                        <Badge colorScheme="blue">{formData.competitionType}</Badge>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Difficulty
                        </Text>
                        <Badge
                          colorScheme={
                            formData.difficultyLevel === 'Easy'
                              ? 'green'
                              : formData.difficultyLevel === 'Medium'
                              ? 'yellow'
                              : 'red'
                          }
                        >
                          {formData.difficultyLevel}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Duration
                        </Text>
                        <Text>{formData.durationMinutes} minutes</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Participants
                        </Text>
                        <Text>{formData.participantsPerClan} vs {formData.participantsPerClan}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" mb={2}>
                          Total Questions
                        </Text>
                        <Text>{questions.length} questions</Text>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <Box>
                  <Heading size="sm" mb={4}>
                    Questions Preview ({questions.length})
                  </Heading>
                  {questions.map((q, idx) => (
                    <Card key={idx} mb={3}>
                      <CardBody>
                        <Text fontWeight="bold" mb={2}>
                          Q{idx + 1}: {q.questionText.substring(0, 60)}...
                        </Text>
                        <HStack spacing={4} fontSize="sm">
                          <Badge>{q.topic || 'General'}</Badge>
                          <Badge colorScheme="purple">{q.points} pts</Badge>
                          <Badge colorScheme="green">Answer: {q.correctAnswer}</Badge>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </Box>

                <HStack spacing={4} justify="space-between">
                  <Button variant="outline" onClick={() => setCurrentStep('questions')}>
                    Back to Questions
                  </Button>
                  <Button
                    colorScheme="green"
                    size="lg"
                    isLoading={loading}
                    onClick={handleSubmit}
                  >
                    Create Competition
                  </Button>
                </HStack>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default ClanVsClansCompetitionCreate;
