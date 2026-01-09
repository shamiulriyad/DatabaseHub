import { Box, Card, CardBody, Flex, HStack, VStack, Skeleton, SkeletonText, SimpleGrid } from "@chakra-ui/react";

// Course Card Skeleton
export function CourseCardSkeleton() {
  return (
    <Card overflow="hidden">
      <Skeleton height="200px" />
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <Skeleton height="16px" width="60%" />
          <Skeleton height="24px" />
          <Skeleton height="20px" />
          <SkeletonText mt={2} noOfLines={2} spacing={2} />
          <HStack spacing={4} pt={2}>
            <Skeleton height="16px" width="60px" />
            <Skeleton height="16px" width="80px" />
          </HStack>
          <HStack justify="space-between" pt={2}>
            <Skeleton height="24px" width="60px" />
            <Skeleton height="24px" width="80px" />
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

// Category Card Skeleton
export function CategoryCardSkeleton() {
  return (
    <Card>
      <CardBody textAlign="center" py={8}>
        <VStack spacing={3}>
          <Skeleton borderRadius="full" width="64px" height="64px" />
          <Skeleton height="20px" width="120px" />
          <Skeleton height="16px" width="80px" />
        </VStack>
      </CardBody>
    </Card>
  );
}

// Stat Box Skeleton
export function StatBoxSkeleton() {
  return (
    <VStack spacing={3}>
      <Skeleton borderRadius="full" width="40px" height="40px" />
      <Skeleton height="32px" width="80px" />
      <Skeleton height="16px" width="100px" />
    </VStack>
  );
}

// Course Grid Skeleton
export function CourseGridSkeleton({ count = 6 }) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </SimpleGrid>
  );
}

// Category Grid Skeleton
export function CategoryGridSkeleton({ count = 8 }) {
  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
      {Array.from({ length: count }).map((_, index) => (
        <CategoryCardSkeleton key={index} />
      ))}
    </SimpleGrid>
  );
}

// Hero Section Skeleton
export function HeroSkeleton() {
  return (
    <Box bg="purple.600" color="white" py={{ base: 20, md: 28 }}>
      <VStack spacing={6} textAlign="center">
        <Skeleton height="60px" width={{ base: "80%", md: "600px" }} />
        <Skeleton height="28px" width={{ base: "90%", md: "500px" }} />
        <HStack spacing={4}>
          <Skeleton height="48px" width="140px" borderRadius="md" />
          <Skeleton height="48px" width="140px" borderRadius="md" />
        </HStack>
      </VStack>
    </Box>
  );
}
