import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SupercarHologram3D from '../components/SupercarHologram3D';
import CarCard from '../components/CarCard';
import { use3DTilt } from '../hooks/use3DTilt';
import { api } from '../services/api';

export default function HomePage() {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    location: '',
    start_date: '',
    end_date: '',
    car_type: '',
  });

  const searchCardRef = use3DTilt(8, -6, 1.01);
  const ctaCardRef = use3DTilt(8, -6, 1.01);
  const feat1Ref = use3DTilt(10, -6, 1.02);
  const feat2Ref = use3DTilt(10, -6, 1.02);
  const feat3Ref = use3DTilt(10, -6, 1.02);
  const feat4Ref = use3DTilt(10, -6, 1.02);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadCars() {
      try {
        const cars = await api.getCars();
        setFeaturedCars(cars.slice(0, 6));
      } catch (err) {
        console.error('Failed to load cars:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCars();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchParams.location) query.append('location', searchParams.location);
    if (searchParams.start_date) query.append('start_date', searchParams.start_date);
    if (searchParams.end_date) query.append('end_date', searchParams.end_date);
    if (searchParams.car_type) query.append('car_type', searchParams.car_type);
    navigate(`/cars?${query.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* 1. 3D Hero Section with Three.js Procedural Hologram */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-satellite-dish"></i> Real-Time Telematics & Instant Digital Booking
            </div>

            <h1 className="hero-title text-white">
              Drive the Future in <span className="text-gradient">Ultra-Modern</span> Style.
            </h1>

            <p className="hero-subtitle">
              Experience next-generation car rentals with precision handling, digital verification, and high-performance vehicles ready at your command.
            </p>

            <div className="flex gap-4 flex-wrap">
              <a href="#searchSection" className="btn-3d btn-3d-primary">
                <i className="fas fa-magnifying-glass"></i> Find Your Ride
              </a>
              <Link to="/cars" className="btn-3d btn-3d-glass">
                <i className="fas fa-layer-group"></i> View Fleet ({featuredCars.length || 10}+)
              </Link>
            </div>

            {/* Fast Stat Counters in 3D Glass */}
            <div className="flex gap-8 mt-10 border-t border-white/10 pt-6">
              <div>
                <div className="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">100%</div>
                <div className="text-xs text-slate-400 mt-1">Verified Fleet</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-cyan-400 font-['Plus_Jakarta_Sans']">0-Key</div>
                <div className="text-xs text-slate-400 mt-1">Digital Paperwork</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">24/7</div>
                <div className="text-xs text-slate-400 mt-1">GPS Concierge</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive 3D Canvas Stage */}
        <div className="hero-3d-stage">
          <SupercarHologram3D />
        </div>
      </section>

      {/* 2. Floating 3D Search Bar */}
      <section id="searchSection" className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div ref={searchCardRef} className="search-card-3d tilt-card">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
              <h3 className="text-lg font-bold text-white">Quick Fleet Search & Availability</h3>
            </div>
            <span className="text-xs text-slate-400">
              Instant dispatch in Ahmedabad, Mumbai, Delhi, Bengaluru & more
            </span>
          </div>

          <form onSubmit={handleSearch}>
            <div className="search-grid-inputs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="form-group-3d">
                <label>
                  <i className="fas fa-location-dot text-cyan-400"></i> Location / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahmedabad, Mumbai"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                  className="input-3d"
                />
              </div>

              <div className="form-group-3d">
                <label>
                  <i className="fas fa-calendar-alt text-cyan-400"></i> Pick-up Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={searchParams.start_date}
                  onChange={(e) => setSearchParams({ ...searchParams, start_date: e.target.value })}
                  className="input-3d"
                />
              </div>

              <div className="form-group-3d">
                <label>
                  <i className="fas fa-calendar-check text-cyan-400"></i> Return Date
                </label>
                <input
                  type="date"
                  min={searchParams.start_date || today}
                  value={searchParams.end_date}
                  onChange={(e) => setSearchParams({ ...searchParams, end_date: e.target.value })}
                  className="input-3d"
                />
              </div>

              <div className="form-group-3d">
                <label>
                  <i className="fas fa-car text-cyan-400"></i> Brand / Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fortuner, Creta, SUV"
                  value={searchParams.car_type}
                  onChange={(e) => setSearchParams({ ...searchParams, car_type: e.target.value })}
                  className="input-3d"
                />
              </div>

              <div>
                <button type="submit" className="btn-3d btn-3d-primary w-full h-12">
                  <i className="fas fa-bolt mr-2"></i> Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 3. Featured Fleet Showcase */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
          <div>
            <div className="hero-badge mb-2">
              <i className="fas fa-star text-amber-400"></i> Prime Selection
            </div>
            <h2 className="text-3xl font-extrabold text-white">Featured Performance Vehicles</h2>
          </div>
          <Link to="/cars" className="btn-3d btn-3d-glass btn-3d-sm">
            View All Vehicles <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-cyan-400 text-lg">
            <i className="fas fa-circle-notch fa-spin mr-3 text-2xl"></i> Synchronizing fleet matrix...
          </div>
        ) : featuredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {featuredCars.map((car) => (
              <CarCard key={car.car_id} car={car} />
            ))}
          </div>
        ) : (
          <div className="card-3d text-center py-16 px-6">
            <i className="fas fa-car-rear text-5xl text-slate-500 mb-4"></i>
            <h3 className="text-lg font-bold mb-2">No Fleet Vehicles Configured Yet</h3>
            <p className="text-slate-400 mb-6">Please browse our full directory.</p>
            <Link to="/cars" className="btn-3d btn-3d-primary">
              Explore All
            </Link>
          </div>
        )}
      </section>

      {/* 4. The Velocity Advantage */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="hero-badge mb-3">
            <i className="fas fa-gem text-cyan-400"></i> Engineered For Excellence
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">The Velocity Advantage</h2>
          <p className="text-slate-400 text-base">
            Built with modern web architecture and seamless automotive telemetry for stress-free journeys.
          </p>
        </div>

        <div className="features-grid">
          <div ref={feat1Ref} className="feature-box-3d tilt-card">
            <div className="feature-icon-3d">
              <i className="fas fa-satellite"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live GPS Telematics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every vehicle is linked to our real-time GPS tracking grid. Track live location, calculate precise pickup windows, and stay secure.
            </p>
          </div>

          <div ref={feat2Ref} className="feature-box-3d tilt-card">
            <div className="feature-icon-3d" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))' }}>
              <i className="fas fa-file-contract text-purple-400"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Digital Smart Contract</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instant online contract execution with clear terms, zero hidden security deposits, and immediate PDF invoice dispatch.
            </p>
          </div>

          <div ref={feat3Ref} className="feature-box-3d tilt-card">
            <div className="feature-icon-3d" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))' }}>
              <i className="fas fa-credit-card text-emerald-400"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Encrypted Fast Payments</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Multi-channel payment gateway simulation supporting UPI, Cards, and Net Banking with instant automated confirmation.
            </p>
          </div>

          <div ref={feat4Ref} className="feature-box-3d tilt-card">
            <div className="feature-icon-3d" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))' }}>
              <i className="fas fa-shield-halved text-amber-400"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Refund Policy</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Fair cancellation matrices with automated refund calculations and complete audit trails for every transaction.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div
          ref={ctaCardRef}
          className="card-3d tilt-card text-center py-12 px-6"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(6, 182, 212, 0.15) 100%)',
            borderColor: 'rgba(6, 182, 212, 0.3)',
          }}
        >
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready For The Ultimate Road Trip?</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-7 text-base">
            Join thousands of happy drivers who rent with Velocity 3D every month. Reserve your luxury SUV or sports sedan now.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/cars" className="btn-3d btn-3d-primary py-3.5 px-8 text-base">
              <i className="fas fa-key"></i> Book A Vehicle Today
            </Link>
            <Link to="/register" className="btn-3d btn-3d-glass py-3.5 px-8 text-base">
              <i className="fas fa-user-plus"></i> Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
