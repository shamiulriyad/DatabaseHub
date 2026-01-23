import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Switch,
  NumberInput,
  NumberInputField,
  Card,
  CardBody,
  Image,
  Avatar,
  useToast,
  Spinner,
  IconButton,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaArrowLeft, FaCamera } from 'react-icons/fa';
import api from '../../services/api';
import axios from 'axios';

const ClanEdit = () => {
  const { clanId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const [form, setForm] = useState({
    name: '',
    description: '',
    motto: '',
    isPublic: true,
    requireApproval: false,
    maxMembers: 100,
    logoUrl: '',
    bannerUrl: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClan = async () => {
    try {
      const res = await api.get(`/clans/${clanId}`);
      if (res.data?.success) {
        const c = res.data.clan;
        setForm((prev) => ({
          ...prev,
          name: c.name || '',
          description: c.description || '',
          motto: c.motto || '',
          isPublic: c.isPublic ?? true,
          requireApproval: c.requireApproval ?? false,
          maxMembers: c.maxMembers ?? 100,
          logoUrl: c.logoUrl || c.clanLogoUrl || '',
          bannerUrl: c.bannerUrl || '',
        }));
        setLogoPreview(c.logoUrl || c.clanLogoUrl || '');
        setBannerPreview(c.bannerUrl || '');
      }
    } catch (e) {
      console.error('Failed to fetch clan:', e);
      toast({ title: 'Error', description: 'Could not load clan data', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast({ title: 'Invalid file', description: 'Please select an image', status: 'error' });
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
    setForm((p) => ({ ...p, logoUrl: '' }));
  };

  const handleBannerChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast({ title: 'Invalid file', description: 'Please select an image', status: 'error' });
    setBannerFile(f);
    setBannerPreview(URL.createObjectURL(f));
    setForm((p) => ({ ...p, bannerUrl: '' }));
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    try {
      const fd = new FormData();
      fd.append('image', file);
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5145/api/auth/upload-image', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.url || null;
    } catch (e) {
      console.error('Upload failed', e);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const logoUrl = await uploadImage(logoFile);
      const bannerUrl = await uploadImage(bannerFile);

      const payload = {
        name: form.name || undefined,
        description: form.description || undefined,
        motto: form.motto || undefined,
        logoUrl: logoUrl || form.logoUrl || undefined,
        bannerUrl: bannerUrl || form.bannerUrl || undefined,
        isPublic: form.isPublic,
        requireApproval: form.requireApproval,
        maxMembers: Number(form.maxMembers) || undefined,
      };

      const res = await api.put(`/clans/${clanId}`, payload);
      if (res.data?.success) {
        toast({ title: 'Success', description: 'Clan updated', status: 'success' });
        navigate(`/clans/${clanId}`);
      }
    } catch (err) {
      console.error('Update failed', err);
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update clan', status: 'error', duration: 6000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center"><Spinner /></Box>;

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="3xl">
        <Button leftIcon={<FaArrowLeft />} variant="ghost" mb={4} onClick={() => navigate(-1)}>
          Back
        </Button>

        <Card bg={cardBg} shadow="lg">
          <CardBody p={8}>
            <VStack spacing={6} as="form" onSubmit={handleSubmit} align="stretch">
              <Box>
                <Heading size="lg">Edit Clan</Heading>
                <Text color="gray.600">Update clan details, logo and banner</Text>
              </Box>

              <Box>
                <Box h="160px" mb={3} overflow="hidden" borderRadius="md" bg="gray.100">
                  {bannerPreview || form.bannerUrl ? (
                    <Image src={bannerPreview || form.bannerUrl} objectFit="cover" w="100%" h="160px" />
                  ) : (
                    <Box bgGradient="linear(135deg, purple.600, blue.600)" h="160px" />
                  )}
                </Box>
                <Input id="banner-upload" type="file" accept="image/*" display="none" onChange={handleBannerChange} />
                <IconButton icon={<FaCamera />} onClick={() => document.getElementById('banner-upload').click()} mb={4} />

                <HStack spacing={4} align="start">
                  <Box>
                    <Avatar size="xl" src={logoPreview || form.logoUrl} name={form.name} />
                  </Box>
                  <Box>
                    <Input id="logo-upload" type="file" accept="image/*" display="none" onChange={handleLogoChange} />
                    <IconButton icon={<FaCamera />} onClick={() => document.getElementById('logo-upload').click()} />
                  </Box>
                </HStack>
              </Box>

              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input name="name" value={form.name} onChange={handleChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Motto</FormLabel>
                <Input name="motto" value={form.motto} onChange={handleChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea name="description" value={form.description} onChange={handleChange} rows={6} />
              </FormControl>

              <HStack spacing={6}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="isPublic" mb="0">Public</FormLabel>
                  <Switch id="isPublic" isChecked={form.isPublic} onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))} />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="requireApproval" mb="0">Require Approval</FormLabel>
                  <Switch id="requireApproval" isChecked={form.requireApproval} onChange={(e) => setForm((p) => ({ ...p, requireApproval: e.target.checked }))} />
                </FormControl>

                <FormControl>
                  <FormLabel>Max Members</FormLabel>
                  <NumberInput min={2} max={1000} value={form.maxMembers} onChange={(v) => setForm((p) => ({ ...p, maxMembers: Number(v) }))}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </HStack>

              <Divider />

              <HStack justify="end">
                <Button variant="outline" onClick={() => navigate(`/clans/${clanId}`)}>Cancel</Button>
                <Button colorScheme="purple" type="submit" isLoading={saving}>Save Changes</Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default ClanEdit;
