import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorLogin } from '../../services/doctorAuth';
import './DoctorLogin.css';

const DoctorLogin = ({ onSwitchToSignup }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await doctorLogin(credentials.email, credentials.password);
      
      if (rememberMe) {
        localStorage.setItem('rememberDoctor', 'true');
      }
      
      navigate('/doctor/dashboard');
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demos = {
      general: { email: 'dr.smith@medicare.com', password: 'doctor123' },
      cardio: { email: 'dr.jones@medicare.com', password: 'doctor123' }
    };
    
    setCredentials(demos[role] || demos.general);
  };

  const handleForgotPassword = () => {
    alert('Password reset functionality will be implemented soon.');
  };

  return (
    <div className="doctor-login-container">
      <div className="login-header">
        <div className="login-icon">
          <i className="fas fa-user-md"></i>
        </div>
        <h2>Doctor Login</h2>
        <p>Access your medical dashboard</p>
      </div>

      {error && (
        <div className="error-alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>
            <i className="fas fa-envelope"></i> Email Address
          </label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="doctor@hospital.com"
            required
            className={error ? 'error' : ''}
          />
        </div>

        <div className="form-group">
          <label>
            <i className="fas fa-lock"></i> Password
          </label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className={error ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
            </button>
          </div>
        </div>

        <div className="form-row">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="checkmark"></span>
            <span className="checkbox-label">Remember me</span>
          </label>
          <button 
            type="button"
            className="forgot-link" 
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Signing in...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i> Sign In
            </>
          )}
        </button>

        <div className="demo-section">
          <div className="demo-title">Quick Demo Access</div>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn general"
              onClick={() => handleDemoLogin('general')}
            >
              <i className="fas fa-stethoscope"></i>
              General Physician
            </button>
            <button
              type="button"
              className="demo-btn cardio"
              onClick={() => handleDemoLogin('cardio')}
            >
              <i className="fas fa-heartbeat"></i>
              Cardiologist
            </button>
          </div>
        </div>

        <div className="signup-section">
          <p>New to MediCare?</p>
          <button type="button" className="signup-link" onClick={onSwitchToSignup}>
            Create Doctor Account <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </form>

      <div className="login-footer">
        <p>
          <i className="fas fa-shield-alt"></i>
          Secured by 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
};

export default DoctorLogin;