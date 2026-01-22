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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as signalR from '@microsoft/signalr';
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
    queryKey: ['communityPosts', type, page, pageSize, sortBy, search],
    queryFn: () => {
      const params = { page: Number(page), pageSize: Number(pageSize), sortBy, search };
      if (type === 'my') return communityAPI.getMyPosts(params);
      return communityAPI.getPosts(params);
    },
    keepPreviousData: true,
    enabled: type !== 'my' || !!localStorage.getItem('token'),
  });

  const queryClient = useQueryClient();

  // Subscribe to real-time post events via SignalR and refresh feed instantly
  React.useEffect(() => {
    const start = async () => {
      try {
        const hubUrl = (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : '') + '/hubs/community';
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, { skipNegotiation: true, transport: signalR.HttpTransportType.WebSockets })
          .withAutomaticReconnect()
          .build();

        connection.on('PostCreated', (newPost) => {
          // Invalidate so queries refetch and UI updates without refresh
          queryClient.invalidateQueries(['communityPosts']);
          // Optional: if viewing my posts, also invalidate my-posts query
          queryClient.invalidateQueries(['myPosts']);
        });

        await connection.start();

        // Cleanup on unmount
        return () => {
          connection.stop().catch(() => {});
        };
      } catch (err) {
        console.warn('SignalR connection failed', err);
      }
    };

    const stopPromise = start();
    return () => { stopPromise.catch(() => {}); };
  }, [queryClient]);

  // Listen for profile changes and refresh posts so avatars update immediately
  React.useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries(['communityPosts']);
      queryClient.invalidateQueries(['post']);
    };
    window.addEventListener('profileUpdated', handler);
    return () => window.removeEventListener('profileUpdated', handler);
  }, [queryClient]);

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
  // Normalize axios response / API payload to extract posts array and pagination
  const payload = data?.data ?? data; // axios response has .data as payload
  let posts = [];
  if (Array.isArray(payload)) {
    posts = payload;
  } else if (Array.isArray(payload.data)) {
    posts = payload.data;
  } else if (Array.isArray(payload.posts)) {
    posts = payload.posts;
  } else if (Array.isArray(payload.items)) {
    posts = payload.items;
  }

  const totalPages = payload?.totalPages || payload?.total_pages || payload?.TotalPages || 1;
  const total = payload?.total || payload?.totalCount || payload?.TotalCount || posts.length;

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
          {posts.map((post) => {
            const pid = post.id ?? post.Id ?? post.postId ?? post._id ?? post.post_id;
            const norm = {
              ...post,
              id: pid,
              userName: post.userName || post.user_name || post.user?.name || 'Anonymous',
              upvoteCount: post.upvoteCount ?? post.UpvoteCount ?? post.Upvotes ?? 0,
              downvoteCount: post.downvoteCount ?? post.DownvoteCount ?? 0,
              commentCount: post.commentCount ?? post.CommentCount ?? (post.comments?.length ?? post.Comments?.length ?? 0),
            };
            return <PostCard key={pid ?? Math.random()} post={norm} type={type} />;
          })}
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