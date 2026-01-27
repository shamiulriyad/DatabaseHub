import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Spinner,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import competitionService from '../../services/competitionService';
import { useAuth } from '../../hooks/useAuth';

const MyCompetitions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['userCompetitions'],
    queryFn: () => competitionService.getUserCompetitions(),
  });

  React.useEffect(() => {
    if (isError) {
      toast({
        title: 'Failed to load competitions',
        description: error?.message || 'Could not fetch your participated competitions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isError, error, toast]);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg">My Competitions</Heading>
          <Text color="gray.500">Competitions you've joined — scores, ranks, and status</Text>
        </Box>

        {isLoading ? (
          <HStack justify="center" py={16}>
            <Spinner size="xl" />
          </HStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {(data && data.length > 0) ? (
              data.map((item) => {
                const comp = item.competition || item.Competition || {};
                const score = item.participantScore ?? item.ParticipantScore ?? null;
                const rank = item.participantRank ?? item.ParticipantRank ?? null;
                const joinedAt = item.joinedAt ?? item.JoinedAt ?? null;

                return (
                  <Card key={comp.id}>
                    <CardHeader>
                      <HStack justify="space-between">
                        <Heading size="md">{comp.title}</Heading>
                        <Badge colorScheme={comp.status === 'ongoing' ? 'green' : comp.status === 'upcoming' ? 'purple' : 'gray'}>
                          {comp.status}
                        </Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Text color="gray.600">{comp.description}</Text>
                        <Text fontSize="sm" color="gray.500">Start: {new Date(comp.startDate).toLocaleString()}</Text>
                        <Text fontSize="sm" color="gray.500">End: {new Date(comp.endDate).toLocaleString()}</Text>
                        <HStack spacing={4}>
                          <Text fontWeight="600">Score:</Text>
                          <Text>{score ?? '—'}</Text>
                          <Text fontWeight="600">Rank:</Text>
                          <Text>{rank ?? '—'}</Text>
                          <Text fontWeight="600">Joined:</Text>
                          <Text>{joinedAt ? new Date(joinedAt).toLocaleString() : '—'}</Text>
                        </HStack>
                        <HStack pt={2}>
                          <Button size="sm" colorScheme="purple" onClick={() => navigate(`/competitions/${comp.id}`)}>View</Button>
                          <Button size="sm" variant="outline" onClick={async () => {
                            try {
                              const stats = await competitionService.getStats(comp.id);
                              toast({ title: 'Competition stats loaded', description: `Avg: ${stats.averageScore}, High: ${stats.highestScore}`, status: 'info', duration: 4000, isClosable: true });
                            } catch (e) {
                              toast({ title: 'Failed to load stats', status: 'error', duration: 3000, isClosable: true });
                            }
                          }}>Stats</Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardBody>
                  <VStack align="center" py={8}>
                    <Text color="gray.500">You haven't participated in any competitions yet.</Text>
                    <Button colorScheme="purple" onClick={() => navigate('/competitions')}>Browse Competitions</Button>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};

export default MyCompetitions;
