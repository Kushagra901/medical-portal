import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentPatient, patientLogout } from '../services/patientAuth';
import './PatientDashboardPage.css';

const PatientDashboardPage = () => {
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const currentPatient = getCurrentPatient();
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
          <div className="profile-image">
            {patient.profileImage ? (
              <img src={patient.profileImage} alt={patient.name} />
            ) : (
              <i className="fas fa-user-circle"></i>
            )}
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
              <h2>Personal Information</h2>
              <div className="profile-info">
                <div className="info-group">
                  <label>Full Name</label>
                  <p>{patient.name}</p>
                </div>
                <div className="info-group">
                  <label>Email</label>
                  <p>{patient.email}</p>
                </div>
                <div className="info-group">
                  <label>Phone</label>
                  <p>{patient.phone}</p>
                </div>
                <div className="info-group">
                  <label>Date of Birth</label>
                  <p>{patient.dateOfBirth || 'Not provided'}</p>
                </div>
                <div className="info-group">
                  <label>Gender</label>
                  <p>{patient.gender || 'Not provided'}</p>
                </div>
                <div className="info-group">
                  <label>Blood Group</label>
                  <p>{patient.bloodGroup || 'Not recorded'}</p>
                </div>
                <div className="info-group">
                  <label>Height</label>
                  <p>{patient.height || 'Not recorded'}</p>
                </div>
                <div className="info-group">
                  <label>Weight</label>
                  <p>{patient.weight || 'Not recorded'}</p>
                </div>
                <div className="info-group">
                  <label>Blood Pressure</label>
                  <p>{patient.bloodPressure || 'Not recorded'}</p>
                </div>
                <div className="info-group">
                  <label>Allergies</label>
                  <p>{patient.allergies?.length ? patient.allergies.join(', ') : 'None recorded'}</p>
                </div>
                <div className="info-group">
                  <label>Emergency Contact</label>
                  <p>{patient.emergencyContact || 'Not provided'}</p>
                </div>
                <div className="info-group">
                  <label>Address</label>
                  <p>{patient.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;