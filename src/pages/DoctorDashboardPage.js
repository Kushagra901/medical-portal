import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { exportAllData } from '../services/exportService';
import { getStoredDoctor, doctorLogout, updateDoctorProfile } from '../services/doctorAuth';
import {
  getDoctorAppointments, confirmAppointment, cancelAppointment, completeAppointment
} from '../services/appointmentService';
import NotificationBell from '../components/Common/NotificationBell';
import MedicineDB from '../components/MedicineDB/MedicineDB';
import PatientDB from '../components/PatientDB/PatientDB';
import PrescriptionGenerator from '../components/Prescription/PrescriptionGenerator';
import LabReport from '../components/LabReport/LabReport';
import DoctorPatients from '../components/DoctorPatients/DoctorPatients';
import ImageUpload from '../components/Common/ImageUpload';
import './DoctorDashboardPage.css';

// Import the Report AI component from the report-ai folder
const ReportAI = ({ doctor }) => {
  const [iframeUrl, setIframeUrl] = useState('');
  const iframeRef = React.useRef(null);

  useEffect(() => {
    const envUrl = process.env.REACT_APP_REPORT_AI_URL;
    if (envUrl) {
      setIframeUrl(envUrl);
    } else {
      // Dynamically target port 8080 on the current host (works for localhost, 127.0.0.1, or network IPs)
      const hostname = window.location.hostname;
      setIframeUrl(`http://${hostname}:8080/`);
    }
  }, []);

  const sendAuthData = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'DOCTOR_AUTH',
        doctor: doctor
      }, '*');
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'REQUEST_DOCTOR_AUTH') {
        sendAuthData();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [doctor]);

  if (!iframeUrl) return null;

  return (
    <div style={{ 
      width: '100%', 
      height: 'calc(100vh - 170px)', 
      background: 'white', 
      borderRadius: '20px', 
      overflow: 'hidden', 
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
    }}>
      <iframe 
        ref={iframeRef}
        src={iframeUrl} 
        onLoad={sendAuthData}
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none'
        }} 
        title="Report AI"
      />
    </div>
  );
};

