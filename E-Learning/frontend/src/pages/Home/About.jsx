import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import CosmicBg from '../../components/CosmicBg';

// Using global theme from App — do not create a local ChakraProvider here

// ─── SVG Icons (inline, no external deps) ─────────────────────────────────────
const Icons = {
  Rocket: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <path d="M4.5 16.5c-1.5 1.5-1.5 4.5 1.5 4.5h1c2 0 3.5-1.5 3.5-3.5V16l-6-.5z" /><path d="M19.5 4.5C21 6 21 9 18 12l-4 4-6-6 4-4c3-3 6-3 7.5-1.5z" /><circle cx="15" cy="9" r="1.5" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Award: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Heart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Lightbulb: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  BookOpen: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

// ─── Animated Counter Component ───────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const observed = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !observed.current) {
          observed.current = true;
          const start = 0;
          const end = parseInt(target.replace(/\D/g, ""), 10);
          const increment = end / (duration / 16);
          let current = start;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Using shared CosmicBg component for consistent background visuals across pages

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ children, py = { base: 16, md: 24 }, ...props }) {
  // Use the same content width as the Courses page (`container.xl`) for visual consistency
  return (
    <Box as="section" py={py} position="relative" {...props}>
      <Container maxW="container.xl">{children}</Container>
    </Box>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <Badge
      px={4}
      py={1.5}
      borderRadius="full"
      bg="rgba(112,85,255,0.15)"
      color="#a78bfa"
      border="1px solid"
      borderColor="rgba(112,85,255,0.3)"
      fontSize="xs"
      fontWeight="600"
      letterSpacing="0.12em"
      textTransform="uppercase"
      fontFamily="body"
    >
      {children}
    </Badge>
  );
}

// ─── Icon Badge ───────────────────────────────────────────────────────────────
function IconBadge({ children, colorScheme = "brand" }) {
  const colors = {
    brand: { bg: "rgba(112,85,255,0.15)", color: "brand.400", border: "rgba(112,85,255,0.25)" },
    gold: { bg: "rgba(251,191,36,0.12)", color: "gold.400", border: "rgba(251,191,36,0.25)" },
    teal: { bg: "rgba(56,178,172,0.12)", color: "teal.400", border: "rgba(56,178,172,0.25)" },
  };
  const c = colors[colorScheme] || colors.brand;
  return (
    <Flex
      align="center"
      justify="center"
      w="64px"
      h="64px"
      borderRadius="20px"
      bg={c.bg}
      color={c.color}
      border="1px solid"
      borderColor={c.border}
      flexShrink={0}
    >
      {children}
    </Flex>
  );
}

