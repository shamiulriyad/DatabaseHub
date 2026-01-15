import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Box,
  Container,
  Flex,
  HStack,
  VStack,
  Link,
  Button,
  Icon,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
} from '@chakra-ui/react';
import { FaBars, FaTimes, FaBook } from 'react-icons/fa';

const PublicNavbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  console.log('PublicNavbar - User:', user);
  console.log('PublicNavbar - isAuthenticated:', !!user);
  
  const navBg = useColorModeValue('white', 'gray.800');
  const navShadow = useColorModeValue('md', 'md');
  const linkColor = useColorModeValue('gray.600', 'gray.300');
  const linkHoverColor = useColorModeValue('purple.600', 'purple.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  const handleLogout = () => {
    console.log('Logging out...');
    logout();
    navigate('/login');
  };

  const NavLink = ({ to, children, ...props }) => (
    <Link
      as={RouterLink}
      to={to}
      px={3}
      py={2}
      rounded="md"
      _hover={{ color: linkHoverColor, bg: hoverBg }}
      color={linkColor}
      transition="all 0.2s"
      fontWeight="500"
      {...props}
    >
      {children}
    </Link>
  );

  return (
    <Box bg={navBg} shadow={navShadow} position="sticky" top={0} zIndex={100} borderBottom="1px" borderColor={borderColor}>
      <Container maxW="7xl" py={0}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Link
            as={RouterLink}
            to="/"
            display="flex"
            alignItems="center"
            gap={2}
            _hover={{ textDecor: 'none' }}
            fontWeight="bold"
            fontSize="xl"
            bgGradient="linear(135deg, purple.600, blue.600)"
            bgClip="text"
          >
            <Icon as={FaBook} color="purple.600" boxSize={6} />
            NextUniVerse
          </Link>

          {/* Desktop Navigation */}
          <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
            <NavLink to="/courses">Courses</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/community">Community</NavLink>
            <NavLink to="/clans">Clans</NavLink>
            <NavLink to="/competitions">Competitions</NavLink>
          </HStack>

          {/* Auth Buttons */}
          <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  as={RouterLink}
                  to="/dashboard"
                  color={linkColor}
                  _hover={{ color: linkHoverColor, bg: hoverBg }}
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  as={RouterLink}
                  to="/profile"
                  color={linkColor}
                  _hover={{ color: linkHoverColor, bg: hoverBg }}
                >
                  Profile
                </Button>
                
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  as={RouterLink}
                  to="/login"
                  color={linkColor}
                  _hover={{ color: linkHoverColor, bg: hoverBg }}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  bg="purple.600"
                  color="white"
                  _hover={{ bg: 'purple.700' }}
                  as={RouterLink}
                  to="/register"
                >
                  Sign Up
                </Button>
              </>
            )}
          </HStack>

          {/* Mobile Menu Button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Open menu"
            icon={<Icon as={isOpen ? FaTimes : FaBars} />}
            onClick={isOpen ? onClose : onOpen}
            variant="ghost"
          />
        </Flex>
      </Container>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="top" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody pt={8}>
            <VStack spacing={4} align="start">
              <NavLink to="/courses" onClick={onClose}>Courses</NavLink>
              <NavLink to="/about" onClick={onClose}>About</NavLink>
              <NavLink to="/community" onClick={onClose}>Community</NavLink>
              <NavLink to="/clans" onClick={onClose}>Clans</NavLink>
              <NavLink to="/competitions" onClick={onClose}>Competitions</NavLink>
              
              {user ? (
                <>
                  <NavLink to="/dashboard" onClick={onClose}>Dashboard</NavLink>
                  <NavLink to="/profile" onClick={onClose}>Profile</NavLink>
                  <Button 
                    w="full" 
                    colorScheme="red" 
                    onClick={() => { 
                      handleLogout(); 
                      onClose(); 
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button w="full" variant="ghost" as={RouterLink} to="/login" onClick={onClose}>
                    Login
                  </Button>
                  <Button w="full" colorScheme="purple" as={RouterLink} to="/register" onClick={onClose}>
                    Sign Up
                  </Button>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default PublicNavbar;
