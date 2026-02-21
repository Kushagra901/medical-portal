import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorSignup } from '../../services/doctorAuth';
import './DoctorSignup.css';

const DoctorSignup = ({ onSwitchToLogin }) => {
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

  const [errors, setErrors] = useState({});

  const specializations = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Psychiatrist',
    'Orthopedic',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
    'Dentist',
    'Other'
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
    
    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }
    if (!formData.license) {
      newErrors.license = 'License number is required';
    }
    if (!formData.experience) {
      newErrors.experience = 'Experience is required';
    }
    if (!formData.qualification) {
      newErrors.qualification = 'Qualification is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.consultationFee) {
      newErrors.consultationFee = 'Consultation fee is required';
    }
    if (formData.availableDays.length === 0) {
      newErrors.availableDays = 'Select at least one day';
    }
    if (!formData.availableTime) {
      newErrors.availableTime = 'Available time is required';
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
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    setLoading(true);
    
    try {
      await doctorSignup(formData);
      alert('Registration successful! Please login.');
      onSwitchToLogin();
    } catch (error) {
      console.error('Signup error:', error);
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

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-indicator">
            {step > 1 ? <i className="fas fa-check"></i> : '1'}
          </div>
          <span className="step-label">Personal Info</span>
        </div>
        <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-indicator">
            {step > 2 ? <i className="fas fa-check"></i> : '2'}
          </div>
          <span className="step-label">Professional</span>
        </div>
        <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-indicator">3</div>
          <span className="step-label">Practice</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="form-step fade-in">
            <div className="step-header">
              <i className="fas fa-user-md"></i>
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
                  placeholder="Dr. John Smith"
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
                  placeholder="doctor@hospital.com"
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
                    <p className="upload-hint">JPG, PNG or GIF (Max 5MB)</p>
                    {errors.profileImage && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.profileImage}</span>}
                  </div>
                </div>
              </div>
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
              {/* Specialization and License - Side by Side */}
              <div className="form-group half-width">
                <label>
                  Specialization <span className="required">*</span>
                </label>
                <select 
                  name="specialization" 
                  value={formData.specialization} 
                  onChange={handleChange}
                  className={errors.specialization ? 'error' : ''}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialization && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.specialization}</span>}
              </div>

              <div className="form-group half-width">
                <label>
                  License Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  placeholder="MED123456"
                  className={errors.license ? 'error' : ''}
                />
                {errors.license && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.license}</span>}
              </div>

              {/* Experience and Qualification - Side by Side */}
              <div className="form-group half-width">
                <label>
                  Years of Experience <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 10 years"
                  className={errors.experience ? 'error' : ''}
                />
                {errors.experience && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.experience}</span>}
              </div>

              <div className="form-group half-width">
                <label>
                  Qualifications <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="MBBS, MD, DM"
                  className={errors.qualification ? 'error' : ''}
                />
                {errors.qualification && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.qualification}</span>}
              </div>

              {/* Hospital/Clinic - Full Width */}
              <div className="form-group full-width">
                <label>Current Hospital/Clinic</label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="City General Hospital"
                />
              </div>

              {/* Professional Bio - Full Width */}
              <div className="form-group full-width">
                <label>Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about your experience and expertise..."
                  rows="4"
                />
                <span className="field-hint">Brief description of your professional background</span>
              </div>
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
              {/* Consultation Fee and Available Time - Side by Side */}
              <div className="form-group half-width">
                <label>
                  Consultation Fee ($) <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  placeholder="$100"
                  className={errors.consultationFee ? 'error' : ''}
                />
                {errors.consultationFee && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.consultationFee}</span>}
              </div>

              <div className="form-group half-width">
                <label>
                  Available Time <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="availableTime"
                  value={formData.availableTime}
                  onChange={handleChange}
                  placeholder="9:00 AM - 5:00 PM"
                  className={errors.availableTime ? 'error' : ''}
                />
                {errors.availableTime && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.availableTime}</span>}
              </div>

              {/* Available Days */}
              <div className="form-group full-width">
                <label>
                  Available Days <span className="required">*</span>
                </label>
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
                {errors.availableDays && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.availableDays}</span>}
              </div>

              {/* Address - Full Width */}
              <div className="form-group full-width">
                <label>
                  Clinic Address <span className="required">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your full clinic address"
                  rows="3"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.address}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          {step > 1 && (
            <button type="button" className="btn btn-outline" onClick={handlePrevious}>
              <i className="fas fa-arrow-left"></i>
              Previous
            </button>
          )}
          
          {step < 3 ? (
            <button type="button" className="btn btn-primary next-btn" onClick={handleNext}>
              Next Step
              <i className="fas fa-arrow-right"></i>
            </button>
          ) : (
            <button type="submit" className="btn btn-success submit-btn" disabled={loading}>
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
        <button type="button" className="login-link" onClick={onSwitchToLogin}>
          Sign In <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default DoctorSignup;