// ─── 1. Hero Section ──────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <Section py={{ base: 20, md: 32 }}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 12, md: 16 }} alignItems="center">
        {/* Left */}
        <Stack spacing={8}>
          <SectionLabel>About NextUniVerse</SectionLabel>

          <Stack spacing={4}>
            <Heading
              as="h1"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="900"
              lineHeight="1.15"
              color="white"
              letterSpacing="-0.02em"
            >
              Where Every Learner
              {/* FIX: replaced bgClip="text" + color="transparent" with a solid readable color */}
              <Box
                as="span"
                display="block"
                color="#c4b5fd"
              >
                Reaches the Stars
              </Box>
            </Heading>

            <Text fontSize="lg" color="whiteAlpha.600" maxW="480px" lineHeight="1.8">
              NextUniVerse is a next-generation ed-tech platform built to democratize world-class education. We combine expert-led courses, AI-powered personalization, and a vibrant community to unlock every learner's full potential.
            </Text>
          </Stack>

          <HStack spacing={4} flexWrap="wrap">
            <Button
              variant="primary"
              size="lg"
              aria-label="Start your learning journey with NextUniVerse"
              rightIcon={<Icons.ArrowRight />}
            >
              Start Learning
            </Button>
            <Button
              variant="outline_gold"
              size="lg"
              aria-label="Watch the NextUniVerse platform demo"
              leftIcon={
                <Box
                  as="span"
                  display="flex"
                  align="center"
                  justify="center"
                  w="26px"
                  h="26px"
                  borderRadius="full"
                  bg="gold.400"
                  color="gray.900"
                >
                  <Icons.Play />
                </Box>
              }
            >
              Watch Demo
            </Button>
          </HStack>

          {/* Social proof */}
          <HStack spacing={6} pt={2}>
            <HStack spacing={2}>
              <HStack spacing={0}>
                {[...Array(5)].map((_, i) => (
                  <Box key={i} color="#fbbf24" fontSize="sm">★</Box>
                ))}
              </HStack>
              <Text fontSize="sm" color="whiteAlpha.600">4.9/5 rating</Text>
            </HStack>
            <Divider orientation="vertical" h="20px" borderColor="cosmos.border" />
            <Text fontSize="sm" color="whiteAlpha.600">
              <Box as="span" color="white" fontWeight="600">2M+</Box> students worldwide
            </Text>
          </HStack>
        </Stack>

        {/* Right — Illustration Placeholder */}
        <Box position="relative">
          <Box
            borderRadius="32px"
            overflow="hidden"
            bg="cosmos.card"
            border="1px solid"
            borderColor="cosmos.border"
            shadow="0 30px 80px rgba(0,0,0,0.5)"
            position="relative"
          >
            <Box
              position="absolute"
              inset={0}
              bgGradient="linear(135deg, rgba(112,85,255,0.08), rgba(251,191,36,0.04))"
              zIndex={1}
            />
            <Box
              as="img"
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
              alt="Students collaborating on NextUniVerse platform"
              w="100%"
              h="420px"
              style={{ objectFit: "cover", display: "block" }}
            />

            {/* Floating stat cards */}
            <Box
              position="absolute"
              bottom="24px"
              left="24px"
              bg="rgba(13,20,40,0.9)"
              backdropFilter="blur(12px)"
              border="1px solid"
              borderColor="cosmos.border"
              borderRadius="16px"
              px={5}
              py={4}
              zIndex={2}
              sx={{ animation: "floatCard 4s ease-in-out infinite", "@keyframes floatCard": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } } }}
            >
              <Text fontSize="xs" color="whiteAlpha.600" fontWeight="500">🎓 Active Learners</Text>
              <Text fontSize="xl" fontWeight="800" color="white" letterSpacing="-0.02em">2,489,310</Text>
            </Box>

            <Box
              position="absolute"
              top="24px"
              right="24px"
              bg="rgba(13,20,40,0.9)"
              backdropFilter="blur(12px)"
              border="1px solid"
              borderColor="cosmos.border"
              borderRadius="16px"
              px={5}
              py={4}
              zIndex={2}
              sx={{ animation: "floatCard2 5s ease-in-out infinite", "@keyframes floatCard2": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } } }}
            >
              <Text fontSize="xs" color="whiteAlpha.600" fontWeight="500">📚 Courses Live</Text>
              <Text fontSize="xl" fontWeight="800" color="#fbbf24" letterSpacing="-0.02em">12,500+</Text>
            </Box>
          </Box>

          {/* Glow behind the card */}
          <Box
            position="absolute"
            inset="-20px"
            borderRadius="40px"
            bg="radial-gradient(ellipse at center, rgba(112,85,255,0.12), transparent 70%)"
            zIndex={-1}
          />
        </Box>
      </SimpleGrid>
    </Section>
  );
}

