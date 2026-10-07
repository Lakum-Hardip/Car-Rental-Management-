import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-3d">
      <div className="max-w-7xl mx-auto px-6">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col">
            <Link to="/" className="logo-brand mb-4 inline-flex">
              <div className="logo-icon-3d" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                <i className="fas fa-bolt"></i>
              </div>
              <span className="text-lg font-bold">
                VELOCITY<span className="text-gradient-cyan">3D</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed mt-2">
              Next-generation automotive rental platform. Real-time GPS telematics, instant digital security contracts, and seamless high-performance reservations.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="btn-3d btn-3d-glass btn-3d-sm py-2 px-3">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="btn-3d btn-3d-glass btn-3d-sm py-2 px-3">
                <i className="fab fa-instagram"><a href='https://www.instagram.com/p/DTpTKegjNpb/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA=='></a></i>
              </a>
              <a href="#" className="btn-3d btn-3d-glass btn-3d-sm py-2 px-3">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                  <i className="fas fa-angle-right text-xs text-cyan-400"></i> Home Overview
                </Link>
              </li>
              <li>
                <Link to="/cars" className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                  <i className="fas fa-angle-right text-xs text-cyan-400"></i> Fleet Directory
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                  <i className="fas fa-angle-right text-xs text-cyan-400"></i> Customer Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                  <i className="fas fa-angle-right text-xs text-cyan-400"></i> Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Policies */}
          <div className="footer-col">
            <h4 className="text-white font-bold mb-4">Security & Policies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                  <i className="fas fa-angle-right text-xs text-cyan-400"></i> Digital Agreement
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                  <i className="fas fa-angle-right text-xs text-cyan-400"></i> GPS Telematics Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                  <i className="fas fa-angle-right text-xs text-cyan-400"></i> Refund Matrix
                </a>
              </li>
              <li>
                <Link to="/admin/login" className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                  <i className="fas fa-angle-right text-xs text-cyan-400"></i> Staff Terminal
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge */}
          <div className="footer-col">
            <h4 className="text-white font-bold mb-4">24/7 Concierge</h4>
            <p className="text-slate-400 text-sm mb-3">
              <i className="fas fa-phone-alt text-cyan-400 mr-2"></i>
              <a href="tel:+916354220182" className="text-white font-semibold hover:text-cyan-300">
                +91 6354220182
              </a>
            </p>
            <p className="text-slate-400 text-sm mb-4">
              <i className="fas fa-envelope text-cyan-400 mr-2"></i>
              <a href="mailto:lakumhardip11@gmail.com" className="text-white hover:text-cyan-300">
                lakumhardip11@gmail.com
              </a>
            </p>
            <div className="bg-cyan-500/10 border border-cyan-500/25 rounded-xl p-3 text-xs text-cyan-400 flex items-center gap-2">
              <i className="fas fa-shield-halved text-base"></i>
              <span>100% Encrypted Transactions & Telematics</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 VELOCITY 3D Automotive Management Systems. Designed with ultra-modern 3D visual standards.</p>
        </div>
      </div>
    </footer>
  );
}
