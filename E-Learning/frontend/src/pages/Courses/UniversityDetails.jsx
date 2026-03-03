import React, { useEffect, useState } from 'react';
import {
  Box,
  Image,
  Heading,
  Text,
  SimpleGrid,
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
  Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea
} from '@chakra-ui/react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { ChevronRightIcon, StarIcon } from '@chakra-ui/icons';
import api from '../../services/api';
import DepartmentCard from '../../components/DepartmentCard';
import { useAuth } from '../../hooks/useAuth';

export default function UniversityDetails() {
  const { universityId }            = useParams();
  const navigate                    = useNavigate();
  const toast                       = useToast();
  const [uni, setUni]               = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]       = useState(true);
  const { user }                    = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reqName, setReqName]       = useState('');
  const [reqCode, setReqCode]       = useState('');
  const [reqNote, setReqNote]       = useState('');
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
        const d   = dRes.data?.data || dRes.data?.departments || dRes.data || [];
        const raw = Array.isArray(d) ? d : d.items || [];
        setDepartments(Array.isArray(raw) ? raw : []);
      } catch {
        setUni(null);
        setDepartments([]);
        toast({ title: 'Failed to load university details', description: 'Please try again later', status: 'error', duration: 3000, isClosable: true });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [universityId, toast]);

  // shared input style
  const inputProps = {
    bg: 'gray.700',
    color: 'white',
    borderColor: 'gray.600',
    borderRadius: 'xl',
    _placeholder: { color: 'gray.500' },
    _hover: { borderColor: 'purple.500' },
    focusBorderColor: 'purple.400',
    _focus: { boxShadow: '0 0 0 1px #9F7AEA' },
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box minH="100vh" bg="gray.900">
        <Container maxW="container.xl" py={10}>
          <VStack spacing={8} align="stretch">
            <Skeleton height="22px" width="220px" startColor="gray.700" endColor="gray.600" borderRadius="md" />
            <Box>
              <Skeleton height="44px" width="320px" mb={4} startColor="gray.700" endColor="gray.600" borderRadius="md" />
              <Flex gap={4}>
                <Skeleton height="18px" width="160px" startColor="gray.700" endColor="gray.600" borderRadius="md" />
                <Skeleton height="18px" width="120px" startColor="gray.700" endColor="gray.600" borderRadius="md" />
              </Flex>
            </Box>
            <Box>
              <Skeleton height="30px" width="200px" mb={6} startColor="gray.700" endColor="gray.600" borderRadius="md" />
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {[...Array(6)].map((_, i) => (
                  <Box key={i} bg="gray.800" borderRadius="xl" border="1px solid" borderColor="gray.700" p={5}>
                    <VStack align="stretch" spacing={3}>
                      <Skeleton height="24px" startColor="gray.700" endColor="gray.600" borderRadius="md" />
                      <Skeleton height="14px" width="75%" startColor="gray.700" endColor="gray.600" borderRadius="md" />
                      <Skeleton height="14px" width="55%" startColor="gray.700" endColor="gray.600" borderRadius="md" />
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!uni) {
    return (
      <Box minH="100vh" bg="gray.900">
        <Container maxW="container.xl" py={20}>
          <Center>
            <VStack spacing={6} textAlign="center" maxW="md">
              <Box w="120px" h="120px" bg="gray.800" border="1px solid" borderColor="gray.700"
                borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="4xl">🏛️</Text>
              </Box>
              <Heading size="lg" color="white">University Not Found</Heading>
              <Text color="gray.400">The university you're looking for doesn't exist or has been removed.</Text>
              <Button
                mt={4}
                bgGradient="linear(to-r, purple.500, pink.500)"
                color="white" fontWeight="700" borderRadius="xl"
                _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)', transform: 'scale(1.02)' }}
                leftIcon={<ChevronRightIcon transform="rotate(180deg)" />}
                onClick={() => navigate('/universities')}
              >
                Back to Universities
              </Button>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <Box minH="100vh" bg="gray.900">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">

          {/* Breadcrumb */}
          <Breadcrumb spacing={2} separator={<ChevronRightIcon color="gray.600" />} fontSize="sm">
            <BreadcrumbItem>
              <BreadcrumbLink
                as={RouterLink} to="/universities"
                color="purple.400"
                _hover={{ color: 'purple.300', textDecoration: 'underline' }}
              >
                Universities
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#" color="gray.400" _hover={{ textDecoration: 'none', cursor: 'default' }}>
                {uni?.name || 'University Details'}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* University Header */}
          <Box
            bg="gray.800"
            border="1px solid" borderColor="gray.700"
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            position="relative"
            overflow="hidden"
            boxShadow="0 4px 24px rgba(0,0,0,0.4)"
          >
            {/* subtle glow */}
            <Box
              position="absolute" top="-60px" right="-60px"
              w="300px" h="300px" borderRadius="full"
              bg="radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)"
              pointerEvents="none"
            />

            <Flex direction={{ base: 'column', md: 'row' }} gap={8} align={{ md: 'center' }}>
              {/* Logo */}
              <Box flexShrink={0}>
                <AspectRatio ratio={1} w={{ base: '110px', md: '150px' }}>
                  <Image
                    src={uni?.logoUrl || uni?.bannerUrl || '/images/university-placeholder.jpg'}
                    alt={uni.name}
                    borderRadius="xl"
                    objectFit="cover"
                    border="2px solid" borderColor="gray.600"
                    fallbackSrc="https://via.placeholder.com/160?text=University"
                  />
                </AspectRatio>
              </Box>

              {/* Info */}
              <Box flex="1">
                <Heading
                  size="xl" mb={4}
                  color="white"
                  letterSpacing="-0.02em"
                >
                  <Box
                    as="span"
                    sx={{
                      background: 'linear-gradient(to right, #a78bfa, #818cf8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {uni.name}
                  </Box>
                </Heading>

                <Stack spacing={2} mb={5}>
                  <Flex align="center" color="gray.400">
                    <Box as="span" mr={2}>📍</Box>
                    <Text fontSize="md" fontWeight="500" color="gray.300">
                      {uni.location || uni.city || 'Location not specified'}
                    </Text>
                  </Flex>
                  <Flex align="center" color="gray.400">
                    <Box as="span" mr={2}>📅</Box>
                    <Text fontSize="sm" color="gray.400">
                      Est. {uni.establishedYear || 'Year not specified'}
                    </Text>
                  </Flex>
                  {uni.rating && (
                    <Flex align="center" gap={2}>
                      <StarIcon color="yellow.400" boxSize={3.5} />
                      <Text fontWeight="700" color="white">{uni.rating.toFixed(1)}</Text>
                      <Badge
                        bg="rgba(251,191,36,0.12)" color="yellow.300"
                        border="1px solid" borderColor="rgba(251,191,36,0.3)"
                        fontSize="xs" borderRadius="full" px={2}
                      >
                        Rating
                      </Badge>
                    </Flex>
                  )}
                </Stack>

                {uni.description && (
                  <Text color="gray.400" lineHeight="1.75" noOfLines={3} fontSize="sm">
                    {uni.description}
                  </Text>
                )}
              </Box>
            </Flex>
          </Box>

          {/* Departments Section */}
          <Box>
            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
              <Box>
                <Heading size="lg" mb={1} color="white">Academic Departments</Heading>
                <Text color="gray.400" fontSize="sm">
                  Explore {departments.length} department{departments.length !== 1 ? 's' : ''} offered by this institution
                </Text>
              </Box>
              <HStack spacing={3}>
                {user && (
                  <Button
                    size="sm"
                    bgGradient="linear(to-r, purple.500, pink.500)"
                    color="white" fontWeight="700" borderRadius="lg"
                    leftIcon={<Box as="span">➕</Box>}
                    _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)', transform: 'translateY(-2px)' }}
                    _active={{ transform: 'scale(0.98)' }}
                    transition="all 0.2s"
                    boxShadow="0 4px 15px rgba(159,122,234,0.3)"
                    onClick={onOpen}
                  >
                    Request Department
                  </Button>
                )}
                <Badge
                  bg="rgba(167,139,250,0.12)"
                  color="purple.300"
                  border="1px solid" borderColor="rgba(167,139,250,0.3)"
                  fontSize="sm" px={4} py={1.5} borderRadius="full"
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
                    _hover={{ transform: 'translateY(-4px)' }}
                  >
                    <DepartmentCard department={d} universityId={universityId} />
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Center py={14} bg="gray.800" borderRadius="xl" border="1px solid" borderColor="gray.700">
                <VStack spacing={4} textAlign="center">
                  <Box w="80px" h="80px" bg="gray.700" borderRadius="full"
                    border="1px solid" borderColor="gray.600"
                    display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="3xl">📚</Text>
                  </Box>
                  <Heading size="md" color="gray.300">No Departments Available</Heading>
                  <Text color="gray.500" maxW="md" fontSize="sm">
                    This university hasn't listed any departments yet. Check back soon for updates.
                  </Text>
                  {user && (
                    <Button
                      size="sm" mt={1}
                      bgGradient="linear(to-r, purple.500, pink.500)"
                      color="white" fontWeight="700" borderRadius="lg"
                      leftIcon={<Box as="span">➕</Box>}
                      _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)' }}
                      onClick={onOpen}
                    >
                      Request First Department
                    </Button>
                  )}
                </VStack>
              </Center>
            )}
          </Box>

          {/* Contact Info */}
          {(uni.website || uni.phone || uni.email) && (
            <Box pt={6} borderTop="1px solid" borderColor="gray.700">
              <Heading size="md" mb={4} color="white">Contact Information</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {uni.website && (
                  <Box p={4} bg="gray.800" borderRadius="lg"
                    border="1px solid" borderColor="gray.700"
                    borderLeft="4px solid" borderLeftColor="purple.500">
                    <Text fontWeight="600" color="purple.400" mb={1} fontSize="sm">Website</Text>
                    <Text color="gray.300" isTruncated fontSize="sm">
                      <a href={uni.website} target="_blank" rel="noopener noreferrer"
                        style={{ textDecoration: 'underline', color: 'inherit' }}>
                        {uni.website}
                      </a>
                    </Text>
                  </Box>
                )}
                {uni.phone && (
                  <Box p={4} bg="gray.800" borderRadius="lg"
                    border="1px solid" borderColor="gray.700"
                    borderLeft="4px solid" borderLeftColor="teal.500">
                    <Text fontWeight="600" color="teal.400" mb={1} fontSize="sm">Phone</Text>
                    <Text color="gray.300" fontSize="sm">{uni.phone}</Text>
                  </Box>
                )}
                {uni.email && (
                  <Box p={4} bg="gray.800" borderRadius="lg"
                    border="1px solid" borderColor="gray.700"
                    borderLeft="4px solid" borderLeftColor="pink.500">
                    <Text fontWeight="600" color="pink.400" mb={1} fontSize="sm">Email</Text>
                    <Text color="gray.300" fontSize="sm">{uni.email}</Text>
                  </Box>
                )}
              </SimpleGrid>
            </Box>
          )}

          {/* Request Department Modal */}
          <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
            <ModalContent bg="gray.800" border="1px solid" borderColor="gray.700"
              borderRadius="2xl" boxShadow="0 25px 60px rgba(0,0,0,0.6)">
              <ModalHeader
                color="white"
                borderBottom="1px solid" borderColor="gray.700"
                fontSize="lg" fontWeight="700"
              >
                <Flex align="center" gap={2}>
                  <Box as="span">➕</Box>
                  Add Department Request
                </Flex>
              </ModalHeader>
              <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />
              <ModalBody py={6}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.300" fontWeight="600">Department Name</FormLabel>
                    <Input
                      {...inputProps}
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="e.g. Computer Science"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="gray.300" fontWeight="600">Short Code</FormLabel>
                    <Input
                      {...inputProps}
                      value={reqCode}
                      onChange={(e) => setReqCode(e.target.value)}
                      placeholder="e.g. CSE"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="gray.300" fontWeight="600">Note / Description</FormLabel>
                    <Textarea
                      {...inputProps}
                      value={reqNote}
                      onChange={(e) => setReqNote(e.target.value)}
                      placeholder="Optional note for admins"
                      rows={4}
                      resize="vertical"
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor="gray.700" gap={3}>
                <Button
                  variant="ghost" color="gray.400" borderRadius="xl"
                  _hover={{ bg: 'gray.700', color: 'white' }}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="white" fontWeight="700" borderRadius="xl" px={8}
                  isLoading={submitting}
                  _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)', transform: 'translateY(-1px)' }}
                  _active={{ transform: 'scale(0.98)' }}
                  transition="all 0.2s"
                  boxShadow="0 4px 15px rgba(159,122,234,0.3)"
                  onClick={async () => {
                    if (!reqName.trim()) {
                      toast({ title: 'Department name required', description: 'Please provide a department name', status: 'warning', duration: 3000, isClosable: true, position: 'top-right' });
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
                      toast({ title: 'Request Submitted Successfully', description: 'Your department request has been sent for admin review.', status: 'success', duration: 4000, isClosable: true, position: 'top-right' });
                      setReqName(''); setReqCode(''); setReqNote('');
                      onClose();
                    } catch (err) {
                      const serverMsg = err?.response?.data?.details || err?.response?.data?.message;
                      toast({ title: 'Submission Failed', description: serverMsg || 'Please try again later', status: 'error', duration: 4000, isClosable: true, position: 'top-right' });
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  Send Request
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

        </VStack>
      </Container>
    </Box>
  );
}