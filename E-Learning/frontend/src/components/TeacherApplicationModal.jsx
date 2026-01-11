import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  VStack,
  HStack,
  Text,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  Icon,
} from '@chakra-ui/react';
import { FaClipboard, FaCheck, FaClock, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const TeacherApplicationModal = ({ userId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [formData, setFormData] = useState({
    reasonForApplying: '',
    qualificationDetails: '',
    experienceArea: '',
  });
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Fetch current application status
  useEffect(() => {
    if (isOpen) {
      fetchApplicationStatus();
    }
  }, [isOpen]);

  const fetchApplicationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/teachers/my-application', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCurrentStatus(response.data.application);
      }
    } catch (error) {
      // No application yet is not an error, just means status is null
      setCurrentStatus(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reasonForApplying.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for applying',
        status: 'warning',
        duration: 3,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/teachers/apply',
        {
          reasonForApplying: formData.reasonForApplying,
          qualificationDetails: formData.qualificationDetails,
          experienceArea: formData.experienceArea,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: response.data.message,
          status: 'success',
          duration: 5,
          isClosable: true,
        });
        setFormData({
          reasonForApplying: '',
          qualificationDetails: '',
          experienceArea: '',
        });
        fetchApplicationStatus();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to submit application';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'yellow';
      case 'Approved':
        return 'green';
      case 'Rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return FaClock;
      case 'Approved':
        return FaCheck;
      case 'Rejected':
        return FaTimes;
      default:
        return FaClipboard;
    }
  };

  return (
    <>
      <Button
        leftIcon={<FaClipboard />}
        colorScheme="purple"
        variant="outline"
        onClick={onOpen}
        w={{ base: 'full', md: 'auto' }}
      >
        Apply to Become Teacher
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>Apply to Become a Teacher</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              {/* Current Status */}
              {currentStatus && (
                <Card w="full" borderColor={borderColor} borderWidth="1px">
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={getStatusIcon(currentStatus.status)} />
                        <Text fontWeight="bold">Application Status</Text>
                      </HStack>
                      <Badge
                        colorScheme={getStatusColor(currentStatus.status)}
                        fontSize="md"
                        px={3}
                        py={1}
                      >
                        {currentStatus.status}
                      </Badge>
                      <Text fontSize="sm" color="gray.600">
                        Submitted: {new Date(currentStatus.applicationDate).toLocaleDateString()}
                      </Text>
                      {currentStatus.reviewedDate && (
                        <Text fontSize="sm" color="gray.600">
                          Reviewed: {new Date(currentStatus.reviewedDate).toLocaleDateString()}
                        </Text>
                      )}
                      {currentStatus.adminRemarks && (
                        <Box
                          w="full"
                          p={2}
                          bg="gray.100"
                          borderRadius="md"
                          fontSize="sm"
                        >
                          <Text fontWeight="bold" mb={1}>
                            Admin Remarks:
                          </Text>
                          <Text>{currentStatus.adminRemarks}</Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* If already approved or pending, show different message */}
              {currentStatus && currentStatus.status !== 'Rejected' ? (
                <Alert
                  status={
                    currentStatus.status === 'Approved' ? 'success' : 'info'
                  }
                  borderRadius="md"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle>
                      {currentStatus.status === 'Approved'
                        ? 'Congratulations!'
                        : 'Application Pending'}
                    </AlertTitle>
                    <AlertDescription>
                      {currentStatus.status === 'Approved'
                        ? 'You are now a teacher! You can create courses and manage students.'
                        : 'Your application is being reviewed by our admin team. We will notify you soon.'}
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                // Application Form
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="bold">
                        Why do you want to become a teacher?
                      </FormLabel>
                      <Textarea
                        name="reasonForApplying"
                        value={formData.reasonForApplying}
                        onChange={handleChange}
                        placeholder="Share your passion for teaching and what subjects/areas you want to teach..."
                        minH="120px"
                        borderColor={borderColor}
                        _focus={{
                          borderColor: 'purple.500',
                          boxShadow: '0 0 0 1px #805AD5',
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="bold">
                        Your Qualifications
                      </FormLabel>
                      <Textarea
                        name="qualificationDetails"
                        value={formData.qualificationDetails}
                        onChange={handleChange}
                        placeholder="e.g., Bachelor's degree in Computer Science, 5 years of industry experience..."
                        minH="100px"
                        borderColor={borderColor}
                        _focus={{
                          borderColor: 'purple.500',
                          boxShadow: '0 0 0 1px #805AD5',
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="bold">
                        Areas of Expertise
                      </FormLabel>
                      <Input
                        name="experienceArea"
                        value={formData.experienceArea}
                        onChange={handleChange}
                        placeholder="e.g., Web Development, Machine Learning, Data Science..."
                        borderColor={borderColor}
                        _focus={{
                          borderColor: 'purple.500',
                          boxShadow: '0 0 0 1px #805AD5',
                        }}
                      />
                    </FormControl>

                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Review Process</AlertTitle>
                        <AlertDescription>
                          Your application will be reviewed by our admin team
                          within 24-48 hours. You'll receive an email with the
                          decision.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </VStack>

                  <HStack spacing={3} mt={6} justify="flex-end">
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="purple"
                      isLoading={isSubmitting}
                      loadingText="Submitting..."
                    >
                      Submit Application
                    </Button>
                  </HStack>
                </form>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TeacherApplicationModal;
