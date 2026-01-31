import React, { useState } from 'react';
import './PatientDB.css';

const PatientDB = () => {
    const [patients, setPatients] = useState([
        { id: "P001", name: "John Doe", diagnosis: "Common Cold", medicine: "Paracetamol", visit: "2024-01-15" },
        { id: "P002", name: "Jane Smith", diagnosis: "Bacterial Infection", medicine: "Amoxicillin", visit: "2024-01-14" },
        { id: "P003", name: "Robert Johnson", diagnosis: "Arthritis Pain", medicine: "Ibuprofen", visit: "2024-01-13" },
    ]);
    
    const [showModal, setShowModal] = useState(false);
    const [newPatient, setNewPatient] = useState({ name: '', diagnosis: '', medicine: '' });

    const handleAddPatient = () => {
        if (!newPatient.name) {
            alert('Please enter patient name');
            return;
        }

        const patientId = `P${String(patients.length + 1).padStart(3, '0')}`;
        const today = new Date().toISOString().split('T')[0];

        const patientToAdd = {
            id: patientId,
            name: newPatient.name,
            diagnosis: newPatient.diagnosis || 'Not specified',
            medicine: newPatient.medicine || 'Not specified',
            visit: today
        };

        setPatients([...patients, patientToAdd]);
        setNewPatient({ name: '', diagnosis: '', medicine: '' });
        setShowModal(false);
    };

    return (
        <section id="patient-db" className="section">
            <h2><i className="fas fa-users"></i> Patient Database</h2>
            <div className="card">
                <div className="card-header">
                    <h3>Patient Records</h3>
                    <button className="btn btn-success" onClick={() => setShowModal(true)}>
                        <i className="fas fa-user-plus"></i> Add Patient
                    </button>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient ID</th>
                                <th>Patient Name</th>
                                <th>Last Diagnosis</th>
                                <th>Last Medicine</th>
                                <th>Last Visit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map(patient => (
                                <tr key={patient.id}>
                                    <td><strong>{patient.id}</strong></td>
                                    <td>{patient.name}</td>
                                    <td>{patient.diagnosis}</td>
                                    <td>{patient.medicine}</td>
                                    <td>{patient.visit}</td>
                                    <td className="actions">
                                        <button className="action-btn view-btn">
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                        <button className="action-btn edit-btn">
                                            <i className="fas fa-edit"></i> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal show">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3><i className="fas fa-user-plus"></i> Add New Patient</h3>
                            <span className="close-modal" onClick={() => setShowModal(false)}>&times;</span>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Patient Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter patient full name"
                                    value={newPatient.name}
                                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Initial Diagnosis</label>
                                <textarea
                                    className="form-control"
                                    placeholder="Enter initial diagnosis"
                                    value={newPatient.diagnosis}
                                    onChange={(e) => setNewPatient({...newPatient, diagnosis: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Initial Medicine</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter initial medicine"
                                    value={newPatient.medicine}
                                    onChange={(e) => setNewPatient({...newPatient, medicine: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-success" onClick={handleAddPatient}>
                                Save Patient
                            </button>
                            <button className="btn btn-outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PatientDB;