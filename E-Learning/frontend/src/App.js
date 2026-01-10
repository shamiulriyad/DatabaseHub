import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
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

//user Profile Pages
import UserProfile from './pages/Profile/UserProfile';
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

function App() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <div className="app">
                <Navbar />
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/home" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/courses" element={<CourseList />} />
                      
                      {/* Protected Routes */}
                      <Route 
                        path="/dashboard" 
                        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/profile" 
                        element={<ProtectedRoute><UserProfile /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/profile/edit" 
                        element={<ProtectedRoute><EditProfile /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/profile/change-password" 
                        element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/profile/enrollments" 
                        element={<ProtectedRoute><MyEnrollments /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/profile/certificates" 
                        element={<ProtectedRoute><Certificates /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/profile/assignments" 
                        element={<ProtectedRoute><MyAssignments /></ProtectedRoute>} 
                      />

                      {/* Teacher Routes */}
                      <Route 
                        path="/teacher" 
                        element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/teacher/create-course" 
                        element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/teacher/manage-courses" 
                        element={<ProtectedRoute><ManageCourses /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/teacher/course/:courseId/submissions" 
                        element={<ProtectedRoute><StudentSubmissions /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/teacher/submissions" 
                        element={<ProtectedRoute><StudentSubmissions /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/teacher/reviews" 
                        element={<ProtectedRoute><TeacherReviews /></ProtectedRoute>} 
                      />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
                <Footer />
              </div>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
