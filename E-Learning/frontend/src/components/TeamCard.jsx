import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Heading, Text, Button, HStack, VStack } from '@chakra-ui/react';
import RemoveMemberButton from './RemoveMemberButton';

export default function TeamCard({ team, onAddMember, onRemoveMember, isLeader }) {
  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <HStack justify="space-between">
        <Heading size="sm">{team.name}</Heading>
        {isLeader && (
          <Button size="sm" onClick={() => onAddMember(team)}>Add member</Button>
        )}
      </HStack>

      <VStack align="start" mt={3} spacing={2}>
        {team.members && team.members.length > 0 ? (
          team.members.map(m => (
            <HStack key={m.userId} spacing={3}>
              <Text>
                <Link to={`/profile/${m.userId}`} style={{ color: 'inherit' }}>
                  {m.userName || `User ${m.userId}`}
                </Link>
              </Text>
              {isLeader && (
                <RemoveMemberButton team={team} member={m} onRemove={onRemoveMember} />
              )}
            </HStack>
          ))
        ) : (
          <Text>No members</Text>
        )}
      </VStack>
    </Box>
  );
}
