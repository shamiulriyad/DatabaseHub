import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Button,
  Divider,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FaBell } from 'react-icons/fa';

const fetchNotifications = async () => {
  try {
    const { data } = await api.get('/notifications', {
      params: {
        unreadOnly: true,
        pageSize: 10
      }
    });
    return data?.notifications || [];
  } catch (error) {
    console.warn('Failed to fetch notifications:', error.response?.status, error.message);
    return [];
  }
};

const fetchUnreadCount = async () => {
  try {
    const { data } = await api.get('/notifications/count');
    return data?.count || 0;
  } catch (error) {
    console.warn('Failed to fetch unread count:', error.response?.status, error.message);
    return 0;
  }
};

const NotificationItem = ({ notification, onRead }) => {
  const navigate = useNavigate();
  const itemBg = useColorModeValue('gray.50', 'gray.700');

  const handleClick = () => {
    onRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const typeColors = {
    NewAnnouncement: 'purple',
    JoinRequestAccepted: 'green',
    JoinRequestRejected: 'red',
    RoleChanged: 'blue',
    NewPost: 'cyan',
    NewComment: 'orange',
  };

  return (
    <Box
      p={3}
      bg={notification.isRead ? 'transparent' : itemBg}
      borderRadius="md"
      cursor="pointer"
      onClick={handleClick}
      _hover={{ bg: itemBg }}
      transition="all 0.2s"
    >
      <HStack spacing={3} align="start">
        {notification.fromUserImage ? (
          <Avatar
            size="sm"
            name={notification.fromUserName}
            src={notification.fromUserImage}
          />
        ) : (
          <Box
            w="40px"
            h="40px"
            borderRadius="full"
            bg={`${typeColors[notification.type] || 'gray'}.500`}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontSize="lg"
          >
            <FaBell />
          </Box>
        )}
        <VStack align="start" spacing={0} flex={1}>
          <Text fontWeight="bold" fontSize="sm">
            {notification.title}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {notification.message}
          </Text>
          {notification.clanName && (
            <Badge colorScheme="purple" fontSize="xs" mt={1}>
              {notification.clanName}
            </Badge>
          )}
          <Text fontSize="xs" color="gray.500" mt={1}>
            {new Date(notification.createdAt).toLocaleString()}
          </Text>
        </VStack>
        {!notification.isRead && (
          <Box w="8px" h="8px" borderRadius="full" bg="blue.500" />
        )}
      </HStack>
    </Box>
  );
};

const NotificationBell = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
    enabled: !!user, // Only fetch if user is authenticated
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notificationCount'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30000,
    enabled: !!user, // Only fetch if user is authenticated
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) =>
      api.put(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationCount']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationCount']);
      toast({
        title: 'All notifications marked as read',
        status: 'success',
        duration: 2000,
      });
    },
  });

  const handleRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            icon={<FaBell />}
            variant="ghost"
            aria-label="Notifications"
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="0"
              right="0"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              px={2}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="400px">
        <PopoverHeader>
          <HStack justify="space-between">
            <Text fontWeight="bold">Notifications</Text>
            {unreadCount > 0 && (
              <Button
                size="xs"
                variant="ghost"
                colorScheme="blue"
                onClick={handleMarkAllAsRead}
                isLoading={markAllAsReadMutation.isLoading}
              >
                Mark all as read
              </Button>
            )}
          </HStack>
        </PopoverHeader>
        <PopoverBody p={0} maxH="400px" overflowY="auto">
          {notifications.length > 0 ? (
            <VStack spacing={0} align="stretch" divider={<Divider />}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleRead}
                />
              ))}
            </VStack>
          ) : (
            <Box p={4} textAlign="center">
              <Text color="gray.500">No new notifications</Text>
            </Box>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
