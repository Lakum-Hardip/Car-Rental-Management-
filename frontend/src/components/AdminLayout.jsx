import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Admin session ended.', 'info');
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin-panel', label: 'Overview', icon: 'fas fa-gauge-high', end: true },
    { to: '/admin-panel/cars', label: 'Vehicle Fleet', icon: 'fas fa-car-side' },
    { to: '/admin-panel/cars/add', label: 'Add New Vehicle', icon: 'fas fa-circle-plus' },
    { to: '/admin-panel/bookings', label: 'Reservations', icon: 'fas fa-calendar-check' },
    { to: '/admin-panel/customers', label: 'Driver Database', icon: 'fas fa-users' },
    { to: '/admin-panel/reports', label: 'Analytics & Reports', icon: 'fas fa-chart-line' },
    { to: '/admin-panel/maintenance', label: 'Garage & Service', icon: 'fas fa-wrench' },
    { to: '/admin-panel/payments', label: 'Payment Ledger', icon: 'fas fa-credit-card' },
    { to: '/admin-panel/activity-logs', label: 'Security Audit', icon: 'fas fa-clock-rotate-left' },
  ];

  return (
    <div className="admin-layout flex flex-col md:flex-row min-h-screen bg-[#080b11]">
      {/* 3D Glass Sidebar */}
      <aside className="admin-sidebar md:w-72 bg-[#0d1321]/95 backdrop-blur-xl border-r border-white/10 shrink-0 flex flex-col z-40">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="logo-icon-3d" style={{ width: 40, height: 40, fontSize: '1rem' }}>
            <i className="fas fa-shield-halved"></i>
          </div>
          <div>
            <div className="font-extrabold text-white font-['Plus_Jakarta_Sans'] leading-tight">
              VELOCITY <span className="text-gradient-cyan">3D</span>
            </div>
            <div className="text-[11px] text-cyan-400 font-mono tracking-wider">
              Fleet Command Matrix
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="p-4 flex flex-col gap-1.5 flex-1 overflow-y-auto">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-white border border-cyan-500/30 translate-x-1 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              <i className={`${item.icon} w-5 text-center text-cyan-400`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="mt-auto border-t border-white/10 pt-4 mt-6">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-cyan-300 hover:bg-white/[0.03]"
            >
              <i className="fas fa-arrow-up-right-from-square w-5 text-center text-cyan-400"></i>
              <span>Live Portal</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 cursor-pointer bg-transparent border-none text-left"
            >
              <i className="fas fa-sign-out-alt w-5 text-center text-red-400"></i>
              <span>End Session</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto relative">
        <Outlet />
      </main>
    </div>
  );
}
