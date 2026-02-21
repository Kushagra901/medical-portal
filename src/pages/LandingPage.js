import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '10,000+', label: 'Active Patients', icon: 'fas fa-users' },
    { value: '500+', label: 'Registered Doctors', icon: 'fas fa-user-md' },
    { value: '50,000+', label: 'Prescriptions', icon: 'fas fa-prescription' },
    { value: '99.9%', label: 'Uptime', icon: 'fas fa-chart-line' }
  ];

  const features = [
    {
      icon: 'fas fa-shield-alt',
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security for your medical data',
      color: '#2563EB'
    },
    {
      icon: 'fas fa-robot',
      title: 'AI-Powered',
      description: 'Intelligent suggestions for prescriptions and diagnoses',
      color: '#7C3AED'
    },
    {
      icon: 'fas fa-clock',
      title: '24/7 Access',
      description: 'Access patient records anytime, anywhere',
      color: '#059669'
    },
    {
      icon: 'fas fa-chart-pie',
      title: 'Analytics',
      description: 'Track outcomes and practice performance',
      color: '#DC2626'
    }
  ];

  const steps = [
    { number: '01', title: 'Create Account', description: 'Sign up as a doctor or patient in minutes' },
    { number: '02', title: 'Complete Profile', description: 'Add your professional or personal information' },
    { number: '03', title: 'Start Using', description: 'Access all features based on your role' }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            Trusted by 500+ Healthcare Professionals
          </div>
          <h1 className="hero-title">
            Modern Healthcare<br />
            <span className="gradient-text">Management Platform</span>
          </h1>
          <p className="hero-subtitle">
            Streamline your practice with our comprehensive medical portal. 
            Secure, efficient, and designed for modern healthcare.
          </p>
          <div className="hero-actions">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => navigate('/doctor/auth')}
            >
              <i className="fas fa-user-md"></i>
              Doctor Portal
            </button>
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => navigate('/patient/auth')}
            >
              <i className="fas fa-user-injured"></i>
              Patient Portal
            </button>
          </div>
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <i className={stat.icon}></i>
                <div>
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-shape"></div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why Choose Us</span>
            <h2 className="section-title">Comprehensive Healthcare Solution</h2>
            <p className="section-subtitle">
              Everything you need to manage your practice efficiently
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{ '--hover-color': feature.color }}>
                <div className="feature-icon" style={{ background: `${feature.color}15` }}>
                  <i className={feature.icon} style={{ color: feature.color }}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-hover"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header light">
            <span className="section-tag">Simple Process</span>
            <h2 className="section-title">Get Started in 3 Easy Steps</h2>
            <p className="section-subtitle">
              Join thousands of healthcare professionals using our platform
            </p>
          </div>

          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="step-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Practice?</h2>
            <p>Join thousands of healthcare professionals using MediCare</p>
            <div className="cta-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => navigate('/doctor/auth')}
              >
                <i className="fas fa-user-md"></i>
                Doctor Sign Up
              </button>
              <button 
                className="btn btn-outline-light btn-large"
                onClick={() => navigate('/patient/auth')}
              >
                <i className="fas fa-user-injured"></i>
                Patient Sign Up
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <i className="fas fa-heartbeat"></i>
                <span>MediCare</span>
              </div>
              <p>Revolutionizing healthcare management through technology</p>
              <div className="social-links">
                <a href="#"><i className="fab fa-linkedin"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-facebook"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">FAQs</a></li>
              </ul>
            </div>
            <div className="footer-contact">
              <h4>Contact Us</h4>
              <p><i className="fas fa-phone"></i> +1 (800) 123-4567</p>
              <p><i className="fas fa-envelope"></i> support@medicare.com</p>
              <p><i className="fas fa-map-marker-alt"></i> 123 Medical Center, NY</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 MediCare Portal. All rights reserved.</p>
            <div className="footer-badges">
              <span><i className="fas fa-shield-alt"></i> HIPAA Compliant</span>
              <span><i className="fas fa-lock"></i> 256-bit SSL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;