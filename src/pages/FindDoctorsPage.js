import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './FindDoctorsPage.css';

const FindDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/doctors');
      if (response.data.success) {
        setDoctors(response.data.doctors);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
                          (doc.specialization || '').toLowerCase().includes(search.toLowerCase());
    const matchesSpec   = spec ? (doc.specialization || '').toLowerCase() === spec.toLowerCase() : true;
    const matchesFee    = maxFee ? (doc.consultationFee || 0) <= parseFloat(maxFee) : true;
    return matchesSearch && matchesSpec && matchesFee;
  });

  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  const handleBook = (doctor) => {
    const patient = localStorage.getItem('patientUser');
    if (!patient) {
      alert('Please log in as a Patient to book appointments.');
      navigate('/patient/auth');
    } else {
      // Store selected doctor for instant booking page auto-select
      localStorage.setItem('selectedDoctorForBooking', JSON.stringify(doctor));
      navigate('/patient/dashboard');
    }
  };

  return (
    <div className="find-doctors-page">
      <header className="discovery-header">
        <div className="discovery-brand" onClick={() => navigate('/')}>
          <i className="fas fa-heartbeat"></i>
          <span>MediCare</span>
        </div>
        <button className="btn-back-portal" onClick={() => navigate('/')}>
          Back to Portal
        </button>
      </header>

      <div className="discovery-hero">
        <h1>Find Your Doctor</h1>
        <p>Book online consultations & clinic appointments with top rated specialists</p>
      </div>

      <div className="discovery-container">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <h3><i className="fas fa-filter"></i> Refine Search</h3>

          <div className="filter-group">
            <label>Search Doctor</label>
            <div className="search-input-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Name or Speciality"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Specialization</label>
            <select value={spec} onChange={(e) => setSpec(e.target.value)}>
              <option value="">All Specializations</option>
              {specializations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Max Consultation Fee (INR)</label>
            <input
              type="number"
              placeholder="e.g. 800"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
            />
          </div>

          <button className="btn-reset-filters" onClick={() => { setSearch(''); setSpec(''); setMaxFee(''); }}>
            Clear Filters
          </button>
        </aside>

        {/* Doctor Grid */}
        <main className="doctor-results">
          {loading ? (
            <div className="discovery-loading">
              <div className="spinner"></div>
              <p>Searching clinicians...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="no-docs-found">
              <i className="fas fa-user-slash"></i>
              <h3>No doctors found matching filters</h3>
              <p>Try broadening your query or selecting a different specialization.</p>
            </div>
          ) : (
            <div className="doctor-discovery-grid">
              {filteredDoctors.map(doc => (
                <div key={doc._id} className="discovery-doctor-card">
                  <div className="card-top">
                    <div className="doc-avatar">
                      {doc.profileImage ? (
                        <img src={doc.profileImage} alt={doc.name} />
                      ) : (
                        <i className="fas fa-user-md placeholder-avatar-icon"></i>
                      )}
                    </div>
                    <div className="doc-details">
                      <h4>Dr. {doc.name}</h4>
                      <span className="doc-speciality">{doc.specialization || 'General Physician'}</span>
                      <div className="rating-tag">
                        <i className="fas fa-star"></i> 4.8 (24 reviews)
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <p className="bio-summary">{doc.bio || 'Experienced consultant dedicated to quality patient care and medical excellence.'}</p>
                    <div className="info-bullets">
                      <div className="bullet"><i className="fas fa-map-marker-alt"></i> {doc.address || 'Clinic consult'}</div>
                      <div className="bullet"><i className="fas fa-clock"></i> Hours: {doc.availableTime || '9:00 AM - 5:00 PM'}</div>
                      <div className="bullet"><i className="fas fa-money-bill-wave"></i> Consultation Fee: <strong>INR {doc.consultationFee || '500'}</strong></div>
                    </div>
                  </div>

                  <button className="btn-book-consultation" onClick={() => handleBook(doc)}>
                    Book Appointment <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FindDoctorsPage;
