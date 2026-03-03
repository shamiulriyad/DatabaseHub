import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Box, Flex, Heading, Text, Button, Input,
  FormControl, FormLabel, FormErrorMessage,
  VStack, HStack, InputGroup, InputRightElement,
  Icon, Checkbox, useToast,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaGoogle, FaGithub } from 'react-icons/fa';
import Robot from './Robot';
import { keyframes } from '@emotion/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [robotState, setRobotState] = useState('normal');

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

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
      const response = await login(email, password);
      setRobotState('success');
      toast({ title: 'Success', description: 'Logged in successfully!', status: 'success', duration: 3, isClosable: true });
      setTimeout(() => navigate('/home', { replace: true }), 500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      const userNotFound = errorMessage.toLowerCase().includes('user not found') ||
        errorMessage.toLowerCase().includes('not found') ||
        errorMessage.toLowerCase().includes('does not exist') ||
        errorMessage.toLowerCase().includes('no user') ||
        errorMessage.toLowerCase().includes('invalid email');
      if (userNotFound) {
        setError('Account not found. Please register first.');
        toast({ title: 'Account Not Found', description: 'No account exists with this email. Please register first.', status: 'warning', duration: 6, isClosable: true });
      } else {
        setError(errorMessage);
        toast({ title: 'Login Failed', description: errorMessage, status: 'error', duration: 5, isClosable: true });
      }
      setRobotState('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast({ title: 'Coming Soon', description: `${provider} login will be available soon`, status: 'info', duration: 3, isClosable: true });
  };

  const floatKF = keyframes`
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  `;

  return (
    <Box
      minH="100vh"
      bg="gray.900"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* floating bg circles */}
      <Box position="absolute" w="260px" h="260px" left="-60px" top="-40px" borderRadius="full" bg="purple.800" opacity={0.2} animation={`${floatKF} 6s ease-in-out infinite`} />
      <Box position="absolute" w="200px" h="200px" right="-40px" bottom="-60px" borderRadius="full" bg="purple.800" opacity={0.15} animation={`${floatKF} 8s ease-in-out infinite`} />

      <Flex
        direction={{ base: 'column', md: 'row' }}
        position="relative"
        bg="gray.800"
        borderRadius="2xl"
        p={8}
        boxShadow="0 25px 60px rgba(0,0,0,0.6)"
        width={{ base: '90%', md: '920px' }}
        align="center"
        gap={8}
        border="1px solid"
        borderColor="gray.700"
      >
        {/* left accent stripe */}
        <Box position="absolute" left="0" top="0" bottom="0" w="6px" borderTopLeftRadius="2xl" borderBottomLeftRadius="2xl" bgGradient="linear(to-b, purple.400, pink.300)" />

        <Box flex="1" display={{ base: 'none', md: 'block' }}>
          <Robot state={robotState} />
        </Box>

        <Box flex="1" minW={{ base: '100%', md: '420px' }}>
          <VStack spacing={4} align="stretch">
            <Heading size="lg" color="white">Welcome Back</Heading>
            <Text color="gray.400">Log in to your account</Text>

            {error && (
              <Box
                bg={error.includes('not found') ? 'rgba(237,137,54,0.15)' : 'rgba(245,101,101,0.15)'}
                borderRadius="md" p={3} border="1px solid"
                borderColor={error.includes('not found') ? 'orange.500' : 'red.500'}
              >
                <Text color={error.includes('not found') ? 'orange.300' : 'red.300'} fontSize="sm">{error}</Text>
              </Box>
            )}

            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">

                <FormControl isInvalid={!!fieldErrors.email} isRequired>
                  <FormLabel color="gray.300" fontWeight="600">Email</FormLabel>
                  <Input
                    type="email" name="email" placeholder="you@email.com" autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' }); }}
                    color="white" bg="gray.700" _placeholder={{ color: 'gray.500' }}
                    variant="outline" borderRadius="xl" borderColor="gray.600"
                    focusBorderColor="purple.400" _hover={{ borderColor: 'purple.500' }}
                    _focus={{ bg: 'gray.700', boxShadow: '0 0 0 1px #9F7AEA' }}
                    onFocus={() => setRobotState('writing')} onBlur={() => setRobotState('normal')}
                  />
                  {fieldErrors.email && <FormErrorMessage color="red.300">{fieldErrors.email}</FormErrorMessage>}
                </FormControl>

                <FormControl isInvalid={!!fieldErrors.password} isRequired>
                  <FormLabel color="gray.300" fontWeight="600">Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'} placeholder="Enter password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' }); }}
                      color="white" bg="gray.700" _placeholder={{ color: 'gray.500' }}
                      variant="outline" borderRadius="xl" borderColor="gray.600"
                      focusBorderColor="purple.400" _hover={{ borderColor: 'purple.500' }}
                      _focus={{ bg: 'gray.700', boxShadow: '0 0 0 1px #9F7AEA' }}
                      onFocus={() => setRobotState('coverEyes')} onBlur={() => setRobotState('normal')}
                    />
                    <InputRightElement>
                      <Icon as={showPassword ? FaEyeSlash : FaEye} color="gray.400" onClick={() => setShowPassword(!showPassword)} cursor="pointer" _hover={{ color: 'purple.400' }} />
                    </InputRightElement>
                  </InputGroup>
                  {fieldErrors.password && <FormErrorMessage color="red.300">{fieldErrors.password}</FormErrorMessage>}
                </FormControl>

                <HStack justify="space-between">
                  <Checkbox
                    isChecked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                    colorScheme="purple" size="md"
                    sx={{
                      '& .chakra-checkbox__label': { color: 'gray.300', fontWeight: '500' },
                      '& .chakra-checkbox__control': { bg: 'gray.700', borderColor: 'gray.500' },
                      '& .chakra-checkbox__control[data-checked]': { bg: 'purple.500', borderColor: 'purple.500' },
                    }}
                  >
                    Remember me
                  </Checkbox>
                  <Text as={RouterLink} to="/forgot-password" color="purple.400" fontWeight="600" fontSize="sm" _hover={{ color: 'purple.300' }}>
                    Forgot password?
                  </Text>
                </HStack>

                <Button
                  type="submit"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="white" fontWeight="700" borderRadius="xl"
                  transition="0.3s"
                  _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)', transform: 'scale(1.02)' }}
                  _active={{ transform: 'scale(0.98)' }}
                  isLoading={loading}
                  boxShadow="0 4px 20px rgba(159,122,234,0.35)"
                >
                  Sign In
                </Button>

                <HStack justify="center">
                  <Text color="gray.500" fontSize="sm">Or continue with</Text>
                </HStack>

                <HStack>
                  <Button flex="1" variant="outline" leftIcon={<Icon as={FaGoogle} />} onClick={() => handleSocialLogin('Google')}
                    borderColor="gray.600" color="gray.300" bg="gray.700" borderRadius="xl"
                    _hover={{ bg: 'gray.600', borderColor: 'purple.500', color: 'white' }}>
                    Google
                  </Button>
                  <Button flex="1" variant="outline" leftIcon={<Icon as={FaGithub} />} onClick={() => handleSocialLogin('GitHub')}
                    borderColor="gray.600" color="gray.300" bg="gray.700" borderRadius="xl"
                    _hover={{ bg: 'gray.600', borderColor: 'purple.500', color: 'white' }}>
                    GitHub
                  </Button>
                </HStack>

                <HStack justify="center">
                  <Text color="gray.500" fontSize="sm">Don't have an account?</Text>
                  <Text as={RouterLink} to="/register" color="purple.400" fontWeight="700" fontSize="sm" _hover={{ color: 'purple.300' }}>
                    Sign up
                  </Text>
                </HStack>

              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default Login;