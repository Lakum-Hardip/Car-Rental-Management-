import React from 'react';
import { Link } from 'react-router-dom';
import { use3DTilt } from '../hooks/use3DTilt';

export default function CarCard({ car, searchParams = '' }) {
  const tiltRef = use3DTilt(10, -8, 1.02);

  return (
    <div ref={tiltRef} className="car-card-3d tilt-card group">
      <div className="car-image-container">
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
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <i className="fas fa-car-side text-5xl text-cyan-500/40 mb-2"></i>
            <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400/70">
              Velocity Certified
            </span>
          </div>
        )}
      </div>

      <div className="car-body-3d">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="car-title-3d group-hover:text-cyan-300 transition-colors">
              {car.brand} {car.model}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              REG: {car.reg_no}
            </span>
          </div>
          <span className="bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
            {car.vehicle_type}
          </span>
        </div>

        <div className="car-meta-pills">
          <span className="meta-pill">
            <i className="fas fa-gas-pump text-cyan-400"></i> {car.vehicle_type}
          </span>
          <span className="meta-pill">
            <i className="fas fa-users text-cyan-400"></i> {car.capacity} Seats
          </span>
          <span className="meta-pill">
            <i className="fas fa-satellite text-cyan-400"></i> GPS Telematics
          </span>
        </div>

        <div className="car-price-row">
          <div>
            <span className="price-value">₹{Number(car.rent_per_day).toLocaleString('en-IN')}</span>
            <span className="price-period"> / day</span>
          </div>
          <Link
            to={`/cars/${car.car_id}${searchParams ? `?${searchParams}` : ''}`}
            className="btn-3d btn-3d-primary btn-3d-sm"
          >
            <span>Rent Now</span> <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
