import React, { useEffect, useState } from 'react';
import { Box, Heading, Select, Button, Text } from '@chakra-ui/react';
import { competitionService } from '../api/competitionService';

export default function CompetitionRegistration({ teamId, onRegistered }) {
  const [competitions, setCompetitions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    competitionService
      .getCompetitions()
      .then(res => { if (mounted) setCompetitions(res?.data || []); })
      .catch(err => { if (mounted) setError(err.message || 'Failed to load'); });
    return () => { mounted = false; };
  }, []);

  const register = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await competitionService.registerTeam(Number(selected), Number(teamId));
      onRegistered && onRegistered();
    } catch (e) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box borderWidth={1} p={4} borderRadius='md'>
      <Heading size='sm' mb={3}>Register Team to Competition</Heading>
      {error && <Text color='red.500'>{error}</Text>}
      <Select placeholder='Select competition' onChange={e=>setSelected(e.target.value)}>
        {competitions.map(c => (
          <option key={c.id} value={c.id}>{c.title} ({c.status})</option>
        ))}
      </Select>
      <Button mt={3} colorScheme='blue' onClick={register} isLoading={loading}>Register</Button>
    </Box>
  );
}
