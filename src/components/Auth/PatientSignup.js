import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientSignup } from '../../services/patientAuth';
import './PatientSignup.css';

const PatientSignup = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Medical Information
    bloodGroup: '',
    height: '',
    weight: '',
    allergies: '',
    currentMedications: '',
    emergencyContact: '',
    address: '',
    
    // Insurance Information (Optional)
    insuranceProvider: '',
    insuranceId: '',
    
    // Profile Image
    profileImage: null
  });

  const [errors, setErrors] = useState({});

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          profileImage: 'File size must be less than 5MB'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profileImage: reader.result
        });
        setErrors({
          ...errors,
          profileImage: null
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }
    
    if (!formData.emergencyContact) {
      newErrors.emergencyContact = 'Emergency contact is required';
    }
    
    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 2 && !validateStep2()) {
      return;
    }

    if (step === 2) {
      setLoading(true);
      
      try {
        await patientSignup(formData);
        alert('Registration successful! Please login.');
        onSwitchToLogin();
      } catch (error) {
        console.error('Signup error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="patient-signup-container">
      <div className="signup-header">
        <h2>Create Patient Account</h2>
        <p>Join MediCare to manage your health records</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-indicator">
            {step > 1 ? <i className="fas fa-check"></i> : '1'}
          </div>
          <span className="step-label">Personal Info</span>
        </div>
        <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-indicator">2</div>
          <span className="step-label">Medical Info</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="form-step fade-in">
            <div className="step-header">
              <i className="fas fa-user-circle"></i>
              <h3>Personal Information</h3>
            </div>
            
            <div className="form-grid">
              {/* Full Name - Full Width */}
              <div className="form-group full-width">
                <label>
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.name}</span>}
              </div>

              {/* Email - Full Width */}
              <div className="form-group full-width">
                <label>
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@example.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.email}</span>}
              </div>

              {/* Password and Confirm Password - Side by Side */}
              <div className="form-group half-width">
                <label>
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.password}</span>}
              </div>

              <div className="form-group half-width">
                <label>
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.confirmPassword}</span>}
              </div>

              {/* Phone, DOB, Gender - Three Columns */}
              <div className="form-group third-width">
                <label>
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234-567-8901"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.phone}</span>}
              </div>

              <div className="form-group third-width">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group third-width">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  {genders.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>

              {/* Profile Photo */}
              <div className="form-group full-width">
                <label>Profile Photo</label>
                <div className="profile-upload-area">
                  <div className="profile-preview">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" className="preview-image" />
                    ) : (
                      <div className="preview-placeholder">
                        <i className="fas fa-camera"></i>
                      </div>
                    )}
                  </div>
                  <div className="upload-details">
                    <label className="upload-btn patient-upload-btn">
                      <i className="fas fa-upload"></i>
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input"
                      />
                    </label>
                    <p className="upload-hint">JPG, PNG or GIF (Max 5MB)</p>
                    {errors.profileImage && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.profileImage}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Medical Information */}
        {step === 2 && (
          <div className="form-step fade-in">
            <div className="step-header">
              <i className="fas fa-notes-medical"></i>
              <h3>Medical Information</h3>
            </div>

            <div className="form-grid">
              {/* Blood Group, Height, Weight - Three Columns */}
              <div className="form-group third-width">
                <label>
                  Blood Group <span className="required">*</span>
                </label>
                <select 
                  name="bloodGroup" 
                  value={formData.bloodGroup} 
                  onChange={handleChange}
                  className={errors.bloodGroup ? 'error' : ''}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                {errors.bloodGroup && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.bloodGroup}</span>}
              </div>

              <div className="form-group third-width">
                <label>Height (cm)</label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="e.g., 175"
                />
              </div>

              <div className="form-group third-width">
                <label>Weight (kg)</label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g., 70"
                />
              </div>

              {/* Known Allergies - Full width */}
              <div className="form-group full-width">
                <label>Known Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="List any allergies (e.g., Penicillin, Peanuts)"
                  rows="3"
                />
                <span className="field-hint">Separate multiple allergies with commas</span>
              </div>

              {/* Current Medications - Full width */}
              <div className="form-group full-width">
                <label>Current Medications</label>
                <textarea
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  placeholder="List current medications with dosage"
                  rows="3"
                />
                <span className="field-hint">Include dosage and frequency if known</span>
              </div>

              {/* Emergency Contact - Full width */}
              <div className="form-group full-width">
                <label>
                  Emergency Contact <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Name: Phone Number (e.g., John Doe: +1 234-567-8901)"
                  className={errors.emergencyContact ? 'error' : ''}
                />
                {errors.emergencyContact && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.emergencyContact}</span>}
              </div>

              {/* Address - Full width */}
              <div className="form-group full-width">
                <label>
                  Address <span className="required">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your full address"
                  rows="3"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.address}</span>}
              </div>
            </div>

            {/* Insurance Information Section */}
            <div className="insurance-section">
              <div className="insurance-header">
                <i className="fas fa-shield-alt"></i>
                <h4>Insurance Information (Optional)</h4>
              </div>
              
              <div className="form-grid">
                <div className="form-group half-width">
                  <label>Insurance Provider</label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    placeholder="e.g., Blue Cross"
                  />
                </div>

                <div className="form-group half-width">
                  <label>Insurance ID</label>
                  <input
                    type="text"
                    name="insuranceId"
                    value={formData.insuranceId}
                    onChange={handleChange}
                    placeholder="Insurance policy number"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          {step > 1 && (
            <button type="button" className="btn btn-outline patient-outline-btn" onClick={handlePrevious}>
              <i className="fas fa-arrow-left"></i>
              Previous
            </button>
          )}
          
          {step < 2 ? (
            <button type="button" className="btn btn-primary patient-primary-btn next-btn" onClick={handleNext}>
              Next Step
              <i className="fas fa-arrow-right"></i>
            </button>
          ) : (
            <button type="submit" className="btn btn-success patient-success-btn submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Registering...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i>
                  Complete Registration
                </>
              )}
            </button>
          )}
        </div>
      </form>

      <div className="signup-footer">
        <p>Already have an account?</p>
        <button type="button" className="login-link patient-login-link" onClick={onSwitchToLogin}>
          Sign In <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default PatientSignup;