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
  SimpleGrid,
  Image,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Select
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiStar, FiUsers, FiArrowLeft, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManageCourses = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [filterStatus]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const status = filterStatus === 'All' ? undefined : filterStatus;

      const response = await axios.get('/api/courses/created-courses', {
        params: { status },
        headers: { Authorization: `Bearer ${token}` }
      });

      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your courses',
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/courses/${selectedCourse.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'Course deleted successfully',
        status: 'success',
        duration: 3000
      });

      setCourses(courses.filter(c => c.id !== selectedCourse.id));
      onClose();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete course',
        status: 'error',
        duration: 3000
      });
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CourseCard = ({ course }) => (
    <Card
      borderRadius="lg"
      overflow="hidden"
      _hover={{ shadow: 'lg' }}
      transition="all 0.3s"
    >
      {(() => {
        const imgSrc = course.courseImageUrl || course.thumbnailUrl || course.bannerUrl || course.imageUrl || course.courseImage || course.thumbnail || course.coverImageUrl || course.coverImage || course.CourseImageUrl || course.ThumbnailUrl || null;
        return imgSrc ? (
          <Image
            src={imgSrc}
            alt={course.title}
            h="200px"
            w="100%"
            objectFit="cover"
          />
        ) : null;
      })()}
      <CardBody>
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" w="100%">
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="sm" noOfLines={2}>{course.title}</Heading>
              <Text fontSize="sm" color="gray.600" noOfLines={1}>
                {course.categoryName || 'Category'}
              </Text>
            </VStack>
            <Badge
              colorScheme={
                course.status === 'Approved' ? 'green' :
                course.status === 'Pending' ? 'yellow' :
                'red'
              }
              px={3}
              py={1}
            >
              {course.status}
            </Badge>
          </HStack>

          <Divider />

          <HStack spacing={4} w="100%" fontSize="sm" color="gray.600">
            <HStack spacing={1}>
              <Icon as={FiUsers} />
              <Text>{(
                course.enrollmentCount ??
                course.totalEnrolled ??
                course.EnrollmentCount ??
                course.totalStudents ??
                course.total_enrolled ??
                course.studentsCount ??
                course.enrolledCount ??
                course.enrolled ??
                0
              )} students</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiStar} color="yellow.500" />
              <Text>{course.averageRating || 0}</Text>
            </HStack>
          </HStack>

          <HStack spacing={2} w="100%" pt={2}>
            <Button
              size="sm"
              colorScheme="blue"
              flex={1}
              variant="outline"
              onClick={() => navigate(`/courses/${course.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              colorScheme="green"
              flex={1}
              variant="outline"
              onClick={() => navigate(`/teacher/course/${course.id}/submissions`)}
            >
              View
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => {
                setSelectedCourse(course);
                onOpen();
              }}
            >
              <FiTrash2 />
            </Button>
          </HStack>

          {course.status === 'Pending' && (
            <Text fontSize="xs" color="yellow.600" bg="yellow.50" p={2} borderRadius="md" w="100%">
              ⏳ Waiting for admin approval
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

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
        <HStack spacing={4} justify="space-between" pb={4} borderBottom="1px solid #e2e8f0">
          <HStack spacing={4}>
            <Button
              variant="ghost"
              leftIcon={<FiArrowLeft />}
              onClick={() => navigate('/teacher')}
            >
              Back
            </Button>
            <Heading size="lg">Manage Courses</Heading>
          </HStack>
          <Button
            colorScheme="blue"
            size="lg"
            leftIcon={<FiPlus />}
            onClick={() => navigate('/teacher/create-course')}
          >
            Create Course
          </Button>
        </HStack>

        {/* Filters */}
        <HStack spacing={4}>
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            maxW="200px"
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </HStack>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card>
            <CardBody>
              <VStack py={12} spacing={4}>
                <Heading size="md" color="gray.500">No Courses Found</Heading>
                <Text color="gray.500">
                  {searchTerm ? 'Try a different search' : 'Create your first course to get started'}
                </Text>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiPlus />}
                  onClick={() => navigate('/teacher/create-course')}
                >
                  Create Course
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </SimpleGrid>
        )}

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Course</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete <strong>{selectedCourse?.title}</strong>? This action cannot be undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDeleteCourse}
                >
                  Delete
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default ManageCourses;
