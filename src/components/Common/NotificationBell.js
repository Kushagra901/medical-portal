import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getNotifications, markNotificationsAsRead } from '../../services/notificationService';
import './NotificationBell.css';

const NotificationBell = ({ userId, userType }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial notifications
    fetchNotifications();

    // 2. Connect to Socket.io
    const socket = io(process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000');
    
    socket.on('connect', () => {
      socket.emit('register', userId);
    });

    socket.on('notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      // Play brief subtle audio cue if supported
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/911/911-84.wav');
        audio.volume = 0.2;
        audio.play();
      } catch (e) {}
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Click outside close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      if (data) setNotifications(data);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button className="bell-icon-btn" onClick={() => setIsOpen(!isOpen)}>
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="btn-mark-read" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="dropdown-body">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <i className="fas fa-bell-slash"></i>
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                >
                  <div className="item-icon">
                    {notif.type === 'appointment' && <i className="fas fa-calendar-check text-blue"></i>}
                    {notif.type === 'prescription' && <i className="fas fa-prescription text-green"></i>}
                    {notif.type === 'lab_report' && <i className="fas fa-flask text-purple"></i>}
                    {!notif.type && <i className="fas fa-info-circle text-orange"></i>}
                  </div>
                  <div className="item-content">
                    <p className="item-text">{notif.message}</p>
                    <span className="item-time">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
