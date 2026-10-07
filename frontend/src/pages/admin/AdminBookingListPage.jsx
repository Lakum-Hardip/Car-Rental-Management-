import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export default function AdminBookingListPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayment = async (bookingId, currentStatus) => {
    const nextStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    try {
      await api.updateAdminBooking(bookingId, { payment_status: nextStatus });
      showToast(`Booking #VEL-${bookingId} marked as ${nextStatus}.`, 'success');
      setBookings((prev) =>
        prev.map((b) => (b.booking_id === bookingId ? { ...b, payment_status: nextStatus } : b))
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to update booking status.', 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Cancel reservation #VEL-${bookingId}?`)) return;
    try {
      await api.updateAdminBooking(bookingId, { is_cancelled: true });
      showToast(`Booking #VEL-${bookingId} cancelled.`, 'info');
      setBookings((prev) =>
        prev.map((b) => (b.booking_id === bookingId ? { ...b, is_cancelled: true } : b))
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel reservation.', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Reservations Ledger</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Manage customer reservations, settlement states, and cancellations
          </p>
        </div>
      </div>

      <div className="table-3d-wrap">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-cyan-400">
            <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Loading reservations ledger...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-3d">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Dates</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Booking State</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.booking_id}>
                    <td className="font-mono text-cyan-400 font-semibold">#VEL-{b.booking_id}</td>
                    <td className="font-semibold text-white">{b.customer_name || 'Driver'}</td>
                    <td>{b.car ? `${b.car.brand} ${b.car.model}` : 'Vehicle'}</td>
                    <td className="text-xs text-slate-400">
                      {b.start_date} &rarr; {b.end_date}
                    </td>
                    <td className="font-bold text-white text-sm">
                      ₹{Number(b.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePayment(b.booking_id, b.payment_status)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                          b.payment_status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                        title="Click to toggle Paid/Unpaid"
                      >
                        {b.payment_status} <i className="fas fa-arrows-rotate text-[10px] ml-1"></i>
                      </button>
                    </td>
                    <td>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                          b.is_cancelled ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {b.is_cancelled ? 'Cancelled' : 'Active'}
                      </span>
                    </td>
                    <td>
                      {!b.is_cancelled && (
                        <button
                          onClick={() => handleCancelBooking(b.booking_id)}
                          className="btn-3d btn-3d-danger btn-3d-sm py-1.5 px-3 text-xs cursor-pointer"
                        >
                          <i className="fas fa-ban mr-1"></i> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
