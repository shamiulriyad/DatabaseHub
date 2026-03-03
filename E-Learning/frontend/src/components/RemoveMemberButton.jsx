import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';

export default function RemoveMemberButton({ team, member, onRemove }) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await onRemove(team.clanId, team.id, member.userId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="xs" colorScheme="red" onClick={handle} isLoading={loading}>Remove</Button>
  );
}
