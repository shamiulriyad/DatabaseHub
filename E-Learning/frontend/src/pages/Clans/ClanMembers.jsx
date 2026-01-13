import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  HStack,
  VStack,
  Skeleton,
  SkeletonText,
  Icon,
  useColorModeValue,
  Avatar,
  Divider,
  Select,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import {
  FaUsers,
  FaTrophy,
  FaCrown,
  FaSearch,
  FaEllipsisV,
  FaUserShield,
  FaStar,
  FaComments,
  FaCalendar,
  FaArrowLeft,
} from 'react-icons/fa';

const fetchClanMembers = async (clanId) => {
  const { data } = await api.get(`/clans/${clanId}/members`);
  return data?.members || [];
};

const MemberCard = ({ member, isLeader }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');

  const roleColor = {
    Leader: 'yellow',
    CoLeader: 'orange',
    Elder: 'purple',
    Member: 'gray',
  };

  const roleIcon = {
    Leader: FaCrown,
    CoLeader: FaUserShield,
    Elder: FaStar,
    Member: FaUsers,
  };

  return (
    <Card
      bg={cardBg}
      borderColor={border}
      borderWidth="1px"
      shadow="sm"
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <CardBody>
        <Flex justify="space-between" align="start">
          <HStack spacing={4} flex={1}>
            <Avatar
              name={member.userName}
              src={member.profileImageUrl}
              size="lg"
            />
            <VStack align="start" spacing={1} flex={1}>
              <HStack>
                <Text fontWeight="bold" fontSize="lg">
                  {member.userName}
                </Text>
                {member.isCurrentUser && (
                  <Badge colorScheme="blue" fontSize="xs">
                    You
                  </Badge>
                )}
              </HStack>
              <Badge
                colorScheme={roleColor[member.role]}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Icon as={roleIcon[member.role]} boxSize={3} />
                {member.role}
              </Badge>
              <HStack spacing={3} fontSize="sm" color="gray.600" mt={1}>
                <HStack spacing={1}>
                  <Icon as={FaTrophy} boxSize={3} />
                  <Text>{member.contributionPoints} pts</Text>
                </HStack>
                <Text>•</Text>
                <HStack spacing={1}>
                  <Icon as={FaComments} boxSize={3} />
                  <Text>{member.totalPosts} posts</Text>
                </HStack>
              </HStack>
            </VStack>
          </HStack>

          {isLeader && !member.isCurrentUser && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaEllipsisV />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <MenuItem>Promote to Elder</MenuItem>
                <MenuItem>Promote to Co-Leader</MenuItem>
                <MenuItem color="red.500">Remove Member</MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>

        <Divider my={3} />

        <SimpleGrid columns={3} spacing={4} fontSize="xs">
          <VStack align="start" spacing={0}>
            <Text color="gray.500">Weekly Points</Text>
            <Text fontWeight="bold" fontSize="sm">
              {member.weeklyPoints}
            </Text>
          </VStack>
          <VStack align="start" spacing={0}>
            <Text color="gray.500">Monthly Points</Text>
            <Text fontWeight="bold" fontSize="sm">
              {member.monthlyPoints}
            </Text>
          </VStack>
          <VStack align="start" spacing={0}>
            <Text color="gray.500">Comments</Text>
            <Text fontWeight="bold" fontSize="sm">
              {member.totalComments}
            </Text>
          </VStack>
        </SimpleGrid>

        <Divider my={3} />

        <HStack justify="space-between" fontSize="xs" color="gray.600">
          <HStack spacing={1}>
            <Icon as={FaCalendar} />
            <Text>Joined {new Date(member.joinedAt).toLocaleDateString()}</Text>
          </HStack>
          {member.lastActive && (
            <Text>
              Active {new Date(member.lastActive).toLocaleDateString()}
            </Text>
          )}
        </HStack>
      </CardBody>
    </Card>
  );
};

const ClanMembers = () => {
  const { clanId } = useParams();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const searchCardBg = useColorModeValue('white', 'gray.700');

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: members, isLoading } = useQuery({
    queryKey: ['clanMembers', clanId],
    queryFn: () => fetchClanMembers(clanId),
  });

  // Filter members based on search and role
  const filteredMembers = members?.filter((member) => {
    const matchesSearch = member.userName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get member counts by role
  const roleCounts = members?.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {});

  // Check if current user is leader
  const isLeader = members?.some(
    (m) => m.isCurrentUser && m.role === 'Leader'
  );

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container maxW="7xl">
        {/* Header */}
        <HStack spacing={4} mb={8}>
          <IconButton
            icon={<FaArrowLeft />}
            variant="ghost"
            onClick={() => navigate(`/clans/${clanId}`)}
          />
          <VStack align="start" spacing={1} flex={1}>
            <Heading size="xl">Clan Members</Heading>
            <Text color="gray.600">
              {members?.length || 0} total members
            </Text>
          </VStack>
        </HStack>

        {/* Role Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          {roleCounts &&
            Object.entries(roleCounts).map(([role, count]) => (
              <Card
                key={role}
                bg={cardBg}
                cursor="pointer"
                onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
                borderWidth={roleFilter === role ? '2px' : '1px'}
                borderColor={
                  roleFilter === role
                    ? 'purple.500'
                    : borderColor
                }
              >
                <CardBody>
                  <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold">
                      {count}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {role}
                      {count !== 1 ? 's' : ''}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
        </SimpleGrid>

        {/* Search and Filters */}
        <Card
          bg={searchCardBg}
          mb={6}
          shadow="sm"
        >
          <CardBody>
            <HStack spacing={4}>
              <InputGroup flex={1}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search members by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              <Select
                placeholder="All Roles"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                maxW="200px"
              >
                <option value="Leader">Leader</option>
                <option value="CoLeader">Co-Leader</option>
                <option value="Elder">Elder</option>
                <option value="Member">Member</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Members Grid */}
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardBody>
                  <HStack spacing={4} mb={4}>
                    <Skeleton boxSize="64px" borderRadius="full" />
                    <VStack align="start" flex={1}>
                      <SkeletonText noOfLines={2} width="150px" />
                    </VStack>
                  </HStack>
                  <SkeletonText noOfLines={3} />
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : filteredMembers && filteredMembers.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isLeader={isLeader}
              />
            ))}
          </SimpleGrid>
        ) : (
          <VStack spacing={4} py={20}>
            <Icon as={FaUsers} boxSize={20} color="gray.400" />
            <Heading size="lg" color="gray.600">
              No members found
            </Heading>
            <Text color="gray.500">
              {searchQuery || roleFilter
                ? 'Try adjusting your filters'
                : 'This clan has no members yet'}
            </Text>
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default ClanMembers;
