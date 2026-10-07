import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { use3DTilt } from '../hooks/use3DTilt';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userType } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialStart = searchParams.get('start_date') || '';
  const initialEnd = searchParams.get('end_date') || '';

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cardRef = use3DTilt(6, -4, 1.01);

  useEffect(() => {
    async function loadCar() {
      try {
        const data = await api.getCar(id);
        setCar(data);
      } catch (err) {
        console.error('Failed to load car:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCar();
  }, [id]);

  const today = new Date().toISOString().split('T')[0];

  // Calculation
  let durationDays = 0;
  let totalPayable = 0;
  if (startDate && endDate && car) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e >= s) {
      durationDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
      totalPayable = durationDays * car.rent_per_day;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      showToast('Please select both pick-up and return dates.', 'warning');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      showToast('Return date must be on or after pick-up date.', 'error');
      return;
    }
    if (!acceptTerms) {
      showToast('You must accept the digital rental agreement terms.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createBooking({
        car_id: car.car_id,
        start_date: startDate,
        end_date: endDate,
        contract_accepted: true,
      });

      if (res && res.booking_id) {
        showToast('Reservation confirmed! Proceeding to payment terminal.', 'success');
        navigate(`/payment/${res.booking_id}`);
      } else {
        showToast('Failed to create reservation.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Booking service error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-cyan-400 text-lg">
        <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Initializing reservation terminal...
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Vehicle Not Found</h2>
        <Link to="/cars" className="btn-3d btn-3d-primary">Back to Fleet</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-10 pb-20">
      <Link to={`/cars/${car.car_id}`} className="btn-3d btn-3d-glass btn-3d-sm mb-6 inline-flex">
        <i className="fas fa-arrow-left mr-2"></i> Back to Vehicle Details
      </Link>

      <div ref={cardRef} className="card-3d tilt-card p-8 md:p-10 border-cyan-500/30">
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6 flex-wrap gap-4">
          <div>
            <span className="hero-badge mb-2">
              <i className="fas fa-bolt"></i> Instant Confirmation
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              Reserve {car.brand} <span className="text-gradient">{car.model}</span>
            </h1>
            <p className="text-slate-400 text-xs font-mono mt-1">
              REG: {car.reg_no} &bull; {car.vehicle_type}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
              ₹{Number(car.rent_per_day).toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-400">per 24 hrs</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="form-group-3d">
              <label>
                <i className="fas fa-calendar-alt text-cyan-400"></i> Pick-up Date *
              </label>
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="input-3d"
              />
            </div>
            <div className="form-group-3d">
              <label>
                <i className="fas fa-calendar-check text-cyan-400"></i> Return Date *
              </label>
              <input
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="input-3d"
              />
            </div>
          </div>

          {/* Dynamic Calculation Box */}
          {durationDays > 0 && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5 mb-6 animate-pulseGlow">
              <div className="flex justify-between items-center text-sm text-slate-300">
                <span>Estimated Rental Duration:</span>
                <strong className="text-white text-base">
                  {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
                </strong>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                <span className="text-sm text-slate-300">Total Payable:</span>
                <strong className="text-2xl font-extrabold text-cyan-300 font-['Plus_Jakarta_Sans']">
                  ₹{Number(totalPayable).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          )}

          {/* Digital Rental Agreement */}
          <div className="bg-[#0f172a]/70 border border-white/10 rounded-2xl p-5 mb-6">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <i className="fas fa-file-contract text-cyan-400"></i> Velocity Digital Rental Agreement
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              By confirming this reservation, you acknowledge and agree that:
              1) The vehicle must be returned at or before the scheduled return date;
              2) Fuel level must match the dispatch level;
              3) Speed limits and safety regulations must be observed. GPS telemetry is active for security and emergency roadside dispatch.
            </p>
            <label className="flex items-center gap-3 cursor-pointer text-white text-sm font-medium">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
              <span>I have read and unconditionally accept the rental agreement</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-3d btn-3d-primary w-full h-12 text-base"
          >
            {submitting ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i> Confirming Reservation...
              </>
            ) : (
              <>
                <i className="fas fa-lock mr-2"></i> Confirm & Proceed to Payment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
