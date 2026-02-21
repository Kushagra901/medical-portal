import { toast } from 'react-toastify';

// Mock database - In real app, this would be an API call
let doctors = [
  {
    id: 'DOC001',
    name: 'Dr. John Smith',
    email: 'dr.smith@medicare.com',
    password: 'doctor123',
    specialization: 'General Physician',
    license: 'MED123456',
    experience: '15 years',
    qualification: 'MBBS, MD',
    hospital: 'City General Hospital',
    phone: '+1 234-567-8901',
    address: '123 Medical Center, NY',
    consultationFee: '$100',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableTime: '9:00 AM - 5:00 PM',
    profileImage: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'DOC002',
    name: 'Dr. Sarah Jones',
    email: 'dr.jones@medicare.com',
    password: 'doctor123',
    specialization: 'Cardiologist',
    license: 'MED789012',
    experience: '12 years',
    qualification: 'MBBS, MD, DM Cardiology',
    hospital: 'Heart Care Institute',
    phone: '+1 234-567-8902',
    address: '456 Cardiology Wing, NY',
    consultationFee: '$150',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableTime: '10:00 AM - 6:00 PM',
    profileImage: null,
    createdAt: new Date().toISOString()
  }
];

// Get all doctors
export const getDoctors = () => {
  return doctors;
};

// Get doctor by ID
export const getDoctorById = (id) => {
  return doctors.find(doctor => doctor.id === id);
};

// Doctor Signup
export const doctorSignup = (doctorData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if email already exists
      const existingDoctor = doctors.find(d => d.email === doctorData.email);
      
      if (existingDoctor) {
        toast.error('Email already registered!');
        reject(new Error('Email already exists'));
        return;
      }

      // Create new doctor
      const newDoctor = {
        id: `DOC${String(doctors.length + 1).padStart(3, '0')}`,
        ...doctorData,
        createdAt: new Date().toISOString()
      };

      doctors.push(newDoctor);
      
      // Store in localStorage for session
      const { password, ...doctorWithoutPassword } = newDoctor;
      localStorage.setItem('doctorUser', JSON.stringify(doctorWithoutPassword));
      
      toast.success('Registration successful! Please login.');
      resolve(doctorWithoutPassword);
    }, 1000);
  });
};

// Doctor Login
export const doctorLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const doctor = doctors.find(d => d.email === email && d.password === password);
      
      if (doctor) {
        const { password, ...doctorWithoutPassword } = doctor;
        localStorage.setItem('doctorUser', JSON.stringify(doctorWithoutPassword));
        toast.success(`Welcome back, ${doctor.name}!`);
        resolve(doctorWithoutPassword);
      } else {
        toast.error('Invalid email or password!');
        reject(new Error('Invalid credentials'));
      }
    }, 800);
  });
};

// Doctor Logout
export const doctorLogout = () => {
  localStorage.removeItem('doctorUser');
  toast.info('Logged out successfully');
};

// Get current doctor
export const getCurrentDoctor = () => {
  const user = localStorage.getItem('doctorUser');
  return user ? JSON.parse(user) : null;
};

// Update doctor profile
export const updateDoctorProfile = (id, updatedData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = doctors.findIndex(d => d.id === id);
      
      if (index !== -1) {
        doctors[index] = { ...doctors[index], ...updatedData };
        const { password, ...doctorWithoutPassword } = doctors[index];
        localStorage.setItem('doctorUser', JSON.stringify(doctorWithoutPassword));
        toast.success('Profile updated successfully!');
        resolve(doctorWithoutPassword);
      } else {
        toast.error('Doctor not found!');
        reject(new Error('Doctor not found'));
      }
    }, 800);
  });
};