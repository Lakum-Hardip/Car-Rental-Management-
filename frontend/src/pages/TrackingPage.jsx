import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { use3DTilt } from '../hooks/use3DTilt';
import { api } from '../services/api';

export default function TrackingPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardRef = use3DTilt(6, -4, 1.01);

  useEffect(() => {
    async function loadData() {
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
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-cyan-400 text-lg">
        <i className="fas fa-satellite fa-spin mr-3 text-2xl"></i> Establishing satellite uplink...
      </div>
    );
  }

  const car = booking?.car || {
    brand: 'Toyota',
    model: 'Fortuner',
    reg_no: 'DL-01-AA-0001',
    latitude: 23.0225,
    longitude: 72.5714,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <div className="hero-badge mb-2">
            <i className="fas fa-satellite-dish text-emerald-400"></i> Telematics Active & Live
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Real-Time GPS Tracking</h1>
          <p className="text-slate-400 mt-1">
            Vehicle: <strong className="text-white">{car.brand} {car.model}</strong> ({car.reg_no})
          </p>
        </div>
        <Link to="/dashboard" className="btn-3d btn-3d-glass btn-3d-sm">
          <i className="fas fa-arrow-left mr-2"></i> Back to Bookings
        </Link>
      </div>

      {/* 3D Telematics HUD Card */}
      <div ref={cardRef} className="card-3d tilt-card p-7 border-cyan-500/30">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse"></div>
            <span className="font-bold text-white uppercase text-xs tracking-wider">
              Satellite Ping Status: Operational (Galileo / GPS L1)
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            LAT: {car.latitude || 23.0225} &bull; LNG: {car.longitude || 72.5714}
          </span>
        </div>

        {/* Cyber GPS Telematics Interactive Screen */}
        <div className="h-[440px] rounded-2xl bg-[#080b11] border border-cyan-500/30 overflow-hidden relative shadow-2xl flex flex-col justify-between p-6">
          {/* Cyber grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.06)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

          {/* Radar circle sweep simulation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-cyan-500/20 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border border-cyan-500/25"></div>
            <div className="w-20 h-20 rounded-full border border-cyan-500/35"></div>
          </div>

          {/* HUD Top Bar */}
          <div className="relative z-10 flex justify-between items-center bg-[#0f172a]/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono">
              <i className="fas fa-crosshairs text-cyan-400 animate-spin"></i>
              <span>TARGET LOCKED: {car.brand.toUpperCase()}_{car.model.toUpperCase()}</span>
            </div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <i className="fas fa-signal"></i> 5G Telematics Link (14ms latency)
            </div>
          </div>

          {/* Center Target Indicator */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-pulse">
              <i className="fas fa-car text-cyan-300 text-2xl"></i>
            </div>
            <div className="mt-3 bg-[#080b11]/90 border border-cyan-500/40 px-3 py-1 rounded-full text-xs font-mono text-cyan-300">
              Ahmedabad Hub &bull; 0 km/h (Parked & Prepped)
            </div>
          </div>

          {/* HUD Bottom Status */}
          <div className="relative z-10 bg-[#0f172a]/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex justify-between items-center text-xs text-slate-300">
            <span>Pickup Hub: SG Highway Supercharger Terminal</span>
            <span className="text-emerald-400 font-mono">ENCRYPTION: AES-256-GCM ACTIVE</span>
          </div>
        </div>

        {/* Telematics Data Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Vehicle Condition</span>
            <div className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <i className="fas fa-circle-check"></i> 100% Certified Clean
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Speed Governor</span>
            <div className="text-base font-bold text-white mt-1">
              Active (Preset 80 km/h)
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Emergency Dispatch</span>
            <div className="text-base font-bold text-cyan-300 mt-1">
              Online 24/7 Ready
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Fuel / Battery Level</span>
            <div className="text-base font-bold text-amber-300 mt-1">
              95% Full Capacity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
