import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Button,
  IconButton,
  Divider,
  useToast,
  Spinner,
  Center,
  Flex,
  Image,
  Textarea,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  TimeIcon,
  EditIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import Comments from './Comments';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const userId = localStorage.getItem('userId');

  // Fetch post
  const {
    data: postData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => communityAPI.getPostById(postId),
    enabled: !!postId,
  });

  const post = postData?.data;

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => 
      post.likes?.includes(userId) 
        ? communityAPI.unlikePost(postId) 
        : communityAPI.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['post', postId]);
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (commentData) => 
      communityAPI.addComment(postId, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['post', postId]);
      queryClient.invalidateQueries(['comments', postId]);
      setCommentText('');
      toast({
        title: 'Comment added',
        status: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        status: 'error',
      });
    },
  });

  const handleLike = () => {
    if (!userId) {
      toast({
        title: 'Please login',
        description: 'You need to login to like posts',
        status: 'warning',
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!userId) {
      toast({
        title: 'Please login',
        description: 'You need to login to comment',
        status: 'warning',
      });
      return;
    }
    commentMutation.mutate({ content: commentText });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error || !post) {
    return (
      <Container py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Post not found
        </Alert>
        <Button mt={4} onClick={handleBack} leftIcon={<ChevronLeftIcon />}>
          Back
        </Button>
      </Container>
    );
  }

  const isLiked = post.likes?.includes(userId);
  const isOwner = post.userId === userId;

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Button
          leftIcon={<ChevronLeftIcon />}
          variant="ghost"
          onClick={handleBack}
          alignSelf="flex-start"
        >
          Back
        </Button>

        {/* Post Content */}
        <Box bg="white" borderRadius="lg" shadow="md" p={6}>
          {/* Header */}
          <Flex align="center" mb={6}>
            <Avatar
              name={post.user?.name}
              src={post.user?.avatar}
              mr={4}
            />
            <Box flex={1}>
              <Text fontWeight="bold" fontSize="lg">
                {post.user?.name}
              </Text>
              <HStack spacing={3}>
                <Text color="gray.500" fontSize="sm">
                  <TimeIcon mr={1} />
                  {new Date(post.createdAt).toLocaleString()}
                </Text>
                {post.category && (
                  <Badge colorScheme="blue">
                    {post.category}
                  </Badge>
                )}
              </HStack>
            </Box>
          </Flex>

          {/* Content */}
          {post.title && (
            <Text fontSize="2xl" fontWeight="bold" mb={4}>
              {post.title}
            </Text>
          )}
          
          <Text fontSize="lg" mb={6} whiteSpace="pre-line">
            {post.content}
          </Text>

          {post.mediaUrl && (
            <Image
              src={post.mediaUrl}
              alt="Post media"
              borderRadius="md"
              mb={6}
              maxH="400px"
              objectFit="contain"
              w="100%"
            />
          )}

          {/* Stats and Actions */}
          <Divider my={4} />
          <Flex justify="space-between" align="center">
            <HStack spacing={6}>
              <Button
                leftIcon={isLiked ? <FaHeart color="red" /> : <FaRegHeart />}
                variant="ghost"
                onClick={handleLike}
                isLoading={likeMutation.isLoading}
              >
                {post.likes?.length || 0} Likes
              </Button>
              <Text color="gray.600">
                {post.comments?.length || 0} Comments
              </Text>
            </HStack>
          </Flex>

          {/* Add Comment */}
          <Box mt={8}>
            <form onSubmit={handleAddComment}>
              <Textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                mb={3}
                rows={3}
              />
              <Flex justify="flex-end">
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={commentMutation.isLoading}
                  isDisabled={!commentText.trim()}
                >
                  Comment
                </Button>
              </Flex>
            </form>
          </Box>
        </Box>

        {/* Comments Section */}
        <Comments postId={postId} />
      </VStack>
    </Container>
  );
};

export default PostDetail;