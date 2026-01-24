import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Text, Heading } from '@chakra-ui/react';

const CourseCreate = () => {
  const navigate = useNavigate();

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Create Course</Heading>
      <Text mb={4}>Course creation is handled from the Teacher Dashboard. Click below to go to the Teacher Create Course form.</Text>
      <Button colorScheme="blue" onClick={() => navigate('/teacher/create-course')}>Open Teacher Create Course</Button>
    </Box>
  );
};

export default CourseCreate;
