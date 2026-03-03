import React, { useEffect, useState } from 'react';
import {
  Heading,
  SimpleGrid,
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
  Divider,
  Button,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import CourseCard from '../../components/CourseCard';
import SearchFilterBar from '../../components/SearchFilterBar';
import { FiBookOpen, FiSearch } from 'react-icons/fi';
import { FREE_COURSE_BANNER_IMAGES } from '../../config/freeCourseBannerImages';

const FreeCourseAdBanner = ({ images = FREE_COURSE_BANNER_IMAGES }) => {
  const slides = (Array.isArray(images) ? images : []).slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={3}>
        <Heading size="md" color="whiteAlpha.900">ads</Heading>
        <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={3} py={1}>
          5 Ads
        </Badge>
      </Flex>

      <Box
        position="relative"
        h={{ base: '250px', md: '280px', lg: '300px' }}
        w="100%"
        borderRadius="xl"
        overflow="hidden"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg="black"
      >
        {slides.map((src, index) => (
          <Box
            key={`${src}-${index}`}
            as="img"
            src={src}
            alt={`Free course banner ${index + 1}`}
            loading={index === 0 ? 'eager' : 'lazy'}
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            opacity={index === activeIndex ? 1 : 0}
            transition="opacity 700ms ease-in-out"
            pointerEvents="none"
          />
        ))}

        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-t, rgba(7,11,26,0.42), rgba(7,11,26,0.08))"
          pointerEvents="none"
        />
      </Box>
    </Box>
  );
};

