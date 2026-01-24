import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Image, 
  Heading, 
  Text, 
  SimpleGrid, 
  Spinner, 
  VStack, 
  Button, 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink,
  Container,
  Flex,
  Center,
  Skeleton,
  useToast,
  Badge,
  HStack,
  AspectRatio,
  Card,
  CardBody,
  Stack
} from '@chakra-ui/react';
import { 
  useDisclosure, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton, 
  FormControl, 
  FormLabel, 
  Input, 
  Textarea 
} from '@chakra-ui/react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { ChevronRightIcon, StarIcon } from '@chakra-ui/icons';
import api from '../../services/api';
import DepartmentCard from '../../components/DepartmentCard';
import { useAuth } from '../../hooks/useAuth';

export default function UniversityDetails() {
  const { universityId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [uni, setUni] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reqName, setReqName] = useState('');
  const [reqCode, setReqCode] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [uRes, dRes] = await Promise.all([
          api.get(`/universities/${universityId}`),
          api.get(`/universities/${universityId}/departments`)
        ]);
        if (!mounted) return;
        setUni(uRes.data?.data || uRes.data || null);
        const d = dRes.data?.data || dRes.data?.departments || dRes.data || [];
        const raw = Array.isArray(d) ? d : d.items || [];
        // Use backend-provided departments as authoritative (no client-side filtering)
        const mapped = Array.isArray(raw) ? raw : [];
        setDepartments(mapped);
      } catch (err) {
        setUni(null);
        setDepartments([]);
        toast({
          title: 'Failed to load university details',
          description: 'Please try again later',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally { 
        if (mounted) setLoading(false); 
      }
    }
    load();
    return () => mounted = false;
  }, [universityId, toast]);

  // Real-time updates removed: Departments are now updated via requests/approvals.

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          {/* Breadcrumb Skeleton */}
          <Skeleton height="24px" width="200px" />
          
          {/* University Header Skeleton */}
          <Box>
            <Skeleton height="48px" width="300px" mb={4} />
            <Flex gap={4}>
              <Skeleton height="20px" width="150px" />
              <Skeleton height="20px" width="120px" />
            </Flex>
          </Box>

          {/* Departments Grid Skeleton */}
          <Box>
            <Skeleton height="32px" width="200px" mb={6} />
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {[...Array(6)].map((_, i) => (
                <Card key={i} borderRadius="xl" overflow="hidden" boxShadow="sm">
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Skeleton height="28px" />
                      <Skeleton height="16px" width="80%" />
                      <Skeleton height="16px" width="60%" />
                      <Flex justify="space-between" mt={2}>
                        <Skeleton height="24px" width="80px" />
                        <Skeleton height="24px" width="24px" borderRadius="full" />
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    );
  }

  if (!uni) {
    return (
      <Container maxW="container.xl" py={20}>
        <Center>
          <VStack spacing={6} textAlign="center" maxW="md">
            <Box
              w="120px"
              h="120px"
              bg="red.50"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="4xl">🏛️</Text>
            </Box>
            <Heading size="lg" color="gray.700">
              University Not Found
            </Heading>
            <Text color="gray.500">
              The university you're looking for doesn't exist or has been removed.
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => navigate('/universities')}
              leftIcon={<ChevronRightIcon transform="rotate(180deg)" />}
              mt={4}
            >
              Back to Universities
            </Button>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          spacing={2} 
          separator={<ChevronRightIcon color="gray.400" />}
          fontSize="sm"
        >
          <BreadcrumbItem>
            <BreadcrumbLink 
              as={RouterLink} 
              to="/universities"
              color="blue.600"
              _hover={{ color: 'blue.700', textDecoration: 'underline' }}
            >
              Universities
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink 
              href="#"
              color="gray.600"
              _hover={{ textDecoration: 'none', cursor: 'default' }}
            >
              {uni?.name || 'University Details'}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* University Header */}
        <Box
          bgGradient="linear(to-r, blue.50, purple.50)"
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          position="relative"
          overflow="hidden"
        >
          <Flex direction={{ base: 'column', md: 'row' }} gap={8} align="center">
            {/* University Logo/Banner */}
            <Box flexShrink={0}>
              <AspectRatio ratio={1} w={{ base: '120px', md: '160px' }}>
                <Image
                  src={uni?.logoUrl || uni?.bannerUrl || '/images/university-placeholder.jpg'}
                  alt={uni.name}
                  borderRadius="xl"
                  objectFit="cover"
                  fallbackSrc="https://via.placeholder.com/160?text=University"
                />
              </AspectRatio>
            </Box>

            {/* University Info */}
            <Box flex="1">
              <Heading 
                size="xl" 
                mb={3}
                bgGradient="linear(to-r, blue.700, purple.700)"
                bgClip="text"
              >
                {uni.name}
              </Heading>
              
              <Stack spacing={3} mb={6}>
                <Flex align="center" color="gray.600">
                  <Box as="span" mr={2} fontSize="lg" color="blue.500">📍</Box>
                  <Text fontSize="lg" fontWeight="medium">
                    {uni.location || uni.city || 'Location not specified'}
                  </Text>
                </Flex>
                
                <Flex align="center" color="gray.600">
                  <Box as="span" mr={2} fontSize="lg" color="blue.500">📅</Box>
                  <Text fontSize="md">
                    Est. {uni.establishedYear || 'Year not specified'}
                  </Text>
                </Flex>

                {uni.rating && (
                  <Flex align="center">
                    <StarIcon color="yellow.400" mr={2} />
                    <Text fontWeight="bold" mr={2}>{uni.rating.toFixed(1)}</Text>
                    <Badge colorScheme="yellow" variant="subtle">
                      Rating
                    </Badge>
                  </Flex>
                )}
              </Stack>

              {uni.description && (
                <Text color="gray.600" lineHeight="tall" noOfLines={3}>
                  {uni.description}
                </Text>
              )}
            </Box>
          </Flex>
        </Box>

        {/* Departments Section */}
        <Box>
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading size="lg" mb={2} color="gray.800">
                Academic Departments
              </Heading>
              <Text color="gray.600">
                Explore {departments.length} department{departments.length !== 1 ? 's' : ''} offered by this institution
              </Text>
            </Box>
            <HStack spacing={4}>
              {user && (
                  <Button 
                    colorScheme="green" 
                    onClick={onOpen} 
                    size="md"
                    leftIcon={<Box as="span">➕</Box>}
                    borderRadius="lg"
                    boxShadow="md"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >
                    Request Department
                  </Button>
                )}
              <Badge 
                colorScheme="blue" 
                variant="subtle" 
                fontSize="lg" 
                px={4} 
                py={2} 
                borderRadius="full"
              >
                {departments.length} Total
              </Badge>
            </HStack>
          </Flex>

          {departments.length > 0 ? (
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
                    universityId={universityId} 
                  />
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Center py={12} bg="gray.50" borderRadius="xl">
              <VStack spacing={4} textAlign="center">
                <Box
                  w="80px"
                  h="80px"
                  bg="gray.200"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="3xl">📚</Text>
                </Box>
                <Heading size="md" color="gray.600">
                  No Departments Available
                </Heading>
                <Text color="gray.500" maxW="md">
                  This university hasn't listed any departments yet. Check back soon for updates.
                </Text>
                {user && (
                  <Button 
                    colorScheme="green" 
                    onClick={onOpen}
                    mt={2}
                    leftIcon={<Box as="span">➕</Box>}
                  >
                    Request First Department
                  </Button>
                )}
              </VStack>
            </Center>
          )}
        </Box>

        {/* Additional Info Section */}
        {(uni.website || uni.phone || uni.email) && (
          <Box
            mt={8}
            pt={8}
            borderTop="1px"
            borderColor="gray.200"
          >
            <Heading size="md" mb={4} color="gray.700">
              Contact Information
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {uni.website && (
                <Box p={4} bg="blue.50" borderRadius="lg" borderLeft="4px solid" borderColor="blue.400">
                  <Text fontWeight="medium" color="blue.700" mb={1}>Website</Text>
                  <Text color="blue.600" isTruncated>
                    <a href={uni.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                      {uni.website}
                    </a>
                  </Text>
                </Box>
              )}
              {uni.phone && (
                <Box p={4} bg="green.50" borderRadius="lg" borderLeft="4px solid" borderColor="green.400">
                  <Text fontWeight="medium" color="green.700" mb={1}>Phone</Text>
                  <Text color="green.600">{uni.phone}</Text>
                </Box>
              )}
              {uni.email && (
                <Box p={4} bg="purple.50" borderRadius="lg" borderLeft="4px solid" borderColor="purple.400">
                  <Text fontWeight="medium" color="purple.700" mb={1}>Email</Text>
                  <Text color="purple.600">{uni.email}</Text>
                </Box>
              )}
            </SimpleGrid>
          </Box>
        )}

        {/* Add Department Modal (Admin Only) */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="xl">
            <ModalHeader 
              bgGradient="linear(to-r, green.600, teal.600)" 
              color="white"
              fontSize="xl"
              fontWeight="bold"
            >
              <Flex align="center">
                <Box as="span" mr={3}>➕</Box>
                Add Department Request
              </Flex>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody py={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color="gray.700">
                    Department Name
                  </FormLabel>
                  <Input 
                    value={reqName} 
                    onChange={(e) => setReqName(e.target.value)} 
                    placeholder="e.g. Computer Science" 
                    size="lg"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="medium" color="gray.700">
                    Short Code
                  </FormLabel>
                  <Input 
                    value={reqCode} 
                    onChange={(e) => setReqCode(e.target.value)} 
                    placeholder="e.g. CSE" 
                    size="lg"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="medium" color="gray.700">
                    Note / Description
                  </FormLabel>
                  <Textarea 
                    value={reqNote} 
                    onChange={(e) => setReqNote(e.target.value)} 
                    placeholder="Optional note for admins" 
                    size="lg"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
                    rows={4}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter pt={4} borderTop="1px solid" borderColor="gray.200">
              <Button 
                variant="outline" 
                mr={3} 
                onClick={onClose}
                borderRadius="lg"
                size="lg"
              >
                Cancel
              </Button>
              <Button 
                colorScheme="green" 
                isLoading={submitting} 
                onClick={async () => {
                  if (!reqName.trim()) {
                    toast({ 
                      title: 'Department name required', 
                      description: 'Please provide a department name',
                      status: 'warning', 
                      duration: 3000, 
                      isClosable: true,
                      position: 'top-right'
                    });
                    return;
                  }
                  setSubmitting(true);
                  try {
                        await api.post('/departmentrequests', {
                          universityId: Number(universityId),
                          departmentName: reqName.trim(),
                          shortCode: reqCode.trim(),
                          note: reqNote.trim()
                        });
                    toast({ 
                      title: 'Request Submitted Successfully', 
                      description: 'Your department request has been sent for admin review.',
                      status: 'success', 
                      duration: 4000, 
                      isClosable: true,
                      position: 'top-right'
                    });
                    setReqName(''); 
                    setReqCode(''); 
                    setReqNote('');
                    onClose();
                  } catch (err) {
                    const serverMsg = err?.response?.data?.details || err?.response?.data?.message;
                    toast({ 
                      title: 'Submission Failed', 
                      description: serverMsg || 'Please try again later',
                      status: 'error', 
                      duration: 4000, 
                      isClosable: true,
                      position: 'top-right'
                    });
                  } finally {
                    setSubmitting(false);
                  }
                }}
                borderRadius="lg"
                size="lg"
                px={8}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                Send Request
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
}