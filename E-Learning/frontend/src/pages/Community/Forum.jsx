import React from 'react';
import {
  Box,
  SimpleGrid,
  VStack,
  Text,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Icon,
  Badge,
} from '@chakra-ui/react';
import {
  ChatIcon,
  StarIcon,
} from '@chakra-ui/icons';
import { FaUsers, FaQuestionCircle, FaBullhorn } from 'react-icons/fa';

const Forum = () => {
  const forums = [
    {
      id: 1,
      title: 'General Discussion',
      description: 'Talk about anything and everything',
      icon: ChatIcon,
      color: 'blue',
      posts: 0,
    },
    {
      id: 2,
      title: 'Questions & Answers',
      description: 'Ask questions and get help from the community',
      icon: FaQuestionCircle,
      color: 'green',
      posts: 0,
    },
    {
      id: 3,
      title: 'Announcements',
      description: 'Official announcements and updates',
      icon: FaBullhorn,
      color: 'orange',
      posts: 0,
    },
    {
      id: 4,
      title: 'Feature Requests',
      description: 'Suggest and discuss new features',
      icon: StarIcon,
      color: 'purple',
      posts: 0,
    },
    {
      id: 5,
      title: 'Community Help',
      description: 'Help each other with problems and issues',
      icon: FaUsers,
      color: 'red',
      posts: 0,
    },
  ];

  return (
    <Box p={6}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Community Forums
          </Text>
          <Text color="gray.600">
            Join specialized discussions in different forums
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {forums.map((forum) => (
            <Card
              key={forum.id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
            >
              <CardHeader pb={2}>
                <Flex align="center">
                  <Icon
                    as={forum.icon}
                    w={6}
                    h={6}
                    color={`${forum.color}.500`}
                    mr={3}
                  />
                  <Text fontWeight="bold">{forum.title}</Text>
                </Flex>
              </CardHeader>
              
              <CardBody pt={0}>
                <Text color="gray.600" fontSize="sm" mb={4}>
                  {forum.description}
                </Text>
                <Badge colorScheme={forum.color}>
                  {forum.posts} posts
                </Badge>
              </CardBody>
              
              <CardFooter pt={0}>
                <Button
                  colorScheme={forum.color}
                  variant="outline"
                  size="sm"
                  w="100%"
                >
                  Browse Forum
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Forum;