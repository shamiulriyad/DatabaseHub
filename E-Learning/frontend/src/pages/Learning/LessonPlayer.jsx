import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Spinner, 
  Text, 
  Button, 
  HStack, 
  VStack, 
  Container,
  Flex,
  Heading,
  Badge,
  IconButton,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, TimeIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { MdOutlineOndemandVideo } from 'react-icons/md';
import VideoPlayer from '../../components/VideoPlayer';
import ProgressTracker from './ProgressTracker';
import { learningService } from '../../services/learningService';

export default function LessonPlayer() {
  const { lessonId } = useParams();
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const [nextValid, setNextValid] = useState(false);
  const [prevValid, setPrevValid] = useState(false);
  const [validatingNext, setValidatingNext] = useState(false);
  const [validatingPrev, setValidatingPrev] = useState(false);
  const [nextError, setNextError] = useState(null);
  const [prevError, setPrevError] = useState(null);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    learningService.getLesson(Number(lessonId))
      .then((data) => {
        const l = data.lesson || data;
        console.debug('GetLesson response', l);
        setLesson(l);
      })
      .catch((e) => {
        console.error(e);
        toast({
          title: 'Error loading lesson',
          description: 'Failed to load lesson content',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => setLoading(false));
  }, [lessonId, toast]);

  // Navigate to next lesson when current lesson is completed
  useEffect(() => {
    const onComplete = (e) => {
      try {
        const completedLessonId = Number(e?.detail?.lessonId ?? e?.detail?.lessonId);
        if (Number(lessonId) !== completedLessonId) return;
        const nextIdRaw = lesson?.NextLessonId ?? lesson?.nextLessonId ?? null;
        const nextId = nextIdRaw ? Number(nextIdRaw) : null;
        if (nextId && !isNaN(nextId)) {
          // Show completion toast
          toast({
            title: 'Lesson Completed!',
            description: 'Moving to next lesson...',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
          
          // short delay so UI completion state can flash
          setTimeout(async () => {
            try {
              await learningService.getLesson(nextId);
              navigate(`/learning/lesson/${nextId}`);
            } catch (err) {
              console.debug('navigate on complete: next lesson not available', nextId, err);
            }
          }, 500);
        }
      } catch (err) { 
        console.debug('navigate on complete error', err); 
      }
    };

    window.addEventListener('lessonCompleted', onComplete);
    return () => window.removeEventListener('lessonCompleted', onComplete);
  }, [lesson, lessonId, navigate, toast]);

  // Validate next/previous lesson existence to avoid 404 navigation
  useEffect(() => {
    let mounted = true;
    const validate = async () => {
      setNextValid(false);
      setPrevValid(false);

      const nextIdRaw = lesson?.NextLessonId ?? lesson?.nextLessonId ?? null;
      const prevIdRaw = lesson?.PreviousLessonId ?? lesson?.previousLessonId ?? null;

      const nextId = nextIdRaw ? Number(nextIdRaw) : null;
      const prevId = prevIdRaw ? Number(prevIdRaw) : null;

      if (nextId && !isNaN(nextId)) {
        setValidatingNext(true);
        setNextError(null);
        try {
          await learningService.getLesson(nextId);
          if (mounted) setNextValid(true);
        } catch (e) {
          if (mounted) {
            setNextValid(false);
            setNextError(e?.response?.status ? `${e.response.status} ${e.response.statusText || ''}` : (e.message || 'Unknown'));
          }
        } finally {
          if (mounted) setValidatingNext(false);
        }
      }

      if (prevId && !isNaN(prevId)) {
        setValidatingPrev(true);
        setPrevError(null);
        try {
          await learningService.getLesson(prevId);
          if (mounted) setPrevValid(true);
        } catch (e) {
          if (mounted) {
            setPrevValid(false);
            setPrevError(e?.response?.status ? `${e.response.status} ${e.response.statusText || ''}` : (e.message || 'Unknown'));
          }
        } finally {
          if (mounted) setValidatingPrev(false);
        }
      }
    };

    validate();

    return () => { mounted = false; };
  }, [lesson]);

  if (loading) {
    return (
      <Flex 
        minH="70vh" 
        align="center" 
        justify="center" 
        direction="column"
        gap={4}
      >
        <Spinner 
          size="xl" 
          color="blue.500" 
          thickness="4px"
          speed="0.65s"
        />
        <Text color="gray.600" fontSize="lg">
          Loading lesson content...
        </Text>
      </Flex>
    );
  }

  if (!lesson) {
    return (
      <Container maxW="container.lg" py={10}>
        <VStack spacing={6} textAlign="center">
          <Heading color="gray.700">Lesson Not Found</Heading>
          <Text fontSize="lg" color="gray.500">
            The lesson you're looking for doesn't exist or has been moved.
          </Text>
          <Button 
            colorScheme="blue" 
            onClick={() => navigate('/learning')}
            leftIcon={<ChevronLeftIcon />}
          >
            Back to Learning
          </Button>
        </VStack>
      </Container>
    );
  }

  // Determine videoType: prefer Lesson.VideoType, fallback to VideoProvider
  let videoUrl = lesson.VideoUrl || lesson.videoUrl || lesson.VideoUrl || '';
  const duration = lesson.Duration || lesson.VideoDuration || lesson.duration || 0;

  // Normalize and infer type when backend omits explicit field
  const rawType = (lesson.VideoType || lesson.VideoProvider || '') || '';
  let videoType = rawType.toString().toUpperCase();
  if (!videoType) {
    const u = (videoUrl || '').toString();
    if (/youtu(?:be\.com|\.be)/i.test(u)) videoType = 'YOUTUBE';
    else if (/\.(mp4|webm|ogg)(\?|$)/i.test(u)) videoType = 'MP4';
    else if (u.includes('youtube') || u.includes('youtu.be')) videoType = 'YOUTUBE';
    else if (u) videoType = 'MP4';
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const mins = Math.ceil(seconds / 60);
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  };

  return (
    <Container maxW="container.xl" py={{ base: 4, md: 6 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb mb={6} fontSize="sm" color="gray.600">
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/learning')}>
            Learning
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/learning/module')}>
            Module
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <Text color="blue.600" fontWeight="medium">
            {lesson.Title || lesson.title || 'Lesson'}
          </Text>
        </BreadcrumbItem>
      </Breadcrumb>

      <Grid 
        templateColumns={{ base: '1fr', lg: '3fr 1fr' }} 
        gap={{ base: 6, lg: 8 }}
        mb={8}
      >
        {/* Main Content */}
        <GridItem>
          {/* Lesson Header */}
          <Box 
            bg="white" 
            borderRadius="xl" 
            p={{ base: 4, md: 6 }}
            mb={6}
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Flex justify="space-between" align="start" mb={4}>
              <VStack align="start" spacing={2}>
                <Flex align="center" gap={3}>
                  <Box 
                    p={2} 
                    bg="blue.50" 
                    borderRadius="lg"
                    color="blue.600"
                  >
                    <MdOutlineOndemandVideo size="24px" />
                  </Box>
                  <Heading size="lg" color="gray.800">
                    {lesson.Title || lesson.title}
                  </Heading>
                </Flex>
                
                <Flex wrap="wrap" gap={3}>
                  <Badge 
                    colorScheme="blue" 
                    py={1} 
                    px={3} 
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <TimeIcon boxSize="12px" />
                    {formatDuration(duration)}
                  </Badge>
                  
                  {lesson.isCompleted && (
                    <Badge 
                      colorScheme="green" 
                      py={1} 
                      px={3} 
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <CheckCircleIcon boxSize="12px" />
                      Completed
                    </Badge>
                  )}
                  
                  <Badge 
                    colorScheme="purple" 
                    py={1} 
                    px={3} 
                    borderRadius="full"
                  >
                    {videoType}
                  </Badge>
                </Flex>
              </VStack>
            </Flex>

            {/* Lesson Description */}
            {lesson.Description || lesson.description ? (
              <Box 
                mt={4} 
                p={4} 
                bg="gray.50" 
                borderRadius="lg"
                borderLeft="4px solid"
                borderColor="blue.500"
              >
                <Text color="gray.700" lineHeight="tall">
                  {lesson.Description || lesson.description}
                </Text>
              </Box>
            ) : null}
          </Box>

          {/* Video Player Section */}
          <Box 
            bg="white" 
            borderRadius="xl" 
            overflow="hidden"
            boxShadow="md"
            borderWidth="1px"
            borderColor="gray.200"
            mb={6}
          >
            <VideoPlayer 
                lessonId={Number(lessonId)} 
              videoType={videoType} 
              videoUrl={videoUrl} 
              duration={duration} 
                enrollmentId={lesson?.EnrollmentId ?? lesson?.enrollmentId ?? null}
            />
          </Box>

          {/* Progress Tracker */}
          <Box 
            bg="white" 
            borderRadius="xl" 
            p={{ base: 4, md: 6 }}
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Heading size="md" mb={4} color="gray.700">
              Your Progress
            </Heading>
            <ProgressTracker lessonId={Number(lessonId)} />
          </Box>
        </GridItem>

        {/* Sidebar - Navigation & Actions */}
        <GridItem>
          <Box 
            bg="white" 
            borderRadius="xl" 
            p={{ base: 4, md: 6 }}
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
            position="sticky"
            top="6"
          >
           

            <VStack spacing={4}>
              {/* Previous Lesson Button */}
          

              {/* Next Lesson Button */}
          

              {/* Quick Actions */}
              <Box w="full" pt={6} borderTopWidth="1px" borderColor="gray.100">
                <Heading size="sm" mb={4} color="gray.600">
                  Quick Actions
                </Heading>
                <VStack spacing={3}>
                  
                  <Button
                    w="full"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={() => window.location.reload()}
                  >
                    Restart Lesson
                  </Button>
                </VStack>
              </Box>
            </VStack>

            {/* Course Progress Summary */}
            {lesson.courseProgress && (
              <Box 
                mt={6} 
                p={4} 
                bg="blue.50" 
                borderRadius="lg"
                borderLeft="4px solid"
                borderColor="blue.400"
              >
                <Text fontSize="sm" fontWeight="medium" color="blue.800" mb={1}>
                  Course Progress
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {lesson.courseProgress}%
                </Text>
                <Text fontSize="xs" color="blue.600">
                  Overall completion
                </Text>
              </Box>
            )}
          </Box>
        </GridItem>
      </Grid>

      {/* Bottom Navigation - Mobile */}
      <Box 
        display={{ base: 'block', lg: 'none' }}
        bg="white"
        position="sticky"
        bottom="0"
        p={4}
        borderTopWidth="1px"
        borderColor="gray.200"
        boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
      >
        <HStack justify="space-between">
          {(() => {
            const prevIdRaw = lesson?.PreviousLessonId ?? lesson?.previousLessonId ?? null;
            const prevId = prevIdRaw ? Number(prevIdRaw) : null;
            if (prevId && !isNaN(prevId)) {
              return (
                <IconButton
                  icon={<ChevronLeftIcon />}
                  aria-label="Previous lesson"
                  onClick={async () => {
                    try {
                      await learningService.getLesson(prevId);
                      navigate(`/learning/lesson/${prevId}`);
                    } catch (err) {
                      console.debug('Previous lesson fetch failed', prevId, err);
                    }
                  }}
                  colorScheme="gray"
                  variant="outline"
                  isRound
                />
              );
            }
            return <Box />;
          })()}

          {(() => {
            const nextIdRaw = lesson?.NextLessonId ?? lesson?.nextLessonId ?? null;
            const nextId = nextIdRaw ? Number(nextIdRaw) : null;
            if (nextId && !isNaN(nextId)) {
              return (
                <IconButton
                  icon={<ChevronRightIcon />}
                  aria-label="Next lesson"
                  onClick={async () => {
                    try {
                      await learningService.getLesson(nextId);
                      navigate(`/learning/lesson/${nextId}`);
                    } catch (err) {
                      console.debug('Next lesson fetch failed', nextId, err);
                    }
                  }}
                  colorScheme="blue"
                  isRound
                />
              );
            }
            return <Box />;
          })()}
        </HStack>
      </Box>
    </Container>
  );
}