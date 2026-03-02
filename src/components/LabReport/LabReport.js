import React, { useState } from 'react';
import './LabReport.css';

const LabReport = () => {
  const [patients] = useState([
    { id: 'PAT001', name: 'John Doe' },
    { id: 'PAT002', name: 'Sarah Smith' },
    { id: 'PAT003', name: 'Robert Johnson' },
  ]);

  const [labReports, setLabReports] = useState([
    {
      id: 'LAB001',
      patientId: 'PAT001',
      patientName: 'John Doe',
      testName: 'Complete Blood Count',
      testDate: '2026-02-28',
      status: 'Completed',
      results: 'Normal',
      notes: 'All parameters within normal range'
    },
    {
      id: 'LAB002',
      patientId: 'PAT002',
      patientName: 'Sarah Smith',
      testName: 'Lipid Profile',
      testDate: '2026-02-27',
      status: 'Pending',
      results: 'Awaiting',
      notes: 'Fasting required'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [newReport, setNewReport] = useState({
    patientId: '',
    testName: '',
    testDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    results: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReport({
      ...newReport,
      [name]: value
    });
  };

  const handlePatientSelect = (e) => {
    const patientId = e.target.value;
    setSelectedPatient(patientId);
    setNewReport({
      ...newReport,
      patientId: patientId
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedPatientObj = patients.find(p => p.id === newReport.patientId);
    
    const reportToAdd = {
      id: `LAB${String(labReports.length + 1).padStart(3, '0')}`,
      ...newReport,
      patientName: selectedPatientObj?.name || ''
    };

    setLabReports([...labReports, reportToAdd]);
    setShowModal(false);
    setNewReport({
      patientId: '',
      testName: '',
      testDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      results: '',
      notes: ''
    });
    setSelectedPatient('');
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Completed': return 'status-completed';
      case 'Pending': return 'status-pending';
      case 'In Progress': return 'status-progress';
      default: return 'status-pending';
    }
  };

  return (
    <div className="lab-report-container">
      <div className="lab-report-header">
        <h2><i className="fas fa-flask"></i> Lab Reports</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> New Lab Report
        </button>
      </div>

      <div className="lab-report-filters">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by patient or test name..." 
          />
          <i className="fas fa-search"></i>
        </div>
        <select className="filter-select">
          <option value="">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
        </select>
      </div>

      <div className="lab-report-table-container">
        <table className="lab-report-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Patient Name</th>
              <th>Test Name</th>
              <th>Test Date</th>
              <th>Status</th>
              <th>Results</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {labReports.map(report => (
              <tr key={report.id}>
                <td><strong>{report.id}</strong></td>
                <td>{report.patientName}</td>
                <td>{report.testName}</td>
                <td>{report.testDate}</td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(report.status)}`}>
                    {report.status}
                  </span>
                </td>
                <td>{report.results}</td>
                <td className="actions">
                  <button className="action-btn view-btn" title="View Report">
                    <i className="fas fa-eye"></i>
                  </button>
                  <button className="action-btn edit-btn" title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="action-btn delete-btn" title="Delete">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Lab Report Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content lab-modal">
            <div className="modal-header">
              <h3><i className="fas fa-flask"></i> Create New Lab Report</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Patient <span className="required">*</span></label>
                  <select 
                    name="patientId"
                    value={selectedPatient}
                    onChange={handlePatientSelect}
                    required
                  >
                    <option value="">Select a patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group half-width">
                    <label>Test Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="testName"
                      value={newReport.testName}
                      onChange={handleInputChange}
                      placeholder="e.g., Complete Blood Count"
                      required
                    />
                  </div>

                  <div className="form-group half-width">
                    <label>Test Date <span className="required">*</span></label>
                    <input
                      type="date"
                      name="testDate"
                      value={newReport.testDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group half-width">
                    <label>Status</label>
                    <select name="status" value={newReport.status} onChange={handleInputChange}>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group half-width">
                    <label>Results</label>
                    <input
                      type="text"
                      name="results"
                      value={newReport.results}
                      onChange={handleInputChange}
                      placeholder="e.g., Normal, Abnormal"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes / Instructions</label>
                  <textarea
                    name="notes"
                    value={newReport.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes or instructions..."
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabReport;