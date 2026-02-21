import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLogin from '../components/Auth/DoctorLogin';
import DoctorSignup from '../components/Auth/DoctorSignup';
import './DoctorAuthPage.css';

const DoctorAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="doctor-auth-page">
      <div className="auth-container-modern">
        {/* Left Side - Branding */}
        <div className="auth-left-modern">
          <div className="auth-brand-modern">
            <div className="brand-icon-wrapper">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h1>MediCare</h1>
            <p>Doctor Portal</p>
          </div>

          <div className="auth-features-modern">
            <div className="feature-item-modern">
              <div className="feature-icon-modern">
                <i className="fas fa-stethoscope"></i>
              </div>
              <div className="feature-text-modern">
                <h3>Patient Management</h3>
                <p>Comprehensive patient records at your fingertips</p>
              </div>
            </div>

            <div className="feature-item-modern">
              <div className="feature-icon-modern">
                <i className="fas fa-prescription"></i>
              </div>
              <div className="feature-text-modern">
                <h3>E-Prescriptions</h3>
                <p>Generate and manage prescriptions digitally</p>
              </div>
            </div>

            <div className="feature-item-modern">
              <div className="feature-icon-modern">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="feature-text-modern">
                <h3>Analytics</h3>
                <p>Track your practice performance</p>
              </div>
            </div>
          </div>

          <button className="back-button-modern" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </button>

          <div className="auth-bg-pattern"></div>
        </div>

        {/* Right Side - Forms */}
        <div className="auth-right-modern">
          {isLogin ? (
            <DoctorLogin onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <DoctorSignup onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAuthPage;