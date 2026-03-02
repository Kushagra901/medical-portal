import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredPatient, patientLogout, updatePatientProfile } from '../services/patientAuth';
import './PatientDashboardPage.css';

const PatientDashboardPage = () => {
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadingImage, setUploadingImage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentPatient = getStoredPatient();
    console.log('Current patient from storage:', currentPatient); // Debug log
    if (!currentPatient) {
      navigate('/patient/auth');
    } else {
      setPatient(currentPatient);
    }
  }, [navigate]);

  const handleLogout = () => {
    patientLogout();
    navigate('/patient/auth');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result;
        
        const updatedPatient = await updatePatientProfile(patient.id, {
          ...patient,
          profileImage: base64Image
        });
        
        setPatient(updatedPatient);
        setUploadingImage(false);
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setUploadingImage(false);
    }
  };

  if (!patient) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar patient-sidebar">
        <div className="sidebar-header">
          <i className="fas fa-heartbeat"></i>
          <h3>MediCare</h3>
          <p>Patient Portal</p>
        </div>
        
        <div className="patient-profile">
          <div className="profile-image-container">
            {patient.profileImage ? (
              <img src={patient.profileImage} alt={patient.name} className="profile-image" />
            ) : (
              <div className="profile-image-placeholder patient-placeholder">
                <i className="fas fa-user-circle"></i>
              </div>
            )}
            <label htmlFor="patient-image-upload" className="image-upload-label patient-upload">
              <i className="fas fa-camera"></i>
              <input
                type="file"
                id="patient-image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            {uploadingImage && <div className="upload-spinner"><i className="fas fa-spinner fa-spin"></i></div>}
          </div>
          <h4>{patient.name}</h4>
          <p>ID: {patient.id}</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-home"></i> Overview
          </button>
          <button 
            className={activeTab === 'records' ? 'active' : ''}
            onClick={() => setActiveTab('records')}
          >
            <i className="fas fa-file-medical"></i> Medical Records
          </button>
          <button 
            className={activeTab === 'prescriptions' ? 'active' : ''}
            onClick={() => setActiveTab('prescriptions')}
          >
            <i className="fas fa-prescription"></i> Prescriptions
          </button>
          <button 
            className={activeTab === 'appointments' ? 'active' : ''}
            onClick={() => setActiveTab('appointments')}
          >
            <i className="fas fa-calendar-check"></i> Appointments
          </button>
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome back, {patient.name}!</h1>
          <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <i className="fas fa-calendar-check"></i>
                  <h3>Next Appointment</h3>
                  <p>No upcoming</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-prescription"></i>
                  <h3>Active Prescriptions</h3>
                  <p>{patient.currentMedications?.length || 0}</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-notes-medical"></i>
                  <h3>Medical Records</h3>
                  <p>{patient.medicalHistory?.length || 0}</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-user-md"></i>
                  <h3>Primary Doctor</h3>
                  <p>Dr. John Smith</p>
                </div>
              </div>

              <div className="recent-records">
                <h3>Recent Medical Records</h3>
                {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                  <div className="records-list">
                    {patient.medicalHistory.map((record, index) => (
                      <div key={index} className="record-item">
                        <h4>{record.condition}</h4>
                        <p>Diagnosed: {record.diagnosedDate}</p>
                        <p>{record.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No medical records found</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-tab">
              <h2><i className="fas fa-user-circle"></i> Personal Information</h2>
              
              <div className="profile-header">
                <div className="profile-avatar-large-container">
                  {patient.profileImage ? (
                    <img src={patient.profileImage} alt={patient.name} className="profile-avatar-large" />
                  ) : (
                    <div className="profile-avatar-large-placeholder patient-placeholder">
                      <i className="fas fa-user-circle"></i>
                    </div>
                  )}
                  <label htmlFor="patient-image-upload-large" className="image-upload-label-large patient-upload">
                    <i className="fas fa-camera"></i>
                    <input
                      type="file"
                      id="patient-image-upload-large"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <div className="profile-title">
                  <h3>{patient.name}</h3>
                  <p>Patient ID: {patient.id}</p>
                </div>
              </div>

              <div className="profile-sections">
                {/* Personal Information */}
                <div className="profile-section">
                  <h4><i className="fas fa-user"></i> Personal Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Full Name</span>
                      <span className="profile-value">{patient.name || 'Not provided'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Email</span>
                      <span className="profile-value">{patient.email || 'Not provided'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Phone</span>
                      <span className="profile-value">{patient.phone || 'Not provided'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Date of Birth</span>
                      <span className="profile-value">{patient.dateOfBirth || 'Not provided'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Gender</span>
                      <span className="profile-value">{patient.gender || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="profile-section">
                  <h4><i className="fas fa-notes-medical"></i> Medical Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Blood Group</span>
                      <span className="profile-value">{patient.bloodGroup || 'Not recorded'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Height</span>
                      <span className="profile-value">{patient.height ? `${patient.height} cm` : 'Not recorded'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Weight</span>
                      <span className="profile-value">{patient.weight ? `${patient.weight} kg` : 'Not recorded'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Allergies</span>
                      <span className="profile-value">
                        {patient.allergies?.length > 0 
                          ? (Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies)
                          : 'None recorded'}
                      </span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Current Medications</span>
                      <span className="profile-value">
                        {patient.currentMedications?.length > 0
                          ? (Array.isArray(patient.currentMedications) ? patient.currentMedications.join(', ') : patient.currentMedications)
                          : 'None recorded'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="profile-section">
                  <h4><i className="fas fa-address-card"></i> Contact Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Emergency Contact</span>
                      <span className="profile-value">{patient.emergencyContact || 'Not provided'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Address</span>
                      <span className="profile-value">{patient.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                {(patient.insuranceProvider || patient.insuranceId) && (
                  <div className="profile-section">
                    <h4><i className="fas fa-shield-alt"></i> Insurance Information</h4>
                    <div className="profile-grid">
                      {patient.insuranceProvider && (
                        <div className="profile-item">
                          <span className="profile-label">Insurance Provider</span>
                          <span className="profile-value">{patient.insuranceProvider}</span>
                        </div>
                      )}
                      {patient.insuranceId && (
                        <div className="profile-item">
                          <span className="profile-label">Insurance ID</span>
                          <span className="profile-value">{patient.insuranceId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-actions">
                <button className="btn btn-primary" onClick={() => alert('Edit profile functionality coming soon!')}>
                  <i className="fas fa-edit"></i> Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;