import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'New Appointment', message: 'John Doe scheduled for 2:30 PM', time: '10 min ago', read: false },
    { id: 2, title: 'Medicine Alert', message: 'Amoxicillin stock is running low', time: '1 hour ago', read: false },
    { id: 3, title: 'System Update', message: 'New features available in v2.1', time: '2 hours ago', read: true },
    { id: 4, title: 'Lab Results', message: 'Patient P1001 lab results are ready', time: '1 day ago', read: true },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="breadcrumb">
          <i className="fas fa-home"></i>
          <span>Dashboard</span>
          <i className="fas fa-chevron-right"></i>
          <span>Overview</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <button 
            className="header-btn search-btn"
            onClick={() => navigate('/dashboard/medicine-db')}
          >
            <i className="fas fa-search"></i>
          </button>

          <div className="notifications">
            <button 
              className="header-btn notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h4>Notifications</h4>
                  <button className="mark-read">Mark all as read</button>
                </div>
                <div className="notifications-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <div className="notification-icon">
                        <i className="fas fa-bell"></i>
                      </div>
                      <div className="notification-content">
                        <h5>{notification.title}</h5>
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="notifications-footer">
                  <button onClick={() => navigate('/dashboard/settings')}>
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="user-menu">
            <button 
              className="user-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.specialization}</span>
              </div>
              <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
            </button>

            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-user">
                    <div className="dropdown-avatar">
                      <i className="fas fa-user-md"></i>
                    </div>
                    <div>
                      <h4>{user?.name}</h4>
                      <p>{user?.email}</p>
                      <span className="license">{user?.license}</span>
                    </div>
                  </div>
                </div>
                <div className="dropdown-menu">
                  <button onClick={() => navigate('/dashboard/settings')}>
                    <i className="fas fa-user-cog"></i> Profile Settings
                  </button>
                  <button onClick={() => navigate('/dashboard/settings')}>
                    <i className="fas fa-cog"></i> Account Settings
                  </button>
                  <button onClick={() => navigate('/dashboard/settings')}>
                    <i className="fas fa-question-circle"></i> Help & Support
                  </button>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="logout-btn">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;