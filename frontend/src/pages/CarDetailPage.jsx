import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { use3DTilt } from '../hooks/use3DTilt';
import { api } from '../services/api';

export default function CarDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const imageCardRef = use3DTilt(10, -6, 1.02);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-cyan-400 text-lg">
        <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Loading vehicle specs...
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Vehicle Not Found</h2>
        <Link to="/cars" className="btn-3d btn-3d-primary">
          Back to Fleet
        </Link>
      </div>
    );
  }

  const bookingUrl = `/booking/${car.car_id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20">
      {/* Back button */}
      <Link to="/cars" className="btn-3d btn-3d-glass btn-3d-sm mb-6 inline-flex">
        <i className="fas fa-arrow-left mr-2"></i> Back to Fleet
      </Link>

      <div className="card-3d p-8 md:p-10 border-cyan-500/25">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Column: Visual & Telematics Map */}
          <div>
            <div
              ref={imageCardRef}
              className="car-image-container tilt-card h-80 sm:h-96 rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative"
            >
              <span className="car-tag">
                <i
                  className={`fas ${
                    car.status === 'Available'
                      ? 'fa-circle-check text-emerald-400'
                      : 'fa-clock text-amber-400'
                  } mr-1`}
                />
                {car.status}
              </span>

              {car.image ? (
                <img
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 h-full">
                  <i className="fas fa-car-side text-7xl text-cyan-500/30 mb-3"></i>
                  <span className="text-sm font-semibold tracking-wider text-cyan-400/80">
                    Velocity Certified Fleet
                  </span>
                </div>
              )}
            </div>

            {/* GPS Telematics Hub Hub simulator */}
            <div className="mt-6 bg-[#0f172a]/70 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i className="fas fa-location-crosshairs text-cyan-400"></i>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Live Vehicle Telematics Hub
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Telemetry
                </div>
              </div>

              <div className="h-44 bg-[#080b11] rounded-xl border border-cyan-500/20 relative flex flex-col items-center justify-center overflow-hidden p-4 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0,transparent_70%)] pointer-events-none"></div>
                <i className="fas fa-satellite text-cyan-400 text-3xl mb-2"></i>
                <div className="text-xs font-mono text-cyan-300">
                  LAT: {car.latitude || 23.0225} &bull; LNG: {car.longitude || 72.5714}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Ahmedabad High-Speed Corridor Dispatch Grid &bull; 100% Operational
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Reserve Action */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="hero-badge mb-3">
                <i className="fas fa-bolt"></i> Premium Certified Fleet
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2">
                {car.brand} <span className="text-gradient">{car.model}</span>
              </h1>
              <p className="text-slate-400 text-sm font-mono">
                REGISTRATION: {car.reg_no} &bull; REF: VEL-{car.car_id}09
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5 text-center">
                <i className="fas fa-gas-pump text-cyan-400 text-lg mb-1.5 block"></i>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Powertrain</div>
                <div className="font-bold text-white text-sm">{car.vehicle_type}</div>
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5 text-center">
                <i className="fas fa-users text-cyan-400 text-lg mb-1.5 block"></i>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Seating</div>
                <div className="font-bold text-white text-sm">{car.capacity} Adults</div>
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5 text-center">
                <i className="fas fa-shield-halved text-emerald-400 text-lg mb-1.5 block"></i>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Coverage</div>
                <div className="font-bold text-emerald-400 text-sm">Full Shield</div>
              </div>

              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5 text-center">
                <i className="fas fa-satellite text-purple-400 text-lg mb-1.5 block"></i>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Tracking</div>
                <div className="font-bold text-purple-400 text-sm">Active GPS</div>
              </div>
            </div>

            {/* Pricing & Booking Box */}
            <div
              className="rounded-2xl p-6 border shadow-[0_0_25px_rgba(6,182,212,0.25)]"
              style={{
                background: 'linear-gradient(135deg, rgba(8, 11, 17, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                borderColor: 'rgba(6, 182, 212, 0.3)',
              }}
            >
              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Standard Daily Rate</span>
                  <div className="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
                    ₹{Number(car.rent_per_day).toLocaleString('en-IN')}
                    <span className="text-sm font-normal text-slate-400"> / 24 hrs</span>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
                  Best Price Guarantee
                </span>
              </div>

              <ul className="space-y-2 mb-6 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-emerald-400"></i>
                  <span>Unlimited kilometers within state boundaries</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-emerald-400"></i>
                  <span>Sanitized interior & contactless digital pickup</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-emerald-400"></i>
                  <span>24/7 Roadside breakdown and towing assistance</span>
                </li>
              </ul>

              {car.status === 'Available' ? (
                <Link
                  to={bookingUrl}
                  className="btn-3d btn-3d-primary w-full py-3.5 text-base"
                >
                  <i className="fas fa-bolt mr-2"></i> Reserve This Vehicle Now
                </Link>
              ) : (
                <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-center font-semibold text-sm">
                  <i className="fas fa-clock mr-2"></i> Currently {car.status} - Check Back Soon
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
