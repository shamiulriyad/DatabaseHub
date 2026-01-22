import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import {
  Box,
  Container,
  Flex,
  HStack,
  VStack,
  Link,
  Button,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
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
import { FaBars, FaTimes, FaUserCircle, FaBook } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const rawAvatar = user && (
    user.profileImageUrl || user.ProfileImageUrl || user.ProfileImage || user.avatar || user.Avatar || (user.user && (user.user.profileImageUrl || user.user.ProfileImageUrl))
  );

  // Normalize avatar URL: if it's a relative /Uploads path, make it absolute so browser can load it
  const avatarSrc = rawAvatar && typeof rawAvatar === 'string'
    ? (rawAvatar.startsWith('/Uploads') ? `${window.location.origin}${rawAvatar}` : rawAvatar)
    : rawAvatar;

  useEffect(() => {
    if (user) {
      // Helpful debug info when avatar isn't showing
      // eslint-disable-next-line no-console
      console.debug('Navbar user:', user, 'avatarSrc:', avatarSrc);
    }
  }, [user, avatarSrc]);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const navBg = useColorModeValue('white', 'gray.800');
  const navShadow = useColorModeValue('md', 'md');
  const linkColor = useColorModeValue('gray.600', 'gray.300');
  const linkHoverColor = useColorModeValue('purple.600', 'purple.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const loginButtonHoverBg = useColorModeValue('gray.100', 'gray.700');

  const handleLogout = () => {
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

          {/* Auth Section */}
          <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
            {user ? (
              <>
                <NotificationBell />
                {user.isAdmin ? (
                  <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>
                ) : user.isTeacher ? (
                  <NavLink to="/teacher">Teacher Dashboard</NavLink>
                ) : (
                  <NavLink to="/dashboard">Dashboard</NavLink>
                )}
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size="sm"
                    leftIcon={
                      avatarSrc ? (
                        <Avatar src={avatarSrc} name={user?.firstName || user?.FirstName || user?.username || user?.Username} size="sm" />
                      ) : (
                        <Icon as={FaUserCircle} boxSize={5} />
                      )
                    }
                  >
                    {user.firstName || user.FirstName || user.username || user.Username || 'Profile'}
                  </MenuButton>
                  <MenuList>
                    <MenuItem as={RouterLink} to="/profile">
                      My Profile
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/profile/edit">
                      Edit Profile
                    </MenuItem>
                    {user.isTeacher && !user.isAdmin && (
                      <MenuItem as={RouterLink} to="/teacher">
                        Teacher Dashboard
                      </MenuItem>
                    )}
                    {user.isAdmin && (
                      <>
                        <MenuDivider />
                        <MenuItem as={RouterLink} to="/admin/dashboard">
                          Admin Dashboard
                        </MenuItem>
                        <MenuItem as={RouterLink} to="/admin/teachers">
                          Pending Teachers
                        </MenuItem>
                        <MenuItem as={RouterLink} to="/admin/manage-teachers">
                          All Applications
                        </MenuItem>
                      </>
                    )}
                    <MenuDivider />
                    <MenuItem onClick={handleLogout} color="red.500">
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  as={RouterLink}
                  to="/login"
                  color={linkColor}
                  _hover={{ color: linkHoverColor, bg: loginButtonHoverBg }}
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
              <NavLink to="/courses" onClick={onClose}>University</NavLink>
              <NavLink to="/about" onClick={onClose}>About</NavLink>
              <NavLink to="/community" onClick={onClose}>Community</NavLink>
              <NavLink to="/clans" onClick={onClose}>Clans</NavLink>
              <NavLink to="/competitions" onClick={onClose}>Competitions</NavLink>
              
              {user ? (
                <>
                  <NavLink to="/dashboard" onClick={onClose}>Dashboard</NavLink>
                  <NavLink to="/profile" onClick={onClose}>Profile</NavLink>
                  {user.role === 'Admin' && (
                    <NavLink to="/admin" onClick={onClose}>Admin</NavLink>
                  )}
                  <Button
                    w="full"
                    colorScheme="red"
                    variant="outline"
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

export default Navbar;
