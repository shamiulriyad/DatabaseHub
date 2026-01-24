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
  Heading,
  Text,
  useToast,
  Spinner,
  Flex,
  Grid,
  GridItem,
  Divider,
  Checkbox,
  Badge,
  SimpleGrid
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiSearch, FiUpload } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const CreateCourse = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [universityQuery, setUniversityQuery] = useState('');
  const [uniLoading, setUniLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);
  const [showUniversityCards, setShowUniversityCards] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    overview: '',
    universityId: '',
    departmentId: '',
    courseCode: '',
    courseType: '',
    price: '0',
    difficulty: 'Beginner',
    isFree: true,
    language: 'English',
    category: 'Programming',
    courseImage: '',
    instructor: '',
    previewVideoUrl: '',
    youtubeUrl: ''
  });

  const [videoParts, setVideoParts] = useState([
    { title: '', description: '', videoUrl: '', youtubeUrl: '', isPreview: false }
  ]);

  const [errors, setErrors] = useState({});

  // Initial fetch of universities only
  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    setUniLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/universities', { 
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      });
      
      const payload = response.data?.data ?? response.data?.universities ?? response.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (payload?.items && Array.isArray(payload.items)) list = payload.items;
      else list = [];

      const mapped = list.map(u => ({
        id: (u.id ?? u.Id)?.toString(),
        name: u.name ?? u.Name,
        code: u.code ?? u.Code,
        description: u.description || ''
      }));
      setUniversities(mapped);
    } catch (error) {
      console.error('Error fetching universities:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load universities', 
        status: 'error', 
        duration: 3000 
      });
    } finally {
      setUniLoading(false);
    }
  };

  const fetchDepartments = async (universityId) => {
    if (!universityId) {
      setDepartments([]);
      return;
    }

    setDeptLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/universities/${universityId}/departments`, { 
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      });

      const payload = response.data?.data ?? response.data?.departments ?? response.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (payload?.items && Array.isArray(payload.items)) list = payload.items;
      else list = [];

      const mapped = list.map(d => ({
        id: (d.id ?? d.Id)?.toString(),
        name: d.name ?? d.Name
      }));

      console.log('API থেকে আসা ডিপার্টমেন্ট:', mapped); // Debug
      setDepartments(mapped);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load departments', 
        status: 'error', 
        duration: 3000 
      });
      setDepartments([]);
    } finally {
      setDeptLoading(false);
    }
  };

  const handleUniversitySelection = (uni) => {
    const universityId = uni.id.toString();
    setSelectedUniversity(universityId);
    setFormData(prev => ({
      ...prev,
      universityId: universityId,
      departmentId: '' // Reset department when university changes
    }));
    setUniversityQuery('');
    setShowUniversityCards(false); // Hide cards after selection
    
    // Clear errors
    setErrors(prev => ({ 
      ...prev, 
      universityId: '', 
      departmentId: '' 
    }));
    
    // Fetch departments for this university
    fetchDepartments(universityId);
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
    const universityId = e.target.value?.toString() ?? '';
    if (universityId) {
      const uni = universities.find(u => u.id.toString() === universityId);
      if (uni) {
        handleUniversitySelection(uni);
      }
    } else {
      // Clear selection
      setSelectedUniversity('');
      setFormData(prev => ({
        ...prev,
        universityId: '',
        departmentId: ''
      }));
      setDepartments([]);
      setShowUniversityCards(true); // Show cards when no university selected
    }
  };

  const toggleUniversityCards = () => {
    setShowUniversityCards(!showUniversityCards);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Course title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.overview.trim()) newErrors.overview = 'Course overview is required';
    if (!formData.courseCode.trim()) newErrors.courseCode = 'Course code is required';
    if (!formData.courseType.trim()) newErrors.courseType = 'Course type is required';
    if (!formData.universityId) newErrors.universityId = 'University is required';
    if (!formData.departmentId) newErrors.departmentId = 'Department is required';
    // Require either a video upload or a YouTube URL
    if (!formData.previewVideoUrl && !formData.youtubeUrl) newErrors.previewVideoUrl = 'You must provide a preview video file or a YouTube URL (max 5 minutes)';
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
        shortDescription: formData.description,
        fullDescription: formData.overview,
        universityId: parseInt(formData.universityId),
        departmentId: parseInt(formData.departmentId),
        courseCode: formData.courseCode,
        courseType: formData.courseType,
        isFree: formData.isFree,
        price: formData.isFree ? 0 : parseFloat(formData.price),
        difficultyLevel: formData.difficulty,
        thumbnailUrl: formData.courseImage,
        previewVideoUrl: formData.youtubeUrl?.trim() ? formData.youtubeUrl.trim() : formData.previewVideoUrl,
        videoParts: videoParts
          .filter(p => p.title?.trim())
          .map((p, idx) => ({
            title: p.title,
            description: p.description,
            videoUrl: p.videoUrl,
            youTubeUrl: p.youtubeUrl,
            order: idx + 1,
            isPreview: !!p.isPreview
          })),
        language: formData.language,
        category: formData.category
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

  const updatePart = (index, key, value) => {
    setVideoParts(prev => prev.map((p, i) => i === index ? { ...p, [key]: value } : p));
  };

  const addPart = () => setVideoParts(prev => ([...prev, { title: '', description: '', videoUrl: '', youtubeUrl: '', isPreview: false }]));
  const removePart = (index) => setVideoParts(prev => prev.filter((_, i) => i !== index));

  const filteredUniversities = universities.filter(u => {
    if (!universityQuery) return true;
    const query = universityQuery.toLowerCase();
    return (u.name || '').toLowerCase().includes(query) || 
           (u.code || '').toLowerCase().includes(query);
  });

  const getSelectedUniversityName = () => {
    if (!selectedUniversity) return '';
    const uni = universities.find(u => u.id.toString() === selectedUniversity.toString());
    return uni ? `${uni.name} ${uni.code ? `(${uni.code})` : ''}` : '';
  };

  const categories = ['Programming', 'Design', 'Business', 'Science', 'Language', 'Arts', 'Mathematics', 'Other'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const languages = ['English', 'Bengali', 'Hindi', 'Spanish', 'French', 'German', 'Japanese'];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack align="stretch" spacing={8}>
        {/* Header */}
        <Box>
          <HStack spacing={4} mb={6}>
            <Button
              variant="ghost"
              leftIcon={<FiArrowLeft />}
              onClick={() => navigate('/teacher/manage-courses')}
              size="lg"
            >
              Back
            </Button>
            <Heading size="xl" fontWeight="bold">Create New Course</Heading>
          </HStack>
          <Box mb={4}>
            <Text color="gray.600" fontSize="lg">Complete all required fields to create your course</Text>
            <Box mt={2} w="100%" h="4px" bg="gray.200" borderRadius="full" overflow="hidden">
              <Box w="40%" h="100%" bg="blue.500" borderRadius="full" />
            </Box>
          </Box>
        </Box>

        {/* Main Form */}
        <Card variant="outline" boxShadow="lg" borderRadius="2xl" overflow="hidden">
          <CardBody p={{ base: 6, md: 8 }}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={8} align="stretch">
                {/* Basic Information Section */}
                <Box>
                  <Heading size="lg" mb={6} color="gray.800">
                    Basic Information
                  </Heading>
                  
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                    <FormControl isRequired isInvalid={!!errors.title}>
                      <FormLabel fontWeight="semibold" fontSize="lg">Course Title *</FormLabel>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter course title"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      />
                      {errors.title && <Text color="red.500" fontSize="sm" mt={2}>{errors.title}</Text>}
                    </FormControl>

                    <FormControl isRequired isInvalid={!!errors.courseCode}>
                      <FormLabel fontWeight="semibold" fontSize="lg">Course Code *</FormLabel>
                      <Input
                        name="courseCode"
                        value={formData.courseCode}
                        onChange={handleChange}
                        placeholder="e.g. CSE101"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      />
                      {errors.courseCode && <Text color="red.500" fontSize="sm" mt={2}>{errors.courseCode}</Text>}
                    </FormControl>

                    <GridItem colSpan={2}>
                      <FormControl isRequired isInvalid={!!errors.description}>
                        <FormLabel fontWeight="semibold" fontSize="lg">Course Description *</FormLabel>
                        <Textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Describe what students will learn in this course"
                          rows={4}
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.300"
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                        />
                        {errors.description && <Text color="red.500" fontSize="sm" mt={2}>{errors.description}</Text>}
                      </FormControl>
                    </GridItem>

                    <GridItem colSpan={2}>
                      <FormControl isRequired isInvalid={!!errors.overview}>
                        <FormLabel fontWeight="semibold" fontSize="lg">Course Overview *</FormLabel>
                        <Textarea
                          name="overview"
                          value={formData.overview}
                          onChange={handleChange}
                          placeholder="Provide detailed overview of the course curriculum"
                          rows={6}
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.300"
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                        />
                        {errors.overview && <Text color="red.500" fontSize="sm" mt={2}>{errors.overview}</Text>}
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>

                <Divider />

                {/* Institution Information Section */}
                <Box>
                  <Heading size="lg" mb={6} color="gray.800">
                    Institution Information
                  </Heading>

                  {/* University Selection */}
                  <FormControl isRequired isInvalid={!!errors.universityId} mb={8}>
                    <FormLabel fontWeight="semibold" fontSize="lg">University *</FormLabel>
                    
                    {selectedUniversity ? (
                      // Show selected university info
                      <Box mb={4}>
                        <Card bg="blue.50" border="2px solid" borderColor="blue.200" borderRadius="lg">
                          <CardBody>
                            <Flex justify="space-between" align="center">
                              <Box>
                                <Text fontWeight="bold" fontSize="lg" color="blue.700">
                                  {getSelectedUniversityName()}
                                </Text>
                                <Text color="blue.600" fontSize="sm">Selected University</Text>
                              </Box>
                              <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => {
                                  setSelectedUniversity('');
                                  setFormData(prev => ({ ...prev, universityId: '', departmentId: '' }));
                                  setDepartments([]);
                                  setShowUniversityCards(true);
                                }}
                              >
                                Change
                              </Button>
                            </Flex>
                          </CardBody>
                        </Card>
                      </Box>
                    ) : (
                      // Show university search and selection options
                      <>
                        <Text color="gray.600" mb={4}>
                          Search universities by name or code
                        </Text>
                        
                        {/* Search Input */}
                        <Box position="relative" mb={4}>
                          <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                          <Input
                            placeholder="Search universities..."
                            value={universityQuery}
                            onChange={(e) => setUniversityQuery(e.target.value)}
                            pl={12}
                            size="lg"
                            borderRadius="lg"
                            borderColor="gray.300"
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                          />
                        </Box>

                        {/* Dropdown Select */}
                        <Box mb={6}>
                          <FormLabel fontWeight="medium" mb={2}>Select from dropdown:</FormLabel>
                          <Select
                            name="universityId"
                            value={selectedUniversity}
                            onChange={handleUniversityChange}
                            placeholder={uniLoading ? "Loading universities..." : "Select a university"}
                            isDisabled={uniLoading}
                            size="lg"
                            borderRadius="lg"
                            borderColor="gray.300"
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                          >
                            <option value="">Select university</option>
                            {universities.map(uni => (
                              <option key={uni.id} value={uni.id}>
                                {uni.name} {uni.code ? `(${uni.code})` : ''}
                              </option>
                            ))}
                          </Select>
                        </Box>

                        {/* Show/Hide Cards Button */}
                        <Box mb={4}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleUniversityCards}
                            mb={2}
                          >
                            {showUniversityCards ? 'Hide Cards' : 'Show Cards'}
                          </Button>
                          
                          {showUniversityCards && (
                            <Box mt={4}>
                              <Text fontWeight="medium" mb={4}>Quick Selection:</Text>
                              
                              {uniLoading ? (
                                <Flex justify="center" py={8}>
                                  <Spinner size="lg" />
                                </Flex>
                              ) : filteredUniversities.length === 0 ? (
                                <Card p={6} bg="gray.50" borderRadius="lg">
                                  <Text textAlign="center" color="gray.500">
                                    {universityQuery ? 'No universities match your search' : 'No universities available'}
                                  </Text>
                                </Card>
                              ) : (
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                  {filteredUniversities.slice(0, 4).map(uni => (
                                    <Card
                                      key={uni.id}
                                      cursor="pointer"
                                      borderWidth="1px"
                                      borderColor="gray.200"
                                      borderRadius="lg"
                                      transition="all 0.2s"
                                      _hover={{
                                        transform: 'translateY(-2px)',
                                        boxShadow: 'md',
                                        borderColor: 'blue.300'
                                      }}
                                      onClick={() => handleUniversitySelection(uni)}
                                    >
                                      <CardBody p={3}>
                                        <HStack spacing={3}>
                                          <Badge colorScheme="blue" variant="subtle" minW="40px" textAlign="center">
                                            {uni.code || 'UNI'}
                                          </Badge>
                                          <Box flex="1">
                                            <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                                              {uni.name}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                              {uni.description?.slice(0, 50) || 'University'}
                                            </Text>
                                          </Box>
                                        </HStack>
                                      </CardBody>
                                    </Card>
                                  ))}
                                </SimpleGrid>
                              )}
                            </Box>
                          )}
                        </Box>
                      </>
                    )}
                    
                    {errors.universityId && (
                      <Text color="red.500" fontSize="sm" mt={2}>{errors.universityId}</Text>
                    )}
                  </FormControl>

                  {/* Department Selection */}
                  <FormControl isRequired isInvalid={!!errors.departmentId}>
                    <FormLabel fontWeight="semibold" fontSize="lg">Department *</FormLabel>
                    
                    {!selectedUniversity ? (
                      <Card p={6} bg="gray.50" borderRadius="lg">
                        <Text color="gray.500" textAlign="center">
                          Please select a university first to see available departments
                        </Text>
                      </Card>
                    ) : deptLoading ? (
                      <Flex justify="center" py={8}>
                        <Spinner size="lg" />
                        <Text ml={3}>Loading departments...</Text>
                      </Flex>
                    ) : departments.length === 0 ? (
                      <Card p={6} bg="gray.50" borderRadius="lg">
                        <Text color="gray.500" textAlign="center">
                          No departments available for this university
                        </Text>
                      </Card>
                    ) : (
                      <Select
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleChange}
                        placeholder="Select department"
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      >
                        <option value="">Select department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </Select>
                    )}
                    
                    {errors.departmentId && (
                      <Text color="red.500" fontSize="sm" mt={2}>{errors.departmentId}</Text>
                    )}
                  </FormControl>
                </Box>

                <Divider />

                {/* Course Details Section */}
                <Box>
                  <Heading size="lg" mb={6} color="gray.800">
                    Course Details
                  </Heading>

                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                    <FormControl>
                      <FormLabel fontWeight="semibold">Category</FormLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold">Difficulty Level</FormLabel>
                      <Select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      >
                        {difficulties.map(diff => (
                          <option key={diff} value={diff}>{diff}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold">Language</FormLabel>
                      <Select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        size="lg"
                        borderRadius="lg"
                        borderColor="gray.300"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      >
                        {languages.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <FormControl isRequired isInvalid={!!errors.courseType}>
                        <FormLabel fontWeight="semibold">Course Type *</FormLabel>
                        <Input
                          name="courseType"
                          value={formData.courseType}
                          onChange={handleChange}
                          placeholder="e.g. Core, Elective, Lab, etc."
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.300"
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                        />
                        {errors.courseType && <Text color="red.500" fontSize="sm" mt={2}>{errors.courseType}</Text>}
                      </FormControl>
                    </GridItem>

                    <GridItem colSpan={{ base: 1, md: 2, lg: 1 }}>
                      <FormControl>
                        <Flex align="center" height="100%">
                          <Checkbox
                            name="isFree"
                            isChecked={formData.isFree}
                            onChange={handleChange}
                            size="lg"
                            colorScheme="green"
                          >
                            <Text fontWeight="semibold">Free Course</Text>
                          </Checkbox>
                        </Flex>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {!formData.isFree && (
                    <Box mt={6}>
                      <FormControl isInvalid={!!errors.price}>
                        <FormLabel fontWeight="semibold" fontSize="lg">Course Price ($)</FormLabel>
                        <Input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.300"
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                        />
                        {errors.price && <Text color="red.500" fontSize="sm" mt={2}>{errors.price}</Text>}
                      </FormControl>
                    </Box>
                  )}
                </Box>

                <Divider />

                {/* Course Image Section */}
                <Box>
                  <Heading size="lg" mb={6} color="gray.800">
                    Course Image
                  </Heading>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Image URL</FormLabel>
                    <Input
                      name="courseImage"
                      value={formData.courseImage}
                      onChange={handleChange}
                      placeholder="https://example.com/course-image.jpg"
                      size="lg"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                    />
                  </FormControl>

                  <Box mt={4}>
                    <Text fontWeight="semibold" mb={2}>Or upload image</Text>
                    <Button
                      leftIcon={<FiUpload />}
                      variant="outline"
                      onClick={() => document.getElementById('file-upload').click()}
                      size="lg"
                      borderRadius="lg"
                    >
                      Choose File
                    </Button>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      display="none"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const token = localStorage.getItem('token');
                        const fd = new FormData();
                        fd.append('file', file);
                        try {
                          const res = await axios.post('/api/uploads/image', fd, {
                            headers: { 
                              Authorization: `Bearer ${token}`, 
                              'Content-Type': 'multipart/form-data' 
                            }
                          });
                          if (res.data && res.data.url) {
                            setFormData(prev => ({ ...prev, courseImage: res.data.url }));
                            toast({ 
                              title: 'Success', 
                              description: 'Image uploaded successfully', 
                              status: 'success', 
                              duration: 2000 
                            });
                          }
                        } catch (err) {
                          console.error('Upload failed', err);
                          toast({ 
                            title: 'Error', 
                            description: 'Failed to upload image', 
                            status: 'error', 
                            duration: 3000 
                          });
                        }
                      }}
                    />
                  </Box>

                  {/* Course Preview Video Section */}
                  <Box mt={6}>
                    <Heading size="md" mb={4}>Course Preview Video (required)</Heading>
                    <Text mb={2} color="gray.600">Provide a short preview video (max 5 minutes) or a YouTube link.</Text>
                    <HStack spacing={3} mb={3}>
                      <Button
                        leftIcon={<FiUpload />}
                        variant="outline"
                        onClick={() => document.getElementById('video-upload').click()}
                      >
                        Upload Video
                      </Button>
                      <Input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        display="none"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          // measure duration client-side
                          const objectUrl = URL.createObjectURL(file);
                          const videoEl = document.createElement('video');
                          videoEl.preload = 'metadata';
                          videoEl.src = objectUrl;
                          videoEl.onloadedmetadata = async () => {
                            URL.revokeObjectURL(objectUrl);
                            const duration = videoEl.duration || 0;
                            if (duration > 300) {
                              toast({ title: 'Video too long', description: 'Please provide a video of 5 minutes or less.', status: 'error', duration: 4000 });
                              return;
                            }
                            // upload
                            const token = localStorage.getItem('token');
                            const fd = new FormData();
                            fd.append('file', file);
                            fd.append('durationSeconds', String(duration));
                            try {
                              const res = await axios.post('/api/uploads/video', fd, {
                                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                              });
                              if (res.data && res.data.url) {
                                setFormData(prev => ({ ...prev, previewVideoUrl: res.data.url }));
                                toast({ title: 'Uploaded', description: 'Video uploaded successfully', status: 'success', duration: 3000 });
                              }
                            } catch (err) {
                              console.error('Video upload failed', err);
                              toast({ title: 'Upload error', description: err.response?.data?.message || 'Failed to upload video', status: 'error', duration: 4000 });
                            }
                          };
                          videoEl.onerror = () => {
                            URL.revokeObjectURL(objectUrl);
                            toast({ title: 'Invalid video', description: 'Cannot read video metadata', status: 'error', duration: 3000 });
                          };
                        }}
                      />
                      <Input
                        placeholder="Or paste YouTube URL"
                        value={formData.youtubeUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                      />
                    </HStack>
                    {formData.previewVideoUrl && (
                      <Text fontSize="sm" color="green.600">Uploaded video: {formData.previewVideoUrl}</Text>
                    )}
                    {formData.youtubeUrl && (
                      <Text fontSize="sm" color="green.600">YouTube URL: {formData.youtubeUrl}</Text>
                    )}
                  </Box>
                </Box>

                {/* Course Parts (multiple videos) */}
                <Box>
                  <Heading size="lg" mb={4}>Course Parts / Videos</Heading>
                  <Text mb={3} color="gray.600">Add course parts. Each part can have an uploaded video or a YouTube URL. Teachers can add parts over time.</Text>
                  {videoParts.map((part, idx) => (
                    <Box key={idx} mb={3} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                      <HStack spacing={3} mb={2} align="start">
                        <Box flex="1">
                          <FormControl mb={2} isRequired>
                            <FormLabel>Part Title</FormLabel>
                            <Input value={part.title} onChange={(e) => updatePart(idx, 'title', e.target.value)} />
                          </FormControl>
                          <FormControl mb={2}>
                            <FormLabel>Part Description</FormLabel>
                            <Textarea value={part.description} onChange={(e) => updatePart(idx, 'description', e.target.value)} rows={3} />
                          </FormControl>
                          <HStack spacing={2}>
                            <Button size="sm" variant="outline" onClick={() => document.getElementById(`part-video-${idx}`).click()}>Upload Video</Button>
                            <Input id={`part-video-${idx}`} type="file" accept="video/*" display="none" onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              const objectUrl = URL.createObjectURL(file);
                              const videoEl = document.createElement('video'); videoEl.preload='metadata'; videoEl.src = objectUrl;
                              videoEl.onloadedmetadata = async () => { URL.revokeObjectURL(objectUrl); const duration = videoEl.duration || 0; if (duration > 300) { toast({ title: 'Video too long', description: 'Max 5 minutes', status: 'error' }); return; } const token = localStorage.getItem('token'); const fd = new FormData(); fd.append('file', file); fd.append('durationSeconds', String(duration)); try { const res = await axios.post('/api/uploads/video', fd, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }); if (res.data?.url) updatePart(idx, 'videoUrl', res.data.url); toast({ title: 'Uploaded', status: 'success' }); } catch (err) { toast({ title: 'Upload failed', status: 'error' }); } };
                              videoEl.onerror = () => { URL.revokeObjectURL(objectUrl); toast({ title: 'Invalid video', status: 'error' }); };
                            }} />
                            <Input placeholder="Or paste YouTube URL" value={part.youtubeUrl} onChange={(e) => updatePart(idx, 'youtubeUrl', e.target.value)} />
                          </HStack>
                          <HStack mt={2} spacing={4} align="center">
                            <Checkbox isChecked={!!part.isPreview} onChange={(e) => updatePart(idx, 'isPreview', e.target.checked)}>Preview available</Checkbox>
                            <Button size="sm" colorScheme="red" variant="ghost" onClick={() => removePart(idx)}>Remove Part</Button>
                          </HStack>
                        </Box>
                      </HStack>
                    </Box>
                  ))}

                  <Button size="md" variant="outline" onClick={addPart}>Add New Part</Button>
                </Box>

                {/* Submit Buttons */}
                <Flex justify="space-between" pt={8} borderTop="1px solid" borderColor="gray.200">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/teacher/manage-courses')}
                    borderRadius="lg"
                    px={8}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<FiSave />}
                    isLoading={loading}
                    type="submit"
                    isDisabled={loading || uniLoading || deptLoading}
                    borderRadius="lg"
                    px={12}
                    bg="blue.600"
                    _hover={{ bg: 'blue.700' }}
                  >
                    Create Course
                  </Button>
                </Flex>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default CreateCourse;