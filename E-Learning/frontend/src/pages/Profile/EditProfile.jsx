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
  useColorModeValue,
  useToast,
  Spinner,
  Divider,
} from '@chakra-ui/react';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const EditProfile = () => {
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
  });
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
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5145/api/auth/profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Update localStorage
        const updatedUser = response.data.user || { ...JSON.parse(localStorage.getItem('user') || '{}'), ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        toast({
          title: 'Success',
          description: 'Profile updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        navigate('/profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
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
                <Avatar
                  size="xl"
                  name={`${formData.firstName} ${formData.lastName}`}
                  bg="purple.500"
                  color="white"
                  mb={2}
                />
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
