import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './services/auth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DoctorAuthPage from './pages/DoctorAuthPage';
import PatientAuthPage from './pages/PatientAuthPage';
import DashboardPage from './pages/DoctorDashboardPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import PrivateRoute from './components/Auth/PrivateRoute';
import Chatbot from './components/Chatbot/Chatbot';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/doctor/auth" element={<DoctorAuthPage />} />
          <Route path="/patient/auth" element={<PatientAuthPage />} />
          
          {/* Original Dashboard (for backward compatibility) */}
          <Route path="/dashboard/*" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          
          {/* Protected Routes - Doctor */}
          <Route path="/doctor/dashboard/*" element={
            <PrivateRoute role="doctor">
              <DoctorDashboardPage />
            </PrivateRoute>
          } />
          
          {/* Protected Routes - Patient */}
          <Route path="/patient/dashboard/*" element={
            <PrivateRoute role="patient">
              <PatientDashboardPage />
            </PrivateRoute>
          } />
          
          {/* Fallback - Redirect to landing page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {/* Chatbot - Only show on authenticated pages */}
        <Routes>
          <Route path="/dashboard/*" element={
            <PrivateRoute>
              <Chatbot />
            </PrivateRoute>
          } />
          <Route path="/doctor/dashboard/*" element={
            <PrivateRoute role="doctor">
              <Chatbot />
            </PrivateRoute>
          } />
          <Route path="/patient/dashboard/*" element={
            <PrivateRoute role="patient">
              <Chatbot />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;