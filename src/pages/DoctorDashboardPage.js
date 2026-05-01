import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { exportAllData } from '../services/exportService';
import { getStoredDoctor, doctorLogout, updateDoctorProfile } from '../services/doctorAuth';
import { getPatients } from '../services/patientService';
import { getPrescriptions } from '../services/prescriptionService';
import MedicineDB from '../components/MedicineDB/MedicineDB';
import PatientDB from '../components/PatientDB/PatientDB';
import PrescriptionGenerator from '../components/Prescription/PrescriptionGenerator';
import LabReport from '../components/LabReport/LabReport';
import DoctorPatients from '../components/DoctorPatients/DoctorPatients';
import ImageUpload from '../components/Common/ImageUpload';
import './DoctorDashboardPage.css';

// Import the Report AI component from the report-ai folder
const ReportAI = () => {
  return (
    <div className="report-ai-container">
      <div className="report-ai-header">
        <h2><i className="fas fa-chart-line"></i> Medical Report Analysis</h2>
        <p>AI-powered analysis of patient medical reports</p>
      </div>
      <div className="report-ai-placeholder">
        <i className="fas fa-robot"></i>
        <h3>Report AI Module</h3>
        <p>Upload reports for AI-powered analysis</p>
        <button className="btn btn-primary" onClick={() => window.location.href = 'http://localhost:8080/'}>
          Launch Report AI
        </button>
      </div>
    </div>
  );
};

const DoctorDashboardPage = () => {
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const [exportingDb, setExportingDb] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    totalPrescriptions: 0,
    recentPrescriptions: []
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [scanId, setScanId] = useState('');
  const [scanResult, setScanResult] = useState(null);

  const handleScanId = async (e) => {
    e.preventDefault();
    if (!scanId.trim()) return;
    try {
      const allPatients = await getPatients();
      const found = allPatients.find(p => p.id === scanId.trim() || p._id === scanId.trim());
      if (found) {
        setScanResult(found);
      } else {
        alert("Patient not found!");
      }
    } catch (err) {
      alert("Error scanning ID");
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const [patients, prescriptions] = await Promise.all([
        getPatients(),
        getPrescriptions()
      ]);
      const sorted = [...prescriptions].sort((a, b) => new Date(b.date) - new Date(a.date));
      setDashboardStats({
        totalPatients: patients.length,
        totalPrescriptions: prescriptions.length,
        recentPrescriptions: sorted.slice(0, 3)
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

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

  useEffect(() => {
    const currentDoctor = getStoredDoctor();
    if (!currentDoctor) {
      navigate('/doctor/auth');
    } else {
      setDoctor(currentDoctor);
      fetchDashboardStats();
    }
  }, [navigate]);

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
    <div className="doctor-dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <i className="fas fa-heartbeat"></i>
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
            className={activeTab === 'mypatients' ? 'active' : ''}
            onClick={() => setActiveTab('mypatients')}
          >
            <i className="fas fa-users"></i> My Patients
          </button>
          <button 
            className={activeTab === 'reportai' ? 'active' : ''}
            onClick={() => setActiveTab('reportai')}
          >
            <i className="fas fa-chart-line"></i> Report AI
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
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Welcome, {doctor.name}</h1>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button className="btn btn-primary" onClick={handleExportFullDatabase} disabled={exportingDb}>
            {exportingDb ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-excel"></i>} Export Database
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-tab">
              <h2>Dashboard Overview</h2>

              {/* Scan Patient ID Section */}
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}><i className="fas fa-qrcode" style={{color: '#2563EB', marginRight: '8px'}}></i> Quick Scan Patient</h3>
                  <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>Enter Patient's QR ID to pull their record instantly</p>
                </div>
                <form onSubmit={handleScanId} style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. 64a8b... or MED-123" 
                    value={scanId}
                    onChange={(e) => setScanId(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', width: '250px' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>Load</button>
                </form>
              </div>

              {scanResult && (
                <div style={{ background: '#EFF6FF', padding: '20px', borderRadius: '12px', marginBottom: '24px', borderLeft: '4px solid #2563EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#1E3A8A' }}>Patient Found: {scanResult.name}</h3>
                      <p style={{ margin: '0 0 10px 0', color: '#3B82F6', fontSize: '0.9rem' }}>ID: {scanResult.id}</p>
                      <p style={{ margin: '4px 0' }}><strong>Blood:</strong> {scanResult.bloodGroup || 'N/A'} | <strong>Age/DOB:</strong> {scanResult.dateOfBirth || 'N/A'}</p>
                      <p style={{ margin: '4px 0' }}><strong>Phone:</strong> {scanResult.phone}</p>
                      <p style={{ margin: '4px 0' }}><strong>Allergies:</strong> {scanResult.allergies || 'None recorded'}</p>
                    </div>
                    <button onClick={() => setScanResult(null)} className="btn btn-outline" style={{ border: 'none', color: '#6B7280' }}><i className="fas fa-times"></i></button>
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                     <button className="btn btn-primary" onClick={() => { setScanResult(null); setActiveTab('prescription'); }}>Write Prescription</button>
                     <button className="btn btn-outline" onClick={() => { setScanResult(null); setActiveTab('patients'); }}>View Full DB</button>
                  </div>
                </div>
              )}

              <div className="stats-grid">
                <div className="stat-card">
                  <i className="fas fa-users"></i>
                  <h3>Total Patients</h3>
                  <p>{loadingStats ? <i className="fas fa-spinner fa-spin"></i> : dashboardStats.totalPatients}</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-prescription"></i>
                  <h3>Prescriptions Issued</h3>
                  <p>{loadingStats ? <i className="fas fa-spinner fa-spin"></i> : dashboardStats.totalPrescriptions}</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-user-md"></i>
                  <h3>Specialization</h3>
                  <p style={{ fontSize: '0.9rem' }}>{doctor.specialization || 'Not set'}</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-clock"></i>
                  <h3>Available Hours</h3>
                  <p style={{ fontSize: '0.85rem' }}>{doctor.availableTime || 'Not set'}</p>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Prescriptions</h3>
                <div className="activity-list">
                  {loadingStats ? (
                    <div className="activity-item"><i className="fas fa-spinner fa-spin"></i><div><p>Loading activity...</p></div></div>
                  ) : dashboardStats.recentPrescriptions.length === 0 ? (
                    <div className="activity-item">
                      <i className="fas fa-prescription"></i>
                      <div><p>No prescriptions yet</p><span>Generate your first prescription</span></div>
                    </div>
                  ) : (
                    dashboardStats.recentPrescriptions.map((rx, i) => (
                      <div key={rx._id || i} className="activity-item">
                        <i className="fas fa-prescription"></i>
                        <div>
                          <p>Prescription #{rx.prescriptionId} — {rx.diagnosis || 'No diagnosis'}</p>
                          <span>{rx.date ? new Date(rx.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date'}</span>
                        </div>
                      </div>
                    ))
                  )}
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
          {activeTab === 'reportai' && <ReportAI />}
          
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