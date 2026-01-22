import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  IconButton,
  Textarea,
  useToast,
  Divider,
  Spinner,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Center,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { normalizeAvatar } from '../../utils/imageUtils';
import { TimeIcon, DeleteIcon, EditIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';

const Comments = ({ postId }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  // Fetch comments
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => communityAPI.getComments(postId),
    enabled: !!postId,
  });

  // Normalize the response: backend returns { success: true, comments: [...] }
  // but some API helpers may return the raw axios response. Ensure we always have an array.
  const comments = commentsData?.data?.comments ?? commentsData?.data ?? [];

  // Helper to resolve avatar from various possible fields present in comment objects
  const resolveAvatar = (comment) => {
    if (!comment) return normalizeAvatar('/Uploads/default-avatar.svg');
    const candidates = [
      // common camelCase
      comment.user?.avatar,
      comment.user?.profileImageUrl,
      comment.profileImageUrl,
      comment.profileImage,
      comment.profile_image,
      comment.userImageUrl,
      comment.userImage,
      comment.avatarUrl,
      comment.avatar,
      comment.user?.imageUrl,
      comment.user?.image,
      // PascalCase / legacy
      comment.ProfileImageUrl,
      comment.ProfileImage,
      comment.Profile_image,
      comment.Avatar,
      comment.UserImageUrl,
      comment.UserImage,
      // nested PascalCase
      comment.user?.ProfileImageUrl,
      comment.user?.ProfileImage,
      comment.user?.Avatar,
      comment.user?.ImageUrl,
      comment.user?.Image,
    ];
    for (const c of candidates) {
      const url = normalizeAvatar(c);
      if (url) return url;
    }
    return normalizeAvatar('/Uploads/default-avatar.svg');
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (commentId) => communityAPI.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['post', postId]);
      toast({
        title: 'Comment deleted',
        status: 'success',
      });
    },
  });

  // Upvote / Downvote mutations
  const upvoteMutation = useMutation({
    mutationFn: (commentId) => communityAPI.upvoteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['post', postId]);
    }
  });

  const downvoteMutation = useMutation({
    mutationFn: (commentId) => communityAPI.downvoteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['post', postId]);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }) => 
      communityAPI.updateComment(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      setEditingComment(null);
      setEditText('');
      toast({
        title: 'Comment updated',
        status: 'success',
      });
    },
  });

  const handleDelete = (commentId) => {
    if (window.confirm('Delete this comment?')) {
      deleteMutation.mutate(commentId);
    }
  };

  const handleEdit = (comment) => {
    const cid = comment._id ?? comment.id ?? comment.Id ?? String(comment.Id ?? comment.id ?? comment._id ?? Math.random());
    setEditingComment(cid);
    setEditText(comment.content);
  };

  const handleUpdate = (commentId) => {
    if (!editText.trim()) return;
    updateMutation.mutate({ commentId, content: editText });
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner />
      </Center>
    );
  }

  return (
    <Box bg="white" borderRadius="lg" shadow="md" p={6}>
      <Text fontSize="xl" fontWeight="bold" mb={6}>
        Comments ({comments.length})
      </Text>

      {comments.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={8}>
          No comments yet. Be the first to comment!
        </Text>
      ) : (
        <VStack spacing={4} align="stretch" divider={<Divider />}>
          {comments.map((comment) => {
            const cid = comment._id ?? comment.id ?? comment.Id ?? String(comment.Id ?? comment.id ?? comment._id ?? Math.random());
            return (
              <CommentItem
                key={cid}
                comment={comment}
                commentId={cid}
                userId={userId}
                isEditing={editingComment === cid}
                editText={editText}
                onEditTextChange={setEditText}
                onEdit={handleEdit}
                onUpdate={handleUpdate}
                onCancelEdit={handleCancelEdit}
                onDelete={handleDelete}
                navigate={navigate}
                resolveAvatar={resolveAvatar}
                upvoteMutation={upvoteMutation}
                downvoteMutation={downvoteMutation}
              />
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

const CommentItem = ({
  comment,
  commentId,
  userId,
  isEditing,
  editText,
  onEditTextChange,
  onEdit,
  onUpdate,
  onCancelEdit,
  onDelete,
  navigate,
  resolveAvatar,
  upvoteMutation,
  downvoteMutation,
}) => {
  const isOwner = String(comment.userId) === String(userId);
  const hasUpvoted = Boolean(comment.HasUpvoted ?? comment.hasUpvoted ?? false);
  const hasDownvoted = Boolean(comment.HasDownvoted ?? comment.hasDownvoted ?? false);
  
  return (
    <Box>
      <Flex align="start">
        <Avatar
          size="sm"
          name={comment.user?.name ?? comment.userName ?? comment.UserName}
          src={resolveAvatar(comment)}
          mr={3}
          cursor="pointer"
          onClick={() => navigate && navigate(`/user/${comment.userId}`)}
        />
        
        <Box flex={1}>
          <Flex align="center" mb={2}>
            <Text fontWeight="bold" mr={2} cursor="pointer" onClick={() => navigate && navigate(`/user/${comment.userId}`)}>
              {comment.user?.name ?? comment.userName ?? comment.UserName}
            </Text>
            <Text fontSize="sm" color="gray.500">
              <TimeIcon mr={1} />
              {new Date(comment.createdAt ?? comment.CreatedAt).toLocaleDateString()}
            </Text>
            
            {isOwner && (
              <Menu ml="auto">
                <MenuButton
                  as={IconButton}
                  icon={<ChevronDownIcon />}
                  size="xs"
                  variant="ghost"
                />
                <MenuList>
                  <MenuItem icon={<EditIcon />} onClick={() => onEdit(comment)}>
                    Edit
                  </MenuItem>
                  <MenuItem
                    icon={<DeleteIcon />}
                    color="red.500"
                    onClick={() => onDelete(commentId)}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </Flex>

          {isEditing ? (
            <Box mb={3}>
              <Textarea
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                mb={2}
              />
              <HStack>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => onUpdate(commentId)}
                >
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                  Cancel
                </Button>
              </HStack>
            </Box>
          ) : (
            <Box>
              <Text whiteSpace="pre-line">{comment.content}</Text>
              <HStack mt={2} spacing={4}>
                <Button size="sm" variant="ghost" onClick={() => upvoteMutation.mutate(commentId)}>
                  👍 {comment.upvoteCount ?? comment.UpvoteCount ?? comment.Upvotes ?? 0}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => downvoteMutation.mutate(commentId)}>
                  👎 {comment.downvoteCount ?? comment.DownvoteCount ?? 0}
                </Button>
              </HStack>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default Comments;