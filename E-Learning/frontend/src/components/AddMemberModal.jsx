import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';

// Modal: shows clan members not already in the team
export default function AddMemberModal({ isOpen, onClose, onAdd, team }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    if (!isOpen || !team) return;
    let mounted = true;
    // fetch clan members via teamService
    import('../api/teamService').then(mod => {
      return mod.teamService.getClanMembers(team.clanId);
    }).then(res => {
      if (!mounted) return;
      const members = res?.data || [];
      const existingIds = new Set((team.members || []).map(m => m.userId));
      const avail = members.filter(m => !existingIds.has(m.userId));
      setCandidates(avail);
      if (avail.length > 0) setSelectedUserId(avail[0].userId.toString());
    }).catch(() => {
      setCandidates([]);
    });
    return () => { mounted = false; };
  }, [isOpen, team]);

  const submit = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await onAdd(team.clanId, team.id, Number(selectedUserId));
      setSelectedUserId('');
      onClose();
    } catch (e) {
      // handled by caller
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Member to {team?.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Select Member</FormLabel>
            <Select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              {candidates.length === 0 && <option value="">No available members</option>}
              {candidates.map(m => (
                <option key={m.userId} value={m.userId}>{m.userName || `User ${m.userId}`}</option>
              ))}
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={submit} isLoading={loading} isDisabled={!selectedUserId}>Add</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
