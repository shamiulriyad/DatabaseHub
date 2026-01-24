import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  SimpleGrid, 
  Spinner, 
  VStack, 
  Container,
  Center,
  Skeleton,
  useToast,
  Flex,
  Badge
} from '@chakra-ui/react';
import api from '../../services/api';
import DepartmentCard from '../../components/DepartmentCard';
import { useParams } from 'react-router-dom';

export default function DepartmentPage() {
  const { universityId } = useParams();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [universityName, setUniversityName] = useState('');
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    
    async function loadUniversityName() {
      if (universityId) {
        try {
          const res = await api.get(`/universities/${universityId}`);
          if (mounted && res.data?.name) {
            setUniversityName(res.data.name);
          }
        } catch (err) {
          console.error('Failed to load university name', err);
        }
      }
    }

    async function loadDepartments() {
      try {
        const url = universityId ? `/universities/${universityId}/departments` : '/departments?page=1&pageSize=500';
        const res = await api.get(url);
        const payload = res.data?.data ?? res.data?.departments ?? res.data ?? [];
        let list = [];
        if (Array.isArray(payload)) list = payload;
        else if (payload?.items && Array.isArray(payload.items)) list = payload.items;
        else list = [];
        if (!mounted) return;
        setDepartments(list);
      } catch (err) {
        console.error('Failed to load departments', err);
        if (!mounted) return;
        setDepartments([]);
        toast({
          title: 'Error loading departments',
          description: 'Please try again later',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally { 
        if (mounted) setLoading(false); 
      }
    }

    loadUniversityName();
    loadDepartments();
    return () => { mounted = false; };
  }, [universityId, toast]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Skeleton height="40px" width="300px" mb={4} />
            <Skeleton height="20px" width="200px" />
          </Box>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(6)].map((_, i) => (
              <Box
                key={i}
                borderWidth="1px"
                borderRadius="xl"
                overflow="hidden"
                p={6}
              >
                <VStack align="stretch" spacing={4}>
                  <Skeleton height="28px" />
                  <Skeleton height="16px" width="80%" />
                  <Skeleton height="16px" width="60%" />
                  <Flex justify="space-between" mt={4}>
                    <Skeleton height="32px" width="100px" />
                    <Skeleton height="32px" width="32px" borderRadius="full" />
                  </Flex>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <Container maxW="container.xl" py={20}>
        <Center>
          <VStack spacing={6} textAlign="center" maxW="md">
            <Box
              w="120px"
              h="120px"
              bg="blue.50"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={4}
            >
              <Text fontSize="4xl">📚</Text>
            </Box>
            <Heading size="lg" color="gray.700">
              No Departments Found
            </Heading>
            <Text color="gray.500">
              {universityId 
                ? "This university doesn't have any departments listed yet."
                : "No departments are currently available."
              }
            </Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <Box>
          <Flex align="center" mb={3}>
            <Box as="span" mr={3} fontSize="2xl">
              {universityId ? "🏛️" : "📚"}
            </Box>
            <Heading 
              size="xl"
              bgGradient={universityId ? "linear(to-r, blue.600, cyan.600)" : "linear(to-r, purple.600, pink.600)"}
              bgClip="text"
            >
              {universityId 
                ? universityName 
                  ? `Departments at ${universityName}`
                  : 'University Departments'
                : 'All Departments'
              }
            </Heading>
          </Flex>
          
          <Flex align="center" mt={4}>
            <Badge 
              colorScheme={universityId ? "blue" : "purple"} 
              variant="subtle" 
              fontSize="md" 
              px={3} 
              py={1} 
              borderRadius="full"
            >
              <Flex align="center">
                <Box as="span" mr={2}>📊</Box>
                <Text fontWeight="medium">
                  {departments.length} {departments.length === 1 ? 'Department' : 'Departments'}
                </Text>
              </Flex>
            </Badge>
            {universityId && (
              <Text ml={4} color="gray.600" fontSize="sm">
                Explore all academic departments offered by this institution
              </Text>
            )}
          </Flex>
        </Box>

        {/* Departments Grid */}
        <Box>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {departments.map(d => (
              <Box
                key={d.id}
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-4px)',
                }}
              >
                <DepartmentCard 
                  key={d.id} 
                  department={d} 
                  universityId={universityId ?? (d.universityId ?? d.UniversityId)} 
                />
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Footer Stats */}
        <Box
          mt={8}
          pt={6}
          borderTop="1px"
          borderColor="gray.100"
        >
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Showing {departments.length} department{departments.length !== 1 ? 's' : ''}
            {universityId && universityName && ` at ${universityName}`}
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}