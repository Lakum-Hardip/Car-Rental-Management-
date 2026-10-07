import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, userType, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    showToast('You have been logged out successfully.', 'info');
    navigate('/');
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="logo-brand">
          <div className="logo-icon-3d">
            <i className="fas fa-bolt text-lg"></i>
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            VELOCITY<span className="text-gradient-cyan">3D</span>
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active text-white' : ''}`}
          >
            <i className="fas fa-home mr-1.5 text-xs text-cyan-400"></i> Home
          </NavLink>

          <NavLink
            to="/cars"
            className={({ isActive }) => `nav-link ${isActive ? 'active text-white' : ''}`}
          >
            <i className="fas fa-car-side mr-1.5 text-xs text-cyan-400"></i> Explore Fleet
          </NavLink>

          {userType === 'customer' ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active text-white' : ''}`}
              >
                <i className="fas fa-calendar-check mr-1.5 text-xs text-cyan-400"></i> Bookings
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-link ${isActive ? 'active text-white' : ''}`}
              >
                <i className="fas fa-user-circle mr-1.5 text-xs text-cyan-400"></i> Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="nav-link text-red-400 hover:text-red-300 cursor-pointer bg-transparent border-none"
              >
                <i className="fas fa-sign-out-alt mr-1"></i> Logout
              </button>
              <Link to="/dashboard" className="btn-3d btn-3d-primary btn-3d-sm">
                <i className="fas fa-gauge-high"></i> Dashboard
              </Link>
            </>
          ) : userType === 'admin' ? (
            <>
              <NavLink
                to="/admin-panel"
                className={({ isActive }) => `nav-link ${isActive ? 'active text-white' : ''}`}
              >
                <i className="fas fa-shield-halved mr-1.5 text-xs text-cyan-400"></i> Control Panel
              </NavLink>
              <button
                onClick={handleLogout}
                className="nav-link text-red-400 hover:text-red-300 cursor-pointer bg-transparent border-none"
              >
                <i className="fas fa-sign-out-alt mr-1"></i> Logout
              </button>
              <Link to="/admin-panel" className="btn-3d btn-3d-primary btn-3d-sm">
                <i className="fas fa-gauge-high"></i> Admin Panel
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <i className="fas fa-arrow-right-to-bracket mr-1"></i> Login
              </Link>
              <Link to="/register" className="nav-link">
                <i className="fas fa-user-plus mr-1"></i> Register
              </Link>
              <Link to="/login" className="btn-3d btn-3d-primary btn-3d-sm">
                <i className="fas fa-key"></i> Sign In
              </Link>
              <Link to="/admin/login" className="btn-3d btn-3d-glass btn-3d-sm">
                <i className="fas fa-shield-alt"></i> Admin
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
