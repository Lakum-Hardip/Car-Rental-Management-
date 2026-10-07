import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { use3DTilt } from '../../hooks/use3DTilt';
import { api } from '../../services/api';

export default function AdminCustomerProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardRef = use3DTilt(6, -4, 1.01);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getAdminCustomerDetail(id);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-cyan-400">
        <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Loading driver profile telemetry...
      </div>
    );
  }

  const customer = data?.customer;
  const bookings = data?.bookings || [];

  return (
    <div>
      <Link to="/admin-panel/customers" className="btn-3d btn-3d-glass btn-3d-sm mb-6 inline-flex">
        <i className="fas fa-arrow-left mr-2"></i> Back to Driver Database
      </Link>

      <div ref={cardRef} className="card-3d tilt-card p-8 mb-8 border-cyan-500/30">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-300 font-extrabold flex items-center justify-center text-2xl border border-cyan-500/40">
            {customer?.name ? customer.name[0].toUpperCase() : 'D'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{customer?.name}</h1>
            <p className="text-slate-400 text-sm font-mono mt-0.5">
              CUSTOMER ID: #{customer?.customer_id} &bull; LICENSE: {customer?.license_no}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10 text-sm">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Email Address</span>
            <strong className="text-white mt-1 block">{customer?.email}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Phone Number</span>
            <strong className="text-white mt-1 block font-mono">{customer?.phone_no}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Billing Address</span>
            <strong className="text-white mt-1 block">{customer?.address || 'Not specified'}</strong>
          </div>
        </div>
      </div>

      {/* Bookings History */}
      <div className="table-3d-wrap">
        <h2 className="text-xl font-bold text-white mb-4">Reservation History</h2>
        <div className="overflow-x-auto">
          <table className="table-3d">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Vehicle</th>
                <th>Schedule</th>
                <th>Total Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b.booking_id}>
                    <td className="font-mono text-cyan-400">#VEL-{b.booking_id}</td>
                    <td className="text-white font-semibold">
                      {b.car ? `${b.car.brand} ${b.car.model}` : 'Vehicle'}
                    </td>
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
                  <td colSpan="5" className="text-center py-6 text-slate-500">
                    No reservations logged for this customer.
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
