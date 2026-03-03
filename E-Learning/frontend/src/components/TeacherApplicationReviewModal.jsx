import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Textarea,
  Text,
  Box,
  Badge,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { normalizeUrl } from '../utils/imageUtils';

const TeacherApplicationReviewModal = ({
  isOpen,
  onClose,
  application,
  onReviewComplete,
}) => {
  const [decision, setDecision] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  // Force dark-modal colors to match admin dark UI
  const bgColor = 'gray.900';
  const borderColor = 'gray.700';
  const boxBgColor = 'gray.800';

  const handleApprove = async () => {
    await submitReview('Approved');
  };

  const handleReject = async () => {
    await submitReview('Rejected');
  };

  const submitReview = async (decisionValue) => {
    if (!remarks.trim() && decisionValue === 'Rejected') {
      toast({
        title: 'Validation Error',
        description: 'Please provide remarks for rejection',
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
        `http://localhost:5145/api/teachers/applications/${application.id}/review`,
        {
          decision: decisionValue,
          adminRemarks: remarks,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: response.data.message,
          status: 'success',
          duration: 3,
          isClosable: true,
        });
        setRemarks('');
        setDecision('');
        onClose();
        onReviewComplete();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to review application';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Review Teacher Application</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Applicant Info */}
            <Box borderBottom="1px solid" borderColor={borderColor} pb={4}>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold" fontSize="lg" color="whiteAlpha.900">
                  {application.applicantName}
                </Text>
                <Badge colorScheme="yellow">{application.status ?? 'Pending'}</Badge>
              </HStack>
              <Text fontSize="sm" color="gray.300">
                {application.applicantEmail}
              </Text>
              <Text fontSize="xs" color="gray.400" mt={1}>
                Applied: {application.applicationDate ? new Date(application.applicationDate).toLocaleString() : 'N/A'}
              </Text>
            </Box>

            {/* Application Details */}
            <Box>
              <Text fontWeight="bold" mb={2}>
                Reason for Applying:
              </Text>
              <Box
                bg={boxBgColor}
                p={3}
                borderRadius="md"
                fontSize="sm"
                color="gray.100"
              >
                {application.reasonForApplying}
              </Box>
            </Box>

            {application.qualificationDetails && (
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Qualifications:
                </Text>
                <Box
                  bg={boxBgColor}
                  p={3}
                  borderRadius="md"
                  fontSize="sm"
                  color="gray.100"
                >
                  {application.qualificationDetails}
                </Box>
              </Box>
            )}

            {application.experienceArea && (
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Areas of Expertise:
                </Text>
                <Box
                  bg={boxBgColor}
                  p={3}
                  borderRadius="md"
                  fontSize="sm"
                  color="gray.100"
                >
                  {application.experienceArea}
                </Box>
              </Box>
            )}

            {(application.idType || application.idNumber) && (
              <Box>
                <Text fontWeight="bold" mb={2}>
                  ID Verification:
                </Text>
                <Box
                  bg={boxBgColor}
                  p={3}
                  borderRadius="md"
                  fontSize="sm"
                  color="gray.100"
                >
                  <Text>Type: {application.idType || 'N/A'}</Text>
                  <Text>Number: {application.idNumber || 'N/A'}</Text>
                </Box>
              </Box>
            )}

            {(application.idFrontImagePath || application.idBackImagePath) && (
              <Box>
                <Text fontWeight="bold" mb={2}>ID Images:</Text>
                <HStack spacing={4} align="start" flexWrap="wrap">
                  {application.idFrontImagePath && (
                    <Box>
                      <Text fontSize="xs" color="gray.400" mb={1}>Front</Text>
                      <Box
                        as="img"
                        src={normalizeUrl(application.idFrontImagePath)}
                        alt="ID Front"
                        maxH="160px"
                        borderRadius="md"
                        border="1px solid"
                        borderColor={borderColor}
                      />
                    </Box>
                  )}
                  {application.idBackImagePath && (
                    <Box>
                      <Text fontSize="xs" color="gray.400" mb={1}>Back</Text>
                      <Box
                        as="img"
                        src={normalizeUrl(application.idBackImagePath)}
                        alt="ID Back"
                        maxH="160px"
                        borderRadius="md"
                        border="1px solid"
                        borderColor={borderColor}
                      />
                    </Box>
                  )}
                </HStack>
              </Box>
            )}

            {/* Admin Review Section */}
            {application.status === 'Pending' && (
              <>
                <FormControl>
                  <FormLabel fontWeight="bold" color="gray.100">Admin Remarks</FormLabel>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks for the applicant (especially if rejecting)..."
                    minH="120px"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'purple.500',
                      boxShadow: '0 0 0 1px #805AD5',
                    }}
                    bg={boxBgColor}
                    color="gray.100"
                  />
                </FormControl>

                <Text fontSize="sm" color="gray.400">
                  Your remarks will be shared with the applicant
                </Text>
              </>
            )}

            {/* Already Reviewed */}
            {application.status !== 'Pending' && (
              <Box borderTop="1px solid" borderColor={borderColor} pt={4}>
                <Text fontWeight="bold" mb={2} color="whiteAlpha.900">
                  Review Decision:
                </Text>
                <HStack spacing={2} mb={3}>
                  <Badge
                    colorScheme={application.status === 'Approved' ? 'green' : 'red'}
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    {application.status}
                  </Badge>
                  <Text fontSize="sm" color="gray.400">
                    {application.reviewedDate &&
                      new Date(application.reviewedDate).toLocaleDateString()}
                  </Text>
                </HStack>
                {application.adminRemarks && (
                  <Box
                    bg={boxBgColor}
                    p={3}
                    borderRadius="md"
                    fontSize="sm"
                    color="gray.100"
                  >
                    <Text fontWeight="bold" mb={1}>
                      Remarks:
                    </Text>
                    <Text>{application.adminRemarks}</Text>
                  </Box>
                )}
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          {application.status === 'Pending' ? (
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleReject}
                isLoading={isSubmitting}
                loadingText="Rejecting..."
              >
                Reject
              </Button>
              <Button
                colorScheme="green"
                onClick={handleApprove}
                isLoading={isSubmitting}
                loadingText="Approving..."
              >
                Approve
              </Button>
            </HStack>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TeacherApplicationReviewModal;
