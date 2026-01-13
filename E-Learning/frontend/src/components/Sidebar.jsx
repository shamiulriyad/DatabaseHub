import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Box,
  VStack,
  Link,
  Icon,
  Text,
  useColorModeValue,
  Badge,
  Divider,
  Button,
  HStack,
} from '@chakra-ui/react';
import {
  FaTachometerAlt,
  FaBook,
  FaClipboardList,
  FaQuestionCircle,
  FaUser,
  FaPlus,
  FaGraduationCap,
  FaCheckSquare,
  FaCog,
  FaUsers,
  FaFileInvoiceDollar,
  FaChalkboardTeacher,
  FaStar,
  FaShieldAlt,
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('activeRole') || (user?.isTeacher ? 'teacher' : 'student');
  });

  // If user has both roles, let them choose
  React.useEffect(() => {
    localStorage.setItem('activeRole', activeRole);
  }, [activeRole]);
  
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('purple.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('purple.100', 'purple.900');
  const activeTextColor = useColorModeValue('purple.700', 'purple.200');
  const roleSelectorBg = useColorModeValue('purple.50', 'gray.700');

  if (!user) return null;

  const SidebarLink = ({ to, icon, label, badge }) => (
    <Link
      as={RouterLink}
      to={to}
      display="flex"
      alignItems="center"
      gap={3}
      px={4}
      py={3}
      rounded="lg"
      color={textColor}
      _hover={{
        bg: hoverBg,
        textDecoration: 'none',
        transform: 'translateX(4px)',
      }}
      _activeLink={{
        borderColor: 'purple.500',
        bg: activeBg,
        color: activeTextColor,
        fontWeight: '600',
      }}
      transition="all 0.2s"
      borderLeft="4px solid transparent"
    >
      <Icon as={icon} boxSize={5} />
      <Text flex={1} fontSize="sm">{label}</Text>
      {badge && <Badge colorScheme="purple" fontSize="xs">{badge}</Badge>}
    </Link>
  );

  return (
    <Box
      as="aside"
      w={{ base: '100%', md: '280px' }}
      bg={sidebarBg}
      borderRight={{ base: 'none', md: `1px solid ${borderColor}` }}
      borderBottom={{ base: `1px solid ${borderColor}`, md: 'none' }}
      overflowY="auto"
      py={4}
      px={2}
      position={{ base: 'sticky', md: 'sticky' }}
      top={16}
      zIndex={50}
      maxH={{ base: 'auto', md: 'calc(100vh - 64px)' }}
    >
      <VStack spacing={1} align="stretch">
        {/* Role Selector - Show if user has both roles */}
        {user.isTeacher && user.isStudent && !user.isAdmin && (
          <>
            <Box px={4} py={3} bg={roleSelectorBg} rounded="lg" mb={2}>
              <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2} textTransform="uppercase">
                Select Role
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  flex={1}
                  variant={activeRole === 'teacher' ? 'solid' : 'outline'}
                  colorScheme={activeRole === 'teacher' ? 'purple' : 'gray'}
                  onClick={() => setActiveRole('teacher')}
                >
                  Teacher
                </Button>
                <Button
                  size="sm"
                  flex={1}
                  variant={activeRole === 'student' ? 'solid' : 'outline'}
                  colorScheme={activeRole === 'student' ? 'purple' : 'gray'}
                  onClick={() => setActiveRole('student')}
                >
                  Student
                </Button>
              </HStack>
            </Box>
            <Divider my={2} />
          </>
        )}

        {/* Admin Navigation */}
        {user.isAdmin && (
          <>
            <Box px={4} py={2}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                Admin Panel
              </Text>
            </Box>
            <SidebarLink to="/admin/dashboard" icon={FaTachometerAlt} label="Dashboard" />
            <SidebarLink to="/admin/teachers" icon={FaChalkboardTeacher} label="Pending Teachers" badge="New" />
            <SidebarLink to="/admin/manage-teachers" icon={FaGraduationCap} label="All Applications" />
            <SidebarLink to="/admin/users" icon={FaUsers} label="Users" />
            <SidebarLink to="/admin/courses" icon={FaBook} label="Courses" />
            <SidebarLink to="/admin/payments" icon={FaFileInvoiceDollar} label="Payments" />
            <Divider my={2} />
            <SidebarLink to="/admin/settings" icon={FaCog} label="Settings" />
          </>
        )}

        {/* Teacher Navigation */}
        {user.isTeacher && !user.isAdmin && activeRole === 'teacher' && (
          <>
            <Box px={4} py={2}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                Teacher
              </Text>
            </Box>
            <SidebarLink to="/teacher" icon={FaTachometerAlt} label="Dashboard" />
            <SidebarLink to="/teacher/create-course" icon={FaPlus} label="Create Course" />
            <SidebarLink to="/teacher/manage-courses" icon={FaBook} label="My Courses" />
            <SidebarLink to="/teacher/submissions" icon={FaCheckSquare} label="Submissions" />
            <SidebarLink to="/teacher/reviews" icon={FaStar} label="Course Reviews" />
            <Divider my={2} />
            <SidebarLink to="/profile" icon={FaUser} label="My Profile" />
          </>
        )}

        {/* Student Navigation - for both pure students and student role in dual-role users */}
        {user.isStudent && !user.isAdmin && (activeRole === 'student' || !user.isTeacher) && (
          <>
            <Box px={4} py={2}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                Learning
              </Text>
            </Box>
            <SidebarLink to="/dashboard" icon={FaTachometerAlt} label="My Dashboard" />
            <SidebarLink to="/profile/enrollments" icon={FaBook} label="My Courses" />
            <SidebarLink to="/profile/assignments" icon={FaClipboardList} label="Assignments" />
            <SidebarLink to="/quizzes" icon={FaQuestionCircle} label="Quizzes" />
            <Divider my={2} />
            <Box px={4} py={2}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                Community
              </Text>
            </Box>
            <SidebarLink to="/clans" icon={FaShieldAlt} label="Clans" />
            <Divider my={2} />
            <SidebarLink to="/profile" icon={FaUser} label="My Profile" />
          </>
        )}

        {/* Pure Teacher (no student role) */}
        {user.isTeacher && !user.isAdmin && !user.isStudent && (
          <>
            <Box px={4} py={2}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                Teacher
              </Text>
            </Box>
            <SidebarLink to="/teacher" icon={FaTachometerAlt} label="Dashboard" />
            <SidebarLink to="/teacher/create-course" icon={FaPlus} label="Create Course" />
            <SidebarLink to="/teacher/manage-courses" icon={FaBook} label="My Courses" />
            <SidebarLink to="/teacher/submissions" icon={FaCheckSquare} label="Submissions" />
            <SidebarLink to="/teacher/reviews" icon={FaStar} label="Course Reviews" />
            <Divider my={2} />
            <SidebarLink to="/profile" icon={FaUser} label="My Profile" />
          </>
        )}
      </VStack>
    </Box>
  );
};

export default Sidebar;
