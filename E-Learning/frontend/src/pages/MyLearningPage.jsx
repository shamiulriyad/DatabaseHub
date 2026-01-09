import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Heading,
  Stack,
  Text,
  Progress,
  Button,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { myEnrollments } from "../api/enrollments";
import CoursesBackground from "../components/backgrounds/CoursesBackground";

export default function MyLearningPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: myEnrollments,
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
          <Heading size="lg">My Learning</Heading>
          <Text opacity={0.9}>
            Track your progress and continue learning
          </Text>
        </Box>

        {isLoading && <Text>Loading…</Text>}
        {error && <Text color="red.500">{error.message}</Text>}

        <Stack spacing={6}>
          {(data || []).map((e) => (
            <Box
              key={e.id}
              bg="white"
              p={6}
              borderRadius="2xl"
              boxShadow="md"
              transition="all 0.3s"
              _hover={{ boxShadow: "xl" }}
            >
              <Stack spacing={3}>
                <Heading size="md">{e.courseTitle}</Heading>

                <Text fontSize="sm" color="gray.500">
                  Status: {e.status}
                </Text>

                <Progress
                  value={e.progressPercentage || 0}
                  colorScheme="blue"
                  borderRadius="md"
                />

                <Button
                  as={RouterLink}
                  to={`/learning/${e.courseId}`}
                  colorScheme="blue"
                  w="fit-content"
                >
                  Continue Learning
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </CoursesBackground>
  );
}
