import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
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
  FormHelperText,
  VStack,
  HStack,
  Card,
  CardBody,
  Divider,
  Link,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Icon,
  Select,
  Checkbox,
  useToast,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaGoogle, FaGithub, FaCheckCircle } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.username) errors.username = 'Username is required';
    if (formData.username && formData.username.length < 3) errors.username = 'Username must be at least 3 characters';
    if (!formData.email) errors.email = 'Email is required';
    if (formData.email && !formData.email.includes('@')) errors.email = 'Invalid email format';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await authService.register({
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      toast({
        title: 'Registration Successful',
        description: 'Please log in with your credentials',
        status: 'success',
        duration: 3,
        isClosable: true,
      });
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        status: 'error',
        duration: 5,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    toast({
      title: 'Coming Soon',
      description: `${provider} sign up will be available soon`,
      status: 'info',
      duration: 3,
      isClosable: true,
    });
  };

  const passwordStrength = formData.password ? 
    (formData.password.length >= 8 ? 'Strong' : formData.password.length >= 6 ? 'Good' : 'Weak') 
    : '';

  return (
    <Box minH="100vh" bg={bgColor} py={12}>
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading
              size="2xl"
              bgGradient="linear(135deg, purple.600, blue.600)"
              bgClip="text"
            >
              Create Account
            </Heading>
            <Text color="gray.600" fontSize="md">
              Start your learning journey with NextUniVerse
            </Text>
          </VStack>

          {/* Register Card */}
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

                {/* Name Fields */}
                <HStack w="full" spacing={4}>
                  <FormControl isInvalid={!!fieldErrors.firstName}>
                    <FormLabel fontWeight="600">First Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="John"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      borderColor={borderColor}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805AD5' }}
                    />
                    {fieldErrors.firstName && <FormErrorMessage>{fieldErrors.firstName}</FormErrorMessage>}
                  </FormControl>

                  <FormControl isInvalid={!!fieldErrors.lastName}>
                    <FormLabel fontWeight="600">Last Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="Doe"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      borderColor={borderColor}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805AD5' }}
                    />
                    {fieldErrors.lastName && <FormErrorMessage>{fieldErrors.lastName}</FormErrorMessage>}
                  </FormControl>
                </HStack>

                {/* Email Field */}
                <FormControl isInvalid={!!fieldErrors.email}>
                  <FormLabel fontWeight="600">Email Address</FormLabel>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    size="lg"
                    borderColor={borderColor}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805AD5' }}
                  />
                  {fieldErrors.email && <FormErrorMessage>{fieldErrors.email}</FormErrorMessage>}
                </FormControl>

                {/* Username Field */}
                <FormControl isInvalid={!!fieldErrors.username}>
                  <FormLabel fontWeight="600">Username</FormLabel>
                  <Input
                    type="text"
                    placeholder="Choose a unique username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    size="lg"
                    borderColor={borderColor}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805AD5' }}
                  />
                  {fieldErrors.username && <FormErrorMessage>{fieldErrors.username}</FormErrorMessage>}
                  <FormHelperText>At least 3 characters</FormHelperText>
                </FormControl>

                {/* Password Field */}
                <FormControl isInvalid={!!fieldErrors.password}>
                  <FormLabel fontWeight="600">Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
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
                  {passwordStrength && (
                    <FormHelperText color={passwordStrength === 'Strong' ? 'green.500' : 'orange.500'}>
                      Password strength: {passwordStrength}
                    </FormHelperText>
                  )}
                </FormControl>

                {/* Confirm Password Field */}
                <FormControl isInvalid={!!fieldErrors.confirmPassword}>
                  <FormLabel fontWeight="600">Confirm Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
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
                </FormControl>

                {/* Terms Checkbox */}
                <FormControl isInvalid={!!fieldErrors.agreeToTerms}>
                  <Checkbox
                    name="agreeToTerms"
                    isChecked={formData.agreeToTerms}
                    onChange={handleChange}
                  >
                    <Text fontSize="sm">
                      I agree to the{' '}
                      <Link as={RouterLink} to="/terms" color="purple.600" fontWeight="600">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link as={RouterLink} to="/privacy" color="purple.600" fontWeight="600">
                        Privacy Policy
                      </Link>
                    </Text>
                  </Checkbox>
                  {fieldErrors.agreeToTerms && <FormErrorMessage>{fieldErrors.agreeToTerms}</FormErrorMessage>}
                </FormControl>

                {/* Sign Up Button */}
                <Button
                  w="full"
                  bg="purple.600"
                  color="white"
                  size="lg"
                  fontWeight="bold"
                  type="submit"
                  isLoading={loading}
                  loadingText="Creating account..."
                  _hover={{ bg: 'purple.700' }}
                >
                  Create Account
                </Button>

                {/* Divider */}
                <HStack w="full">
                  <Divider />
                  <Text px={2} color="gray.500" fontSize="sm" fontWeight="600">
                    OR
                  </Text>
                  <Divider />
                </HStack>

                {/* Social Signup */}
                <VStack w="full" spacing={3}>
                  <Button
                    w="full"
                    variant="outline"
                    leftIcon={<Icon as={FaGoogle} />}
                    onClick={() => handleSocialSignup('Google')}
                  >
                    Sign up with Google
                  </Button>
                  <Button
                    w="full"
                    variant="outline"
                    leftIcon={<Icon as={FaGithub} />}
                    onClick={() => handleSocialSignup('GitHub')}
                  >
                    Sign up with GitHub
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Sign In Link */}
          <HStack spacing={2}>
            <Text color="gray.600">Already have an account?</Text>
            <Link
              as={RouterLink}
              to="/login"
              color="purple.600"
              fontWeight="bold"
              _hover={{ textDecoration: 'underline' }}
            >
              Sign in here
            </Link>
          </HStack>

          {/* Benefits */}
          <Card w="full" bg="purple.50" variant="outline">
            <CardBody p={6}>
              <VStack spacing={3} align="start" fontSize="sm">
                <HStack spacing={2}>
                  <Icon as={FaCheckCircle} color="purple.600" />
                  <Text>Access 1,200+ courses</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaCheckCircle} color="purple.600" />
                  <Text>Learn from expert instructors</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaCheckCircle} color="purple.600" />
                  <Text>Earn recognized certificates</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaCheckCircle} color="purple.600" />
                  <Text>Join 10,000+ learners worldwide</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default Register;
             
