import React, { useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Flex, VStack, Heading, Text, FormControl, FormLabel, Input, Button, useToast } from '@chakra-ui/react';
import Robot from './Robot';
import { keyframes } from '@emotion/react';

const ResetPassword = () => {
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [robotState, setRobotState] = useState('normal');

  const toast    = useToast();
  const navigate = useNavigate();
  const params   = useParams();

  const floatKF = keyframes`
    0%   { transform: translateY(0); }
    50%  { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  `;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      setRobotState('error');
      return;
    }
    if (password !== confirm) {
      setRobotState('error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRobotState('success');
      toast({ title: 'Password reset', description: 'Password updated successfully', status: 'success', duration: 3000 });
      setTimeout(() => navigate('/login'), 1200);
    }, 900);
  };

  const inputProps = {
    type: 'password',
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
        width={{ base: '90%', md: '720px' }}
        gap={8}
        border="1px solid"
        borderColor="gray.700"
        align="center"
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
          <VStack align="stretch" spacing={5}>
            <VStack align="stretch" spacing={1}>
              <Heading size="md" color="white">Reset Password</Heading>
              <Text color="gray.400" fontSize="sm">Set a new password for your account</Text>
            </VStack>

            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">

                {/* New password */}
                <FormControl>
                  <FormLabel color="gray.300" fontWeight="600">New password</FormLabel>
                  <Input
                    {...inputProps}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setRobotState('coverEyes')}
                    onBlur={() => setRobotState('normal')}
                  />
                </FormControl>

                {/* Confirm password */}
                <FormControl>
                  <FormLabel color="gray.300" fontWeight="600">Confirm password</FormLabel>
                  <Input
                    {...inputProps}
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
                  isLoading={loading}
                  transition="0.3s"
                  _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)', transform: 'scale(1.02)' }}
                  _active={{ transform: 'scale(0.98)' }}
                  boxShadow="0 4px 20px rgba(159,122,234,0.35)"
                >
                  Reset Password
                </Button>

                <Text textAlign="center" fontSize="sm" color="gray.500">
                  Back to{' '}
                  <Text
                    as={RouterLink} to="/login"
                    color="purple.400" fontWeight="700"
                    _hover={{ color: 'purple.300', textDecoration: 'underline' }}
                  >
                    Sign in
                  </Text>
                </Text>

              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default ResetPassword;