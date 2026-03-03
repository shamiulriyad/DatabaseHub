import React, { useEffect, useState } from 'react';
import { Box, Grid, Button, Spinner, Text, Center } from '@chakra-ui/react';
import { teamService } from '../api/teamService';
import TeamCard from '../components/TeamCard';
import CreateTeamModal from '../components/CreateTeamModal';
import AddMemberModal from '../components/AddMemberModal';
import CompetitionRegistration from '../components/CompetitionRegistration';
import { useNotification } from '../hooks/useNotification';

export default function TeamsPage({ clanId, clan, currentUser }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const notify = useNotification();
  const [clanMembers, setClanMembers] = useState([]);

  // Determine leadership strictly from `currentUser` and `clan`
  // Use string coercion to avoid number/string mismatches from the API
  const isLeader = Boolean(
    currentUser && clan && String(currentUser.id) === String(clan.leaderId)
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await teamService.getClanTeams(clanId);
      setTeams(res?.data || []);
      const memRes = await teamService.getClanMembers(clanId);
      setClanMembers(memRes?.data || []);
    } catch (e) {
      notify.addNotification(e.message || 'Failed to load teams', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ if (clanId) load(); }, [clanId]);

  const handleCreate = async (clanIdArg, name) => {
    try {
      await teamService.createTeam(clanIdArg, name);
      notify.addNotification('Team created', 'success');
      await load();
    } catch (e) {
      notify.addNotification(e.message || 'Create failed', 'error');
      throw e;
    }
  };

  const handleAdd = async (clanIdArg, teamId, userId) => {
    try {
      await teamService.addMember(clanIdArg, teamId, userId);
      notify.addNotification('Member added', 'success');
      await load();
    } catch (e) {
      notify.addNotification(e.message || 'Add failed', 'error');
      throw e;
    }
  };

  const handleRemove = async (clanIdArg, teamId, userId) => {
    try {
      await teamService.removeMember(clanIdArg, teamId, userId);
      notify.addNotification('Member removed', 'success');
      await load();
    } catch (e) {
      notify.addNotification(e.message || 'Remove failed', 'error');
      throw e;
    }
  };

  return (
    <Box p={4}>
      <Box mb={4} display='flex' justifyContent='space-between' alignItems='center'>
        <Text fontSize='xl'>Teams</Text>
        {!loading && isLeader && (
          <Button onClick={()=>setCreateOpen(true)}>Create Team</Button>
        )}
      </Box>

      {loading ? (
        <Center py={8}><Spinner /></Center>
      ) : (
        <Grid templateColumns='repeat(3, 1fr)' gap={4}>
          {teams.map(t => (
            <TeamCard key={t.id} team={t} isLeader={isLeader}
              onAddMember={(team)=>{ setSelectedTeam(team); setAddOpen(true); }}
              onRemoveMember={handleRemove} />
          ))}
        </Grid>
      )}

      {isLeader && (
        <CreateTeamModal isOpen={createOpen} onClose={()=>setCreateOpen(false)} onCreate={handleCreate} clanId={clanId} />
      )}

      {isLeader && (
        <AddMemberModal isOpen={addOpen} onClose={()=>setAddOpen(false)} onAdd={handleAdd} team={selectedTeam} />
      )}

      <Box mt={6}>
        <CompetitionRegistration teamId={teams[0]?.id} onRegistered={load} />
      </Box>
    </Box>
  );
}
