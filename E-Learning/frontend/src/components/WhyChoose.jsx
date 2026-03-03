import React from 'react';
import { Box, Container, SimpleGrid, VStack, HStack, Heading, Text, Icon, Divider } from '@chakra-ui/react';
import { FaCheckCircle, FaChalkboardTeacher, FaClock } from 'react-icons/fa';

const features = [
  { icon: FaChalkboardTeacher, title: 'Expert Instructors', desc: 'Industry professionals and top educators.' },
  { icon: FaClock, title: 'Flexible Learning', desc: 'Learn at your own pace on any device.' },
  { icon: FaCheckCircle, title: 'Verified Certificates', desc: 'Recognized credentials to boost your career.' },
];

const FeatureItem = ({ icon, title, desc }) => (
  <HStack align="start" spacing={4} py={3}>
    <Box color="purple.500"><Icon as={icon} boxSize={6} /></Box>
    <VStack align="start" spacing={1}>
      <Heading size="sm">{title}</Heading>
      <Text color="gray.600" fontSize="sm">{desc}</Text>
    </VStack>
  </HStack>
);

const WhyChoose = () => {
  return (
    <Box as="section" py={{ base: 12, md: 20 }}>
      <Container maxW="7xl">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
          <VStack align="start" spacing={6}>
            <Heading size="xl">Why Choose NextUniVerse?</Heading>
            <Text color="gray.600">A curated learning experience built to accelerate outcomes and open opportunities.</Text>
          </VStack>

          <VStack align="stretch" spacing={4}>
            {features.map((f, i) => (
              <Box key={i}>
                <FeatureItem icon={f.icon} title={f.title} desc={f.desc} />
                {i < features.length - 1 && <Divider />}
              </Box>
            ))}
          </VStack>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default WhyChoose;
