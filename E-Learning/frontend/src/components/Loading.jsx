import React from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <Box p={6} textAlign="center">
      <VStack spacing={3}>
        <Spinner size="lg" color="purple.500" thickness="4px" />
        <Text color="gray.600">{message}</Text>
      </VStack>
    </Box>
  );
};

export default Loading;

