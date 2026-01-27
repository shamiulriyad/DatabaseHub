import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import {
  Box,
  VStack,
  HStack,
  Card,
  CardBody,
  Avatar,
  Text,
  Badge,
  Button,
  Textarea,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  useColorModeValue,
  Icon,
  Divider,
  IconButton,
  Wrap,
  WrapItem,
  Tooltip,
} from '@chakra-ui/react';
import {
  FaComments,
  FaPlus,
  FaThumbsUp,
  FaThumbsDown,
  FaComment,
  FaEye,
} from 'react-icons/fa';

const fetchPosts = async (clanId) => {
  const { data } = await api.get(`/clans/${clanId}/posts`);
  return data?.posts || [];
};

const EMOJI_OPTIONS = ['👍', '❤️', '🎉', '🔥', '👏', '💯', '✅', '⭐'];

const PostCard = ({ post, onReact, onVote }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      borderLeftWidth={post.isPinned ? '4px' : '1px'}
      borderLeftColor={post.isPinned ? 'green.500' : borderColor}
    >
      <CardBody>
        <VStack align="stretch" spacing={3}>
          {/* Header */}
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Avatar
                size="sm"
                name={post.userName}
                src={post.userProfileImage}
                cursor="pointer"
                onClick={() => navigate(`/profile/${post.userId}`)}
              />
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Text
                    fontWeight="bold"
                    fontSize="sm"
                    cursor="pointer"
                    _hover={{ color: 'purple.500' }}
                    onClick={() => navigate(`/profile/${post.userId}`)}
                  >
                    {post.userName}
                  </Text>
                  {post.userRole && (
                    <Badge colorScheme="blue" fontSize="xs">
                      {post.userRole}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {new Date(post.createdAt).toLocaleString()}
                </Text>
              </VStack>
            </HStack>
            <HStack fontSize="xs" color="gray.500">
              <HStack spacing={1}>
                <Icon as={FaEye} />
                <Text>{post.viewCount}</Text>
              </HStack>
              {post.isPinned && <Badge colorScheme="green">Pinned</Badge>}
            </HStack>
          </HStack>

          {/* Content */}
          <Box>
            <Text fontWeight="bold" fontSize="md" mb={2}>
              {post.title}
            </Text>
            <Text whiteSpace="pre-wrap">{post.content}</Text>
            {post.mediaUrl && (
              <Box mt={3}>
                {post.mediaType === 'Image' && (
                  <img
                    src={post.mediaUrl}
                    alt="Post media"
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                  />
                )}
              </Box>
            )}
          </Box>

          <Divider />

          {/* Actions */}
          <HStack justify="space-between" flexWrap="wrap">
            {/* Vote buttons */}
            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<FaThumbsUp />}
                variant={post.myVote === 1 ? 'solid' : 'ghost'}
                colorScheme={post.myVote === 1 ? 'green' : 'gray'}
                onClick={() => onVote(post.id, 1)}
              >
                {post.upvoteCount}
              </Button>
              <Button
                size="sm"
                leftIcon={<FaThumbsDown />}
                variant={post.myVote === -1 ? 'solid' : 'ghost'}
                colorScheme={post.myVote === -1 ? 'red' : 'gray'}
                onClick={() => onVote(post.id, -1)}
              >
                {post.downvoteCount}
              </Button>
              <Button size="sm" leftIcon={<FaComment />} variant="ghost">
                {post.commentCount}
              </Button>
            </HStack>

            {/* Reactions */}
            <HStack spacing={1} flexWrap="wrap">
              {post.reactions?.slice(0, 3).map((reaction, index) => (
                <Tooltip
                  key={index}
                  label={reaction.userNames.join(', ')}
                  placement="top"
                >
                  <Button
                    size="sm"
                    variant={post.myReaction === reaction.emoji ? 'solid' : 'outline'}
                    colorScheme={post.myReaction === reaction.emoji ? 'purple' : 'gray'}
                    onClick={() => onReact(post.id, reaction.emoji)}
                  >
                    {reaction.emoji} {reaction.count}
                  </Button>
                </Tooltip>
              ))}
              
              {EMOJI_OPTIONS.filter(
                emoji => !post.reactions?.some(r => r.emoji === emoji)
              ).slice(0, 3).map((emoji) => (
                <IconButton
                  key={emoji}
                  size="sm"
                  variant="ghost"
                  icon={<Text fontSize="md">{emoji}</Text>}
                  onClick={() => onReact(post.id, emoji)}
                />
              ))}
            </HStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const CreatePostModal = ({ isOpen, onClose, clanId }) => {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();

  const createMutation = useMutation({
    mutationFn: (data) => api.post(`/clans/${clanId}/posts`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clanPosts', clanId]);
      toast({
        title: 'Post created',
        status: 'success',
        duration: 3000,
      });
      onClose();
      setContent('');
    },
    onError: (error) => {
      toast({
        title: 'Error creating post',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 4000,
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: 'Please fill all fields',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Send only content for clan posts (title is optional)
    createMutation.mutate({ content });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Post</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <Box w="100%">
              {/* Title removed for clan posts; only content is required */}
            </Box>

            <Box w="100%">
              <Text fontWeight="bold" mb={2}>
                Content
              </Text>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, questions, or ideas..."
                rows={8}
              />
            </Box>

            <HStack w="100%" justify="flex-end">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleSubmit}
                isLoading={createMutation.isLoading}
              >
                Post
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const ClanCommunity = () => {
  const { clanId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['clanPosts', clanId],
    queryFn: () => fetchPosts(clanId),
  });

  const reactMutation = useMutation({
    mutationFn: ({ postId, emoji }) =>
      api.post(`/clans/${clanId}/posts/${postId}/react`, { emoji }),
    onSuccess: () => {
      queryClient.invalidateQueries(['clanPosts', clanId]);
    },
    onError: (error) => {
      toast({
        title: 'Error adding reaction',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: ({ postId, vote }) =>
      api.post(`/clans/${clanId}/posts/${postId}/vote?vote=${vote}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['clanPosts', clanId]);
    },
    onError: (error) => {
      toast({
        title: 'Error voting',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const handleReact = (postId, emoji) => {
    reactMutation.mutate({ postId, emoji });
  };

  const handleVote = (postId, vote) => {
    voteMutation.mutate({ postId, vote });
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <HStack>
          <Icon as={FaComments} boxSize={6} color="purple.500" />
          <Text fontSize="2xl" fontWeight="bold">
            Community
          </Text>
        </HStack>
        <Button leftIcon={<FaPlus />} colorScheme="purple" onClick={onOpen}>
          New Post
        </Button>
      </HStack>

      <Card bg={useColorModeValue('green.50', 'green.900')} mb={4}>
        <CardBody>
          <Text fontSize="sm" color="green.700">
            💬 All members can post and discuss. Be respectful and helpful!
          </Text>
        </CardBody>
      </Card>

      <VStack spacing={4} align="stretch">
        {isLoading ? (
          <Text>Loading posts...</Text>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReact={handleReact}
              onVote={handleVote}
            />
          ))
        ) : (
          <Card>
            <CardBody>
              <Text textAlign="center" color="gray.500">
                No posts yet. Be the first to start a discussion!
              </Text>
            </CardBody>
          </Card>
        )}
      </VStack>

      <CreatePostModal isOpen={isOpen} onClose={onClose} clanId={clanId} />
    </Box>
  );
};

export default ClanCommunity;
