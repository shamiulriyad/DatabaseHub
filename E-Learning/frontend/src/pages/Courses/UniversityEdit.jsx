import React, { useEffect, useState } from 'react';
import { Box, Heading, FormControl, FormLabel, Input, Textarea, Button, Stack, useToast, Image, Center } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const UniversityEdit = () => {
  const { universityId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    logoUrl: '',
    bannerUrl: '',
    location: ''
  });
  const [bannerPreview, setBannerPreview] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await api.get(`/universities/${universityId}`);
        const data = res.data?.data;
        if (!mounted) return;
        setForm({
          name: data.name || '',
          description: data.description || '',
          website: data.website || '',
          logoUrl: data.logoUrl || '',
          bannerUrl: data.bannerUrl || '',
          location: data.location || ''
        });
        setBannerPreview(data.bannerUrl || '');
        setLogoPreview(data.logoUrl || '');
      } catch (err) {
        toast({ title: 'Error loading university', status: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [universityId, toast]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e, field) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (field === 'banner') {
        setBannerPreview(result);
        setForm(prev => ({ ...prev, bannerUrl: result }));
      } else if (field === 'logo') {
        setLogoPreview(result);
        setForm(prev => ({ ...prev, logoUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/universities/${universityId}`, {
        name: form.name,
        description: form.description,
        website: form.website,
        logoUrl: form.logoUrl,
        bannerUrl: form.bannerUrl,
        location: form.location
      });
      toast({ title: 'University updated', status: 'success' });
      navigate(`/universities/${universityId}`);
    } catch (err) {
      console.error(err);
      toast({ title: 'Update failed', status: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={6} maxW="900px">
      {/* Banner preview with name overlay */}
      {bannerPreview ? (
        <Box mb={4} borderRadius="md" overflow="hidden" position="relative">
          <Image src={bannerPreview} alt="banner" objectFit="cover" w="100%" h="220px" />
          <Center position="absolute" top={0} left={0} w="100%" h="100%">
            <Heading size="lg" color="white" textShadow="0 2px 10px rgba(0,0,0,0.6)">{form.name || 'University'}</Heading>
          </Center>
        </Box>
      ) : (
        <Box mb={4} borderRadius="md" overflow="hidden" bg="gray.100" h="220px" display="flex" alignItems="center" justifyContent="center">
          <Heading size="md" color="gray.600">No banner</Heading>
        </Box>
      )}

      <Heading mb={4}>Edit University</Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input name="name" value={form.name} onChange={handleChange} required />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea name="description" value={form.description} onChange={handleChange} rows={4} />
          </FormControl>

          <FormControl>
            <FormLabel>Website</FormLabel>
            <Input name="website" value={form.website} onChange={handleChange} />
          </FormControl>

          <FormControl>
            <FormLabel>Logo URL</FormLabel>
            <Input name="logoUrl" value={form.logoUrl} onChange={handleChange} />
            <Box mt={2}>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
            </Box>
            {logoPreview && (
              <Box mt={2} maxW="160px">
                <Image src={logoPreview} alt="logo preview" boxSize="80px" objectFit="cover" borderRadius="md" />
              </Box>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Banner URL</FormLabel>
            <Input name="bannerUrl" value={form.bannerUrl} onChange={handleChange} />
            <Box mt={2}>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
            </Box>
          </FormControl>

          <FormControl>
            <FormLabel>Location</FormLabel>
            <Input name="location" value={form.location} onChange={handleChange} />
          </FormControl>

          <Stack direction="row" spacing={3}>
            <Button colorScheme="blue" type="submit" isLoading={loading}>Save changes</Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};

export default UniversityEdit;
