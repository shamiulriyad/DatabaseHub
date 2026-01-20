import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Flex,
  Image,
  Tag,
  Divider,
} from '@chakra-ui/react';
import {
  ChatIcon,
  TimeIcon,
  EditIcon,
  DeleteIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { FaHeart, FaRegHeart, FaShareAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';

const PostCard = ({ post, type }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem('userId');
  
  // Like/Unlike not implemented in backend DTO, so always false
  const [isLiked, setIsLiked] = useState(false);

  // Like/Unlike mutation
  // Like/Unlike mutation placeholder (not functional)
  const likeMutation = { isLoading: false, mutate: () => {} };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => communityAPI.deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['myPosts']);
      toast({
        title: 'Post deleted',
        status: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        status: 'error',
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate();
    }
  };

  const handleViewDetail = () => {
    navigate(`/community/post/${post.id}`);
  };

  const isOwner = post.userId === userId;

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      shadow="sm"
      _hover={{ shadow: 'md' }}
    >
      {/* Header */}
      <Flex p={4} align="center">
        <Avatar
          size="sm"
          name={post.userName || 'Anonymous'}
          mr={3}
          src={post.profileImageUrl || post.user?.profileImageUrl || post.user?.avatar}
          cursor="pointer"
          onClick={() => navigate(`/user/${post.userId}`)}
        />
        <VStack align="start" spacing={0} flex={1}>
          <Text fontWeight="bold" cursor="pointer" onClick={() => navigate(`/user/${post.userId}`)}>
            {post.userName || 'Anonymous'}
          </Text>
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.500">
              <TimeIcon mr={1} />
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
            </Text>
            {post.postType && (
              <Badge colorScheme="blue" size="sm">
                {post.postType}
              </Badge>
            )}
          </HStack>
        </VStack>
        
        {isOwner && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<ChevronDownIcon />}
              variant="ghost"
              size="sm"
            />
            <MenuList>
              <MenuItem icon={<EditIcon />}>Edit</MenuItem>
              <MenuItem
                icon={<DeleteIcon />}
                color="red.500"
                onClick={handleDelete}
              >
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>

      {/* Content */}
      <Box px={4} pb={3}>
        {post.title && (
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            {post.title}
          </Text>
        )}
        <Text noOfLines={3} mb={3}>
          {post.content}
        </Text>
        {post.mediaUrl && (
          <Image
            src={post.mediaUrl}
            alt="Post media"
            borderRadius="md"
            mb={3}
            maxH="200px"
            objectFit="cover"
            w="100%"
          />
        )}
      </Box>

      <Divider />

      {/* Actions */}
      <Flex p={3} justify="space-between" align="center">
        <HStack spacing={4}>
          <Button
            leftIcon={isLiked ? <FaHeart color="red" /> : <FaRegHeart />}
            size="sm"
            variant="ghost"
            onClick={handleLike}
            isLoading={likeMutation.isLoading}
          >
            {post.upvoteCount || 0}
          </Button>
          <Button
            leftIcon={<ChatIcon />}
            size="sm"
            variant="ghost"
            onClick={handleViewDetail}
          >
            {post.commentCount || 0}
          </Button>
        </HStack>
        <Button
          size="sm"
          variant="outline"
          colorScheme="blue"
          onClick={handleViewDetail}
        >
          View
        </Button>
      </Flex>
    </Box>
  );
};

export default PostCard;