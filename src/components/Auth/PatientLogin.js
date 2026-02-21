import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientLogin } from '../../services/patientAuth';
import './PatientLogin.css';

const PatientLogin = ({ onSwitchToSignup }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await patientLogin(credentials.email, credentials.password);
      
      if (rememberMe) {
        localStorage.setItem('rememberPatient', 'true');
      }
      
      navigate('/patient/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setCredentials({
      email: 'john.doe@example.com',
      password: 'patient123'
    });
  };

  return (
    <div className="patient-login-container">
      <div className="login-header">
        <div className="login-icon">
          <i className="fas fa-user-injured"></i>
        </div>
        <h2>Patient Login</h2>
        <p>Access your health records</p>
      </div>

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
            placeholder="patient@example.com"
            required
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

        {/* FIXED: Remember me and Forgot Password row - properly aligned */}
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
          <a href="#" className="forgot-link">Forgot Password?</a>
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
          <button
            type="button"
            className="demo-btn"
            onClick={handleDemoLogin}
          >
            <i className="fas fa-flask"></i>
            Try Demo Account
          </button>
        </div>

        {/* FIXED: New to MediCare section - properly aligned */}
        <div className="signup-section">
          <p className="signup-text">New to MediCare?</p>
          <button type="button" className="signup-link" onClick={onSwitchToSignup}>
            Create Patient Account <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        {/* FIXED: Security footer with proper alignment */}
        <div className="security-footer">
          <p>
            <i className="fas fa-shield-alt"></i>
            Secure & Confidential
          </p>
        </div>
      </form>
    </div>
  );
};

export default PatientLogin;