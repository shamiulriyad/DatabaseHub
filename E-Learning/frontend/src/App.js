import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// ===== Pages =====
import Home from './pages/Home/Home';
import LandingPage from './pages/Home/LandingPage';
import About from './pages/Home/About';
import ExplorePage from './pages/Explore/ExplorePage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';

import CourseList from './pages/Courses/CourseList';

// Clan Pages
import ClanList from './pages/Clans/ClanList';
import ClanDetail from './pages/Clans/ClanDetail';
import ClanCreate from './pages/Clans/ClanCreate';
import ClanMembers from './pages/Clans/ClanMembers';
import ClanEdit from './pages/Clans/ClanEdit';

// Competition Pages
import CompetitionList from './pages/Competitions/CompetitionList';
import CompetitionDetail from './pages/Competitions/CompetitionDetail';
import CompetitionCreate from './pages/Competitions/CompetitionCreate';
import ClanVsClansCompetitionCreate from './pages/Competitions/ClanVsClansCompetitionCreate';
import ClanVsClansCompetitionDetail from './pages/Competitions/ClanVsClansCompetitionDetail';
import ClanVsClansCompetitionList from './pages/Competitions/ClanVsClansCompetitionList';
import Leaderboard from './pages/Competitions/Leaderboard';
import Rankings from './pages/Competitions/Rankings';

// Profile Pages
import UserProfile from './pages/Profile/UserProfile';
import EditProfile from './pages/Profile/EditProfile';
import ChangePassword from './pages/Profile/ChangePassword';
import MyEnrollments from './pages/Profile/MyEnrollments';
import Certificates from './pages/Profile/Certificates';
import MyAssignments from './pages/Profile/MyAssignments';
import PublicUserProfile from './pages/Profile/PublicUserProfile';

// Teacher Pages
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import CreateCourse from './pages/Teacher/CreateCourse';
import ManageCourses from './pages/Teacher/ManageCourses';
import StudentSubmissions from './pages/Teacher/StudentSubmissions';
import TeacherReviews from './pages/Teacher/TeacherReviews';

// Admin Pages
import AdminPanel from './pages/Admin/AdminPanel';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageTeachers from './pages/Admin/ManageTeachers';
import PendingCompetitions from './pages/Admin/PendingCompetitions';
import CompetitionManagement from './pages/Admin/CompetitionManagement';

// Community Pages
import CommunityPage from './pages/Community/CommunityPage';
import PostDetail from './pages/Community/PostDetail';
import CreatePost from './pages/Community/CreatePost';
import PostList from './pages/Community/PostList';
import Forum from './pages/Community/Forum';

import NotFound from './pages/NotFound/NotFound';

import './App.css';
import './styles/global.css';

// ===== React Query =====
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});


// =======================
// PUBLIC LAYOUT
// =======================
function PublicLayout() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/explore" element={<ExplorePage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/courses" element={<CourseList />} />

          <Route path="/competitions" element={<CompetitionList />} />
          <Route path="/competitions/create" element={<ProtectedRoute><CompetitionCreate /></ProtectedRoute>} />
          <Route path="/competitions/:id" element={<CompetitionDetail />} />
          <Route path="/competitions/leaderboard" element={<Leaderboard />} />
          <Route path="/competitions/rankings" element={<Rankings />} />

          <Route path="/clans-competitions" element={<ClanVsClansCompetitionList />} />
          <Route path="/clans-competitions/create" element={<ProtectedRoute><ClanVsClansCompetitionCreate /></ProtectedRoute>} />
          <Route path="/clans-competitions/:id" element={<ClanVsClansCompetitionDetail />} />
          <Route path="/clans/competitions/:id" element={<ClanVsClansCompetitionDetail />} />

          <Route path="/clans" element={<ClanList />} />
          <Route path="/clans/create" element={<ProtectedRoute><ClanCreate /></ProtectedRoute>} />
          <Route path="/clans/:clanId" element={<ClanDetail />} />
          <Route path="/clans/:clanId/edit" element={<ProtectedRoute><ClanEdit /></ProtectedRoute>} />
          <Route path="/clans/:clanId/members" element={<ClanMembers />} />

          {/* Community Routes - Public */}
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/posts" element={<PostList />} />
          <Route path="/community/forum" element={<Forum />} />
          <Route path="/community/post/:postId" element={<PostDetail />} />
          <Route path="/community/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />

          {/* Public user profile (view other users) */}
          <Route path="/user/:userId" element={<PublicUserProfile />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}


// =======================
// PRIVATE LAYOUT
// =======================
function PrivateLayout() {
  return (
    <div className="app">
      <Navbar />
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />

            {/* Profile */}
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/profile/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/profile/enrollments" element={<ProtectedRoute requiredStudent><MyEnrollments /></ProtectedRoute>} />
            <Route path="/profile/certificates" element={<ProtectedRoute requiredStudent><Certificates /></ProtectedRoute>} />
            <Route path="/profile/assignments" element={<ProtectedRoute requiredStudent><MyAssignments /></ProtectedRoute>} />

            {/* Teacher */}
            <Route path="/teacher" element={<ProtectedRoute requiredTeacher><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/create-course" element={<ProtectedRoute requiredTeacher><CreateCourse /></ProtectedRoute>} />
            <Route path="/teacher/manage-courses" element={<ProtectedRoute requiredTeacher><ManageCourses /></ProtectedRoute>} />
            <Route path="/teacher/course/:courseId/submissions" element={<ProtectedRoute requiredTeacher><StudentSubmissions /></ProtectedRoute>} />
            <Route path="/teacher/reviews" element={<ProtectedRoute requiredTeacher><TeacherReviews /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/teachers" element={<ProtectedRoute requiredAdmin><AdminPanel /></ProtectedRoute>} />
            <Route path="/admin/manage-teachers" element={<ProtectedRoute requiredAdmin><ManageTeachers /></ProtectedRoute>} />
            <Route path="/admin/pending-competitions" element={<ProtectedRoute requiredAdmin><PendingCompetitions /></ProtectedRoute>} />
            <Route path="/admin/competitions" element={<ProtectedRoute requiredAdmin><CompetitionManagement /></ProtectedRoute>} />

            {/* Community Routes - Private (Same as public but accessible from private layout) */}
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/community/posts" element={<ProtectedRoute><PostList /></ProtectedRoute>} />
            <Route path="/community/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
            <Route path="/community/post/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
            <Route path="/community/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />

            {/* Public user profile (view other users) */}
            <Route path="/user/:userId" element={<PublicUserProfile />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}


// =======================
// ROUTER DECIDER
// =======================
function AppRouter() {
  const { loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  const publicRoutes = [
    '/',
    '/home',
    '/about',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/courses',
    '/clans',
    '/competitions',
    '/clans-competitions', 
    '/community',
  ];

  const isPublic = publicRoutes.some(path =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  return isPublic ? <PublicLayout /> : <PrivateLayout />;
}


// =======================
// APP ROOT
// =======================
export default function App() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <AppRouter />
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}