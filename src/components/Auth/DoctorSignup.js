import React, { useState, useCallback, useEffect } from 'react';
import { doctorSignup } from '../../services/doctorAuth';
import ImageUpload from '../Common/ImageUpload';
import './DoctorSignup.css';

const DoctorSignup = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Personal Information - REQUIRED
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    profileImage: null,
    
    // Professional Information
    specialization: '',
    license: '',
    experience: '',
    qualification: '',
    hospital: '',
    
    // Practice Information
    consultationFee: '',
    availableDays: [],
    availableTime: '09:00 AM - 05:00 PM',
    address: '',
    bio: '',
    
    // Time picker fields
    startHour: '09',
    startMinute: '00',
    startAmPm: 'AM',
    endHour: '05',
    endMinute: '00',
    endAmPm: 'PM'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const specializations = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician',
    'Neurologist', 'Psychiatrist', 'Orthopedic', 'Gynecologist',
    'Ophthalmologist', 'ENT Specialist', 'Dentist', 'Other'
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const genders = ['Male', 'Female', 'Other'];

  // Country codes for phone validation
  const countryCodes = {
    'IN': { code: '+91', pattern: /^[6-9]\d{9}$/, name: 'India' },
    'US': { code: '+1', pattern: /^\d{10}$/, name: 'USA' },
    'UK': { code: '+44', pattern: /^\d{10}$/, name: 'UK' },
    'AE': { code: '+971', pattern: /^[5]\d{8}$/, name: 'UAE' },
    'SA': { code: '+966', pattern: /^[5]\d{8}$/, name: 'Saudi Arabia' },
    'AU': { code: '+61', pattern: /^\d{9}$/, name: 'Australia' },
    'CA': { code: '+1', pattern: /^\d{10}$/, name: 'Canada' },
    'SG': { code: '+65', pattern: /^\d{8}$/, name: 'Singapore' },
    'MY': { code: '+60', pattern: /^\d{9,10}$/, name: 'Malaysia' },
    'NZ': { code: '+64', pattern: /^\d{9}$/, name: 'New Zealand' }
  };

  const [selectedCountry, setSelectedCountry] = useState('IN');

  // Initialize time values
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      startHour: '09',
      startMinute: '00',
      startAmPm: 'AM',
      endHour: '05',
      endMinute: '00',
      endAmPm: 'PM',
      availableTime: '09:00 AM - 05:00 PM'
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          [name]: [...prev[name], value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: prev[name].filter(day => day !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Time picker change handler
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Combine time parts into availableTime string
      const startTime = `${updated.startHour || '09'}:${updated.startMinute || '00'} ${updated.startAmPm || 'AM'}`;
      const endTime = `${updated.endHour || '05'}:${updated.endMinute || '00'} ${updated.endAmPm || 'PM'}`;
      updated.availableTime = `${startTime} - ${endTime}`;
      
      return updated;
    });
  };

  const handleImageChange = (imageData) => {
    setFormData(prev => ({
      ...prev,
      profileImage: imageData
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Validation function - memoized with useCallback
  const validateField = useCallback((field, value, allData) => {
    switch(field) {
      case 'name':
        if (!value || value.trim() === '') return 'Full name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return '';

      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one capital letter';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          return 'Password must contain at least one special character';
        }
        return '';

      case 'confirmPassword':
        if (value !== allData.password) return 'Passwords do not match';
        return '';

      case 'phone':
        if (!value) return 'Phone number is required';
        const countryPattern = countryCodes[selectedCountry].pattern;
        if (!countryPattern.test(value)) {
          return `Please enter a valid ${countryCodes[selectedCountry].name} phone number`;
        }
        return '';

      case 'gender':
        if (!value) return 'Please select your gender';
        return '';

      case 'specialization':
        if (!value) return 'Specialization is required';
        return '';

      case 'license':
        if (!value) return 'License number is required';
        return '';

      case 'experience':
        if (!value) return 'Experience is required';
        return '';

      case 'qualification':
        if (!value) return 'Qualification is required';
        return '';

      case 'consultationFee':
        if (!value) return 'Consultation fee is required';
        if (isNaN(value) || Number(value) <= 0) return 'Please enter a valid fee';
        return '';

      case 'availableDays':
        if (value.length === 0) return 'Select at least one available day';
        return '';

      case 'availableTime':
        if (!value) return 'Available time is required';
        return '';

      case 'address':
        if (!value || value.trim() === '') return 'Address is required';
        return '';

      default:
        return '';
    }
  }, [selectedCountry, countryCodes]);

  // Validate all fields in step 1
  const isStep1Valid = useCallback(() => {
    const fields = ['name', 'email', 'password', 'confirmPassword', 'phone', 'gender'];
    let isValid = true;
    const newErrors = {};

    fields.forEach(field => {
      const error = validateField(field, formData[field], formData);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  // Validate step 2
  const isStep2Valid = useCallback(() => {
    const fields = ['specialization', 'license', 'experience', 'qualification'];
    let isValid = true;
    const newErrors = {};

    fields.forEach(field => {
      const error = validateField(field, formData[field], formData);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  // Validate step 3
  const isStep3Valid = useCallback(() => {
    const fields = ['consultationFee', 'availableDays', 'availableTime', 'address'];
    let isValid = true;
    const newErrors = {};

    fields.forEach(field => {
      const error = validateField(field, formData[field], formData);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && isStep1Valid()) {
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2 && isStep2Valid()) {
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    setStep(step - 1);
    setErrors({});
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isStep3Valid()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Format phone with country code
      const fullPhone = `${countryCodes[selectedCountry].code}${formData.phone}`;

      // Format time
      const availableTime = formData.availableTime;

      const completeData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: fullPhone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        profileImage: formData.profileImage,
        specialization: formData.specialization,
        license: formData.license,
        experience: formData.experience,
        qualification: formData.qualification,
        hospital: formData.hospital,
        consultationFee: formData.consultationFee,
        availableDays: formData.availableDays,
        availableTime: availableTime,
        address: formData.address,
        bio: formData.bio,
        countryCode: selectedCountry
      };

      const result = await doctorSignup(completeData);
      onSwitchToLogin();
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get error for a field
  const getFieldError = (field) => {
    return touched[field] ? errors[field] : '';
  };

  return (
    <div className="doctor-signup-container professional">
      <div className="signup-header">
        <h2>Create Doctor Account</h2>
        <p className="time-display">{new Date().toLocaleString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
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

      {/* Professional Progress Steps */}
      <div className="progress-steps professional">
        <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-indicator">{step > 1 ? '✓' : '1'}</div>
          <div className="step-content">
            <span className="step-label">Personal Information</span>
            <span className="step-desc">Basic details</span>
          </div>
        </div>
        <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-indicator">{step > 2 ? '✓' : '2'}</div>
          <div className="step-content">
            <span className="step-label">Professional</span>
            <span className="step-desc">Credentials</span>
          </div>
        </div>
        <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-indicator">3</div>
          <div className="step-content">
            <span className="step-label">Practice</span>
            <span className="step-desc">Clinic details</span>
          </div>
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
              {/* Full Name - Required */}
              <div className="form-group full-width required">
                <label>Full Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('name')}
                  placeholder="Dr. John Smith"
                  className={getFieldError('name') ? 'error' : ''}
                />
                {getFieldError('name') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('name')}</span>
                )}
              </div>

              {/* Email - Required with validation */}
              <div className="form-group full-width required">
                <label>Email Address <span className="required-star">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="doctor@hospital.com"
                  className={getFieldError('email') ? 'error' : ''}
                />
                {getFieldError('email') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('email')}</span>
                )}
              </div>

              {/* Password - Required with strong validation */}
              <div className="form-group half-width required">
                <label>Password <span className="required-star">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="At least 8 chars, 1 capital, 1 special"
                  className={getFieldError('password') ? 'error' : ''}
                />
                {getFieldError('password') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('password')}</span>
                )}
                <div className="password-requirements">
                  <span className={formData.password.length >= 8 ? 'valid' : ''}>✓ 8+ chars</span>
                  <span className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>✓ Capital letter</span>
                  <span className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : ''}>✓ Special char</span>
                </div>
              </div>

              <div className="form-group half-width required">
                <label>Confirm Password <span className="required-star">*</span></label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Re-enter password"
                  className={getFieldError('confirmPassword') ? 'error' : ''}
                />
                {getFieldError('confirmPassword') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('confirmPassword')}</span>
                )}
              </div>

              {/* Phone with Country Code - Required */}
              <div className="form-group phone-group required full-width">
                <label>PHONE NUMBER <span className="required-star">*</span></label>
                <div className="phone-input-container">
                  <select 
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="country-select"
                  >
                    {Object.entries(countryCodes).map(([key, { code, name }]) => (
                      <option key={key} value={key}>
                        {code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur('phone')}
                    placeholder="Phone Number"
                    className={getFieldError('phone') ? 'error' : ''}
                  />
                </div>
                {getFieldError('phone') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('phone')}</span>
                )}
              </div>

              {/* Date of Birth - Optional */}
              <div className="form-group third-width">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              {/* Gender - Required */}
              <div className="form-group third-width required">
                <label>Gender <span className="required-star">*</span></label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange}
                  onBlur={() => handleBlur('gender')}
                  className={getFieldError('gender') ? 'error' : ''}
                >
                  <option value="">Select Gender</option>
                  {genders.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
                {getFieldError('gender') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('gender')}</span>
                )}
              </div>

              <div className="form-group third-width">
                {/* Empty for spacing */}
              </div>

              {/* Profile Photo with Alignment Options */}
              <div className="form-group full-width">
                <label>Profile Photo</label>
                <ImageUpload 
                  currentImage={formData.profileImage}
                  onImageChange={handleImageChange}
                  userType="doctor"
                />
              </div>
            </div>

            {/* Form Actions for Step 1 */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary next-btn"
              >
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
              {/* Specialization - Required */}
              <div className="form-group half-width required">
                <label>Specialization <span className="required-star">*</span></label>
                <select 
                  name="specialization" 
                  value={formData.specialization} 
                  onChange={handleChange}
                  onBlur={() => handleBlur('specialization')}
                  className={getFieldError('specialization') ? 'error' : ''}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {getFieldError('specialization') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('specialization')}</span>
                )}
              </div>

              {/* License Number - Required */}
              <div className="form-group half-width required">
                <label>License Number <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  onBlur={() => handleBlur('license')}
                  placeholder="MED123456"
                  className={getFieldError('license') ? 'error' : ''}
                />
                {getFieldError('license') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('license')}</span>
                )}
              </div>

              {/* Experience - Required */}
              <div className="form-group half-width required">
                <label>Years of Experience <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  onBlur={() => handleBlur('experience')}
                  placeholder="e.g., 10 years"
                  className={getFieldError('experience') ? 'error' : ''}
                />
                {getFieldError('experience') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('experience')}</span>
                )}
              </div>

              {/* Qualification - Required */}
              <div className="form-group half-width required">
                <label>Qualifications <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  onBlur={() => handleBlur('qualification')}
                  placeholder="MBBS, MD, DM"
                  className={getFieldError('qualification') ? 'error' : ''}
                />
                {getFieldError('qualification') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('qualification')}</span>
                )}
              </div>

              {/* Hospital/Clinic - Optional */}
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

              {/* Professional Bio - Optional */}
              <div className="form-group full-width">
                <label>Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about your experience and expertise..."
                  rows="3"
                />
              </div>
            </div>

            {/* Form Actions for Step 2 */}
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handlePrevious}>
                <i className="fas fa-arrow-left"></i> Previous
              </button>
              <button type="submit" className="btn btn-primary next-btn">
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
              {/* Consultation Fee - Required */}
              <div className="form-group half-width required">
                <label>Consultation Fee ($) <span className="required-star">*</span></label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  onBlur={() => handleBlur('consultationFee')}
                  placeholder="e.g., 100"
                  min="0"
                  step="1"
                  className={getFieldError('consultationFee') ? 'error' : ''}
                />
                {getFieldError('consultationFee') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('consultationFee')}</span>
                )}
              </div>

              {/* Available Time - Professional Time Picker */}
              <div className="form-group half-width required">
                <label>Available Time <span className="required-star">*</span></label>
                <div className="time-picker-container">
                  <div className="time-input-group">
                    <label className="time-label">From</label>
                    <div className="time-select-group">
                      <select 
                        name="startHour"
                        value={formData.startHour || '09'}
                        onChange={handleTimeChange}
                        className="time-select"
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = (i + 1).toString().padStart(2, '0');
                          return <option key={`start-${hour}`} value={hour}>{hour}</option>;
                        })}
                      </select>
                      <span className="time-colon">:</span>
                      <select 
                        name="startMinute"
                        value={formData.startMinute || '00'}
                        onChange={handleTimeChange}
                        className="time-select"
                      >
                        <option value="00">00</option>
                        <option value="15">15</option>
                        <option value="30">30</option>
                        <option value="45">45</option>
                      </select>
                      <select 
                        name="startAmPm"
                        value={formData.startAmPm || 'AM'}
                        onChange={handleTimeChange}
                        className="time-ampm"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="time-separator">to</div>

                  <div className="time-input-group">
                    <label className="time-label">To</label>
                    <div className="time-select-group">
                      <select 
                        name="endHour"
                        value={formData.endHour || '05'}
                        onChange={handleTimeChange}
                        className="time-select"
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = (i + 1).toString().padStart(2, '0');
                          return <option key={`end-${hour}`} value={hour}>{hour}</option>;
                        })}
                      </select>
                      <span className="time-colon">:</span>
                      <select 
                        name="endMinute"
                        value={formData.endMinute || '00'}
                        onChange={handleTimeChange}
                        className="time-select"
                      >
                        <option value="00">00</option>
                        <option value="15">15</option>
                        <option value="30">30</option>
                        <option value="45">45</option>
                      </select>
                      <select 
                        name="endAmPm"
                        value={formData.endAmPm || 'PM'}
                        onChange={handleTimeChange}
                        className="time-ampm"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
                {getFieldError('availableTime') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('availableTime')}</span>
                )}
              </div>

              {/* Available Days - Required */}
              <div className="form-group full-width required">
                <label>Available Days <span className="required-star">*</span></label>
                <div className="days-grid">
                  {weekDays.map(day => (
                    <label key={day} className="day-checkbox">
                      <input
                        type="checkbox"
                        name="availableDays"
                        value={day}
                        checked={formData.availableDays.includes(day)}
                        onChange={handleChange}
                        onBlur={() => handleBlur('availableDays')}
                      />
                      <span>{day.substring(0, 3)}</span>
                    </label>
                  ))}
                </div>
                {getFieldError('availableDays') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('availableDays')}</span>
                )}
              </div>

              {/* Address - Required */}
              <div className="form-group full-width required">
                <label>Clinic Address <span className="required-star">*</span></label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={() => handleBlur('address')}
                  placeholder="Enter your full clinic address"
                  rows="3"
                  className={getFieldError('address') ? 'error' : ''}
                />
                {getFieldError('address') && (
                  <span className="error-message"><i className="fas fa-exclamation-circle"></i> {getFieldError('address')}</span>
                )}
              </div>
            </div>

            {/* Form Actions for Step 3 */}
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handlePrevious}>
                <i className="fas fa-arrow-left"></i> Previous
              </button>
              <button 
                type="submit" 
                className="btn btn-success submit-btn" 
                disabled={loading}
              >
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