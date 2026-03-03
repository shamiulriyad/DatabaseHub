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

// ── Avatar resolver ──────────────────────────────────────────────────────────
const resolveAvatar = (comment) => {
  if (!comment) return normalizeAvatar('/Uploads/default-avatar.svg');
  const candidates = [
    comment.user?.avatar, comment.user?.profileImageUrl, comment.profileImageUrl,
    comment.profileImage, comment.profile_image, comment.userImageUrl,
    comment.avatarUrl, comment.avatar, comment.user?.imageUrl,
    comment.ProfileImageUrl, comment.ProfileImage, comment.Avatar,
    comment.user?.ProfileImageUrl, comment.user?.ProfileImage, comment.user?.Avatar,
  ];
  for (const c of candidates) {
    const url = normalizeAvatar(c);
    if (url) return url;
  }
  return normalizeAvatar('/Uploads/default-avatar.svg');
};

// BUG FIX: resolveAvatar was defined inside Comments component, causing it to be
// re-created on every render and passed as a new prop reference to every CommentItem,
// forcing unnecessary re-renders. Moved outside as a pure function.

// ── Comments (parent) ────────────────────────────────────────────────────────
const Comments = ({ postId }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  // ── Fetch ──────────────────────────────────────────────────────────────
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => communityAPI.getComments(postId),
    enabled: !!postId,
  });

  // BUG FIX: normalization was not handling the case where commentsData is a plain array
  const raw = commentsData?.data?.comments ?? commentsData?.data ?? commentsData;
  const comments = Array.isArray(raw) ? raw : [];

  const invalidate = () => {
    queryClient.invalidateQueries(['comments', postId]);
    queryClient.invalidateQueries(['post', postId]);
  };

  // ── Mutations ──────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (commentId) => communityAPI.deleteComment(commentId),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Comment deleted', status: 'success', duration: 2000 });
    },
    onError: () => toast({ title: 'Failed to delete comment', status: 'error', duration: 2000 }),
  });

  const upvoteMutation = useMutation({
    mutationFn: (commentId) => communityAPI.upvoteComment(commentId),
    onSuccess: invalidate,
  });

  const downvoteMutation = useMutation({
    mutationFn: (commentId) => communityAPI.downvoteComment(commentId),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }) => communityAPI.updateComment(commentId, { content }),
    onSuccess: () => {
      invalidate();
      setEditingComment(null);
      setEditText('');
      toast({ title: 'Comment updated', status: 'success', duration: 2000 });
    },
    onError: () => toast({ title: 'Failed to update comment', status: 'error', duration: 2000 }),
  });

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleEdit = (comment) => {
    // BUG FIX: was calling Math.random() as a fallback ID — this generates a NEW id
    // every call, so editingComment would never match the comment's real id.
    // Use a stable fallback (index isn't available here, so just use the best known field)
    const cid = comment._id ?? comment.id ?? comment.Id ?? comment.commentId;
    setEditingComment(cid);
    setEditText(comment.content ?? comment.Content ?? '');
  };

  const handleUpdate = (commentId) => {
    if (!editText.trim()) return;
    updateMutation.mutate({ commentId, content: editText });
  };

  const handleDelete = (commentId) => {
    if (window.confirm('Delete this comment?')) deleteMutation.mutate(commentId);
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Center py={8}>
        <VStack spacing={2}>
          <Spinner size="md" color="purple.400" thickness="3px" />
          <Text fontSize="sm" color="whiteAlpha.400">Loading comments...</Text>
        </VStack>
      </Center>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <Box
      borderRadius="2xl"
      bg="rgba(255,255,255,0.04)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      backdropFilter="blur(12px)"
      boxShadow="0 8px 40px rgba(0,0,0,0.3)"
      p={6}
    >
      <Text fontSize="lg" fontWeight="bold" color="white" mb={6}>
        💬 Comments{' '}
        <Text as="span" color="whiteAlpha.400" fontWeight="normal" fontSize="md">
          ({comments.length})
        </Text>
      </Text>

      {comments.length === 0 ? (
        <Center py={10}>
          <VStack spacing={2}>
            <Text fontSize="2xl">🗨️</Text>
            <Text color="whiteAlpha.400" fontSize="sm">
              No comments yet. Be the first to comment!
            </Text>
          </VStack>
        </Center>
      ) : (
        <VStack spacing={0} align="stretch">
          {comments.map((comment, index) => {
            // BUG FIX: Math.random() as key — replaced with stable id
            const cid = comment._id ?? comment.id ?? comment.Id ?? comment.commentId ?? `comment-${index}`;
            return (
              <React.Fragment key={cid}>
                <CommentItem
                  comment={comment}
                  commentId={cid}
                  userId={userId}
                  isEditing={editingComment === cid}
                  editText={editText}
                  onEditTextChange={setEditText}
                  onEdit={handleEdit}
                  onUpdate={handleUpdate}
                  onCancelEdit={() => { setEditingComment(null); setEditText(''); }}
                  onDelete={handleDelete}
                  navigate={navigate}
                  upvoteMutation={upvoteMutation}
                  downvoteMutation={downvoteMutation}
                  isUpdateLoading={updateMutation.isLoading}
                />
                {index < comments.length - 1 && (
                  <Divider borderColor="whiteAlpha.100" my={4} />
                )}
              </React.Fragment>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

// ── CommentItem ──────────────────────────────────────────────────────────────
const CommentItem = ({
  comment, commentId, userId, isEditing, editText,
  onEditTextChange, onEdit, onUpdate, onCancelEdit,
  onDelete, navigate, upvoteMutation, downvoteMutation, isUpdateLoading,
}) => {
  const isOwner = String(comment.userId ?? comment.UserId) === String(userId);
  const upvoteCount = comment.upvoteCount ?? comment.UpvoteCount ?? comment.Upvotes ?? 0;
  const downvoteCount = comment.downvoteCount ?? comment.DownvoteCount ?? 0;
  const authorName = comment.user?.name ?? comment.userName ?? comment.UserName ?? 'Anonymous';
  const createdAt = comment.createdAt ?? comment.CreatedAt;

  return (
    <Box>
      <Flex align="start">
        {/* Avatar */}
        <Avatar
          size="sm"
          name={authorName}
          src={resolveAvatar(comment)}
          mr={3}
          flexShrink={0}
          cursor="pointer"
          ring={1}
          ringColor="purple.700"
          onClick={() => navigate?.(`/user/${comment.userId ?? comment.UserId}`)}
        />

        <Box flex={1} minW={0}>
          {/* Author row */}
          <Flex align="center" mb={2} wrap="wrap" gap={2}>
            <Text
              fontWeight="bold"
              fontSize="sm"
              color="white"
              cursor="pointer"
              _hover={{ color: 'purple.300' }}
              transition="color 0.15s"
              onClick={() => navigate?.(`/user/${comment.userId ?? comment.UserId}`)}
            >
              {authorName}
            </Text>
            <HStack spacing={1}>
              <TimeIcon boxSize={3} color="whiteAlpha.300" />
              <Text fontSize="xs" color="whiteAlpha.400">
                {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
              </Text>
            </HStack>

            {isOwner && (
              // BUG FIX: <Menu ml="auto"> — ml prop is not valid on Menu component,
              // it was being ignored. Wrapped in a Flex spacer instead.
              <Box ml="auto">
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<ChevronDownIcon />}
                    size="xs"
                    variant="ghost"
                    color="whiteAlpha.400"
                    _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                  />
                  <MenuList
                    bg="#1a1a2e"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                    boxShadow="0 8px 32px rgba(0,0,0,0.4)"
                    minW="130px"
                  >
                    <MenuItem
                      icon={<EditIcon />}
                      onClick={() => onEdit(comment)}
                      bg="transparent"
                      color="whiteAlpha.700"
                      _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      icon={<DeleteIcon />}
                      onClick={() => onDelete(commentId)}
                      bg="transparent"
                      color="red.400"
                      _hover={{ bg: 'rgba(254,178,178,0.08)', color: 'red.300' }}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            )}
          </Flex>

          {/* Edit mode */}
          {isEditing ? (
            <Box mb={3}>
              <Textarea
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                mb={3}
                rows={3}
                bg="rgba(255,255,255,0.04)"
                border="1px solid"
                borderColor="whiteAlpha.100"
                color="white"
                _placeholder={{ color: 'whiteAlpha.300' }}
                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                borderRadius="xl"
                resize="vertical"
              />
              <HStack>
                <Button
                  size="sm"
                  borderRadius="lg"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="white"
                  fontWeight="bold"
                  _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)' }}
                  onClick={() => onUpdate(commentId)}
                  isLoading={isUpdateLoading}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  color="whiteAlpha.500"
                  _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                  borderRadius="lg"
                  onClick={onCancelEdit}
                >
                  Cancel
                </Button>
              </HStack>
            </Box>
          ) : (
            <Box>
              <Text fontSize="sm" color="whiteAlpha.700" whiteSpace="pre-line" lineHeight="1.7">
                {comment.content ?? comment.Content}
              </Text>
              <HStack mt={3} spacing={2}>
                <Button
                  size="xs"
                  variant="ghost"
                  color="whiteAlpha.500"
                  borderRadius="lg"
                  _hover={{ bg: 'rgba(255,255,255,0.06)', color: 'white' }}
                  onClick={() => upvoteMutation.mutate(commentId)}
                  isLoading={upvoteMutation.isLoading}
                >
                  👍 {upvoteCount}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  color="whiteAlpha.500"
                  borderRadius="lg"
                  _hover={{ bg: 'rgba(255,255,255,0.06)', color: 'white' }}
                  onClick={() => downvoteMutation.mutate(commentId)}
                  isLoading={downvoteMutation.isLoading}
                >
                  👎 {downvoteCount}
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