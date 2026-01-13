import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Card,
  CardBody,
  Stack,
  HStack,
  VStack,
  Select,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  useToast,
  Icon,
  Divider,
  Badge,
  Grid,
} from '@chakra-ui/react';
import {
  FaShieldAlt,
  FaUsers,
  FaLock,
  FaGlobe,
  FaSave,
  FaTimes,
} from 'react-icons/fa';

const ClanCreate = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: '',
    motto: '',
    logoUrl: '',
    bannerUrl: '',
    clanType: 'Academic',
    isPublic: true,
    requireApproval: false,
    maxMembers: 100,
    joinCriteria: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Clan name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Clan name must be at least 3 characters';
    }

    if (!formData.tag.trim()) {
      newErrors.tag = 'Clan tag is required';
    } else if (formData.tag.length < 2 || formData.tag.length > 10) {
      newErrors.tag = 'Clan tag must be 2-10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.maxMembers < 2 || formData.maxMembers > 500) {
      newErrors.maxMembers = 'Max members must be between 2 and 500';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await api.post('/clans', formData);
      toast({
        title: 'Clan Created!',
        description: `${formData.name} has been created successfully`,
        status: 'success',
        duration: 3000,
      });
      navigate(`/clans/${data?.clan?.id}`);
    } catch (error) {
      toast({
        title: 'Failed to create clan',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container maxW="4xl">
        {/* Header */}
        <VStack spacing={2} mb={8} textAlign="center">
          <Icon
            as={FaShieldAlt}
            boxSize={16}
            color="purple.500"
            mb={2}
          />
          <Heading size="2xl">Create Your Clan</Heading>
          <Text color="gray.600" fontSize="lg">
            Build a learning community and compete together
          </Text>
        </VStack>

        <Card
          bg={useColorModeValue('white', 'gray.700')}
          shadow="xl"
        >
          <CardBody>
            <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
                {/* Basic Information */}
                <Box>
                  <Heading size="md" mb={4} color="purple.600">
                    Basic Information
                  </Heading>

                  <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={4}>
                    <FormControl isInvalid={errors.name} isRequired>
                      <FormLabel>Clan Name</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., Elite Coders"
                        maxLength={100}
                      />
                      <FormHelperText>
                        Choose a unique and memorable name
                      </FormHelperText>
                      {errors.name && (
                        <FormErrorMessage>{errors.name}</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl isInvalid={errors.tag} isRequired>
                      <FormLabel>Clan Tag</FormLabel>
                      <Input
                        value={formData.tag}
                        onChange={(e) =>
                          handleChange('tag', e.target.value.toUpperCase())
                        }
                        placeholder="e.g., ELITE"
                        maxLength={10}
                      />
                      <FormHelperText>2-10 chars</FormHelperText>
                      {errors.tag && (
                        <FormErrorMessage>{errors.tag}</FormErrorMessage>
                      )}
                    </FormControl>
                  </Grid>

                  <FormControl isInvalid={errors.description} isRequired mt={4}>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleChange('description', e.target.value)
                      }
                      placeholder="Describe your clan's purpose and goals..."
                      rows={4}
                    />
                    {errors.description && (
                      <FormErrorMessage>{errors.description}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl mt={4}>
                    <FormLabel>Motto (Optional)</FormLabel>
                    <Input
                      value={formData.motto}
                      onChange={(e) => handleChange('motto', e.target.value)}
                      placeholder="e.g., Learn Together, Win Together"
                      maxLength={100}
                    />
                    <FormHelperText>A short inspirational phrase</FormHelperText>
                  </FormControl>
                </Box>

                <Divider />

                {/* Appearance */}
                <Box>
                  <Heading size="md" mb={4} color="purple.600">
                    Appearance
                  </Heading>

                  <FormControl>
                    <FormLabel>Logo URL (Optional)</FormLabel>
                    <Input
                      value={formData.logoUrl}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      type="url"
                    />
                  </FormControl>

                  <FormControl mt={4}>
                    <FormLabel>Banner URL (Optional)</FormLabel>
                    <Input
                      value={formData.bannerUrl}
                      onChange={(e) =>
                        handleChange('bannerUrl', e.target.value)
                      }
                      placeholder="https://example.com/banner.png"
                      type="url"
                    />
                  </FormControl>
                </Box>

                <Divider />

                {/* Settings */}
                <Box>
                  <Heading size="md" mb={4} color="purple.600">
                    Clan Settings
                  </Heading>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <FormControl>
                      <FormLabel>Clan Type</FormLabel>
                      <Select
                        value={formData.clanType}
                        onChange={(e) =>
                          handleChange('clanType', e.target.value)
                        }
                      >
                        <option value="Academic">Academic</option>
                        <option value="Competitive">Competitive</option>
                        <option value="Social">Social</option>
                        <option value="StudyGroup">Study Group</option>
                      </Select>
                    </FormControl>

                    <FormControl isInvalid={errors.maxMembers}>
                      <FormLabel>Max Members</FormLabel>
                      <NumberInput
                        value={formData.maxMembers}
                        onChange={(_, value) =>
                          handleChange('maxMembers', value)
                        }
                        min={2}
                        max={500}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      {errors.maxMembers && (
                        <FormErrorMessage>
                          {errors.maxMembers}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </Grid>

                  <Stack spacing={4} mt={4}>
                    <Card
                      variant="outline"
                      bg={formData.isPublic ? 'green.50' : 'orange.50'}
                    >
                      <CardBody>
                        <HStack justify="space-between">
                          <HStack spacing={3}>
                            <Icon
                              as={formData.isPublic ? FaGlobe : FaLock}
                              boxSize={5}
                              color={formData.isPublic ? 'green.600' : 'orange.600'}
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">
                                {formData.isPublic ? 'Public Clan' : 'Private Clan'}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {formData.isPublic
                                  ? 'Anyone can find and join'
                                  : 'Invitation only'}
                              </Text>
                            </VStack>
                          </HStack>
                          <Switch
                            colorScheme="purple"
                            isChecked={formData.isPublic}
                            onChange={(e) =>
                              handleChange('isPublic', e.target.checked)
                            }
                            size="lg"
                          />
                        </HStack>
                      </CardBody>
                    </Card>

                    <Card
                      variant="outline"
                      bg={formData.requireApproval ? 'orange.50' : 'green.50'}
                    >
                      <CardBody>
                        <HStack justify="space-between">
                          <HStack spacing={3}>
                            <Icon
                              as={FaUsers}
                              boxSize={5}
                              color={
                                formData.requireApproval
                                  ? 'orange.600'
                                  : 'green.600'
                              }
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">
                                {formData.requireApproval
                                  ? 'Require Approval'
                                  : 'Auto Join'}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {formData.requireApproval
                                  ? 'Leader approves join requests'
                                  : 'Members join instantly'}
                              </Text>
                            </VStack>
                          </HStack>
                          <Switch
                            colorScheme="purple"
                            isChecked={formData.requireApproval}
                            onChange={(e) =>
                              handleChange('requireApproval', e.target.checked)
                            }
                            size="lg"
                          />
                        </HStack>
                      </CardBody>
                    </Card>
                  </Stack>

                  {formData.requireApproval && (
                    <FormControl mt={4}>
                      <FormLabel>Join Criteria (Optional)</FormLabel>
                      <Textarea
                        value={formData.joinCriteria}
                        onChange={(e) =>
                          handleChange('joinCriteria', e.target.value)
                        }
                        placeholder="Describe the requirements for joining your clan..."
                        rows={3}
                      />
                      <FormHelperText>
                        Let members know what you're looking for
                      </FormHelperText>
                    </FormControl>
                  )}
                </Box>

                <Divider />

                {/* Summary */}
                <Box
                  p={4}
                  borderRadius="md"
                  bg={useColorModeValue('purple.50', 'purple.900')}
                >
                  <Heading size="sm" mb={3}>
                    Summary
                  </Heading>
                  <HStack spacing={2} flexWrap="wrap">
                    <Badge colorScheme="purple">{formData.clanType}</Badge>
                    <Badge colorScheme={formData.isPublic ? 'green' : 'orange'}>
                      {formData.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <Badge colorScheme="blue">
                      Max {formData.maxMembers} members
                    </Badge>
                    {formData.requireApproval && (
                      <Badge colorScheme="orange">Requires Approval</Badge>
                    )}
                  </HStack>
                </Box>

                {/* Action Buttons */}
                <HStack spacing={4} justify="flex-end">
                  <Button
                    variant="ghost"
                    leftIcon={<FaTimes />}
                    onClick={() => navigate('/clans')}
                    isDisabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="purple"
                    leftIcon={<FaSave />}
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText="Creating..."
                    size="lg"
                  >
                    Create Clan
                  </Button>
                </HStack>
              </Stack>
            </form>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default ClanCreate;
