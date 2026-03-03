import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, VStack, HStack, Avatar, Text, Spinner, Center, Heading } from '@chakra-ui/react';
import api from '../services/api';

export default function ClanMembers() {
  const { clanId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clanId) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    api
      .get(`/clans/${clanId}/members`)
      .then((res) => {
        if (!mounted) return;
        // backend returns { success, members }
        const payload = res?.data;
        const data = payload?.members ?? payload?.data ?? [];
        setMembers(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || 'Failed to load members');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [clanId]);

  if (loading) return (
    <Center py={10}><Spinner size="lg" /></Center>
  );

  if (error) return (
    <Box p={6}>
      <Heading size="md" mb={3}>Error</Heading>
      <Text color="red.500">{error}</Text>
    </Box>
  );

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Clan Members</Heading>
      <VStack spacing={3} align="stretch">
        {members.length === 0 && (
          <Text color="gray.500">No members found.</Text>
        )}

        {members.map((m) => (
          <HStack key={m.userId || m.id} p={3} borderRadius="md" _hover={{ bg: 'gray.50', cursor: 'pointer' }} onClick={() => navigate(`/profiles/${m.userId ?? m.id}`)}>
            <Avatar name={m.userName} src={m.avatarUrl || m.profileImageUrl} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="600">{m.userName || m.name || `User ${m.userId ?? m.id}`}</Text>
              <Text fontSize="sm" color="gray.500">{m.role || ''}</Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
