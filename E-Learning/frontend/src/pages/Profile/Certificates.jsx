import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  Grid,
  useColorModeValue,
  Spinner,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FaArrowLeft, FaCertificate, FaDownload, FaShare, FaCheck } from 'react-icons/fa';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      // Mock data for demonstration
      setTimeout(() => {
        setCertificates([
          {
            id: 1,
            courseTitle: 'Advanced JavaScript',
            completionDate: '2025-12-20',
            certificateNumber: 'CERT-2025-1234',
            instructor: 'Jane Smith',
            grade: 'A+',
          },
          {
            id: 2,
            courseTitle: 'React Fundamentals',
            completionDate: '2025-11-15',
            certificateNumber: 'CERT-2025-5678',
            instructor: 'John Doe',
            grade: 'A',
          },
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setIsLoading(false);
    }
  };

  const handleDownload = (certId) => {
    toast({
      title: 'Downloading',
      description: 'Your certificate is being downloaded',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShare = (certId) => {
    toast({
      title: 'Share',
      description: 'Share functionality coming soon!',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="6xl">
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          mb={6}
          onClick={() => navigate('/profile')}
        >
          Back to Profile
        </Button>

        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Heading size="lg">My Certificates</Heading>
            <Badge colorScheme="purple" px={4} py={2} fontSize="md">
              {certificates.length} Certificate{certificates.length !== 1 ? 's' : ''}
            </Badge>
          </HStack>

          {certificates.length === 0 ? (
            <Card bg={cardBg} shadow="md">
              <CardBody p={12} textAlign="center">
                <Icon as={FaCertificate} fontSize="5xl" color="gray.400" mb={4} />
                <Heading size="md" mb={2}>No Certificates Yet</Heading>
                <Text color="gray.600" mb={4}>
                  Complete courses to earn certificates
                </Text>
                <Button colorScheme="purple" onClick={() => navigate('/courses')}>
                  Browse Courses
                </Button>
              </CardBody>
            </Card>
          ) : (
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              {certificates.map((cert) => (
                <Card
                  key={cert.id}
                  bg={cardBg}
                  shadow="lg"
                  borderTop="4px"
                  borderColor="purple.500"
                  transition="all 0.3s"
                  _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                >
                  <CardBody p={6}>
                    <VStack align="stretch" spacing={4}>
                      {/* Certificate Header */}
                      <HStack justify="space-between">
                        <Icon as={FaCertificate} fontSize="3xl" color="purple.500" />
                        <Badge colorScheme="green" leftIcon={<FaCheck />} px={3} py={1}>
                          Verified
                        </Badge>
                      </HStack>

                      {/* Course Info */}
                      <VStack align="stretch" spacing={2}>
                        <Heading size="md">{cert.courseTitle}</Heading>
                        <Text color="gray.600" fontSize="sm">
                          Instructor: {cert.instructor}
                        </Text>
                      </VStack>

                      {/* Certificate Details */}
                      <VStack align="stretch" spacing={1} fontSize="sm" color="gray.600">
                        <HStack justify="space-between">
                          <Text>Certificate No:</Text>
                          <Text fontWeight="bold" color="purple.600">
                            {cert.certificateNumber}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Completion Date:</Text>
                          <Text fontWeight="bold">
                            {new Date(cert.completionDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Grade:</Text>
                          <Badge colorScheme="green">{cert.grade}</Badge>
                        </HStack>
                      </VStack>

                      {/* Action Buttons */}
                      <HStack spacing={2}>
                        <Button
                          flex={1}
                          size="sm"
                          colorScheme="purple"
                          leftIcon={<FaDownload />}
                          onClick={() => handleDownload(cert.id)}
                        >
                          Download
                        </Button>
                        <Button
                          flex={1}
                          size="sm"
                          variant="outline"
                          colorScheme="purple"
                          leftIcon={<FaShare />}
                          onClick={() => handleShare(cert.id)}
                        >
                          Share
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Certificates;
