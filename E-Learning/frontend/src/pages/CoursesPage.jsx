import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Heading,
  Stack,
  Text,
  Link,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { listCourses } from "../api/courses";
import CoursesBackground from "../components/backgrounds/CoursesBackground";

export default function CoursesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  });

  return (
    <CoursesBackground>
      <Stack spacing={10}>
        {/* Header */}
        <Box
          bgGradient="linear(to-r, blue.600, purple.600)"
          color="white"
          p={8}
          borderRadius="2xl"
          boxShadow="xl"
        >
          <Heading size="lg">Explore Courses</Heading>
          <Text mt={2} opacity={0.9}>
            Learn new skills, advance your career
          </Text>
        </Box>

        {isLoading && <Text>Loading…</Text>}
        {error && <Text color="red.500">{error.message}</Text>}

        {/* Course Cards */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {(data || []).map((c) => (
            <Box
              key={c.id}
              bg="white"
              p={6}
              borderRadius="2xl"
              boxShadow="md"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-6px)",
                boxShadow: "xl",
              }}
            >
              <Stack spacing={3}>
                <Badge colorScheme="blue" w="fit-content">
                  Course
                </Badge>

                <Link
                  as={RouterLink}
                  to={`/courses/${c.id}`}
                  fontWeight="bold"
                  fontSize="lg"
                  color="blue.600"
                >
                  {c.title}
                </Link>

                <Text color="gray.600">
                  {c.description || "No description provided"}
                </Text>

                <Text fontSize="sm" color="gray.500">
                  Instructor: {c.instructorName}
                </Text>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </CoursesBackground>
  );
}
