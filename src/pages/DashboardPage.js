import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard/Dashboard';
import MedicineDB from '../components/MedicineDB/MedicineDB';
import PatientDB from '../components/PatientDB/PatientDB';
import PrescriptionGenerator from '../components/Prescription/PrescriptionGenerator';
import Chatbot from '../components/Chatbot/Chatbot';
import './DashboardPage.css';

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <Dashboard>
        <Routes>
          <Route path="/" element={<Navigate to="overview" />} />
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="medicine-db" element={<MedicineDB />} />
          <Route path="patient-db" element={<PatientDB />} />
          <Route path="prescription" element={<PrescriptionGenerator />} />
        </Routes>
      </Dashboard>
      <Chatbot />
    </div>
  );
};
// Dashboard Overview Component
const DashboardOverview = () => {
  const stats = [
    { title: 'Total Patients', value: '1,247', icon: 'fas fa-user-injured', color: '#4CAF50', change: '+12%' },
    { title: 'Today\'s Appointments', value: '18', icon: 'fas fa-calendar-check', color: '#2196F3', change: '+2' },
    { title: 'Pending Prescriptions', value: '7', icon: 'fas fa-prescription', color: '#FF9800', change: '-3' },
    { title: 'Available Medicines', value: '156', icon: 'fas fa-pills', color: '#9C27B0', change: '+8' }
  ];

  const recentPatients = [
    { id: 'P1001', name: 'John Doe', time: '09:30 AM', status: 'Completed', diagnosis: 'Common Cold' },
    { id: 'P1002', name: 'Sarah Smith', time: '10:15 AM', status: 'In Progress', diagnosis: 'Annual Checkup' },
    { id: 'P1003', name: 'Robert Johnson', time: '11:00 AM', status: 'Waiting', diagnosis: 'Blood Pressure' },
    { id: 'P1004', name: 'Emily Davis', time: '01:30 PM', status: 'Scheduled', diagnosis: 'Vaccination' },
    { id: 'P1005', name: 'Michael Brown', time: '02:45 PM', status: 'Scheduled', diagnosis: 'Follow-up' }
  ];

  return (
    <div className="dashboard-overview">
      <div className="welcome-section">
        <h1>Welcome Back, Dr. Smith!</h1>
        <p>Here's what's happening with your practice today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ background: stat.color }}>
              <i className={stat.icon}></i>
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
            <div className="stat-change" style={{ color: stat.change.startsWith('+') ? '#4CAF50' : '#F44336' }}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="recent-patients card">
          <div className="card-header">
            <h3><i className="fas fa-clock"></i> Today's Schedule</h3>
            <button className="btn-add-appointment">
              <i className="fas fa-calendar-plus"></i> Add Appointment
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Diagnosis</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map(patient => (
                  <tr key={patient.id}>
                    <td><strong>{patient.id}</strong></td>
                    <td>{patient.name}</td>
                    <td>{patient.time}</td>
                    <td>
                      <span className={`status-badge status-${patient.status.toLowerCase().replace(' ', '-')}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td>{patient.diagnosis}</td>
                    <td>
                      <button className="btn-view-action">
                        <i className="fas fa-eye"></i> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="quick-actions card">
            <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn primary">
                <i className="fas fa-user-plus"></i> New Patient
              </button>
              <button className="action-btn success">
                <i className="fas fa-prescription"></i> New Prescription
              </button>
              <button className="action-btn warning">
                <i className="fas fa-file-medical"></i> Medical Report
              </button>
              <button className="action-btn info">
                <i className="fas fa-notes-medical"></i> Add Note
              </button>
            </div>
          </div>

          <div className="system-alerts card">
            <h3><i className="fas fa-bell"></i> System Alerts</h3>
            <div className="alerts-list">
              <div className="alert-item info">
                <i className="fas fa-info-circle"></i>
                <div>
                  <strong>System Update</strong>
                  <p>Scheduled maintenance tonight at 2 AM</p>
                </div>
              </div>
              <div className="alert-item warning">
                <i className="fas fa-exclamation-triangle"></i>
                <div>
                  <strong>Low Stock</strong>
                  <p>Paracetamol running low (15 units left)</p>
                </div>
              </div>
              <div className="alert-item success">
                <i className="fas fa-check-circle"></i>
                <div>
                  <strong>Backup Complete</strong>
                  <p>Patient data backup completed successfully</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;