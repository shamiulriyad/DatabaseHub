import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Divider
} from '@chakra-ui/react';
import { FaPlay, FaClock } from 'react-icons/fa';

export default function CourseCurriculum({ modules = [], parts = [], isEnrolled, isTeacher, selectedPartIndex, setSelectedPartIndex }) {
  const sections = (modules && modules.length > 0)
    ? modules.map((m, i) => ({ id: m.id ?? i, title: m.title ?? `Section ${i+1}`, lectures: (m.lessons || m.Lessons || []) }))
    : [{ id: 'parts', title: 'Parts', lectures: parts }];

  const totalLectures = sections.reduce((sum, s) => sum + (s.lectures?.length || 0), 0);
  const totalSections = sections.length;
  const totalSeconds = sections.reduce((sum, s) => sum + (s.lectures?.reduce((acc, l) => acc + (l.duration || l.Duration || 0), 0) || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  return (
    <Box mt={6} width="100%">
      <HStack justify="space-between" align="center" mb={4}>
        <Heading size="md">Curriculum</Heading>
        <Text color="gray.600" fontSize="sm">{totalSections} sections • {totalLectures} lectures{totalSeconds? ` • ${hours>0? hours+'h ':''}${mins}m total length` : ''}</Text>
      </HStack>

      <Accordion allowMultiple defaultIndex={sections.map((_,i)=>i)}>
        {sections.map((section, sidx) => (
          <AccordionItem key={section.id} border="1px solid" borderColor="gray.100" borderRadius="md" mb={3}>
            <h3>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="600">{section.title}</Text>
                  <Text fontSize="xs" color="gray.500">{(section.lectures?.length||0)} lectures</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h3>
            <AccordionPanel pb={4}>
              <VStack align="stretch" spacing={3}>
                {section.lectures && section.lectures.length > 0 ? section.lectures.map((lec, idx) => {
                  const globalIndex = (() => {
                    if (modules && modules.length > 0) {
                      let g = 0;
                      for (let i = 0; i < sidx; i++) g += (sections[i].lectures?.length || 0);
                      return g + idx;
                    }
                    return idx;
                  })();

                  const title = lec.title || lec.Title || lec.name || `Lecture ${idx+1}`;
                  const duration = lec.duration ?? lec.Duration ?? null;
                  const isPreview = lec.isPreview || lec.IsPreview || false;
                  const canPreview = isEnrolled || isPreview || isTeacher;

                  return (
                    <Box key={globalIndex} p={3} borderRadius="md" bg={globalIndex===selectedPartIndex? 'green.50' : 'transparent'}>
                      <HStack justify="space-between" align="center">
                        <HStack>
                          <Icon as={FaPlay} color="purple.500" />
                          <Box>
                            <Text fontWeight={600}>{title}</Text>
                            <Text fontSize="xs" color="gray.500">{lec.description || lec.Description || ''}</Text>
                          </Box>
                        </HStack>
                        <HStack spacing={3}>
                          {duration ? <HStack><Icon as={FaClock} /><Text fontSize="sm">{Math.ceil(duration/60)}:{String(Math.floor(duration%60)).padStart(2,'0')}</Text></HStack> : null}
                          {isPreview && <Badge colorScheme="purple">Preview</Badge>}
                          <Button size="sm" onClick={() => setSelectedPartIndex(globalIndex)} isDisabled={!canPreview} variant={globalIndex===selectedPartIndex? 'solid' : 'ghost'}>
                            {canPreview ? 'Play' : 'Locked'}
                          </Button>
                        </HStack>
                      </HStack>
                      <Divider mt={3} />
                    </Box>
                  );
                }) : <Text color="gray.500">No lectures in this section</Text>}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
}
