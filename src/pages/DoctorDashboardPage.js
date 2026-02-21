import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentDoctor, doctorLogout } from '../services/doctorAuth';
import MedicineDB from '../components/MedicineDB/MedicineDB';
import PatientDB from '../components/PatientDB/PatientDB';
import PrescriptionGenerator from '../components/Prescription/PrescriptionGenerator';
import './DoctorDashboardPage.css';

const DoctorDashboardPage = () => {
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const currentDoctor = getCurrentDoctor();
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
          <div className="profile-image">
            {doctor.profileImage ? (
              <img src={doctor.profileImage} alt={doctor.name} />
            ) : (
              <i className="fas fa-user-md"></i>
            )}
          </div>
          <h4>{doctor.name}</h4>
          <p>{doctor.specialization}</p>
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
                  <i className="fas fa-clock"></i>
                  <h3>Working Hours</h3>
                  <p>{doctor.availableTime || '9:00 AM - 5:00 PM'}</p>
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
                    <i className="fas fa-calendar-check"></i>
                    <div>
                      <p>Appointment scheduled with Sarah Smith</p>
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
          
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <h2>Doctor Profile</h2>
              <div className="profile-info">
                <div className="info-group">
                  <label>Full Name</label>
                  <p>{doctor.name}</p>
                </div>
                <div className="info-group">
                  <label>Email</label>
                  <p>{doctor.email}</p>
                </div>
                <div className="info-group">
                  <label>Specialization</label>
                  <p>{doctor.specialization}</p>
                </div>
                <div className="info-group">
                  <label>License Number</label>
                  <p>{doctor.license}</p>
                </div>
                <div className="info-group">
                  <label>Experience</label>
                  <p>{doctor.experience || 'Not specified'}</p>
                </div>
                <div className="info-group">
                  <label>Qualification</label>
                  <p>{doctor.qualification || 'Not specified'}</p>
                </div>
                <div className="info-group">
                  <label>Hospital</label>
                  <p>{doctor.hospital || 'Not specified'}</p>
                </div>
                <div className="info-group">
                  <label>Phone</label>
                  <p>{doctor.phone || 'Not specified'}</p>
                </div>
                <div className="info-group">
                  <label>Consultation Fee</label>
                  <p>{doctor.consultationFee || 'Not specified'}</p>
                </div>
                <div className="info-group">
                  <label>Available Days</label>
                  <p>{doctor.availableDays ? doctor.availableDays.join(', ') : 'Not specified'}</p>
                </div>
                <div className="info-group">
                  <label>Available Time</label>
                  <p>{doctor.availableTime || 'Not specified'}</p>
                </div>
                <div className="info-group">
                  <label>Address</label>
                  <p>{doctor.address || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;