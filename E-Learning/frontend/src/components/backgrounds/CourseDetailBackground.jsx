import { Box, Container } from "@chakra-ui/react";

export default function CourseDetailBackground({ children }) {
  return (
    <Box minH="100vh" bg="page.bg">
      <Container maxW="5xl" py={10}>
        {children}
      </Container>
    </Box>
  );
}
