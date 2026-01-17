import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Center,
  SimpleGrid,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import PostCard from './PostCard';

const PostList = ({ type = 'all' }) => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('latest');
  const [search, setSearch] = useState('');

  // Fetch posts
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => communityAPI.getPosts({ page: Number(page), pageSize: Number(pageSize), sortBy, search }),
    keepPreviousData: true,
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md" mx={4} my={6}>
        <AlertIcon />
        Failed to load posts. Please try again.
      </Alert>
    );
  }

  // Debug: log the data and posts for troubleshooting
  console.log('PostList data:', data);
  // Align with backend: posts array is data.data, each post has id, title, content, userId, userName, postType, createdAt, etc.
  const posts = Array.isArray(data?.data) ? data.data : [];
  const totalPages = data?.data?.totalPages || 1;
  const total = data?.data?.total || posts.length;

  return (
    <Box p={4}>
      {/* Search and Filters */}
      <VStack spacing={4} mb={6}>
        <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
          <HStack>
            <InputGroup>
              <InputLeftElement>
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Button type="submit" colorScheme="blue">
              Search
            </Button>
          </HStack>
        </form>
        <HStack justify="space-between" w="100%">
          <Text fontSize="sm" color="gray.600">
            Showing {posts.length} of {total}
          </Text>
          <Select
            size="sm"
            w="auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Liked</option>
            <option value="mostComments">Most Comments</option>
          </Select>
        </HStack>
      </VStack>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Center py={10}>
          <Text color="gray.500">
            {type === 'my' 
              ? "You haven't created any posts yet." 
              : "No posts found."}
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={4}>
          {posts.map((post) => (
            <PostCard key={post.id} post={{
              ...post,
              userName: post.userName || post.user_name || 'Anonymous',
              // fallback for userName if backend changes
            }} type={type} />
          ))}
        </SimpleGrid>
      )}

      {/* Pagination for all posts */}
      {type === 'all' && totalPages > 1 && (
        <HStack justify="center" spacing={3} mt={8} pt={6} borderTopWidth={1}>
          <Button
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            isDisabled={page === 1}
          >
            Previous
          </Button>
          <Text fontSize="sm">
            Page {page} of {totalPages}
          </Text>
          <Button
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            isDisabled={page === totalPages}
          >
            Next
          </Button>
        </HStack>
      )}
    </Box>
  );
};

export default PostList;