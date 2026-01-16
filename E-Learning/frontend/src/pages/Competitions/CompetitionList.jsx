import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  useToast,
  Select,
} from '@chakra-ui/react';
import { FaSearch, FaTrophy, FaUsers, FaClock, FaFire } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import competitionApi from '../../services/api';

const CompetitionList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchCompetitions();
  }, [page]);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const response = await competitionApi.get('/competitions', {
        params: { page, pageSize: 20 }
      });
      
      if (response.data.success) {
        setCompetitions(response.data.data || []);
        setFilteredCompetitions(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch competitions:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load competitions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = competitions;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCompetitions(filtered);
  }, [searchTerm, statusFilter, competitions]);

  const getStatusColor = (status) => {
    const statusMap = {
      'upcoming': 'blue',
      'ongoing': 'green',
      'completed': 'gray'
    };
    return statusMap[status?.toLowerCase()] || 'blue';
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'ongoing':
        return FaFire;
      case 'upcoming':
        return FaClock;
      case 'completed':
        return FaTrophy;
      default:
        return FaClock;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (id) => {
    navigate(`/competitions/${id}`);
  };

  return (
    <Box bg="gray.50" minH="calc(100vh - 100px)" py={8}>
      <Container maxW="7xl">
        {/* Header */}
        <VStack spacing={6} align="stretch" mb={8}>
          <HStack justify="space-between">
            <Heading as="h1" size="2xl" color="purple.600">
              Competitions
            </Heading>
            <Button
              colorScheme="purple"
              size="lg"
              onClick={() => navigate('/competitions/create')}
            >
              Create Competition
            </Button>
          </HStack>

          {/* Filters */}
          <HStack spacing={4} w="full" flexWrap="wrap">
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search competitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
              />
            </InputGroup>

            <Select
              maxW="200px"
              bg="white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="All Status"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </Select>
          </HStack>
        </VStack>

        {/* Competitions Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={20}>
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : filteredCompetitions.length === 0 ? (
          <Box
            bg="white"
            rounded="lg"
            p={8}
            textAlign="center"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Text color="gray.500" fontSize="lg">
              No competitions found
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredCompetitions.map((competition) => (
              <Card
                key={competition.id}
                bg="white"
                shadow="md"
                borderWidth="1px"
                borderColor="gray.200"
                _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack align="start" spacing={4}>
                    {/* Title and Status */}
                    <HStack justify="space-between" w="full">
                      <Heading as="h3" size="md" noOfLines={2}>
                        {competition.title}
                      </Heading>
                      <Badge
                        colorScheme={getStatusColor(competition.status)}
                        leftIcon={<Icon as={getStatusIcon(competition.status)} />}
                      >
                        {competition.status}
                      </Badge>
                    </HStack>

                    {/* Description */}
                    <Text
                      color="gray.600"
                      noOfLines={2}
                      fontSize="sm"
                    >
                      {competition.description || 'No description provided'}
                    </Text>

                    {/* Details */}
                    <HStack spacing={4} fontSize="sm" color="gray.700">
                      <HStack spacing={1}>
                        <Icon as={FaUsers} />
                        <Text>{competition.participantCount} joined</Text>
                      </HStack>
                      {competition.prizePool > 0 && (
                        <HStack spacing={1}>
                          <Icon as={FaTrophy} color="orange.400" />
                          <Text>${competition.prizePool}</Text>
                        </HStack>
                      )}
                    </HStack>

                    {/* Dates */}
                    <VStack align="start" spacing={1} fontSize="xs" color="gray.500" w="full">
                      <Text>Start: {formatDate(competition.startDate)}</Text>
                      <Text>End: {formatDate(competition.endDate)}</Text>
                    </VStack>

                    {/* Action Button */} 
                    <Button
                      w="full"
                      colorScheme="purple"
                      size="sm"
                      onClick={() => handleViewDetails(competition.id)}
                    >
                      View Details
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

export default CompetitionList;
