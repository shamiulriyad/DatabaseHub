import { Box } from "@chakra-ui/react";

export default function CoursesBackground({ children }) {
  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, blue.50, purple.50, cyan.50)"
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 8 }}
    >
      {children}
    </Box>
  );
}
