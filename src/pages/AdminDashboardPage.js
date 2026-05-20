import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStoredAdmin, adminLogout, getDashboardStats,
  getPendingDoctors, verifyDoctor, rejectDoctor, getAllUsers
} from '../services/adminService';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    pendingDoctors: 0,
    todayAppointments: 0
  });
  const [pendingDocs, setPendingDocs] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [allPats, setAllPats] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'doctors', 'patients', 'approvals'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentAdmin = getStoredAdmin();
    if (!currentAdmin) {
      navigate('/admin/login');
    } else {
      setAdmin(currentAdmin);
      loadDashboardData();
    }
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const dashboardStats = await getDashboardStats();
      if (dashboardStats) setStats(dashboardStats);

      const pendingList = await getPendingDoctors();
      if (pendingList) setPendingDocs(pendingList);

      const users = await getAllUsers();
      if (users) {
        setAllDocs(users.doctors || []);
        setAllPats(users.patients || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm('Are you sure you want to verify this doctor?')) return;
    try {
      await verifyDoctor(id);
      alert('Doctor verified successfully!');
      loadDashboardData();
    } catch (err) {
      alert('Verification failed.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to REJECT and remove this doctor request?')) return;
    try {
      await rejectDoctor(id);
      alert('Doctor request rejected.');
      loadDashboardData();
    } catch (err) {
      alert('Rejection failed.');
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  if (!admin) return null;

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <i className="fas fa-user-shield"></i>
          <h3>Admin Panel</h3>
          <p>MediCare Gateway</p>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-chart-pie"></i> Overview
          </button>
          <button 
            className={activeTab === 'approvals' ? 'active' : ''}
            onClick={() => setActiveTab('approvals')}
          >
            <i className="fas fa-user-check"></i> Pending Approvals
            {pendingDocs.length > 0 && <span className="badge-alert">{pendingDocs.length}</span>}
          </button>
          <button 
            className={activeTab === 'doctors' ? 'active' : ''}
            onClick={() => setActiveTab('doctors')}
          >
            <i className="fas fa-user-md"></i> Manage Doctors
          </button>
          <button 
            className={activeTab === 'patients' ? 'active' : ''}
            onClick={() => setActiveTab('patients')}
          >
            <i className="fas fa-user-injured"></i> Manage Patients
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Exit Console
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back, Admin</p>
          </div>
          <button className="btn-refresh" onClick={loadDashboardData} disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>} Refresh Data
          </button>
        </header>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Fetching metrics...</p>
          </div>
        ) : (
          <div className="admin-content">
            {activeTab === 'overview' && (
              <div className="tab-pane animate-fade-in">
                <div className="stats-grid-modern">
                  <div className="stat-card-modern doc">
                    <i className="fas fa-user-md"></i>
                    <div className="stat-info">
                      <h3>Total Doctors</h3>
                      <p>{stats.totalDoctors}</p>
                    </div>
                  </div>
                  <div className="stat-card-modern pat">
                    <i className="fas fa-user-injured"></i>
                    <div className="stat-info">
                      <h3>Total Patients</h3>
                      <p>{stats.totalPatients}</p>
                    </div>
                  </div>
                  <div className="stat-card-modern appt">
                    <i className="fas fa-calendar-check"></i>
                    <div className="stat-info">
                      <h3>Total Bookings</h3>
                      <p>{stats.totalAppointments}</p>
                    </div>
                  </div>
                  <div className="stat-card-modern today">
                    <i className="fas fa-clock"></i>
                    <div className="stat-info">
                      <h3>Today's Bookings</h3>
                      <p>{stats.todayAppointments}</p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-row">
                  <div className="dashboard-col approvals-preview-card">
                    <div className="card-header-modern">
                      <h3><i className="fas fa-user-check"></i> Approvals Queue ({pendingDocs.length})</h3>
                      <button onClick={() => setActiveTab('approvals')} className="btn-link">View All</button>
                    </div>
                    {pendingDocs.length === 0 ? (
                      <p className="no-data-msg">No pending verification requests</p>
                    ) : (
                      <div className="approval-list-preview">
                        {pendingDocs.slice(0, 3).map(doc => (
                          <div key={doc._id} className="approval-item-preview">
                            <div className="doc-avatar">
                              {doc.profileImage ? <img src={doc.profileImage} alt={doc.name} /> : <i className="fas fa-user-md"></i>}
                            </div>
                            <div className="doc-info">
                              <h4>Dr. {doc.name}</h4>
                              <p>{doc.specialization} • {doc.phone}</p>
                            </div>
                            <div className="action-btns">
                              <button onClick={() => handleVerify(doc._id)} className="btn-approve-sm" title="Verify">
                                <i className="fas fa-check"></i>
                              </button>
                              <button onClick={() => handleReject(doc._id)} className="btn-reject-sm" title="Reject">
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'approvals' && (
              <div className="tab-pane animate-fade-in">
                <h2>Pending Verifications</h2>
                <p className="section-subtitle">Approve doctor profiles to list them on doctor discovery page</p>

                {pendingDocs.length === 0 ? (
                  <div className="empty-state-box">
                    <i className="fas fa-check-double"></i>
                    <h3>All caught up!</h3>
                    <p>No pending doctor registration requests found.</p>
                  </div>
                ) : (
                  <div className="approvals-grid">
                    {pendingDocs.map(doc => (
                      <div key={doc._id} className="approval-card-detail">
                        <div className="card-top">
                          <div className="doc-image-section">
                            {doc.profileImage ? <img src={doc.profileImage} alt={doc.name} /> : <i className="fas fa-user-md placeholder-icon"></i>}
                          </div>
                          <div className="doc-meta">
                            <h3>Dr. {doc.name}</h3>
                            <span className="spec-badge">{doc.specialization}</span>
                            <p className="meta-item"><i className="fas fa-envelope"></i> {doc.email}</p>
                            <p className="meta-item"><i className="fas fa-phone"></i> {doc.phone}</p>
                            <p className="meta-item"><i className="fas fa-map-marker-alt"></i> {doc.address || 'Address not listed'}</p>
                            <p className="meta-item"><i className="fas fa-dollar-sign"></i> Consultation Fee: INR {doc.consultationFee || '500'}</p>
                          </div>
                        </div>
                        <div className="card-bio">
                          <strong>Bio:</strong> {doc.bio || 'No bio provided.'}
                        </div>
                        <div className="card-actions-row">
                          <button onClick={() => handleVerify(doc._id)} className="btn-approve-action">
                            <i className="fas fa-check"></i> Verify Profile
                          </button>
                          <button onClick={() => handleReject(doc._id)} className="btn-reject-action">
                            <i className="fas fa-trash-alt"></i> Reject Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'doctors' && (
              <div className="tab-pane animate-fade-in">
                <h2>Verified Clinicians ({allDocs.filter(d => d.isVerified).length})</h2>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Specialization</th>
                        <th>Fee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allDocs.map(doc => (
                        <tr key={doc._id}>
                          <td>
                            <div className="table-user">
                              {doc.profileImage ? <img src={doc.profileImage} alt={doc.name} className="table-avatar" /> : <i className="fas fa-user-md table-avatar-icon"></i>}
                              <strong>Dr. {doc.name}</strong>
                            </div>
                          </td>
                          <td>{doc.email}</td>
                          <td>{doc.phone}</td>
                          <td>{doc.specialization}</td>
                          <td>INR {doc.consultationFee}</td>
                          <td>
                            <span className={`status-badge ${doc.isVerified ? 'verified' : 'pending'}`}>
                              {doc.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'patients' && (
              <div className="tab-pane animate-fade-in">
                <h2>Registered Patients ({allPats.length})</h2>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Gender</th>
                        <th>Blood Group</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPats.map(pat => (
                        <tr key={pat._id}>
                          <td>
                            <div className="table-user">
                              <i className="fas fa-user-injured table-avatar-icon"></i>
                              <strong>{pat.name}</strong>
                            </div>
                          </td>
                          <td>{pat.email}</td>
                          <td>{pat.phone}</td>
                          <td>{pat.gender || 'Not specified'}</td>
                          <td>{pat.bloodGroup || 'Not specified'}</td>
                          <td>{new Date(pat.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
