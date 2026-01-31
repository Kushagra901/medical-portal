import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const success = login(credentials.username, credentials.password);
      if (success) {
        navigate('/dashboard');
      }
      setLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  // Demo credentials for quick login
  const handleDemoLogin = (role) => {
    let demoCredentials;
    switch(role) {
      case 'general':
        demoCredentials = { username: 'dr.smith@medicare.com', password: 'doctor123' };
        break;
      case 'cardio':
        demoCredentials = { username: 'dr.jones@medicare.com', password: 'doctor123' };
        break;
      case 'pediatric':
        demoCredentials = { username: 'dr.wilson@medicare.com', password: 'doctor123' };
        break;
      default:
        demoCredentials = { username: 'dr.smith@medicare.com', password: 'doctor123' };
    }
    
    setCredentials(demoCredentials);
  };

  return (
    <div className="login-form fade-in">
      <div className="login-header">
        <h2><i className="fas fa-user-md"></i> Doctor Login</h2>
        <p>Access your medical management portal</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">
            <i className="fas fa-envelope"></i> Email Address
          </label>
          <input
            type="email"
            id="username"
            name="username"
            className="form-control"
            placeholder="Enter your email"
            value={credentials.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            <i className="fas fa-lock"></i> Password
          </label>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
            </button>
          </div>
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <a href="#" className="forgot-password">
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          className="btn btn-primary login-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Signing In...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i> Sign In
            </>
          )}
        </button>

        <div className="demo-logins">
          <p className="demo-title">Quick Demo Access:</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn general"
              onClick={() => handleDemoLogin('general')}
            >
              <i className="fas fa-user-md"></i> General Physician
            </button>
            <button
              type="button"
              className="demo-btn cardio"
              onClick={() => handleDemoLogin('cardio')}
            >
              <i className="fas fa-heartbeat"></i> Cardiologist
            </button>
            <button
              type="button"
              className="demo-btn pediatric"
              onClick={() => handleDemoLogin('pediatric')}
            >
              <i className="fas fa-baby"></i> Pediatrician
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>
            <i className="fas fa-shield-alt"></i> This portal uses 256-bit SSL encryption
          </p>
          <p className="copyright">
            &copy; 2024 MediCare Hospital System. For authorized medical personnel only.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;