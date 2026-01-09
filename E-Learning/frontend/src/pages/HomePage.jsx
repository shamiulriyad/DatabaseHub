import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    Stack,
    SimpleGrid,
    Icon,
    Flex
  } from "@chakra-ui/react";
  import { useNavigate } from "react-router-dom";
  import { FaBook, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
  
  export default function HomePage() {
    const navigate = useNavigate();
  
    return (
      <Box>
        {/* HERO SECTION */}
        <Box bg="purple.600" color="white" py={24}>
          <Container maxW="6xl">
            <Stack spacing={6} textAlign="center">
              <Heading size="2xl">Next Gen Minds</Heading>
              <Text fontSize="xl">
                Learn Smarter. Build the Future.
              </Text>
  
              <Stack direction="row" spacing={4} justify="center">
                <Button
                  size="lg"
                  colorScheme="whiteAlpha"
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  color="white"
                  borderColor="white"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
  
        {/* FEATURES SECTION */}
        <Box py={20}>
          <Container maxW="6xl">
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              <Feature
                icon={FaBook}
                title="High Quality Courses"
                text="Access structured courses designed by experienced educators and institutions."
              />
              <Feature
                icon={FaUserGraduate}
                title="Track Your Progress"
                text="Monitor learning progress, quiz results, and achievements in real time."
              />
              <Feature
                icon={FaChalkboardTeacher}
                title="Expert Instructors"
                text="Learn from qualified teachers and industry professionals."
              />
            </SimpleGrid>
          </Container>
        </Box>
  
        {/* HOW IT WORKS */}
        <Box bg="gray.50" py={20}>
          <Container maxW="5xl" textAlign="center">
            <Heading mb={10}>How It Works</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <Step number="1" text="Create your free account" />
              <Step number="2" text="Enroll in courses you love" />
              <Step number="3" text="Learn, practice, and grow" />
            </SimpleGrid>
          </Container>
        </Box>
  
        {/* CTA */}
        <Box py={20}>
          <Container maxW="4xl" textAlign="center">
            <Heading mb={4}>Start Learning Today</Heading>
            <Text mb={6}>
              Join Next Gen Minds and take your education to the next level.
            </Text>
            <Button
              size="lg"
              colorScheme="purple"
              onClick={() => navigate("/register")}
            >
              Join Now
            </Button>
          </Container>
        </Box>
  
        {/* FOOTER */}
        <Box bg="gray.800" color="gray.300" py={6}>
          <Container maxW="6xl" textAlign="center">
            <Text fontSize="sm">
              © {new Date().getFullYear()} Next Gen Minds. All rights reserved.
            </Text>
          </Container>
        </Box>
      </Box>
    );
  }
  
  function Feature({ icon, title, text }) {
    return (
      <Stack align="center" textAlign="center">
        <Flex
          w={16}
          h={16}
          align="center"
          justify="center"
          bg="purple.100"
          rounded="full"
        >
          <Icon as={icon} w={8} h={8} color="purple.600" />
        </Flex>
        <Heading size="md">{title}</Heading>
        <Text color="gray.600">{text}</Text>
      </Stack>
    );
  }
  
  function Step({ number, text }) {
    return (
      <Stack align="center">
        <Flex
          w={12}
          h={12}
          align="center"
          justify="center"
          bg="purple.600"
          color="white"
          rounded="full"
          fontWeight="bold"
        >
          {number}
        </Flex>
        <Text>{text}</Text>
      </Stack>
    );
  }
  