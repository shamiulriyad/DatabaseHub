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
  Switch,
  Badge,
  IconButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import competitionApi from '../../services/api';

const CompetitionCreate = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    competitionType: 'Quiz',
    startDate: '',
    endDate: '',
    clanId: null,
    questionCount: 5,
    isPublic: true,
    allowedMemberIds: [],
    allowedClanIds: [],
    pointRangeMin: null,
    pointRangeMax: null,
  });

  const [users, setUsers] = useState([]);
  const [clans, setClans] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedClans, setSelectedClans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clanSearchTerm, setClanSearchTerm] = useState('');

  const [questions, setQuestions] = useState([
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', points: 1 },
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', points: 1 },
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', points: 1 },
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', points: 1 },
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', points: 1 },
  ]);

  const canCreate = user && (user.isTeacher || user.isAdmin || user.isStudent);
  const isClanLeader = false;

  // Fetch users and clans for member selection
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await competitionApi.get('/admin/all-users');
        if (usersResponse.data.success) {
          setUsers(usersResponse.data.data || []);
        }
      } catch (error) {
        console.warn('Could not fetch users for selection:', error);
      }

      try {
        // Fetch clans - endpoint returns clans in 'clans' property, not 'data'
        // Get all public clans available for selection
        const clansResponse = await competitionApi.get('/clans/search?pageSize=100&isPublic=true');
        if (clansResponse.data.success) {
          // The API returns clans in the 'clans' property, not 'data'
          const clansList = clansResponse.data.clans || clansResponse.data.data || [];
          setClans(clansList);
        }
      } catch (error) {
        console.warn('Could not fetch clans for selection:', error);
      }
    };

    if (!formData.isPublic) {
      fetchData();
    }
  }, [formData.isPublic]); 
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'questionCount') {
      const count = parseInt(value) || 1;
      setFormData(prev => ({ ...prev, questionCount: count }));
      
      // Adjust questions array
      if (count > questions.length) {
        const newQuestions = [...questions];
        for (let i = questions.length; i < count; i++) {
          newQuestions.push({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', points: 1 });
        }
        setQuestions(newQuestions);
      } else if (count < questions.length) {
        setQuestions(questions.slice(0, count));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'clanId' ? (value ? parseInt(value) : null) : value
      }));
    }
  };

  const handleVisibilityToggle = () => {
    setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }));
    if (!formData.isPublic) {
      // Switching to public, clear selected members and clans
      setSelectedMembers([]);
      setSelectedClans([]);
      setFormData(prev => ({ 
        ...prev, 
        allowedMemberIds: [],
        allowedClanIds: [],
        pointRangeMin: null,
        pointRangeMax: null,
      }));
    }
  };

  const handleMemberSelect = (userId) => {
    if (!selectedMembers.some(m => m.id === userId)) {
      const member = users.find(u => u.id === userId);
      if (member) {
        const updated = [...selectedMembers, member];
        setSelectedMembers(updated);
        setFormData(prev => ({ ...prev, allowedMemberIds: updated.map(m => m.id) }));
      }
    }
  };

  const handleMemberRemove = (userId) => {
    const updated = selectedMembers.filter(m => m.id !== userId);
    setSelectedMembers(updated);
    setFormData(prev => ({ ...prev, allowedMemberIds: updated.map(m => m.id) }));
  };

  const handleClanSelect = (clanId) => {
    if (!selectedClans.some(c => c.id === clanId)) {
      const clan = clans.find(c => c.id === clanId);
      if (clan) {
        const updated = [...selectedClans, clan];
        setSelectedClans(updated);
        setFormData(prev => ({ ...prev, allowedClanIds: updated.map(c => c.id) }));
      }
    }
  };

  const handleClanRemove = (clanId) => {
    const updated = selectedClans.filter(c => c.id !== clanId);
    setSelectedClans(updated);
    setFormData(prev => ({ ...prev, allowedClanIds: updated.map(c => c.id) }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: 'Error',
        description: 'Start date and end date are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast({
        title: 'Error',
        description: 'End date must be after start date',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate questions
    if (questions.length === 0) {
      toast({ title: 'Error', description: 'At least one question is required', status: 'error', duration: 3000, isClosable: true });
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast({ title: 'Error', description: `Question ${i + 1}: Question text is required`, status: 'error', duration: 3000, isClosable: true });
        return;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        toast({ title: 'Error', description: `Question ${i + 1}: All four options (A, B, C, D) are required`, status: 'error', duration: 3000, isClosable: true });
        return;
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
        toast({ title: 'Error', description: `Question ${i + 1}: Correct answer must be A, B, C, or D`, status: 'error', duration: 3000, isClosable: true });
        return;
      }
    }

    // Validate private competition has allowed members or clans
    if (!formData.isPublic && formData.allowedMemberIds.length === 0 && formData.allowedClanIds.length === 0) {
      toast({ title: 'Error', description: 'Private competitions must have at least one allowed member or clan', status: 'error', duration: 3000, isClosable: true });
      return;
    }

    try {
      setLoading(true);
      const response = await competitionApi.post('/competitions', {
        title: formData.title,
        description: formData.description,
        competitionType: formData.competitionType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        clanId: formData.clanId,
        isPublic: formData.isPublic,
        allowedMemberIds: formData.isPublic ? null : formData.allowedMemberIds,
        allowedClanIds: formData.isPublic ? null : formData.allowedClanIds,
        pointRangeMin: formData.pointRangeMin,
        pointRangeMax: formData.pointRangeMax,
        questions: questions.map((q, index) => ({
          questionText: q.questionText,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          points: q.points || 1,
          order: index + 1,
        })),
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: response.data.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate(`/competitions/${response.data.data.id}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create competition',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canCreate) {
    return (
      <Box bg="gray.50" minH="calc(100vh - 100px)" py={8}>
        <Container maxW="4xl">
          <Card bg="white" shadow="lg" borderWidth="1px" borderColor="gray.200">
            <CardBody>
              <Heading as="h1" size="xl" color="red.600" mb={4}>
                Access Denied
              </Heading>
              <Text color="gray.600" mb={6}>
                Only Teachers, Admins, Students, and Clan Leaders can create competitions.
              </Text>
              <Button colorScheme="purple" onClick={() => navigate('/competitions')}>
                Back to Competitions
              </Button>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 100px)" py={8}>
      <Container maxW="4xl">
        <Card bg="white" shadow="lg" borderWidth="1px" borderColor="gray.200">
          <CardBody>
            <Heading as="h1" size="xl" color="purple.600" mb={2}>
              Create Competition
            </Heading>
            <Text color="gray.600" mb={6}>
              {user?.role === 'Student' 
                ? 'Your competition will be submitted for admin approval.' 
                : 'Your competition will be published immediately.'}
            </Text>

            {user?.role === 'Student' && (
              <Alert status="info" mb={6} rounded="md">
                <AlertIcon />
                Competitions created by students require admin approval before they appear publicly.
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Competition Title</FormLabel>
                  <Input
                    type="text"
                    name="title"
                    placeholder="e.g., JavaScript Quiz Challenge"
                    value={formData.title}
                    onChange={handleChange}
                    isDisabled={loading}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold">Description</FormLabel>
                  <Textarea
                    name="description"
                    placeholder="Describe the competition, rules, and objectives..."
                    value={formData.description}
                    onChange={handleChange}
                    isDisabled={loading}
                    rows={5}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Competition Type (for filtering)</FormLabel>
                  <Select
                    name="competitionType"
                    value={formData.competitionType}
                    onChange={handleChange}
                    isDisabled={loading}
                  >
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Programming">Programming</option>
                    <option value="Essay">Essay</option>
                    <option value="Debate">Debate</option>
                  </Select>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Type is used for categorization only. All competitions use quiz-based questions.
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Number of Questions</FormLabel>
                  <Input
                    type="number"
                    name="questionCount"
                    placeholder="How many questions?"
                    value={formData.questionCount}
                    onChange={handleChange}
                    isDisabled={loading}
                    min={1}
                    max={50}
                  />
                </FormControl>

                {/* Visibility Control */}
                <FormControl>
                  <HStack justify="space-between" mb={2}>
                    <FormLabel fontWeight="bold" mb={0}>Competition Visibility</FormLabel>
                    <HStack>
                      <Text fontSize="sm" color={formData.isPublic ? 'green.600' : 'orange.600'} fontWeight="semibold">
                        {formData.isPublic ? 'Public' : 'Private'}
                      </Text>
                      <Switch
                        isChecked={formData.isPublic}
                        onChange={handleVisibilityToggle}
                        colorScheme="purple"
                        size="lg"
                      />
                    </HStack>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    {formData.isPublic 
                      ? 'Anyone can join this competition.' 
                      : 'Only selected members can join this competition.'}
                  </Text>

                  {/* Private Member Selection */}
                  {!formData.isPublic && (
                    <Box mt={4} p={4} borderWidth="1px" borderColor="orange.300" rounded="lg" bg="orange.50">
                      <Heading size="sm" color="orange.700" mb={3}>Allowed Members</Heading>
                      
                      {/* Selected Members */}
                      {selectedMembers.length > 0 && (
                        <Box mb={4}>
                          <Text fontSize="sm" fontWeight="semibold" mb={2}>Selected ({selectedMembers.length}):</Text>
                          <Wrap spacing={2}>
                            {selectedMembers.map(member => (
                              <WrapItem key={member.id}>
                                <Badge
                                  colorScheme="purple"
                                  px={3}
                                  py={1}
                                  rounded="full"
                                  display="flex"
                                  alignItems="center"
                                  gap={2}
                                >
                                  {member.userName || member.email}
                                  <IconButton
                                    icon={<FaTimes />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="purple"
                                    onClick={() => handleMemberRemove(member.id)}
                                    aria-label="Remove member"
                                  />
                                </Badge>
                              </WrapItem>
                            ))}
                          </Wrap>
                        </Box>
                      )}

                      {/* User Search & Selection */}
                      <FormControl>
                        <FormLabel fontSize="sm">Search Users</FormLabel>
                        <Input
                          placeholder="Type to search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          bg="white"
                          mb={2}
                        />
                      </FormControl>

                      {searchTerm.length > 0 && (
                        <Box maxH="200px" overflowY="auto" borderWidth="1px" borderColor="gray.200" rounded="md" bg="white" p={2}>
                          {users
                            .filter(u => 
                              !selectedMembers.some(m => m.id === u.id) &&
                              (u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                            )
                            .map(u => (
                              <Box
                                key={u.id}
                                p={2}
                                _hover={{ bg: 'purple.50', cursor: 'pointer' }}
                                onClick={() => {
                                  handleMemberSelect(u.id);
                                  setSearchTerm('');
                                }}
                                borderBottomWidth="1px"
                                borderColor="gray.100"
                              >
                                <Text fontSize="sm" fontWeight="medium">{u.userName || 'Unknown'}</Text>
                                <Text fontSize="xs" color="gray.500">{u.email}</Text>
                              </Box>
                            ))}
                          {users.filter(u => 
                            !selectedMembers.some(m => m.id === u.id) &&
                            (u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                          ).length === 0 && (
                            <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>No users found</Text>
                          )}
                        </Box>
                      )}

                      {/* Clan Search & Selection */}
                      <FormControl mt={6}>
                        <FormLabel fontSize="sm" fontWeight="semibold">Select Clans (All Members)</FormLabel>
                        <Text fontSize="xs" color="gray.600" mb={2}>
                          Add entire clans - all their members will be included automatically
                        </Text>
                        
                        {/* Selected Clans */}
                        {selectedClans.length > 0 && (
                          <Box mb={4}>
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>Selected Clans ({selectedClans.length}):</Text>
                            <Wrap spacing={2}>
                              {selectedClans.map(clan => (
                                <WrapItem key={clan.id}>
                                  <Badge
                                    colorScheme="cyan"
                                    px={3}
                                    py={1}
                                    rounded="full"
                                    display="flex"
                                    alignItems="center"
                                    gap={2}
                                  >
                                    {clan.name || `Clan ${clan.id}`}
                                    <IconButton
                                      icon={<FaTimes />}
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="cyan"
                                      onClick={() => handleClanRemove(clan.id)}
                                      aria-label="Remove clan"
                                    />
                                  </Badge>
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Box>
                        )}

                        <Input
                          placeholder="Type to search clans..."
                          value={clanSearchTerm}
                          onChange={(e) => setClanSearchTerm(e.target.value)}
                          bg="white"
                          mb={2}
                        />
                      </FormControl>

                      {clanSearchTerm.length > 0 && (
                        <Box maxH="200px" overflowY="auto" borderWidth="1px" borderColor="gray.200" rounded="md" bg="white" p={2} mb={4}>
                          {clans
                            .filter(c => 
                              !selectedClans.some(sc => sc.id === c.id) &&
                              (c.name?.toLowerCase().includes(clanSearchTerm.toLowerCase()) ||
                               c.tag?.toLowerCase().includes(clanSearchTerm.toLowerCase()))
                            )
                            .map(c => (
                              <Box
                                key={c.id}
                                p={2}
                                _hover={{ bg: 'cyan.50', cursor: 'pointer' }}
                                onClick={() => {
                                  handleClanSelect(c.id);
                                  setClanSearchTerm('');
                                }}
                                borderBottomWidth="1px"
                                borderColor="gray.100"
                              >
                                <Text fontSize="sm" fontWeight="medium">{c.name || 'Unknown'}</Text>
                                <HStack spacing={2}>
                                  <Text fontSize="xs" color="gray.500">{c.tag}</Text>
                                  <Badge colorScheme="purple" fontSize="xs">{c.memberCount || 0} members</Badge>
                                </HStack>
                              </Box>
                            ))}
                          {clans.filter(c => 
                            !selectedClans.some(sc => sc.id === c.id) &&
                            (c.name?.toLowerCase().includes(clanSearchTerm.toLowerCase()) ||
                             c.tag?.toLowerCase().includes(clanSearchTerm.toLowerCase()))
                          ).length === 0 && (
                            <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>No clans found</Text>
                          )}
                        </Box>
                      )}

                      {/* Point Range Filter */}
                      {selectedClans.length > 0 && (
                        <Box mt={4} p={4} borderWidth="1px" borderColor="blue.200" rounded="md" bg="blue.50">
                          <Heading size="xs" color="blue.700" mb={3}>Point Range Filter (Optional)</Heading>
                          <Text fontSize="xs" color="gray.600" mb={3}>
                            Restrict clan members to those within a specific point range. Leave empty to include all members.
                          </Text>
                          <SimpleGrid columns={2} spacing={3}>
                            <FormControl>
                              <FormLabel fontSize="sm">Min Points</FormLabel>
                              <Input
                                type="number"
                                placeholder="e.g., 100"
                                value={formData.pointRangeMin || ''}
                                onChange={(e) => setFormData(prev => ({ 
                                  ...prev, 
                                  pointRangeMin: e.target.value ? parseInt(e.target.value) : null 
                                }))}
                                bg="white"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">Max Points</FormLabel>
                              <Input
                                type="number"
                                placeholder="e.g., 1000"
                                value={formData.pointRangeMax || ''}
                                onChange={(e) => setFormData(prev => ({ 
                                  ...prev, 
                                  pointRangeMax: e.target.value ? parseInt(e.target.value) : null 
                                }))}
                                bg="white"
                              />
                            </FormControl>
                          </SimpleGrid>
                          {formData.pointRangeMin !== null && formData.pointRangeMax !== null && (
                            <Text fontSize="xs" color="blue.600" mt={2}>
                              Only members with {formData.pointRangeMin} - {formData.pointRangeMax} points will be included
                            </Text>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </FormControl>

                {/* Dynamic Question Forms */}
                <Box>
                  <Heading size="md" color="purple.600" mb={4}>Questions</Heading>
                  <VStack spacing={6} align="stretch">
                    {questions.map((question, index) => (
                      <Box key={index} p={5} borderWidth="1px" borderColor="gray.300" rounded="lg" bg="gray.50">
                        <Heading size="sm" color="purple.600" mb={3}>Question {index + 1}</Heading>
                        
                        <FormControl isRequired mb={3}>
                          <FormLabel fontSize="sm" fontWeight="bold">Question Text</FormLabel>
                          <Textarea
                            placeholder="Enter your question..."
                            value={question.questionText}
                            onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                            isDisabled={loading}
                            rows={3}
                          />
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                          <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="bold">Option A</FormLabel>
                            <Input
                              placeholder="Option A"
                              value={question.optionA}
                              onChange={(e) => handleQuestionChange(index, 'optionA', e.target.value)}
                              isDisabled={loading}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="bold">Option B</FormLabel>
                            <Input
                              placeholder="Option B"
                              value={question.optionB}
                              onChange={(e) => handleQuestionChange(index, 'optionB', e.target.value)}
                              isDisabled={loading}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="bold">Option C</FormLabel>
                            <Input
                              placeholder="Option C"
                              value={question.optionC}
                              onChange={(e) => handleQuestionChange(index, 'optionC', e.target.value)}
                              isDisabled={loading}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="bold">Option D</FormLabel>
                            <Input
                              placeholder="Option D"
                              value={question.optionD}
                              onChange={(e) => handleQuestionChange(index, 'optionD', e.target.value)}
                              isDisabled={loading}
                            />
                          </FormControl>
                        </SimpleGrid>

                        <HStack spacing={4}>
                          <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="bold">Correct Answer</FormLabel>
                            <Select
                              value={question.correctAnswer}
                              onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                              isDisabled={loading}
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="bold">Points</FormLabel>
                            <Input
                              type="number"
                              value={question.points}
                              onChange={(e) => handleQuestionChange(index, 'points', parseInt(e.target.value) || 1)}
                              isDisabled={loading}
                              min={1}
                            />
                          </FormControl>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">Start Date & Time</FormLabel>
                    <Input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      isDisabled={loading}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">End Date & Time</FormLabel>
                    <Input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      isDisabled={loading}
                    />
                  </FormControl>
                </HStack>

                {(isClanLeader || user?.role === 'Student') && (
                  <FormControl>
                    <FormLabel fontWeight="bold">Clan ID (Optional)</FormLabel>
                    <Input
                      type="number"
                      name="clanId"
                      placeholder="Leave empty if not clan-specific"
                      value={formData.clanId || ''}
                      onChange={handleChange}
                      isDisabled={loading}
                    />
                  </FormControl>
                )}

                <HStack spacing={4} pt={4}>
                  <Button
                    colorScheme="purple"
                    type="submit"
                    isLoading={loading}
                    isDisabled={!formData.title.trim()}
                  >
                    Create Competition
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="purple"
                    onClick={() => navigate('/competitions')}
                    isDisabled={loading}
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default CompetitionCreate;
