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
  Textarea,
  Input,
  Select,
  FormControl,
  FormLabel,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../../services/communityService';

const CreatePost = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    mediaUrl: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (formData.content.length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Log the data being sent
      console.log('Submitting post data:', formData);
      
      // Prepare data for backend
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        postType: formData.category ? formData.category.charAt(0).toUpperCase() + formData.category.slice(1) : "Discussion",
        ...(formData.mediaUrl.trim() && { mediaUrl: formData.mediaUrl.trim() }),
      };
      
      console.log('Post data to send:', postData);
      
      const response = await communityService.createPost(postData);
      
      console.log('Backend response:', response);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allPostsCount'] });
      queryClient.invalidateQueries({ queryKey: ['myPostsCount'] });
      
      toast({
        title: 'Post Created!',
        description: 'Your post has been published successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'general',
        mediaUrl: '',
      });
      setErrors({});
      
      // Close modal and call onSuccess if provided
      onClose();
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error creating post:', error);
      
      let errorMessage = 'Failed to create post. Please try again.';
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Please login to create a post';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid post data. Please check your input.';
        } else if (error.response.status === 413) {
          errorMessage = 'Post content is too large';
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {
        if (!isSubmitting) {
          onClose();
          setFormData({
            title: '',
            content: '',
            category: 'general',
            mediaUrl: '',
          });
          setErrors({});
        }
      }}
      size="lg"
      closeOnOverlayClick={!isSubmitting}
    >
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          
          <ModalBody>
            <VStack spacing={4}>
              {/* Category */}
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  isDisabled={isSubmitting}
                >
                  <option value="general">General</option>
                  <option value="question">Question</option>
                  <option value="announcement">Announcement</option>
                  <option value="discussion">Discussion</option>
                  <option value="help">Help & Support</option>
                </Select>
              </FormControl>

              {/* Title */}
              <FormControl isInvalid={!!errors.title} isRequired>
                <FormLabel>Title *</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter post title"
                  isDisabled={isSubmitting}
                  required
                />
                <FormErrorMessage>{errors.title}</FormErrorMessage>
              </FormControl>

              {/* Content */}
              <FormControl isInvalid={!!errors.content}>
                <FormLabel>Content *</FormLabel>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="What would you like to share?"
                  rows={6}
                  isDisabled={isSubmitting}
                  required
                />
                <FormErrorMessage>{errors.content}</FormErrorMessage>
                <FormLabel fontSize="xs" color="gray.500" mt={1}>
                  {formData.content.length}/5000 characters
                </FormLabel>
              </FormControl>

              {/* Media URL */}
              <FormControl>
                <FormLabel>Media URL (Optional)</FormLabel>
                <Input
                  name="mediaUrl"
                  value={formData.mediaUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  isDisabled={isSubmitting}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                if (!isSubmitting) {
                  onClose();
                  setFormData({
                    title: '',
                    content: '',
                    category: 'general',
                    mediaUrl: '',
                  });
                  setErrors({});
                }
              }}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Posting..."
            >
              Post
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreatePost;