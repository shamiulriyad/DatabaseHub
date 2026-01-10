import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Card,
  CardBody,
  useColorModeValue,
  useToast,
  InputGroup,
  InputRightElement,
  Icon,
  Progress,
} from '@chakra-ui/react';
import { FaArrowLeft, FaEye, FaEyeSlash, FaSave } from 'react-icons/fa';
import axios from 'axios';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getPasswordStrength = () => {
    const { newPassword } = formData;
    if (!newPassword) return { score: 0, label: '', color: 'gray' };
    
    let score = 0;
    if (newPassword.length >= 6) score += 25;
    if (newPassword.length >= 8) score += 25;
    if (/[A-Z]/.test(newPassword)) score += 25;
    if (/[0-9]/.test(newPassword)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: 'red' };
    if (score <= 50) return { score, label: 'Fair', color: 'orange' };
    if (score <= 75) return { score, label: 'Good', color: 'yellow' };
    return { score, label: 'Strong', color: 'green' };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5145/api/auth/change-password',
        {
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="md">
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          mb={4}
          onClick={() => navigate('/profile/edit')}
        >
          Back
        </Button>

        <Card bg={cardBg} shadow="lg">
          <CardBody p={8}>
            <VStack spacing={6}>
              <VStack spacing={2} textAlign="center" w="full">
                <Heading size="lg">Change Password</Heading>
                <Text color="gray.600">Keep your account secure</Text>
              </VStack>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={6}>
                  {/* Current Password */}
                  <FormControl isInvalid={!!errors.currentPassword}>
                    <FormLabel fontWeight="600">Current Password</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        name="currentPassword"
                        type={showCurrent ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Enter current password"
                        borderColor={borderColor}
                        _focus={{ borderColor: 'purple.500' }}
                      />
                      <InputRightElement>
                        <Button
                          variant="ghost"
                          onClick={() => setShowCurrent(!showCurrent)}
                          size="sm"
                        >
                          <Icon as={showCurrent ? FaEyeSlash : FaEye} />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    {errors.currentPassword && (
                      <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
                    )}
                  </FormControl>

                  {/* New Password */}
                  <FormControl isInvalid={!!errors.newPassword}>
                    <FormLabel fontWeight="600">New Password</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        name="newPassword"
                        type={showNew ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        borderColor={borderColor}
                        _focus={{ borderColor: 'purple.500' }}
                      />
                      <InputRightElement>
                        <Button
                          variant="ghost"
                          onClick={() => setShowNew(!showNew)}
                          size="sm"
                        >
                          <Icon as={showNew ? FaEyeSlash : FaEye} />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    {errors.newPassword && (
                      <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
                    )}
                    {formData.newPassword && (
                      <Box mt={2}>
                        <Text fontSize="sm" mb={1}>
                          Strength: {strength.label}
                        </Text>
                        <Progress
                          value={strength.score}
                          colorScheme={strength.color}
                          size="sm"
                          borderRadius="md"
                        />
                      </Box>
                    )}
                  </FormControl>

                  {/* Confirm Password */}
                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel fontWeight="600">Confirm New Password</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        name="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        borderColor={borderColor}
                        _focus={{ borderColor: 'purple.500' }}
                      />
                      <InputRightElement>
                        <Button
                          variant="ghost"
                          onClick={() => setShowConfirm(!showConfirm)}
                          size="sm"
                        >
                          <Icon as={showConfirm ? FaEyeSlash : FaEye} />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    {errors.confirmPassword && (
                      <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                    )}
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
                    isLoading={isLoading}
                    _hover={{ bg: 'purple.700' }}
                  >
                    Change Password
                  </Button>
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default ChangePassword;
