import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Heading, FormControl, FormLabel, Input, Textarea, Button, useToast, HStack } from '@chakra-ui/react';
import { courseService } from '../../services/courseService';

const CourseEdit = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [videoParts, setVideoParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data);
        setVideoParts((data?.videoParts || data?.VideoParts || []).map(p => ({ id: p.id, title: p.title, description: p.description, videoUrl: p.videoUrl || p.videoUrl, youtubeUrl: p.youtubeUrl || p.youTubeUrl, isPreview: p.isPreview })));
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    load();
  }, [courseId]);

  const handleSave = async () => {
    try {
      const payload = {
        Title: course.title,
        ShortDescription: course.shortDescription,
        FullDescription: course.fullDescription,
        ThumbnailUrl: course.thumbnailUrl
      };
      if (videoParts && videoParts.length) {
        payload.VideoParts = videoParts.map((p, idx) => ({ id: p.id, title: p.title, description: p.description, videoUrl: p.videoUrl, youTubeUrl: p.youtubeUrl, order: idx+1, isPreview: !!p.isPreview }));
      }
      await courseService.updateCourse(course.id, payload);
      toast({ title: 'Saved', description: 'Course updated', status: 'success' });
      navigate(`/courses/${course.id}`);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save', status: 'error' });
    }
  };

  if (loading) return <Box p={6}>Loading...</Box>;
  if (!course) return <Box p={6}>Course not found.</Box>;

  return (
    <Box p={6} maxW="4xl">
      <Heading mb={4}>Edit Course</Heading>
      <FormControl mb={3}>
        <FormLabel>Title</FormLabel>
        <Input value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} />
      </FormControl>
      <FormControl mb={3}>
        <FormLabel>Short Description</FormLabel>
        <Input value={course.shortDescription} onChange={(e) => setCourse({ ...course, shortDescription: e.target.value })} />
      </FormControl>
      <FormControl mb={3}>
        <FormLabel>Full Description (HTML allowed)</FormLabel>
        <Textarea value={course.fullDescription || ''} onChange={(e) => setCourse({ ...course, fullDescription: e.target.value })} rows={8} />
      </FormControl>
      <FormControl mb={3}>
        <FormLabel>Thumbnail URL</FormLabel>
        <Input value={course.thumbnailUrl || ''} onChange={(e) => setCourse({ ...course, thumbnailUrl: e.target.value })} />
      </FormControl>
      {/* Video Parts Editor */}
      <Box mb={4}>
        <Heading size="md" mb={3}>Course Parts / Videos</Heading>
        {(videoParts || []).map((p, idx) => (
          <Box key={idx} mb={3} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
            <FormControl mb={2}>
              <FormLabel>Part Title</FormLabel>
              <Input value={p.title || ''} onChange={(e) => setVideoParts(prev => prev.map((x,i) => i===idx?{...x,title:e.target.value}:x))} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Part Description</FormLabel>
              <Textarea value={p.description || ''} onChange={(e) => setVideoParts(prev => prev.map((x,i) => i===idx?{...x,description:e.target.value}:x))} rows={3} />
            </FormControl>
            <HStack spacing={2}>
              <Input placeholder="Video URL" value={p.videoUrl || ''} onChange={(e) => setVideoParts(prev => prev.map((x,i) => i===idx?{...x,videoUrl:e.target.value}:x))} />
              <Input placeholder="YouTube URL" value={p.youtubeUrl || ''} onChange={(e) => setVideoParts(prev => prev.map((x,i) => i===idx?{...x,youtubeUrl:e.target.value}:x))} />
            </HStack>
            <Button size="sm" mt={2} variant="ghost" colorScheme="red" onClick={() => setVideoParts(prev => prev.filter((_,i) => i!==idx))}>Remove</Button>
          </Box>
        ))}
        <Button size="sm" variant="outline" onClick={() => setVideoParts(prev => ([...prev, { title: '', description: '', videoUrl: '', youtubeUrl: '', isPreview: false }]))}>Add Part</Button>
      </Box>
      <Button colorScheme="blue" onClick={handleSave}>Save</Button>
    </Box>
  );
};

export default CourseEdit;
