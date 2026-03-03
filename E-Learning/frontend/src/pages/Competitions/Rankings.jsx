import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Spinner,
  useToast,
  SimpleGrid,
  Avatar,
} from '@chakra-ui/react';
import { FaTrophy, FaMedal, FaFire, FaStar } from 'react-icons/fa';
import competitionApi from '../../services/api';

const Rankings = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await competitionApi.get('/competitions', {
        params: { page: 1, pageSize: 100 }
      });
      
      if (response.data.success) {
        // Group by participants and calculate overall rankings
        const allCompetitions = response.data.data || [];
        
        // This is a simplified ranking based on number of competitions won
        // In a real system, you'd aggregate competition stats from a dedicated endpoint
        const competitionRankings = allCompetitions
          .filter(c => c.status === 'completed')
          .map((c, idx) => ({
            ...c,
            rank: idx + 1
          }));
        
        setRankings(competitionRankings);
      }
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rankings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Icon as={FaTrophy} color="yellow.400" w={7} h={7} />;
    if (rank === 2) return <Icon as={FaMedal} color="gray.400" w={7} h={7} />;
    if (rank === 3) return <Icon as={FaMedal} color="orange.400" w={7} h={7} />;
    return null;
  };

  const getRankBgColor = (rank) => {
    if (rank === 1) return 'linear(135deg, yellow.50, yellow.100)';
    if (rank === 2) return 'linear(135deg, gray.50, gray.100)';
    if (rank === 3) return 'linear(135deg, orange.50, orange.100)';
    return 'white';
  };

  const getRankBorderColor = (rank) => {
    if (rank === 1) return 'yellow.300';
    if (rank === 2) return 'gray.300';
    if (rank === 3) return 'orange.300';
    return 'gray.200';
  };

  return (
    <Box bg="gray.50" minH="calc(100vh - 100px)" py={8}>
      <Container maxW="7xl">
        {/* Header */}
        <VStack align="start" spacing={6} mb={8}>
          <Heading as="h1" size="2xl" color="purple.600">
            Competition Rankings
          </Heading>
          <Text color="gray.600">
            See how competitions rank based on completion and participation
          </Text>
        </VStack>

        {/* Rankings Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={20}>
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : rankings.length === 0 ? (
          <Card bg="card.bg" shadow="md">
            <CardBody>
              <Text color="gray.500" textAlign="center" py={10}>
                No completed competitions yet
              </Text>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={6}>
            {/* Top 3 Podium */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full" mb={8}>
              {rankings.slice(0, 3).map((ranking, idx) => (
                <Card
                  key={ranking.id}
                  bg={getRankBgColor(idx + 1)}
                  borderWidth="2px"
                  borderColor={getRankBorderColor(idx + 1)}
                  shadow="lg"
                  transform={idx === 0 ? 'scale(1.05)' : 'none'}
                  transition="all 0.2s"
                >
                  <CardBody>
                    <VStack spacing={4} align="center">
                      <Box position="relative">
                        {getMedalIcon(idx + 1)}
                      </Box>
                      <Text fontWeight="bold" fontSize="2xl" color={
                        idx === 0 ? 'yellow.600' : idx === 1 ? 'gray.600' : 'orange.600'
                      }>
                        #{idx + 1}
                      </Text>
                      <Heading as="h3" size="md" textAlign="center">
                        {ranking.title}
                      </Heading>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        {ranking.description}
                      </Text>
                      <HStack spacing={3} justify="center" w="full" flexWrap="wrap">
                        <Badge colorScheme="blue" fontSize="xs">
                          {ranking.competitionType}
                        </Badge>
                        <Badge colorScheme="green" fontSize="xs">
                          {ranking.participantCount} participants
                        </Badge>
                      </HStack>
                      {ranking.prizePool > 0 && (
                        <Badge colorScheme="purple" fontSize="md">
                          ${ranking.prizePool} Prize Pool
                        </Badge>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>

            {/* Remaining Rankings */}
            {rankings.length > 3 && (
              <VStack spacing={3} w="full">
                <Heading as="h3" size="md" alignSelf="start">
                  Other Competitions
                </Heading>
                {rankings.slice(3).map((ranking, idx) => (
                  <Card
                    key={ranking.id}
                    bg="card.bg"
                    shadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                    w="full"
                    _hover={{ shadow: 'md' }}
                    transition="all 0.2s"
                  >
                    <CardBody>
                      <HStack justify="space-between" w="full" spacing={4}>
                        <HStack spacing={4} flex={1}>
                          <Text fontWeight="bold" fontSize="lg" minW="50px">
                            #{idx + 4}
                          </Text>
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="bold">
                              {ranking.title}
                            </Text>
                            <Text fontSize="sm" color="gray.600" noOfLines={1}>
                              {ranking.description}
                            </Text>
                          </VStack>
                        </HStack>
                        <HStack spacing={3}>
                          <Badge colorScheme="blue">{ranking.competitionType}</Badge>
                          <Badge colorScheme="green">
                            {ranking.participantCount} joined
                          </Badge>
                          {ranking.prizePool > 0 && (
                            <Badge colorScheme="purple">
                              ${ranking.prizePool}
                            </Badge>
                          )}
                        </HStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default Rankings;
