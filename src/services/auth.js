import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('doctor_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Sample doctors data (in real app, this would come from backend)
  const doctors = [
    { id: 1, username: 'dr.smith@medicare.com', password: 'doctor123', name: 'Dr. John Smith', specialization: 'General Physician', license: 'MED123456' },
    { id: 2, username: 'dr.jones@medicare.com', password: 'doctor123', name: 'Dr. Sarah Jones', specialization: 'Cardiologist', license: 'MED789012' },
    { id: 3, username: 'dr.wilson@medicare.com', password: 'doctor123', name: 'Dr. Michael Wilson', specialization: 'Pediatrician', license: 'MED345678' }
  ];

  const login = (username, password) => {
    // Find doctor with matching credentials
    const doctor = doctors.find(doc => 
      doc.username === username && doc.password === password
    );

    if (doctor) {
      const userData = {
        id: doctor.id,
        name: doctor.name,
        email: doctor.username,
        specialization: doctor.specialization,
        license: doctor.license
      };
      
      setUser(userData);
      localStorage.setItem('doctor_user', JSON.stringify(userData));
      toast.success(`Welcome back, ${doctor.name}!`);
      return true;
    } else {
      toast.error('Invalid credentials. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('doctor_user');
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