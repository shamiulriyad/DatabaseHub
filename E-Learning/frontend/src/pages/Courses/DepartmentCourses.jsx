import React, { useEffect, useState } from 'react';
import { 
  Heading, 
  SimpleGrid, 
  Spinner, 
  VStack, 
  Text,
  Container,
  Box,
  Flex,
  Badge,
  Card,
  CardBody,
  Center,
  Skeleton,
  useToast,
  HStack,
  Divider,
  Button
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import CourseCard from '../../components/CourseCard';
import SearchFilterBar from '../../components/SearchFilterBar';
import { FiBookOpen, FiFilter, FiSearch } from 'react-icons/fi';

export default function DepartmentCourses() {
  const { universityId, departmentId } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ price: 'all', difficulty: 'all' });
  const [instructors, setInstructors] = useState([]);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    // Fetch courses
    api.get(`/courses?departmentId=${departmentId}`)
      .then(res => {
        let data = [];
        if (res.data?.courses) data = res.data.courses;
        else if (res.data?.data) data = res.data.data;
        else if (Array.isArray(res.data)) data = res.data;
        else if (res.data?.items) data = res.data.items;
        else data = [];

        if (mounted) setCourses(Array.isArray(data) ? data : []);
      })
      .catch((err) => { 
        console.error('Failed to load courses', err); 
        setCourses([]);
        toast({
          title: 'Error loading courses',
          description: 'Please try again later',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => setLoading(false));

    // Fetch department info
    api.get(`/departments/${departmentId}`)
      .then(res => {
        if (mounted) {
          const data = res.data?.data || res.data || {};
          setDepartmentInfo(data);
        }
      })
      .catch(() => {
        // Silently fail, department info is optional
      });

    return () => mounted = false;
  }, [departmentId, toast]);

  useEffect(() => {
    let mounted = true;
    api.get(`/teachers?departmentId=${departmentId}`)
      .then(res => {
        const d = res.data?.data || res.data || [];
        if (mounted) setInstructors(Array.isArray(d) ? d : d.items || []);
      })
      .catch(() => setInstructors([]));
    return () => mounted = false;
  }, [departmentId]);

  const filtered = courses.filter(c => {
    if (query && !((c.title || c.name || '').toLowerCase().includes(query.toLowerCase()) || 
        (c.shortDescription || c.description || '').toLowerCase().includes(query.toLowerCase()))) {
      return false;
    }
    if (filters.price === 'free' && (c.price ?? 0) > 0) return false;
    if (filters.price === 'paid' && (c.price ?? 0) <= 0) return false;
    if (filters.difficulty !== 'all' && (c.difficultyLevel || '').toLowerCase() !== filters.difficulty.toLowerCase()) return false;
    if (filters.instructorId && String(c.teacherId || c.teacher?.id || '') !== String(filters.instructorId)) return false;
    return true;
  });

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Skeleton height="40px" width="200px" mb={4} />
            <Skeleton height="20px" width="300px" />
          </Box>
          <Box>
            <Skeleton height="50px" mb={6} borderRadius="lg" />
          </Box>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(6)].map((_, i) => (
              <Card key={i} borderRadius="xl" overflow="hidden" boxShadow="sm">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Skeleton height="28px" />
                    <Skeleton height="16px" width="80%" />
                    <Skeleton height="16px" width="60%" />
                    <Flex justify="space-between" mt={4}>
                      <Skeleton height="24px" width="80px" />
                      <Skeleton height="24px" width="24px" borderRadius="full" />
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <Box>
          <Flex align="center" mb={3}>
            <Box as="span" mr={3} fontSize="2xl">📚</Box>
            <Heading 
              size="xl" 
              bgGradient="linear(to-r, purple.600, pink.600)"
              bgClip="text"
            >
              {departmentInfo?.name || 'Department Courses'}
            </Heading>
          </Flex>
          
          {departmentInfo?.description && (
            <Text color="gray.600" fontSize="lg" mb={4}>
              {departmentInfo.description}
            </Text>
          )}
          
          <Flex align="center" mt={4}>
            <Badge 
              colorScheme="purple" 
              variant="subtle" 
              fontSize="md" 
              px={3} 
              py={1} 
              borderRadius="full"
            >
              <Flex align="center">
                <Box as="span" mr={2}>📊</Box>
                <Text fontWeight="medium">
                  {filtered.length} Course{filtered.length !== 1 ? 's' : ''}
                </Text>
              </Flex>
            </Badge>
            <Text ml={4} color="gray.600" fontSize="sm">
              {filtered.length === courses.length 
                ? 'Showing all available courses' 
                : `${filtered.length} of ${courses.length} courses match your criteria`
              }
            </Text>
          </Flex>
        </Box>

        <Divider />

        {/* Search and Filter Section */}
        <Box>
          <Heading size="md" mb={4} color="gray.700" display="flex" alignItems="center">
            <FiSearch style={{ marginRight: '8px' }} />
            Find Your Course
          </Heading>
          <SearchFilterBar 
            value={query} 
            onChange={setQuery} 
            filters={filters} 
            onFilterChange={setFilters} 
            onClear={() => { setQuery(''); setFilters({ price: 'all', difficulty: 'all' }); }} 
            instructorOptions={instructors} 
          />
        </Box>

        {/* Courses Grid */}
        {filtered.length === 0 ? (
          <Center py={20} bg="gray.50" borderRadius="xl">
            <VStack spacing={6} textAlign="center" maxW="md">
              <Box
                w="100px"
                h="100px"
                bg="gray.200"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiBookOpen size={40} color="#718096" />
              </Box>
              <Heading size="lg" color="gray.700">
                No Courses Found
              </Heading>
              <Text color="gray.500">
                {query || Object.values(filters).some(f => f !== 'all') 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No courses are currently available for this department'
                }
              </Text>
              {(query || Object.values(filters).some(f => f !== 'all')) && (
                <Button
                  variant="outline"
                  colorScheme="purple"
                  onClick={() => {
                    setQuery('');
                    setFilters({ price: 'all', difficulty: 'all' });
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </VStack>
          </Center>
        ) : (
          <Box>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg" color="gray.800">
                Available Courses
              </Heading>
              <Badge colorScheme="gray" variant="subtle" px={3} py={1} borderRadius="full">
                Sorted by: Relevance
              </Badge>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {filtered.map(c => (
                <Box
                  key={c.id || c.courseId}
                  transition="all 0.3s ease"
                  _hover={{
                    transform: 'translateY(-4px)',
                  }}
                >
                  <CourseCard key={c.id || c.courseId} course={c} />
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Footer Stats */}
        <Box
          mt={8}
          pt={6}
          borderTop="1px"
          borderColor="gray.100"
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Box textAlign="center">
              <Text fontSize="sm" color="gray.500">Total Courses</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {courses.length}
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="sm" color="gray.500">Free Courses</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {courses.filter(c => (c.price ?? 0) === 0).length}
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="sm" color="gray.500">Instructors</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {instructors.length}
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
}