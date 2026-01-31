import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';

const PrivateRoute = ({ children, element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // For Chatbot (it's not a route, just a component)
  if (element) {
    return user ? children : null;
  }

  // For regular routes
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;