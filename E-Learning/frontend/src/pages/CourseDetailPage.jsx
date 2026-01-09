import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Progress,
  Badge,
} from "@chakra-ui/react";
import { getCourse } from "../api/courses";
import { enroll } from "../api/enrollments";
import { getAccessToken } from "../auth/token";
import CourseDetailBackground from "../components/backgrounds/CourseDetailBackground";

export default function CourseDetailPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const hasToken = Boolean(getAccessToken());

  const { data, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId),
  });

  const enrollMutation = useMutation({
    mutationFn: () => enroll(courseId),
  });

  return (
    <CourseDetailBackground>
      {isLoading && <Text>Loading…</Text>}
      {error && <Text color="red.500">{error.message}</Text>}

      {data && (
        <Stack spacing={8}>
          {/* Hero */}
          <Box
            bgGradient="linear(to-r, blue.600, purple.600)"
            color="white"
            p={8}
            borderRadius="2xl"
            boxShadow="xl"
          >
            <Stack spacing={3}>
              <Badge w="fit-content" colorScheme="cyan">
                Course
              </Badge>
              <Heading>{data.title}</Heading>
              <Text opacity={0.9}>{data.description}</Text>

              <Button
                onClick={() => enrollMutation.mutate()}
                isDisabled={!hasToken}
                colorScheme="cyan"
                w="fit-content"
              >
                Enroll Now
              </Button>

              {!hasToken && (
                <Text fontSize="sm">
                  Please{" "}
                  <RouterLink to="/login" style={{ textDecoration: "underline" }}>
                    login
                  </RouterLink>{" "}
                  to enroll.
                </Text>
              )}
            </Stack>
          </Box>

          {/* Modules */}
          <Stack spacing={4}>
            <Heading size="md">Modules</Heading>

            {(data.modules || []).map((m) => (
              <Box
                key={m.id}
                p={5}
                bg="white"
                borderRadius="xl"
                boxShadow="md"
              >
                <Stack spacing={2}>
                  <Text fontWeight="bold">{m.title}</Text>
                  <Text color="gray.600">{m.description}</Text>

                  <Progress value={30} colorScheme="blue" borderRadius="md" />
                </Stack>
              </Box>
            ))}
          </Stack>
        </Stack>
      )}
    </CourseDetailBackground>
  );
}
