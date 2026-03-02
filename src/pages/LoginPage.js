import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';
import './LoginPage.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
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

    setTimeout(() => {
      const success = login(credentials.email, credentials.password);
      if (success) {
        navigate('/dashboard');
      }
      setLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    setCredentials({
      email: 'dr.smith@medicare.com',
      password: 'doctor123'
    });
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-background">
        <div className="login-shape"></div>
        <div className="login-shape-2"></div>
      </div>
      
      <div className="login-container">
        <div className="login-card-modern">
          <div className="login-brand-section">
            <div className="brand-logo">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form-modern">
            <div className="form-group-modern">
              <label>
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <div className="input-wrapper-modern">
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="doctor@hospital.com"
                  required
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label>
                <i className="fas fa-lock"></i>
                Password
              </label>
              <div className="input-wrapper-modern password-field">
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
                  className="password-toggle-modern"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

            <div className="form-options-modern">
              <label className="checkbox-modern">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="#" className="forgot-link-modern">Forgot Password?</a>
            </div>

            <button type="submit" className="login-button-modern" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </button>

            <div className="demo-login-modern">
              <div className="divider">
                <span>Quick Demo</span>
              </div>
              <button
                type="button"
                className="demo-button-modern"
                onClick={handleDemoLogin}
              >
                <i className="fas fa-flask"></i>
                Try Demo Account
              </button>
            </div>

            <div className="signup-prompt-modern">
              <p>Don't have an account?</p>
              <button 
                type="button" 
                className="signup-link-modern"
                onClick={() => navigate('/doctor/auth')}
              >
                Create Account <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </form>

          <div className="login-footer-modern">
            <p>
              <i className="fas fa-shield-alt"></i>
              Secured by 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;