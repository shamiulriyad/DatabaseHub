import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  FormErrorMessage,
  Card,
  CardBody,
  Avatar,
  Image,
  useColorModeValue,
  useToast,
  Spinner,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { FaSave, FaArrowLeft, FaCamera } from 'react-icons/fa';
import axios from 'axios';

const EditProfile = () => {
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    profileImageUrl: '',
    coverImageUrl: '',
  });
  const [preview, setPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5145/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const profile = response.data.user;
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          username: profile.username || '',
          profileImageUrl: profile.profileImageUrl || '',
          coverImageUrl: profile.coverImageUrl || '',
        });
        setPreview(profile.profileImageUrl || '');
        setCoverPreview(profile.coverImageUrl || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        profileImageUrl: user.profileImageUrl || '',
        coverImageUrl: user.coverImageUrl || '',
      });
      setPreview(user.profileImageUrl || '');
      setCoverPreview(user.coverImageUrl || '');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Image size must be less than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Create preview and keep the File object for upload
      setPreview(URL.createObjectURL(file));
      setProfileFile(file);
      setFormData((prev) => ({ ...prev, profileImageUrl: '' }));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid File', description: 'Please select an image file', status: 'error', duration: 3000, isClosable: true });
        return;
      }

      // Validate file size (max 8MB for cover)
      if (file.size > 8 * 1024 * 1024) {
        toast({ title: 'File Too Large', description: 'Cover image must be less than 8MB', status: 'error', duration: 3000, isClosable: true });
        return;
      }

      // Create preview and keep the File object for upload
      setCoverPreview(URL.createObjectURL(file));
      setCoverFile(file);
      setFormData((prev) => ({ ...prev, coverImageUrl: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      console.log('EditProfile: submitting', { formData });
      console.log('EditProfile: token present?', !!token);
      // If user selected new profile or cover files, upload them first to get URLs
      const uploadImage = async (file) => {
        if (!file) return null;
        const fd = new FormData();
        fd.append('image', file);
        const res = await axios.post('http://localhost:5145/api/auth/upload-image', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        return res.data?.url || null;
      };

      const profileUrl = await uploadImage(profileFile);
      const coverUrl = await uploadImage(coverFile);

      const payload = {
        ...formData,
        profileImageUrl: profileUrl || formData.profileImageUrl,
        coverImageUrl: coverUrl || formData.coverImageUrl,
      };

      const response = await axios.put('http://localhost:5145/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

        if (response.data.success) {
        // Update localStorage (sanitize large data URIs before storing to avoid quota errors)
        const updatedUser = response.data.user || { ...JSON.parse(localStorage.getItem('user') || '{}'), ...payload };
        const sanitizeForStorage = (u) => {
          const copy = { ...u };
          if (typeof copy.profileImageUrl === 'string' && copy.profileImageUrl.startsWith('data:')) delete copy.profileImageUrl;
          if (typeof copy.coverImageUrl === 'string' && copy.coverImageUrl.startsWith('data:')) delete copy.coverImageUrl;
          return copy;
        };
        try {
          localStorage.setItem('user', JSON.stringify(sanitizeForStorage(updatedUser)));
        } catch (e) {
          console.warn('Could not save sanitized user to localStorage', e);
        }

        toast({
          title: 'Success',
          description: 'Profile updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // notify other parts of the app so community posts/comments refresh avatars
        try {
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedUser }));
        } catch (e) {
          // ignore
        }

        navigate('/profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('EditProfile: response status:', error.response?.status);
      console.error('EditProfile: response data:', error.response?.data);
      const serverMessage = error.response?.data?.message || error.response?.data || 'Failed to update profile';
      toast({
        title: 'Error',
        description: typeof serverMessage === 'string' ? serverMessage : JSON.stringify(serverMessage),
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="2xl">
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          mb={4}
          onClick={() => navigate('/profile')}
        >
          Back to Profile
        </Button>

        <Card bg={cardBg} shadow="lg">
          <CardBody p={8}>
            <VStack spacing={6}>
              <VStack spacing={2} textAlign="center" w="full">
                <Box w="100%" position="relative" mb={2}>
                  <Box h="120px" w="100%" borderRadius="md" overflow="hidden" bg="gray.100">
                    {coverPreview || formData.coverImageUrl ? (
                      <Image src={coverPreview || formData.coverImageUrl} objectFit="cover" w="100%" h="120px" />
                    ) : (
                      <Box bgGradient="linear(135deg, purple.600, blue.600)" h="120px" />
                    )}
                  </Box>

                  <Input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    display="none"
                  />
                  <IconButton
                    icon={<FaCamera />}
                    position="absolute"
                    top={2}
                    right={2}
                    borderRadius="md"
                    bg="purple.600"
                    color="white"
                    size="sm"
                    onClick={() => document.getElementById('cover-upload').click()}
                    _hover={{ bg: 'purple.700' }}
                  />

                  <Box position="relative" mt={-10} display="flex" justifyContent="center">
                    <Avatar
                      size="xl"
                      name={`${formData.firstName} ${formData.lastName}`}
                      src={preview}
                      bg="purple.500"
                      color="white"
                      borderWidth={4}
                      borderColor={cardBg}
                    />
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      display="none"
                    />
                    <IconButton
                      icon={<FaCamera />}
                      position="absolute"
                      bottom={0}
                      right={0}
                      ml={2}
                      borderRadius="full"
                      bg="purple.600"
                      color="white"
                      size="sm"
                      onClick={() => document.getElementById('image-upload').click()}
                      _hover={{ bg: 'purple.700' }}
                    />
                  </Box>
                </Box>
                <Heading size="lg">Edit Profile</Heading>
                <Text color="gray.600">Update your personal information</Text>
              </VStack>

              <Divider />

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={6} w="full">
                  {/* First Name & Last Name */}
                  <HStack spacing={4} w="full">
                    <FormControl isInvalid={!!errors.firstName}>
                      <FormLabel fontWeight="600">First Name</FormLabel>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        size="lg"
                        borderColor={borderColor}
                        _focus={{ borderColor: 'purple.500' }}
                      />
                      {errors.firstName && (
                        <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl isInvalid={!!errors.lastName}>
                      <FormLabel fontWeight="600">Last Name</FormLabel>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        size="lg"
                        borderColor={borderColor}
                        _focus={{ borderColor: 'purple.500' }}
                      />
                      {errors.lastName && (
                        <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                      )}
                    </FormControl>
                  </HStack>

                  {/* Email */}
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel fontWeight="600">Email Address</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      size="lg"
                      borderColor={borderColor}
                      _focus={{ borderColor: 'purple.500' }}
                    />
                    {errors.email && (
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    )}
                  </FormControl>

                  {/* Username */}
                  <FormControl isInvalid={!!errors.username}>
                    <FormLabel fontWeight="600">Username</FormLabel>
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      size="lg"
                      borderColor={borderColor}
                      _focus={{ borderColor: 'purple.500' }}
                    />
                    {errors.username && (
                      <FormErrorMessage>{errors.username}</FormErrorMessage>
                    )}
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Username must be at least 3 characters
                    </Text>
                  </FormControl>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    w="full"
                    bg="purple.600"
                    color="white"
                    size="lg"
                    fontWeight="bold"
                    leftIcon={<FaSave />}
                    isLoading={isSaving}
                    _hover={{ bg: 'purple.700' }}
                  >
                    Save Changes
                  </Button>
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>

        {/* Change Password Section */}
        <Card bg={cardBg} shadow="lg" mt={6}>
          <CardBody p={6}>
            <Heading size="md" mb={4}>Security</Heading>
            <Text color="gray.600" mb={4}>
              Keep your account secure by using a strong password
            </Text>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={() => navigate('/profile/change-password')}
            >
              Change Password
            </Button>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default EditProfile;
