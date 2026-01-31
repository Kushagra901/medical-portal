// Sample Data
const sampleMedicines = [
    { id: 1, name: "Paracetamol", use: "Fever, Pain relief", dosage: "500mg, 1 tab every 6 hours" },
    { id: 2, name: "Amoxicillin", use: "Bacterial infections", dosage: "500mg, 1 tab every 8 hours" },
    { id: 3, name: "Ibuprofen", use: "Inflammation, Pain relief", dosage: "400mg, 1 tab every 8 hours" },
    { id: 4, name: "Cetirizine", use: "Allergies, Hay fever", dosage: "10mg, 1 tab daily" },
    { id: 5, name: "Omeprazole", use: "Acid reflux, GERD", dosage: "20mg, 1 tab daily before food" },
    { id: 6, name: "Metformin", use: "Type 2 Diabetes", dosage: "500mg, 1 tab twice daily" },
    { id: 7, name: "Atorvastatin", use: "High cholesterol", dosage: "20mg, 1 tab at bedtime" },
    { id: 8, name: "Levothyroxine", use: "Hypothyroidism", dosage: "50mcg, 1 tab daily morning" }
];

const samplePatients = [
    { id: "P001", name: "John Doe", diagnosis: "Common Cold", medicine: "Paracetamol", visit: "2024-01-15" },
    { id: "P002", name: "Jane Smith", diagnosis: "Bacterial Infection", medicine: "Amoxicillin", visit: "2024-01-14" },
    { id: "P003", name: "Robert Johnson", diagnosis: "Arthritis Pain", medicine: "Ibuprofen", visit: "2024-01-13" },
    { id: "P004", name: "Sarah Williams", diagnosis: "Seasonal Allergies", medicine: "Cetirizine", visit: "2024-01-12" },
    { id: "P005", name: "Michael Brown", diagnosis: "Acid Reflux", medicine: "Omeprazole", visit: "2024-01-10" }
];

// Diagnosis to Medicine Mapping
const diagnosisMapping = {
    "fever": ["Paracetamol", "Ibuprofen"],
    "cold": ["Paracetamol", "Cetirizine"],
    "infection": ["Amoxicillin"],
    "pain": ["Paracetamol", "Ibuprofen"],
    "allergy": ["Cetirizine"],
    "acid reflux": ["Omeprazole"],
    "diabetes": ["Metformin"],
    "cholesterol": ["Atorvastatin"],
    "thyroid": ["Levothyroxine"],
    "headache": ["Paracetamol", "Ibuprofen"],
    "arthritis": ["Ibuprofen"],
    "bacterial": ["Amoxicillin"]
};

// DOM Elements
const medicineTableBody = document.getElementById('medicine-table-body');
const patientTableBody = document.getElementById('patient-table-body');
const medicineSearch = document.getElementById('medicine-search');
const addMedicineBtn = document.getElementById('add-medicine-btn');
const addPatientBtn = document.getElementById('add-patient-btn');
const diagnosisInput = document.getElementById('diagnosis-input');
const suggestedMedicines = document.getElementById('suggested-medicines');
const medicineSelect = document.getElementById('medicine-select');
const addMedicineToPrescription = document.getElementById('add-medicine-to-prescription');
const prescriptionMedicinesList = document.getElementById('prescription-medicines-list');
const patientSelect = document.getElementById('patient-select');
const generatePrescriptionBtn = document.getElementById('generate-prescription');
const clearPrescriptionBtn = document.getElementById('clear-prescription');
const prescriptionNotes = document.getElementById('prescription-notes');

// Modal Elements
const medicineModal = document.getElementById('medicine-modal');
const patientModal = document.getElementById('patient-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');

// State
let medicines = [...sampleMedicines];
let patients = [...samplePatients];
let currentPrescription = {
    patientId: '',
    diagnosis: '',
    medicines: [],
    notes: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMedicines();
    loadPatients();
    setupEventListeners();
    updateMedicineSelect();
    updatePatientSelect();
});

// Load Medicines into Table
function loadMedicines(filter = '') {
    medicineTableBody.innerHTML = '';
    
    const filteredMedicines = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(filter.toLowerCase()) ||
        medicine.use.toLowerCase().includes(filter.toLowerCase())
    );
    
    filteredMedicines.forEach(medicine => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${medicine.name}</strong></td>
            <td>${medicine.use}</td>
            <td>${medicine.dosage}</td>
            <td class="actions">
                <button class="action-btn edit-btn" onclick="editMedicine(${medicine.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteMedicine(${medicine.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        medicineTableBody.appendChild(row);
    });
}

