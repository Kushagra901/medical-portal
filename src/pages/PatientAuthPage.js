import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLogin from '../components/Auth/PatientLogin';
import PatientSignup from '../components/Auth/PatientSignup';
import './PatientAuthPage.css';

const PatientAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="patient-auth-page">
      <div className="auth-container-modern patient-container">
        {/* Left Side - Branding */}
        <div className="auth-left-modern patient-left">
          <div className="auth-brand-modern">
            <div className="brand-icon-wrapper patient-icon">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h1>MediCare</h1>
            <p>Patient Portal</p>
          </div>

          <div className="auth-features-modern">
            <div className="feature-item-modern">
              <div className="feature-icon-modern patient-feature-icon">
                <i className="fas fa-file-medical"></i>
              </div>
              <div className="feature-text-modern">
                <h3>Medical Records</h3>
                <p>Access your complete health history</p>
              </div>
            </div>

            <div className="feature-item-modern">
              <div className="feature-icon-modern patient-feature-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="feature-text-modern">
                <h3>Appointments</h3>
                <p>Schedule and manage appointments</p>
              </div>
            </div>

            <div className="feature-item-modern">
              <div className="feature-icon-modern patient-feature-icon">
                <i className="fas fa-prescription-bottle"></i>
              </div>
              <div className="feature-text-modern">
                <h3>Prescriptions</h3>
                <p>View your current medications</p>
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
            <PatientLogin onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <PatientSignup onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientAuthPage;