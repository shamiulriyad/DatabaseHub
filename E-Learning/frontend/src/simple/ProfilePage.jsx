import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Text, Spinner, Center, Avatar, VStack } from '@chakra-ui/react';
import api from '../services/api';

export default function ProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    api.get(`/users/${userId}`)
      .then((res) => {
        if (!mounted) return;
        const payload = res?.data;
        // backend might return { user } or { data }
        const u = payload?.user ?? payload?.data ?? payload;
        setUser(u);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || 'Failed to load user');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [userId]);

  if (loading) return (
    <Center py={10}><Spinner size="lg" /></Center>
  );

  if (error) return (
    <Box p={6}>
      <Heading size="md" mb={3}>Error</Heading>
      <Text color="red.500">{error}</Text>
    </Box>
  );

  if (!user) return (
    <Box p={6}><Text>No user data</Text></Box>
  );

  return (
    <Box p={6}>
      <VStack spacing={4} align="start">
        <Avatar name={user.userName || user.name} src={user.avatarUrl || user.profileImageUrl} size="xl" />
        <Heading>{user.userName || user.name}</Heading>
        <Text>Email: {user.email || '—'}</Text>
        <Text>Role: {user.role || 'Member'}</Text>
      </VStack>
    </Box>
  );
}
