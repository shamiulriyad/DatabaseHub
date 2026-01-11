import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  HStack,
  Card,
  CardBody,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Icon,
  useToast,
  Progress,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { authService } from '../../services/authService';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const passwordStrength = password ? 
    (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'Strong' : 
     password.length >= 6 ? 'Medium' : 'Weak') 
    : '';

  const strengthColor = passwordStrength === 'Strong' ? 'green' : passwordStrength === 'Medium' ? 'yellow' : 'red';

  const validateForm = () => {
    const errors = {};
    if (!password) errors.password = 'Password is required';
    if (password && password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !token) return;

    setIsLoading(true);
    setError('');

    try {
      // Call reset password API
      await authService.resetPassword(token, password);
      toast({
        title: 'Success',
        description: 'Password reset successfully. Please log in with your new password.',
        status: 'success',
        duration: 5,
        isClosable: true,
      });
      navigate('/login', { replace: false });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reset password';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Box minH="100vh" bg={bgColor} py={12}>
        <Container maxW="md">
          <Card bg={cardBg} shadow="lg">
            <CardBody p={12}>
              <VStack spacing={6} textAlign="center">
                <Icon as={FaTimesCircle} boxSize={16} color="red.500" />
                <Heading size="lg">Invalid Reset Link</Heading>
                <Text color="gray.600">
                  The password reset link is invalid or has expired. Please request a new one.
                </Text>
                <Button
                  w="full"
                  bg="purple.600"
                  color="white"
                  size="lg"
                  as={RouterLink}
                  to="/forgot-password"
                  _hover={{ bg: 'purple.700' }}
                >
                  Request New Link
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={12}>
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl">Create New Password</Heading>
            <Text color="gray.600" fontSize="md">
              Enter a strong password to secure your account
            </Text>
          </VStack>

          {/* Reset Card */}
          <Card w="full" bg={cardBg} shadow="lg">
            <CardBody p={8}>
              <VStack spacing={6} as="form" onSubmit={handleSubmit}>
                {/* Error Alert */}
                {error && (
                  <Box
                    w="full"
                    bg="red.50"
                    border="1px solid"
                    borderColor="red.200"
                    p={4}
                    borderRadius="lg"
                    color="red.700"
                    fontSize="sm"
                  >
                    {error}
                  </Box>
                )}

                {/* Password Field */}
                <FormControl isInvalid={!!fieldErrors.password}>
                  <FormLabel fontWeight="600">New Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                      }}
                      borderColor={borderColor}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805AD5' }}
                    />
                    <InputRightElement>
                      <Button
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        size="sm"
                      >
                        <Icon as={showPassword ? FaEyeSlash : FaEye} color="gray.600" />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {fieldErrors.password && <FormErrorMessage>{fieldErrors.password}</FormErrorMessage>}
                  {password && (
                    <Box mt={2}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" fontWeight="600">Password Strength</Text>
                        <Text fontSize="xs" color={`${strengthColor}.600`} fontWeight="bold">{passwordStrength}</Text>
                      </HStack>
                      <Progress value={password.length * 10} colorScheme={strengthColor} size="sm" borderRadius="full" />
                    </Box>
                  )}
                </FormControl>

                {/* Confirm Password Field */}
                <FormControl isInvalid={!!fieldErrors.confirmPassword}>
                  <FormLabel fontWeight="600">Confirm Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                      }}
                      borderColor={borderColor}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805AD5' }}
                    />
                    <InputRightElement>
                      <Button
                        variant="ghost"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        size="sm"
                      >
                        <Icon as={showConfirmPassword ? FaEyeSlash : FaEye} color="gray.600" />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {fieldErrors.confirmPassword && <FormErrorMessage>{fieldErrors.confirmPassword}</FormErrorMessage>}
                  {password && confirmPassword && password === confirmPassword && (
                    <HStack spacing={1} mt={2} color="green.600" fontSize="sm">
                      <Icon as={FaCheckCircle} />
                      <Text>Passwords match</Text>
                    </HStack>
                  )}
                </FormControl>

                {/* Submit Button */}
                <Button
                  w="full"
                  bg="purple.600"
                  color="white"
                  size="lg"
                  fontWeight="bold"
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Resetting..."
                  _hover={{ bg: 'purple.700' }}
                >
                  Reset Password
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Password Requirements */}
          <Box
            w="full"
            bg="blue.50"
            border="1px solid"
            borderColor="blue.200"
            p={4}
            borderRadius="lg"
          >
            <Text fontSize="sm" fontWeight="600" mb={2} color="blue.900">
              Password Requirements:
            </Text>
            <VStack spacing={1} align="start" fontSize="sm">
              <HStack spacing={2}>
                <Icon as={password.length >= 6 ? FaCheckCircle : 'circle'} color={password.length >= 6 ? 'green.500' : 'gray.400'} />
                <Text>At least 6 characters</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={/[A-Z]/.test(password) ? FaCheckCircle : 'circle'} color={/[A-Z]/.test(password) ? 'green.500' : 'gray.400'} />
                <Text>One uppercase letter</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={/[0-9]/.test(password) ? FaCheckCircle : 'circle'} color={/[0-9]/.test(password) ? 'green.500' : 'gray.400'} />
                <Text>One number</Text>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ResetPassword;