// Load Patients into Table
function loadPatients() {
    patientTableBody.innerHTML = '';
    
    patients.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${patient.id}</strong></td>
            <td>${patient.name}</td>
            <td>${patient.diagnosis}</td>
            <td>${patient.medicine}</td>
            <td>${patient.visit}</td>
            <td class="actions">
                <button class="action-btn view-btn" onclick="viewPatient('${patient.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="action-btn edit-btn" onclick="editPatient('${patient.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        `;
        patientTableBody.appendChild(row);
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Medicine Search
    medicineSearch.addEventListener('input', (e) => {
        loadMedicines(e.target.value);
    });
    
    // Add Medicine Button
    addMedicineBtn.addEventListener('click', () => {
        medicineModal.style.display = 'flex';
    });
    
    // Add Patient Button
    addPatientBtn.addEventListener('click', () => {
        populateMedicineSelect('new-patient-medicine');
        patientModal.style.display = 'flex';
    });
    
    // Diagnosis Input for Medicine Suggestions
    diagnosisInput.addEventListener('input', (e) => {
        suggestMedicines(e.target.value);
    });
    
    // Add Medicine to Prescription
    addMedicineToPrescription.addEventListener('click', () => {
        const selectedMedicine = medicineSelect.value;
        if (selectedMedicine) {
            addMedicineToCurrentPrescription(selectedMedicine);
            updatePrescriptionPreview();
        }
    });
    
    // Generate Prescription
    generatePrescriptionBtn.addEventListener('click', generatePrescription);
    
    // Clear Prescription
    clearPrescriptionBtn.addEventListener('click', clearPrescription);
    
    // Close Modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            medicineModal.style.display = 'none';
            patientModal.style.display = 'none';
            resetModalForms();
        });
    });
    
    // Save Medicine
    document.getElementById('save-medicine').addEventListener('click', saveNewMedicine);
    document.getElementById('cancel-medicine').addEventListener('click', () => {
        medicineModal.style.display = 'none';
        resetModalForms();
    });
    
    // Save Patient
    document.getElementById('save-patient').addEventListener('click', saveNewPatient);
    document.getElementById('cancel-patient').addEventListener('click', () => {
        patientModal.style.display = 'none';
        resetModalForms();
    });
    
    // Patient Select Change
    patientSelect.addEventListener('change', (e) => {
        currentPrescription.patientId = e.target.value;
        updatePrescriptionPreview();
    });
    
    // Prescription Notes
    prescriptionNotes.addEventListener('input', (e) => {
        currentPrescription.notes = e.target.value;
        updatePrescriptionPreview();
    });
}

// Suggest Medicines based on Diagnosis
function suggestMedicines(diagnosis) {
    suggestedMedicines.innerHTML = '';
    currentPrescription.diagnosis = diagnosis;
    
    if (!diagnosis.trim()) return;
    
    const keywords = diagnosis.toLowerCase().split(' ');
    const suggested = new Set();
    
    keywords.forEach(keyword => {
        if (diagnosisMapping[keyword]) {
            diagnosisMapping[keyword].forEach(med => suggested.add(med));
        }
    });
    
    // Also check for partial matches
    Object.keys(diagnosisMapping).forEach(key => {
        if (diagnosis.toLowerCase().includes(key)) {
            diagnosisMapping[key].forEach(med => suggested.add(med));
        }
    });
    
    if (suggested.size === 0) {
        suggestedMedicines.innerHTML = '<p class="no-suggestions">No suggestions available for this diagnosis</p>';
        return;
    }
    
    suggested.forEach(medicineName => {
        const medicine = medicines.find(m => m.name === medicineName);
        if (medicine) {
            const suggestion = document.createElement('div');
            suggestion.className = 'suggestion-item';
            suggestion.innerHTML = `
                <span>${medicine.name} - ${medicine.use}</span>
                <button onclick="addMedicineToCurrentPrescription('${medicine.name}')" class="btn btn-secondary btn-sm">
                    <i class="fas fa-plus"></i> Add
                </button>
            `;
            suggestedMedicines.appendChild(suggestion);
        }
    });
}

