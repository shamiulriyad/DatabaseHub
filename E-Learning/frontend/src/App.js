import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { NotificationProvider } from './context/NotificationContext';
import PublicNavbar from './components/PublicNavbar';
import PrivateNavbar from './components/PrivateNavbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home/Home';
import LandingPage from './pages/Home/LandingPage';
import About from './pages/Home/About';
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

//user Profile Pages
import UserProfile from './pages/Profile/UserProfile';
import PublicUserProfile from './pages/Profile/PublicUserProfile';
import EditProfile from './pages/Profile/EditProfile';
import ChangePassword from './pages/Profile/ChangePassword';
import MyEnrollments from './pages/Profile/MyEnrollments';
import Certificates from './pages/Profile/Certificates';
import MyAssignments from './pages/Profile/MyAssignments';

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

import NotFound from './pages/NotFound/NotFound';

import './App.css';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Public Layout - Landing, Auth pages (no sidebar, no authenticated nav)
function PublicLayout() {
  return (
    <div className="app">
      <PublicNavbar />
      <div className="app-container">
        <main className="main-content">
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/clans" element={<ClanList />} />
            <Route path="/clans/:clanId" element={<ClanDetail />} />
            <Route path="/clans/:clanId/members" element={<ClanMembers />} />
            <Route path="/profile/:userId" element={<PublicUserProfile />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

// Private Layout - Dashboard, protected pages (with sidebar and authenticated nav)
function PrivateLayout() {
  const location = useLocation();
  
  // Routes where sidebar should NOT be shown (some private pages)
  const noSidebarRoutes = [];
  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div className="app">
      <PrivateNavbar />
      <div className="app-container">
        {showSidebar && <Sidebar />}
        <main className="main-content">
          <Routes>
            {/* ===== PROTECTED ROUTES - User Dashboard & Profile ===== */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/profile/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/profile/enrollments" element={<ProtectedRoute requiredStudent={true}><MyEnrollments /></ProtectedRoute>} />
            <Route path="/profile/certificates" element={<ProtectedRoute requiredStudent={true}><Certificates /></ProtectedRoute>} />
            <Route path="/profile/assignments" element={<ProtectedRoute requiredStudent={true}><MyAssignments /></ProtectedRoute>} />

            {/* ===== PROTECTED ROUTES - Teacher Dashboard ===== */}
            <Route path="/teacher" element={<ProtectedRoute requiredTeacher={true}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/create-course" element={<ProtectedRoute requiredTeacher={true}><CreateCourse /></ProtectedRoute>} />
            <Route path="/teacher/manage-courses" element={<ProtectedRoute requiredTeacher={true}><ManageCourses /></ProtectedRoute>} />
            <Route path="/teacher/course/:courseId/submissions" element={<ProtectedRoute requiredTeacher={true}><StudentSubmissions /></ProtectedRoute>} />
            <Route path="/teacher/submissions" element={<ProtectedRoute requiredTeacher={true}><StudentSubmissions /></ProtectedRoute>} />
            <Route path="/teacher/reviews" element={<ProtectedRoute requiredTeacher={true}><TeacherReviews /></ProtectedRoute>} />

            {/* ===== PROTECTED ROUTES - Admin Dashboard ===== */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredAdmin={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/teachers" element={<ProtectedRoute requiredAdmin={true}><AdminPanel /></ProtectedRoute>} />
            <Route path="/admin/manage-teachers" element={<ProtectedRoute requiredAdmin={true}><ManageTeachers /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

// Main router that decides which layout to use
function AppRouter() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Public routes that use PublicLayout
  const publicRoutes = ['/', '/home', '/about', '/login', '/register', '/forgot-password', '/reset-password', '/courses', '/clans'];
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

  return isPublicRoute ? <PublicLayout /> : <PrivateLayout />;
}

function App() {
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

export default App;
