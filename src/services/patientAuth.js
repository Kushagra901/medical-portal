import { toast } from 'react-toastify';

// Mock database - In real app, this would be an API call
let patients = [
  {
    id: 'PAT001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'patient123',
    phone: '+1 234-567-8901',
    dateOfBirth: '1985-05-15',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '123 Main St, NY',
    emergencyContact: 'Jane Doe: +1 234-567-8902',
    medicalHistory: [
      { condition: 'Hypertension', diagnosedDate: '2020-01-15', notes: 'Under medication' },
      { condition: 'Allergies', diagnosedDate: '2019-06-20', notes: 'Pollen allergy' }
    ],
    allergies: ['Penicillin', 'Peanuts'],
    currentMedications: ['Lisinopril 10mg', 'Loratadine 10mg'],
    bloodPressure: '120/80',
    height: '175 cm',
    weight: '75 kg',
    bmi: '24.5',
    lastVisit: '2024-01-15',
    doctorId: 'DOC001',
    profileImage: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'PAT002',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    password: 'patient123',
    phone: '+1 234-567-8903',
    dateOfBirth: '1990-10-20',
    gender: 'Female',
    bloodGroup: 'A+',
    address: '456 Oak Ave, NY',
    emergencyContact: 'Mike Johnson: +1 234-567-8904',
    medicalHistory: [
      { condition: 'Asthma', diagnosedDate: '2018-03-10', notes: 'Use inhaler as needed' }
    ],
    allergies: ['Sulfa drugs'],
    currentMedications: ['Albuterol inhaler'],
    bloodPressure: '110/70',
    height: '162 cm',
    weight: '60 kg',
    bmi: '22.9',
    lastVisit: '2024-01-10',
    doctorId: 'DOC002',
    profileImage: null,
    createdAt: new Date().toISOString()
  }
];

// Get all patients
export const getPatients = () => {
  return patients;
};

// Get patient by ID
export const getPatientById = (id) => {
  return patients.find(patient => patient.id === id);
};

// Get patients by doctor ID
export const getPatientsByDoctor = (doctorId) => {
  return patients.filter(patient => patient.doctorId === doctorId);
};

// Patient Signup
export const patientSignup = (patientData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if email already exists
      const existingPatient = patients.find(p => p.email === patientData.email);
      
      if (existingPatient) {
        toast.error('Email already registered!');
        reject(new Error('Email already exists'));
        return;
      }

      // Create new patient
      const newPatient = {
        id: `PAT${String(patients.length + 1).padStart(3, '0')}`,
        ...patientData,
        medicalHistory: [],
        allergies: [],
        currentMedications: [],
        bloodPressure: 'Not recorded',
        height: 'Not recorded',
        weight: 'Not recorded',
        bmi: 'Not recorded',
        lastVisit: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      patients.push(newPatient);
      
      // Store in localStorage for session
      const { password, ...patientWithoutPassword } = newPatient;
      localStorage.setItem('patientUser', JSON.stringify(patientWithoutPassword));
      
      toast.success('Registration successful! Please login.');
      resolve(patientWithoutPassword);
    }, 1000);
  });
};

// Patient Login
export const patientLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const patient = patients.find(p => p.email === email && p.password === password);
      
      if (patient) {
        const { password, ...patientWithoutPassword } = patient;
        localStorage.setItem('patientUser', JSON.stringify(patientWithoutPassword));
        toast.success(`Welcome back, ${patient.name}!`);
        resolve(patientWithoutPassword);
      } else {
        toast.error('Invalid email or password!');
        reject(new Error('Invalid credentials'));
      }
    }, 800);
  });
};

// Patient Logout
export const patientLogout = () => {
  localStorage.removeItem('patientUser');
  toast.info('Logged out successfully');
};

// Get current patient
export const getCurrentPatient = () => {
  const user = localStorage.getItem('patientUser');
  return user ? JSON.parse(user) : null;
};

// Update patient profile
export const updatePatientProfile = (id, updatedData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = patients.findIndex(p => p.id === id);
      
      if (index !== -1) {
        patients[index] = { ...patients[index], ...updatedData };
        const { password, ...patientWithoutPassword } = patients[index];
        localStorage.setItem('patientUser', JSON.stringify(patientWithoutPassword));
        toast.success('Profile updated successfully!');
        resolve(patientWithoutPassword);
      } else {
        toast.error('Patient not found!');
        reject(new Error('Patient not found'));
      }
    }, 800);
  });
};

// Add medical record for patient
export const addMedicalRecord = (patientId, record) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = patients.findIndex(p => p.id === patientId);
      
      if (index !== -1) {
        if (!patients[index].medicalHistory) {
          patients[index].medicalHistory = [];
        }
        patients[index].medicalHistory.push({
          ...record,
          recordedAt: new Date().toISOString()
        });
        patients[index].lastVisit = new Date().toISOString().split('T')[0];
        toast.success('Medical record added successfully!');
        resolve(patients[index]);
      } else {
        toast.error('Patient not found!');
        reject(new Error('Patient not found'));
      }
    }, 800);
  });
};