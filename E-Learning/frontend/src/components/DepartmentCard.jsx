import React from 'react';
import { Box, Heading, Text, Badge, VStack, Image, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function DepartmentCard({ department, universityId }) {
  const navigate = useNavigate();

  return (
    <Box
      borderRadius="md"
      overflow="hidden"
      bg="white"
      boxShadow="sm"
      cursor="pointer"
      onClick={() => navigate(`/universities/${universityId}/departments/${department.id}`)}
      transition="transform 0.14s ease, box-shadow 0.14s ease"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
      h="100%"
      display="flex"
      flexDirection="column"
    >
      { (department.bannerUrl || department.thumbnailUrl || department.banner) ? (
        <Box h="120px" bg="gray.100" overflow="hidden">
          <Image src={department.bannerUrl || department.thumbnailUrl || department.banner} alt={department.name} objectFit="cover" w="100%" h="100%" />
        </Box>
      ) : null }

      <Box p={4} flex="1" display="flex" alignItems="center" justifyContent="space-between">
        <VStack align="start" spacing={0} flex="1" alignItems="flex-start">
          <Heading size="sm" noOfLines={2}>{department.name}</Heading>
          <Text fontSize="sm" color="gray.600">{department.code || ''}</Text>
        </VStack>
        <Box ml={3} flexShrink={0}>
          <Badge colorScheme="blue">{department.type || 'Department'}</Badge>
        </Box>
      </Box>
    </Box>
  );
}