// ─── 2. Mission & Vision ──────────────────────────────────────────────────────
function MissionVisionSection() {
  const cards = [
    {
      icon: <Icons.Rocket />,
      colorScheme: "brand",
      label: "Our Mission",
      title: "Education Without Boundaries",
      text: "We exist to make exceptional education accessible to every human on the planet — regardless of geography, economic status, or background. Our platform bridges the gap between ambition and opportunity, one lesson at a time.",
    },
    {
      icon: <Icons.Eye />,
      colorScheme: "gold",
      label: "Our Vision",
      title: "A Universe of Infinite Learners",
      text: "We envision a world where continuous learning is a human right, not a privilege. NextUniVerse aims to be the global education layer — the place where every person's growth story begins and never ends.",
    },
  ];

  return (
    <Section>
      <Stack spacing={16} align="center">
        <Stack spacing={4} align="center" textAlign="center" maxW="600px">
          <SectionLabel>Purpose</SectionLabel>
          <Heading
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
            fontWeight="800"
            letterSpacing="-0.02em"
          
              color="white">
            Guided by purpose,{" "}
            {/* FIX: replaced bgClip text with plain color */}
            <Box as="span" color="#a78bfa">driven by impact</Box>
          </Heading>
          <Text fontSize="lg" color="whiteAlpha.600" lineHeight="1.8">
            Our mission and vision aren't just words on a wall — they're the code running in everything we build.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
          {cards.map((card, i) => (
            <Box
              key={i}
              bg="card.bg"
              border="1px solid"
              borderColor="card.border"
              borderRadius="2xl"
              p={8}
              cursor="default"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                transform: "translateY(-6px)",
                shadow: card.colorScheme === "brand"
                  ? "0 20px 60px rgba(112,85,255,0.2)"
                  : "0 20px 60px rgba(251,191,36,0.15)",
                borderColor: card.colorScheme === "brand" ? "brand.500" : "gold.500",
              }}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                h="1px"
                bgGradient={card.colorScheme === "brand"
                  ? "linear(to-r, transparent, brand.500, transparent)"
                  : "linear(to-r, transparent, gold.400, transparent)"}
              />
              <Stack spacing={6}>
                <IconBadge colorScheme={card.colorScheme}>
                  {card.icon}
                </IconBadge>
                <Stack spacing={3}>
                  <Badge
                    alignSelf="flex-start"
                    variant="subtle"
                    colorScheme={card.colorScheme === "brand" ? "purple" : "yellow"}
                    fontSize="xs"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    fontFamily="body"
                  >
                    {card.label}
                  </Badge>
                  <Heading fontSize="xl" fontWeight="700" letterSpacing="-0.01em"
              color="white">
                    {card.title}
                  </Heading>
                  <Text color="whiteAlpha.600" lineHeight="1.8">
                    {card.text}
                  </Text>
                </Stack>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Section>
  );
}

// ─── 3. Statistics ────────────────────────────────────────────────────────────
function StatisticsSection() {
  const stats = [
    { value: "2000000", suffix: "+", label: "Active Students", icon: <Icons.Users /> },
    { value: "12500", suffix: "+", label: "Courses Available", icon: <Icons.BookOpen /> },
    { value: "98", suffix: "%", label: "Satisfaction Rate", icon: <Icons.Star /> },
    { value: "150", suffix: "+", label: "Countries Reached", icon: <Icons.Globe /> },
  ];

  return (
    <Box
      as="section"
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-r, cosmos.surface, cosmos.bg, cosmos.surface)"
        zIndex={0}
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="800px"
        h="300px"
        bg="radial-gradient(ellipse, rgba(112,85,255,0.07), transparent 70%)"
        zIndex={0}
      />

      <Container maxW="7xl" position="relative" zIndex={1}>
        <Stack spacing={16} align="center">
          <Stack spacing={4} align="center" textAlign="center">
            <SectionLabel>By The Numbers</SectionLabel>
            <Heading
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              fontWeight="800"
              letterSpacing="-0.02em"
            
              color="white">
              The scale of our{" "}
              {/* FIX: replaced bgClip text with plain gold color */}
              <Box as="span" color="#fbbf24">impact</Box>
            </Heading>
          </Stack>

          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 4 }}
            spacing={6}
            w="100%"
          >
            {stats.map((stat, i) => (
              <VStack
                key={i}
                spacing={4}
                p={8}
                bg="card.bg"
                border="1px solid"
                borderColor="card.border"
                borderRadius="2xl"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  transform: "translateY(-6px)",
                  shadow: "0 20px 50px rgba(0,0,0,0.3)",
                  borderColor: "brand.600",
                }}
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  bottom={0}
                  left="50%"
                  transform="translateX(-50%)"
                  w="60%"
                  h="1px"
                  bgGradient="linear(to-r, transparent, brand.500, transparent)"
                  opacity={0.5}
                />
                <Box color="#a78bfa">{stat.icon}</Box>
                <VStack spacing={1}>
                  {/* FIX: replaced bgClip="text" + color="transparent" with a solid light color */}
                  <Heading
                    fontSize={{ base: "3xl", md: "4xl" }}
                    fontWeight="900"
                    letterSpacing="-0.03em"
                    color="#c4b5fd"
                  >
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </Heading>
                  <Text
                    fontSize="sm"
                    color="whiteAlpha.600"
                    fontWeight="500"
                    textAlign="center"
                    letterSpacing="0.03em"
                  >
                    {stat.label}
                  </Text>
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}

// ─── 4. Core Values ───────────────────────────────────────────────────────────
function CoreValuesSection() {
  const values = [
    {
      icon: <Icons.Lightbulb />,
      colorScheme: "brand",
      title: "Innovation First",
      text: "We challenge the status quo daily — constantly iterating, experimenting, and reimagining what education can be in the digital age.",
    },
    {
      icon: <Icons.Globe />,
      colorScheme: "teal",
      title: "Global Inclusion",
      text: "Every feature, every language, every accessibility option we build is in service of making learning available for everyone, everywhere.",
    },
    {
      icon: <Icons.Heart />,
      colorScheme: "gold",
      title: "Learner-Centric",
      text: "Our learners are not users — they're our partners. Every product decision starts with the question: how does this help a student grow?",
    },
    {
      icon: <Icons.Shield />,
      colorScheme: "brand",
      title: "Trust & Integrity",
      text: "We build long-term relationships grounded in honesty — transparent pricing, credible content, and real results you can measure.",
    },
    {
      icon: <Icons.Star />,
      colorScheme: "gold",
      title: "Quality Obsessed",
      text: "Every course is curated, every instructor is vetted, every experience is refined. Mediocrity has no seat at our table.",
    },
    {
      icon: <Icons.Users />,
      colorScheme: "teal",
      title: "Community Power",
      text: "Learning is social. We foster peer-to-peer connection, mentorship networks, and collaborative projects that multiply individual growth.",
    },
  ];

  return (
    <Section>
      <Stack spacing={16} align="center">
        <Stack spacing={4} align="center" textAlign="center" maxW="600px">
          <SectionLabel>What We Stand For</SectionLabel>
          <Heading
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
            fontWeight="800"
            letterSpacing="-0.02em"
          
              color="white">
            Core values that{" "}
            {/* FIX: plain color instead of bgClip */}
            <Box as="span" color="#a78bfa">define us</Box>
          </Heading>
          <Text fontSize="lg" color="whiteAlpha.600" lineHeight="1.8">
            Six principles that guide every team member, every product feature, and every partnership we pursue.
          </Text>
        </Stack>

        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={6}
          w="100%"
          alignItems="stretch"
        >
          {values.map((val, i) => (
            <Box
              key={i}
              bg="card.bg"
              border="1px solid"
              borderColor="card.border"
              borderRadius="2xl"
              p={7}
              cursor="default"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                transform: "translateY(-8px) scale(1.01)",
                shadow: "0 24px 60px rgba(0,0,0,0.35)",
                borderColor: val.colorScheme === "brand"
                  ? "brand.500"
                  : val.colorScheme === "gold"
                  ? "gold.500"
                  : "teal.500",
              }}
              position="relative"
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              {/* Top shimmer line */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="2px"
                bgGradient={
                  val.colorScheme === "brand"
                    ? "linear(to-r, transparent, brand.500, transparent)"
                    : val.colorScheme === "gold"
                    ? "linear(to-r, transparent, gold.400, transparent)"
                    : "linear(to-r, transparent, teal.400, transparent)"
                }
                opacity={0}
                transition="opacity 0.3s"
                _groupHover={{ opacity: 1 }}
              />
              <Stack spacing={5} flex={1}>
                <IconBadge colorScheme={val.colorScheme}>
                  {val.icon}
                </IconBadge>
                <Stack spacing={3}>
                  <Heading fontSize="lg" fontWeight="700" letterSpacing="-0.01em"
              color="white">
                    {val.title}
                  </Heading>
                  <Text fontSize="sm" color="whiteAlpha.600" lineHeight="1.8">
                    {val.text}
                  </Text>
                </Stack>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Section>
  );
}

// ─── 5. Why Choose Section ────────────────────────────────────────────────────
function WhyChooseSection() {
  const features = [
    {
      icon: <Icons.Zap />,
      title: "AI-Powered Learning Paths",
      description:
        "Our adaptive engine analyzes your goals, pace, and strengths to create a personalized roadmap that evolves as you learn.",
    },
    {
      icon: <Icons.Award />,
      title: "Industry-Recognized Credentials",
      description:
        "Earn certificates vetted by 500+ hiring partners. Our credentials are built to open doors, not just collect digital dust.",
    },
    {
      icon: <Icons.Users />,
      title: "Expert-Led Live Sessions",
      description:
        "Access live cohorts with world-class practitioners, interactive Q&A sessions, and real-time feedback on your work.",
    },
    {
      icon: <Icons.Globe />,
      title: "24/7 Community & Support",
      description:
        "Never learn alone. Engage in forums, study groups, and get support from our dedicated mentorship network around the clock.",
    },
  ];

  return (
    <Box
      as="section"
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(135deg, rgba(112,85,255,0.04), transparent, rgba(251,191,36,0.03))"
        zIndex={0}
      />

      <Container maxW="7xl" position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 12, lg: 20 }} alignItems="center">
          {/* Left */}
          <Stack spacing={8}>
            <Stack spacing={4}>
              <SectionLabel>Why NextUniVerse</SectionLabel>
              <Heading
                fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                fontWeight="800"
                letterSpacing="-0.02em"
                lineHeight="1.2"
              
              color="white">
                Built different.{" "}
                {/* FIX: plain color instead of bgClip */}
                <Box as="span" display="block" color="#a78bfa">
                  Built for you.
                </Box>
              </Heading>
              <Text fontSize="lg" color="whiteAlpha.600" lineHeight="1.8" maxW="480px">
                We didn't build another course marketplace. We built a learning ecosystem — where technology, community, and world-class content converge.
              </Text>
            </Stack>

            <HStack spacing={4} flexWrap="wrap">
              <Button variant="primary" size="lg" aria-label="Explore all NextUniVerse courses">
                Explore Courses
              </Button>
              <Button
                variant="ghost"
                size="lg"
                color="whiteAlpha.600"
                _hover={{ color: "white" }}
                aria-label="Read student success stories"
              >
                Read Stories →
              </Button>
            </HStack>
          </Stack>

          {/* Right — Feature list */}
          <Stack spacing={0} divider={<Divider borderColor="cosmos.border" />}>
            {features.map((feat, i) => (
              <HStack
                key={i}
                spacing={6}
                py={7}
                align="flex-start"
                transition="all 0.25s"
                _hover={{ "& .feat-icon": { transform: "scale(1.1)" } }}
              >
                <Box
                  className="feat-icon"
                  color="#a78bfa"
                  transition="transform 0.25s"
                  flexShrink={0}
                  mt="2px"
                >
                  {feat.icon}
                </Box>
                <VStack align="flex-start" spacing={1}>
                  <Heading fontSize="md" fontWeight="700" letterSpacing="-0.01em"
              color="white">
                    {feat.title}
                  </Heading>
                  <Text fontSize="sm" color="whiteAlpha.600" lineHeight="1.75">
                    {feat.description}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

// ─── 6. CTA Section ───────────────────────────────────────────────────────────
function CTASection() {
  return (
    <Box as="section" py={{ base: 16, md: 24 }}>
      <Container maxW="7xl">
        <Box
          bg="card.bg"
          border="1px solid"
          borderColor="cosmos.border"
          borderRadius="3xl"
          p={{ base: 10, md: 16 }}
          position="relative"
          overflow="hidden"
          shadow="0 40px 100px rgba(0,0,0,0.4)"
          textAlign="center"
        >
          {/* Decorative background effects */}
          <Box
            position="absolute"
            top="-100px"
            left="50%"
            transform="translateX(-50%)"
            w="600px"
            h="300px"
            bg="radial-gradient(ellipse, rgba(112,85,255,0.15), transparent 70%)"
            zIndex={0}
          />
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            h="1px"
            bgGradient="linear(to-r, transparent, brand.500, gold.400, transparent)"
          />
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            h="1px"
            bgGradient="linear(to-r, transparent, brand.500, gold.400, transparent)"
          />

          {/* Decorative dots */}
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              position="absolute"
              w="4px"
              h="4px"
              borderRadius="full"
              bg={i % 2 === 0 ? "brand.400" : "gold.400"}
              opacity={0.4}
              top={`${15 + i * 14}%`}
              left={i < 3 ? `${4 + i * 3}%` : `${88 + (i - 3) * 2}%`}
            />
          ))}

          <Stack spacing={8} align="center" position="relative" zIndex={1}>
            <Stack spacing={4} align="center" maxW="640px">
              <Badge
                px={4}
                py={1.5}
                borderRadius="full"
                bg="rgba(251,191,36,0.1)"
                color="#fbbf24"
                border="1px solid"
                borderColor="rgba(251,191,36,0.3)"
                fontSize="xs"
                fontWeight="600"
                letterSpacing="0.12em"
                textTransform="uppercase"
                fontFamily="body"
              >
                🚀 Join the Movement
              </Badge>
              <Heading
                fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                fontWeight="900"
                letterSpacing="-0.02em"
                lineHeight="1.2"
              
              color="white">
                Your universe of knowledge{" "}
                {/* FIX: replaced bgClip="text" + color="transparent" with readable gradient via sx */}
                <Box
                  as="span"
                  sx={{
                    background: "linear-gradient(to right, #a78bfa, #fbbf24)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  starts today.
                </Box>
              </Heading>
              <Text fontSize="lg" color="whiteAlpha.600" lineHeight="1.8" maxW="520px">
                Join over 2 million learners who've already taken the leap. Your first course is free — no credit card required, no commitment needed.
              </Text>
            </Stack>

            <Stack direction={{ base: "column", sm: "row" }} spacing={4} align="center">
              <Button
                variant="primary"
                size="lg"
                aria-label="Create your free NextUniVerse account"
                rightIcon={<Icons.ArrowRight />}
                px={10}
              >
                Create Free Account
              </Button>
              <Button
                variant="ghost"
                size="lg"
                color="whiteAlpha.600"
                _hover={{ color: "white" }}
                aria-label="Browse the NextUniVerse course catalog"
              >
                Browse Catalog
              </Button>
            </Stack>

            <HStack spacing={8} pt={2} flexWrap="wrap" justify="center">
              {["Free forever plan", "Cancel anytime", "Certified instructors"].map((item, i) => (
                <HStack key={i} spacing={2}>
                  <Box
                    w="18px"
                    h="18px"
                    borderRadius="full"
                    bg="rgba(112,85,255,0.2)"
                    color="#a78bfa"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icons.Check />
                  </Box>
                  <Text fontSize="sm" color="whiteAlpha.600" fontWeight="500">{item}</Text>
                </HStack>
              ))}
            </HStack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

// Navbar is provided globally by the app; do not render a second navbar here.

// Footer removed from About page; App.js provides the global Footer

// ─── Main About Page ──────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <Box minH="100vh" bg="#070B1A" position="relative">
      <CosmicBg />

      {/* Google Fonts */}
      <Box
        as="style"
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');`,
        }}
      />

      {/* navbar is provided by App layout */}
      <HeroSection />
      <MissionVisionSection />
      <StatisticsSection />
      <CoreValuesSection />
      <WhyChooseSection />
      <CTASection />
      {/* Footer is provided globally by App.js */}
    </Box>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default AboutPage;