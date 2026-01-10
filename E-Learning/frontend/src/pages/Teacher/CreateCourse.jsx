import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  useToast,
  Spinner,
  Flex,
  Grid,
  GridItem,
  Divider,
  Icon,
  Progress
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateCourse = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    overview: '',
    universityId: '',
    departmentId: '',
    price: '0',
    difficulty: 'Beginner',
    isFree: true,
    language: 'English',
    category: 'Programming',
    courseImage: '',
    instructor: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await axios.get('/api/universities');
      setUniversities(response.data.universities || []);
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const fetchDepartments = async (universityId) => {
    try {
      const response = await axios.get(`/api/departments?universityId=${universityId}`);
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUniversityChange = (e) => {
    const universityId = e.target.value;
    setSelectedUniversity(universityId);
    setFormData(prev => ({
      ...prev,
      universityId: universityId,
      departmentId: ''
    }));
    if (universityId) {
      fetchDepartments(universityId);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Course title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.overview.trim()) newErrors.overview = 'Course overview is required';
    if (!formData.universityId) newErrors.universityId = 'University is required';
    if (!formData.departmentId) newErrors.departmentId = 'Department is required';
    if (!formData.isFree && (!formData.price || parseFloat(formData.price) <= 0)) {
      newErrors.price = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const submitData = {
        title: formData.title,
        description: formData.description,
        overview: formData.overview,
        universityId: parseInt(formData.universityId),
        departmentId: parseInt(formData.departmentId),
        price: formData.isFree ? 0 : parseFloat(formData.price),
        difficulty: formData.difficulty,
        language: formData.language,
        category: formData.category,
        courseImageUrl: formData.courseImage
      };

      const response = await axios.post('/api/courses', submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: response.data.message || 'Course created successfully! Waiting for admin approval.',
        status: 'success',
        duration: 3000
      });

      setTimeout(() => navigate('/teacher/manage-courses'), 1500);
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create course',
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Programming', 'Design', 'Business', 'Science', 'Language', 'Arts', 'Mathematics', 'Other'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const languages = ['English', 'Bengali', 'Hindi', 'Spanish', 'French', 'German', 'Japanese'];

  return (
    <Container maxW="container.lg" py={8}>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <HStack spacing={4} pb={4} borderBottom="1px solid #e2e8f0">
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            onClick={() => navigate('/teacher/manage-courses')}
          >
            Back
          </Button>
          <Heading size="lg">Create New Course</Heading>
        </HStack>

        {/* Form Card */}
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {/* Basic Information */}
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Basic Information</Heading>
                  <Divider />

                  <FormControl isRequired isInvalid={!!errors.title}>
                    <FormLabel fontWeight="bold">Course Title</FormLabel>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter course title"
                      size="lg"
                    />
                    {errors.title && <Text color="red.500" fontSize="sm">{errors.title}</Text>}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.description}>
                    <FormLabel fontWeight="bold">Course Description</FormLabel>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe what students will learn"
                      rows={4}
                    />
                    {errors.description && <Text color="red.500" fontSize="sm">{errors.description}</Text>}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.overview}>
                    <FormLabel fontWeight="bold">Course Overview</FormLabel>
                    <Textarea
                      name="overview"
                      value={formData.overview}
                      onChange={handleChange}
                      placeholder="Provide a brief overview of the course"
                      rows={4}
                    />
                    {errors.overview && <Text color="red.500" fontSize="sm">{errors.overview}</Text>}
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="bold">Course Image URL</FormLabel>
                    <Input
                      name="courseImage"
                      value={formData.courseImage}
                      onChange={handleChange}
                      placeholder="https://example.com/course-image.jpg"
                    />
                  </FormControl>
                </VStack>

                {/* Institution Information */}
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Institution Information</Heading>
                  <Divider />

                  <FormControl isRequired isInvalid={!!errors.universityId}>
                    <FormLabel fontWeight="bold">University</FormLabel>
                    <Select
                      name="universityId"
                      value={selectedUniversity}
                      onChange={handleUniversityChange}
                      placeholder="Select university"
                    >
                      {universities.map(uni => (
                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                      ))}
                    </Select>
                    {errors.universityId && <Text color="red.500" fontSize="sm">{errors.universityId}</Text>}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.departmentId}>
                    <FormLabel fontWeight="bold">Department</FormLabel>
                    <Select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      placeholder={selectedUniversity ? "Select department" : "Please select university first"}
                      isDisabled={!selectedUniversity}
                    >
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </Select>
                    {errors.departmentId && <Text color="red.500" fontSize="sm">{errors.departmentId}</Text>}
                  </FormControl>
                </VStack>

                {/* Course Details */}
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Course Details</Heading>
                  <Divider />

                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="bold">Category</FormLabel>
                        <Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="bold">Difficulty Level</FormLabel>
                        <Select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleChange}
                        >
                          {difficulties.map(diff => (
                            <option key={diff} value={diff}>{diff}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="bold">Language</FormLabel>
                        <Select
                          name="language"
                          value={formData.language}
                          onChange={handleChange}
                        >
                          {languages.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl display="flex" alignItems="flex-end" h="100%">
                        <HStack>
                          <input
                            type="checkbox"
                            name="isFree"
                            checked={formData.isFree}
                            onChange={handleChange}
                            id="isFree"
                          />
                          <FormLabel htmlFor="isFree" mb="0">
                            This is a Free Course
                          </FormLabel>
                        </HStack>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {!formData.isFree && (
                    <FormControl isInvalid={!!errors.price}>
                      <FormLabel fontWeight="bold">Course Price ($)</FormLabel>
                      <Input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                      {errors.price && <Text color="red.500" fontSize="sm">{errors.price}</Text>}
                    </FormControl>
                  )}
                </VStack>

                {/* Submit Button */}
                <HStack spacing={4} pt={4}>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<FiSave />}
                    isLoading={loading}
                    type="submit"
                    minW="150px"
                  >
                    Create Course
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/teacher/manage-courses')}
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default CreateCourse;
