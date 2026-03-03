import React from 'react';
import { Box, Container, SimpleGrid, Card, CardBody, VStack, Icon, Heading, Text } from '@chakra-ui/react';
import { FaUsers, FaGlobeAmericas, FaTrophy, FaRocket, FaBullseye, FaHandsHelping } from 'react-icons/fa';

const values = [
  { icon: FaBullseye, title: 'Excellence', desc: 'High quality content and experiences.' },
  { icon: FaUsers, title: 'Community', desc: 'Supportive and inclusive learning community.' },
  { icon: FaGlobeAmericas, title: 'Accessibility', desc: 'Learning for everyone, everywhere.' },
  { icon: FaHandsHelping, title: 'Support', desc: 'Help when you need it most.' },
  { icon: FaTrophy, title: 'Achievement', desc: 'Celebrate learner successes.' },
  { icon: FaRocket, title: 'Growth', desc: 'Continuous professional growth.' },
];

const CoreValues = () => {
  return (
    <Box as="section" py={{ base: 12, md: 20 }}>
      <Container maxW="7xl">
        <Heading textAlign="center" size="xl" mb={10}>Our Core Values</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
          {values.map((v, i) => (
            <Card key={i} borderRadius="xl" boxShadow="sm" _hover={{ transform: 'translateY(-6px)', boxShadow: 'lg' }} transition="all 0.2s">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Box w={12} h={12} display="flex" alignItems="center" justifyContent="center" bg="purple.50" color="purple.600" borderRadius="lg">
                    <Icon as={v.icon} />
                  </Box>
                  <Heading size="md">{v.title}</Heading>
                  <Text color="gray.600">{v.desc}</Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default CoreValues;
