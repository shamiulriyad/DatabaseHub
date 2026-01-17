import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import CreatePost from './CreatePost';
import PostList from './PostList';
import Forum from './Forum';

const CommunityPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);

  // Get post counts for badges
  const { data: myPostsData } = useQuery({
    queryKey: ['myPostsCount'],
    queryFn: () => communityAPI.getMyPosts(),
    enabled: !!localStorage.getItem('token'),
    select: (data) => data.data?.length || 0,
  });

  const { data: allPostsCount } = useQuery({
    queryKey: ['allPostsCount'],
    queryFn: () => communityAPI.getPosts({ page: 1, pageSize: 1 }),
    select: (data) => data.data?.total || 0,
  });

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              Community
            </Text>
            <Text color="gray.600">
              Share, discuss, and connect with others
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
            size={{ base: 'md', md: 'lg' }}
          >
            Create Post
          </Button>
        </Flex>

        {/* Create Post Modal */}
        <CreatePost isOpen={isOpen} onClose={onClose} />

        {/* Main Content */}
        <Box bg="white" borderRadius="lg" shadow="md">
          <Tabs colorScheme="blue" onChange={setActiveTab}>
            <TabList px={4}>
              <Tab>All Posts ({allPostsCount || 0})</Tab>
              <Tab>My Posts ({myPostsData || 0})</Tab>
              <Tab>Forums</Tab>
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
        </Box>
      </VStack>
    </Container>
  );
};

export default CommunityPage;