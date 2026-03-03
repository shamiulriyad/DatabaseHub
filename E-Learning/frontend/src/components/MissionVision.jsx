import React from 'react';
import { Box, Container, SimpleGrid, VStack, Heading, Text, Icon, Stack } from '@chakra-ui/react';
import { FaBullseye, FaLightbulb } from 'react-icons/fa';

const Card = ({ icon, title, children }) => (
  <Box bg="white" _dark={{ bg: 'gray.700' }} borderRadius="xl" p={6} boxShadow="sm" _hover={{ transform: 'translateY(-6px)', boxShadow: 'lg' }} transition="all 0.2s">
    <VStack align="start" spacing={4}>
      <Icon as={icon} boxSize={8} color="purple.500" />
      <Heading size="md">{title}</Heading>
      <Text color="gray.600">{children}</Text>
    </VStack>
  </Box>
);

const MissionVision = () => {
  return (
    <Box as="section" py={{ base: 12, md: 20 }}>
      <Container maxW="7xl">
        <Heading textAlign="center" size="xl" mb={10}>
          Mission & Vision
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Card icon={FaBullseye} title="Our Mission">
            Democratize access to quality education, empowering learners to reach their potential.
          </Card>

          <Card icon={FaLightbulb} title="Our Vision">
            Build a global learning community where opportunity and expertise meet.
          </Card>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default MissionVision;
