import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Fade,
  ScaleFade,
  Progress,

  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  Image,
  Divider,
} from '@chakra-ui/react';
import {
  FaBook,
  FaTrophy,
  FaUsers,
  FaMedal,
  FaFire,
  FaCheckCircle,
  FaArrowRight,
  FaGraduationCap,
  FaChartLine,
  FaClock,
  FaTeamspeak,
  FaLock,
  FaPlayCircle,
} from 'react-icons/fa';

const ExplorePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  const warningBg = useColorModeValue('orange.50', 'orange.900');
  const infoBg = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  const handleJoinClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  // Sample Courses for Preview
  const sampleCourses = [
    {
      id: 1,
      title: 'React Fundamentals',
      description: 'Learn React from basics to advanced concepts with hands-on projects',
      instructor: 'John Smith',
      duration: '12 weeks',
      rating: 4.8,
      activeLearners: 15234,
      thumbnail: 'https://via.placeholder.com/400x200?text=React+Fundamentals',
      lessons: 45,
      challenges: 12,
    },
    {
      id: 2,
      title: 'Data Science Masterclass',
      description: 'Master data science with Python, pandas, and machine learning',
      instructor: 'Sarah Johnson',
      duration: '16 weeks',
      rating: 4.9,
      activeLearners: 22567,
      thumbnail: 'https://via.placeholder.com/400x200?text=Data+Science',
      lessons: 62,
      challenges: 18,
    },
    {
      id: 3,
      title: 'Web Design Bootcamp',
      description: 'Create beautiful, responsive websites with modern design principles',
      instructor: 'Mike Chen',
      duration: '10 weeks',
      rating: 4.7,
      activeLearners: 18900,
      thumbnail: 'https://via.placeholder.com/400x200?text=Web+Design',
      lessons: 38,
      challenges: 10,
    },
  ];

  return (
    <Box bg={bgColor} minH="100vh" pb={20}>
      {/* Header */}
      <Box bg="linear(135deg, purple.600, blue.600)" color="white" py={12}>
        <Container maxW="7xl">
          <VStack spacing={4} textAlign="center">
            <Badge colorScheme="yellow" fontSize="md" px={3} py={1}>
              Platform Overview
            </Badge>
            <Heading as="h1" size="2xl" fontWeight="bold">
              Discover NextUniVerse
            </Heading>
            <Text fontSize="lg" maxW="2xl">
              A complete learning ecosystem with courses, competitions, clans, and global leaderboards
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="7xl" py={12}>
        {/* Tabs for Different Sections */}
        <Tabs variant="soft-rounded" colorScheme="purple" mb={16}>
          <TabList mb={6} overflowX="auto">
            <Tab>Courses</Tab>
            <Tab>Gamification</Tab>
            <Tab>Clans</Tab>
            <Tab>Leaderboard</Tab>
          </TabList>

          <TabPanels>
            {/* COURSES TAB */}
            <TabPanel>
              <VStack spacing={12} align="stretch">
                <Fade in>
                  <VStack spacing={6} align="start">
                    <HStack>
                      <Icon as={FaBook} boxSize={8} color="purple.500" />
                      <Heading size="xl">Comprehensive Course Library</Heading>
                    </HStack>

                    {/* Sample Courses Grid */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                      {sampleCourses.map((course) => (
                        <ScaleFade in key={course.id}>
                          <Card
                            bg={cardBg}
                            borderColor={borderColor}
                            borderWidth="1px"
                            shadow="md"
                            _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                            transition="all 0.3s"
                            cursor="pointer"
                            onClick={() => setSelectedCourse(course)}
                          >
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              h="150px"
                              objectFit="cover"
                              borderTopRadius="md"
                            />
                            <CardBody>
                              <VStack spacing={3} align="start">
                                <Badge colorScheme="purple">Preview Available</Badge>
                                <Heading size="md" noOfLines={2}>
                                  {course.title}
                                </Heading>
                                <Text fontSize="sm" color={textColor} noOfLines={2}>
                                  {course.description}
                                </Text>
                                <Divider />
                                <HStack spacing={4} w="full" fontSize="xs" color={textColor}>
                                  <HStack spacing={1}>
                                    <Icon as={FaClock} />
                                    <Text>{course.duration}</Text>
                                  </HStack>
                                  <HStack spacing={1}>
                                    <Icon as={FaUsers} />
                                    <Text>{(course.activeLearners / 1000).toFixed(1)}k</Text>
                                  </HStack>
                                </HStack>
                                <Button
                                  w="full"
                                  size="sm"
                                  colorScheme="purple"
                                  variant="outline"
                                  onClick={() => setSelectedCourse(course)}
                                >
                                  View Details
                                </Button>
                              </VStack>
                            </CardBody>
                          </Card>
                        </ScaleFade>
                      ))}
                    </SimpleGrid>
                  </VStack>
                </Fade>

                {/* Course Details Modal */}
                {selectedCourse && (
                  <Fade in>
                    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" shadow="xl" p={6}>
                      <VStack spacing={6} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="lg">{selectedCourse.title}</Heading>
                          <Button
                            variant="ghost"
                            onClick={() => setSelectedCourse(null)}
                          >
                            ✕
                          </Button>
                        </HStack>

                        <Image
                          src={selectedCourse.thumbnail}
                          alt={selectedCourse.title}
                          h="300px"
                          objectFit="cover"
                          borderRadius="lg"
                        />

                        <Box>
                          <Text fontSize="lg" color={textColor}>
                            {selectedCourse.description}
                          </Text>
                        </Box>

                        {/* Course Stats */}
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                          <Stat>
                            <HStack spacing={2} mb={2}>
                              <Icon as={FaGraduationCap} color="purple.600" />
                              <Text fontWeight="bold" fontSize="sm">Instructor</Text>
                            </HStack>
                            <Text fontSize="sm">{selectedCourse.instructor}</Text>
                          </Stat>
                          <Stat>
                            <HStack spacing={2} mb={2}>
                              <Icon as={FaClock} color="blue.600" />
                              <Text fontWeight="bold" fontSize="sm">Duration</Text>
                            </HStack>
                            <Text fontSize="sm">{selectedCourse.duration}</Text>
                          </Stat>
                          <Stat>
                            <HStack spacing={2} mb={2}>
                              <Icon as={FaUsers} color="green.600" />
                              <Text fontWeight="bold" fontSize="sm">Learners</Text>
                            </HStack>
                            <Text fontSize="sm">{(selectedCourse.activeLearners / 1000).toFixed(1)}k</Text>
                          </Stat>
                          <Stat>
                            <HStack spacing={2} mb={2}>
                              <Icon as={FaTrophy} color="orange.600" />
                              <Text fontWeight="bold" fontSize="sm">Rating</Text>
                            </HStack>
                            <Text fontSize="sm">{selectedCourse.rating} ⭐</Text>
                          </Stat>
                        </SimpleGrid>

                        {/* Preview Warning */}
                        <Card bg={warningBg} borderLeftWidth="4px" borderLeftColor="orange.500">
                          <CardBody>
                            <HStack spacing={4}>
                              <Icon as={FaLock} fontSize="2xl" color="orange.600" flexShrink={0} />
                              <VStack spacing={1} align="flex-start">
                                <Text fontWeight="bold">You are exploring in preview mode</Text>
                                <Text fontSize="sm" color={textColor}>
                                  Complete lessons, challenges, and full content available only after joining.
                                </Text>
                              </VStack>
                            </HStack>
                          </CardBody>
                        </Card>

                        {/* Lessons Preview */}
                        <VStack spacing={3} align="stretch">
                          <Heading size="md">Sample Lessons ({selectedCourse.lessons} total)</Heading>
                          <Card bg={sectionBg}>
                            <CardBody>
                              <VStack spacing={2} align="start">
                                <HStack spacing={3}>
                                  <Icon as={FaPlayCircle} color="purple.500" />
                                  <VStack spacing={0} align="start">
                                    <Text fontWeight="bold">Lesson 1: Introduction</Text>
                                    <Text fontSize="xs" color={textColor}>15 min • Unlocked preview</Text>
                                  </VStack>
                                </HStack>
                                <HStack spacing={3} opacity={0.5}>
                                  <Icon as={FaLock} color="gray.400" />
                                  <VStack spacing={0} align="start">
                                    <Text fontWeight="bold">Lesson 2: Core Concepts</Text>
                                    <Text fontSize="xs" color={textColor}>Join to unlock</Text>
                                  </VStack>
                                </HStack>
                                <HStack spacing={3} opacity={0.5}>
                                  <Icon as={FaLock} color="gray.400" />
                                  <VStack spacing={0} align="start">
                                    <Text fontWeight="bold">Lesson 3: Advanced Topics</Text>
                                    <Text fontSize="xs" color={textColor}>Join to unlock</Text>
                                  </VStack>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        </VStack>
                      </VStack>
                    </Card>
                  </Fade>
                )}
              </VStack>
            </TabPanel>

            {/* GAMIFICATION TAB */}
            <TabPanel>
              <VStack spacing={12} align="stretch">
                <Fade in>
                  <VStack spacing={6} align="start" w="full">
                    <HStack>
                      <Icon as={FaMedal} boxSize={8} color="yellow.500" />
                      <Heading size="xl">Gamification System</Heading>
                    </HStack>

                    {/* Important Notice */}
                    <Card bg={warningBg} borderLeftWidth="4px" borderLeftColor="orange.500" borderWidth="1px" borderColor={borderColor}>
                      <CardBody>
                        <HStack spacing={4}>
                          <Icon as={FaMedal} fontSize="2xl" color="orange.600" flexShrink={0} />
                          <VStack spacing={1} align="flex-start">
                            <Text fontWeight="bold" fontSize="md">
                              No Grades • No Certificates • Just Fun Learning
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                              This is a preview. Full gamification is unlocked after joining.
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>

                    {/* Gamification Features Grid */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
                      {/* Points System */}
                      <Card
                        bg={cardBg}
                        borderWidth="1px"
                        borderColor={borderColor}
                        shadow="md"
                        _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                        transition="all 0.3s"
                      >
                        <CardBody>
                          <VStack spacing={6} align="flex-start">
                            <HStack spacing={3}>
                              <Box
                                w="12"
                                h="12"
                                bg="purple.100"
                                borderRadius="lg"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Icon as={FaChartLine} fontSize="xl" color="purple.600" />
                              </Box>
                              <VStack spacing={0} align="flex-start">
                                <Heading size="md">Points System</Heading>
                                <Text fontSize="xs" color={textColor}>
                                  Earn points through activities
                                </Text>
                              </VStack>
                            </HStack>

                            <Box w="full" p={3} bg={infoBg} borderRadius="lg">
                              <Text fontWeight="bold" fontSize="sm" mb={2}>
                                Points Earned From:
                              </Text>
                              <VStack spacing={2} align="flex-start" fontSize="sm">
                                <HStack justify="space-between" w="full">
                                  <Text>✅ Complete Lesson</Text>
                                  <Badge colorScheme="green">+10 pts</Badge>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <Text>🎯 Pass Challenge</Text>
                                  <Badge colorScheme="green">+25 pts</Badge>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <Text>🏆 Win Competition</Text>
                                  <Badge colorScheme="purple">+100 pts</Badge>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <Text>🔥 7-Day Streak</Text>
                                  <Badge colorScheme="orange">+50 pts</Badge>
                                </HStack>
                              </VStack>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Ranking System */}
                      <Card
                        bg={cardBg}
                        borderWidth="1px"
                        borderColor={borderColor}
                        shadow="md"
                        _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                        transition="all 0.3s"
                      >
                        <CardBody>
                          <VStack spacing={6} align="flex-start">
                            <HStack spacing={3}>
                              <Box
                                w="12"
                                h="12"
                                bg="yellow.100"
                                borderRadius="lg"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Icon as={FaTrophy} fontSize="xl" color="yellow.600" />
                              </Box>
                              <VStack spacing={0} align="flex-start">
                                <Heading size="md">Rank & Badges</Heading>
                                <Text fontSize="xs" color={textColor}>
                                  Progress through ranks
                                </Text>
                              </VStack>
                            </HStack>

                            <VStack spacing={3} w="full">
                              <VStack spacing={1} w="full" align="flex-start">
                                <HStack justify="space-between" w="full">
                                  <Text fontSize="sm" fontWeight="600">Novice Learner</Text>
                                  <Text fontSize="xs" color={textColor}>0-500 pts</Text>
                                </HStack>
                                <Progress value={20} colorScheme="blue" borderRadius="full" w="full" />
                              </VStack>
                              <VStack spacing={1} w="full" align="flex-start">
                                <HStack justify="space-between" w="full">
                                  <Text fontSize="sm" fontWeight="600">Expert Contributor</Text>
                                  <Text fontSize="xs" color={textColor}>500-2000 pts</Text>
                                </HStack>
                                <Progress value={60} colorScheme="purple" borderRadius="full" w="full" />
                              </VStack>
                              <VStack spacing={1} w="full" align="flex-start">
                                <HStack justify="space-between" w="full">
                                  <Text fontSize="sm" fontWeight="600">Master Scholar</Text>
                                  <Text fontSize="xs" color={textColor}>2000+ pts</Text>
                                </HStack>
                                <Progress value={90} colorScheme="orange" borderRadius="full" w="full" />
                              </VStack>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </VStack>
                </Fade>
              </VStack>
            </TabPanel>

            {/* CLANS TAB */}
            <TabPanel>
              <VStack spacing={12} align="start" w="full">
                <Fade in>
                  <VStack spacing={6} align="start" w="full">
                    <HStack>
                      <Icon as={FaTeamspeak} boxSize={8} color="blue.500" />
                      <Heading size="xl">Clan System - Learn Together</Heading>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                          <VStack spacing={4} align="start">
                            <Icon as={FaUsers} boxSize={8} color="purple.500" />
                            <Heading size="md">What Are Clans?</Heading>
                            <Text fontSize="sm" color={textColor}>
                              Study groups where learners collaborate, share knowledge, and grow together
                            </Text>
                            <Box w="full" p={4} bg={sectionBg} borderRadius="lg">
                              <Text fontSize="xs" fontWeight="600" mb={2}>Benefits:</Text>
                              <VStack spacing={2} align="start" fontSize="sm">
                                <HStack>
                                  <Icon as={FaCheckCircle} color="green.500" />
                                  <Text>Peer support and collaboration</Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FaCheckCircle} color="green.500" />
                                  <Text>Study group discussions</Text>
                                </HStack>
                                <HStack>
                                  <Icon as={FaCheckCircle} color="green.500" />
                                  <Text>Knowledge sharing</Text>
                                </HStack>
                              </VStack>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                          <VStack spacing={4} align="start">
                            <Icon as={FaTrophy} boxSize={8} color="yellow.500" />
                            <Heading size="md">Clan Competitions</Heading>
                            <Text fontSize="sm" color={textColor}>
                              Compete in seasonal competitions and climb the clan leaderboards
                            </Text>
                            <Box w="full" p={4} bg={sectionBg} borderRadius="lg">
                              <Text fontSize="xs" fontWeight="600" mb={2}>Features:</Text>
                              <VStack spacing={2} align="start" fontSize="sm">
                                <Text>📅 Seasonal competitions</Text>
                                <Text>🏆 Clan leaderboards</Text>
                                <Text>🎖️ Special badges</Text>
                                <Text>💎 Exclusive rewards</Text>
                              </VStack>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </VStack>
                </Fade>
              </VStack>
            </TabPanel>

            {/* LEADERBOARD TAB */}
            <TabPanel>
              <VStack spacing={12} align="start" w="full">
                <Fade in>
                  <VStack spacing={6} align="start" w="full">
                    <HStack>
                      <Icon as={FaMedal} boxSize={8} color="yellow.500" />
                      <Heading size="xl">Global Leaderboard</Heading>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                          <VStack spacing={4} align="start">
                            <Icon as={FaFire} boxSize={8} color="orange.500" />
                            <Heading size="md">Global Rankings</Heading>
                            <Text fontSize="sm" color={textColor}>
                              Compete with learners worldwide and claim your spot on the leaderboard
                            </Text>
                            <Box w="full">
                              <Text fontSize="xs" fontWeight="600" mb={2}>Top Rankings:</Text>
                              <VStack spacing={2} align="start" fontSize="sm">
                                <HStack justify="space-between" w="full">
                                  <HStack spacing={2}>
                                    <Text>🥇</Text>
                                    <Text>Alice Chen</Text>
                                  </HStack>
                                  <Badge colorScheme="orange">28,450 pts</Badge>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <HStack spacing={2}>
                                    <Text>🥈</Text>
                                    <Text>Bob Singh</Text>
                                  </HStack>
                                  <Badge colorScheme="gray">27,890 pts</Badge>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <HStack spacing={2}>
                                    <Text>🥉</Text>
                                    <Text>Carol Davis</Text>
                                  </HStack>
                                  <Badge colorScheme="yellow">26,234 pts</Badge>
                                </HStack>
                              </VStack>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                        <CardBody>
                          <VStack spacing={4} align="start">
                            <Icon as={FaChartLine} boxSize={8} color="blue.500" />
                            <Heading size="md">Clan Rankings</Heading>
                            <Text fontSize="sm" color={textColor}>
                              Join or create a clan to compete and earn collective rewards
                            </Text>
                            <Box w="full">
                              <Text fontSize="xs" fontWeight="600" mb={2}>Top Clans:</Text>
                              <VStack spacing={2} align="start" fontSize="sm">
                                <HStack justify="space-between" w="full">
                                  <HStack spacing={2}>
                                    <Text>👑</Text>
                                    <Text>Code Warriors</Text>
                                  </HStack>
                                  <Badge colorScheme="purple">2,456 members</Badge>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <HStack spacing={2}>
                                    <Text>⚡</Text>
                                    <Text>AI Innovators</Text>
                                  </HStack>
                                  <Badge colorScheme="cyan">1,892 members</Badge>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <HStack spacing={2}>
                                    <Text>🚀</Text>
                                    <Text>Web Dev Hub</Text>
                                  </HStack>
                                  <Badge colorScheme="green">1,634 members</Badge>
                                </HStack>
                              </VStack>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </VStack>
                </Fade>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* FINAL CTA SECTION */}
        <ScaleFade in initialScale={0.95}>
          <Card
            bg="linear(135deg, purple.600, blue.600)"
            color="white"
            borderWidth="0"
            shadow="2xl"
            mt={16}
          >
            <CardBody textAlign="center" py={12}>
              <VStack spacing={6}>
                <VStack spacing={2}>
                  <Heading size="xl">Ready to Start Your Learning Journey?</Heading>
                  <Text fontSize="lg" opacity={0.9} maxW="2xl">
                    Join thousands of learners on NextUniVerse and unlock your potential
                  </Text>
                </VStack>

                <HStack spacing={4} pt={4} flexWrap="wrap" justify="center">
                  <Button
                    size="lg"
                    bg="card.bg"
                    color="purple.600"
                    fontWeight="bold"
                    _hover={{ bg: 'gray.100' }}
                    onClick={handleJoinClick}
                    rightIcon={<Icon as={FaArrowRight} />}
                  >
                    {user ? 'Go to Dashboard' : 'Create Account'}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ bg: 'whiteAlpha.1' }}
                  >
                    Learn More
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </ScaleFade>
      </Container>
    </Box>
  );
};

export default ExplorePage;
