import React, { useEffect, useState } from 'react';
import {
  SimpleGrid,
  Box,
  Image,
  Heading,
  Text,
  VStack,
  Container,
  Card,
  CardBody,
  CardFooter,
  Stack,
  Flex,
  Center,
  AspectRatio,
  Skeleton,
  Badge,
  Button,
  useToast
} from '@chakra-ui/react';
import {
  StarIcon,
  ChevronRightIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CosmicBg from '../../components/CosmicBg';
import { useAuth } from '../../hooks/useAuth';
import {
  useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea
} from '@chakra-ui/react';

export default function UniversityBrowse() {
  const [unis, setUnis]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const navigate                  = useNavigate();
  const toast                     = useToast();
  const { user }                  = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName]           = useState('');
  const [website, setWebsite]     = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get('/universities')
      .then(res => {
        const data = res.data?.data || res.data?.universities || res.data || [];
        if (mounted) setUnis(Array.isArray(data) ? data : data.items || []);
      })
      .catch(() => {
        setUnis([]);
        toast({
          title: 'Unable to load universities',
          description: 'Please try again later',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [toast]);

  // ── Loading skeletons ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box minH="100vh" bg="#070B1A" position="relative">
        <CosmicBg />
        <Container maxW="container.xl" py={10}>
          <VStack spacing={8} align="stretch">
            <Skeleton height="40px" width="260px" startColor="surface.bg" endColor="card.bg" borderRadius="md" />
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {[...Array(6)].map((_, i) => (
                <Box key={i} borderRadius="xl" overflow="hidden" bg="card.bg" border="1px solid" borderColor="card.border">
                  <AspectRatio ratio={16 / 9}>
                    <Skeleton startColor="surface.bg" endColor="card.bg" />
                  </AspectRatio>
                  <Box p={6}>
                    <VStack align="stretch" spacing={3}>
                      <Skeleton height="22px" startColor="surface.bg" endColor="card.bg" borderRadius="md" />
                      <Skeleton height="14px" width="55%" startColor="surface.bg" endColor="card.bg" borderRadius="md" />
                    </VStack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#070B1A" position="relative">
      <CosmicBg />
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">

          {/* ── Header ── */}
          <Flex justify="space-between" align="flex-end" flexWrap="wrap" gap={4}>
            <Box>
              <Heading
                size="xl"
                mb={1}
                color="white"
                letterSpacing="-0.02em"
              >
                Explore{' '}
                <Box
                  as="span"
                  sx={{
                    background: 'linear-gradient(to right, #818cf8, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Universities
                </Box>
              </Heading>
              <Text color="gray.400" fontSize="md">
                Discover {unis.length} premier institutions worldwide
              </Text>
            </Box>

            {user && (
              <Button
                size="sm"
                bgGradient="linear(to-r, purple.500, pink.500)"
                color="white"
                fontWeight="700"
                borderRadius="lg"
                _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)', transform: 'scale(1.02)' }}
                _active={{ transform: 'scale(0.98)' }}
                boxShadow="0 4px 15px rgba(159,122,234,0.3)"
                onClick={onOpen}
              >
                + Add University
              </Button>
            )}
          </Flex>

          {/* ── Add University Modal ── */}
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
            <ModalContent bg="card.bg" border="1px solid" borderColor="card.border" borderRadius="2xl" boxShadow="0 25px 60px rgba(0,0,0,0.6)">
              <ModalHeader color="white" borderBottom="1px solid" borderColor="card.border">
                Request New University
              </ModalHeader>
              <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />
              <ModalBody py={5}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.300" fontWeight="600">University Name</FormLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Example University"
                      bg="surface.bg" color="white"
                      borderColor="card.border" borderRadius="xl"
                      _placeholder={{ color: 'gray.500' }}
                      _hover={{ borderColor: 'purple.500' }}
                      focusBorderColor="purple.400"
                      _focus={{ boxShadow: '0 0 0 1px #9F7AEA' }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="gray.300" fontWeight="600">Website</FormLabel>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.edu"
                      bg="surface.bg" color="white"
                      borderColor="card.border" borderRadius="xl"
                      _placeholder={{ color: 'gray.500' }}
                      _hover={{ borderColor: 'purple.500' }}
                      focusBorderColor="purple.400"
                      _focus={{ boxShadow: '0 0 0 1px #9F7AEA' }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="gray.300" fontWeight="600">Description</FormLabel>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional description for admins"
                      bg="surface.bg" color="white"
                      borderColor="card.border" borderRadius="xl"
                      _placeholder={{ color: 'gray.500' }}
                      _hover={{ borderColor: 'purple.500' }}
                      focusBorderColor="purple.400"
                      _focus={{ boxShadow: '0 0 0 1px #9F7AEA' }}
                      resize="vertical"
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor="card.border" gap={3}>
                <Button
                  variant="ghost"
                  color="gray.400"
                  _hover={{ bg: 'surface.bg', color: 'white' }}
                  borderRadius="xl"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="white"
                  fontWeight="700"
                  borderRadius="xl"
                  isLoading={submitting}
                  _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)' }}
                  onClick={async () => {
                    if (!name.trim()) {
                      toast({ title: 'Name is required', status: 'warning', duration: 2500, isClosable: true });
                      return;
                    }
                    setSubmitting(true);
                    try {
                      await api.post('/universityrequests', {
                        name: name.trim(),
                        website: website.trim(),
                        description: description.trim(),
                      });
                      toast({ title: 'Request submitted', description: 'Admin will review and approve.', status: 'success', duration: 3000, isClosable: true });
                      setName(''); setWebsite(''); setDescription('');
                      onClose();
                    } catch (err) {
                      console.error('University request failed:', err?.response ?? err);
                      toast({ title: 'Failed to submit request', description: err?.response?.data?.message || 'Try again later', status: 'error', duration: 4000, isClosable: true });
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

          {/* ── Universities Grid ── */}
          {unis.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {unis.map(u => (
                <Box
                  key={u.id}
                  borderRadius="xl"
                  overflow="hidden"
                  bg="card.bg"
                  border="1px solid"
                  borderColor="card.border"
                  boxShadow="0 4px 20px rgba(0,0,0,0.3)"
                  transition="all 0.3s ease"
                  _hover={{
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    borderColor: 'purple.600',
                  }}
                  cursor="pointer"
                  onClick={() => navigate(`/universities/${u.id}`)}
                  role="group"
                  display="flex"
                  flexDirection="column"
                  height="100%"
                >
                  {/* Banner */}
                  <Box position="relative" flexShrink={0}>
                    <AspectRatio ratio={16 / 9}>
                      <Image
                        src={u.bannerUrl || u.banner || '/images/university-placeholder.jpg'}
                        alt={u.name}
                        objectFit="cover"
                        w="100%" h="100%"
                        fallbackSrc="https://via.placeholder.com/400x225?text=University"
                        transition="transform 0.3s ease"
                        _groupHover={{ transform: 'scale(1.06)' }}
                      />
                    </AspectRatio>
                    {/* Hover gradient overlay */}
                    <Box
                      position="absolute" top="0" left="0" w="100%" h="100%"
                      bgGradient="linear(to-t, rgba(0,0,0,0.7), transparent)"
                      opacity="0"
                      transition="opacity 0.3s ease"
                      _groupHover={{ opacity: 1 }}
                    />
                  </Box>

                  {/* Body */}
                  <Box p={5} flex="1" display="flex" flexDirection="column" bg="card.bg">
                    <Stack spacing={3} flex="1">
                      <Heading
                        size="sm"
                        color="white"
                        fontWeight="600"
                        lineHeight="1.4"
                        noOfLines={2}
                      >
                        {u.name}
                      </Heading>

                      <Flex align="center" color="gray.400">
                        <Box as="span" mr={2} fontSize="sm">📍</Box>
                        <Text fontSize="sm" noOfLines={1}>
                          {u.location || u.city || 'Location not specified'}
                        </Text>
                      </Flex>

                      {u.rating && (
                        <Flex align="center" gap={2}>
                          <StarIcon color="yellow.400" boxSize={3} />
                          <Text fontSize="sm" fontWeight="600" color="white">
                            {u.rating.toFixed(1)}
                          </Text>
                          <Badge
                            bg="rgba(167,139,250,0.15)"
                            color="purple.300"
                            border="1px solid"
                            borderColor="rgba(167,139,250,0.3)"
                            fontSize="xs"
                            borderRadius="full"
                            px={2}
                          >
                            Rated
                          </Badge>
                        </Flex>
                      )}
                    </Stack>
                  </Box>

                  {/* Footer */}
                  <Flex
                    px={5} pb={4} pt={3}
                    borderTop="1px solid"
                    borderColor="card.border"
                    justify="space-between"
                    align="center"
                  >
                    <Text fontSize="sm" fontWeight="500" color="purple.400">
                      View details
                    </Text>
                    <Flex align="center" gap={2}>
                      {u.canEdit && (
                        <Button
                          size="xs"
                          bg="rgba(56,178,172,0.15)"
                          color="teal.300"
                          border="1px solid"
                          borderColor="rgba(56,178,172,0.3)"
                          borderRadius="lg"
                          _hover={{ bg: 'rgba(56,178,172,0.25)' }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/universities/${u.id}/edit`); }}
                        >
                          Edit
                        </Button>
                      )}
                      <ChevronRightIcon boxSize={4} color="purple.400" />
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            /* ── Empty state ── */
            <Center py={20} bg="card.bg" borderRadius="xl" border="1px solid" borderColor="card.border">
              <VStack spacing={4}>
                <Box
                  w="90px" h="90px"
                  bg="surface.bg"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border="1px solid"
                  borderColor="card.border"
                >
                  <Text fontSize="3xl">🏛️</Text>
                </Box>
                <Heading size="md" color="gray.300">No universities found</Heading>
                <Text color="gray.500" fontSize="sm">Try refreshing the page or check back later</Text>
              </VStack>
            </Center>
          )}

        </VStack>
      </Container>
    </Box>
  );
}