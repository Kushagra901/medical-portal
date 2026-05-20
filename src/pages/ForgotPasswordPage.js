import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordOtp, resetPassword } from '../services/forgotPasswordService';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Success
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await requestPasswordOtp(email, role);
      setMessage(`We have sent a 6-digit OTP code to ${email}. Please check your inbox.`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPassword(email, otp, newPassword, role);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. The OTP might be incorrect or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-container-modern">
        <div className="forgot-card-modern">
          <div className="brand-logo">
            <i className="fas fa-key"></i>
          </div>
          <h2>Reset Password</h2>
          <p className="subtitle">Securely reset your MediCare portal credentials</p>

          {error && (
            <div className="error-alert animate-bounce-subtle">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="forgot-form">
              <div className="form-group-modern">
                <label>Select User Portal</label>
                <div className="role-selector">
                  <button 
                    type="button" 
                    className={`role-btn ${role === 'patient' ? 'active' : ''}`}
                    onClick={() => setRole('patient')}
                  >
                    <i className="fas fa-user-injured"></i> Patient
                  </button>
                  <button 
                    type="button" 
                    className={`role-btn ${role === 'doctor' ? 'active' : ''}`}
                    onClick={() => setRole('doctor')}
                  >
                    <i className="fas fa-user-md"></i> Doctor
                  </button>
                </div>
              </div>

              <div className="form-group-modern">
                <label>
                  <i className="fas fa-envelope"></i> Email Address
                </label>
                <div className="input-wrapper-modern">
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="action-button-modern" disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                Send OTP
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="forgot-form">
              <p className="info-text">{message}</p>

              <div className="form-group-modern">
                <label>
                  <i className="fas fa-shield-alt"></i> Enter 6-Digit OTP
                </label>
                <div className="input-wrapper-modern">
                  <input
                    type="text"
                    placeholder="Enter OTP code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label>
                  <i className="fas fa-lock"></i> New Password
                </label>
                <div className="input-wrapper-modern">
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label>
                  <i className="fas fa-lock"></i> Confirm New Password
                </label>
                <div className="input-wrapper-modern">
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="action-button-modern" disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                Save Password
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="success-section">
              <div className="success-icon animate-success">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3>Password Reset Success!</h3>
              <p>Your password has been successfully updated. You can now log back into the portal.</p>
              <button 
                type="button" 
                className="action-button-modern"
                onClick={() => navigate(role === 'doctor' ? '/doctor/auth' : '/patient/auth')}
              >
                Go to Login <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          )}

          <div className="back-to-auth">
            <button type="button" className="btn-back" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
