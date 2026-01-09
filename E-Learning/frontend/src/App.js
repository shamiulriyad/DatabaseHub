import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import CourseList from './pages/Courses/CourseList';
import NotFound from './pages/NotFound/NotFound';

import './App.css';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="app">
            <Navbar />
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/courses" element={<CourseList />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/dashboard" 
                    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
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
  );
}

export default App;
