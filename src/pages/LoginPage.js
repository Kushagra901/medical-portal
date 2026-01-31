import React from 'react';
import Login from '../components/Auth/Login';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <i className="fas fa-heartbeat"></i>
            <h1>MediCare</h1>
            <p>Doctor Portal</p>
          </div>
          <div className="login-features">
            <div className="feature">
              <i className="fas fa-shield-alt"></i>
              <h3>Secure Access</h3>
              <p>HIPAA compliant secure login system</p>
            </div>
            <div className="feature">
              <i className="fas fa-clinic-medical"></i>
              <h3>Patient Management</h3>
              <p>Comprehensive patient records system</p>
            </div>
            <div className="feature">
              <i className="fas fa-prescription"></i>
              <h3>E-Prescriptions</h3>
              <p>Digital prescription generation</p>
            </div>
          </div>
        </div>
        <div className="login-right">
          <Login />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;