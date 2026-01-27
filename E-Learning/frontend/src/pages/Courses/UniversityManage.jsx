import React from 'react';
import { Box, Heading, Text, Button, Stack } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';

const UniversityManage = () => {
  const { universityId } = useParams();
  const navigate = useNavigate();

  return (
    <Box p={6}>
      <Stack spacing={4} maxW="800px">
        <Heading size="lg">Manage University</Heading>
        <Text>Administrative management page for university ID: {universityId}</Text>
        <Text fontSize="sm" color="gray.600">Place management tools here (departments, courses, staff).</Text>
        <Button colorScheme="blue" onClick={() => navigate(-1)}>Back</Button>
      </Stack>
    </Box>
  );
};

export default UniversityManage;
