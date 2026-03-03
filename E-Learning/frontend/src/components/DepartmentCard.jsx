import React from 'react';
import { Box, Flex, Text, Heading, Badge } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const DepartmentCard = ({ department: d, universityId }) => {
  const navigate = useNavigate();

  return (
    <Box
      bg="gray.800"
      border="1px solid"
      borderColor="gray.700"
      borderRadius="xl"
      p={5}
      cursor="pointer"
      onClick={() => navigate(`/universities/${universityId}/departments/${d.id}`)}
      transition="all 0.25s ease"
      _hover={{
        transform: 'translateY(-4px)',
        borderColor: 'purple.500',
        boxShadow: '0 12px 30px rgba(124,58,237,0.2)',
      }}
      role="group"
      position="relative"
      overflow="hidden"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      {/* top accent line on hover */}
      <Box
        position="absolute"
        top="0" left="0" right="0"
        h="2px"
        bgGradient="linear(to-r, purple.500, pink.400)"
        opacity={0}
        transition="opacity 0.25s"
        _groupHover={{ opacity: 1 }}
      />

      <Flex direction="column" gap={3} flex="1">
        {/* Department name */}
        <Heading
          size="sm"
          color="white"
          fontWeight="700"
          lineHeight="1.4"
          noOfLines={2}
        >
          {d.name || d.departmentName}
        </Heading>

        {/* Short code */}
        {(d.shortCode || d.code) && (
          <Text fontSize="xs" color="gray.400" fontWeight="500" letterSpacing="0.05em">
            {d.shortCode || d.code}
          </Text>
        )}

        {/* Description */}
        {d.description && (
          <Text fontSize="xs" color="gray.500" noOfLines={2} lineHeight="1.6">
            {d.description}
          </Text>
        )}
      </Flex>

      {/* Footer */}
      <Flex justify="space-between" align="center" mt={4} pt={3}
        borderTop="1px solid" borderColor="gray.700">
        <Badge
          bg="rgba(167,139,250,0.12)"
          color="purple.300"
          border="1px solid"
          borderColor="rgba(167,139,250,0.3)"
          fontSize="xs"
          borderRadius="full"
          px={2} py={0.5}
          textTransform="uppercase"
          letterSpacing="0.06em"
        >
          Department
        </Badge>
        <ChevronRightIcon
          color="purple.400"
          boxSize={4}
          transition="transform 0.2s"
          _groupHover={{ transform: 'translateX(3px)' }}
        />
      </Flex>
    </Box>
  );
};

export default DepartmentCard;