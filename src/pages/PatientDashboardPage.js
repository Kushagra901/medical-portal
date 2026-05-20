import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredPatient, patientLogout, updatePatientProfile } from '../services/patientAuth';
import { getMyDoctor } from '../services/patientService';
import { getPatientPrescriptions } from '../services/prescriptionService';
import { 
  getPatientAppointments, getAvailableSlots, createAppointment, cancelAppointment 
} from '../services/appointmentService';
import api from '../services/api';
import NotificationBell from '../components/Common/NotificationBell';
import ImageUpload from '../components/Common/ImageUpload';
import { QRCodeSVG } from 'qrcode.react';
import Pagination from '../components/Common/Pagination';
import './PatientDashboardPage.css';


// ── BMI helper ──────────────────────────────────────────────────────────────
const getBMI = (height, weight) => {
  const h = parseFloat(height);
  const w = parseFloat(weight);
  if (!h || !w || h <= 0) return null;
  const bmi = w / ((h / 100) ** 2);
  return Math.round(bmi * 10) / 10;
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3B82F6' };
  if (bmi < 25)   return { label: 'Normal',      color: '#10B981' };
  if (bmi < 30)   return { label: 'Overweight',  color: '#F59E0B' };
  return               { label: 'Obese',         color: '#EF4444' };
};

