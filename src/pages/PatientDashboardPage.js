import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredPatient, patientLogout, updatePatientProfile } from '../services/patientAuth';
import ImageUpload from '../components/Common/ImageUpload';
import './PatientDashboardPage.css';

const PatientDashboardPage = () => {
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const currentPatient = getStoredPatient();
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

  const handleImageUpload = async (imageData) => {
    try {
      setUploadingImage(true);
      setPatient({ ...patient, profileImage: imageData });
      await updatePatientProfile(patient.id, { profileImage: imageData });
      setUploadingImage(false);
    } catch (error) {
      console.error('Error updating profile image:', error);
      setUploadingImage(false);
    }
  };

  const handleEditClick = () => {
    if (isEditingProfile) {
      setIsEditingProfile(false);
      setEditFormData({});
    } else {
      setEditFormData({
        name: patient.name || '',
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        bloodGroup: patient.bloodGroup || '',
        height: patient.height || '',
        weight: patient.weight || '',
        allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || ''),
        currentMedications: Array.isArray(patient.currentMedications) ? patient.currentMedications.join(', ') : (patient.currentMedications || ''),
        emergencyContact: patient.emergencyContact || '',
        emergencyPhone: patient.emergencyPhone || '',
        address: patient.address || '',
        insuranceProvider: patient.insuranceProvider || '',
        insuranceId: patient.insuranceId || ''
      });
      setIsEditingProfile(true);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    try {
      const formattedData = {
        ...editFormData,
        // Optional formatting back to array, or keep as string depending on schema.
        // The schema uses { type: String, default: null } but we can save whatever.
        allergies: editFormData.allergies,
        currentMedications: editFormData.currentMedications
      };

      const updatedPatient = await updatePatientProfile(patient.id, formattedData);
      setPatient(updatedPatient);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
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
          <div className="profile-image-section">
            <ImageUpload 
              currentImage={patient?.profileImage}
              onImageChange={handleImageUpload}
              userType="patient"
            />
          </div>
          <h4>{patient.name}</h4>
          <p>ID: {patient.id}</p>
        </div>

        <nav className="sidebar-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <i className="fas fa-home"></i> Overview
          </button>
          <button className={activeTab === 'records' ? 'active' : ''} onClick={() => setActiveTab('records')}>
            <i className="fas fa-file-medical"></i> Medical Records
          </button>
          <button className={activeTab === 'prescriptions' ? 'active' : ''} onClick={() => setActiveTab('prescriptions')}>
            <i className="fas fa-prescription"></i> Prescriptions
          </button>
          <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>
            <i className="fas fa-calendar-check"></i> Appointments
          </button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2><i className="fas fa-user-circle"></i> Personal Information</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {isEditingProfile && (
                    <button className="btn btn-success" onClick={handleProfileSave}>
                      <i className="fas fa-save"></i> Save Profile
                    </button>
                  )}
                  <button 
                    className={`btn ${isEditingProfile ? 'btn-outline' : 'btn-primary'}`} 
                    onClick={handleEditClick}
                  >
                    <i className={`fas ${isEditingProfile ? 'fa-times' : 'fa-edit'}`}></i> 
                    {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                </div>
              </div>
              
              <div className="profile-header">
                <div className="profile-image-section">
                  <ImageUpload 
                    currentImage={patient?.profileImage}
                    onImageChange={handleImageUpload}
                    userType="patient"
                  />
                </div>
                <div className="profile-title">
                  <h3>{patient?.name}</h3>
                  <p>Patient ID: {patient?.id}</p>
                </div>
              </div>

              <div className="profile-sections">
                <div className="profile-section">
                  <h4><i className="fas fa-user"></i> Personal Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Full Name</span>
                      {isEditingProfile ? (
                        <input type="text" name="name" className="edit-input" value={editFormData.name} onChange={handleEditChange} />
                      ) : (
                        <span className="profile-value">{patient?.name || 'Not provided'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Email</span>
                      <span className="profile-value">{patient?.email || 'Not provided'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Phone</span>
                      {isEditingProfile ? (
                        <input type="text" name="phone" className="edit-input" value={editFormData.phone} onChange={handleEditChange} />
                      ) : (
                        <span className="profile-value">{patient?.phone || 'Not provided'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Date of Birth</span>
                      {isEditingProfile ? (
                        <input type="date" name="dateOfBirth" className="edit-input" value={editFormData.dateOfBirth} onChange={handleEditChange} />
                      ) : (
                        <span className="profile-value">{patient?.dateOfBirth || 'Not provided'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Gender</span>
                      {isEditingProfile ? (
                        <select name="gender" className="edit-input" value={editFormData.gender} onChange={handleEditChange}>
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="profile-value">{patient?.gender || 'Not provided'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h4><i className="fas fa-notes-medical"></i> Medical Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Blood Group</span>
                      {isEditingProfile ? (
                        <select name="bloodGroup" className="edit-input" value={editFormData.bloodGroup} onChange={handleEditChange}>
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option><option value="A-">A-</option>
                          <option value="B+">B+</option><option value="B-">B-</option>
                          <option value="AB+">AB+</option><option value="AB-">AB-</option>
                          <option value="O+">O+</option><option value="O-">O-</option>
                        </select>
                      ) : (
                        <span className="profile-value">{patient?.bloodGroup || 'Not recorded'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Height (cm)</span>
                      {isEditingProfile ? (
                        <input type="number" name="height" className="edit-input" value={editFormData.height} onChange={handleEditChange} placeholder="e.g. 175" />
                      ) : (
                        <span className="profile-value">{patient?.height ? `${patient.height} cm` : 'Not recorded'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Weight (kg)</span>
                      {isEditingProfile ? (
                        <input type="number" name="weight" className="edit-input" value={editFormData.weight} onChange={handleEditChange} placeholder="e.g. 70" />
                      ) : (
                        <span className="profile-value">{patient?.weight ? `${patient.weight} kg` : 'Not recorded'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Allergies</span>
                      {isEditingProfile ? (
                        <textarea name="allergies" className="edit-input" value={editFormData.allergies} onChange={handleEditChange} placeholder="Comma separated list" />
                      ) : (
                        <span className="profile-value">
                          {patient?.allergies?.length > 0 ? (Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies) : 'None recorded'}
                        </span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Current Medications</span>
                      {isEditingProfile ? (
                        <textarea name="currentMedications" className="edit-input" value={editFormData.currentMedications} onChange={handleEditChange} placeholder="Comma separated list" />
                      ) : (
                        <span className="profile-value">
                          {patient?.currentMedications?.length > 0 ? (Array.isArray(patient.currentMedications) ? patient.currentMedications.join(', ') : patient.currentMedications) : 'None recorded'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h4><i className="fas fa-address-card"></i> Contact Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Emergency Contact Name</span>
                      {isEditingProfile ? (
                        <input type="text" name="emergencyContact" className="edit-input" value={editFormData.emergencyContact} onChange={handleEditChange} />
                      ) : (
                        <span className="profile-value">{patient?.emergencyContact || 'Not provided'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Emergency Phone</span>
                      {isEditingProfile ? (
                        <input type="text" name="emergencyPhone" className="edit-input" value={editFormData.emergencyPhone} onChange={handleEditChange} />
                      ) : (
                        <span className="profile-value">{patient?.emergencyPhone || 'Not provided'}</span>
                      )}
                    </div>
                    <div className="profile-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="profile-label">Address</span>
                      {isEditingProfile ? (
                        <textarea name="address" className="edit-input" value={editFormData.address} onChange={handleEditChange} />
                      ) : (
                        <span className="profile-value">{patient?.address || 'Not provided'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Only conditionally hide insurance if not editing and empty! */}
                {(isEditingProfile || patient?.insuranceProvider || patient?.insuranceId) && (
                  <div className="profile-section">
                    <h4><i className="fas fa-shield-alt"></i> Insurance Information</h4>
                    <div className="profile-grid">
                      <div className="profile-item">
                        <span className="profile-label">Insurance Provider</span>
                        {isEditingProfile ? (
                          <input type="text" name="insuranceProvider" className="edit-input" value={editFormData.insuranceProvider} onChange={handleEditChange} />
                        ) : (
                          <span className="profile-value">{patient?.insuranceProvider || 'Not provided'}</span>
                        )}
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Insurance ID</span>
                        {isEditingProfile ? (
                          <input type="text" name="insuranceId" className="edit-input" value={editFormData.insuranceId} onChange={handleEditChange} />
                        ) : (
                          <span className="profile-value">{patient?.insuranceId || 'Not provided'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;