/**
 * Flat-style icon wrappers for consistent usage across the platform.
 *
 * Uses react-icons (already installed) — pick from any icon set:
 *   Fi* = Feather (clean, modern)   Ri* = Remix   Hi* = Heroicons
 *   Fa* = Font Awesome              Bs* = Bootstrap
 *
 * Usage:
 *   import { NavIcons, ActionIcons, CardIcons } from '../components/common/Icons';
 *   <Button leftIcon={<ActionIcons.Enroll />}>Enroll Now</Button>
 */
import React from 'react';
import { Icon } from '@chakra-ui/react';

// Feather icons (flat, minimal)
import {
  FiHome, FiBook, FiBookOpen, FiUsers, FiAward,
  FiSearch, FiBell, FiSettings, FiLogOut, FiLogIn,
  FiUser, FiEdit, FiTrash2, FiPlus, FiCheck,
  FiX, FiChevronRight, FiChevronDown, FiExternalLink,
  FiStar, FiHeart, FiMessageCircle, FiSend,
  FiPlay, FiPause, FiGrid, FiList, FiFilter,
  FiClock, FiTrendingUp, FiBarChart2, FiShield,
  FiGlobe, FiMail, FiLock, FiUnlock, FiUpload,
  FiDownload, FiEye, FiEyeOff, FiCopy, FiShare2,
  FiCalendar, FiFlag, FiBookmark, FiZap, FiTarget,
  FiLayers, FiLayout, FiMonitor, FiSmartphone,
  FiMenu, FiMoreVertical, FiMoreHorizontal,
  FiArrowLeft, FiArrowRight, FiArrowUp, FiArrowDown,
} from 'react-icons/fi';

// Remix icons (supplementary – for variety)
import {
  RiGraduationCapLine, RiTrophyLine, RiTeamLine,
  RiQuestionLine, RiLightbulbLine, RiCodeLine,
  RiDashboardLine, RiPriceTag3Line,
} from 'react-icons/ri';

// ---------------------------------------------------------------------------
// Helper – wraps any icon with consistent sizing & colour support
// ---------------------------------------------------------------------------
const wrap = (IconComponent) => {
  const WrappedIcon = ({ size = 5, color, ...props }) => (
    <Icon as={IconComponent} boxSize={size} color={color} {...props} />
  );
  WrappedIcon.displayName = IconComponent.name || 'WrappedIcon';
  return WrappedIcon;
};

// ---------------------------------------------------------------------------
// Navigation Icons
// ---------------------------------------------------------------------------
export const NavIcons = {
  Home:         wrap(FiHome),
  Courses:      wrap(FiBook),
  Explore:      wrap(FiSearch),
  Community:    wrap(FiMessageCircle),
  Clans:        wrap(FiUsers),
  Competitions: wrap(RiTrophyLine),
  Dashboard:    wrap(RiDashboardLine),
  Notifications: wrap(FiBell),
  Profile:      wrap(FiUser),
  Settings:     wrap(FiSettings),
  Menu:         wrap(FiMenu),
  More:         wrap(FiMoreVertical),
};

// ---------------------------------------------------------------------------
// Action Icons (buttons, CTAs)
// ---------------------------------------------------------------------------
export const ActionIcons = {
  Enroll:     wrap(FiPlay),
  Create:     wrap(FiPlus),
  Edit:       wrap(FiEdit),
  Delete:     wrap(FiTrash2),
  Save:       wrap(FiCheck),
  Cancel:     wrap(FiX),
  Search:     wrap(FiSearch),
  Filter:     wrap(FiFilter),
  Upload:     wrap(FiUpload),
  Download:   wrap(FiDownload),
  Share:      wrap(FiShare2),
  Copy:       wrap(FiCopy),
  Send:       wrap(FiSend),
  Login:      wrap(FiLogIn),
  Logout:     wrap(FiLogOut),
  Lock:       wrap(FiLock),
  Unlock:     wrap(FiUnlock),
  Bookmark:   wrap(FiBookmark),
  Like:       wrap(FiHeart),
};

// ---------------------------------------------------------------------------
// Card / Content Icons
// ---------------------------------------------------------------------------
export const CardIcons = {
  Course:     wrap(FiBookOpen),
  Lesson:     wrap(FiPlay),
  Quiz:       wrap(RiQuestionLine),
  Assignment: wrap(FiEdit),
  Certificate: wrap(FiAward),
  Students:   wrap(FiUsers),
  Rating:     wrap(FiStar),
  Duration:   wrap(FiClock),
  Level:      wrap(FiTarget),
  Price:      wrap(RiPriceTag3Line),
  Trending:   wrap(FiTrendingUp),
  Stats:      wrap(FiBarChart2),
  Code:       wrap(RiCodeLine),
  Idea:       wrap(RiLightbulbLine),
  Graduate:   wrap(RiGraduationCapLine),
  Team:       wrap(RiTeamLine),
  Globe:      wrap(FiGlobe),
  Calendar:   wrap(FiCalendar),
  Flag:       wrap(FiFlag),
  Zap:        wrap(FiZap),
  Shield:     wrap(FiShield),
  Layers:     wrap(FiLayers),
};

// ---------------------------------------------------------------------------
// Direction / Utility Icons
// ---------------------------------------------------------------------------
export const DirectionIcons = {
  Left:      wrap(FiArrowLeft),
  Right:     wrap(FiArrowRight),
  Up:        wrap(FiArrowUp),
  Down:      wrap(FiArrowDown),
  ChevRight: wrap(FiChevronRight),
  ChevDown:  wrap(FiChevronDown),
  External:  wrap(FiExternalLink),
  View:      wrap(FiEye),
  Hide:      wrap(FiEyeOff),
  Grid:      wrap(FiGrid),
  List:      wrap(FiList),
  Layout:    wrap(FiLayout),
  Monitor:   wrap(FiMonitor),
  Mobile:    wrap(FiSmartphone),
};

export default { NavIcons, ActionIcons, CardIcons, DirectionIcons };