export default function DepartmentCourses() {
  const { departmentId } = useParams(); // BUG FIX: universityId was imported but never used
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
    api
      .get(`/courses?departmentId=${departmentId}`)
      .then((res) => {
        let data = [];
        if (res.data?.courses) data = res.data.courses;
        else if (res.data?.data) data = res.data.data;
        else if (Array.isArray(res.data)) data = res.data;
        else if (res.data?.items) data = res.data.items;

        if (mounted) {
          const courseList = Array.isArray(data) ? data : [];
          // Normalize backend fields so CourseCard can read them consistently
          const normalized = courseList.map((c) => {
            const ratingRaw = c.averageRating ?? c.AverageRating ?? c.Average_Rating ?? c.rating ?? null;
            const rating = (ratingRaw != null && !Number.isNaN(Number(ratingRaw))) ? Number(ratingRaw) : null;
            const enrolled = c.enrollmentCount ?? c.EnrollmentCount ?? c.enrolledCount ?? c.enrolled ?? 0;
            return { ...c, rating, enrolledCount: enrolled };
          });
          setCourses(normalized);

          // Derive instructor list from courses
          const uniqueInstructors = [];
          const seen = new Set();
          courseList.forEach((c) => {
            const t =
              c.teacher ||
              (c.teacherId
                ? { id: c.teacherId, name: c.teacherName || c.instructorName || '' }
                : null);
            if (t) {
              const key = t.id || t.name;
              if (!seen.has(key)) {
                seen.add(key);
                uniqueInstructors.push({
                  id: t.id,
                  name: t.name || t.fullName || t.username || '',
                });
              }
            }
          });
          if (uniqueInstructors.length > 0) setInstructors(uniqueInstructors);
        }
      })
      .catch((err) => {
        console.error('Failed to load courses', err);
        if (mounted) setCourses([]); // BUG FIX: only update state if mounted
        toast({
          title: 'Error loading courses',
          description: 'Please try again later',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        if (mounted) setLoading(false); // BUG FIX: was setting state even after unmount
      });

    // Fetch department info
    api
      .get(`/departments/${departmentId}`)
      .then((res) => {
        if (mounted) {
          const data = res.data?.data || res.data || {};
          setDepartmentInfo(data);
        }
      })
      .catch(() => {
        // Optional — silently fail
      });

    return () => {
      mounted = false;
    };
  }, [departmentId, toast]); // BUG FIX: removed universityId from deps (it was unused)

  const clearFilters = () => {
    setQuery('');
    setFilters({ price: 'all', difficulty: 'all' });
  };

  const isFiltered = query || Object.values(filters).some((f) => f !== 'all');

  const filtered = courses.filter((c) => {
    const titleMatch = (c.title || c.name || '').toLowerCase().includes(query.toLowerCase());
    const descMatch = (c.shortDescription || c.description || '')
      .toLowerCase()
      .includes(query.toLowerCase());
    if (query && !titleMatch && !descMatch) return false;
    if (filters.price === 'free' && (c.price ?? 0) > 0) return false;
    if (filters.price === 'paid' && (c.price ?? 0) <= 0) return false;
    if (
      filters.difficulty !== 'all' &&
      (c.difficultyLevel || '').toLowerCase() !== filters.difficulty.toLowerCase()
    )
      return false;
    if (
      filters.instructorId &&
      String(c.teacherId || c.teacher?.id || '') !== String(filters.instructorId)
    )
      return false;
    return true;
  });

  // ── Loading skeleton (dark themed) ──────────────────────────────────────────
  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Skeleton
              height="40px"
              width="200px"
              mb={4}
              startColor="whiteAlpha.100"
              endColor="whiteAlpha.300"
            />
            <Skeleton
              height="20px"
              width="300px"
              startColor="whiteAlpha.100"
              endColor="whiteAlpha.300"
            />
          </Box>
          <Skeleton
            height="50px"
            borderRadius="lg"
            startColor="whiteAlpha.100"
            endColor="whiteAlpha.300"
          />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                borderRadius="xl"
                overflow="hidden"
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.100"
              >
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Skeleton height="28px" startColor="whiteAlpha.100" endColor="whiteAlpha.300" />
                    <Skeleton
                      height="16px"
                      width="80%"
                      startColor="whiteAlpha.100"
                      endColor="whiteAlpha.300"
                    />
                    <Skeleton
                      height="16px"
                      width="60%"
                      startColor="whiteAlpha.100"
                      endColor="whiteAlpha.300"
                    />
                    <Flex justify="space-between" mt={4}>
                      <Skeleton
                        height="24px"
                        width="80px"
                        startColor="whiteAlpha.100"
                        endColor="whiteAlpha.300"
                      />
                      <Skeleton
                        height="24px"
                        width="24px"
                        borderRadius="full"
                        startColor="whiteAlpha.100"
                        endColor="whiteAlpha.300"
                      />
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

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">

        {/* ── Header ── */}
        <Box>
          <Flex align="center" mb={3}>
            <Box as="span" mr={3} fontSize="2xl">📚</Box>
            <Heading
              size="xl"
              bgGradient="linear(to-r, purple.300, pink.400)" // BUG FIX: was 600/600 — too dark on dark bg
              bgClip="text"
            >
              {departmentInfo?.name || 'Department Courses'}
            </Heading>
          </Flex>

          {departmentInfo?.description && (
            <Text color="whiteAlpha.700" fontSize="lg" mb={4}>
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
            <Text ml={4} color="whiteAlpha.500" fontSize="sm">
              {filtered.length === courses.length
                ? 'Showing all available courses'
                : `${filtered.length} of ${courses.length} courses match your criteria`}
            </Text>
          </Flex>
        </Box>

        <Divider borderColor="whiteAlpha.200" />

        {/* ── Search & Filter ── */}
        <Box>
          <Heading
            size="md"
            mb={4}
            color="whiteAlpha.800"
            display="flex"
            alignItems="center"
          >
            <FiSearch style={{ marginRight: '8px' }} />
            Find Your Course
          </Heading>
          <SearchFilterBar
            value={query}
            onChange={setQuery}
            filters={filters}
            onFilterChange={setFilters}
            onClear={clearFilters}
            instructorOptions={instructors}
          />
        </Box>
         {/* ── Footer Stats ── */}
        <Box mt={8} pt={6} borderTop="1px" borderColor="whiteAlpha.100">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Box
              textAlign="center"
              p={4}
              bg="whiteAlpha.50"
              borderRadius="xl"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text fontSize="sm" color="whiteAlpha.500">Total Courses</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.300">
                {courses.length}
              </Text>
            </Box>
            <Box
              textAlign="center"
              p={4}
              bg="whiteAlpha.50"
              borderRadius="xl"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text fontSize="sm" color="whiteAlpha.500">Free Courses</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.300">
                {courses.filter((c) => (c.price ?? 0) === 0).length}
              </Text>
            </Box>
            <Box
              textAlign="center"
              p={4}
              bg="whiteAlpha.50"
              borderRadius="xl"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text fontSize="sm" color="whiteAlpha.500">Instructors</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.300">
                {instructors.length}
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        <FreeCourseAdBanner />

        {/* ── Courses Grid or Empty State ── */}
        {filtered.length === 0 ? (
          // Empty state — dark themed
          <Center
            py={20}
            bg="whiteAlpha.50"
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
          >
            <VStack spacing={6} textAlign="center" maxW="md">
              <Box
                w="100px"
                h="100px"
                bg="whiteAlpha.100"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiBookOpen size={40} color="rgba(255,255,255,0.4)" />
              </Box>
              <Heading size="lg" color="whiteAlpha.800">
                No Courses Found
              </Heading>
              <Text color="whiteAlpha.500">
                {isFiltered
                  ? 'Try adjusting your search or filter criteria'
                  : 'No courses are currently available for this department'}
              </Text>
              {isFiltered && (
                <Button variant="outline" colorScheme="purple" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </VStack>
          </Center>
        ) : (
          <Box>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg" color="whiteAlpha.900">
                Available Courses
              </Heading>
              <Box
                px={3}
                py={1}
                borderRadius="full"
                border="1px solid"
                borderColor="whiteAlpha.200"
                bg="whiteAlpha.50"
              >
                <Text fontSize="xs" color="whiteAlpha.500" fontWeight="medium">
                  Sorted by: Relevance
                </Text>
              </Box>
            </Flex>

            {/* BUG FIX: Removed duplicate _hover transform from wrapper Box —
                CourseCard already handles its own hover animation.
                Double transform was causing a jarring double-jump effect. */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {filtered.map((c) => (
                <CourseCard key={c.id || c.courseId} course={c} />
              ))}
            </SimpleGrid>
          </Box>
        )}
      </VStack>
    </Container>
  );
}