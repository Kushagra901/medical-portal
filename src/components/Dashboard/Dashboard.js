import React from 'react';
import { useAuth } from '../../services/auth';
import Sidebar from './Sidebar';
import Header from '../Common/Header';
import './Dashboard.css';

const Dashboard = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <Sidebar user={user} />
      
      <div className="dashboard-main">
        <Header user={user} onLogout={logout} />
        
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;