import React from 'react';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="logo">
                    <i className="fas fa-heartbeat"></i>
                    <span>MediCare System</span>
                </div>
                <ul className="nav-menu">
                    <li><a href="#medicine-db" className="nav-link">
                        <i className="fas fa-pills"></i> Medicine DB
                    </a></li>
                    <li><a href="#patient-db" className="nav-link">
                        <i className="fas fa-user-injured"></i> Patient DB
                    </a></li>
                    <li><a href="#prescription" className="nav-link">
                        <i className="fas fa-file-prescription"></i> Prescription
                    </a></li>
                </ul>
                <div className="user-profile">
                    <i className="fas fa-user-md"></i>
                    <span>Dr. Smith</span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;