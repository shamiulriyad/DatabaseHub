import React, { useEffect, useState } from 'react';
import { Box, Container, SimpleGrid, VStack, Heading, Text } from '@chakra-ui/react';

const StatCard = ({ number, label }) => {
  return (
    <VStack bg="white" _dark={{ bg: 'gray.700' }} borderRadius="xl" p={6} spacing={2} boxShadow="sm" _hover={{ transform: 'translateY(-6px)', boxShadow: 'lg' }} transition="all 0.2s">
      <Heading size="lg" bgClip="text" bgGradient="linear(to-r, purple.600, blue.600)">{number}</Heading>
      <Text fontWeight="600" color="gray.600">{label}</Text>
    </VStack>
  );
};

const StatsSection = () => {
  const stats = [
    { number: '10,000+', label: 'Active Learners' },
    { number: '500+', label: 'Expert Instructors' },
    { number: '1,200+', label: 'Quality Courses' },
    { number: '150+', label: 'Partner Universities' },
  ];

  return (
    <Box as="section" py={{ base: 12, md: 20 }}>
      <Container maxW="7xl">
        <Heading textAlign="center" size="xl" mb={10}>By the Numbers</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6}>
          {stats.map((s, i) => (
            <StatCard key={i} number={s.number} label={s.label} />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default StatsSection;
