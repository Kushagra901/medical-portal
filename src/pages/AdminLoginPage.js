import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/adminService';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminLogin(credentials.email, credentials.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-brand">
            <div className="admin-icon-wrapper">
              <i className="fas fa-user-shield"></i>
            </div>
            <h2>Admin Gateway</h2>
            <p>System administration & clinic verification portal</p>
          </div>

          {error && (
            <div className="error-alert">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group-modern">
              <label>
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <div className="input-wrapper-modern">
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="admin@medicare.com"
                  required
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label>
                <i className="fas fa-lock"></i> Password
              </label>
              <div className="input-wrapper-modern">
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="action-button-modern admin-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Authenticating...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Access Console
                </>
              )}
            </button>
          </form>

          <div className="back-to-home">
            <button className="btn-back" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left"></i> Home Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
