import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ user }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard/overview', icon: 'fas fa-home', label: 'Dashboard', badge: null },
    { path: '/dashboard/medicine-db', icon: 'fas fa-pills', label: 'Medicine Database', badge: '156' },
    { path: '/dashboard/patient-db', icon: 'fas fa-user-injured', label: 'Patient Database', badge: '1,247' },
    { path: '/dashboard/prescription', icon: 'fas fa-prescription', label: 'Prescription Generator', badge: 'New' },
    { path: '/dashboard/appointments', icon: 'fas fa-calendar-check', label: 'Appointments', badge: '18' },
    { path: '/dashboard/reports', icon: 'fas fa-chart-bar', label: 'Reports & Analytics', badge: null },
    { path: '/dashboard/settings', icon: 'fas fa-cog', label: 'Settings', badge: null },
  ];

  const quickActions = [
    { icon: 'fas fa-user-plus', label: 'New Patient', color: '#4CAF50' },
    { icon: 'fas fa-prescription', label: 'E-Prescription', color: '#2196F3' },
    { icon: 'fas fa-file-medical', label: 'Medical Report', color: '#FF9800' },
    { icon: 'fas fa-calendar-plus', label: 'Schedule', color: '#9C27B0' },
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo" onClick={() => navigate('/dashboard/overview')}>
          <i className="fas fa-heartbeat"></i>
          {!collapsed && (
            <div className="logo-text">
              <h3>MediCare</h3>
              <p>Doctor Portal</p>
            </div>
          )}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>

      {user && (
        <div className="doctor-profile">
          <div className="profile-avatar">
            <i className="fas fa-user-md"></i>
          </div>
          {!collapsed && (
            <div className="profile-info">
              <h4>{user.name}</h4>
              <p>{user.specialization}</p>
              <span className="license-badge">
                <i className="fas fa-id-card"></i> {user.license}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => 
              `menu-item ${isActive ? 'active' : ''}`
            }
          >
            <i className={item.icon}></i>
            {!collapsed && (
              <>
                <span>{item.label}</span>
                {item.badge && <span className="menu-badge">{item.badge}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {!collapsed && (
        <>
          <div className="quick-actions">
            <h4>Quick Actions</h4>
            <div className="action-buttons">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="action-btn"
                  style={{ '--action-color': action.color }}
                  onClick={() => navigate('/dashboard/prescription')}
                >
                  <i className={action.icon}></i>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="system-status">
              <div className="status-indicator online"></div>
              <span>System Online</span>
            </div>
            <div className="last-backup">
              <i className="fas fa-database"></i>
              <span>Last backup: Today 02:00 AM</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;