const DoctorDashboardPage = () => {
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [exportingDb, setExportingDb] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [apptFilter, setApptFilter] = useState('');
  const [apptDateFilter, setApptDateFilter] = useState('');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleEditClick = () => {
    setEditFormData(doctor);
    setIsEditingProfile(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (checked) {
        setEditFormData(prev => ({
          ...prev,
          [name]: [...(prev[name] || []), value]
        }));
      } else {
        setEditFormData(prev => ({
          ...prev,
          [name]: (prev[name] || []).filter(day => day !== value)
        }));
      }
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSave = async () => {
    try {
      setIsSaving(true);
      const updatedDoctor = await updateDoctorProfile(doctor.id, editFormData);
      setDoctor(updatedDoctor);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchDoctorAppointments = useCallback(async () => {
    try {
      const data = await getDoctorAppointments(apptFilter, apptDateFilter);
      setAppointments(data || []);
    } catch (e) {
      console.error(e);
    }
  }, [apptFilter, apptDateFilter]);

  useEffect(() => {
    const currentDoctor = getStoredDoctor();
    if (!currentDoctor) {
      navigate('/doctor/auth');
    } else {
      setDoctor(currentDoctor);
    }
  }, [navigate]);

  useEffect(() => {
    if (doctor) {
      fetchDoctorAppointments();
    }
  }, [doctor, fetchDoctorAppointments]);

  const handleConfirmAppointment = async (id) => {
    try {
      await confirmAppointment(id);
      alert('Appointment confirmed!');
      fetchDoctorAppointments();
    } catch (err) {
      alert('Error confirming appointment.');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      alert('Appointment cancelled.');
      fetchDoctorAppointments();
    } catch (err) {
      alert('Error cancelling appointment.');
    }
  };

  const handleCompleteAppointment = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    try {
      await completeAppointment(selectedAppt._id, consultationNotes);
      alert('Appointment completed successfully!');
      setSelectedAppt(null);
      setConsultationNotes('');
      fetchDoctorAppointments();
    } catch (err) {
      alert('Failed to complete appointment.');
    }
  };

  const handleLogout = () => {
    doctorLogout();
    navigate('/doctor/auth');
  };

  const handleExportFullDatabase = async () => {
    try {
      setExportingDb(true);
      const data = await exportAllData();
      
      const workbook = XLSX.utils.book_new();
      
      // Clean up fields before export to prevent XLSX string-length overflow crashes
      const cleanData = (list) => {
        return list.map(item => {
          const cleanItem = { ...item };
          if (cleanItem.profileImage) cleanItem.profileImage = '[Image Data Removed]';
          // Also remove any internal mongo properties that might bulk it up unnecessarily
          delete cleanItem.__v;
          return cleanItem;
        });
      };
      
      if (data.doctors && data.doctors.length > 0) {
        const cleanedDoctors = cleanData(data.doctors);
        const docSheet = XLSX.utils.json_to_sheet(cleanedDoctors);
        XLSX.utils.book_append_sheet(workbook, docSheet, "Doctors");
      }
      
      if (data.patients && data.patients.length > 0) {
        const cleanedPatients = cleanData(data.patients);
        const patSheet = XLSX.utils.json_to_sheet(cleanedPatients);
        XLSX.utils.book_append_sheet(workbook, patSheet, "Patients");
      }
      
      XLSX.writeFile(workbook, `Medical_Database_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export database. Please try again.");
    } finally {
      setExportingDb(false);
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
    <div className={`doctor-dashboard ${mobileMenuOpen ? 'sidebar-visible' : ''}`}>
      {/* Sidebar */}
      <div className={`dashboard-sidebar doctor-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <i className="fas fa-heartbeat"></i>
            <button className="close-sidebar-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <h3>MediCare</h3>
          <p>Doctor Portal</p>
        </div>
        
        <div className="doctor-profile">
          <div className="profile-image-section">
            <ImageUpload 
              currentImage={doctor?.profileImage}
              onImageChange={(imageData) => setDoctor({...doctor, profileImage: imageData})}
              userType="doctor"
            />
          </div>
          <h4>{doctor.name}</h4>
          <p>{doctor.specialization || 'Specialization not set'}</p>
          <span className="doctor-id">ID: {doctor.id}</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
          >
            <i className="fas fa-home"></i> Dashboard
          </button>
          <button 
            className={activeTab === 'appointments' ? 'active' : ''}
            onClick={() => { setActiveTab('appointments'); setMobileMenuOpen(false); }}
          >
            <i className="fas fa-calendar-check"></i> Appointments
          </button>
          <button 
            className={activeTab === 'medicine' ? 'active' : ''}
            onClick={() => { setActiveTab('medicine'); setMobileMenuOpen(false); }}
          >
            <i className="fas fa-pills"></i> Medicine DB
          </button>
          <button 
            className={activeTab === 'patients' ? 'active' : ''}
            onClick={() => { setActiveTab('patients'); setMobileMenuOpen(false); }}
          >
            <i className="fas fa-user-injured"></i> Patient DB
          </button>
          <button 
            className={activeTab === 'prescription' ? 'active' : ''}
            onClick={() => { setActiveTab('prescription'); setMobileMenuOpen(false); }}
          >
            <i className="fas fa-prescription"></i> Prescription
          </button>
          <button 
            className={activeTab === 'mypatients' ? 'active' : ''}
            onClick={() => { setActiveTab('mypatients'); setMobileMenuOpen(false); }}
          >
            <i className="fas fa-users"></i> My Patients
          </button>
          <button 
            className={activeTab === 'reportai' ? 'active' : ''}
            onClick={() => { setActiveTab('reportai'); setMobileMenuOpen(false); }}
          >
            <i className="fas fa-chart-line"></i> Report AI
          </button>
          <button 
            className={activeTab === 'labreport' ? 'active' : ''}
            onClick={() => { setActiveTab('labreport'); setMobileMenuOpen(false); }}
          >
            <i className="fas fa-flask"></i> Lab Report
          </button>
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
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
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem 2rem', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="menu-toggle-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Welcome, {doctor.name}</h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <NotificationBell userId={doctor.id} userType="doctor" />
            <button className="btn btn-primary" onClick={handleExportFullDatabase} disabled={exportingDb}>
              {exportingDb ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-excel"></i>} Export Database
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Dashboard Tab */}
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

          {/* Medicine DB Tab */}
          {activeTab === 'medicine' && <MedicineDB />}
          
          {/* Patient DB Tab */}
          {activeTab === 'patients' && <PatientDB />}
          
          {/* Prescription Tab */}
          {activeTab === 'prescription' && <PrescriptionGenerator />}
          
          {/* Lab Report Tab */}
          {activeTab === 'labreport' && <LabReport />}
          
          {/* My Patients Tab */}
          {activeTab === 'mypatients' && <DoctorPatients />}
          
          {/* Report AI Tab */}
          {activeTab === 'reportai' && <ReportAI doctor={doctor} />}
          
          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="appointments-tab-doctor">
              <div className="tab-header-actions">
                <h2><i className="fas fa-calendar-check"></i> Manage Appointments</h2>
                <div className="filters-row">
                  <div className="filter-item">
                    <label>Status</label>
                    <select value={apptFilter} onChange={(e) => setApptFilter(e.target.value)}>
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Date</label>
                    <input type="date" value={apptDateFilter} onChange={(e) => setApptDateFilter(e.target.value)} />
                  </div>
                </div>
              </div>

              {appointments.length === 0 ? (
                <div className="no-appointments-card">
                  <i className="fas fa-calendar-times"></i>
                  <h3>No Appointments Scheduled</h3>
                  <p>Check back later or adjust your search filters.</p>
                </div>
              ) : (
                <div className="doctor-appointments-grid">
                  {appointments.map(appt => (
                    <div key={appt._id} className={`appointment-card-doctor status-${appt.status}`}>
                      <div className="card-header">
                        <div>
                          <h4>{appt.patientId?.name || 'Unknown Patient'}</h4>
                          <p className="pat-meta">
                            Age/DOB: {appt.patientId?.dateOfBirth ? new Date(appt.patientId.dateOfBirth).toLocaleDateString() : 'N/A'} | Blood: {appt.patientId?.bloodGroup || 'N/A'}
                          </p>
                        </div>
                        <span className={`status-badge ${appt.status}`}>{appt.status.toUpperCase()}</span>
                      </div>

                      <div className="card-body">
                        <p style={{ margin: '4px 0', fontSize: '14px' }}><i className="fas fa-calendar-day" style={{ color: '#4f46e5', marginRight: '6px' }}></i> {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p style={{ margin: '4px 0', fontSize: '14px' }}><i className="fas fa-clock" style={{ color: '#4f46e5', marginRight: '6px' }}></i> {appt.timeSlot}</p>
                        {appt.reason && <p className="reason-text"><strong>Reason:</strong> {appt.reason}</p>}
                        {appt.notes && <p className="notes-text"><strong>My Notes:</strong> {appt.notes}</p>}

                        {/* Complete form inline */}
                        {selectedAppt && selectedAppt._id === appt._id && (
                          <form onSubmit={handleCompleteAppointment} className="complete-form-inline">
                            <label>Consultation Summary & Prescription Notes</label>
                            <textarea
                              required
                              rows={3}
                              placeholder="Type diagnoses, dosage, or instructions..."
                              value={consultationNotes}
                              onChange={(e) => setConsultationNotes(e.target.value)}
                            />
                            <div className="form-actions">
                              <button type="submit" className="btn-submit-notes">Save & Complete</button>
                              <button type="button" className="btn-cancel-notes" onClick={() => setSelectedAppt(null)}>Cancel</button>
                            </div>
                          </form>
                        )}
                      </div>

                      {!selectedAppt && (
                        <div className="card-actions">
                          {appt.status === 'pending' && (
                            <>
                              <button className="btn-confirm" onClick={() => handleConfirmAppointment(appt._id)}>Confirm</button>
                              <button className="btn-cancel" onClick={() => handleCancelAppointment(appt._id)}>Cancel</button>
                            </>
                          )}
                          {appt.status === 'confirmed' && (
                            <>
                              <button className="btn-complete" onClick={() => { setSelectedAppt(appt); setConsultationNotes(''); }}>Complete</button>
                              <button className="btn-cancel" onClick={() => handleCancelAppointment(appt._id)}>Cancel</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2><i className="fas fa-user-md"></i> Doctor Profile</h2>
                {!isEditingProfile ? (
                  <button className="btn btn-primary" onClick={handleEditClick}>
                    <i className="fas fa-edit"></i> Edit Profile
                  </button>
                ) : (
                  <div>
                    <button className="btn btn-outline" onClick={() => setIsEditingProfile(false)} style={{ marginRight: '10px' }}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleProfileSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="profile-header">
                <div className="profile-image-section">
                  <ImageUpload 
                    currentImage={doctor?.profileImage}
                    onImageChange={(imageData) => {
                      if (isEditingProfile) {
                        setEditFormData({...editFormData, profileImage: imageData});
                      } else {
                        setDoctor({...doctor, profileImage: imageData});
                        updateDoctorProfile(doctor.id, {...doctor, profileImage: imageData});
                      }
                    }}
                    userType="doctor"
                  />
                </div>
                <div className="profile-title">
                  <h3>{isEditingProfile ? (
                    <input type="text" name="name" value={editFormData.name || ''} onChange={handleEditChange} className="edit-input" />
                  ) : doctor?.name}</h3>
                  <p>{isEditingProfile ? (
                    <input type="text" name="specialization" value={editFormData.specialization || ''} onChange={handleEditChange} className="edit-input" placeholder="Specialization" />
                  ) : (doctor?.specialization || 'Specialization not set')} • ID: {doctor?.id}</p>
                </div>
              </div>

              <div className="profile-sections">
                {/* Personal Information */}
                <div className="profile-section">
                  <h4><i className="fas fa-user"></i> Personal Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Full Name</span>
                      {isEditingProfile ? (
                        <input type="text" name="name" value={editFormData.name || ''} onChange={handleEditChange} className="edit-input" />
                      ) : (
                        <span className="profile-value">{doctor?.name || 'Not provided'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Email</span>
                      {isEditingProfile ? (
                        <input type="email" name="email" value={editFormData.email || ''} onChange={handleEditChange} className="edit-input" />
                      ) : (
                        <span className="profile-value">{doctor?.email || 'Not provided'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Phone</span>
                      {isEditingProfile ? (
                        <input type="text" name="phone" value={editFormData.phone || ''} onChange={handleEditChange} className="edit-input" />
                      ) : (
                        <span className="profile-value">{doctor?.phone || 'Not provided'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Date of Birth</span>
                      {isEditingProfile ? (
                        <input type="date" name="dateOfBirth" value={editFormData.dateOfBirth || ''} onChange={handleEditChange} className="edit-input" />
                      ) : (
                        <span className="profile-value">{doctor?.dateOfBirth || 'Not provided'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Gender</span>
                      {isEditingProfile ? (
                        <select name="gender" value={editFormData.gender || ''} onChange={handleEditChange} className="edit-input">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="profile-value">{doctor?.gender || 'Not provided'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="profile-section">
                  <h4><i className="fas fa-stethoscope"></i> Professional Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Specialization</span>
                      {isEditingProfile ? (
                        <input type="text" name="specialization" value={editFormData.specialization || ''} onChange={handleEditChange} className="edit-input" />
                      ) : (
                        <span className="profile-value">{doctor?.specialization || 'Not specified'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">License Number</span>
                      {isEditingProfile ? (
                        <input type="text" name="license" value={editFormData.license || ''} onChange={handleEditChange} className="edit-input" />
                      ) : (
                        <span className="profile-value">{doctor?.license || 'Not specified'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Experience</span>
                      {isEditingProfile ? (
                        <input type="text" name="experience" value={editFormData.experience || ''} onChange={handleEditChange} className="edit-input" />
                      ) : (
                        <span className="profile-value">{doctor?.experience || 'Not specified'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Qualification</span>
                      {isEditingProfile ? (
                        <input type="text" name="qualification" value={editFormData.qualification || ''} onChange={handleEditChange} className="edit-input" />
                      ) : (
                        <span className="profile-value">{doctor?.qualification || 'Not specified'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Hospital/Clinic</span>
                      {isEditingProfile ? (
                        <input type="text" name="hospital" value={editFormData.hospital || ''} onChange={handleEditChange} className="edit-input" />
                      ) : (
                        <span className="profile-value">{doctor?.hospital || 'Not specified'}</span>
                      )}
                    </div>
                    <div className="profile-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="profile-label">Bio</span>
                      {isEditingProfile ? (
                        <textarea name="bio" value={editFormData.bio || ''} onChange={handleEditChange} className="edit-input" rows="3" style={{ width: '100%', resize: 'vertical' }} />
                      ) : (
                        <span className="profile-value">{doctor?.bio || 'Not specified'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Practice Information */}
                <div className="profile-section">
                  <h4><i className="fas fa-clinic-medical"></i> Practice Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Consultation Fee</span>
                      {isEditingProfile ? (
                        <input type="text" name="consultationFee" value={editFormData.consultationFee || ''} onChange={handleEditChange} className="edit-input" />
                      ) : (
                        <span className="profile-value">{doctor?.consultationFee || 'Not specified'}</span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Available Days</span>
                      {isEditingProfile ? (
                        <div className="edit-days-grid">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <input 
                                type="checkbox" 
                                name="availableDays" 
                                value={day} 
                                checked={editFormData.availableDays?.includes(day) || false} 
                                onChange={handleEditChange} 
                              />
                              {day.substring(0, 3)}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <span className="profile-value">
                          {doctor?.availableDays?.length > 0 ? doctor.availableDays.join(', ') : 'Not specified'}
                        </span>
                      )}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Available Time</span>
                      {isEditingProfile ? (
                        <input type="text" name="availableTime" value={editFormData.availableTime || ''} onChange={handleEditChange} className="edit-input" placeholder="e.g. 09:00 AM - 05:00 PM" />
                      ) : (
                        <span className="profile-value">{doctor?.availableTime || 'Not specified'}</span>
                      )}
                    </div>
                    <div className="profile-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="profile-label">Clinic Address</span>
                      {isEditingProfile ? (
                        <textarea name="address" value={editFormData.address || ''} onChange={handleEditChange} className="edit-input" rows="2" style={{ width: '100%', resize: 'vertical' }} />
                      ) : (
                        <span className="profile-value">{doctor?.address || 'Not specified'}</span>
                      )}
                    </div>
                  </div>
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