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
import { FaHeart, FaRegHeart, FaThumbsDown } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import Comments from './Comments';
import { normalizeAvatar, normalizeUrl } from '../../utils/imageUtils';
import CreatePost from './CreatePost';

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

  // Extract actual post object from axios response shape: { success, post }
  const post = postData?.data?.post ?? postData?.data;

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

  const dislikeMutation = useMutation({
    mutationFn: () => communityAPI.dislikePost(postId),
    onMutate: () => {
      // optimistic
      queryClient.invalidateQueries(['post', postId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['post', postId]);
    }
  });

  // Edit modal state and delete mutation need to be declared unconditionally
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const openEdit = () => setIsEditOpen(true);
  const closeEdit = () => setIsEditOpen(false);

  const deleteMutation = useMutation({
    mutationFn: () => communityAPI.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(['communityPosts']);
      queryClient.invalidateQueries(['myPosts']);
      toast({ title: 'Post deleted', status: 'success' });
      navigate('/community/posts');
    },
    onError: () => {
      toast({ title: 'Failed to delete post', status: 'error' });
    }
  });

  const handleDelete = () => {
    if (!window.confirm('Delete this post?')) return;
    deleteMutation.mutate();
  };

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (commentData) => 
      communityAPI.addComment(postId, commentData),
    onSuccess: (data) => {
      try {
        const resp = data?.data ?? data; // axios response or direct
        const newComment = resp?.comment ?? resp?.data ?? resp;
        if (newComment) {
          queryClient.setQueryData(['comments', postId], (old) => {
            let arr = [];
            if (Array.isArray(old)) arr = old;
            else if (old?.data?.comments) arr = old.data.comments;
            else if (old?.data) arr = old.data;
            else if (old?.comments) arr = old.comments;
            else arr = Array.isArray(old) ? old : [];
            return [...arr, newComment];
          });
        }
      } catch (e) {
        queryClient.invalidateQueries(['comments', postId]);
      }
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

  const isLiked = post.HasUpvoted ?? post.hasUpvoted ?? (Array.isArray(post.likes) ? post.likes.includes(userId) : false);
  const isOwner = String(post.userId ?? post.UserId) === String(userId);


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
                      name={post.user?.name ?? post.userName ?? post.user?.username}
                      src={
                        // Try several possible locations for avatar/profile image
                        normalizeAvatar(
                          post.user?.avatar || post.user?.profileImageUrl || post.profileImageUrl || post.profileImage || post.user?.ProfileImageUrl || post.user?.Avatar
                        ) || normalizeAvatar('/Uploads/default-avatar.svg')
                      }
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
              src={normalizeUrl(post.mediaUrl)}
              alt="Post media"
              borderRadius="md"
              mb={6}
              maxH="400px"
              objectFit="contain"
              w="100%"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                {(post.UpvoteCount ?? post.upvoteCount ?? post.Upvotes ?? (post.likes?.length ?? 0))} Likes
              </Button>
              <Button
                leftIcon={<FaThumbsDown />}
                variant="ghost"
                onClick={() => {
                  if (!userId) { toast({ title: 'Please login', description: 'You need to login to dislike posts', status: 'warning' }); return; }
                  dislikeMutation.mutate();
                }}
                isLoading={dislikeMutation.isLoading}
              >
                {(post.DownvoteCount ?? post.downvoteCount ?? 0)} Dislikes
              </Button>
              <Text color="gray.600">
                {(post.CommentCount ?? post.commentCount ?? post.Comments?.length ?? post.comments?.length ?? 0)} Comments
              </Text>
            </HStack>
            {isOwner && (
              <HStack spacing={3}>
                <Button size="sm" variant="outline" onClick={openEdit} leftIcon={<EditIcon />}>Edit</Button>
                <Button size="sm" variant="ghost" colorScheme="red" onClick={handleDelete} leftIcon={<DeleteIcon />}>Delete</Button>
              </HStack>
            )}
          </Flex>

          <CreatePost isOpen={isEditOpen} onClose={closeEdit} onSuccess={() => { queryClient.invalidateQueries(['post', postId]); closeEdit(); toast({ title: 'Post updated', status: 'success' }); }} initialData={{
            id: post.Id ?? post.id ?? post.postId ?? postId,
            title: post.title ?? post.Title,
            content: post.content ?? post.Content,
            category: post.postType ?? post.PostType,
            mediaUrl: post.mediaUrl ?? post.MediaUrl
          }} isEdit />

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