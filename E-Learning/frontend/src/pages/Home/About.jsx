import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaBullseye, FaUsers, FaGlobeAmericas, FaLightbulb, FaTrophy, FaRocket } from 'react-icons/fa';

const About = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  const values = [
    {
      icon: FaBullseye,
      title: 'Excellence',
      description: 'We are committed to delivering the highest quality educational content and experiences to our learners.',
      color: 'purple',
    },
    {
      icon: FaUsers,
      title: 'Community',
      description: 'Building a supportive and inclusive community where learners can grow together and share knowledge.',
      color: 'blue',
    },
    {
      icon: FaGlobeAmericas,
      title: 'Accessibility',
      description: 'Making quality education accessible to everyone, everywhere, regardless of background or location.',
      color: 'green',
    },
    {
      icon: FaLightbulb,
      title: 'Innovation',
      description: 'Continuously innovating and adopting new technologies to improve the learning experience.',
      color: 'yellow',
    },
    {
      icon: FaTrophy,
      title: 'Achievement',
      description: 'Celebrating learner achievements and providing pathways to success and career advancement.',
      color: 'orange',
    },
    {
      icon: FaRocket,
      title: 'Growth',
      description: 'Empowering individuals to grow professionally and personally through continuous learning.',
      color: 'pink',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Active Learners' },
    { number: '500+', label: 'Expert Instructors' },
    { number: '1,200+', label: 'Quality Courses' },
    { number: '150+', label: 'Partner Universities' },
  ];

  return (
    <Box minH="100vh">
      {/* Hero Section */}
      <Box
        bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={{ base: 16, md: 24 }}
      >
        <Container maxW="7xl">
          <VStack spacing={6} textAlign="center">
            <Heading size="2xl" fontWeight="black">
              About NextUniVerse
            </Heading>
            <Text fontSize="lg" maxW="2xl" lineHeight="tall">
              Transforming education through technology, community, and innovation. We're building the future of learning.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Mission & Vision */}
      <Container maxW="7xl" py={16}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} alignItems="center">
          <VStack spacing={6} align="start">
            <Heading size="xl">Our Mission</Heading>
            <Text fontSize="md" color={textColor} lineHeight="tall">
              NextUniVerse is dedicated to democratizing education by providing access to world-class learning experiences. 
              We believe that education is the key to unlocking human potential, and our mission is to make quality education 
              affordable, accessible, and engaging for learners worldwide.
            </Text>
            <Text fontSize="md" color={textColor} lineHeight="tall">
              Through innovative technology, expert instructors, and a supportive community, we empower individuals to achieve 
              their goals, advance their careers, and make a positive impact in their communities.
            </Text>
          </VStack>

          <VStack spacing={6} align="start">
            <Heading size="xl">Our Vision</Heading>
            <Text fontSize="md" color={textColor} lineHeight="tall">
              To become the world's leading online learning platform that bridges the gap between education and opportunity. 
              We envision a future where anyone can access quality education, develop new skills, and achieve their dreams 
              regardless of their geographic location or economic background.
            </Text>
            <Text fontSize="md" color={textColor} lineHeight="tall">
              We are committed to creating a global community of lifelong learners, where collaboration, innovation, and 
              continuous improvement drive success for individuals, institutions, and society as a whole.
            </Text>
          </VStack>
        </SimpleGrid>
      </Container>

      {/* Stats Section */}
      <Box bg={bgColor} py={16}>
        <Container maxW="7xl">
          <Heading textAlign="center" size="xl" mb={12}>
            By the Numbers
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
            {stats.map((stat, idx) => (
              <Card key={idx} bg={cardBg} textAlign="center">
                <CardBody>
                  <Text
                    fontSize="3xl"
                    fontWeight="bold"
                    bgGradient="linear(135deg, purple.600, blue.600)"
                    bgClip="text"
                    mb={2}
                  >
                    {stat.number}
                  </Text>
                  <Text fontWeight="600" color={textColor}>
                    {stat.label}
                  </Text>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Core Values Section */}
      <Container maxW="7xl" py={16}>
        <Heading textAlign="center" size="xl" mb={12}>
          Our Core Values
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {values.map((value, idx) => (
            <Card key={idx} bg={cardBg} _hover={{ shadow: 'lg' }} transition="all 0.3s">
              <CardBody>
                <VStack spacing={4} align="start">
                  <Box
                    w={16}
                    h={16}
                    bg={`${value.color}.100`}
                    color={`${value.color}.600`}
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={value.icon} boxSize={8} />
                  </Box>
                  <Heading size="md">{value.title}</Heading>
                  <Text fontSize="sm" color={textColor} lineHeight="tall">
                    {value.description}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* Team Section */}
      <Box bg={bgColor} py={16}>
        <Container maxW="7xl">
          <Heading textAlign="center" size="xl" mb={4}>
            Why Choose NextUniVerse?
          </Heading>
          <Text textAlign="center" fontSize="md" color={textColor} maxW="2xl" mx="auto" mb={12}>
            Here's what sets us apart in the online learning space
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Heading size="md">Expert Instructors</Heading>
                  <Text color={textColor}>
                    Learn from industry professionals and top educators with years of experience and proven track records.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Heading size="md">Flexible Learning</Heading>
                  <Text color={textColor}>
                    Study at your own pace, at your own schedule. Access courses anytime, anywhere on any device.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Heading size="md">Affordable Pricing</Heading>
                  <Text color={textColor}>
                    High-quality education doesn't have to be expensive. We offer competitive pricing for everyone.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Heading size="md">Verified Certificates</Heading>
                  <Text color={textColor}>
                    Earn recognized certificates upon completion that boost your resume and professional credibility.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Heading size="md">Supportive Community</Heading>
                  <Text color={textColor}>
                    Connect with fellow learners, participate in discussions, and get help when you need it.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={3} align="start">
                  <Heading size="md">Career Support</Heading>
                  <Text color={textColor}>
                    Get guidance on career development, interview preparation, and job placement opportunities.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={16}
      >
        <Container maxW="7xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="2xl" fontWeight="black">
              Ready to Start Your Learning Journey?
            </Heading>
            <Text fontSize="lg" maxW="2xl">
              Join thousands of learners on NextUniVerse and transform your future through education.
            </Text>
            <HStack spacing={4}>
              <Button
                size="lg"
                bg="white"
                color="purple.600"
                _hover={{ bg: 'gray.100' }}
                as={RouterLink}
                to="/register"
              >
                Sign Up Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                as={RouterLink}
                to="/courses"
              >
                Explore Courses
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default About;
