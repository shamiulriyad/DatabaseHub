import { Box } from "@chakra-ui/react";

export default function AuthBackground({ children }) {
  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      bgGradient="linear(to-br, purple.600, pink.500, blue.500)"
      animation="gradient 12s ease infinite"
      sx={{
        "@keyframes gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        backgroundSize: "200% 200%",
      }}
    >
      {/* Floating blurred shapes */}
      <Box
        position="absolute"
        top="-120px"
        left="-120px"
        w="300px"
        h="300px"
        bg="pink.400"
        opacity={0.35}
        filter="blur(120px)"
        borderRadius="full"
        animation="float 10s ease-in-out infinite"
      />

      <Box
        position="absolute"
        bottom="-120px"
        right="-120px"
        w="320px"
        h="320px"
        bg="blue.400"
        opacity={0.35}
        filter="blur(120px)"
        borderRadius="full"
        animation="float 12s ease-in-out infinite reverse"
      />

      <Box
        position="absolute"
        top="30%"
        right="-100px"
        w="220px"
        h="220px"
        bg="purple.400"
        opacity={0.25}
        filter="blur(100px)"
        borderRadius="full"
        animation="float 14s ease-in-out infinite"
      />

      {/* Content */}
      <Box
        position="relative"
        zIndex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
      >
        {children}
      </Box>

      {/* Float animation */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </Box>
  );
}
