<div align="center">
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/react/react.png" alt="React Logo" width="80" height="80"/>
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/nodejs/nodejs.png" alt="Node.js Logo" width="80" height="80"/>
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/mongodb/mongodb.png" alt="MongoDB Logo" width="80" height="80"/>
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/express/express.png" alt="Express Logo" width="80" height="80"/>
  
  <h1 align="center">MediCare Portal 🏥</h1>
  
  <p align="center">
    <strong>A Modern Healthcare Management Platform</strong>
    <br />
    Built with React, Node.js, Express & MongoDB
  </p>
  
  ![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
  ![React Version](https://img.shields.io/badge/react-18.2.0-blue)
  ![License](https://img.shields.io/badge/license-MIT-green)
</div>

---

## ✨ Features

### 👨‍⚕️ Doctor Portal
- **Dashboard** — Real-time stats (patient count, prescriptions issued) pulled from MongoDB
- **Medicine Database** — Add, search, and manage medicines stored in MongoDB
- **Patient Database** — View and manage all registered patients
- **Prescription Generator** — Create prescriptions with AI-suggested medicines, live preview, PDF download, and print support
- **My Patients** — View and manage patients assigned to the logged-in doctor
- **Lab Reports** — Create and manage lab test reports
- **Report AI** — AI-powered medical report analysis module
- **Profile Management** — Edit personal, professional, and practice info with profile image upload
- **Export Database** — Export full doctor/patient database to Excel (.xlsx)

### 🧑‍💼 Patient Portal
- **Overview Dashboard** — Active prescriptions, medical records count, assigned doctor, blood group, and **BMI Calculator** (auto-computed from height/weight with color-coded status)
- **Prescriptions Tab** — View all prescriptions issued by the doctor with medicines, dosage, and instructions
- **Medical Records Tab** — Complete medical history with condition, diagnosis date, and notes
- **Appointments Tab** — View assigned doctor's contact info for scheduling
- **Profile Management** — Edit personal, medical, contact, and insurance info with profile image upload

### 🤖 AI Chatbot (MediBot)
- Medical AI assistant available on all dashboard pages
- Symptom-based medicine suggestions
- Medication info, dosage guidelines, and condition-specific advice

### 🔐 Authentication & Security
- Separate Doctor/Patient registration and login flows
- JWT-based authentication with role-based access control
- bcrypt password hashing
- Protected routes by user role

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, React Router v6, CSS3, Font Awesome, jsPDF, XLSX |
| **Backend** | Node.js, Express.js, JWT, bcryptjs |
| **Database** | MongoDB with Mongoose ODM |
| **Tools** | Nodemon, Concurrently, Axios |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v14+
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/Kushagra901/medical-portal.git
cd medical-portal

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Environment Variables

Create a `backend/.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
PORT=5000
```

### Running the Application

Open **two terminals**:

```bash
# Terminal 1 — Backend (runs on port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (runs on port 3000)
cd ..
npm start
```

Then open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
medical-portal/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # API logic (doctor, patient, medicine, prescription)
│   ├── middleware/       # JWT auth & role authorization
│   ├── models/          # Mongoose schemas (Doctor, Patient, Medicine, Prescription)
│   ├── routes/          # Express routes + export routes
│   └── server.js        # Entry point
├── src/
│   ├── components/
│   │   ├── Auth/        # Login, Signup, PrivateRoute
│   │   ├── Chatbot/     # MediBot AI assistant
│   │   ├── Common/      # ImageUpload component
│   │   ├── DoctorPatients/ # My Patients management
│   │   ├── LabReport/   # Lab test reports
│   │   ├── MedicineDB/  # Medicine database CRUD
│   │   ├── PatientDB/   # Patient database
│   │   └── Prescription/ # Prescription generator + preview
│   ├── pages/           # Landing, Login, Doctor/Patient dashboards
│   └── services/        # API clients, auth helpers, export service
├── public/
└── package.json
```

---

## 🎯 Key Highlights

| Feature | Why It's Unique |
|---------|----------------|
| **BMI Calculator** | Auto-computes from patient height/weight with color-coded badge (Underweight, Normal, Overweight, Obese) |
| **AI Medicine Suggestions** | Diagnosis-based medicine recommendations from both a mapping and the live medicine DB |
| **Real-time Dashboard** | All stats are live from MongoDB — no hardcoded numbers |
| **Dual Portal System** | Completely separate doctor and patient experiences with role-based routing |
| **Export to Excel** | One-click export of the entire database with sanitized data |
| **MediBot AI** | Context-aware chatbot with medical knowledge for doctor assistance |

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Kushagra901">Kushagra</a></p>
</div>
