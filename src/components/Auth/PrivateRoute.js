import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredDoctor } from '../../services/doctorAuth';
import { getStoredPatient } from '../../services/patientAuth';

const PrivateRoute = ({ children, role }) => {
  const user = role === 'doctor' ? getStoredDoctor() : getStoredPatient();

  if (!user) {
    return <Navigate to={`/${role}/auth`} />;
  }
  return children;
};

export default PrivateRoute;