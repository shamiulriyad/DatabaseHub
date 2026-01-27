import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Heading, Text, Image, Button, HStack, IconButton, Input, 
  VStack, useToast, Container, Flex, Badge, Stack, Divider, 
  Progress, Grid, GridItem, Card, CardBody, AspectRatio,
  Icon, Tooltip, Spinner, Skeleton, SkeletonText
} from '@chakra-ui/react';
import { StarIcon, ChevronLeftIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons';
import { FiBookOpen, FiClock, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { courseService } from '../../services/courseService';
import api from '../../services/api';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data || null);
      } catch (err) {
        console.error('Failed to load course', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const handleBuy = async () => {
    const price = course?.price ?? 0;
    if (price > 0) {
      navigate(`/payment?courseId=${courseId}`);
      return;
    }

    try {
      const res = await api.post(`/courses/${courseId}/enroll`);
      if (res?.data?.success) {
        toast({
          title: 'Successfully Enrolled!',
          description: res.data.message || 'You are now enrolled in this course.',
          status: 'success',
          duration: 3000,
          position: 'top-right',
          isClosable: true,
        });
        const refreshed = await courseService.getCourseById(courseId);
        setCourse(refreshed || course);
      } else {
        toast({
          title: 'Enrollment Failed',
          description: res?.data?.message || 'Could not enroll at this time.',
          status: 'error',
          duration: 4000,
        });
      }
    } catch (err) {
      console.error('Enroll failed', err);
      const msg = err.response?.data?.message || err.message || 'Enrollment request failed';
      toast({
        title: 'Enrollment Error',
        description: msg,
        status: 'error',
        duration: 4000,
      });
    }
  };

  const submitRating = async () => {
    if (!rating) {
      toast({
        title: 'Please select a rating',
        status: 'warning',
        duration: 2000,
      });
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/courses/${courseId}/ratings`, { rating, review });
      const refreshed = await courseService.getCourseById(courseId);
      setCourse(refreshed || course);
      setReview('');
      setRating(0);
      toast({
        title: 'Rating Submitted!',
        description: 'Thank you for your feedback.',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to submit rating', err);
      toast({
        title: 'Submission Failed',
        description: 'Could not submit your rating. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="6xl" py={8}>
        <Flex direction="column" gap={8}>
          <Skeleton height="400px" borderRadius="lg" />
          <SkeletonText mt="4" noOfLines={6} spacing="4" />
        </Flex>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxW="6xl" py={20} textAlign="center">
        <VStack spacing={6}>
          <Heading color="gray.500">Course Not Found</Heading>
          <Text color="gray.500">The course you're looking for doesn't exist or has been removed.</Text>
          <Button leftIcon={<ChevronLeftIcon />} onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </VStack>
      </Container>
    );
  }

  const price = course.price ?? 0;
  const isEnrolled = (course.isEnrolled ?? course.IsEnrolled) ?? false;
  const previewUrl = course.previewVideoUrl ?? course.PreviewVideoUrl ?? course.youtubeUrl ?? course.YouTubeUrl ?? '';
  const parts = (course.videoParts || course.VideoParts) || [];
  // Filter out parts that have no usable video URL to avoid rendering empty players
  const validParts = parts.filter(p => {
    const url = (p?.videoUrl || p?.VideoUrl || p?.youTubeUrl || p?.YouTubeUrl || '').toString().trim();
    return url.length > 0;
  });
  const avgRating = course.averageRating || 0;
  const totalRatings = course.totalRatings || 0;

  return (
    <Container maxW="6xl" py={8}>
      <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={8}>
        {/* Main Content */}
        <GridItem>
          {/* Course Header */}
          <Card mb={6} borderRadius="lg" overflow="hidden" boxShadow="sm">
            <CardBody p={8}>
              <Stack spacing={6}>
                <Box>
                  <Flex justify="space-between" align="flex-start" mb={4}>
                    <Box>
                      <Badge 
                        colorScheme={course.status === 'Published' ? 'green' : 'gray'} 
                        px={3} 
                        py={1} 
                        borderRadius="full"
                        fontSize="sm"
                      >
                        {course.status}
                      </Badge>
                      <Heading mt={2} size="xl">{course.title}</Heading>
                      <Text color="gray.600" fontSize="lg" mt={1}>{course.shortDescription}</Text>
                    </Box>
                  </Flex>
                  
                  <Flex align="center" wrap="wrap" gap={4} mt={4}>
                    <HStack>
                      <Icon as={FiBookOpen} color="purple.500" />
                      <Text color="gray.600">Course</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiUsers} color="blue.500" />
                      <Text color="gray.600">{course.enrollmentCount || 0} Students</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiBarChart2} color="orange.500" />
                      <Text color="gray.600">{course.level || 'All Levels'}</Text>
                    </HStack>
                  </Flex>
                </Box>

                {/* Preview Section */}
                <Box>
                  <Heading size="md" mb={3}>
                    {isEnrolled ? 'Course Preview' : 'Course Preview'}
                    {!isEnrolled && (
                      <Badge ml={2} colorScheme="orange" fontSize="xs">
                        Enroll to Access
                      </Badge>
                    )}
                  </Heading>
                  
                  { (isEnrolled && validParts.length > 0) ? (
                    // Show lessons list for enrolled students; navigate to lesson page to open player
                    <Box>
                      <Heading size="sm" mb={2}>Lessons</Heading>
                      <VStack align="stretch">
                        {validParts.map((p, i) => (
                          <Button
                            key={p.id || p.videoUrl || p.youTubeUrl || `${p.title}-${i}`}
                            variant="ghost"
                            justifyContent="flex-start"
                            onClick={() => navigate(`/lesson/${p.id}`)}
                          >
                            {p.order ? `${p.order}. ` : ''}{p.title}
                          </Button>
                        ))}
                      </VStack>
                    </Box>
                  ) : isEnrolled && previewUrl ? (
                    <AspectRatio ratio={16 / 9} borderRadius="lg" overflow="hidden">
                      {/(youtube\.com|youtu\.be)/i.test(previewUrl) ? (
                        <Box
                          as="iframe"
                          title="Course preview"
                          src={(() => {
                            try {
                              const url = new URL(previewUrl);
                              let id = '';
                              if (url.hostname.includes('youtu.be')) id = url.pathname.slice(1);
                              else id = url.searchParams.get('v') || '';
                              return id ? `https://www.youtube.com/embed/${id}` : previewUrl;
                            } catch { return previewUrl; }
                          })()}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <Box as="video" src={previewUrl} controls />
                      )}
                    </AspectRatio>
                  ) : (
                    <Card bg="gray.50" borderRadius="lg">
                      <CardBody py={12} textAlign="center">
                        <VStack spacing={4}>
                          <Icon as={LockIcon} w={12} h={12} color="gray.400" />
                          <Text color="gray.500">Preview available after enrollment</Text>
                          <Button 
                            colorScheme="purple" 
                            size="sm"
                            onClick={handleBuy}
                            isDisabled={course.status !== 'Published'}
                          >
                            Enroll to Access Content
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </Box>

                {/* Course Description */}
                <Box>
                  <Heading size="md" mb={4}>About This Course</Heading>
                  <Box 
                    borderRadius="lg" 
                    p={4} 
                    bg="gray.50"
                    dangerouslySetInnerHTML={{ __html: course.fullDescription || '' }}
                  />
                </Box>

                {/* Course Details */}
                <Box>
                  <Heading size="md" mb={4}>Course Details</Heading>
                  <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">University</Text>
                      <Text fontSize="lg">{course.universityName || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Department</Text>
                      <Text fontSize="lg">{course.departmentName || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Instructor</Text>
                      <Text fontSize="lg">{course.teacherName || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.600">Duration</Text>
                      <Text fontSize="lg">{course.duration || 'Self-paced'}</Text>
                    </Box>
                  </Grid>
                </Box>

                {/* Rating Section */}
                <Box>
                  <Heading size="md" mb={4}>Rate this Course</Heading>
                  <Card variant="outline" borderRadius="lg">
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text mb={2} fontWeight="medium">How would you rate this course?</Text>
                          <HStack spacing={1}>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <IconButton
                                key={i}
                                aria-label={`star-${i}`}
                                icon={<StarIcon />}
                                size="lg"
                                colorScheme={i <= rating ? 'yellow' : 'gray'}
                                variant={i <= rating ? 'solid' : 'ghost'}
                                onClick={() => setRating(i)}
                                _hover={{ transform: 'scale(1.1)' }}
                                transition="all 0.2s"
                              />
                            ))}
                          </HStack>
                          <Text fontSize="sm" color="gray.500" mt={2}>
                            {rating === 0 ? 'Select a rating' : `You selected ${rating} star${rating > 1 ? 's' : ''}`}
                          </Text>
                        </Box>

                        <Box>
                          <Text mb={2} fontWeight="medium">Your Review (Optional)</Text>
                          <Input
                            placeholder="Share your experience with this course..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            size="lg"
                            borderRadius="md"
                          />
                        </Box>

                        <Button
                          colorScheme="purple"
                          size="lg"
                          onClick={submitRating}
                          isLoading={submitting}
                          loadingText="Submitting..."
                          isDisabled={!rating}
                          borderRadius="md"
                        >
                          Submit Rating
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Sidebar */}
        <GridItem>
          <Card position="sticky" top={8} borderRadius="lg" boxShadow="lg">
            <CardBody p={6}>
              <VStack spacing={6} align="stretch">
                {/* Course Image */}
                {course.thumbnailUrl && (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    borderRadius="md"
                    objectFit="cover"
                    h="200px"
                  />
                )}

                {/* Price & Enrollment */}
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500" mb={1}>Course Price</Text>
                  <Heading size="2xl" color={price > 0 ? 'orange.600' : 'green.600'}>
                    {price > 0 ? `৳${price}` : 'Free'}
                  </Heading>
                  {price > 0 && (
                    <Text fontSize="sm" color="gray.500" mt={1}>One-time payment</Text>
                  )}
                </Box>

                <Divider />

                {/* Rating Display */}
                <Box textAlign="center">
                  <HStack justify="center" spacing={1} mb={1}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon
                        key={i}
                        color={i <= Math.floor(avgRating) ? 'yellow.400' : 'gray.300'}
                      />
                    ))}
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {avgRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
                  </Text>
                </Box>

                <Divider />

                {/* Action Buttons */}
                <VStack spacing={3}>
                  {course.status === 'Published' ? (
                    <>
                      <Button
                        size="lg"
                        colorScheme={price > 0 ? 'orange' : 'green'}
                        width="full"
                        onClick={handleBuy}
                        leftIcon={price > 0 ? undefined : <UnlockIcon />}
                        borderRadius="md"
                        py={6}
                        fontSize="lg"
                        boxShadow="md"
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg',
                        }}
                        transition="all 0.2s"
                      >
                        {price > 0 ? `Enroll for ৳${price}` : 'Enroll for Free'}
                      </Button>
                      {price > 0 && (
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          30-day money-back guarantee
                        </Text>
                      )}
                    </>
                  ) : (
                    <Button size="lg" width="full" isDisabled borderRadius="md">
                      {course.status}
                    </Button>
                  )}
                </VStack>

                {/* Course Includes */}
                <Box>
                  <Heading size="sm" mb={3}>This course includes:</Heading>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Icon as={FiClock} color="green.500" />
                      <Text fontSize="sm">Lifetime access</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiBookOpen} color="blue.500" />
                      <Text fontSize="sm">Certificate of completion</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiUsers} color="purple.500" />
                      <Text fontSize="sm">Community access</Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default CourseDetail;