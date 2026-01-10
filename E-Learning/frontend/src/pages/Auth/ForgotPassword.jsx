import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Link,
  useColorModeValue,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'Email is required';
    if (email && !email.includes('@')) errors.email = 'Invalid email format';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Call password reset API
      await authService.forgotPassword(email);
      setSuccess(true);
      toast({
        title: 'Email Sent',
        description: 'Check your email for password reset instructions',
        status: 'success',
        duration: 5,
        isClosable: true,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send reset email';
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

  if (success) {
    return (
      <Box minH="100vh" bg={bgColor} py={12}>
        <Container maxW="md">
          <VStack spacing={8}>
            <Card w="full" bg={cardBg} shadow="lg">
              <CardBody p={12}>
                <VStack spacing={6} textAlign="center">
                  <Box
                    w={20}
                    h={20}
                    bg="green.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FaCheckCircle} boxSize={10} color="green.600" />
                  </Box>
                  
                  <VStack spacing={2}>
                    <Heading size="lg">Check Your Email</Heading>
                    <Text color="gray.600" fontSize="md">
                      We've sent a password reset link to <strong>{email}</strong>
                    </Text>
                  </VStack>

                  <VStack spacing={2} w="full" pt={4}>
                    <Text fontSize="sm" color="gray.600">
                      Click the link in the email to reset your password. The link will expire in 24 hours.
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Didn't receive the email? Check your spam folder or{' '}
                      <Button
                        variant="link"
                        size="sm"
                        color="purple.600"
                        fontWeight="bold"
                        onClick={() => setSuccess(false)}
                      >
                        try again
                      </Button>
                    </Text>
                  </VStack>

                  <Button
                    w="full"
                    bg="purple.600"
                    color="white"
                    size="lg"
                    as={RouterLink}
                    to="/login"
                    _hover={{ bg: 'purple.700' }}
                  >
                    Back to Login
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={12}>
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Back Button */}
          <HStack w="full">
            <Link
              as={RouterLink}
              to="/login"
              display="flex"
              alignItems="center"
              gap={2}
              color="purple.600"
              fontWeight="600"
              _hover={{ textDecoration: 'none' }}
            >
              <Icon as={FaArrowLeft} />
              Back to Login
            </Link>
          </HStack>

          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl">Reset Password</Heading>
            <Text color="gray.600" fontSize="md">
              Enter your email address and we'll send you a link to reset your password
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

                {/* Email Field */}
                <FormControl isInvalid={!!fieldErrors.email}>
                  <FormLabel fontWeight="600">Email Address</FormLabel>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    size="lg"
                    borderColor={borderColor}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805AD5' }}
                  />
                  {fieldErrors.email && <FormErrorMessage>{fieldErrors.email}</FormErrorMessage>}
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
                  loadingText="Sending..."
                  _hover={{ bg: 'purple.700' }}
                >
                  Send Reset Link
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Help Text */}
          <Box
            w="full"
            bg="blue.50"
            border="1px solid"
            borderColor="blue.200"
            p={4}
            borderRadius="lg"
          >
            <Text fontSize="sm" color="blue.700">
              <strong>Tip:</strong> Make sure to check your spam/junk folder if you don't see the email within a few minutes.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
