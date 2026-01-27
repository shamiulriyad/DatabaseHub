import React, { useEffect, useState } from 'react';
import { 
  SimpleGrid, 
  Box, 
  Image, 
  Heading, 
  Text, 
  Spinner, 
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
import { useAuth } from '../../hooks/useAuth';
import { useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react';

export default function UniversityBrowse() {
  const [unis, setUnis] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
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
    return () => mounted = false;
  }, [toast]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Skeleton height="40px" width="200px" />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(6)].map((_, i) => (
              <Card key={i} variant="outline" borderRadius="xl" overflow="hidden">
                <AspectRatio ratio={16/9}>
                  <Skeleton />
                </AspectRatio>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Skeleton height="24px" />
                    <Skeleton height="16px" width="60%" />
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
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <Box>
          <Heading 
            size="xl" 
            mb={2}
            bgGradient="linear(to-r, blue.600, purple.600)"
            bgClip="text"
          >
            Explore Universities
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Discover {unis.length} premier institutions worldwide
          </Text>
        </Box>
        <Box display="flex" justifyContent="flex-end">
          {user && (
            <Button colorScheme="green" size="sm" onClick={onOpen}>
              + Add University
            </Button>
          )}
        </Box>

        {/* Add University Modal (rendered regardless of list state) */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Request New University</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb={3} isRequired>
                <FormLabel>University Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Example University" />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Website</FormLabel>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.edu" />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description for admins" />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme="green" isLoading={submitting} onClick={async () => {
                if (!name.trim()) {
                  toast({ title: 'Name is required', status: 'warning', duration: 2500, isClosable: true });
                  return;
                }
                setSubmitting(true);
                  try {
                      await api.post('/universityrequests', { name: name.trim(), website: website.trim(), description: description.trim() });
                      toast({ title: 'Request submitted', description: 'Admin will review and approve.', status: 'success', duration: 3000, isClosable: true });
                  setName(''); setWebsite(''); setDescription('');
                  onClose();
                } catch (err) {
                      console.error('University request failed:', err?.response ?? err);
                      toast({ title: 'Failed to submit request', description: err?.response?.data?.message || 'Try again later', status: 'error', duration: 4000, isClosable: true });
                } finally { setSubmitting(false); }
              }}>Send Request</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Universities Grid */}
        {unis.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {unis.map(u => (
              <Card 
                key={u.id}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                }}
                cursor="pointer"
                onClick={() => navigate(`/universities/${u.id}`)}
                border="1px"
                borderColor="gray.100"
                role="group"
                height="100%"
                display="flex"
                flexDirection="column"
              >
                {/* University Banner */}
                <Box position="relative" flexShrink={0}>
                  <AspectRatio ratio={16/9}>
                    <Image 
                      src={u.bannerUrl || u.banner || '/images/university-placeholder.jpg'} 
                      alt={u.name}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                      fallbackSrc="https://via.placeholder.com/400x225?text=University"
                      transition="transform 0.3s ease"
                      _groupHover={{ transform: 'scale(1.05)' }}
                    />
                  </AspectRatio>
                  {/* Gradient Overlay */}
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    w="100%"
                    h="100%"
                    bgGradient="linear(to-t, blackAlpha.600, transparent)"
                    opacity="0"
                    transition="opacity 0.3s ease"
                    _groupHover={{ opacity: 1 }}
                  />
                </Box>

                <CardBody p={6} flex="1" display="flex" flexDirection="column">
                  <Stack spacing={4} flex="1">
                    {/* University Name - Fixed height for consistency */}
                    <Box 
                      minH="72px"
                      display="flex"
                      alignItems="flex-start"
                    >
                      <Heading 
                        size="md" 
                        color="gray.800"
                        fontWeight="semibold"
                        lineHeight="tall"
                        wordBreak="break-word"
                        whiteSpace="normal"
                        overflow="visible"
                        textOverflow="unset"
                        css={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                        sx={{
                          '&': {
                            overflow: 'visible !important',
                            display: 'block !important',
                            maxHeight: 'none !important',
                          }
                        }}
                      >
                        {u.name}
                      </Heading>
                    </Box>

                    {/* Location */}
                    <Flex align="center" color="gray.600" mt={2}>
                      <Box as="span" mr={2} color="blue.500">📍</Box>
                      <Text fontSize="sm" noOfLines={1}>
                        {u.location || u.city || 'Location not specified'}
                      </Text>
                    </Flex>

                    {/* Rating Badge (if available) */}
                    {u.rating && (
                      <Flex align="center" mt={2}>
                        <StarIcon color="yellow.400" mr={1} />
                        <Text fontWeight="medium" mr={2}>
                          {u.rating.toFixed(1)}
                        </Text>
                        <Badge colorScheme="blue" variant="subtle">
                          Rated
                        </Badge>
                      </Flex>
                    )}
                  </Stack>
                </CardBody>

                {/* Footer with CTA */}
                <CardFooter 
                  pt={0} 
                  px={6} 
                  pb={6}
                  borderTop="1px"
                  borderColor="gray.100"
                  flexShrink={0}
                >
                  <Flex 
                    justify="space-between" 
                    align="center" 
                    w="100%"
                    color="blue.600"
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      View details
                    </Text>
                    <Flex align="center" gap={3}>
                      {u.canEdit && (
                        <Button
                          size="sm"
                          colorScheme="teal"
                          onClick={(e) => { e.stopPropagation(); navigate(`/universities/${u.id}/edit`); }}
                        >
                          Edit
                        </Button>
                      )}
                      <ChevronRightIcon boxSize={5} />
                    </Flex>
                  </Flex>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Center py={20} bg="gray.50" borderRadius="xl">
            <VStack spacing={4}>
              <Box 
                w="100px" 
                h="100px" 
                bg="gray.200" 
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="3xl">🏛️</Text>
              </Box>
              <Heading size="md" color="gray.600">
                No universities found
              </Heading>
              <Text color="gray.500">
                Try refreshing the page or check back later
              </Text>
            </VStack>
            
          </Center>
        )}
      </VStack>
    </Container>
  );
}