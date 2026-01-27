import React, { useEffect, useState } from 'react';
import { Box, Text, Progress, VStack } from '@chakra-ui/react';

export default function ProgressTracker({ lessonId }) {
  const [state, setState] = useState({});

  useEffect(() => {
    const onProgress = (e) => {
      try {
        const d = e.detail || {};
        setState((s) => ({ ...s, [d.lessonId]: { watchedSeconds: d.watchedSeconds, percent: d.percent, isCompleted: d.isCompleted } }));
      } catch (err) { }
    };

    const onComplete = (e) => {
      try {
        const d = e.detail || {};
        setState((s) => ({ ...s, [d.lessonId]: { ...(s[d.lessonId] || {}), isCompleted: true, percent: 100 } }));
      } catch (err) { }
    };

    window.addEventListener('lessonProgress', onProgress);
    window.addEventListener('lessonCompleted', onComplete);

    return () => {
      window.removeEventListener('lessonProgress', onProgress);
      window.removeEventListener('lessonCompleted', onComplete);
    };
  }, []);

  if (lessonId) {
    const entry = state[lessonId] || { watchedSeconds: 0, percent: 0, isCompleted: false };
    return (
      <Box mt={3} p={3} borderRadius='md' bg='gray.50' boxShadow='sm'>
        <Text fontSize='sm'>Watched: {Math.floor((entry.watchedSeconds || 0) / 60)} min</Text>
        <Text fontSize='sm'>{entry.percent ?? 0}%</Text>
        <Progress value={entry.percent ?? 0} size='sm' colorScheme='purple' mt={2} />
        {entry.isCompleted && <Text fontSize='sm' color='green.600' mt={1}>Completed</Text>}
      </Box>
    );
  }

  // global view: show all tracked lessons
  const keys = Object.keys(state);
  if (keys.length === 0) return null;

  return (
    <VStack align='stretch' spacing={3} mt={3}>
      {keys.map(k => {
        const entry = state[k];
        return (
          <Box key={k} p={2} borderRadius='md' bg='gray.50'>
            <Text fontSize='sm'>Lesson {k} — {entry.percent ?? 0}%</Text>
            <Progress value={entry.percent ?? 0} size='sm' colorScheme='purple' mt={1} />
          </Box>
        );
      })}
    </VStack>
  );
}
