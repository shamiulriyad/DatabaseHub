import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  CardHeader,
  Radio,
  RadioGroup,
  Stack,
  Progress,
  Icon,
  useColorModeValue,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip,
} from '@chakra-ui/react';
import {
  FaClock,
  FaArrowLeft,
  FaCheckCircle,
  FaQuestionCircle,
} from 'react-icons/fa';
import api from '../../services/api';

const QuizView = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const cancelRef = React.useRef();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  useEffect(() => {
    if (!quiz || !quiz.timeLimit) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/quizzes/${quizId}`);

      if (response.data.success && response.data.data) {
        const quizData = response.data.data;
        setQuiz(quizData);
        setTimeRemaining(quizData.timeLimit ? quizData.timeLimit * 60 : null);
        // Initialize answers object
        const initialAnswers = {};
        quizData.questions?.forEach((q) => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      // Mock data for demonstration
      setQuiz({
        id: quizId,
        title: 'React Basics Quiz',
        description: 'Test your knowledge of React fundamentals',
        courseTitle: 'Complete React Development',
        passScore: 70,
        timeLimit: 1,
        questions: [
          {
            id: 1,
            text: 'What is React?',
            type: 'MultipleChoice',
            options: [
              { id: 1, text: 'A JavaScript library for building user interfaces' },
              { id: 2, text: 'A backend framework' },
              { id: 3, text: 'A database' },
              { id: 4, text: 'A CSS framework' },
            ],
            correctOptionId: 1,
          },
          {
            id: 2,
            text: 'What is JSX?',
            type: 'MultipleChoice',
            options: [
              { id: 5, text: 'JavaScript XML syntax extension' },
              { id: 6, text: 'A type of JSON' },
              { id: 7, text: 'A styling library' },
              { id: 8, text: 'A backend technology' },
            ],
            correctOptionId: 5,
          },
          {
            id: 3,
            text: 'What is a hook in React?',
            type: 'MultipleChoice',
            options: [
              { id: 9, text: 'A function to use state and other React features in functional components' },
              { id: 10, text: 'A CSS feature' },
              { id: 11, text: 'A database query tool' },
              { id: 12, text: 'A routing mechanism' },
            ],
            correctOptionId: 9,
          },
        ],
      });
      setTimeRemaining(1 * 60);
    }
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setVisitedQuestions((prev) => new Set([...prev, nextIndex]));
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setVisitedQuestions((prev) => new Set([...prev, index]));
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await api.post(`/quizzes/${quizId}/submit`, {
        answers: answers,
      });

      if (response.data.success) {
        navigate(`/quiz/${quizId}/results`, {
          state: {
            score: response.data.data.score,
            passed: response.data.data.passed,
            message: response.data.data.message,
          },
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Mock success for demonstration
      navigate(`/quiz/${quizId}/results`, {
        state: {
          score: 85,
          passed: true,
          message: 'Great job! You passed the quiz.',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return 'Unlimited';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading || !quiz) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="4xl">
          <VStack justify="center" align="center" h="400px">
            <Spinner size="lg" color="purple.500" />
            <Text>Loading quiz...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredQuestions = Object.values(answers).filter((a) => a !== '').length;
  const totalQuestions = quiz.questions.length;

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="6xl">
        {/* Header */}
        <HStack justify="space-between" mb={8} wrap="wrap">
          <VStack align="start" spacing={0}>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              size="sm"
              onClick={() => {
                if (answeredQuestions > 0) {
                  onAlertOpen();
                } else {
                  navigate('/quizzes');
                }
              }}
            >
              Exit Quiz
            </Button>
            <Heading size="lg" mt={2}>
              {quiz.title}
            </Heading>
          </VStack>

          {timeRemaining !== null && (
            <Card bg={timeRemaining < 300 ? 'red.50' : cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <VStack align="center" spacing={1}>
                  <HStack spacing={2} justify="center">
                    <Icon as={FaClock} color={timeRemaining < 300 ? 'red.500' : 'gray.500'} />
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color={timeRemaining < 300 ? 'red.500' : 'inherit'}
                    >
                      {formatTime(timeRemaining)}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Time Remaining
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}
        </HStack>

        {/* Progress */}
        <Card bg={cardBg} mb={8} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" fontWeight="bold">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {answeredQuestions} of {totalQuestions} answered
                </Text>
              </HStack>
              <Progress value={(currentQuestionIndex + 1 / totalQuestions) * 100} w="100%" />
            </VStack>
          </CardBody>
        </Card>

        <HStack align="start" spacing={6}>
          {/* Main Quiz Area */}
          <VStack flex={1} spacing={6} align="stretch">
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader pb={4} borderBottomWidth="1px" borderColor={borderColor}>
                <Heading size="md">{currentQuestion.text}</Heading>
              </CardHeader>

              <CardBody>
                <RadioGroup
                  value={answers[currentQuestion.id]?.toString() || ''}
                  onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                >
                  <Stack spacing={3}>
                    {currentQuestion.options?.map((option) => (
                      <Box
                        key={option.id}
                        p={3}
                        borderWidth="1px"
                        borderColor={
                          answers[currentQuestion.id]?.toString() === option.id.toString()
                            ? 'blue.500'
                            : borderColor
                        }
                        borderRadius="md"
                        cursor="pointer"
                        _hover={{ bg: hoverBg }}
                        bg={
                          answers[currentQuestion.id]?.toString() === option.id.toString()
                            ? selectedBg
                            : 'transparent'
                        }
                      >
                        <Radio value={option.id.toString()} w="100%">
                          <Text ml={2}>{option.text}</Text>
                        </Radio>
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>
              </CardBody>
            </Card>

            {/* Navigation */}
            <HStack justify="space-between" w="100%">
              <Button
                leftIcon={<FaArrowLeft />}
                onClick={handlePreviousQuestion}
                isDisabled={currentQuestionIndex === 0}
                variant="outline"
              >
                Previous
              </Button>

              {currentQuestionIndex === totalQuestions - 1 ? (
                <Button
                  colorScheme="green"
                  onClick={onModalOpen}
                  isLoading={isSubmitting}
                  loadingText="Submitting..."
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button colorScheme="blue" onClick={handleNextQuestion}>
                  Next
                </Button>
              )}
            </HStack>
          </VStack>

          {/* Questions Navigation Panel */}
          <Card
            bg={cardBg}
            borderColor={borderColor}
            borderWidth="1px"
            w={{ base: '100%', lg: '250px' }}
            position={{ base: 'static', lg: 'sticky' }}
            top={4}
            h="fit-content"
          >
            <CardHeader pb={3}>
              <Heading size="sm">Questions</Heading>
              <Text fontSize="xs" color="gray.500" mt={2}>
                Click on any question to jump
              </Text>
            </CardHeader>

            <CardBody pt={0}>
              <VStack spacing={2} align="stretch">
                {quiz.questions?.map((question, index) => (
                  <Tooltip
                    key={question.id}
                    label={`Question ${index + 1}: ${question.text.substring(0, 50)}...`}
                    placement="left"
                  >
                    <Button
                      size="sm"
                      w="100%"
                      justifyContent="flex-start"
                      colorScheme={
                        currentQuestionIndex === index
                          ? 'blue'
                          : answers[question.id] !== ''
                          ? 'green'
                          : 'gray'
                      }
                      variant={currentQuestionIndex === index ? 'solid' : 'outline'}
                      onClick={() => handleJumpToQuestion(index)}
                      rightIcon={
                        answers[question.id] !== '' ? <FaCheckCircle /> : undefined
                      }
                    >
                      Q {index + 1}
                    </Button>
                  </Tooltip>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </HStack>
      </Container>

      {/* Submit Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Icon as={FaQuestionCircle} color="blue.500" />
              <Text>Submit Quiz?</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <VStack align="start" spacing={3}>
              <Text>
                You have answered <strong>{answeredQuestions}</strong> out of{' '}
                <strong>{totalQuestions}</strong> questions.
              </Text>
              <Text fontSize="sm" color="gray.600">
                Once submitted, you will not be able to change your answers.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onModalClose}>
                Cancel
              </Button>
              <Button colorScheme="green" onClick={handleSubmitQuiz} isLoading={isSubmitting}>
                Submit Quiz
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Exit Confirmation Alert */}
      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Exit Quiz?
            </AlertDialogHeader>
            <AlertDialogBody>
              You have answered <strong>{answeredQuestions}</strong> questions. If you exit now, your
              progress will be lost.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Continue Quiz
              </Button>
              <Button colorScheme="red" onClick={() => navigate('/quizzes')} ml={3}>
                Exit Without Saving
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default QuizView;
