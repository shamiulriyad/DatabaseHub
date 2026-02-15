import React from 'react';
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

const PrivateNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const navGradient = 'linear(135deg, brand.600 0%, navy.500 100%)';
  const navShadow = 'none';
  const linkColor = 'white';
  const linkHoverColor = 'accent';
  const borderColor = 'transparent';
  const hoverBg = 'rgba(255,255,255,0.04)';

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
    <Box bgGradient={navGradient} shadow={navShadow} position="sticky" top={0} zIndex={100} borderBottom="0" borderColor={borderColor}>
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
            color="white"
          >
            <Icon as={FaBook} color="white" boxSize={6} />
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

          {/* Auth Section - Authenticated Users Only */}
          <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
            {user && (
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
                    leftIcon={<Icon as={FaUserCircle} boxSize={5} />}
                  >
                    {user.firstName || user.username || 'Profile'}
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
                        <MenuItem as={RouterLink} to="/admin/manage-teachers">
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
              
              {user && (
                <>
                  <NavLink to="/dashboard" onClick={onClose}>Dashboard</NavLink>
                  <NavLink to="/profile" onClick={onClose}>Profile</NavLink>
                  {user.isAdmin && (
                    <NavLink to="/admin/dashboard" onClick={onClose}>Admin</NavLink>
                  )}
                  {user.isTeacher && (
                    <NavLink to="/teacher" onClick={onClose}>Teacher Dashboard</NavLink>
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
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default PrivateNavbar;
