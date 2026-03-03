import React from 'react';
import {
  Box, Image, Heading, Text, Badge,
  HStack, Button, VStack, Icon, Tooltip
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { MdPeople } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export default function CourseCard({ course }) {
  const navigate  = useNavigate();
  const price     = course.price ?? 0;
  const rawRating = course.rating;
  const rating    = (rawRating != null && !Number.isNaN(Number(rawRating))) ? Number(rawRating) : null;
  const courseId  = course.id || course.courseId;

  const goToDetails  = () => navigate(`/courses/${courseId}`);
  const goToCheckout = () => navigate(`/payment?courseId=${courseId}`);

  return (
    <Box
      borderRadius="2xl"
      overflow="hidden"
      bg="rgba(255,255,255,0.05)"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      boxShadow="0 4px 32px rgba(0,0,0,0.35)"
      transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
      _hover={{
        transform: 'translateY(-6px)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
        borderColor: price > 0 ? 'orange.400' : 'teal.400',
      }}
      maxW="320px"
      w="100%"
    >
      {/* Thumbnail */}
      <Box position="relative">
        <Image
          src={course.thumbnailUrl || course.thumbnail || '/images/course-placeholder.png'}
          alt={course.title || course.name}
          objectFit="cover"
          w="100%"
          h="175px"
        />
        <Badge
          position="absolute"
          top={3}
          left={3}
          colorScheme={price > 0 ? 'orange' : 'green'}
          fontSize="0.78em"
          px={2.5}
          py={1}
          borderRadius="lg"
          boxShadow="md"
          letterSpacing="wide"
        >
          {price > 0 ? `৳ ${price.toLocaleString()}` : '🎓 Free'}
        </Badge>
      </Box>

      {/* Body */}
      <VStack align="start" spacing={3} p={4}>
        <Heading size="sm" noOfLines={2} color="white" lineHeight="1.5">
          {course.title || course.name}
        </Heading>

        <Text fontSize="sm" color="whiteAlpha.600" noOfLines={2}>
          {course.shortDescription || course.description || 'No description available.'}
        </Text>

        <HStack spacing={4}>
          {rating != null ? (
            <HStack spacing={1} align="center">
              <StarIcon color="yellow.400" boxSize={3.5} />
              <Text fontSize="sm" fontWeight="semibold" color="whiteAlpha.800">
                {rating.toFixed(1)}
              </Text>
            </HStack>
          ) : (
            <HStack spacing={1} align="center">
              <StarIcon color="whiteAlpha.300" boxSize={3.5} />
              <Text fontSize="sm" fontWeight="semibold" color="whiteAlpha.600">—</Text>
            </HStack>
          )}
          {course.enrolledCount != null && (
            <Tooltip label="Enrolled students" placement="top">
              <HStack spacing={1} align="center">
                <Icon as={MdPeople} color="whiteAlpha.500" />
                <Text fontSize="sm" color="whiteAlpha.500">
                  {course.enrolledCount.toLocaleString()}
                </Text>
              </HStack>
            </Tooltip>
          )}
        </HStack>

        <Box w="100%" h="1px" bg="whiteAlpha.100" />

        <HStack w="100%" justify="space-between">
          <Button
            size="sm"
            variant="ghost"
            color="whiteAlpha.700"
            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
            onClick={goToDetails}
          >
            Details
          </Button>

          <Button
            size="sm"
            colorScheme={price > 0 ? 'orange' : 'teal'}
            variant="solid"
            onClick={price > 0 ? goToCheckout : goToDetails}
            px={5}
            borderRadius="lg"
            fontWeight="bold"
          >
            {price > 0 ? 'Buy Now' : 'Enroll Free'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}