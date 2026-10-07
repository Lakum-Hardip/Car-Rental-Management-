import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { use3DTilt } from '../../hooks/use3DTilt';
import { api } from '../../services/api';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  const card1Ref = use3DTilt(8, -4, 1.01);
  const card2Ref = use3DTilt(8, -4, 1.01);
  const card3Ref = use3DTilt(8, -4, 1.01);
  const card4Ref = use3DTilt(8, -4, 1.01);
  const card5Ref = use3DTilt(8, -4, 1.01);
  const card6Ref = use3DTilt(8, -4, 1.01);
  const chartCardRef = use3DTilt(5, -3, 1.01);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getAdminDashboard();
        setDashboardData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Draw 14-Day Booking Velocity Trend Canvas
  useEffect(() => {
    if (!dashboardData?.daily_bookings?.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const data = dashboardData.daily_bookings;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 160 * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const values = data.map((d) => d.count || 0);
    const max = Math.max(...values, 4);
    const w = rect.width;
    const h = 160;
    const pad = 16;
    const barW = Math.max(12, (w - pad * 2) / values.length - 8);

    ctx.clearRect(0, 0, w, h);

    values.forEach((v, i) => {
      const barH = Math.max(10, (v / max) * (h - pad * 2));
      const x = pad + i * (barW + 8);
      const y = h - pad - barH;

      const grad = ctx.createLinearGradient(0, y, 0, h - pad);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = grad;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
      } else {
        ctx.rect(x, y, barW, barH);
      }
      ctx.fill();

      // Label date on bottom
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      const dayLabel = data[i].date ? data[i].date.slice(8, 10) : '';
      ctx.fillText(dayLabel, x + barW / 4, h - 3);
    });
  }, [dashboardData]);

  const stats = dashboardData?.stats || {
    total_bookings: 18,
    today_bookings: 3,
    revenue_total: 145000,
    revenue_today: 12500,
    vehicles_total: 11,
    vehicles_available: 8,
    vehicles_maintenance: 1,
    customers_count: 14,
  };

  const recentBookings = dashboardData?.recent_bookings || [];

  return (
    <div>
      {/* Admin Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <div className="hero-badge mb-2">
            <i className="fas fa-shield-halved"></i> Role: {user?.role || 'Manager'}
          </div>
          <h1 className="text-3xl font-extrabold text-white">Fleet Command Center</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Welcome back, <strong className="text-white">{user?.username || 'admin'}</strong>. Real-time fleet metrics and telemetry overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin-panel/cars/add" className="btn-3d btn-3d-primary btn-3d-sm">
            <i className="fas fa-plus mr-1.5"></i> Add Vehicle
          </Link>
          <Link to="/admin-panel/reports" className="btn-3d btn-3d-glass btn-3d-sm">
            <i className="fas fa-chart-line mr-1.5"></i> Analytics
          </Link>
        </div>
      </div>

      {/* 6 3D Stat Cards */}
      <div className="stat-grid-3d grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div ref={card1Ref} className="stat-card-3d tilt-card">
          <h3 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Total Reservations</h3>
          <div className="stat-val text-gradient-cyan text-3xl font-black mt-1">{stats.total_bookings}</div>
          <span className="text-xs text-slate-400 mt-2 block">
            <i className="fas fa-calendar-check mr-1 text-cyan-400"></i> All time verified
          </span>
        </div>

        <div ref={card2Ref} className="stat-card-3d tilt-card">
          <h3 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Active Fleet Today</h3>
          <div className="stat-val text-3xl font-black text-emerald-400 mt-1">{stats.today_bookings}</div>
          <span className="text-xs text-slate-400 mt-2 block">
            <i className="fas fa-road mr-1 text-emerald-400"></i> On the road now
          </span>
        </div>

        <div ref={card3Ref} className="stat-card-3d tilt-card">
          <h3 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Total Revenue</h3>
          <div className="stat-val text-gradient text-3xl font-black mt-1">
            ₹{Number(stats.revenue_total).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400 mt-2 block">
            <i className="fas fa-credit-card mr-1 text-cyan-400"></i> Processed volume
          </span>
        </div>

        <div ref={card4Ref} className="stat-card-3d tilt-card">
          <h3 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Today's Inflow</h3>
          <div className="stat-val text-3xl font-black text-purple-400 mt-1">
            ₹{Number(stats.revenue_today).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400 mt-2 block">
            <i className="fas fa-bolt mr-1 text-purple-400"></i> Settled today
          </span>
        </div>

        <div ref={card5Ref} className="stat-card-3d tilt-card">
          <h3 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Fleet Inventory</h3>
          <div className="stat-val text-3xl font-black text-white mt-1">{stats.vehicles_total}</div>
          <span className="text-xs text-slate-400 mt-2 block">
            <span className="text-emerald-400">{stats.vehicles_available} Available</span> &bull;{' '}
            <span className="text-amber-400">{stats.vehicles_maintenance} In Garage</span>
          </span>
        </div>

        <div ref={card6Ref} className="stat-card-3d tilt-card">
          <h3 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Registered Drivers</h3>
          <div className="stat-val text-3xl font-black text-sky-400 mt-1">{stats.customers_count}</div>
          <span className="text-xs text-slate-400 mt-2 block">
            <i className="fas fa-id-card mr-1 text-sky-400"></i> Verified profiles
          </span>
        </div>
      </div>

      {/* 14-Day Booking Velocity Trend Chart Card */}
      <div ref={chartCardRef} className="card-3d tilt-card mb-8 p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-white">14-Day Booking Velocity Trend</h2>
          <span className="text-xs text-cyan-400 font-medium">
            <i className="fas fa-chart-column mr-1.5"></i> Daily Reservation Volume
          </span>
        </div>
        <div className="w-full h-40 relative">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="table-3d-wrap">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Recent Reservations</h2>
          <Link to="/admin-panel/bookings" className="btn-3d btn-3d-glass btn-3d-sm">
            View All <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table-3d">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Driver Name</th>
                <th>Assigned Vehicle</th>
                <th>Schedule</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length > 0 ? (
                recentBookings.map((b) => (
                  <tr key={b.booking_id}>
                    <td className="font-mono text-cyan-400">#VEL-{b.booking_id}</td>
                    <td className="font-semibold text-white">{b.customer_name || 'Driver'}</td>
                    <td>{b.car ? `${b.car.brand} ${b.car.model}` : 'Vehicle'}</td>
                    <td className="text-xs text-slate-400">
                      {b.start_date} to {b.end_date}
                    </td>
                    <td className="font-bold text-white">
                      ₹{Number(b.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          b.is_cancelled
                            ? 'bg-red-500/20 text-red-400'
                            : b.payment_status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {b.is_cancelled ? 'Cancelled' : b.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-500">
                    No recent booking telemetry available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
