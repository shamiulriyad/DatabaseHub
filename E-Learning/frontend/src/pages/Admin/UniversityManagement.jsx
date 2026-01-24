import React, { useState } from 'react';
import { Box, Heading, FormControl, FormLabel, Input, Button, useToast } from '@chakra-ui/react';
import api from '../../services/api';

const UniversityManagement = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleFile = (e) => setBannerFile(e.target.files[0]);

  const addDepartment = () => setDepartments(prev => ([...prev, { name: '', code: '', description: '', type: 'General' }]));
  const removeDepartment = (idx) => setDepartments(prev => prev.filter((_, i) => i !== idx));
  const updateDepartment = (idx, key, value) => setDepartments(prev => prev.map((d, i) => i === idx ? ({ ...d, [key]: value }) : d));
  const updateDepartmentFile = (idx, file) => setDepartments(prev => prev.map((d, i) => i === idx ? ({ ...d, bannerFile: file }) : d));

  const handleCreate = async () => {
    if (!name.trim() || !code.trim()) {
      toast({ title: 'Validation', description: 'Name and Code are required', status: 'warning' });
      return;
    }
    setLoading(true);
    try {
      let bannerUrl = null;
      if (bannerFile) {
        const fd = new FormData();
        fd.append('file', bannerFile);
        const up = await api.post('/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        bannerUrl = up.data?.url || up.data?.data?.url || up.data?.fileUrl || null;
      }

      const payload = { name, code, bannerUrl };
      const res = await api.post('/universities', payload);
      const created = res.data?.data || res.data;
      const uniId = created?.id ?? created?.Id ?? null;
      if (res.data?.success && uniId) {
        // create departments if any provided
        if (departments && departments.length > 0) {
              for (const d of departments) {
            try {
              let banner = null;
              if (d.bannerFile) {
                try {
                  const ffd = new FormData();
                  ffd.append('file', d.bannerFile);
                  const up = await api.post('/uploads/image', ffd, { headers: { 'Content-Type': 'multipart/form-data' } });
                  banner = up.data?.url || up.data?.data?.url || up.data?.fileUrl || null;
                } catch (err) {
                  console.error('Failed to upload department banner', err);
                }
              }

              // Create a department request instead of direct creation
              const reqPayload = {
                universityId: uniId,
                departmentName: d.name,
                shortCode: d.code,
                note: d.description || ''
              };
              await api.post('/departmentrequests', reqPayload);
            } catch (err) {
              console.error('Failed to create department', d, err);
            }
          }
        }

        toast({ title: 'Created', description: 'University and departments created', status: 'success' });
        setName(''); setCode(''); setBannerFile(null); setDepartments([]);
      } else {
        toast({ title: 'Error', description: res.data?.message || 'Failed to create', status: 'error' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: err.response?.data?.message || err.message, status: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Box p={6} maxW="800px">
      <Heading size="lg" mb={4}>Manage Universities</Heading>
      <FormControl mb={3}>
        <FormLabel>Name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="University name" />
      </FormControl>
      <FormControl mb={3}>
        <FormLabel>Code</FormLabel>
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Short code e.g. MIT" />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Banner (optional)</FormLabel>
        <Input type="file" accept="image/*" onChange={handleFile} />
      </FormControl>
      <Box mb={4}>
        <Heading size="sm" mb={2}>Departments (optional)</Heading>
        {departments.map((d, idx) => (
          <Box key={idx} mb={3} p={3} borderWidth="1px" borderRadius="md">
            <FormControl mb={2}>
              <FormLabel>Department Name</FormLabel>
              <Input value={d.name} onChange={(e) => updateDepartment(idx, 'name', e.target.value)} placeholder="e.g. Computer Science" />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Code</FormLabel>
              <Input value={d.code} onChange={(e) => updateDepartment(idx, 'code', e.target.value)} placeholder="e.g. CSE" />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Description</FormLabel>
              <Input value={d.description} onChange={(e) => updateDepartment(idx, 'description', e.target.value)} placeholder="Short description (optional)" />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Banner (optional)</FormLabel>
              <Input type="file" accept="image/*" onChange={(e) => updateDepartmentFile(idx, e.target.files[0])} />
            </FormControl>
            <Button size="sm" colorScheme="red" onClick={() => removeDepartment(idx)}>Remove</Button>
          </Box>
        ))}
        <Button mt={2} onClick={addDepartment}>Add Department</Button>
      </Box>
      <Button colorScheme="purple" onClick={handleCreate} isLoading={loading}>Create University</Button>
    </Box>
  );
};

export default UniversityManagement;