// Add Medicine to Current Prescription
function addMedicineToCurrentPrescription(medicineName) {
    const medicine = medicines.find(m => m.name === medicineName);
    if (medicine && !currentPrescription.medicines.find(m => m.name === medicineName)) {
        currentPrescription.medicines.push({
            name: medicine.name,
            dosage: medicine.dosage,
            use: medicine.use
        });
        updatePrescriptionMedicinesList();
    }
}

// Update Prescription Medicines List
function updatePrescriptionMedicinesList() {
    prescriptionMedicinesList.innerHTML = '';
    
    if (currentPrescription.medicines.length === 0) {
        prescriptionMedicinesList.innerHTML = '<p class="no-medicines">No medicines added yet</p>';
        return;
    }
    
    currentPrescription.medicines.forEach((medicine, index) => {
        const item = document.createElement('div');
        item.className = 'medicine-item';
        item.innerHTML = `
            <div>
                <strong>${medicine.name}</strong><br>
                <small>${medicine.dosage}</small>
            </div>
            <button onclick="removeMedicineFromPrescription(${index})" class="action-btn delete-btn">
                <i class="fas fa-times"></i>
            </button>
        `;
        prescriptionMedicinesList.appendChild(item);
    });
}

// Remove Medicine from Prescription
function removeMedicineFromPrescription(index) {
    currentPrescription.medicines.splice(index, 1);
    updatePrescriptionMedicinesList();
    updatePrescriptionPreview();
}

// Update Medicine Select Dropdown
function updateMedicineSelect() {
    populateMedicineSelect('medicine-select');
}

function populateMedicineSelect(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select medicine</option>';
    
    medicines.forEach(medicine => {
        const option = document.createElement('option');
        option.value = medicine.name;
        option.textContent = `${medicine.name} - ${medicine.use}`;
        select.appendChild(option);
    });
}

