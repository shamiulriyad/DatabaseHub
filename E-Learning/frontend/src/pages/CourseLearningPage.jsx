import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
    Box,
    Heading,
    Stack,
    Text,
    Flex,
    Button,
    Divider,
    Badge,
    Spinner,
} from "@chakra-ui/react";
import CoursesBackground from "../components/backgrounds/CoursesBackground";
import { getCourseModules } from "../api/learning";

const MOCK_MODULES = [
    {
        id: 1,
        title: "Introduction",
        lessons: [
            { id: 1, title: "Welcome" },
            { id: 2, title: "Course Overview" },
        ],
    },
    {
        id: 2,
        title: "Core Concepts",
        lessons: [
            { id: 3, title: "Lesson One" },
            { id: 4, title: "Lesson Two" },
        ],
    },
];

const MOCK_LESSON_CONTENT = {
    1: {
        title: "Welcome",
        content:
            "Welcome to the course! In this lesson, you’ll learn what this course is about and how to succeed.",
    },
    2: {
        title: "Course Overview",
        content:
            "This lesson explains the course structure, grading, and learning outcomes.",
    },
    3: {
        title: "Lesson One",
        content:
            "Here we dive into the first core concept with examples and explanations.",
    },
    4: {
        title: "Lesson Two",
        content:
            "This lesson builds on the previous concept and introduces practical use cases.",
    },
};

export default function CourseLearningPage() {
    const { courseId } = useParams();

    const [selectedLessonId, setSelectedLessonId] = useState(null);

    const [completedLessons, setCompletedLessons] = useState([]);

    const { data, isLoading, error } = useQuery({
        queryKey: ["course-modules", courseId],
        queryFn: () => getCourseModules(courseId),
        enabled: !!courseId,
    });

    const modules =
        error || !data || data.length === 0
            ? MOCK_MODULES
            : data;


    if (isLoading) {
        return (
            <CoursesBackground>
                <Flex justify="center" align="center" minH="60vh">
                    <Spinner size="xl" color="blue.500" />
                </Flex>
            </CoursesBackground>
        );
    }

    const markLessonComplete = () => {
        if (!selectedLessonId) return;

        setCompletedLessons((prev) =>
            prev.includes(selectedLessonId)
                ? prev
                : [...prev, selectedLessonId]
        );
    };

    return (
        <CoursesBackground>
            <Stack spacing={6}>
                {/* Header */}
                <Box
                    bgGradient="linear(to-r, blue.600, purple.600)"
                    color="white"
                    p={6}
                    borderRadius="2xl"
                    boxShadow="xl"
                >
                    <Heading size="lg">Course Learning</Heading>
                    <Text opacity={0.9}>Course ID: {courseId}</Text>
                </Box>

                {/* Error Notice */}
                {error && (
                    <Box bg="red.50" p={4} borderRadius="lg">
                        <Text color="red.600" fontSize="sm">
                            Course content is not available yet. Showing demo content.
                        </Text>
                    </Box>
                )}

                <Flex gap={6} align="stretch">
                    {/* Sidebar */}
                    <Box
                        w={{ base: "100%", md: "300px" }}
                        bg="white"
                        p={5}
                        borderRadius="2xl"
                        boxShadow="md"
                    >
                        <Heading size="sm" mb={4}>
                            Modules
                        </Heading>

                        <Stack spacing={4}>
                            {modules.map((m) => (
                                <Box key={m.id}>
                                    <Text fontWeight="bold" mb={2}>
                                        {m.title}
                                    </Text>

                                    <Stack spacing={1} pl={3}>
                                        {m.lessons.map((l) => (
                                            <Text
                                                key={l.id}
                                                fontSize="sm"
                                                cursor="pointer"
                                                px={2}
                                                py={1}
                                                borderRadius="md"
                                                display="flex"
                                                alignItems="center"
                                                gap={2}
                                                bg={
                                                    selectedLessonId === l.id
                                                        ? "blue.100"
                                                        : completedLessons.includes(l.id)
                                                            ? "green.50"
                                                            : "transparent"
                                                }
                                                color={
                                                    completedLessons.includes(l.id)
                                                        ? "green.700"
                                                        : selectedLessonId === l.id
                                                            ? "blue.700"
                                                            : "gray.700"
                                                }
                                                _hover={{ bg: "blue.50", color: "blue.600" }}
                                                onClick={() => setSelectedLessonId(l.id)}
                                            >
                                                {completedLessons.includes(l.id) ? "✔" : "•"} {l.title}
                                            </Text>

                                        ))}
                                    </Stack>

                                </Box>
                            ))}
                        </Stack>
                    </Box>

                    {/* Main Content */}
                    <Box flex="1" bg="white" p={6} borderRadius="2xl" boxShadow="md">
                        <Stack spacing={4}>
                            <Badge colorScheme="blue" w="fit-content">
                                Lesson
                            </Badge>

                            {!selectedLessonId ? (
                                <>
                                    <Heading size="md">Select a lesson</Heading>
                                    <Text color="gray.600">
                                        Choose a lesson from the left to start learning.
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Heading size="md">
                                        {MOCK_LESSON_CONTENT[selectedLessonId]?.title}
                                    </Heading>

                                    <Text color="gray.600" lineHeight={1.7}>
                                        {MOCK_LESSON_CONTENT[selectedLessonId]?.content}
                                    </Text>

                                    <Divider />

                                    <Button
                                        colorScheme="blue"
                                        onClick={markLessonComplete}
                                        isDisabled={completedLessons.includes(selectedLessonId)}
                                        _hover={{ transform: "scale(1.05)" }}
                                        transition="0.2s"
                                        w="fit-content"
                                    >
                                        {completedLessons.includes(selectedLessonId)
                                            ? "Lesson Completed"
                                            : "Mark Lesson as Complete"}
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Box>

                </Flex>
            </Stack>
        </CoursesBackground>
    );
}
