import React, { useState } from 'react';
import { doctorSignup } from '../../services/doctorAuth';
import './DoctorSignup.css';

const DoctorSignup = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Professional Information
    specialization: '',
    license: '',
    experience: '',
    qualification: '',
    hospital: '',
    
    // Practice Information
    consultationFee: '',
    availableDays: [],
    availableTime: '',
    address: '',
    bio: '',
    
    // Profile Image
    profileImage: null
  });

  const specializations = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician',
    'Neurologist', 'Psychiatrist', 'Orthopedic', 'Gynecologist',
    'Ophthalmologist', 'ENT Specialist', 'Dentist', 'Other'
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const genders = ['Male', 'Female', 'Other'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (checked) {
        setFormData({
          ...formData,
          [name]: [...formData[name], value]
        });
      } else {
        setFormData({
          ...formData,
          [name]: formData[name].filter(day => day !== value)
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profileImage: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    console.log('Moving to step', step + 1);
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    console.log('Moving back to step', step - 1);
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔵 DOCTOR SUBMIT BUTTON CLICKED - Step:', step);
    console.log('📦 Doctor Form Data:', formData);
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🚀 Calling doctorSignup...');
      const result = await doctorSignup(formData);
      console.log('✅ Doctor signup successful:', result);
      console.log('🔄 Switching to login page...');
      onSwitchToLogin();
    } catch (error) {
      console.error('❌ Doctor signup error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-signup-container">
      <div className="signup-header">
        <h2>Create Doctor Account</h2>
        <p>Join MediCare to start managing your practice</p>
      </div>

      {error && (
        <div className="error-alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-indicator">1</div>
          <span className="step-label">Personal Info</span>
        </div>
        <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-indicator">2</div>
          <span className="step-label">Professional</span>
        </div>
        <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-indicator">3</div>
          <span className="step-label">Practice</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="form-step fade-in">
            <div className="step-header">
              <i className="fas fa-user-md"></i>
              <h3>Personal Information</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group full-width">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group half-width">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                />
              </div>

              <div className="form-group half-width">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                />
              </div>

              <div className="form-group third-width">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
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
                    <label className="upload-btn">
                      <i className="fas fa-upload"></i>
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions for Step 1 */}
            <div className="form-actions">
              <button type="button" className="btn btn-primary next-btn" onClick={handleNext}>
                Next Step <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Professional Information */}
        {step === 2 && (
          <div className="form-step fade-in">
            <div className="step-header">
              <i className="fas fa-stethoscope"></i>
              <h3>Professional Information</h3>
            </div>

            <div className="form-grid">
              <div className="form-group half-width">
                <label>Specialization</label>
                <select 
                  name="specialization" 
                  value={formData.specialization} 
                  onChange={handleChange}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="form-group half-width">
                <label>License Number</label>
                <input
                  type="text"
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  placeholder="Enter license number"
                />
              </div>

              <div className="form-group half-width">
                <label>Years of Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 10 years"
                />
              </div>

              <div className="form-group half-width">
                <label>Qualifications</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="e.g., MBBS, MD"
                />
              </div>

              <div className="form-group full-width">
                <label>Current Hospital/Clinic</label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="Enter hospital name"
                />
              </div>

              <div className="form-group full-width">
                <label>Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>
            </div>

            {/* Form Actions for Step 2 */}
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handlePrevious}>
                <i className="fas fa-arrow-left"></i> Previous
              </button>
              <button type="button" className="btn btn-primary next-btn" onClick={handleNext}>
                Next Step <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Practice Information */}
        {step === 3 && (
          <div className="form-step fade-in">
            <div className="step-header">
              <i className="fas fa-clinic-medical"></i>
              <h3>Practice Information</h3>
            </div>

            <div className="form-grid">
              <div className="form-group half-width">
                <label>Consultation Fee ($)</label>
                <input
                  type="text"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  placeholder="e.g., $100"
                />
              </div>

              <div className="form-group half-width">
                <label>Available Time</label>
                <input
                  type="text"
                  name="availableTime"
                  value={formData.availableTime}
                  onChange={handleChange}
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </div>

              <div className="form-group full-width">
                <label>Available Days</label>
                <div className="days-grid">
                  {weekDays.map(day => (
                    <label key={day} className="day-checkbox">
                      <input
                        type="checkbox"
                        name="availableDays"
                        value={day}
                        checked={formData.availableDays.includes(day)}
                        onChange={handleChange}
                      />
                      <span>{day.substring(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Clinic Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your clinic address"
                  rows="3"
                />
              </div>
            </div>

            {/* Form Actions for Step 3 */}
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handlePrevious}>
                <i className="fas fa-arrow-left"></i> Previous
              </button>
              <button type="submit" className="btn btn-success submit-btn" disabled={loading}>
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Registering...</>
                ) : (
                  <><i className="fas fa-check-circle"></i> Complete Registration</>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      <div className="signup-footer">
        <p>Already have an account?</p>
        <button type="button" className="login-link" onClick={onSwitchToLogin}>
          Sign In <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default DoctorSignup;