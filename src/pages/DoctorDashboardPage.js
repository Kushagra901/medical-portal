import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredDoctor, doctorLogout, updateDoctorProfile } from '../services/doctorAuth';
import MedicineDB from '../components/MedicineDB/MedicineDB';
import PatientDB from '../components/PatientDB/PatientDB';
import PrescriptionGenerator from '../components/Prescription/PrescriptionGenerator';
import LabReport from '../components/LabReport/LabReport';
import './DoctorDashboardPage.css';

const DoctorDashboardPage = () => {
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadingImage, setUploadingImage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentDoctor = getStoredDoctor();
    if (!currentDoctor) {
      navigate('/doctor/auth');
    } else {
      setDoctor(currentDoctor);
    }
  }, [navigate]);

  const handleLogout = () => {
    doctorLogout();
    navigate('/doctor/auth');
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
        
        const updatedDoctor = await updateDoctorProfile(doctor.id, {
          ...doctor,
          profileImage: base64Image
        });
        
        setDoctor(updatedDoctor);
        setUploadingImage(false);
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setUploadingImage(false);
    }
  };

  if (!doctor) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <i className="fas fa-heartbeat"></i>
          <h3>MediCare</h3>
          <p>Doctor Portal</p>
        </div>
        
        <div className="doctor-profile">
          <div className="profile-image-container">
            {doctor.profileImage ? (
              <img src={doctor.profileImage} alt={doctor.name} className="profile-image" />
            ) : (
              <div className="profile-image-placeholder">
                <i className="fas fa-user-md"></i>
              </div>
            )}
            <label htmlFor="profile-image-upload" className="image-upload-label">
              <i className="fas fa-camera"></i>
              <input
                type="file"
                id="profile-image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            {uploadingImage && <div className="upload-spinner"><i className="fas fa-spinner fa-spin"></i></div>}
          </div>
          <h4>{doctor.name}</h4>
          <p>{doctor.specialization || 'Specialization not set'}</p>
          <span className="doctor-id">ID: {doctor.id}</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-home"></i> Dashboard
          </button>
          <button 
            className={activeTab === 'medicine' ? 'active' : ''}
            onClick={() => setActiveTab('medicine')}
          >
            <i className="fas fa-pills"></i> Medicine DB
          </button>
          <button 
            className={activeTab === 'patients' ? 'active' : ''}
            onClick={() => setActiveTab('patients')}
          >
            <i className="fas fa-user-injured"></i> Patient DB
          </button>
          <button 
            className={activeTab === 'prescription' ? 'active' : ''}
            onClick={() => setActiveTab('prescription')}
          >
            <i className="fas fa-prescription"></i> Prescription
          </button>
          <button 
            className={activeTab === 'labreport' ? 'active' : ''}
            onClick={() => setActiveTab('labreport')}
          >
            <i className="fas fa-flask"></i> Lab Report
          </button>
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user-cog"></i> Profile
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome, {doctor.name}</h1>
          <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-tab">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <i className="fas fa-users"></i>
                  <h3>Total Patients</h3>
                  <p>156</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-calendar-check"></i>
                  <h3>Today's Appointments</h3>
                  <p>8</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-prescription"></i>
                  <h3>Pending Prescriptions</h3>
                  <p>12</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-flask"></i>
                  <h3>Pending Lab Reports</h3>
                  <p>5</p>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <i className="fas fa-user-plus"></i>
                    <div>
                      <p>New patient registered</p>
                      <span>5 minutes ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <i className="fas fa-prescription"></i>
                    <div>
                      <p>Prescription generated for John Doe</p>
                      <span>1 hour ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <i className="fas fa-flask"></i>
                    <div>
                      <p>Lab report uploaded for Sarah Smith</p>
                      <span>3 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medicine' && <MedicineDB />}
          {activeTab === 'patients' && <PatientDB />}
          {activeTab === 'prescription' && <PrescriptionGenerator />}
          {activeTab === 'labreport' && <LabReport />}
          
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <h2><i className="fas fa-user-md"></i> Doctor Profile</h2>
              
              <div className="profile-header">
                <div className="profile-avatar-large-container">
                  {doctor.profileImage ? (
                    <img src={doctor.profileImage} alt={doctor.name} className="profile-avatar-large" />
                  ) : (
                    <div className="profile-avatar-large-placeholder">
                      <i className="fas fa-user-md"></i>
                    </div>
                  )}
                  <label htmlFor="profile-image-upload-large" className="image-upload-label-large">
                    <i className="fas fa-camera"></i>
                    <input
                      type="file"
                      id="profile-image-upload-large"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <div className="profile-title">
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialization || 'Specialization not set'} • ID: {doctor.id}</p>
                </div>
              </div>

              <div className="profile-sections">
                {/* Personal Information */}
                <div className="profile-section">
                  <h4><i className="fas fa-user"></i> Personal Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Full Name</span>
                      <span className="profile-value">{doctor.name || 'Not provided'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Email</span>
                      <span className="profile-value">{doctor.email || 'Not provided'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Phone</span>
                      <span className="profile-value">{doctor.phone || 'Not provided'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Date of Birth</span>
                      <span className="profile-value">{doctor.dateOfBirth || 'Not provided'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Gender</span>
                      <span className="profile-value">{doctor.gender || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="profile-section">
                  <h4><i className="fas fa-stethoscope"></i> Professional Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Specialization</span>
                      <span className="profile-value">{doctor.specialization || 'Not specified'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">License Number</span>
                      <span className="profile-value">{doctor.license || 'Not specified'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Experience</span>
                      <span className="profile-value">{doctor.experience || 'Not specified'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Qualification</span>
                      <span className="profile-value">{doctor.qualification || 'Not specified'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Hospital/Clinic</span>
                      <span className="profile-value">{doctor.hospital || 'Not specified'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Bio</span>
                      <span className="profile-value">{doctor.bio || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Practice Information */}
                <div className="profile-section">
                  <h4><i className="fas fa-clinic-medical"></i> Practice Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Consultation Fee</span>
                      <span className="profile-value">{doctor.consultationFee || 'Not specified'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Available Days</span>
                      <span className="profile-value">
                        {doctor.availableDays?.length > 0 
                          ? doctor.availableDays.join(', ') 
                          : 'Not specified'}
                      </span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Available Time</span>
                      <span className="profile-value">{doctor.availableTime || 'Not specified'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Clinic Address</span>
                      <span className="profile-value">{doctor.address || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
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

export default DoctorDashboardPage;