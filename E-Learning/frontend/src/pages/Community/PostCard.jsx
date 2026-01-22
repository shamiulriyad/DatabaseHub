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
import { FaHeart, FaRegHeart, FaShareAlt, FaThumbsDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { normalizeAvatar, normalizeUrl } from '../../utils/imageUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import CreatePost from './CreatePost';

const PostCard = ({ post, type }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem('userId');
  
  const [isLiked, setIsLiked] = useState(Boolean(post.HasUpvoted ?? post.hasUpvoted ?? false));
  const [isDisliked, setIsDisliked] = useState(Boolean(post.HasDownvoted ?? post.hasDownvoted ?? false));

  // normalize id across possible payload shapes
  const pid = post.Id ?? post.id ?? post._id ?? post.postId ?? post.PostId ?? post.postID ?? post.post_id;

  // Like mutation
  const likeMutation = useMutation({
    // accept post id when we call mutate(id)
    mutationFn: (postId) => (isLiked ? communityAPI.unlikePost(postId) : communityAPI.likePost(postId)),
    onMutate: async () => {
      // optimistic update
      const keyAll = ['communityPosts'];
      const keyMy = ['myPosts'];
      // adjust local UI immediately
      setIsLiked((v) => !v);
      if (!isLiked) {
        post.upvoteCount = (post.upvoteCount ?? post.UpvoteCount ?? 0) + 1;
      } else {
        post.upvoteCount = Math.max(0, (post.upvoteCount ?? post.UpvoteCount ?? 1) - 1);
      }
      queryClient.invalidateQueries(keyAll);
      queryClient.invalidateQueries(keyMy);
      queryClient.invalidateQueries(['post', pid]);
    },
    onError: () => {
      // revert optimistic
      setIsLiked((v) => !v);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['communityPosts']);
      queryClient.invalidateQueries(['myPosts']);
      queryClient.invalidateQueries(['post', pid]);
    }
  });

  const dislikeMutation = useMutation({
    // accept post id when we call mutate(id)
    mutationFn: (postId) => communityAPI.dislikePost(postId),
    onMutate: async () => {
      setIsDisliked(true);
      post.downvoteCount = (post.downvoteCount ?? post.DownvoteCount ?? 0) + 1;
      queryClient.invalidateQueries(['communityPosts']);
      queryClient.invalidateQueries(['myPosts']);
      queryClient.invalidateQueries(['post', pid]);
    },
    onError: () => {
      setIsDisliked(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['communityPosts']);
      queryClient.invalidateQueries(['myPosts']);
      queryClient.invalidateQueries(['post', pid]);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => communityAPI.deletePost(pid),
    onSuccess: () => {
      queryClient.invalidateQueries(['communityPosts']);
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
    if (!localStorage.getItem('token')) {
      toast({ title: 'Login required', description: 'You need to login to like posts', status: 'warning' });
      return;
    }
    likeMutation.mutate(pid);
  };

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const openEdit = () => setIsEditOpen(true);
  const closeEdit = () => setIsEditOpen(false);
  const handleEditSuccess = () => {
    queryClient.invalidateQueries(['communityPosts']);
    queryClient.invalidateQueries(['myPosts']);
    closeEdit();
    toast({ title: 'Post updated', status: 'success' });
  };

  const handleDislike = () => {
    if (!localStorage.getItem('token')) {
      toast({ title: 'Login required', description: 'You need to login to dislike posts', status: 'warning' });
      return;
    }
    dislikeMutation.mutate(pid);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate();
    }
  };

  const handleViewDetail = () => {
    navigate(`/community/post/${pid}`);
  };

  const isOwner = String(post.userId ?? post.UserId) === String(userId);

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
          src={
            normalizeAvatar(post.profileImageUrl || post.user?.profileImageUrl || post.user?.avatar) ||
            normalizeAvatar('/Uploads/default-avatar.svg')
          }
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
              <MenuItem icon={<EditIcon />} onClick={openEdit}>Edit</MenuItem>
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

      <CreatePost isOpen={isEditOpen} onClose={closeEdit} onSuccess={handleEditSuccess} initialData={{
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.postType ? post.postType.toLowerCase() : 'general',
        mediaUrl: post.mediaUrl || post.MediaUrl || ''
      }} isEdit />

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
          <PostMedia src={post.mediaUrl} />
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
            {post.upvoteCount ?? post.UpvoteCount ?? post.upvote_count ?? 0}
          </Button>
          <Button
            leftIcon={<FaThumbsDown />}
            size="sm"
            variant="ghost"
            onClick={handleDislike}
            isLoading={dislikeMutation.isLoading}
          >
            {post.downvoteCount ?? post.DownvoteCount ?? 0}
          </Button>
          <Button
            leftIcon={<ChatIcon />}
            size="sm"
            variant="ghost"
            onClick={handleViewDetail}
          >
            {post.commentCount ?? post.CommentCount ?? post.comment_count ?? 0}
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

// Small component to safely render post media and hide broken images
function PostMedia({ src }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return null;
  const url = normalizeUrl(src);
  return (
    <Image
      src={url}
      alt="Post media"
      borderRadius="md"
      mb={3}
      maxH="200px"
      objectFit="cover"
      w="100%"
      onError={() => setBroken(true)}
    />
  );
}