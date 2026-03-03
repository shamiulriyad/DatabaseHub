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
  const [searchInput, setSearchInput] = useState(''); // BUG FIX: separate controlled input from committed search
                                                       // previously typing immediately triggered re-queries on every keystroke

  const queryClient = useQueryClient();

  // ── Fetch posts ──────────────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ['communityPosts', type, page, pageSize, sortBy, search],
    queryFn: () => {
      const params = { page: Number(page), pageSize: Number(pageSize), sortBy, search };
      if (type === 'my') return communityAPI.getMyPosts(params);
      return communityAPI.getPublicPosts(params);
    },
    keepPreviousData: true,
    enabled: type !== 'my' || !!localStorage.getItem('token'),
  });

  // ── SignalR real-time updates ────────────────────────────────────────────
  // BUG FIX: cleanup was broken — start() returns a cleanup fn inside async,
  // but the outer return only got a Promise, never the actual cleanup.
  // Fixed by storing the connection ref outside the async block.
  React.useEffect(() => {
    let connection = null;

    const connect = async () => {
      try {
        const base = process.env.REACT_APP_API_URL || '';
        connection = new signalR.HubConnectionBuilder()
          .withUrl(`${base}/hubs/community`, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
          })
          .withAutomaticReconnect()
          .build();

        connection.on('PostCreated', () => {
          queryClient.invalidateQueries(['communityPosts']);
          queryClient.invalidateQueries(['myPosts']);
        });

        await connection.start();
      } catch (err) {
        console.warn('SignalR connection failed:', err);
      }
    };

    connect();

    // BUG FIX: this cleanup now actually runs and stops the connection
    return () => {
      connection?.stop().catch(() => {});
    };
  }, [queryClient]);


  // ── Profile update listener ──────────────────────────────────────────────
  React.useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries(['communityPosts']);
      queryClient.invalidateQueries(['post']);
    };
    window.addEventListener('profileUpdated', handler);
    return () => window.removeEventListener('profileUpdated', handler);
  }, [queryClient]);

  // ── Search submit ────────────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput); // BUG FIX: only commit search on submit, not on every keystroke
  };

  // ── Normalize API response ───────────────────────────────────────────────
  const payload = data?.data ?? data;
  const nested = payload?.data ?? null;
  let posts = [];
  if (Array.isArray(payload)) posts = payload;
  else if (Array.isArray(payload?.posts)) posts = payload.posts;
  else if (Array.isArray(nested?.posts)) posts = nested.posts;
  else if (Array.isArray(payload?.data)) posts = payload.data;
  else if (Array.isArray(payload?.items)) posts = payload.items;

  const totalPages =
    nested?.totalPages ??
    payload?.totalPages ??
    payload?.total_pages ??
    payload?.TotalPages ??
    1;
  const total =
    nested?.totalCount ??
    payload?.total ??
    payload?.totalCount ??
    payload?.TotalCount ??
    posts.length;

  // If backend doesn't provide totalPages, compute fallback to avoid UI breakage
  const computedTotalPages = Number(totalPages) > 0 ? Number(totalPages) : Math.max(1, Math.ceil((total || 0) / Number(pageSize || 10)));
  // Prefetch next page to make navigation snappier and reduce perceived latency
  React.useEffect(() => {
    // Always call the hook; internal logic is conditional
    const nextPage = Number(page) + 1;
    if (data && nextPage <= computedTotalPages) {
      const params = { page: nextPage, pageSize: Number(pageSize), sortBy, search };
      queryClient.prefetchQuery(
        ['communityPosts', type, nextPage, pageSize, sortBy, search],
        () => type === 'my' ? communityAPI.getMyPosts(params) : communityAPI.getPublicPosts(params)
      );
    }
  }, [data, page, pageSize, sortBy, search, queryClient, type, computedTotalPages]);

  // BUG FIX: removed console.log('PostList data:', data) — debug log left in production

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Center py={16}>
        <VStack spacing={3}>
          <Spinner size="lg" color="purple.400" thickness="3px" />
          <Text fontSize="sm" color="whiteAlpha.400">Loading posts...</Text>
        </VStack>
      </Center>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Box px={6} py={6}>
        <Alert
          status="error"
          borderRadius="xl"
          bg="rgba(254,178,178,0.08)"
          border="1px solid"
          borderColor="red.800"
          color="red.300"
        >
          <AlertIcon color="red.400" />
          Failed to load posts. Please try again.
        </Alert>
      </Box>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Box p={6}>

      {/* ── Search & Sort bar ── */}
      <VStack spacing={4} mb={6} align="stretch">
        <form onSubmit={handleSearchSubmit}>
          <HStack spacing={3}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="whiteAlpha.400" />
              </InputLeftElement>
              <Input
                placeholder="Search posts..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                bg="rgba(255,255,255,0.03)"
                border="1px solid"
                borderColor="rgba(255,255,255,0.05)"
                color="whiteAlpha.900"
                _placeholder={{ color: 'whiteAlpha.400' }}
                _hover={{ borderColor: 'whiteAlpha.200' }}
                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                borderRadius="xl"
              />
            </InputGroup>
            <Button
              type="submit"
              px={6}
              borderRadius="xl"
              bgGradient="linear(to-r, purple.500, pink.500)"
              color="white"
              fontWeight="bold"
              _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)', transform: 'translateY(-1px)' }}
              transition="all 0.2s"
            >
              Search
            </Button>
          </HStack>
        </form>

        <HStack justify="space-between" w="100%">
          <Text fontSize="sm" color="whiteAlpha.400">
            Showing <Text as="span" color="whiteAlpha.700" fontWeight="semibold">{posts.length}</Text> of{' '}
            <Text as="span" color="whiteAlpha.700" fontWeight="semibold">{total}</Text> posts
          </Text>

          <Select
            size="sm"
            w="160px"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            bg="rgba(255,255,255,0.03)"
            border="1px solid"
            borderColor="rgba(255,255,255,0.05)"
            color="whiteAlpha.800"
            borderRadius="lg"
            _hover={{ borderColor: 'whiteAlpha.200' }}
            sx={{
              option: { background: '#0d0d26', color: 'white' },
            }}
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Liked</option>
            <option value="mostComments">Most Comments</option>
          </Select>
        </HStack>
      </VStack>

      {/* ── Posts ── */}
      {posts.length === 0 ? (
        <Center py={16}>
          <VStack spacing={3} textAlign="center">
            <Text fontSize="3xl">💬</Text>
            <Text color="whiteAlpha.500" fontSize="md">
              {type === 'my'
                ? "You haven't created any posts yet."
                : 'No posts found. Be the first to post!'}
            </Text>
          </VStack>
        </Center>
      ) : (
        <SimpleGrid columns={1} spacing={4}>
          {posts.map((post) => {
            const pid = post.id ?? post.Id ?? post.postId ?? post._id ?? post.post_id;
            const norm = {
              ...post,
              id: pid,
              userName:
                post.userName || post.user_name || post.user?.name || 'Anonymous',
              upvoteCount: post.upvoteCount ?? post.UpvoteCount ?? post.Upvotes ?? 0,
              downvoteCount: post.downvoteCount ?? post.DownvoteCount ?? 0,
              commentCount:
                post.commentCount ?? post.CommentCount ??
                (post.comments?.length ?? post.Comments?.length ?? 0),
            };
            // BUG FIX: Math.random() as key causes every re-render to remount PostCard.
            // Use index as fallback instead, which is stable across renders.
            return <PostCard key={pid ?? `post-fallback-${norm.userName}-${norm.upvoteCount}`} post={norm} type={type} />;
          })}
        </SimpleGrid>
      )}

      {/* ── Pagination ── */}
      {computedTotalPages > 1 && (
        <HStack
          justify="center"
          spacing={3}
          mt={8}
          pt={6}
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Button
            size="sm"
            borderRadius="lg"
            variant="ghost"
            color="whiteAlpha.700"
            bg="rgba(255,255,255,0.02)"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _hover={{ bg: 'rgba(255,255,255,0.06)', color: 'white' }}
            onClick={() => setPage(1)}
            isDisabled={page === 1}
          >
            « First
          </Button>

          <Button
            size="sm"
            borderRadius="lg"
            variant="ghost"
            color="whiteAlpha.700"
            bg="rgba(255,255,255,0.02)"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _hover={{ bg: 'rgba(255,255,255,0.06)', color: 'white' }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            isDisabled={page === 1}
          >
            ← Prev
          </Button>

          {/* Dynamic page range with ellipses */}
          {(() => {
            const maxButtons = 7; // max numeric buttons to show
            const totalP = computedTotalPages;
            const current = Number(page);
            const pagesToShow = [];

            if (totalP <= maxButtons) {
              for (let i = 1; i <= totalP; i++) pagesToShow.push(i);
            } else {
              const left = Math.max(1, current - 2);
              const right = Math.min(totalP, current + 2);
              if (left > 2) {
                pagesToShow.push(1, 'left-ellipsis');
                for (let i = left; i <= Math.min(right, totalP); i++) pagesToShow.push(i);
                if (right < totalP - 1) pagesToShow.push('right-ellipsis', totalP);
                else if (right === totalP - 1) pagesToShow.push(totalP);
              } else {
                for (let i = 1; i <= 5; i++) pagesToShow.push(i);
                pagesToShow.push('right-ellipsis', totalP);
              }
            }

            return pagesToShow.map((p, idx) => {
              if (p === 'left-ellipsis' || p === 'right-ellipsis') {
                return (
                  <Text key={`ell-${idx}`} color="whiteAlpha.400" fontSize="sm">…</Text>
                );
              }
              return (
                <Button
                  key={p}
                  size="sm"
                  borderRadius="lg"
                  variant={Number(p) === Number(page) ? 'solid' : 'ghost'}
                  bgGradient={Number(p) === Number(page) ? 'linear(to-r, purple.500, pink.500)' : undefined}
                  bg={Number(p) === Number(page) ? undefined : 'rgba(255,255,255,0.02)'}
                  border="1px solid"
                  borderColor={Number(p) === Number(page) ? 'transparent' : 'whiteAlpha.070'}
                  color={Number(p) === Number(page) ? 'white' : 'whiteAlpha.600'}
                  _hover={{ bg: Number(p) === Number(page) ? undefined : 'rgba(255,255,255,0.06)', color: 'white' }}
                  onClick={() => setPage(Number(p))}
                >
                  {p}
                </Button>
              );
            });
          })()}

          <Button
            size="sm"
            borderRadius="lg"
            variant="ghost"
            color="whiteAlpha.700"
            bg="rgba(255,255,255,0.02)"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _hover={{ bg: 'rgba(255,255,255,0.06)', color: 'white' }}
            onClick={() => setPage((p) => Math.min(computedTotalPages, p + 1))}
            isDisabled={page === computedTotalPages}
          >
            Next →
          </Button>

          <Button
            size="sm"
            borderRadius="lg"
            variant="ghost"
            color="whiteAlpha.700"
            bg="rgba(255,255,255,0.02)"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _hover={{ bg: 'rgba(255,255,255,0.06)', color: 'white' }}
            onClick={() => setPage(computedTotalPages)}
            isDisabled={page === computedTotalPages}
          >
            Last »
          </Button>
        </HStack>
      )}
    </Box>
  );
};

export default PostList;