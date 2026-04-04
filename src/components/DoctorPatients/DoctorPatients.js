import React, { useState, useEffect } from 'react';
import { getMyPatients, searchMyPatients } from '../../services/patientService';
import './DoctorPatients.css';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await getMyPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchPatients();
      return;
    }
    
    try {
      const results = await searchMyPatients(searchTerm);
      setPatients(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="doctor-patients">
      <div className="patients-header">
        <h2><i className="fas fa-users"></i> My Patients</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearch}>
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading patients...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="no-patients">
          <i className="fas fa-user-plus"></i>
          <p>No patients assigned yet</p>
          <span>Patients will appear here once assigned</span>
        </div>
      ) : (
        <div className="patients-grid">
          {patients.map(patient => (
            <div key={patient._id} className="patient-card">
              <div className="patient-avatar">
                {patient.profileImage ? (
                  <img src={patient.profileImage} alt={patient.name} />
                ) : (
                  <div className="avatar-initials">
                    {getInitials(patient.name)}
                  </div>
                )}
              </div>
              <div className="patient-info">
                <h3>{patient.name}</h3>
                <p><i className="fas fa-envelope"></i> {patient.email}</p>
                <p><i className="fas fa-phone"></i> {patient.phone || 'Not provided'}</p>
                {patient.bloodGroup && (
                  <p><i className="fas fa-tint"></i> Blood: {patient.bloodGroup}</p>
                )}
                <p><i className="fas fa-calendar"></i> Last Visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Not yet'}</p>
              </div>
              <div className="patient-actions">
                <button 
                  className="view-btn" 
                  onClick={() => setSelectedPatient(patient)}
                  title="View Details"
                >
                  <i className="fas fa-eye"></i> View
                </button>
                <button 
                  className="prescription-btn"
                  title="Create Prescription"
                  onClick={() => {/* Navigate to prescription with this patient */}}
                >
                  <i className="fas fa-prescription"></i> Prescribe
                </button>
                <button 
                  className="note-btn"
                  title="Add Note"
                >
                  <i className="fas fa-notes-medical"></i> Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="patient-modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="patient-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-user-circle"></i> Patient Details</h3>
              <button className="close-btn" onClick={() => setSelectedPatient(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="patient-detail-row">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">{selectedPatient.name}</span>
              </div>
              <div className="patient-detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedPatient.email}</span>
              </div>
              <div className="patient-detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedPatient.phone || 'Not provided'}</span>
              </div>
              <div className="patient-detail-row">
                <span className="detail-label">Date of Birth:</span>
                <span className="detail-value">{selectedPatient.dateOfBirth || 'Not provided'}</span>
              </div>
              <div className="patient-detail-row">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">{selectedPatient.gender || 'Not provided'}</span>
              </div>
              <div className="patient-detail-row">
                <span className="detail-label">Blood Group:</span>
                <span className="detail-value">{selectedPatient.bloodGroup || 'Not recorded'}</span>
              </div>
              <div className="patient-detail-row">
                <span className="detail-label">Height/Weight:</span>
                <span className="detail-value">{selectedPatient.height || '—'} cm / {selectedPatient.weight || '—'} kg</span>
              </div>
              <div className="patient-detail-row">
                <span className="detail-label">Allergies:</span>
                <span className="detail-value">{selectedPatient.allergies || 'None recorded'}</span>
              </div>
              <div className="patient-detail-row">
                <span className="detail-label">Emergency Contact:</span>
                <span className="detail-value">{selectedPatient.emergencyContact || 'Not provided'}</span>
              </div>
              <div className="patient-detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedPatient.address || 'Not provided'}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedPatient(null)}>
                Close
              </button>
              <button className="btn btn-success">
                <i className="fas fa-prescription"></i> New Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;