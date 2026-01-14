import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Select,
  IconButton,
  Wrap,
  WrapItem,
  Tooltip,
} from '@chakra-ui/react';
import {
  FaBullhorn,
  FaPlus,
  FaClock,
  FaFire,
  FaExclamationTriangle,
  FaTrophy,
  FaCalendar,
} from 'react-icons/fa';

const fetchAnnouncements = async (clanId) => {
  const { data } = await api.get(`/clans/${clanId}/announcements`);
  return data?.announcements || [];
};

const EMOJI_OPTIONS = ['👍', '❤️', '🎉', '🔥', '👏', '💯', '✅', '⭐'];

const AnnouncementCard = ({ announcement, onReact, userRole }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentBg = useColorModeValue('purple.50', 'purple.900');

  const typeIcons = {
    General: FaBullhorn,
    Competition: FaTrophy,
    Deadline: FaClock,
    Important: FaExclamationTriangle,
    Event: FaCalendar,
  };

  const typeColors = {
    General: 'blue',
    Competition: 'purple',
    Deadline: 'orange',
    Important: 'red',
    Event: 'green',
  };

  const TypeIcon = typeIcons[announcement.type] || FaBullhorn;

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      borderLeftWidth={announcement.isPinned ? '4px' : '1px'}
      borderLeftColor={announcement.isPinned ? 'purple.500' : borderColor}
    >
      <CardBody>
        <VStack align="stretch" spacing={3}>
          {/* Header */}
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Avatar
                size="sm"
                name={announcement.userName}
                src={announcement.userProfileImage}
              />
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Text fontWeight="bold" fontSize="sm">
                    {announcement.userName}
                  </Text>
                  {announcement.userRole && (
                    <Badge colorScheme="purple" fontSize="xs">
                      {announcement.userRole}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {new Date(announcement.createdAt).toLocaleString()}
                </Text>
              </VStack>
            </HStack>
            <HStack>
              {announcement.isPinned && (
                <Badge colorScheme="purple">Pinned</Badge>
              )}
              <Badge colorScheme={typeColors[announcement.type]} fontSize="xs">
                <HStack spacing={1}>
                  <Icon as={TypeIcon} boxSize={3} />
                  <Text>{announcement.type}</Text>
                </HStack>
              </Badge>
            </HStack>
          </HStack>

          {/* Content */}
          <Box
            p={4}
            borderRadius="md"
            bg={announcement.type === 'Important' ? accentBg : 'transparent'}
          >
            <Text fontWeight="bold" fontSize="lg" mb={2}>
              {announcement.title}
            </Text>
            <Text whiteSpace="pre-wrap">{announcement.content}</Text>
          </Box>

          <Divider />

          {/* Reactions */}
          <HStack spacing={2} flexWrap="wrap">
            {announcement.reactions?.map((reaction, index) => (
              <Tooltip
                key={index}
                label={reaction.userNames.join(', ')}
                placement="top"
              >
                <Button
                  size="sm"
                  variant={announcement.myReaction === reaction.emoji ? 'solid' : 'outline'}
                  colorScheme={announcement.myReaction === reaction.emoji ? 'purple' : 'gray'}
                  onClick={() => onReact(announcement.id, reaction.emoji)}
                  leftIcon={<Text fontSize="lg">{reaction.emoji}</Text>}
                >
                  {reaction.count}
                </Button>
              </Tooltip>
            ))}
            
            {/* Add Reaction Dropdown */}
            <Wrap spacing={1}>
              {EMOJI_OPTIONS.filter(
                emoji => !announcement.reactions?.some(r => r.emoji === emoji)
              ).map((emoji) => (
                <WrapItem key={emoji}>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={<Text fontSize="lg">{emoji}</Text>}
                    onClick={() => onReact(announcement.id, emoji)}
                  />
                </WrapItem>
              ))}
            </Wrap>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const CreateAnnouncementModal = ({ isOpen, onClose, clanId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('General');
  const [isPinned, setIsPinned] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const createMutation = useMutation({
    mutationFn: (data) => api.post(`/clans/${clanId}/announcements`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clanAnnouncements', clanId]);
      toast({
        title: 'Announcement created',
        status: 'success',
        duration: 3000,
      });
      onClose();
      setTitle('');
      setContent('');
      setType('General');
      setIsPinned(false);
    },
    onError: (error) => {
      toast({
        title: 'Error creating announcement',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 4000,
      });
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Please fill all fields',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    createMutation.mutate({
      title,
      content,
      type,
      isPinned,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Announcement</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <Box w="100%">
              <Text fontWeight="bold" mb={2}>
                Type
              </Text>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="General">General</option>
                <option value="Competition">Competition</option>
                <option value="Deadline">Deadline</option>
                <option value="Important">Important</option>
                <option value="Event">Event</option>
              </Select>
            </Box>

            <Box w="100%">
              <Text fontWeight="bold" mb={2}>
                Title
              </Text>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title..."
                maxLength={200}
              />
            </Box>

            <Box w="100%">
              <Text fontWeight="bold" mb={2}>
                Content
              </Text>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Announcement content..."
                rows={6}
              />
            </Box>

            <HStack w="100%" justify="space-between">
              <Button
                variant={isPinned ? 'solid' : 'outline'}
                colorScheme="purple"
                size="sm"
                onClick={() => setIsPinned(!isPinned)}
              >
                📌 {isPinned ? 'Pinned' : 'Pin this'}
              </Button>
              <HStack>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="purple"
                  onClick={handleSubmit}
                  isLoading={createMutation.isLoading}
                >
                  Post Announcement
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const ClanAnnouncements = ({ userRole }) => {
  const { clanId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();
  const toast = useToast();
  const infoBg = useColorModeValue('blue.50', 'blue.900');

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['clanAnnouncements', clanId],
    queryFn: () => fetchAnnouncements(clanId),
  });

  const reactMutation = useMutation({
    mutationFn: ({ announcementId, emoji }) =>
      api.post(`/clans/${clanId}/announcements/${announcementId}/react`, { emoji }),
    onSuccess: () => {
      queryClient.invalidateQueries(['clanAnnouncements', clanId]);
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

  const handleReact = (announcementId, emoji) => {
    reactMutation.mutate({ announcementId, emoji });
  };

  const canPost = userRole === 'Leader' || userRole === 'CoLeader';

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <HStack>
          <Icon as={FaBullhorn} boxSize={6} color="purple.500" />
          <Text fontSize="2xl" fontWeight="bold">
            Announcements
          </Text>
        </HStack>
        {canPost && (
          <Button
            leftIcon={<FaPlus />}
            colorScheme="purple"
            onClick={onOpen}
          >
            New Announcement
          </Button>
        )}
      </HStack>

      {!canPost && (
        <Card bg={infoBg} mb={4}>
          <CardBody>
            <Text fontSize="sm" color="blue.700">
              📢 Only Leaders and Co-Leaders can post announcements
            </Text>
          </CardBody>
        </Card>
      )}

      <VStack spacing={4} align="stretch">
        {isLoading ? (
          <Text>Loading announcements...</Text>
        ) : announcements && announcements.length > 0 ? (
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onReact={handleReact}
              userRole={userRole}
            />
          ))
        ) : (
          <Card>
            <CardBody>
              <Text textAlign="center" color="gray.500">
                No announcements yet
              </Text>
            </CardBody>
          </Card>
        )}
      </VStack>

      <CreateAnnouncementModal
        isOpen={isOpen}
        onClose={onClose}
        clanId={clanId}
      />
    </Box>
  );
};

export default ClanAnnouncements;
