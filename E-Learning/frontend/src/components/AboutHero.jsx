import React from 'react';
import { Box, Container, SimpleGrid, VStack, Heading, Text, HStack, Button, AspectRatio, Image } from '@chakra-ui/react';

const AboutHero = () => {
  return (
    <Box as="section" py={{ base: 12, md: 20 }}>
      <Container maxW="7xl">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} alignItems="center">
          <VStack align="start" spacing={6}>
            <Heading size={{ base: 'xl', md: '2xl' }} fontWeight="extrabold">
              About NextUniVerse
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
              Transforming education through technology, community and innovation — a premium learning
              experience crafted for ambitious learners everywhere.
            </Text>

            <HStack spacing={4} pt={2}>
              <Button size="lg" colorScheme="purple" aria-label="Sign up" as="a" href="/register">
                Get Started
              </Button>
              <Button size="lg" variant="outline" colorScheme="purple" aria-label="Explore courses" as="a" href="/courses">
                Explore Courses
              </Button>
            </HStack>
          </VStack>

          <Box display="flex" alignItems="center" justifyContent="center">
            <AspectRatio ratio={16 / 10} w="full" maxW="560px" borderRadius="xl" overflow="hidden" boxShadow="md">
              <Image src="/illustrations/about-illustration.svg" alt="About illustration" objectFit="cover" fallbackSrc="/images/placeholder.png" />
            </AspectRatio>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default AboutHero;
