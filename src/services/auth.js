import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCurrentDoctor, doctorLogin as docLogin } from './doctorAuth';
import { getCurrentPatient, patientLogin as patLogin } from './patientAuth';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check all possible auth sources
    const originalUser = localStorage.getItem('user');
    const doctorUser = getCurrentDoctor();
    const patientUser = getCurrentPatient();
    
    if (originalUser) {
      setUser(JSON.parse(originalUser));
    } else if (doctorUser) {
      setUser(doctorUser);
    } else if (patientUser) {
      setUser(patientUser);
    }
    
    setLoading(false);
  }, []);

  // Original doctors data (for backward compatibility)
  const originalDoctors = [
    { id: 1, username: 'dr.smith@medicare.com', password: 'doctor123', name: 'Dr. John Smith', specialization: 'General Physician' },
    { id: 2, username: 'dr.jones@medicare.com', password: 'doctor123', name: 'Dr. Sarah Jones', specialization: 'Cardiologist' },
  ];

  const login = async (username, password) => {
    // Try original auth first
    const originalDoctor = originalDoctors.find(doc => 
      doc.username === username && doc.password === password
    );

    if (originalDoctor) {
      const userData = {
        id: originalDoctor.id,
        name: originalDoctor.name,
        email: originalDoctor.username,
        specialization: originalDoctor.specialization,
        role: 'doctor'
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success(`Welcome back, ${originalDoctor.name}!`);
      return true;
    }

    // Try new doctor auth
    try {
      const doctorData = await docLogin(username, password);
      if (doctorData) {
        setUser({ ...doctorData, role: 'doctor' });
        return true;
      }
    } catch (error) {
      // Try patient auth
      try {
        const patientData = await patLogin(username, password);
        if (patientData) {
          setUser({ ...patientData, role: 'patient' });
          return true;
        }
      } catch (err) {
        toast.error('Invalid credentials. Please try again.');
        return false;
      }
    }
  };

  const logout = () => {
    // Clear all auth storages
    localStorage.removeItem('user');
    localStorage.removeItem('doctorUser');
    localStorage.removeItem('patientUser');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};