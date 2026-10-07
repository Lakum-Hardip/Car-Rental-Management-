import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { use3DTilt } from '../hooks/use3DTilt';
import { api } from '../services/api';

export default function ReceiptPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardRef = use3DTilt(6, -4, 1.01);

  useEffect(() => {
    async function loadReceipt() {
      try {
        const res = await api.getBooking(id);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReceipt();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-cyan-400 text-lg">
        <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Generating digital receipt...
      </div>
    );
  }

  const booking = data?.booking;
  const customer = data?.customer;
  const payment = data?.payment;

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Invoice Not Found</h2>
        <Link to="/dashboard" className="btn-3d btn-3d-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-10 pb-20">
      <div ref={cardRef} className="card-3d tilt-card p-8 md:p-10 border-emerald-500/30">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-400">
              <i className="fas fa-check"></i>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Booking Confirmed</h1>
              <span className="font-mono text-xs text-slate-400">
                INVOICE REF #VEL-{booking.booking_id}
              </span>
            </div>
          </div>
          <button onClick={handlePrint} className="btn-3d btn-3d-glass btn-3d-sm">
            <i className="fas fa-file-pdf text-red-400 mr-1.5"></i> Print / PDF
          </button>
        </div>

        {/* Breakdown Table */}
        <div className="bg-[#0f172a]/60 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex flex-col gap-3.5 text-sm">
            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-slate-400">Customer Name</span>
              <strong className="text-white">{customer?.name || 'Hardip Lakum'}</strong>
            </div>

            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-slate-400">Email Address</span>
              <strong className="text-white">{customer?.email || 'customer@velocity.com'}</strong>
            </div>

            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-slate-400">Vehicle Model</span>
              <strong className="text-white">
                {booking.car?.brand} {booking.car?.model} ({booking.car?.reg_no})
              </strong>
            </div>

            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-slate-400">Rental Duration</span>
              <strong className="text-white">
                {booking.start_date} to {booking.end_date}
              </strong>
            </div>

            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-slate-400">Settlement Method</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <i className="fas fa-check-double text-xs"></i> {payment?.method || 'Card Authorization'} &bull; Settled
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-2">
              <span className="text-base font-bold text-white">Total Paid</span>
              <strong className="text-2xl font-extrabold text-cyan-300 font-['Plus_Jakarta_Sans']">
                ₹{Number(booking.total_amount).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>

        {/* Active Telematics Notice */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-300 flex items-center gap-3 mb-6 text-sm">
          <i className="fas fa-satellite-dish text-lg"></i>
          <span>Vehicle telematic link has been activated for this reservation period.</span>
        </div>

        {/* Next Actions */}
        <div className="flex gap-3.5 flex-wrap">
          <Link
            to={`/tracking/${booking.booking_id}`}
            className="btn-3d btn-3d-primary flex-1 py-3 text-center"
          >
            <i className="fas fa-location-dot mr-2"></i> Live GPS Vehicle Tracking
          </Link>
          <Link
            to="/dashboard"
            className="btn-3d btn-3d-glass flex-1 py-3 text-center"
          >
            <i className="fas fa-gauge-high mr-2"></i> Driver Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
