import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { doctorLogin as docLogin, getStoredDoctor } from './doctorAuth';
import { patientLogin as patLogin, getStoredPatient } from './patientAuth';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check all possible auth sources
    const doctorUser = getStoredDoctor();
    const patientUser = getStoredPatient();
    
    if (doctorUser) {
      setUser(doctorUser);
    } else if (patientUser) {
      setUser(patientUser);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Try doctor login first
    try {
      const userData = await docLogin(email, password);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      return true;
    } catch (error) {
      // Try patient login
      try {
        const userData = await patLogin(email, password);
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        return true;
      } catch (err) {
        toast.error('Invalid credentials');
        return false;
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
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