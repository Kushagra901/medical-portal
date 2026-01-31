import React, { useState } from 'react';
import './PrescriptionGenerator.css';

const PrescriptionGenerator = () => {
    const [patients] = useState([
        { id: "P001", name: "John Doe" },
        { id: "P002", name: "Jane Smith" },
        { id: "P003", name: "Robert Johnson" },
    ]);

    const [medicines] = useState([
        { name: "Paracetamol", use: "Fever, Pain relief", dosage: "500mg, 1 tab every 6 hours" },
        { name: "Amoxicillin", use: "Bacterial infections", dosage: "500mg, 1 tab every 8 hours" },
        { name: "Ibuprofen", use: "Inflammation, Pain relief", dosage: "400mg, 1 tab every 8 hours" },
        { name: "Cetirizine", use: "Allergies, Hay fever", dosage: "10mg, 1 tab daily" },
    ]);

    const [prescription, setPrescription] = useState({
        patientId: '',
        diagnosis: '',
        medicines: [],
        notes: ''
    });

    const [selectedMedicine, setSelectedMedicine] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const diagnosisMapping = {
        "fever": ["Paracetamol", "Ibuprofen"],
        "cold": ["Paracetamol", "Cetirizine"],
        "infection": ["Amoxicillin"],
        "pain": ["Paracetamol", "Ibuprofen"],
        "allergy": ["Cetirizine"],
        "headache": ["Paracetamol"],
    };

    const handleDiagnosisChange = (e) => {
        const diagnosis = e.target.value;
        setPrescription({ ...prescription, diagnosis });

        if (diagnosis) {
            const keywords = diagnosis.toLowerCase().split(' ');
            const suggested = new Set();
            
            keywords.forEach(keyword => {
                if (diagnosisMapping[keyword]) {
                    diagnosisMapping[keyword].forEach(med => suggested.add(med));
                }
            });

            setSuggestions(Array.from(suggested));
        } else {
            setSuggestions([]);
        }
    };

    const handleAddMedicine = () => {
        if (selectedMedicine && !prescription.medicines.find(m => m.name === selectedMedicine)) {
            const medicine = medicines.find(m => m.name === selectedMedicine);
            if (medicine) {
                setPrescription({
                    ...prescription,
                    medicines: [...prescription.medicines, medicine]
                });
                setSelectedMedicine('');
            }
        }
    };

    const handleAddSuggestedMedicine = (medicineName) => {
        const medicine = medicines.find(m => m.name === medicineName);
        if (medicine && !prescription.medicines.find(m => m.name === medicineName)) {
            setPrescription({
                ...prescription,
                medicines: [...prescription.medicines, medicine]
            });
        }
    };

    const handleRemoveMedicine = (index) => {
        const newMedicines = [...prescription.medicines];
        newMedicines.splice(index, 1);
        setPrescription({ ...prescription, medicines: newMedicines });
    };

    const handleGeneratePrescription = () => {
        if (!prescription.patientId) {
            alert('Please select a patient');
            return;
        }

        if (prescription.medicines.length === 0) {
            alert('Please add at least one medicine to the prescription');
            return;
        }

        alert('Prescription generated! Check console for details.');
        console.log('Prescription Data:', prescription);
        
        // In a real app, this would generate a PDF or send to printer
        window.print();
    };

    const handleClearPrescription = () => {
        setPrescription({
            patientId: '',
            diagnosis: '',
            medicines: [],
            notes: ''
        });
        setSuggestions([]);
        setSelectedMedicine('');
    };

    return (
        <section id="prescription" className="section">
            <h2><i className="fas fa-prescription"></i> Prescription Generator</h2>
            <div className="card">
                <div className="prescription-container">
                    <div className="prescription-form">
                        <h3>Create New Prescription</h3>
                        
                        <div className="form-group">
                            <label><i className="fas fa-user"></i> Select Patient</label>
                            <select 
                                className="form-control"
                                value={prescription.patientId}
                                onChange={(e) => setPrescription({...prescription, patientId: e.target.value})}
                            >
                                <option value="">Select a patient</option>
                                {patients.map(patient => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.name} ({patient.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label><i className="fas fa-stethoscope"></i> Diagnosis</label>
                            <textarea 
                                className="form-control" 
                                placeholder="Enter diagnosis..."
                                value={prescription.diagnosis}
                                onChange={handleDiagnosisChange}
                            />
                        </div>
                        
                        {suggestions.length > 0 && (
                            <div className="form-group">
                                <label><i className="fas fa-lightbulb"></i> Suggested Medicines</label>
                                <div className="suggestions-box">
                                    {suggestions.map((medicineName, index) => (
                                        <div key={index} className="suggestion-item">
                                            <span>{medicineName}</span>
                                            <button 
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleAddSuggestedMedicine(medicineName)}
                                            >
                                                <i className="fas fa-plus"></i> Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label><i className="fas fa-list-alt"></i> Prescription Medicines</label>
                            <div className="medicines-list">
                                {prescription.medicines.length === 0 ? (
                                    <p className="no-medicines">No medicines added yet</p>
                                ) : (
                                    prescription.medicines.map((medicine, index) => (
                                        <div key={index} className="medicine-item">
                                            <div>
                                                <strong>{medicine.name}</strong><br/>
                                                <small>{medicine.dosage}</small>
                                            </div>
                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={() => handleRemoveMedicine(index)}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="medicine-selection">
                                <select 
                                    className="form-control"
                                    value={selectedMedicine}
                                    onChange={(e) => setSelectedMedicine(e.target.value)}
                                >
                                    <option value="">Select medicine to add</option>
                                    {medicines.map((medicine, index) => (
                                        <option key={index} value={medicine.name}>
                                            {medicine.name} - {medicine.use}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={handleAddMedicine}
                                >
                                    <i className="fas fa-plus-circle"></i> Add
                                </button>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label><i className="fas fa-notes-medical"></i> Additional Notes</label>
                            <textarea 
                                className="form-control" 
                                placeholder="Additional instructions..."
                                value={prescription.notes}
                                onChange={(e) => setPrescription({...prescription, notes: e.target.value})}
                            />
                        </div>
                        
                        <div className="form-actions">
                            <button 
                                className="btn btn-primary"
                                onClick={handleGeneratePrescription}
                            >
                                <i className="fas fa-file-pdf"></i> Generate Prescription
                            </button>
                            <button 
                                className="btn btn-outline"
                                onClick={handleClearPrescription}
                            >
                                <i className="fas fa-redo"></i> Clear
                            </button>
                        </div>
                    </div>
                    
                    <div className="prescription-preview">
                        <h3>Prescription Preview</h3>
                        <div className="preview-card">
                            <div className="preview-header">
                                <div className="clinic-info">
                                    <h4><i className="fas fa-heartbeat"></i> MediCare Clinic</h4>
                                    <p>123 Health Street, Medical City</p>
                                    <p>Phone: (123) 456-7890</p>
                                </div>
                                <div className="prescription-date">
                                    <p>Date: <span>{new Date().toLocaleDateString()}</span></p>
                                </div>
                            </div>
                            <div className="preview-patient">
                                <h5>Patient Information</h5>
                                <p>
                                    <strong>Name:</strong> {
                                        prescription.patientId 
                                            ? patients.find(p => p.id === prescription.patientId)?.name 
                                            : '----------'
                                    }
                                </p>
                                <p><strong>Diagnosis:</strong> {prescription.diagnosis || '----------'}</p>
                            </div>
                            <div className="preview-medicines">
                                <h5>Prescribed Medicines</h5>
                                <ul>
                                    {prescription.medicines.length === 0 ? (
                                        <li>No medicines added yet</li>
                                    ) : (
                                        prescription.medicines.map((medicine, index) => (
                                            <li key={index}>
                                                <strong>{medicine.name}</strong>: {medicine.dosage}
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                            <div className="preview-notes">
                                <h5>Additional Notes</h5>
                                <p>{prescription.notes || 'No additional notes'}</p>
                            </div>
                            <div className="preview-footer">
                                <div className="doctor-signature">
                                    <p>___________________</p>
                                    <p><strong>Dr. John Smith</strong></p>
                                    <p>MBBS, MD</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrescriptionGenerator;