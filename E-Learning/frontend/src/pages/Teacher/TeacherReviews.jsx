import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  useToast,
  Spinner,
  Flex,
  Icon,
  Avatar,
  Divider,
  Grid,
  GridItem,
  Select,
  Input,
  SimpleGrid
} from '@chakra-ui/react';
import { FiArrowLeft, FiStar, FiBarChart2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherReviews = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    totalCourses: 0,
    positiveReviews: 0,
    negativeReviews: 0
  });
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('All');

  useEffect(() => {
    fetchReviews();
  }, [sortBy, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Try to fetch from API, fallback to mock data
      try {
        const response = await axios.get('/api/reviews/teacher/reviews', {
          params: { sortBy },
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataReviews = response.data.reviews ?? response.data.data ?? response.data ?? [];

        // Filter by rating server-side if API doesn't support it
        let filteredReviews = dataReviews;
        if (filterRating !== 'All') {
          const rating = parseInt(filterRating);
          filteredReviews = filteredReviews.filter(r => r.rating === rating);
        }

        // Sort client-side only if API doesn't provide sorting
        if (sortBy === 'rating-high') {
          filteredReviews.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'rating-low') {
          filteredReviews.sort((a, b) => a.rating - b.rating);
        } else {
          filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setReviews(filteredReviews);

        // Compute stats from filteredReviews
        const total = filteredReviews.length;
        const avg = total > 0 ? (filteredReviews.reduce((s, r) => s + (r.rating || r.Rating || 0), 0) / total) : 0;
        const positive = filteredReviews.filter(r => (r.rating || r.Rating || 0) >= 4).length;
        const negative = filteredReviews.filter(r => (r.rating || r.Rating || 0) <= 2).length;
        const coursesReviewed = Array.from(new Set(filteredReviews.map(r => r.courseId || r.CourseId))).length;

        setStats({
          totalReviews: total,
          averageRating: parseFloat(avg.toFixed(2)),
          totalCourses: coursesReviewed,
          positiveReviews: positive,
          negativeReviews: negative
        });
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setReviews([]);
        toast({
          title: 'Error',
          description: 'Unable to load reviews from server',
          status: 'error',
          duration: 4000
        });
      }

      // Calculate stats from the reviews state after updating
      // We'll compute from the currently-known reviews
      // (setReviews is async but we can compute from the filteredReviews used above)
      // Recompute from state in next render if necessary
      

    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <HStack spacing={1}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            as={FiStar}
            color={i < rating ? 'yellow.400' : 'gray.300'}
            fill={i < rating ? 'currentColor' : 'none'}
            fontSize="16px"
          />
        ))}
      </HStack>
    );
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <HStack spacing={4} pb={4} borderBottom="1px solid #e2e8f0">
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            onClick={() => navigate('/teacher')}
          >
            Back
          </Button>
          <Heading size="lg">Course Reviews</Heading>
        </HStack>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Total Reviews</Text>
                <Heading size="lg">{stats.totalReviews}</Heading>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Average Rating</Text>
                <HStack spacing={2}>
                  <Heading size="lg">{stats.averageRating}</Heading>
                  <Icon as={FiStar} color="yellow.500" fontSize="20px" />
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Positive Reviews</Text>
                <Heading size="lg" color="green.500">{stats.positiveReviews}</Heading>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Needs Improvement</Text>
                <Heading size="lg" color="orange.500">{stats.negativeReviews}</Heading>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Courses Reviewed</Text>
                <Heading size="lg">{stats.totalCourses}</Heading>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <HStack spacing={4}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            maxW="200px"
          >
            <option value="newest">Newest First</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </Select>

          <Select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            maxW="150px"
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </Select>
        </HStack>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <Card>
            <CardBody>
              <VStack py={12} spacing={4}>
                <Icon as={FiBarChart2} fontSize="48px" color="gray.300" />
                <Heading size="md" color="gray.500">No Reviews Yet</Heading>
                <Text color="gray.500">Reviews will appear here once students rate your courses</Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4}>
            {reviews.map(review => (
              <Card key={review.id || review.Id || `${review.courseId}-${review.studentId}` } w="100%">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between" align="start">
                      <HStack spacing={3} align="start">
                        {(() => {
                          const reviewerName = review.studentName || review.student?.name || review.userName || review.user?.fullName || review.name || review.reviewerName || review.StudentName || '';
                          const avatarSrc = review.studentAvatar || review.studentAvatarUrl || review.student?.avatarUrl || review.student?.profileImageUrl || review.avatarUrl || review.profileImageUrl || review.user?.profileImageUrl || review.user?.avatar || review.profilePhoto || review.Student?.ProfileImageUrl || null;
                          return (
                            <>
                              <Avatar
                                name={reviewerName}
                                src={avatarSrc}
                                size="md"
                              />
                              <VStack align="start" spacing={1}>
                                <Heading size="sm">{reviewerName || 'Anonymous'}</Heading>
                                <Text fontSize="sm" color="gray.600">{review.courseTitle || review.courseName || review.CourseTitle}</Text>
                              </VStack>
                            </>
                          );
                        })()}
                      </HStack>
                      <HStack>
                        {renderStars(review.rating)}
                      </HStack>
                    </HStack>

                    <Divider />

                    <VStack align="start" spacing={2}>
                      <Text>{review.comment}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default TeacherReviews;
