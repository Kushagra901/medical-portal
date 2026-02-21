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
      await doctorLogin(credentials.email, credentials.password);
      
      if (rememberMe) {
        localStorage.setItem('rememberDoctor', 'true');
      }
      
      navigate('/doctor/dashboard');
    } catch (error) {
      console.error('Login error:', error);
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

  return (
    <div className="doctor-login-container">
      <div className="login-header">
        <div className="login-icon">
          <i className="fas fa-user-md"></i>
        </div>
        <h2>Doctor Login</h2>
        <p>Access your medical dashboard</p>
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
            placeholder="doctor@hospital.com"
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

        {/* Remember me and Forgot Password row */}
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
    </div>
  );
};

export default DoctorLogin;