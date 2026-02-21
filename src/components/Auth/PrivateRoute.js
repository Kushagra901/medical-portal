import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentDoctor } from '../../services/doctorAuth';
import { getCurrentPatient } from '../../services/patientAuth';
import { useAuth } from '../../services/auth';

const PrivateRoute = ({ children, role }) => {
  // Check both auth systems
  const { user } = useAuth(); // Original auth
  const doctorUser = getCurrentDoctor(); // Doctor auth
  const patientUser = getCurrentPatient(); // Patient auth

  // Role-based protection
  if (role === 'doctor') {
    if (!doctorUser) {
      return <Navigate to="/doctor/auth" />;
    }
    return children;
  }

  if (role === 'patient') {
    if (!patientUser) {
      return <Navigate to="/patient/auth" />;
    }
    return children;
  }

  // Original dashboard protection (no specific role)
  if (!user && !doctorUser && !patientUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;