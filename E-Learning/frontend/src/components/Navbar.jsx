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
  Image,
  Button,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Icon,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
} from '@chakra-ui/react';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import { normalizeAvatar } from '../utils/imageUtils';
import FinalLogo from '../assets/final.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const rawAvatar = user && (
    user.profileImageUrl || user.ProfileImageUrl || user.ProfileImage || user.avatar || user.Avatar || (user.user && (user.user.profileImageUrl || user.user.ProfileImageUrl))
  );

  // Use shared normalizer so 'Uploads/...' and '/Uploads/...' both resolve to absolute URLs
  const avatarSrc = normalizeAvatar(rawAvatar) || null;

  useEffect(() => {
    if (user) {
      // Helpful debug info when avatar isn't showing
      // eslint-disable-next-line no-console
      console.debug('Navbar user:', user, 'avatarSrc:', avatarSrc);
    }
  }, [user, avatarSrc]);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const navGradient = 'linear(135deg, brand.600 0%, navy.500 100%)';
  const navShadow = 'none';
  const linkColor = 'white';
  const linkHoverColor = 'accent';
  const borderColor = 'transparent';
  const hoverBg = 'rgba(255,255,255,0.04)';
  const loginButtonHoverBg = 'rgba(255,255,255,0.04)';

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

  // MenuList colors — prefer a dark theme that matches the site background
  const menuListBg = '#0b1220';
  const menuListColor = 'whiteAlpha.900';
  const menuListBorderColor = 'rgba(124,58,237,0.12)';

  return (
    <Box
      bgGradient={navGradient}
      shadow={navShadow}
      position="relative"
      zIndex={100}
      borderBottom="0"
      borderColor={borderColor}
    >
      <Container maxW="7xl" py={0}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Link
            as={RouterLink}
            to="/"
            _hover={{ textDecor: 'none' }}
          >
            <Flex alignItems="center" gap={3}>
              {/* Use provided final.png as the logo for both mobile and desktop */}
              <Image src={FinalLogo} alt="NextUniVerse" h={8} display={{ base: 'block', md: 'block' }} />

              {/* Show textual brand next to logo on md+ screens */}
              <Text
                display={{ base: 'none', md: 'block' }}
                fontFamily={`'Playfair Display', Georgia, serif`}
                fontSize="lg"
                fontWeight="700"
                bgGradient="linear(135deg,#c4b5fd,#7c3aed,#f59e0b)"
                bgClip="text"
                letterSpacing="-0.02em"
                ml={1}
              >
                NextUniVerse
              </Text>
            </Flex>
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
                
               
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size="sm"
                    color="white"
                    leftIcon={
                      avatarSrc ? (
                        <Avatar src={avatarSrc} name={user?.firstName || user?.FirstName || user?.username || user?.Username} size="sm" borderWidth="2px" borderColor="rgba(255,255,255,0.22)" />
                      ) : (
                        <Icon as={FaUserCircle} boxSize={5} color="white" />
                      )
                    }
                    bg="rgba(255,255,255,0.08)"
                    _hover={{ bg: 'rgba(255,255,255,0.12)' }}
                    borderRadius="999px"
                    px={4}
                    py={1}
                    minW="auto"
                    fontWeight={600}
                  >
                    {user.firstName || user.FirstName || user.username || user.Username || 'Profile'}
                  </MenuButton>
                  <MenuList
                    bg={menuListBg}
                    color={menuListColor}
                    borderColor={menuListBorderColor}
                    borderRadius="12px"
                    boxShadow="0 8px 30px rgba(3,3,10,0.6)"
                    py={2}
                  >
                    <MenuItem as={RouterLink} to="/profile" bg="transparent" _hover={{ bg: 'rgba(255,255,255,0.04)' }}>
                      My Profile
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/profile/edit" bg="transparent" _hover={{ bg: 'rgba(255,255,255,0.04)' }}>
                      Edit Profile
                    </MenuItem>
                    {user.isTeacher && !user.isAdmin && (
                      <MenuItem as={RouterLink} to="/teacher" bg="transparent" _hover={{ bg: 'rgba(255,255,255,0.04)' }}>
                        Teacher Dashboard
                      </MenuItem>
                    )}
                    {user.isAdmin && (
                      <>
                        <MenuDivider borderColor="rgba(255,255,255,0.04)" />
                        <MenuItem as={RouterLink} to="/admin/home" bg="transparent" _hover={{ bg: 'rgba(255,255,255,0.04)' }}>
                          Admin Home
                        </MenuItem>
                        <MenuItem as={RouterLink} to="/admin/dashboard" bg="transparent" _hover={{ bg: 'rgba(255,255,255,0.04)' }}>
                          Admin Dashboard
                        </MenuItem>
                        <MenuItem as={RouterLink} to="/admin/manage-teachers" bg="transparent" _hover={{ bg: 'rgba(255,255,255,0.04)' }}>
                          Pending Teachers
                        </MenuItem>
                        <MenuItem as={RouterLink} to="/admin/manage-teachers" bg="transparent" _hover={{ bg: 'rgba(255,255,255,0.04)' }}>
                          All Applications
                        </MenuItem>
                      </>
                    )}
                    <MenuDivider borderColor="rgba(255,255,255,0.04)" />
                    <MenuItem onClick={handleLogout} color="red.400" bg="transparent" _hover={{ bg: 'rgba(255,255,255,0.04)' }}>
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
                  bg="brand.500"
                  color="white"
                  _hover={{ bg: 'brand.600' }}
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
            icon={<Icon as={isOpen ? FaTimes : FaBars} color="white" />}
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
                  {user.isAdmin && (
                    <NavLink to="/admin/home" onClick={onClose}>Admin Home</NavLink>
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
