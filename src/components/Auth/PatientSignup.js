import React, { useState, useCallback } from 'react';
import { patientSignup } from '../../services/patientAuth';
import './PatientSignup.css';

const PatientSignup = ({ onSwitchToLogin }) => {
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
    gender: '',
    
    // Medical Information
    bloodGroup: '',
    height: '',
    weight: '',
    allergies: '',
    currentMedications: '',
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    
    // Insurance Information (Optional)
    insuranceProvider: '',
    insuranceId: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
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
  const [emergencyCountry, setEmergencyCountry] = useState('IN');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

      case 'emergencyContact':
        if (!value || value.trim() === '') return 'Emergency contact name is required';
        return '';

      case 'emergencyPhone':
        if (value) {
          const pattern = countryCodes[emergencyCountry].pattern;
          if (!pattern.test(value)) {
            return `Please enter a valid ${countryCodes[emergencyCountry].name} emergency number`;
          }
        }
        return '';

      default:
        return '';
    }
  }, [selectedCountry, emergencyCountry, countryCodes]);

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
    const newErrors = {};
    let isValid = true;

    // Validate emergency contact name
    const contactError = validateField('emergencyContact', formData.emergencyContact, formData);
    if (contactError) {
      newErrors.emergencyContact = contactError;
      isValid = false;
    }

    // Validate emergency phone if provided
    if (formData.emergencyPhone) {
      const phoneError = validateField('emergencyPhone', formData.emergencyPhone, formData);
      if (phoneError) {
        newErrors.emergencyPhone = phoneError;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleNext = (e) => {
    e.preventDefault();
    if (isStep1Valid()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    setStep(1);
    setErrors({});
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isStep2Valid()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Format phone with country code
      const fullPhone = `${countryCodes[selectedCountry].code}${formData.phone}`;
      const fullEmergencyPhone = formData.emergencyPhone 
        ? `${countryCodes[emergencyCountry].code}${formData.emergencyPhone}` 
        : '';

      const completeData = {
        ...formData,
        phone: fullPhone,
        emergencyPhone: fullEmergencyPhone,
        countryCode: selectedCountry,
        emergencyCountryCode: emergencyCountry
      };

      await patientSignup(completeData);
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
    <div className="patient-signup-container professional">
      <div className="signup-header">
        <h2>Create Patient Account</h2>
        <p className="time-display">{new Date().toLocaleString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
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
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-indicator">2</div>
          <div className="step-content">
            <span className="step-label">Medical Information</span>
            <span className="step-desc">Health details</span>
          </div>
        </div>
      </div>

      <form onSubmit={step === 2 ? handleSubmit : handleNext}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="form-step fade-in">
            <div className="step-header">
              <i className="fas fa-user-circle"></i>
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
                  placeholder="Enter your full name"
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
                  placeholder="patient@example.com"
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

              {/* Gender - Professional Design */}
              <div className="form-group full-width required">
                <label>GENDER <span className="required-star">*</span></label>
                <div className="gender-selector">
                  <div className="gender-option-card">
                    <input 
                      type="radio" 
                      name="gender" 
                      id="genderMale"
                      value="Male" 
                      checked={formData.gender === 'Male'} 
                      onChange={handleChange}
                      onBlur={() => handleBlur('gender')}
                    />
                    <label htmlFor="genderMale" className="gender-card-label">
                      <div className="gender-icon">
                        <i className="fas fa-mars"></i>
                      </div>
                      <span className="gender-text">Male</span>
                    </label>
                  </div>

                  <div className="gender-option-card">
                    <input 
                      type="radio" 
                      name="gender" 
                      id="genderFemale"
                      value="Female" 
                      checked={formData.gender === 'Female'} 
                      onChange={handleChange}
                      onBlur={() => handleBlur('gender')}
                    />
                    <label htmlFor="genderFemale" className="gender-card-label">
                      <div className="gender-icon">
                        <i className="fas fa-venus"></i>
                      </div>
                      <span className="gender-text">Female</span>
                    </label>
                  </div>

                  <div className="gender-option-card">
                    <input 
                      type="radio" 
                      name="gender" 
                      id="genderOther"
                      value="Other" 
                      checked={formData.gender === 'Other'} 
                      onChange={handleChange}
                      onBlur={() => handleBlur('gender')}
                    />
                    <label htmlFor="genderOther" className="gender-card-label">
                      <div className="gender-icon">
                        <i className="fas fa-genderless"></i>
                      </div>
                      <span className="gender-text">Other</span>
                    </label>
                  </div>
                </div>
                {getFieldError('gender') && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {getFieldError('gender')}
                  </span>
                )}
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

        {/* Step 2: Medical Information */}
        {step === 2 && (
          <div className="form-step fade-in">
            <div className="step-header">
              <i className="fas fa-notes-medical"></i>
              <h3>Medical Information</h3>
            </div>

            <div className="form-grid">
              {/* Blood Group - Optional */}
              <div className="form-group third-width">
                <label>Blood Group</label>
                <select 
                  name="bloodGroup" 
                  value={formData.bloodGroup} 
                  onChange={handleChange}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="form-group third-width">
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="e.g., 175"
                  min="1"
                  max="300"
                />
              </div>

              <div className="form-group third-width">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g., 70"
                  min="1"
                  max="500"
                />
              </div>

              <div className="form-group full-width">
                <label>Known Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="List any allergies (e.g., Penicillin, Peanuts)"
                  rows="2"
                />
              </div>

              <div className="form-group full-width">
                <label>Current Medications</label>
                <textarea
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  placeholder="List current medications with dosage"
                  rows="2"
                />
              </div>

              {/* Emergency Contact - Required */}
              <div className="form-group half-width required">
                <label>EMERGENCY CONTACT NAME <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  onBlur={() => handleBlur('emergencyContact')}
                  placeholder="Full name"
                  className={getFieldError('emergencyContact') ? 'error' : ''}
                />
                {getFieldError('emergencyContact') && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {getFieldError('emergencyContact')}
                  </span>
                )}
              </div>

              {/* Emergency Phone - Optional */}
              <div className="form-group half-width">
                <label>EMERGENCY PHONE (OPTIONAL)</label>
                <div className="phone-input-container">
                  <select 
                    value={emergencyCountry}
                    onChange={(e) => setEmergencyCountry(e.target.value)}
                    className="country-select"
                  >
                    {Object.entries(countryCodes).map(([key, { code, name }]) => (
                      <option key={key} value={key}>{code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    onBlur={() => handleBlur('emergencyPhone')}
                    placeholder="Emergency Number"
                    className={getFieldError('emergencyPhone') ? 'error' : ''}
                  />
                </div>
                {getFieldError('emergencyPhone') && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i> {getFieldError('emergencyPhone')}
                  </span>
                )}
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your full address"
                  rows="2"
                />
              </div>
            </div>

            {/* Insurance Information Section - Optional */}
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
                    placeholder="Policy number"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions for Step 2 */}
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

export default PatientSignup;