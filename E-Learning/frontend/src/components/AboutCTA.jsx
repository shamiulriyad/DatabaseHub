import React from 'react';
import { Box, Container, VStack, Heading, Text, HStack, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const AboutCTA = () => (
  <Box as="section" py={{ base: 12, md: 20 }}>
    <Container maxW="7xl">
      <VStack bgGradient="linear(to-r, purple.600, blue.600)" color="white" p={{ base: 8, md: 12 }} borderRadius="xl" boxShadow="lg" spacing={6}>
        <Heading size={{ base: 'lg', md: '2xl' }}>Ready to Start Your Learning Journey?</Heading>
        <Text maxW="3xl">Join thousands of learners on NextUniVerse and transform your future through education.</Text>
        <HStack>
          <Button as={RouterLink} to="/register" size="lg" bg="white" color="purple.600" _hover={{ bg: 'gray.100' }}>
            Sign Up Now
          </Button>
        </HStack>
      </VStack>
    </Container>
  </Box>
);

export default AboutCTA;