// Update Patient Select Dropdown
function updatePatientSelect() {
    patientSelect.innerHTML = '<option value="">Select a patient</option>';
    
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.name} (${patient.id})`;
        patientSelect.appendChild(option);
    });
}

// Save New Medicine
function saveNewMedicine() {
    const name = document.getElementById('new-medicine-name').value;
    const use = document.getElementById('new-medicine-use').value;
    const dosage = document.getElementById('new-medicine-dosage').value;
    
    if (!name || !use) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newMedicine = {
        id: medicines.length + 1,
        name,
        use,
        dosage: dosage || 'As prescribed by doctor'
    };
    
    medicines.push(newMedicine);
    loadMedicines();
    updateMedicineSelect();
    medicineModal.style.display = 'none';
    resetModalForms();
    
    // Add to diagnosis mapping if keywords exist
    const keywords = use.toLowerCase().split(' ');
    keywords.forEach(keyword => {
        if (!diagnosisMapping[keyword]) {
            diagnosisMapping[keyword] = [name];
        } else if (!diagnosisMapping[keyword].includes(name)) {
            diagnosisMapping[keyword].push(name);
        }
    });
}

// Save New Patient
function saveNewPatient() {
    const name = document.getElementById('new-patient-name').value;
    const diagnosis = document.getElementById('new-patient-diagnosis').value;
    const medicine = document.getElementById('new-patient-medicine').value;
    
    if (!name) {
        alert('Please enter patient name');
        return;
    }
    
    const patientId = `P${String(patients.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    
    const newPatient = {
        id: patientId,
        name,
        diagnosis: diagnosis || 'Not specified',
        medicine: medicine || 'Not specified',
        visit: today
    };
    
    patients.push(newPatient);
    loadPatients();
    updatePatientSelect();
    patientModal.style.display = 'none';
    resetModalForms();
}

// Reset Modal Forms
function resetModalForms() {
    document.getElementById('new-medicine-name').value = '';
    document.getElementById('new-medicine-use').value = '';
    document.getElementById('new-medicine-dosage').value = '';
    document.getElementById('new-patient-name').value = '';
    document.getElementById('new-patient-diagnosis').value = '';
    document.getElementById('new-patient-medicine').value = '';
}

// Update Prescription Preview
function updatePrescriptionPreview() {
    const selectedPatient = patients.find(p => p.id === currentPrescription.patientId);
    
    // Update date
    const today = new Date();
    document.getElementById('preview-date').textContent = 
        today.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    
    // Update patient info
    if (selectedPatient) {
        document.getElementById('preview-patient-name').textContent = selectedPatient.name;
    } else {
        document.getElementById('preview-patient-name').textContent = 'Not selected';
    }
    
    // Update diagnosis
    document.getElementById('preview-diagnosis').textContent = 
        currentPrescription.diagnosis || 'Not specified';
    
    // Update medicines list
    const medicinesList = document.getElementById('preview-medicines-list');
    medicinesList.innerHTML = '';
    
    if (currentPrescription.medicines.length === 0) {
        medicinesList.innerHTML = '<li>No medicines added yet</li>';
    } else {
        currentPrescription.medicines.forEach(medicine => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${medicine.name}</strong>: ${medicine.dosage}`;
            medicinesList.appendChild(li);
        });
    }
    
    // Update notes
    document.getElementById('preview-notes').textContent = 
        currentPrescription.notes || 'No additional notes';
}

// Generate Prescription
function generatePrescription() {
    if (!currentPrescription.patientId) {
        alert('Please select a patient');
        return;
    }
    
    if (currentPrescription.medicines.length === 0) {
        alert('Please add at least one medicine to the prescription');
        return;
    }
    
    // Update patient's last visit and diagnosis
    const patientIndex = patients.findIndex(p => p.id === currentPrescription.patientId);
    if (patientIndex !== -1) {
        const today = new Date().toISOString().split('T')[0];
        patients[patientIndex].visit = today;
        patients[patientIndex].diagnosis = currentPrescription.diagnosis;
        patients[patientIndex].medicine = currentPrescription.medicines[0].name;
        loadPatients();
    }
    
    // Create printable prescription
    const printWindow = window.open('', '_blank');
    const patient = patients.find(p => p.id === currentPrescription.patientId);
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Prescription - ${patient.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .patient-info { margin-bottom: 30px; }
                    .medicines { margin-bottom: 30px; }
                    .footer { margin-top: 50px; border-top: 1px solid #333; padding-top: 20px; text-align: right; }
                    .medicine-item { margin-bottom: 15px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>MediCare Clinic</h1>
                    <p>123 Health Street, Medical City</p>
                    <p>Phone: (123) 456-7890 | Email: contact@medicare.com</p>
                </div>
                
                <div class="patient-info">
                    <h2>Prescription</h2>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Patient:</strong> ${patient.name} (${patient.id})</p>
                    <p><strong>Diagnosis:</strong> ${currentPrescription.diagnosis}</p>
                </div>
                
                <div class="medicines">
                    <h3>Medications:</h3>
                    ${currentPrescription.medicines.map(med => `
                        <div class="medicine-item">
                            <strong>${med.name}</strong><br>
                            ${med.dosage}
                        </div>
                    `).join('')}
                </div>
                
                <div class="notes">
                    <h3>Instructions:</h3>
                    <p>${currentPrescription.notes || 'Take as directed. Complete the full course of medication.'}</p>
                </div>
                
                <div class="footer">
                    <div class="signature">
                        <p>___________________</p>
                        <p><strong>Dr. John Smith</strong></p>
                        <p>MBBS, MD</p>
                        <p>License No: MED123456</p>
                    </div>
                </div>
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Clear Prescription
function clearPrescription() {
    currentPrescription = {
        patientId: '',
        diagnosis: '',
        medicines: [],
        notes: ''
    };
    
    patientSelect.value = '';
    diagnosisInput.value = '';
    prescriptionNotes.value = '';
    suggestedMedicines.innerHTML = '';
    updatePrescriptionMedicinesList();
    updatePrescriptionPreview();
}

// Edit Medicine (placeholder)
function editMedicine(id) {
    alert(`Edit medicine with ID: ${id}\nThis feature would open an edit form in a real application.`);
}

// Delete Medicine
function deleteMedicine(id) {
    if (confirm('Are you sure you want to delete this medicine?')) {
        medicines = medicines.filter(medicine => medicine.id !== id);
        loadMedicines();
        updateMedicineSelect();
    }
}

// View Patient (placeholder)
function viewPatient(id) {
    const patient = patients.find(p => p.id === id);
    if (patient) {
        alert(`Patient Details:\n\nID: ${patient.id}\nName: ${patient.name}\nLast Diagnosis: ${patient.diagnosis}\nLast Medicine: ${patient.medicine}\nLast Visit: ${patient.visit}`);
    }
}

// Edit Patient (placeholder)
function editPatient(id) {
    alert(`Edit patient with ID: ${id}\nThis feature would open an edit form in a real application.`);
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === medicineModal) {
        medicineModal.style.display = 'none';
        resetModalForms();
    }
    if (e.target === patientModal) {
        patientModal.style.display = 'none';
        resetModalForms();
    }
});