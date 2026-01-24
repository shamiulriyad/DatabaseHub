import React from 'react';
import { Box, Image, Heading, Text, Badge, HStack, Button, VStack } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const price = course.price ?? 0;
  const rating = course.rating ?? 0;

  return (
    <Box borderRadius="md" overflow="hidden" boxShadow="lg" bg="white" transition="transform 0.18s ease, box-shadow 0.18s ease" _hover={{ transform: 'translateY(-6px)', boxShadow: '2xl' }}>
      <Image src={course.thumbnailUrl || course.thumbnail || '/images/course-placeholder.png'} alt={course.title || course.name} objectFit="cover" w="100%" h="160px" />
      <VStack align="start" spacing={3} p={4}>
        <Heading size="sm">{course.title || course.name}</Heading>
        <Text fontSize="sm" color="gray.600">{course.shortDescription || course.description}</Text>
        <HStack spacing={3} w="100%" justify="space-between">
          <HStack>
            <Badge colorScheme={price > 0 ? 'orange' : 'green'}>{price > 0 ? `৳ ${price}` : 'Free'}</Badge>
            <HStack spacing={1} align="center">
              <StarIcon color="yellow.400" />
              <Text fontSize="sm">{rating.toFixed ? rating.toFixed(1) : rating}</Text>
            </HStack>
          </HStack>
          <HStack>
            <Button size="sm" variant="ghost" onClick={() => navigate(`/courses/${course.id || course.courseId}`)}>Details</Button>
            <Button size="sm" colorScheme={price > 0 ? 'orange' : 'teal'} onClick={() => {
              if (price > 0) {
                navigate(`/courses/${course.id || course.courseId}`);
              } else {
                navigate(`/courses/${course.id || course.courseId}`);
              }
            }}>{price > 0 ? 'Buy' : 'Enroll'}</Button>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
}
