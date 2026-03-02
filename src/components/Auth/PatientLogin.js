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
      const user = await patientLogin(credentials.email, credentials.password);
      localStorage.setItem('patientUser', JSON.stringify(user));
      navigate('/patient/dashboard');
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-login-container professional">
      <div className="login-header">
        <div className="login-icon">
          <i className="fas fa-user-injured"></i>
        </div>
        <h2>Patient Login</h2>
        <p className="time-display">{new Date().toLocaleString('en-US', { 
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}</p>
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

        {/* Removed Demo Login Section */}

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

        <div className="signup-section">
          <p>New to MediCare?</p>
          <button type="button" className="signup-link" onClick={onSwitchToSignup}>
            Create Patient Account <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </form>

      <div className="login-footer">
        <p>
          <i className="fas fa-shield-alt"></i>
          Secure & Confidential
        </p>
      </div>
    </div>
  );
};

export default PatientLogin;