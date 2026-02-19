/**
 * ThemeShowcase – demonstrates every aspect of the refactored theme.
 *
 * Route it temporarily (e.g. /theme-showcase) to preview all design tokens,
 * typography, colours, icons, animations, and responsive patterns in one page.
 */
import React from 'react';
import {
  Box, Container, Heading, Text, SimpleGrid, VStack, HStack,
  Button, Badge, Tag, Avatar, Input, Textarea, Flex, Divider,
  useColorModeValue, useDisclosure, IconButton,
  Card, CardHeader, CardBody, CardFooter,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Tooltip, Image
} from '@chakra-ui/react';

import { NavIcons, ActionIcons, CardIcons, DirectionIcons } from '../components/common/Icons';
import { useFadeIn, motionProps, staggerDelay } from '../hooks/useAnimations';

// ---------------------------------------------------------------------------
// Section wrapper – subtle gradient background variations
// ---------------------------------------------------------------------------
const Section = ({ children, variant = 'default', ...props }) => {
  const bgs = {
    default: useColorModeValue('#FAFBFC', 'gray.900'),
    subtle:  useColorModeValue('gray.50', 'gray.850'),
    brand:   useColorModeValue(
      'linear-gradient(135deg, #EEF2FF 0%, #F0FDFA 100%)',
      'linear-gradient(135deg, #23215B 0%, #134E4A 100%)',
    ),
    warm:    useColorModeValue(
      'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      'linear-gradient(135deg, #78350F 0%, #92400E 100%)',
    ),
  };

  return (
    <Box
      py={{ base: 10, md: 16 }}
      bg={variant === 'brand' || variant === 'warm' ? undefined : bgs[variant]}
      bgGradient={variant === 'brand' || variant === 'warm' ? bgs[variant] : undefined}
      {...props}
    >
      <Container maxW="6xl">{children}</Container>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Feature Card – demonstrates card + icon + animation
// ---------------------------------------------------------------------------
const FeatureCard = ({ icon: IconComp, title, description, index }) => (
  <Card sx={staggerDelay(index)} {...motionProps.hoverLift}>
    <CardBody>
      <VStack align="start" spacing={3}>
        <Flex
          w={12} h={12}
          align="center" justify="center"
          borderRadius="xl"
          bg={useColorModeValue('brand.50', 'brand.900')}
          color="brand.500"
        >
          <IconComp size={6} />
        </Flex>
        <Heading size="sm">{title}</Heading>
        <Text fontSize="sm">{description}</Text>
      </VStack>
    </CardBody>
  </Card>
);

// ---------------------------------------------------------------------------
// Course Card – mirrors the real CourseCard but with new theme
// ---------------------------------------------------------------------------
const DemoCourseCard = ({ index }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const subtext = useColorModeValue('gray.500', 'gray.400');

  return (
    <Card sx={staggerDelay(index, 80)} {...motionProps.hoverLift}>
      <Image
        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600"
        alt="Course"
        objectFit="cover"
        h="160px"
        w="100%"
        borderTopRadius="xl"
        fallbackSrc="https://via.placeholder.com/600x160/EEF2FF/4F46E5?text=Course"
      />
      <CardBody>
        <VStack align="start" spacing={2}>
          <HStack>
            <Badge colorScheme="green" variant="subtle">Free</Badge>
            <Badge colorScheme="purple" variant="subtle">Beginner</Badge>
          </HStack>
          <Heading size="sm">Introduction to Web Development</Heading>
          <Text fontSize="sm" color={subtext} noOfLines={2}>
            Learn HTML, CSS, and JavaScript fundamentals to build modern, responsive websites from scratch.
          </Text>
          <HStack spacing={4} pt={1}>
            <HStack spacing={1}>
              <CardIcons.Rating color="accent.500" size={4} />
              <Text fontSize="sm" fontWeight="600">4.8</Text>
            </HStack>
            <HStack spacing={1}>
              <CardIcons.Students color={subtext} size={4} />
              <Text fontSize="sm" color={subtext}>2,340</Text>
            </HStack>
            <HStack spacing={1}>
              <CardIcons.Duration color={subtext} size={4} />
              <Text fontSize="sm" color={subtext}>12h</Text>
            </HStack>
          </HStack>
        </VStack>
      </CardBody>
      <CardFooter pt={0}>
        <HStack w="100%" justify="space-between">
          <Button variant="ghost" size="sm" leftIcon={<DirectionIcons.View size={4} />}>
            Preview
          </Button>
          <Button size="sm" leftIcon={<ActionIcons.Enroll size={4} />}>
            Enroll Now
          </Button>
        </HStack>
      </CardFooter>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// MAIN SHOWCASE
// ---------------------------------------------------------------------------
const ThemeShowcase = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { ref: heroRef, style: heroStyle } = useFadeIn();
  const headingColor = useColorModeValue('gray.900', 'white');
  const mutedText = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box>

      {/* ─── HERO ─────────────────────────────────── */}
      <Section variant="brand">
        <VStack ref={heroRef} style={heroStyle} spacing={6} textAlign="center" py={10}>
          <Badge colorScheme="purple" fontSize="sm" px={4} py={1}>
            Theme Showcase
          </Badge>
          <Heading size="2xl" color={headingColor} maxW="3xl">
            Modern, Accessible Design for{' '}
            <Box as="span" color="brand.500">NextUniVerse</Box>
          </Heading>
          <Text fontSize="lg" color={mutedText} maxW="2xl">
            A professional academic design system featuring clean typography,
            flat icons, subtle animations, and WCAG-compliant colour tokens.
          </Text>
          <HStack spacing={4} pt={2}>
            <Button size="lg" leftIcon={<ActionIcons.Enroll size={5} />}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" leftIcon={<CardIcons.Course size={5} />}>
              Browse Courses
            </Button>
          </HStack>
        </VStack>
      </Section>

      {/* ─── COLOUR PALETTE ───────────────────────── */}
      <Section variant="default">
        <VStack spacing={8} align="start">
          <Heading size="lg" color={headingColor}>Colour Palette</Heading>
          {['brand', 'secondary', 'accent'].map((name) => (
            <VStack key={name} align="start" spacing={2} w="100%">
              <Text fontWeight="600" textTransform="capitalize">{name}</Text>
              <Flex gap={2} wrap="wrap">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <Tooltip key={shade} label={`${name}.${shade}`} placement="top">
                    <Box
                      w={12} h={12}
                      borderRadius="lg"
                      bg={`${name}.${shade}`}
                      border="1px solid"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      transition="transform 0.2s"
                      _hover={{ transform: 'scale(1.1)' }}
                    />
                  </Tooltip>
                ))}
              </Flex>
            </VStack>
          ))}
        </VStack>
      </Section>

      {/* ─── TYPOGRAPHY ───────────────────────────── */}
      <Section variant="subtle">
        <VStack spacing={6} align="start">
          <Heading size="lg" color={headingColor}>Typography</Heading>
          <VStack align="start" spacing={3} w="100%">
            <Heading size="2xl">Heading 2XL – Inter 700</Heading>
            <Heading size="xl">Heading XL – Inter 700</Heading>
            <Heading size="lg">Heading LG – Inter 700</Heading>
            <Heading size="md">Heading MD – Inter 700</Heading>
            <Heading size="sm">Heading SM – Inter 700</Heading>
            <Divider />
            <Text fontSize="lg">Body Large – clean and readable for long-form content.</Text>
            <Text>Body Default – the standard text size for paragraphs and descriptions.</Text>
            <Text fontSize="sm" color={mutedText}>Body Small – captions, labels, and supplementary information.</Text>
            <Text fontSize="xs" color={mutedText}>Body XS – fine print and metadata.</Text>
          </VStack>
        </VStack>
      </Section>

      {/* ─── BUTTONS ──────────────────────────────── */}
      <Section variant="default">
        <VStack spacing={8} align="start">
          <Heading size="lg" color={headingColor}>Buttons & Actions</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
            <VStack align="start" spacing={3}>
              <Text fontWeight="600">Variants</Text>
              <HStack wrap="wrap" spacing={3}>
                <Button leftIcon={<ActionIcons.Enroll size={4} />}>Primary</Button>
                <Button variant="secondary" leftIcon={<ActionIcons.Save size={4} />}>Secondary</Button>
                <Button variant="accent" leftIcon={<CardIcons.Zap size={4} />}>Accent</Button>
                <Button variant="outline" leftIcon={<ActionIcons.Edit size={4} />}>Outline</Button>
                <Button variant="ghost" leftIcon={<ActionIcons.Search size={4} />}>Ghost</Button>
              </HStack>
            </VStack>
            <VStack align="start" spacing={3}>
              <Text fontWeight="600">Sizes</Text>
              <HStack wrap="wrap" spacing={3}>
                <Button size="xs">XS</Button>
                <Button size="sm">SM</Button>
                <Button size="md">MD</Button>
                <Button size="lg">LG</Button>
              </HStack>
            </VStack>
            <VStack align="start" spacing={3}>
              <Text fontWeight="600">Icon Buttons</Text>
              <HStack spacing={3}>
                <Tooltip label="Home"><IconButton icon={<NavIcons.Home />} aria-label="Home" /></Tooltip>
                <Tooltip label="Notifications"><IconButton icon={<NavIcons.Notifications />} aria-label="Notifications" variant="outline" /></Tooltip>
                <Tooltip label="Settings"><IconButton icon={<NavIcons.Settings />} aria-label="Settings" variant="ghost" /></Tooltip>
                <Tooltip label="Delete"><IconButton icon={<ActionIcons.Delete />} aria-label="Delete" colorScheme="red" variant="ghost" /></Tooltip>
              </HStack>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Section>

      {/* ─── FEATURE CARDS ────────────────────────── */}
      <Section variant="brand">
        <VStack spacing={8}>
          <VStack spacing={3} textAlign="center">
            <Heading size="lg" color={headingColor}>Platform Features</Heading>
            <Text color={mutedText} maxW="xl">Flat-style icons combined with card animations for a modern, polished look.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="100%">
            <FeatureCard index={0} icon={CardIcons.Course}      title="Rich Courses"       description="Interactive lessons with video, quizzes, and assignments." />
            <FeatureCard index={1} icon={CardIcons.Certificate} title="Certificates"        description="Earn verifiable certificates upon course completion." />
            <FeatureCard index={2} icon={CardIcons.Team}        title="Clan System"         description="Collaborate and compete with study groups." />
            <FeatureCard index={3} icon={CardIcons.Trending}    title="Leaderboards"        description="Track progress with rankings and achievement badges." />
          </SimpleGrid>
        </VStack>
      </Section>

      {/* ─── COURSE CARDS ─────────────────────────── */}
      <Section variant="default">
        <VStack spacing={8}>
          <VStack spacing={3} textAlign="center">
            <Heading size="lg" color={headingColor}>Course Cards</Heading>
            <Text color={mutedText}>Hover animations, subtle shadows, and consistent icon usage.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="100%">
            {[0, 1, 2].map((i) => (
              <DemoCourseCard key={i} index={i} />
            ))}
          </SimpleGrid>
        </VStack>
      </Section>

      {/* ─── STATS ────────────────────────────────── */}
      <Section variant="warm">
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          {[
            { label: 'Active Students', value: '12,450', change: 12 },
            { label: 'Courses Available', value: '340', change: 8 },
            { label: 'Certificates Issued', value: '5,200', change: 23 },
            { label: 'Avg. Rating', value: '4.8', change: 3 },
          ].map((s, i) => (
            <Card key={i} sx={staggerDelay(i)}>
              <CardBody>
                <Stat>
                  <StatLabel color={mutedText}>{s.label}</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="700" color={headingColor}>{s.value}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {s.change}%
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Section>

      {/* ─── FORM ELEMENTS ────────────────────────── */}
      <Section variant="subtle">
        <VStack spacing={6} align="start" maxW="lg">
          <Heading size="lg" color={headingColor}>Form Elements</Heading>
          <Input placeholder="Search courses, teachers, topics…" />
          <Textarea placeholder="Write a review…" />
          <HStack>
            <Button leftIcon={<ActionIcons.Send size={4} />}>Submit</Button>
            <Button variant="outline" leftIcon={<ActionIcons.Cancel size={4} />}>Cancel</Button>
          </HStack>
        </VStack>
      </Section>

      {/* ─── BADGES & TAGS ────────────────────────── */}
      <Section variant="default">
        <VStack spacing={6} align="start">
          <Heading size="lg" color={headingColor}>Badges & Tags</Heading>
          <HStack wrap="wrap" spacing={3}>
            <Badge colorScheme="purple">New</Badge>
            <Badge colorScheme="green">Free</Badge>
            <Badge colorScheme="orange">Premium</Badge>
            <Badge colorScheme="red">Hot</Badge>
            <Badge colorScheme="blue">Updated</Badge>
          </HStack>
          <HStack wrap="wrap" spacing={3}>
            <Tag size="lg" colorScheme="purple" borderRadius="full">React</Tag>
            <Tag size="lg" colorScheme="blue" borderRadius="full">TypeScript</Tag>
            <Tag size="lg" colorScheme="green" borderRadius="full">Python</Tag>
            <Tag size="lg" colorScheme="orange" borderRadius="full">Data Science</Tag>
          </HStack>
        </VStack>
      </Section>

      {/* ─── MODAL DEMO ──────────────────────────── */}
      <Section variant="subtle">
        <VStack spacing={4} align="start">
          <Heading size="lg" color={headingColor}>Modal Animation</Heading>
          <Button onClick={onOpen} leftIcon={<DirectionIcons.External size={4} />}>
            Open Modal
          </Button>
          <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="scale">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Enroll in Course</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>
                  This modal uses the theme's <strong>fadeInScale</strong> animation
                  with a blur backdrop overlay for a polished, modern feel.
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                <Button leftIcon={<ActionIcons.Enroll size={4} />}>
                  Confirm Enrollment
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Section>

      {/* ─── ICONS CATALOG ────────────────────────── */}
      <Section variant="brand">
        <VStack spacing={6} align="start">
          <Heading size="lg" color={headingColor}>Icon Catalog (Flat Style)</Heading>
          <Text color={mutedText}>All icons are from react-icons/fi (Feather) and react-icons/ri (Remix) for a consistent flat design.</Text>
          <SimpleGrid columns={{ base: 4, md: 8 }} spacing={4}>
            {Object.entries({ ...NavIcons, ...CardIcons }).map(([name, IconComp], i) => (
              <Tooltip key={name} label={name}>
                <VStack
                  p={3}
                  borderRadius="xl"
                  bg={useColorModeValue('white', 'gray.800')}
                  border="1px solid"
                  borderColor={useColorModeValue('gray.100', 'gray.700')}
                  transition="all 0.2s"
                  _hover={{ borderColor: 'brand.300', bg: useColorModeValue('brand.50', 'brand.900') }}
                  cursor="pointer"
                >
                  <IconComp size={5} color={useColorModeValue('gray.600', 'gray.300')} />
                  <Text fontSize="2xs" color={mutedText} noOfLines={1}>{name}</Text>
                </VStack>
              </Tooltip>
            ))}
          </SimpleGrid>
        </VStack>
      </Section>
    </Box>
  );
};

export default ThemeShowcase;
