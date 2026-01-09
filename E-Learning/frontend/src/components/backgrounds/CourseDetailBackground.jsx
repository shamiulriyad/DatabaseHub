import { Box, Container } from "@chakra-ui/react";

export default function CourseDetailBackground({ children }) {
  return (
    <Box minH="100vh" bg="white">
      <Container maxW="5xl" py={10}>
        {children}
      </Container>
    </Box>
  );
}
