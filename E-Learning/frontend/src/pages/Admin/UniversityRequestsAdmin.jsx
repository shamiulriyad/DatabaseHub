import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Spinner, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Textarea, useDisclosure
} from '@chakra-ui/react';
import api from '../../services/api';

const UniversityRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/university-requests');
      const data = res.data?.data || res.data || [];
      setRequests(Array.isArray(data) ? data : data.items ?? []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: err.response?.data?.message || err.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/admin/university-requests/${id}/approve`);
      toast({ title: 'Approved', status: 'success' });
      setRequests(prev => prev.filter(r => r.id !== id && r.Id !== id));
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: err.response?.data?.message || err.message, status: 'error' });
    } finally { setActionLoading(null); }
  };

  const openReject = (req) => {
    setSelected(req);
    setNote('');
    onOpen();
  };

  const handleReject = async () => {
    if (!selected) return;
    const id = selected.id ?? selected.Id;
    setActionLoading(id);
    try {
      await api.post(`/admin/university-requests/${id}/reject`, { note });
      toast({ title: 'Rejected', status: 'info' });
      setRequests(prev => prev.filter(r => (r.id ?? r.Id) !== id));
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: err.response?.data?.message || err.message, status: 'error' });
    } finally { setActionLoading(null); }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>University Requests</Heading>
      {loading ? <Spinner /> : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Code</Th>
              <Th>Requested By</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.map(r => (
              <Tr key={r.id ?? r.Id}>
                <Td>{r.id ?? r.Id}</Td>
                <Td>{r.name ?? r.Name}</Td>
                <Td>{r.code ?? r.Code}</Td>
                <Td>{r.requestedBy ?? r.RequestedBy}</Td>
                <Td>{new Date(r.createdAt ?? r.CreatedAt).toLocaleString()}</Td>
                <Td>
                  <Button size="sm" colorScheme="green" mr={2} isLoading={actionLoading === (r.id ?? r.Id)} onClick={() => handleApprove(r.id ?? r.Id)}>Approve</Button>
                  <Button size="sm" colorScheme="red" onClick={() => openReject(r)}>Reject</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject University Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea placeholder="Optional rejection note" value={note} onChange={(e) => setNote(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" onClick={handleReject} isLoading={!!actionLoading}>Reject</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UniversityRequestsAdmin;
