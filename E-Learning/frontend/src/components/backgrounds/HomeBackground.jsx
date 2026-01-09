import { Box, Container } from "@chakra-ui/react";

export default function HomeBackground({ children }) {
  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-r, blue.600, purple.600, pink.500)"
      backgroundSize="300% 300%"
      animation="gradient 15s ease infinite"
      sx={{
        "@keyframes gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      }}
    >
      <Container maxW="7xl" py={20}>
        {children}
      </Container>
    </Box>
  );
}
