import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  Divider,
  Link,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Icon,
  Checkbox,
  useToast,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaGoogle, FaGithub } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (email && !email.includes('@')) errors.email = 'Invalid email format';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
        status: 'success',
        duration: 3,
        isClosable: true,
      });
      navigate('/home', { replace: false });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      
      // Check if the error indicates user not found or invalid credentials
      const userNotFound = errorMessage.toLowerCase().includes('user not found') || 
                          errorMessage.toLowerCase().includes('not found') ||
                          errorMessage.toLowerCase().includes('does not exist') ||
                          errorMessage.toLowerCase().includes('no user') ||
                          errorMessage.toLowerCase().includes('invalid email');
      
      if (userNotFound) {
        setError('Account not found. Please register first.');
        toast({
          title: 'Account Not Found',
          description: 'No account exists with this email. Please register first.',
          status: 'warning',
          duration: 6,
          isClosable: true,
        });
      } else {
        setError(errorMessage);
        toast({
          title: 'Login Failed',
          description: errorMessage,
          status: 'error',
          duration: 5,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast({
      title: 'Coming Soon',
      description: `${provider} login will be available soon`,
      status: 'info',
      duration: 3,
      isClosable: true,
    });
  };

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
              Welcome Back
            </Heading>
            <Text color="gray.600" fontSize="md">
              Log in to your NextUniVerse account
            </Text>
          </VStack>

          {/* Login Card */}
          <Card w="full" bg={cardBg} shadow="lg">
            <CardBody p={8}>
              <VStack spacing={6} as="form" onSubmit={handleSubmit}>
                {/* Error Alert */}
                {error && (
                  <Box
                    w="full"
                    bg={error.includes('not found') || error.includes('register') ? 'orange.50' : 'red.50'}
                    border="1px solid"
                    borderColor={error.includes('not found') || error.includes('register') ? 'orange.200' : 'red.200'}
                    p={4}
                    borderRadius="lg"
                    color={error.includes('not found') || error.includes('register') ? 'orange.700' : 'red.700'}
                    fontSize="sm"
                  >
                    <VStack spacing={3} align="stretch">
                      <Text>{error}</Text>
                      {(error.includes('not found') || error.includes('register')) && (
                        <Button
                          as={RouterLink}
                          to="/register"
                          size="sm"
                          colorScheme="orange"
                          variant="solid"
                        >
                          Register Now
                        </Button>
                      )}
                    </VStack>
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

                {/* Password Field */}
                <FormControl isInvalid={!!fieldErrors.password}>
                  <FormLabel fontWeight="600">Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
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
                </FormControl>

                {/* Remember Me & Forgot Password */}
                <HStack w="full" justify="space-between">
                  <Checkbox
                    isChecked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  >
                    Remember me
                  </Checkbox>
                  <Link
                    as={RouterLink}
                    to="/forgot-password"
                    color="purple.600"
                    fontWeight="600"
                    fontSize="sm"
                    _hover={{ textDecoration: 'none', color: 'purple.700' }}
                  >
                    Forgot password?
                  </Link>
                </HStack>

                {/* Login Button */}
                <Button
                  w="full"
                  bg="purple.600"
                  color="white"
                  size="lg"
                  fontWeight="bold"
                  type="submit"
                  isLoading={loading}
                  loadingText="Logging in..."
                  _hover={{ bg: 'purple.700' }}
                >
                  Sign In
                </Button>

                {/* Divider */}
                <HStack w="full">
                  <Divider />
                  <Text px={2} color="gray.500" fontSize="sm" fontWeight="600">
                    OR
                  </Text>
                  <Divider />
                </HStack>

                {/* Social Login */}
                <VStack w="full" spacing={3}>
                  <Button
                    w="full"
                    variant="outline"
                    leftIcon={<Icon as={FaGoogle} />}
                    onClick={() => handleSocialLogin('Google')}
                  >
                    Continue with Google
                  </Button>
                  <Button
                    w="full"
                    variant="outline"
                    leftIcon={<Icon as={FaGithub} />}
                    onClick={() => handleSocialLogin('GitHub')}
                  >
                    Continue with GitHub
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Sign Up Link */}
          <HStack spacing={2}>
            <Text color="gray.600">Don't have an account?</Text>
            <Link
              as={RouterLink}
              to="/register"
              color="purple.600"
              fontWeight="bold"
              _hover={{ textDecoration: 'underline' }}
            >
              Sign up now
            </Link>
          </HStack>

          {/* Terms */}
          <Text fontSize="xs" color="gray.500" textAlign="center">
            By signing in, you agree to our{' '}
            <Link as={RouterLink} to="/terms" color="purple.600">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link as={RouterLink} to="/privacy" color="purple.600">
              Privacy Policy
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Login;
