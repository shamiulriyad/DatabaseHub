import React, { useEffect, useState } from "react";
import { Box, Heading, Spinner, Text, SimpleGrid, Button, useToast } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ClanVsClansCompetitionList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetch("/api/clanvsclanscompetitions")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch competitions");
        return res.json();
      })
      .then((data) => {
        setCompetitions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleCreate = () => {
    if (!user || !user.isClanLeader) {
      toast({
        title: "Access Denied",
        description: "Only clan leaders can create clan vs clan competitions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    navigate("/clans-competitions/create");
  };

  if (loading) return <Spinner size="xl" mt={10} />;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box p={6}>
      <Heading mb={6}>Clan vs Clan Competitions</Heading>
      <Button
        colorScheme="orange"
        size="md"
        mb={6}
        className="css-ay0wn6"
        onClick={handleCreate}
      >
        Create Clan vs Clan Competition
      </Button>
      {competitions.length === 0 ? (
        <Text>No clan vs clan competitions found.</Text>
      ) : (
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {competitions.map((comp) => (
            <Box key={comp.id} borderWidth={1} borderRadius="lg" p={4} boxShadow="md">
              <Heading size="md" mb={2}>{comp.title}</Heading>
              <Text mb={2}>{comp.description}</Text>
              <Text fontSize="sm" color="gray.500" mb={2}>Status: {comp.status}</Text>
              <Button as={Link} to={`/clans-competitions/${comp.id}`} colorScheme="teal" size="sm">
                View Details
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default ClanVsClansCompetitionList;