// ── Component ───────────────────────────────────────────────────────────────
const PatientDashboardPage = () => {
  const [patient, setPatient]               = useState(null);
  const [activeTab, setActiveTab]           = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData]     = useState({});
  const [myDoctor, setMyDoctor]             = useState(null);
  const [prescriptions, setPrescriptions]   = useState([]);
  const [loadingRx, setLoadingRx]           = useState(true);
  const [rxPage, setRxPage]                 = useState(1);
  const [rxTotalPages, setRxTotalPages]     = useState(1);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [appointmentsTotalPages, setAppointmentsTotalPages] = useState(1);
  const [nearbyDoctors, setNearbyDoctors]   = useState([]);
  const [locating, setLocating]             = useState(false);
  const [locationError, setLocationError]   = useState('');
  const [appointments, setAppointments]     = useState([]);
  const [doctorsList, setDoctorsList]       = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot]     = useState('');
  const [reason, setReason]                 = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate                            = useNavigate();

  // ── Fetch assigned doctor ────────────────────────────────────────────────
  const fetchMyDoctor = useCallback(async () => {
    try {
      const doc = await getMyDoctor();
      setMyDoctor(doc);
    } catch {
      // silently ignore — patient may not have an assigned doctor yet
    }
  }, []);

  // ── Fetch prescriptions ──────────────────────────────────────────────────
  const fetchPrescriptions = useCallback(async (patientId, pageNum = 1) => {
    try {
      setLoadingRx(true);
      const response = await getPatientPrescriptions(patientId, pageNum, 5);
      setPrescriptions(response.data || []);
      setRxTotalPages(response.totalPages || 1);
      setRxPage(response.page || pageNum);
    } catch {
      setPrescriptions([]);
    } finally {
      setLoadingRx(false);
    }
  }, []);

  const fetchAppointments = useCallback(async (pageNum = 1) => {
    try {
      const response = await getPatientAppointments(pageNum, 5);
      setAppointments(response.data || []);
      setAppointmentsTotalPages(response.totalPages || 1);
      setAppointmentsPage(response.page || pageNum);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await api.get('/doctors');
      if (response.data.success) {
        setDoctorsList(response.data.doctors);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      getAvailableSlots(selectedDoctor._id, appointmentDate)
        .then(slots => {
          setAvailableSlots(slots);
          setSelectedSlot('');
        })
        .catch(err => {
          console.error(err);
          setAvailableSlots([]);
        });
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, appointmentDate]);

  useEffect(() => {
    const currentPatient = getStoredPatient();
    if (!currentPatient) {
      navigate('/patient/auth');
    } else {
      setPatient(currentPatient);
      fetchMyDoctor();
      fetchPrescriptions(currentPatient.id, 1);
      fetchAppointments(1);
      fetchDoctors();

      // Check for selected doctor redirection
      const preselected = localStorage.getItem('selectedDoctorForBooking');
      if (preselected) {
        try {
          const docObj = JSON.parse(preselected);
          setSelectedDoctor(docObj);
          setActiveTab('appointments');
        } catch (e) {}
        localStorage.removeItem('selectedDoctorForBooking');
      }
    }
  }, [navigate, fetchMyDoctor, fetchPrescriptions, fetchAppointments, fetchDoctors]);

  const handleLogout = () => {
    patientLogout();
    navigate('/patient/auth');
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await cancelAppointment(id);
      alert("Appointment cancelled successfully.");
      fetchAppointments(appointmentsPage);
    } catch (e) {
      alert("Failed to cancel appointment.");
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !appointmentDate || !selectedSlot) {
      alert('Please fill out all fields.');
      return;
    }
    setBookingLoading(true);

    try {
      // 1. Create temporary booking/order
      const bookingData = {
        doctorId: selectedDoctor._id,
        date: appointmentDate,
        timeSlot: selectedSlot,
        reason
      };

      // Let's call /api/payments/order first
      const orderResponse = await api.post('/payments/order', {
        amount: selectedDoctor.consultationFee || 500
      });

      if (orderResponse.data.success) {
        const { orderId, amount, currency, keyId } = orderResponse.data;

        // Open Razorpay Checkout modal
        const options = {
          key: keyId,
          amount,
          currency,
          name: 'MediCare Portal',
          description: `Consultation fee for Dr. ${selectedDoctor.name}`,
          order_id: orderId,
          handler: async function (response) {
            // Verification and final appointment booking on frontend
            try {
              const verifyResponse = await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentData: bookingData
              });

              if (verifyResponse.data.success) {
                alert('Appointment booked successfully! Payment verified.');
                setSelectedDoctor(null);
                setAppointmentDate('');
                setSelectedSlot('');
                setReason('');
                fetchAppointments(1);
              } else {
                alert('Payment verification failed.');
              }
            } catch (err) {
              console.error(err);
              alert('Error verifying payment.');
            }
          },
          prefill: {
            name: patient?.name,
            email: patient?.email,
            contact: patient?.phone
          },
          theme: {
            color: '#4f46e5'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback if payments not setup (e.g. key missing)
        throw new Error("Payment initialization failed. Trying standard booking...");
      }
    } catch (err) {
      console.warn("Payment error or bypassed. Falling back to standard booking.", err);
      // Fallback booking without payment verification (graceful degradation)
      try {
        const res = await createAppointment({
          doctorId: selectedDoctor._id,
          date: appointmentDate,
          timeSlot: selectedSlot,
          reason
        });
        if (res) {
          alert('Appointment booked successfully (Standard Offline Mode).');
          setSelectedDoctor(null);
          setAppointmentDate('');
          setSelectedSlot('');
          setReason('');
          fetchAppointments(1);
        }
      } catch (innerErr) {
        alert(innerErr.response?.data?.message || 'Failed to book appointment.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setLocationError("");
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { longitude, latitude } = position.coords;
        const apiBase = process.env.REACT_APP_API_URL || '/api';
        const res = await fetch(`${apiBase}/doctors/nearby?longitude=${longitude}&latitude=${latitude}&maxDistance=50000`);
        const data = await res.json();
        if (data.success) {
          setNearbyDoctors(data.data);
          if (data.data.length === 0) setLocationError("No doctors found within 50km.");
        } else {
          setLocationError(data.message || "Failed to fetch doctors");
        }
      } catch (err) {
        setLocationError("Error connecting to server");
      } finally {
        setLocating(false);
      }
    }, () => {
      setLocationError("Unable to retrieve your location. Please allow location access.");
      setLocating(false);
    });
  };

  const handleImageUpload = async (imageData) => {
    try {
      setPatient({ ...patient, profileImage: imageData });
      await updatePatientProfile(patient.id, { profileImage: imageData });
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  const handleEditClick = () => {
    if (isEditingProfile) {
      setIsEditingProfile(false);
      setEditFormData({});
    } else {
      setEditFormData({
        name: patient.name || '',
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        bloodGroup: patient.bloodGroup || '',
        height: patient.height || '',
        weight: patient.weight || '',
        allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || ''),
        currentMedications: Array.isArray(patient.currentMedications) ? patient.currentMedications.join(', ') : (patient.currentMedications || ''),
        emergencyContact: patient.emergencyContact || '',
        emergencyPhone: patient.emergencyPhone || '',
        address: patient.address || '',
        insuranceProvider: patient.insuranceProvider || '',
        insuranceId: patient.insuranceId || ''
      });
      setIsEditingProfile(true);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    try {
      const updatedPatient = await updatePatientProfile(patient.id, editFormData);
      setPatient(updatedPatient);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (!patient) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // BMI computation
  const bmi = getBMI(patient.height, patient.weight);
  const bmiInfo = bmi ? getBMICategory(bmi) : null;

  return (
    <div className={`patient-dashboard ${mobileMenuOpen ? 'sidebar-visible' : ''}`}>
      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <div className={`dashboard-sidebar patient-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <i className="fas fa-heartbeat"></i>
          <h3>MediCare</h3>
          <p>Patient Portal</p>
          <button className="close-sidebar-btn" onClick={() => setMobileMenuOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="patient-profile">
          <div className="profile-image-section">
            <ImageUpload
              currentImage={patient?.profileImage}
              onImageChange={handleImageUpload}
              userType="patient"
            />
          </div>
          <h4>{patient.name}</h4>
          <p>ID: {patient.id}</p>
        </div>

        <nav className="sidebar-nav">
          <button className={activeTab === 'overview'      ? 'active' : ''} onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}>
            <i className="fas fa-home"></i> Overview
          </button>
          <button className={activeTab === 'records'       ? 'active' : ''} onClick={() => { setActiveTab('records'); setMobileMenuOpen(false); }}>
            <i className="fas fa-file-medical"></i> Medical Records
          </button>
          <button className={activeTab === 'prescriptions' ? 'active' : ''} onClick={() => { setActiveTab('prescriptions'); setMobileMenuOpen(false); }}>
            <i className="fas fa-prescription"></i> Prescriptions
          </button>
          <button className={activeTab === 'appointments'  ? 'active' : ''} onClick={() => { setActiveTab('appointments'); setMobileMenuOpen(false); }}>
            <i className="fas fa-calendar-check"></i> Appointments
          </button>
          <button className={activeTab === 'nearby'       ? 'active' : ''} onClick={() => { setActiveTab('nearby'); setMobileMenuOpen(false); }}>
            <i className="fas fa-map-marker-alt"></i> Find Doctors
          </button>
          <button className={activeTab === 'profile'       ? 'active' : ''} onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}>
            <i className="fas fa-user"></i> Profile
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="dashboard-main">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem 2rem', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="menu-toggle-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Welcome back, {patient.name}!</h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <NotificationBell userId={patient.id} userType="patient" />
          </div>
        </div>

        <div className="dashboard-content">

          {/* ── Overview Tab ─────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <i className="fas fa-prescription"></i>
                  <h3>Active Prescriptions</h3>
                  <p>{loadingRx ? <i className="fas fa-spinner fa-spin"></i> : prescriptions.length}</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-notes-medical"></i>
                  <h3>Medical Records</h3>
                  <p>{patient.medicalHistory?.length || 0}</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-user-md"></i>
                  <h3>Primary Doctor</h3>
                  <p style={{ fontSize: '0.85rem' }}>{myDoctor ? `Dr. ${myDoctor.name}` : 'Not assigned'}</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-tint"></i>
                  <h3>Blood Group</h3>
                  <p>{patient.bloodGroup || '—'}</p>
                </div>
              </div>

              {/* BMI Card */}
              {bmi && (
                <div className="profile-section" style={{ marginTop: '24px' }}>
                  <h4><i className="fas fa-weight"></i> BMI Overview</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '16px 0' }}>
                    <div style={{
                      width: '90px', height: '90px', borderRadius: '50%',
                      background: `${bmiInfo.color}20`, border: `3px solid ${bmiInfo.color}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: bmiInfo.color }}>{bmi}</span>
                      <span style={{ fontSize: '0.65rem', color: '#888' }}>BMI</span>
                    </div>
                    <div>
                      <span style={{
                        display: 'inline-block', padding: '4px 14px', borderRadius: '20px',
                        background: `${bmiInfo.color}20`, color: bmiInfo.color, fontWeight: '600', marginBottom: '6px'
                      }}>{bmiInfo.label}</span>
                      <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
                        Height: {patient.height} cm &nbsp;|&nbsp; Weight: {patient.weight} kg
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Medical Records */}
              <div className="recent-records" style={{ marginTop: '24px' }}>
                <h3>Recent Medical Records</h3>
                {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                  <div className="records-list">
                    {patient.medicalHistory.slice(0, 3).map((record, index) => (
                      <div key={index} className="record-item">
                        <h4>{record.condition}</h4>
                        <p>Diagnosed: {record.diagnosedDate}</p>
                        <p>{record.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No medical records found</p>
                )}
              </div>
            </div>
          )}

          {/* ── Medical Records Tab ──────────────────────────────────── */}
          {activeTab === 'records' && (
            <div className="records-tab">
              <h2><i className="fas fa-file-medical"></i> Medical History</h2>
              {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                <div className="records-list">
                  {patient.medicalHistory.map((record, index) => (
                    <div key={index} className="record-item" style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>{record.condition}</h4>
                        <span style={{
                          fontSize: '0.78rem', color: '#888', background: '#f1f5f9',
                          padding: '2px 10px', borderRadius: '12px'
                        }}>{record.diagnosedDate}</span>
                      </div>
                      {record.notes && <p style={{ marginTop: '8px', color: '#555' }}>{record.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                  <i className="fas fa-file-medical" style={{ fontSize: '3rem', marginBottom: '16px', display: 'block', color: '#d1d5db' }}></i>
                  <h3>No Medical Records</h3>
                  <p>Your doctor will add medical records during your visits.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Prescriptions Tab ────────────────────────────────────── */}
          {activeTab === 'prescriptions' && (
            <div className="prescriptions-tab">
              <h2><i className="fas fa-prescription"></i> My Prescriptions</h2>
              {loadingRx ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2563EB' }}></i>
                  <p style={{ marginTop: '12px', color: '#888' }}>Loading prescriptions…</p>
                </div>
              ) : prescriptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                  <i className="fas fa-prescription" style={{ fontSize: '3rem', marginBottom: '16px', display: 'block', color: '#d1d5db' }}></i>
                  <h3>No Prescriptions Yet</h3>
                  <p>Prescriptions from your doctor will appear here.</p>
                </div>
              ) : (
                <>
                  <div className="records-list">
                    {prescriptions.map((rx, index) => (
                      <div key={rx._id || index} className="record-item" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <h4 style={{ margin: 0 }}>
                            <i className="fas fa-prescription" style={{ color: '#2563EB', marginRight: '8px' }}></i>
                            {rx.prescriptionId || `Prescription #${index + 1}`}
                          </h4>
                          <span style={{
                            fontSize: '0.78rem', color: '#888', background: '#f1f5f9',
                            padding: '2px 10px', borderRadius: '12px'
                          }}>
                            {rx.date ? new Date(rx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown date'}
                          </span>
                        </div>
                        {rx.diagnosis && (
                          <p style={{ color: '#555', marginBottom: '10px' }}>
                            <strong>Diagnosis:</strong> {rx.diagnosis}
                          </p>
                        )}
                        {rx.medicines && rx.medicines.length > 0 && (
                          <div>
                            <p style={{ fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Medications:</p>
                            {rx.medicines.map((med, i) => (
                              <div key={i} style={{
                                display: 'flex', gap: '12px', padding: '6px 12px',
                                background: '#EFF6FF', borderRadius: '8px', marginBottom: '6px',
                                borderLeft: '3px solid #2563EB'
                              }}>
                                <strong>{med.name}</strong>
                                {med.dosage && <span style={{ color: '#666' }}>— {med.dosage}</span>}
                                {med.duration && <span style={{ color: '#888', fontSize: '0.85rem' }}>for {med.duration}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {rx.notes && (
                          <p style={{ marginTop: '8px', color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            <i className="fas fa-notes-medical" style={{ marginRight: '6px' }}></i>{rx.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <Pagination 
                    page={rxPage} 
                    totalPages={rxTotalPages} 
                    onPageChange={(page) => fetchPrescriptions(patient?.id || patient?._id, page)} 
                  />
                </>
              )}
            </div>
          )}

          {/* ── Appointments Tab ─────────────────────────────────────── */}
          {activeTab === 'appointments' && (
            <div className="appointments-tab animate-fade-in">
              <div className="appointments-split-layout">
                {/* Book Form */}
                <div className="booking-card-modern">
                  <h3><i className="fas fa-calendar-plus"></i> Book Consultation</h3>
                  <form onSubmit={handleBookAppointment}>
                    <div className="form-group-modern">
                      <label>Select Specialist</label>
                      <select 
                        value={selectedDoctor?._id || ''} 
                        onChange={(e) => {
                          const doc = doctorsList.find(d => d._id === e.target.value);
                          setSelectedDoctor(doc || null);
                        }}
                        required
                      >
                        <option value="">Choose a Doctor...</option>
                        {doctorsList.map(doc => (
                          <option key={doc._id} value={doc._id}>
                            Dr. {doc.name} ({doc.specialization}) — INR {doc.consultationFee || 500}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group-modern">
                      <label>Appointment Date</label>
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        required
                      />
                    </div>

                    {selectedDoctor && appointmentDate && (
                      <div className="form-group-modern">
                        <label>Available Slots</label>
                        {availableSlots.length === 0 ? (
                          <p className="no-slots-msg">No slots available for this date.</p>
                        ) : (
                          <div className="slots-grid">
                            {availableSlots.map(slot => (
                              <button
                                key={slot}
                                type="button"
                                className={`slot-pill ${selectedSlot === slot ? 'active' : ''}`}
                                onClick={() => setSelectedSlot(slot)}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="form-group-modern">
                      <label>Reason for Visit</label>
                      <textarea
                        placeholder="Describe your symptoms or reason for visit"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn-book-submit" 
                      disabled={bookingLoading || !selectedSlot}
                    >
                      {bookingLoading ? (
                        <><i className="fas fa-spinner fa-spin"></i> Initializing Gateway...</>
                      ) : (
                        <><i className="fas fa-credit-card"></i> Pay & Confirm Appointment</>
                      )}
                    </button>
                  </form>
                </div>

                {/* Booked Appointments Queue */}
                <div className="bookings-list-modern">
                  <h3><i className="fas fa-calendar-alt"></i> My Schedule</h3>
                  {appointments.length === 0 ? (
                    <div className="no-bookings">
                      <i className="fas fa-calendar-times"></i>
                      <p>You have no scheduled consultations.</p>
                    </div>
                  ) : (
                    <>
                      <div className="bookings-scroll">
                        {appointments.map(appt => (
                          <div key={appt._id} className={`booking-row-card status-${appt.status}`}>
                            <div className="row-header">
                              <div>
                                <h4>Dr. {appt.doctorId?.name}</h4>
                                <p className="spec">{appt.doctorId?.specialization}</p>
                              </div>
                              <span className={`status-pill ${appt.status}`}>
                                {appt.status.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="row-meta">
                              <p>
                                <i className="fas fa-calendar-day"></i> {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                              </p>
                              <p>
                                <i className="fas fa-clock"></i> {appt.timeSlot}
                              </p>
                            </div>
  
                            {appt.reason && (
                              <p className="appt-reason"><strong>Reason:</strong> {appt.reason}</p>
                            )}
  
                            {appt.notes && (
                              <p className="appt-notes"><strong>Doctor Notes:</strong> {appt.notes}</p>
                            )}
  
                            {['pending', 'confirmed'].includes(appt.status) && (
                              <button 
                                className="btn-cancel-appt" 
                                onClick={() => handleCancelAppointment(appt._id)}
                              >
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Pagination 
                        page={appointmentsPage} 
                        totalPages={appointmentsTotalPages} 
                        onPageChange={fetchAppointments} 
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Nearby Doctors Tab ─────────────────────────────────────── */}
          {activeTab === 'nearby' && (
            <div className="nearby-tab">
              <h2><i className="fas fa-map-marker-alt"></i> Find Doctors Near Me</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>Allow location access to find doctors closest to you.</p>
              
              <button 
                className="btn btn-primary" 
                onClick={handleFindNearby}
                disabled={locating}
                style={{ marginBottom: '20px' }}
              >
                {locating ? <><i className="fas fa-spinner fa-spin"></i> Locating...</> : <><i className="fas fa-search-location"></i> Find Nearest Doctors</>}
              </button>

              {locationError && <p style={{ padding: '10px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px' }}>{locationError}</p>}

              {nearbyDoctors.length > 0 && (
                <div className="records-list">
                  {nearbyDoctors.map((doc, idx) => (
                    <div key={idx} className="record-item" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#2563EB', fontSize: '1.2rem' }}>Dr. {doc.name}</h4>
                        <p style={{ margin: '4px 0', fontSize: '0.95rem', fontWeight: '500' }}>{doc.specialization} • {doc.experience} exp.</p>
                        <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#666' }}>
                          <i className="fas fa-hospital" style={{marginRight: '6px'}}></i>{doc.hospital || doc.address}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#10B981', margin: '0 0 10px 0' }}>{doc.consultationFee}</p>
                        <button className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.9rem', borderRadius: '20px' }}>Connect</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Profile Tab ──────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2><i className="fas fa-user-circle"></i> Personal Information</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {isEditingProfile && (
                    <button className="btn btn-success" onClick={handleProfileSave}>
                      <i className="fas fa-save"></i> Save Profile
                    </button>
                  )}
                  <button
                    className={`btn ${isEditingProfile ? 'btn-outline' : 'btn-primary'}`}
                    onClick={handleEditClick}
                  >
                    <i className={`fas ${isEditingProfile ? 'fa-times' : 'fa-edit'}`}></i>{' '}
                    {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              <div className="profile-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div className="profile-image-section">
                    <ImageUpload
                      currentImage={patient?.profileImage}
                      onImageChange={handleImageUpload}
                      userType="patient"
                    />
                  </div>
                  <div className="profile-title">
                    <h3>{patient?.name}</h3>
                    <p>Patient ID: {patient?.id}</p>
                  </div>
                </div>

                {/* QR Code Section */}
                <div style={{ textAlign: 'center', padding: '16px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontSize: '0.85rem', color: '#4B5563', marginBottom: '12px', fontWeight: '600' }}>Your Medical QR Code</p>
                  <div style={{ padding: '8px', background: '#fff', borderRadius: '8px', display: 'inline-block' }}>
                    <QRCodeSVG value={patient?.id || ''} size={120} level={"H"} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '12px', margin: 0 }}>Show this to your doctor to instantly share records</p>
                </div>
              </div>

              <div className="profile-sections">
                {/* Personal Information */}
                <div className="profile-section">
                  <h4><i className="fas fa-user"></i> Personal Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Full Name</span>
                      {isEditingProfile
                        ? <input type="text" name="name" className="edit-input" value={editFormData.name} onChange={handleEditChange} />
                        : <span className="profile-value">{patient?.name || 'Not provided'}</span>}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Email</span>
                      <span className="profile-value">{patient?.email || 'Not provided'}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Phone</span>
                      {isEditingProfile
                        ? <input type="text" name="phone" className="edit-input" value={editFormData.phone} onChange={handleEditChange} />
                        : <span className="profile-value">{patient?.phone || 'Not provided'}</span>}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Date of Birth</span>
                      {isEditingProfile
                        ? <input type="date" name="dateOfBirth" className="edit-input" value={editFormData.dateOfBirth} onChange={handleEditChange} />
                        : <span className="profile-value">{patient?.dateOfBirth || 'Not provided'}</span>}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Gender</span>
                      {isEditingProfile
                        ? (
                          <select name="gender" className="edit-input" value={editFormData.gender} onChange={handleEditChange}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        )
                        : <span className="profile-value">{patient?.gender || 'Not provided'}</span>}
                    </div>
                  </div>
                </div>

                {/* Medical Information + BMI */}
                <div className="profile-section">
                  <h4><i className="fas fa-notes-medical"></i> Medical Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Blood Group</span>
                      {isEditingProfile
                        ? (
                          <select name="bloodGroup" className="edit-input" value={editFormData.bloodGroup} onChange={handleEditChange}>
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option><option value="A-">A-</option>
                            <option value="B+">B+</option><option value="B-">B-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                            <option value="O+">O+</option><option value="O-">O-</option>
                          </select>
                        )
                        : <span className="profile-value">{patient?.bloodGroup || 'Not recorded'}</span>}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Height (cm)</span>
                      {isEditingProfile
                        ? <input type="number" name="height" className="edit-input" value={editFormData.height} onChange={handleEditChange} placeholder="e.g. 175" />
                        : <span className="profile-value">{patient?.height ? `${patient.height} cm` : 'Not recorded'}</span>}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Weight (kg)</span>
                      {isEditingProfile
                        ? <input type="number" name="weight" className="edit-input" value={editFormData.weight} onChange={handleEditChange} placeholder="e.g. 70" />
                        : <span className="profile-value">{patient?.weight ? `${patient.weight} kg` : 'Not recorded'}</span>}
                    </div>
                    {/* BMI display */}
                    {bmi && (
                      <div className="profile-item">
                        <span className="profile-label">BMI</span>
                        <span className="profile-value" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <strong style={{ color: bmiInfo.color, fontSize: '1.1rem' }}>{bmi}</strong>
                          <span style={{
                            padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600',
                            background: `${bmiInfo.color}20`, color: bmiInfo.color
                          }}>{bmiInfo.label}</span>
                        </span>
                      </div>
                    )}
                    <div className="profile-item">
                      <span className="profile-label">Allergies</span>
                      {isEditingProfile
                        ? <textarea name="allergies" className="edit-input" value={editFormData.allergies} onChange={handleEditChange} placeholder="Comma separated list" />
                        : <span className="profile-value">{patient?.allergies?.length > 0 ? (Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies) : 'None recorded'}</span>}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Current Medications</span>
                      {isEditingProfile
                        ? <textarea name="currentMedications" className="edit-input" value={editFormData.currentMedications} onChange={handleEditChange} placeholder="Comma separated list" />
                        : <span className="profile-value">{patient?.currentMedications?.length > 0 ? (Array.isArray(patient.currentMedications) ? patient.currentMedications.join(', ') : patient.currentMedications) : 'None recorded'}</span>}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="profile-section">
                  <h4><i className="fas fa-address-card"></i> Contact Information</h4>
                  <div className="profile-grid">
                    <div className="profile-item">
                      <span className="profile-label">Emergency Contact Name</span>
                      {isEditingProfile
                        ? <input type="text" name="emergencyContact" className="edit-input" value={editFormData.emergencyContact} onChange={handleEditChange} />
                        : <span className="profile-value">{patient?.emergencyContact || 'Not provided'}</span>}
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Emergency Phone</span>
                      {isEditingProfile
                        ? <input type="text" name="emergencyPhone" className="edit-input" value={editFormData.emergencyPhone} onChange={handleEditChange} />
                        : <span className="profile-value">{patient?.emergencyPhone || 'Not provided'}</span>}
                    </div>
                    <div className="profile-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="profile-label">Address</span>
                      {isEditingProfile
                        ? <textarea name="address" className="edit-input" value={editFormData.address} onChange={handleEditChange} />
                        : <span className="profile-value">{patient?.address || 'Not provided'}</span>}
                    </div>
                  </div>
                </div>

                {/* Insurance */}
                {(isEditingProfile || patient?.insuranceProvider || patient?.insuranceId) && (
                  <div className="profile-section">
                    <h4><i className="fas fa-shield-alt"></i> Insurance Information</h4>
                    <div className="profile-grid">
                      <div className="profile-item">
                        <span className="profile-label">Insurance Provider</span>
                        {isEditingProfile
                          ? <input type="text" name="insuranceProvider" className="edit-input" value={editFormData.insuranceProvider} onChange={handleEditChange} />
                          : <span className="profile-value">{patient?.insuranceProvider || 'Not provided'}</span>}
                      </div>
                      <div className="profile-item">
                        <span className="profile-label">Insurance ID</span>
                        {isEditingProfile
                          ? <input type="text" name="insuranceId" className="edit-input" value={editFormData.insuranceId} onChange={handleEditChange} />
                          : <span className="profile-value">{patient?.insuranceId || 'Not provided'}</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;