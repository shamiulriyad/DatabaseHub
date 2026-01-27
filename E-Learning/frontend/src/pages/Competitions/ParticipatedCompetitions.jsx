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

const ParticipatedCompetitions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['userCompetitions'],
    queryFn: () => competitionService.getUserCompetitions(),
  });
  const [items, setItems] = React.useState([]);

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

  // Enrich items with leaderboard-derived rank/score when backend doesn't provide them
  React.useEffect(() => {
    let mounted = true;
    const enrich = async () => {
      if (!data || !Array.isArray(data) || !user) {
        setItems(data ?? []);
        return;
      }

      // Start with server data copy
      const copy = data.map(d => ({ ...d }));

      // Find entries missing rank/score
      const toFetch = copy.filter(item => (item.participantRank == null || item.participantScore == null));

      if (toFetch.length === 0) {
        setItems(copy);
        return;
      }

      await Promise.all(toFetch.map(async (item) => {
        try {
          const comp = item.competition || item.Competition || {};
          const lb = await competitionService.getLeaderboard(comp.id, 1, 1000);
          if (lb && lb.participants && Array.isArray(lb.participants)) {
            const idx = lb.participants.findIndex(p => {
              const pid = p.participantId ?? p.ParticipantId ?? p.participantId;
              return Number(pid) === Number(user.id);
            });
            if (idx >= 0) {
              item.participantRank = idx + 1;
              item.participantScore = lb.participants[idx].score ?? lb.participants[idx].Score ?? item.participantScore;
            }
          }
        } catch (e) {
          // ignore failures per-item
        }
      }));

      if (mounted) setItems(copy);
    };

    enrich();
    return () => { mounted = false; };
  }, [data, user]);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg">My Participated Competitions</Heading>
          <Text color="gray.500">Competitions you've joined — scores, ranks, and status</Text>
        </Box>

        {isLoading ? (
          <HStack justify="center" py={16}>
            <Spinner size="xl" />
          </HStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {((items && items.length > 0) ? items : (data && data.length > 0 ? data : [])) ? (
              ((items && items.length > 0) ? items : data).map((item) => {
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
                                  <Text>{(rank && rank > 0) ? rank : 'Pending'}</Text>
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

export default ParticipatedCompetitions;
