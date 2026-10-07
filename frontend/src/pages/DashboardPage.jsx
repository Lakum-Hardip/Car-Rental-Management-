import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { use3DTilt } from '../hooks/use3DTilt';
import { api } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const bannerRef = use3DTilt(6, -4, 1.01);

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await api.getBookings();
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await api.cancelBooking(bookingId);
      if (res && res.success) {
        showToast('Reservation has been cancelled.', 'info');
        setBookings((prev) =>
          prev.map((b) => (b.booking_id === bookingId ? { ...b, is_cancelled: true } : b))
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Cancellation error occurred.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20">
      {/* Welcome Header Banner in 3D Card */}
      <div
        ref={bannerRef}
        className="card-3d tilt-card mb-10 p-8 border-cyan-500/30"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 182, 212, 0.15) 100%)',
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-5">
          <div>
            <div className="hero-badge mb-2">
              <i className="fas fa-id-badge"></i> Authenticated Driver
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Welcome back, <span className="text-gradient">{user?.name || 'Driver'}</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Email: {user?.email || 'driver@velocity.com'} &bull; License: {user?.license_no || 'Verified'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/profile" className="btn-3d btn-3d-glass btn-3d-sm">
              <i className="fas fa-user-pen mr-1.5"></i> Edit Profile
            </Link>
            <Link to="/cars" className="btn-3d btn-3d-primary btn-3d-sm">
              <i className="fas fa-plus mr-1.5"></i> New Reservation
            </Link>
          </div>
        </div>
      </div>

      {/* Reservation History Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your Reservation History</h2>
        <span className="text-sm text-slate-400">{bookings.length} trips on record</span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-cyan-400 text-lg">
          <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Synchronizing reservation telemetry...
        </div>
      ) : bookings.length > 0 ? (
        <div className="flex flex-col gap-5">
          {bookings.map((b) => (
            <div key={b.booking_id} className="card-3d p-6">
              <div className="flex justify-between items-center flex-wrap gap-5">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-2xl text-cyan-400">
                    <i className="fas fa-car"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {b.car?.brand} {b.car?.model}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      <i className="fas fa-calendar text-cyan-400 mr-1.5"></i>
                      {b.start_date} to {b.end_date} &bull;{' '}
                      <span className="font-mono text-slate-500">REG: {b.car?.reg_no}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
                    ₹{Number(b.total_amount).toLocaleString('en-IN')}
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                      b.is_cancelled
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : b.payment_status === 'Paid'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <i
                      className={`fas ${
                        b.is_cancelled
                          ? 'fa-ban'
                          : b.payment_status === 'Paid'
                          ? 'fa-check-circle'
                          : 'fa-clock'
                      } mr-1`}
                    />
                    {b.is_cancelled ? 'Cancelled' : b.payment_status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-white/10 flex-wrap">
                <Link to={`/receipt/${b.booking_id}`} className="btn-3d btn-3d-glass btn-3d-sm">
                  <i className="fas fa-receipt mr-1"></i> Invoice
                </Link>
                <Link to={`/tracking/${b.booking_id}`} className="btn-3d btn-3d-glass btn-3d-sm">
                  <i className="fas fa-location-dot text-cyan-400 mr-1"></i> Live GPS
                </Link>

                {!b.is_cancelled && b.payment_status === 'Unpaid' && (
                  <>
                    <Link to={`/payment/${b.booking_id}`} className="btn-3d btn-3d-primary btn-3d-sm">
                      <i className="fas fa-credit-card mr-1"></i> Pay Now
                    </Link>
                    <button
                      onClick={() => handleCancel(b.booking_id)}
                      className="btn-3d btn-3d-danger btn-3d-sm cursor-pointer"
                    >
                      <i className="fas fa-xmark mr-1"></i> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-3d text-center py-16 px-6">
          <i className="fas fa-calendar-xmark text-5xl text-slate-500 mb-4"></i>
          <h3 className="text-xl font-bold text-white mb-2">No Reservations on Record</h3>
          <p className="text-slate-400 mb-6">You haven't reserved any vehicles yet. Discover our premium available fleet.</p>
          <Link to="/cars" className="btn-3d btn-3d-primary">
            <i className="fas fa-car-side mr-2"></i> Browse Fleet
          </Link>
        </div>
      )}
    </div>
  );
}
