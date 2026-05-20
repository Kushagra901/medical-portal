import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredDoctor } from '../../services/doctorAuth';
import { getStoredPatient } from '../../services/patientAuth';
import { getStoredAdmin } from '../../services/adminService';

const PrivateRoute = ({ children, role }) => {
  let user = null;
  if (role === 'admin') {
    user = getStoredAdmin();
  } else if (role === 'doctor') {
    user = getStoredDoctor();
  } else {
    user = getStoredPatient();
  }

  if (!user) {
    return <Navigate to={role === 'admin' ? '/admin/login' : `/${role}/auth`} />;
  }
  return children;
};

export default PrivateRoute;