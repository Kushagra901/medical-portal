import React, { useState, useEffect } from 'react';
import { getPatients } from '../../services/patientService';
import { getMedicines, createMedicine } from '../../services/medicineService';
import { createPrescription } from '../../services/prescriptionService';
import './PrescriptionGenerator.css';

const PrescriptionGenerator = () => {
    const [patients, setPatients] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [prescription, setPrescription] = useState({
        patientId: '',
        // Manual fields - not auto-populated
        age: '',
        gender: '',
        weight: '',
        diagnosis: '',
        medicines: [],
        notes: ''
    });

    const [selectedMedicine, setSelectedMedicine] = useState('');
    const [showCustomMedicine, setShowCustomMedicine] = useState(false);
    const [customMedicine, setCustomMedicine] = useState({
        name: '',
        dosage: '',
        duration: '',
        instructions: ''
    });
    const [suggestions, setSuggestions] = useState([]);

    // Load patients and medicines from MongoDB
    useEffect(() => {
        fetchPatients();
        fetchMedicines();
    }, []);

    const fetchPatients = async () => {
        try {
            const data = await getPatients();
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            // Fallback mock data if API fails
            setPatients([
                { id: "P001", name: "John Doe" },
                { id: "P002", name: "Jane Smith" },
            ]);
        }
    };

    const fetchMedicines = async () => {
        try {
            const data = await getMedicines();
            setMedicines(data);
        } catch (error) {
            console.error('Error fetching medicines:', error);
            // Fallback mock data if API fails
            setMedicines([
                { id: 1, name: "Paracetamol", dosage: "500mg" },
                { id: 2, name: "Amoxicillin", dosage: "500mg" },
            ]);
        }
    };

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

            // Also check medicine database
            medicines.forEach(medicine => {
                if (medicine.use?.toLowerCase().includes(diagnosis.toLowerCase()) ||
                    medicine.name.toLowerCase().includes(diagnosis.toLowerCase())) {
                    suggested.add(medicine.name);
                }
            });

            setSuggestions(Array.from(suggested));
        } else {
            setSuggestions([]);
        }
    };

    const handleAddMedicine = () => {
        if (selectedMedicine) {
            const medicine = medicines.find(m => m.name === selectedMedicine);
            if (medicine && !prescription.medicines.find(m => m.name === medicine.name)) {
                setPrescription({
                    ...prescription,
                    medicines: [...prescription.medicines, {
                        name: medicine.name,
                        dosage: medicine.dosage || '',
                        duration: '',
                        instructions: '',
                        medicineId: medicine._id || medicine.id
                    }]
                });
                setSelectedMedicine('');
            }
        }
    };

    const handleAddCustomMedicine = async () => {
        if (customMedicine.name && customMedicine.dosage) {
            try {
                // Save to MongoDB first
                const newMedicine = await createMedicine({
                    name: customMedicine.name,
                    dosage: customMedicine.dosage,
                    use: 'Custom added medicine'
                });

                // Add to prescription
                setPrescription({
                    ...prescription,
                    medicines: [...prescription.medicines, {
                        name: customMedicine.name,
                        dosage: customMedicine.dosage,
                        duration: customMedicine.duration || '',
                        instructions: customMedicine.instructions || '',
                        medicineId: newMedicine._id,
                        isCustom: true
                    }]
                });

                // Refresh medicines list
                fetchMedicines();
                
                setCustomMedicine({ name: '', dosage: '', duration: '', instructions: '' });
                setShowCustomMedicine(false);
            } catch (error) {
                console.error('Error saving custom medicine:', error);
                alert('Failed to save medicine. Please try again.');
            }
        } else {
            alert('Please enter at least medicine name and dosage');
        }
    };

    const handleAddSuggestedMedicine = (medicineName) => {
        const medicine = medicines.find(m => m.name === medicineName);
        if (medicine && !prescription.medicines.find(m => m.name === medicineName)) {
            setPrescription({
                ...prescription,
                medicines: [...prescription.medicines, {
                    name: medicine.name,
                    dosage: medicine.dosage || '',
                    duration: '',
                    instructions: '',
                    medicineId: medicine._id || medicine.id
                }]
            });
        }
    };

    const handleRemoveMedicine = (index) => {
        const newMedicines = [...prescription.medicines];
        newMedicines.splice(index, 1);
        setPrescription({ ...prescription, medicines: newMedicines });
    };

    const handleMedicineDetailChange = (index, field, value) => {
        const updatedMedicines = [...prescription.medicines];
        updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
        setPrescription({ ...prescription, medicines: updatedMedicines });
    };

    const handleGeneratePrescription = async () => {
        if (!prescription.patientId) {
            alert('Please select a patient');
            return;
        }

        setLoading(true);

        try {
            // Prepare prescription data for MongoDB
            const prescriptionData = {
                patientId: prescription.patientId,
                diagnosis: prescription.diagnosis,
                patientAge: prescription.age,
                patientGender: prescription.gender,
                patientWeight: prescription.weight,
                medicines: prescription.medicines.map(med => ({
                    name: med.name,
                    dosage: med.dosage,
                    duration: med.duration,
                    instructions: med.instructions,
                    medicineId: med.medicineId
                })),
                notes: prescription.notes
            };

            // Save to MongoDB
            const savedPrescription = await createPrescription(prescriptionData);

            // Generate print view
            const printWindow = window.open('', '_blank');
            const patient = patients.find(p => p.id === prescription.patientId);
            
            const currentDate = new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Prescription - ${patient.name}</title>
                        <style>
                            body { font-family: 'Arial', sans-serif; margin: 40px; }
                            .header { text-align: center; border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
                            .patient-info { margin-bottom: 30px; padding: 20px; background: #F8FAFC; border-radius: 10px; }
                            .medicines { margin-bottom: 30px; }
                            .medicine-item { margin-bottom: 15px; padding: 15px; background: #F8FAFC; border-radius: 8px; border-left: 4px solid #2563EB; }
                            .footer { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; text-align: right; }
                            .label { font-weight: bold; color: #64748B; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>MediCare Clinic</h1>
                            <p>123 Health Street, Medical City</p>
                            <p>Phone: (123) 456-7890</p>
                        </div>
                        
                        <div class="patient-info">
                            <h2>Prescription #${savedPrescription.prescriptionId || 'NEW'}</h2>
                            <p><span class="label">Date:</span> ${currentDate}</p>
                            <p><span class="label">Patient:</span> ${patient.name} (${patient.id})</p>
                            ${prescription.age ? `<p><span class="label">Age:</span> ${prescription.age}</p>` : ''}
                            ${prescription.gender ? `<p><span class="label">Gender:</span> ${prescription.gender}</p>` : ''}
                            ${prescription.weight ? `<p><span class="label">Weight:</span> ${prescription.weight}</p>` : ''}
                            ${prescription.diagnosis ? `<p><span class="label">Diagnosis:</span> ${prescription.diagnosis}</p>` : ''}
                        </div>
                        
                        <div class="medicines">
                            <h3>Medications:</h3>
                            ${prescription.medicines.map(med => `
                                <div class="medicine-item">
                                    <p><strong>${med.name}</strong> - ${med.dosage}</p>
                                    ${med.duration ? `<p>Duration: ${med.duration}</p>` : ''}
                                    ${med.instructions ? `<p>Instructions: ${med.instructions}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        
                        ${prescription.notes ? `
                        <div class="notes">
                            <h3>Additional Notes:</h3>
                            <p>${prescription.notes}</p>
                        </div>
                        ` : ''}
                        
                        <div class="footer">
                            <p>___________________</p>
                            <p><strong>Dr. John Smith</strong></p>
                            <p>MBBS, MD</p>
                        </div>
                    </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 500);

            // Clear form after successful generation
            handleClearPrescription();
            
        } catch (error) {
            console.error('Error generating prescription:', error);
            alert('Failed to generate prescription. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearPrescription = () => {
        setPrescription({
            patientId: '',
            age: '',
            gender: '',
            weight: '',
            diagnosis: '',
            medicines: [],
            notes: ''
        });
        setSuggestions([]);
        setSelectedMedicine('');
        setShowCustomMedicine(false);
    };

    const selectedPatient = patients.find(p => p.id === prescription.patientId);

    return (
        <div className="prescription-generator">
            <h2><i className="fas fa-prescription"></i> Prescription Generator</h2>
            
            <div className="prescription-layout">
                {/* Left Column - Form */}
                <div className="prescription-form-container">
                    <div className="form-section">
                        <h3>Patient Information</h3>
                        
                        <div className="form-group">
                            <label>Select Patient <span className="required">*</span></label>
                            <select
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

                        {/* Manual Patient Details - Not auto-populated */}
                        <div className="patient-details-manual">
                            <h4>Patient Details (Optional)</h4>
                            <div className="detail-row">
                                <div className="detail-field">
                                    <label>Age</label>
                                    <input
                                        type="text"
                                        value={prescription.age}
                                        onChange={(e) => setPrescription({...prescription, age: e.target.value})}
                                        placeholder="e.g., 45"
                                    />
                                </div>
                                <div className="detail-field">
                                    <label>Gender</label>
                                    <select
                                        value={prescription.gender}
                                        onChange={(e) => setPrescription({...prescription, gender: e.target.value})}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="detail-field">
                                    <label>Weight</label>
                                    <input
                                        type="text"
                                        value={prescription.weight}
                                        onChange={(e) => setPrescription({...prescription, weight: e.target.value})}
                                        placeholder="e.g., 75 kg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Diagnosis</label>
                            <textarea
                                value={prescription.diagnosis}
                                onChange={handleDiagnosisChange}
                                placeholder="Enter diagnosis (optional)..."
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Medications</h3>
                        
                        {suggestions.length > 0 && (
                            <div className="suggestions-box">
                                <label>Suggested Medicines:</label>
                                <div className="suggestions-list">
                                    {suggestions.map((medicineName, index) => (
                                        <button
                                            key={index}
                                            className="suggestion-chip"
                                            onClick={() => handleAddSuggestedMedicine(medicineName)}
                                            type="button"
                                        >
                                            <i className="fas fa-plus-circle"></i> {medicineName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="medicines-list">
                            {prescription.medicines.length === 0 ? (
                                <p className="no-medicines">No medicines added yet</p>
                            ) : (
                                prescription.medicines.map((medicine, index) => (
                                    <div key={index} className="medicine-item">
                                        <div className="medicine-header">
                                            <div className="medicine-name">
                                                <strong>{medicine.name}</strong>
                                                {medicine.isCustom && <span className="custom-badge">Custom</span>}
                                            </div>
                                            <button 
                                                className="remove-btn"
                                                onClick={() => handleRemoveMedicine(index)}
                                                type="button"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                        <div className="medicine-details">
                                            <input
                                                type="text"
                                                value={medicine.dosage}
                                                onChange={(e) => handleMedicineDetailChange(index, 'dosage', e.target.value)}
                                                placeholder="Dosage"
                                                className="detail-input small"
                                            />
                                            <input
                                                type="text"
                                                value={medicine.duration || ''}
                                                onChange={(e) => handleMedicineDetailChange(index, 'duration', e.target.value)}
                                                placeholder="Duration"
                                                className="detail-input small"
                                            />
                                            <input
                                                type="text"
                                                value={medicine.instructions || ''}
                                                onChange={(e) => handleMedicineDetailChange(index, 'instructions', e.target.value)}
                                                placeholder="Instructions"
                                                className="detail-input large"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {!showCustomMedicine ? (
                            <div className="add-medicine-section">
                                <div className="medicine-selection">
                                    <select
                                        value={selectedMedicine}
                                        onChange={(e) => setSelectedMedicine(e.target.value)}
                                        className="medicine-select"
                                    >
                                        <option value="">Select from medicine DB</option>
                                        {medicines.map(medicine => (
                                            <option key={medicine._id || medicine.id} value={medicine.name}>
                                                {medicine.name} - {medicine.dosage || 'No dosage'}
                                            </option>
                                        ))}
                                    </select>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={handleAddMedicine}
                                        type="button"
                                    >
                                        <i className="fas fa-plus"></i> Add
                                    </button>
                                </div>
                                <button 
                                    className="btn btn-outline custom-medicine-btn"
                                    onClick={() => setShowCustomMedicine(true)}
                                    type="button"
                                >
                                    <i className="fas fa-pen"></i> Add Custom Medicine (Saves to DB)
                                </button>
                            </div>
                        ) : (
                            <div className="custom-medicine-form">
                                <h4>Add New Medicine to Database</h4>
                                <p className="form-hint">This medicine will be saved to MongoDB for future use</p>
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="Medicine Name *"
                                        value={customMedicine.name}
                                        onChange={(e) => setCustomMedicine({...customMedicine, name: e.target.value})}
                                        className="form-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Dosage * (e.g., 500mg)"
                                        value={customMedicine.dosage}
                                        onChange={(e) => setCustomMedicine({...customMedicine, dosage: e.target.value})}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="Duration (e.g., 7 days)"
                                        value={customMedicine.duration}
                                        onChange={(e) => setCustomMedicine({...customMedicine, duration: e.target.value})}
                                        className="form-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Instructions"
                                        value={customMedicine.instructions}
                                        onChange={(e) => setCustomMedicine({...customMedicine, instructions: e.target.value})}
                                        className="form-input"
                                    />
                                </div>
                                <div className="custom-medicine-actions">
                                    <button 
                                        className="btn btn-success"
                                        onClick={handleAddCustomMedicine}
                                        type="button"
                                        disabled={loading}
                                    >
                                        {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>} Save & Add
                                    </button>
                                    <button 
                                        className="btn btn-outline"
                                        onClick={() => setShowCustomMedicine(false)}
                                        type="button"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-section">
                        <h3>Additional Notes</h3>
                        <textarea
                            value={prescription.notes}
                            onChange={(e) => setPrescription({...prescription, notes: e.target.value})}
                            placeholder="Additional instructions (optional)..."
                            rows="3"
                        />
                    </div>

                    <div className="form-actions">
                        <button 
                            className="btn btn-primary"
                            onClick={handleGeneratePrescription}
                            type="button"
                            disabled={loading}
                        >
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-pdf"></i>} Generate Prescription
                        </button>
                        <button 
                            className="btn btn-outline"
                            onClick={handleClearPrescription}
                            type="button"
                        >
                            <i className="fas fa-redo"></i> Clear
                        </button>
                    </div>
                </div>

                {/* Right Column - Preview */}
                <div className="prescription-preview-container">
                    <h3>Prescription Preview</h3>
                    <div className="preview-card">
                        <div className="preview-header">
                            <div className="clinic-info">
                                <h4><i className="fas fa-heartbeat"></i> MediCare Clinic</h4>
                                <p>123 Health Street, Medical City</p>
                                <p>Phone: (123) 456-7890</p>
                            </div>
                            <div className="preview-date">
                                <p>Date: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="preview-patient">
                            <h5>Patient Information</h5>
                            <div className="preview-row">
                                <span className="preview-label">Name:</span>
                                <span className="preview-value">
                                    {selectedPatient?.name || 'Not selected'}
                                </span>
                            </div>
                            {prescription.age && (
                                <div className="preview-row">
                                    <span className="preview-label">Age:</span>
                                    <span className="preview-value">{prescription.age}</span>
                                </div>
                            )}
                            {prescription.gender && (
                                <div className="preview-row">
                                    <span className="preview-label">Gender:</span>
                                    <span className="preview-value">{prescription.gender}</span>
                                </div>
                            )}
                            {prescription.weight && (
                                <div className="preview-row">
                                    <span className="preview-label">Weight:</span>
                                    <span className="preview-value">{prescription.weight}</span>
                                </div>
                            )}
                            {prescription.diagnosis && (
                                <div className="preview-row">
                                    <span className="preview-label">Diagnosis:</span>
                                    <span className="preview-value">{prescription.diagnosis}</span>
                                </div>
                            )}
                        </div>

                        <div className="preview-medicines">
                            <h5>Prescribed Medicines</h5>
                            {prescription.medicines.length === 0 ? (
                                <p className="no-items">No medicines added yet</p>
                            ) : (
                                prescription.medicines.map((medicine, index) => (
                                    <div key={index} className="preview-medicine-item">
                                        <div className="medicine-main">
                                            <strong>{medicine.name}</strong> - {medicine.dosage}
                                            {medicine.isCustom && <span className="custom-tag">New to DB</span>}
                                        </div>
                                        {medicine.duration && (
                                            <div className="medicine-detail">Duration: {medicine.duration}</div>
                                        )}
                                        {medicine.instructions && (
                                            <div className="medicine-detail">Instructions: {medicine.instructions}</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {prescription.notes && (
                            <div className="preview-notes">
                                <h5>Additional Notes</h5>
                                <p>{prescription.notes}</p>
                            </div>
                        )}

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
    );
};

export default PrescriptionGenerator;