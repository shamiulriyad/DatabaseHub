import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Link,
  Text,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaBook } from 'react-icons/fa';

const Footer = () => {
  const footerBg = useColorModeValue('gray.900', 'gray.950');
  const textColor = useColorModeValue('gray.300', 'gray.400');
  const linkHoverColor = useColorModeValue('purple.400', 'purple.300');
  const borderColor = useColorModeValue('gray.800', 'gray.900');

  const FooterLink = ({ to, children, ...props }) => (
    <Link
      as={RouterLink}
      to={to}
      color={textColor}
      _hover={{ color: linkHoverColor, textDecoration: 'none' }}
      fontSize="sm"
      transition="all 0.2s"
      {...props}
    >
      {children}
    </Link>
  );

  const SocialLink = ({ href, icon, label }) => (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      display="flex"
      alignItems="center"
      justifyContent="center"
      w={10}
      h={10}
      rounded="full"
      bg="gray.800"
      color={textColor}
      _hover={{ bg: 'purple.600', color: 'white', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <Icon as={icon} boxSize={5} />
    </Link>
  );

  return (
    <Box bg={footerBg} color={textColor} py={16} borderTop="1px" borderColor={borderColor} mt={20}>
      <Container maxW="7xl">
        {/* Footer Content Grid */}
        <Grid
          templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
          gap={8}
          mb={12}
        >
          {/* About Section */}
          <GridItem>
            <VStack align="start" spacing={4}>
              <Link
                as={RouterLink}
                to="/"
                display="flex"
                alignItems="center"
                gap={2}
                _hover={{ textDecor: 'none' }}
                fontSize="lg"
                fontWeight="bold"
              >
                <Icon as={FaBook} color="purple.400" boxSize={5} />
                <Text bgGradient="linear(135deg, purple.400, blue.400)" bgClip="text">
                  NextUniVerse
                </Text>
              </Link>
              <Text fontSize="sm" lineHeight="tall">
                Empowering learners worldwide with quality education and cutting-edge learning experiences.
              </Text>
            </VStack>
          </GridItem>

          {/* Quick Links */}
          <GridItem>
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold" fontSize="md" color="white">
                Platform
              </Text>
              <FooterLink to="/courses">Browse Courses</FooterLink>
              <FooterLink to="/community">Community</FooterLink>
              <FooterLink to="/clans">Clans</FooterLink>
              <FooterLink to="/competitions">Competitions</FooterLink>
            </VStack>
          </GridItem>

          {/* Company Links */}
          <GridItem>
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold" fontSize="md" color="white">
                Company
              </Text>
              <Link
                href="#about"
                color={textColor}
                _hover={{ color: linkHoverColor }}
                fontSize="sm"
                transition="all 0.2s"
              >
                About Us
              </Link>
              <Link
                href="#contact"
                color={textColor}
                _hover={{ color: linkHoverColor }}
                fontSize="sm"
                transition="all 0.2s"
              >
                Contact
              </Link>
              <Link
                href="#blog"
                color={textColor}
                _hover={{ color: linkHoverColor }}
                fontSize="sm"
                transition="all 0.2s"
              >
                Blog
              </Link>
              <Link
                href="#careers"
                color={textColor}
                _hover={{ color: linkHoverColor }}
                fontSize="sm"
                transition="all 0.2s"
              >
                Careers
              </Link>
            </VStack>
          </GridItem>

          {/* Connect Section */}
          <GridItem>
            <VStack align="start" spacing={3}>
              <Text fontWeight="bold" fontSize="md" color="white">
                Connect With Us
              </Text>
              <HStack spacing={2}>
                <SocialLink href="https://facebook.com" icon={FaFacebook} label="Facebook" />
                <SocialLink href="https://twitter.com" icon={FaTwitter} label="Twitter" />
                <SocialLink href="https://linkedin.com" icon={FaLinkedin} label="LinkedIn" />
                <SocialLink href="https://github.com" icon={FaGithub} label="GitHub" />
              </HStack>
              <Text fontSize="xs" color="gray.500" pt={2}>
                Follow us on social media for updates and news
              </Text>
            </VStack>
          </GridItem>
        </Grid>

        {/* Divider */}
        <Divider borderColor={borderColor} my={8} />

        {/* Footer Bottom */}
        <Box>
          <Grid
            templateColumns={{ base: '1fr', md: '1fr 1fr' }}
            gap={4}
            alignItems="center"
            justifyContent="space-between"
          >
            <Text fontSize="sm" color="gray.500">
              &copy; 2026 NextUniVerse. All rights reserved.
            </Text>
            <HStack spacing={6} justify={{ base: 'start', md: 'end' }} fontSize="sm">
              <Link
                href="#privacy"
                color={textColor}
                _hover={{ color: linkHoverColor }}
                transition="all 0.2s"
              >
                Privacy Policy
              </Link>
              <Link
                href="#terms"
                color={textColor}
                _hover={{ color: linkHoverColor }}
                transition="all 0.2s"
              >
                Terms of Service
              </Link>
              <Link
                href="#cookies"
                color={textColor}
                _hover={{ color: linkHoverColor }}
                transition="all 0.2s"
              >
                Cookie Policy
              </Link>
            </HStack>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
