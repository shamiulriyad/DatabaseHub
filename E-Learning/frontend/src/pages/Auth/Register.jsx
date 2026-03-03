import React, { useState, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Button,
  Progress,
  useToast,
  HStack,
} from '@chakra-ui/react';
import Robot from './Robot';
import { keyframes } from '@emotion/react';

const Register = () => {
  const [username, setUsername]   = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [robotState, setRobotState] = useState('normal');
  const [error, setError]         = useState('');

  const toast    = useToast();
  const navigate = useNavigate();

  const floatKF = keyframes`
    0%   { transform: translateY(0); }
    50%  { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  `;

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8)          score += 40;
    if (/[A-Z]/.test(password))        score += 20;
    if (/[0-9]/.test(password))        score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    return Math.min(100, score);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !firstName || !lastName || !email || !password || !confirm) {
      setError('Please fill all required fields');
      setRobotState('error');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      setRobotState('error');
      return;
    }

    setLoading(true);

    const payload = {
      Username: username,
      Email: email,
      Password: password,
      FirstName: firstName,
      LastName: lastName,
      ProfileImageUrl: null,
      CoverImageUrl: null,
    };

    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Registration failed');
        setRobotState('error');
        setLoading(false);
        return;
      }

      setRobotState('success');
      toast({ title: 'Registered', description: data?.message || 'Account created successfully', status: 'success', duration: 3000 });
      setLoading(false);
      navigate('/login');
    } catch (err) {
      setError('Network error');
      setRobotState('error');
      setLoading(false);
    }
  };

  // shared input style — dark theme matching Login
  const inputProps = {
    variant: 'outline',
    bg: 'gray.700',
    color: 'white',
    borderRadius: 'xl',
    borderColor: 'gray.600',
    focusBorderColor: 'purple.400',
    _placeholder: { color: 'gray.500' },
    _hover: { borderColor: 'purple.500' },
    _focus: { bg: 'gray.700', boxShadow: '0 0 0 1px #9F7AEA' },
  };

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
      <Box
        position="absolute" w="220px" h="220px" left="-40px" top="-30px"
        borderRadius="full" bg="purple.800" opacity={0.2}
        animation={`${floatKF} 6s ease-in-out infinite`}
      />
      <Box
        position="absolute" w="180px" h="180px" right="-30px" bottom="-40px"
        borderRadius="full" bg="purple.800" opacity={0.15}
        animation={`${floatKF} 8s ease-in-out infinite`}
      />

      <Flex
        position="relative"
        bg="gray.800"
        borderRadius="2xl"
        p={8}
        boxShadow="0 25px 60px rgba(0,0,0,0.6)"
        width={{ base: '90%', md: '920px' }}
        gap={8}
        border="1px solid"
        borderColor="gray.700"
      >
        {/* left accent stripe */}
        <Box
          position="absolute" left="0" top="0" bottom="0" w="6px"
          borderTopLeftRadius="2xl" borderBottomLeftRadius="2xl"
          bgGradient="linear(to-b, purple.400, pink.300)"
        />

        {/* Robot */}
        <Box flex="1" display={{ base: 'none', md: 'flex' }} alignItems="center" justifyContent="center">
          <Robot state={robotState} />
        </Box>

        {/* Form */}
        <Box flex="1">
          <VStack align="stretch" spacing={4}>
            <Heading size="md" color="white">Create account</Heading>
            <Text color="gray.400">Join us — build your learning journey</Text>

            {error && (
              <Box
                bg="rgba(245,101,101,0.15)"
                p={3} borderRadius="md"
                border="1px solid" borderColor="red.500"
              >
                <Text color="red.300" fontSize="sm">{error}</Text>
              </Box>
            )}

            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">

                {/* Username */}
                <FormControl>
                  <FormLabel color="gray.300" fontWeight="600">Username</FormLabel>
                  <Input
                    {...inputProps}
                    placeholder="cool_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setRobotState('writing')}
                    onBlur={() => setRobotState('normal')}
                  />
                </FormControl>

                {/* First + Last name */}
                <HStack>
                  <FormControl>
                    <FormLabel color="gray.300" fontWeight="600">First name</FormLabel>
                    <Input
                      {...inputProps}
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => setRobotState('writing')}
                      onBlur={() => setRobotState('normal')}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.300" fontWeight="600">Last name</FormLabel>
                    <Input
                      {...inputProps}
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setRobotState('writing')}
                      onBlur={() => setRobotState('normal')}
                    />
                  </FormControl>
                </HStack>

                {/* Email */}
                <FormControl isRequired>
                  <FormLabel color="gray.300" fontWeight="600">Email</FormLabel>
                  <Input
                    {...inputProps}
                    type="email"
                    name="email"
                    placeholder="you@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setRobotState('writing')}
                    onBlur={() => setRobotState('normal')}
                  />
                </FormControl>

                {/* Password */}
                <FormControl>
                  <FormLabel color="gray.300" fontWeight="600">Password</FormLabel>
                  <InputGroup>
                    <Input
                      {...inputProps}
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setRobotState('coverEyes')}
                      onBlur={() => setRobotState('normal')}
                    />
                  </InputGroup>
                  {/* Strength bar */}
                  <Box mt={2}>
                    <Progress
                      value={strength}
                      size="xs"
                      borderRadius="full"
                      colorScheme={strength > 70 ? 'green' : strength > 40 ? 'yellow' : 'red'}
                      bg="gray.600"
                    />
                    <Text
                      fontSize="xs"
                      mt={1}
                      color={strength > 70 ? 'green.400' : strength > 40 ? 'yellow.400' : 'red.400'}
                    >
                      {password.length === 0
                        ? ''
                        : strength > 70
                        ? 'Strong password'
                        : strength > 40
                        ? 'Medium — add symbols or numbers'
                        : 'Weak — make it longer'}
                    </Text>
                  </Box>
                </FormControl>

                {/* Confirm password */}
                <FormControl>
                  <FormLabel color="gray.300" fontWeight="600">Confirm password</FormLabel>
                  <Input
                    {...inputProps}
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onFocus={() => setRobotState('coverEyes')}
                    onBlur={() => setRobotState('normal')}
                    borderColor={confirm && confirm !== password ? 'red.500' : 'gray.600'}
                  />
                  {confirm && confirm !== password && (
                    <Text fontSize="xs" color="red.400" mt={1}>Passwords don't match</Text>
                  )}
                </FormControl>

                {/* Submit */}
                <Button
                  type="submit"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="white"
                  fontWeight="700"
                  borderRadius="xl"
                  py={6}
                  transition="0.3s"
                  _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)', transform: 'scale(1.02)' }}
                  _active={{ transform: 'scale(0.98)' }}
                  isLoading={loading}
                  boxShadow="0 4px 20px rgba(159,122,234,0.35)"
                >
                  Create account
                </Button>

                <HStack justify="center">
                  <Text color="gray.500" fontSize="sm">Already have an account?</Text>
                  <Text
                    as={RouterLink} to="/login"
                    color="purple.400" fontWeight="700" fontSize="sm"
                    _hover={{ color: 'purple.300', textDecoration: 'underline' }}
                  >
                    Sign in
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

export default Register;