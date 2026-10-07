import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { use3DTilt } from '../hooks/use3DTilt';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('Card');
  const [cardLastFour, setCardLastFour] = useState('4242');
  const [transactionId, setTransactionId] = useState('UPI-VEL-8921');
  const [processing, setProcessing] = useState(false);

  const cardRef = use3DTilt(6, -4, 1.01);

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await api.getBooking(id);
        if (res && res.booking) {
          setBooking(res.booking);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await api.processPayment(id, {
        method,
        card_last_four: cardLastFour,
        transaction_id: transactionId,
      });

      if (res && res.success) {
        showToast('Payment successfully authorized & settled!', 'success');
        navigate(`/receipt/${id}`);
      } else {
        showToast('Payment authorization failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Payment processing error.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-cyan-400 text-lg">
        <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Connecting to payment gateway...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Reservation Not Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 pt-10 pb-20">
      <div ref={cardRef} className="card-3d tilt-card p-8 md:p-10 border-cyan-500/30">
        <div className="text-center mb-6">
          <div
            className="logo-icon-3d mx-auto mb-4"
            style={{
              width: 52,
              height: 52,
              fontSize: '1.4rem',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            }}
          >
            <i className="fas fa-shield-check"></i>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Secure Payment Terminal</h1>
          <p className="text-slate-400 text-sm">
            Booking #VEL-{booking.booking_id} &bull; {booking.car?.brand} {booking.car?.model}
          </p>
        </div>

        {/* Total Bill Card */}
        <div className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-5 mb-6 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Total Invoice Amount</span>
            <div className="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans'] mt-0.5">
              ₹{Number(booking.total_amount).toLocaleString('en-IN')}
            </div>
          </div>
          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <i className="fas fa-lock"></i> 256-Bit SSL
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Method Selection */}
          <div className="form-group-3d mb-5">
            <label>
              <i className="fas fa-credit-card text-cyan-400"></i> Select Payment Instrument
            </label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {['Card', 'Online', 'Cash'].map((m) => (
                <label
                  key={m}
                  className={`bg-white/[0.04] border rounded-xl p-3.5 cursor-pointer flex flex-col items-center gap-2 transition-all ${
                    method === m
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m}
                    checked={method === m}
                    onChange={() => setMethod(m)}
                    className="accent-cyan-400"
                  />
                  <span className="text-sm font-semibold text-white">
                    {m === 'Online' ? 'UPI / Online' : m}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Conditional Fields */}
          {method === 'Card' && (
            <div className="form-group-3d mb-5">
              <label>
                <i className="fas fa-credit-card text-cyan-400"></i> Last 4 Digits of Card (Simulation)
              </label>
              <input
                type="text"
                maxLength="4"
                value={cardLastFour}
                onChange={(e) => setCardLastFour(e.target.value)}
                placeholder="4242"
                className="input-3d"
              />
            </div>
          )}

          {method === 'Online' && (
            <div className="form-group-3d mb-5">
              <label>
                <i className="fas fa-receipt text-cyan-400"></i> Transaction Reference (Simulation)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. UPI-TXN-98243"
                className="input-3d"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={processing}
            className="btn-3d btn-3d-primary w-full h-12 text-base"
          >
            {processing ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i> Authorizing Transaction...
              </>
            ) : (
              <>
                <i className="fas fa-circle-check mr-2"></i> Authorize & Pay ₹{Number(booking.total_amount).toLocaleString('en-IN')}
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          <i className="fas fa-info-circle mr-1"></i> Simulation Environment: No actual bank or credit card balance will be deducted.
        </p>
      </div>
    </div>
  );
}
