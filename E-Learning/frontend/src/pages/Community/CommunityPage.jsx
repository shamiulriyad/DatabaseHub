import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Button,
  useDisclosure,
  Text,
  VStack,
  Heading,
  HStack,
  Icon,
  Badge,
  useColorModeValue,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { AddIcon, ChatIcon, StarIcon, ViewIcon } from '@chakra-ui/icons';
import { FaUsers, FaFire, FaChartLine } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import CreatePost from './CreatePost';
import PostList from './PostList';
import Forum from './Forum';

const CommunityPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryColor = useColorModeValue('gray.100', 'gray.700');

  // Get post counts for badges
  const { data: myPostsData } = useQuery({
    queryKey: ['myPostsCount'],
    queryFn: () => communityAPI.getMyPosts(),
    enabled: !!localStorage.getItem('token'),
    select: (response) => {
      const payload = response?.data ?? {};
      if (Array.isArray(payload.posts)) return payload.posts.length;
      if (Array.isArray(payload.data)) return payload.data.length;
      if (Array.isArray(payload)) return payload.length;
      return 0;
    },
  });

  const { data: allPostsCount } = useQuery({
    queryKey: ['allPostsCount'],
    queryFn: () => communityAPI.getPosts({ page: 1, pageSize: 10000 }),
    select: (response) => {
      const payload = response?.data ?? {};
      if (payload.total != null) return payload.total;
      if (Array.isArray(payload.posts)) return payload.posts.length;
      if (Array.isArray(payload.data)) return payload.data.length;
      if (Array.isArray(payload)) return payload.length;
      return 0;
    },
  });

  // Fetch full posts data (large pageSize) so we can compute active member count
  const { data: allPostsData } = useQuery({
    queryKey: ['allPostsData'],
    queryFn: () => communityAPI.getPosts({ page: 1, pageSize: 10000 }),
    select: (response) => {
      const payload = response?.data ?? {};
      if (Array.isArray(payload.posts)) return payload.posts;
      if (Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      // fallback: if `posts` is nested inside `data.posts`
      if (payload.posts) return payload.posts;
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Compute active members as unique authors from recent posts
  const activeMembersCount = useMemo(() => {
    try {
      const posts = allPostsData || [];
      const ids = new Set();
      posts.forEach((p) => {
        const id = p?.user?.id ?? p?.userId ?? p?.UserId ?? p?.createdBy ?? p?.createdById ?? p?.authorId;
        if (id != null) ids.add(String(id));
      });
      return ids.size;
    } catch (e) {
      return 0;
    }
  }, [allPostsData]);

  const formatCount = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  const communityStats = [
    { icon: FaUsers, label: 'Active Members', value: formatCount(activeMembersCount), color: 'green.500' },
    { icon: FaFire, label: 'Hot Posts', value: allPostsCount || '0', color: 'orange.500' },
    { icon: FaChartLine, label: 'Today', value: '28', color: 'blue.500' },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Enhanced Header with Stats */}
        <Box>
          <Flex 
            justify="space-between" 
            align={{ base: 'start', md: 'center' }} 
            direction={{ base: 'column', md: 'row' }}
            gap={6}
            mb={6}
          >
            <Box>
              <Heading 
                fontSize={{ base: '3xl', md: '4xl' }} 
                fontWeight="bold" 
                mb={3}
                bgGradient="linear(to-r, blue.500, purple.600)"
                bgClip="text"
              >
                Community Hub
              </Heading>
              <Text 
                fontSize="lg" 
                color="gray.600" 
                maxW="2xl"
              >
                Share your thoughts, join discussions, and connect with like-minded people in our vibrant community.
              </Text>
            </Box>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onOpen}
              size="lg"
              px={8}
              py={6}
              borderRadius="lg"
              bgGradient="linear(to-r, blue.500, blue.600)"
              _hover={{
                bgGradient: 'linear(to-r, blue.600, blue.700)',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.3s"
            >
              Create Post
            </Button>
          </Flex>

          {/* Community Stats Cards */}
          <HStack 
            spacing={4} 
            overflowX="auto" 
            py={2}
            sx={{
              '&::-webkit-scrollbar': {
                height: '4px',
              },
              '&::-webkit-scrollbar-track': {
                height: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'gray.300',
                borderRadius: '24px',
              },
            }}
          >
            {communityStats.map((stat, index) => (
              <Card
                key={index}
                flexShrink={0}
                border="1px"
                borderColor={borderColor}
                bg={bgColor}
                borderRadius="lg"
                shadow="sm"
                _hover={{
                  shadow: 'md',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s',
                }}
              >
                <CardBody p={4}>
                  <HStack spacing={3}>
                    <Box
                      p={2}
                      borderRadius="md"
                      bg={`${stat.color}15`}
                    >
                      <Icon as={stat.icon} boxSize={5} color={stat.color} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        {stat.label}
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color={stat.color}>
                        {stat.value}
                      </Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </HStack>
        </Box>

        {/* Create Post Modal */}
        <CreatePost isOpen={isOpen} onClose={onClose} />

        {/* Main Content with Enhanced Tabs */}
        <Card
          border="1px"
          borderColor={borderColor}
          bg={bgColor}
          borderRadius="xl"
          shadow="lg"
          overflow="hidden"
        >
          <Tabs 
            colorScheme="blue" 
            onChange={setActiveTab}
            variant="enclosed"
            isLazy
          >
            <TabList 
              px={6} 
              pt={4}
              borderBottom="2px"
              borderColor={secondaryColor}
            >
              <Tab
                _selected={{
                  color: primaryColor,
                  borderColor: primaryColor,
                  borderBottom: '2px solid',
                  fontWeight: 'semibold',
                  bg: 'blue.50',
                  _dark: { bg: 'blue.900' },
                }}
                py={4}
                px={6}
                fontSize="md"
                fontWeight="medium"
              >
                <HStack spacing={2}>
                  <Icon as={ChatIcon} />
                  <Text>All Posts</Text>
                  <Badge 
                    colorScheme="blue" 
                    borderRadius="full" 
                    px={2}
                    fontSize="xs"
                  >
                    {allPostsCount || 0}
                  </Badge>
                </HStack>
              </Tab>
              <Tab
                _selected={{
                  color: primaryColor,
                  borderColor: primaryColor,
                  borderBottom: '2px solid',
                  fontWeight: 'semibold',
                  bg: 'blue.50',
                  _dark: { bg: 'blue.900' },
                }}
                py={4}
                px={6}
                fontSize="md"
                fontWeight="medium"
              >
                <HStack spacing={2}>
                  <Icon as={StarIcon} />
                  <Text>My Posts</Text>
                  <Badge 
                    colorScheme="green" 
                    borderRadius="full" 
                    px={2}
                    fontSize="xs"
                  >
                    {myPostsData || 0}
                  </Badge>
                </HStack>
              </Tab>
              <Tab
                _selected={{
                  color: primaryColor,
                  borderColor: primaryColor,
                  borderBottom: '2px solid',
                  fontWeight: 'semibold',
                  bg: 'blue.50',
                  _dark: { bg: 'blue.900' },
                }}
                py={4}
                px={6}
                fontSize="md"
                fontWeight="medium"
              >
                <HStack spacing={2}>
                  <Icon as={ViewIcon} />
                  <Text>Forums</Text>
                  <Badge 
                    colorScheme="purple" 
                    borderRadius="full" 
                    px={2}
                    fontSize="xs"
                  >
                    12
                  </Badge>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <PostList type="all" />
              </TabPanel>
              <TabPanel p={0}>
                <PostList type="my" />
              </TabPanel>
              <TabPanel p={0}>
                <Forum />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>

        {/* Quick Tips Section */}
        <Card
          border="1px"
          borderColor="blue.100"
          bg="blue.50"
          _dark={{
            bg: 'blue.900',
            borderColor: 'blue.800',
          }}
          borderRadius="xl"
          shadow="sm"
        >
          <CardBody p={6}>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <Box maxW="xl">
                <Heading size="md" mb={2} color="blue.700" _dark={{ color: 'blue.200' }}>
                  Community Guidelines
                </Heading>
                <Text color="blue.600" _dark={{ color: 'blue.300' }} fontSize="sm">
                  Be respectful, stay on topic, and help keep our community a welcoming space for everyone.
                </Text>
              </Box>
              <Button
                variant="outline"
                colorScheme="blue"
                size="sm"
                borderRadius="md"
              >
                Learn More
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default CommunityPage;