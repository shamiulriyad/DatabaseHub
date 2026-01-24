import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import api from '../../services/api';
import SearchFilterBar from '../../components/SearchFilterBar';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ price: 'all', difficulty: 'all', status: 'Pending' });
  const [teachers, setTeachers] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ title: '', shortDescription: '', fullDescription: '', thumbnailUrl: '' });
  const toast = useToast();

  useEffect(() => { fetchPending(); }, [filters]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const params = { page: 1, pageSize: 200, status: filters.status };
      if (searchQ) params.q = searchQ;
      if (filters.instructorId) params.teacherId = filters.instructorId;
      if (filters.universityId) params.universityId = filters.universityId;
      if (filters.price === 'free') params.price = 0;
      if (filters.price === 'paid') params.minPrice = 1;
      const res = await api.get('/courses', { params });
      // backend may return { success, courses } or { success, data: { items, totalCount } }
      const payload = res.data?.courses ?? res.data?.data ?? res.data ?? [];
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (payload?.items && Array.isArray(payload.items)) list = payload.items;
      else if (payload?.courses && Array.isArray(payload.courses)) list = payload.courses;
      else list = [];
      setCourses(list);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load courses', status: 'error' });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let mounted = true;
    api.get('/teachers?page=1&pageSize=500')
      .then(res => {
        const d = res.data?.data || res.data || [];
        if (mounted) setTeachers(Array.isArray(d) ? d : d.items || []);
      })
      .catch(() => setTeachers([]));
    api.get('/universities')
      .then(res => {
        const d = res.data?.data || res.data || [];
        if (mounted) setUniversities(Array.isArray(d) ? d : d.items || []);
      })
      .catch(() => setUniversities([]));
    return () => mounted = false;
  }, []);

  const handleApprove = async (course) => {
    try {
      await api.put(`/courses/${course.id}/status`, { Status: 'Approve' });
      toast({ title: 'Approved', description: 'Course approved and published', status: 'success' });
      fetchPending();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to approve', status: 'error' });
    }
  };

  const openReject = (course) => { setSelected(course); setRejectReason(''); setIsRejectModalOpen(true); };

  const handleReject = async () => {
    if (!selected) return;
    try {
      await api.put(`/courses/${selected.id}/status`, { Status: 'Reject', Reason: rejectReason });
      toast({ title: 'Rejected', description: 'Course rejected', status: 'success' });
      setIsRejectModalOpen(false);
      fetchPending();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to reject', status: 'error' });
    }
  };

  const openEdit = (course) => {
    setSelected(course);
    setEditData({ title: course.title, shortDescription: course.shortDescription, fullDescription: course.fullDescription || '', thumbnailUrl: course.thumbnailUrl || '' });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!selected) return;
    try {
      const payload = {
        Title: editData.title,
        ShortDescription: editData.shortDescription,
        FullDescription: editData.fullDescription,
        ThumbnailUrl: editData.thumbnailUrl
      };
      await api.put(`/courses/${selected.id}`, payload);
      toast({ title: 'Saved', description: 'Course updated', status: 'success' });
      setIsEditModalOpen(false);
      fetchPending();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save', status: 'error' });
    }
  };

  return (
    <Box minH="100vh">
      <Container maxW="6xl" py={6}>
        <Heading mb={4}>Course Management (Pending)</Heading>
        <SearchFilterBar value={''} onChange={() => {}} filters={filters} onFilterChange={(f) => { setFilters(f); }} onClear={() => setFilters({ price: 'all', difficulty: 'all', status: 'Pending' })} instructorOptions={teachers} statusOptions={["Pending","Published","Rejected","Draft"]} />

        <SearchFilterBar value={searchQ} onChange={setSearchQ} filters={filters} onFilterChange={(f) => { setFilters(f); }} onClear={() => { setFilters({ price: 'all', difficulty: 'all', status: 'Pending' }); setSearchQ(''); }} instructorOptions={teachers} statusOptions={["Pending","Published","Rejected","Draft"]} />

        {loading ? (
          <Spinner />
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>University</Th>
                <Th>Department</Th>
                <Th>Teacher</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {courses.map(c => (
                <Tr key={c.id}>
                  <Td>{c.title}</Td>
                  <Td>{c.universityName}</Td>
                  <Td>{c.departmentName}</Td>
                  <Td>{c.teacherName}</Td>
                  <Td>{c.status}</Td>
                  <Td>
                    <Button size="sm" mr={2} colorScheme="green" onClick={() => handleApprove(c)}>Approve</Button>
                    <Button size="sm" mr={2} colorScheme="red" onClick={() => openReject(c)}>Reject</Button>
                    <Button size="sm" onClick={() => openEdit(c)}>Edit</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {/* Reject Modal */}
        <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Reject Course</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Reason</FormLabel>
                <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
              <Button colorScheme="red" onClick={handleReject}>Reject</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Course</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb={3}>
                <FormLabel>Title</FormLabel>
                <Input value={editData.title} onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Short Description</FormLabel>
                <Input value={editData.shortDescription} onChange={(e) => setEditData(prev => ({ ...prev, shortDescription: e.target.value }))} />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Full Description</FormLabel>
                <Textarea value={editData.fullDescription} onChange={(e) => setEditData(prev => ({ ...prev, fullDescription: e.target.value }))} />
              </FormControl>
              <FormControl>
                <FormLabel>Thumbnail URL</FormLabel>
                <Input value={editData.thumbnailUrl} onChange={(e) => setEditData(prev => ({ ...prev, thumbnailUrl: e.target.value }))} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleEditSave}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default AdminCourses;
