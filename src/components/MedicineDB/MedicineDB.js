import React, { useState, useEffect } from 'react';
import './MedicineDB.css';

const MedicineDB = () => {
    const [medicines, setMedicines] = useState([
        { id: 1, name: "Paracetamol", use: "Fever, Pain relief", dosage: "500mg, 1 tab every 6 hours" },
        { id: 2, name: "Amoxicillin", use: "Bacterial infections", dosage: "500mg, 1 tab every 8 hours" },
        { id: 3, name: "Ibuprofen", use: "Inflammation, Pain relief", dosage: "400mg, 1 tab every 8 hours" },
        { id: 4, name: "Cetirizine", use: "Allergies, Hay fever", dosage: "10mg, 1 tab daily" },
        { id: 5, name: "Omeprazole", use: "Acid reflux, GERD", dosage: "20mg, 1 tab daily before food" },
    ]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newMedicine, setNewMedicine] = useState({ name: '', use: '', dosage: '' });

    const filteredMedicines = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.use.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddMedicine = () => {
        if (!newMedicine.name || !newMedicine.use) {
            alert('Please fill in all required fields');
            return;
        }

        const medicineToAdd = {
            id: medicines.length + 1,
            ...newMedicine
        };

        setMedicines([...medicines, medicineToAdd]);
        setNewMedicine({ name: '', use: '', dosage: '' });
        setShowModal(false);
    };

    const handleDeleteMedicine = (id) => {
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            setMedicines(medicines.filter(medicine => medicine.id !== id));
        }
    };

    return (
        <section id="medicine-db" className="section">
            <h2><i className="fas fa-database"></i> Medicine Database</h2>
            <div className="card">
                <div className="card-header">
                    <h3>Available Medicines</h3>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search medicine..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <i className="fas fa-search"></i>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus"></i> Add Medicine
                    </button>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Use Case / Purpose</th>
                                <th>Dosage</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.map(medicine => (
                                <tr key={medicine.id}>
                                    <td><strong>{medicine.name}</strong></td>
                                    <td>{medicine.use}</td>
                                    <td>{medicine.dosage}</td>
                                    <td className="actions">
                                        {/* EDIT BUTTON - BLUE */}
                                        <button 
                                            className="action-btn edit-btn"
                                            style={{
                                                background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
                                                color: 'white',
                                                border: '1px solid #1565C0'
                                            }}
                                        >
                                            <i className="fas fa-edit"></i> Edit
                                        </button>
                                        
                                        {/* DELETE BUTTON - RED */}
                                        <button 
                                            className="action-btn delete-btn"
                                            onClick={() => handleDeleteMedicine(medicine.id)}
                                            style={{
                                                background: 'linear-gradient(90deg, #F44336 0%, #D32F2F 100%)',
                                                color: 'white',
                                                border: '1px solid #C62828'
                                            }}
                                        >
                                            <i className="fas fa-trash"></i> Delete
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
                            <h3><i className="fas fa-pills"></i> Add New Medicine</h3>
                            <span className="close-modal" onClick={() => setShowModal(false)}>&times;</span>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Medicine Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter medicine name"
                                    value={newMedicine.name}
                                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Use Case / Purpose</label>
                                <textarea
                                    className="form-control"
                                    placeholder="Enter use case/purpose"
                                    value={newMedicine.use}
                                    onChange={(e) => setNewMedicine({...newMedicine, use: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Dosage</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., 500mg, 1 tablet daily"
                                    value={newMedicine.dosage}
                                    onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={handleAddMedicine}>
                                Save Medicine
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

export default MedicineDB;