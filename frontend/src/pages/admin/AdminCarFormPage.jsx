import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { use3DTilt } from '../../hooks/use3DTilt';
import { api } from '../../services/api';

export default function AdminCarFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    reg_no: '',
    vehicle_type: 'Petrol',
    capacity: 5,
    rent_per_day: 3000,
    status: 'Available',
    latitude: 23.0225,
    longitude: 72.5714,
  });
  const [submitting, setSubmitting] = useState(false);
  const cardRef = use3DTilt(6, -4, 1.01);

  useEffect(() => {
    if (isEdit) {
      async function loadCar() {
        const car = await api.getCar(id);
        if (car) {
          setFormData({
            brand: car.brand || '',
            model: car.model || '',
            reg_no: car.reg_no || '',
            vehicle_type: car.vehicle_type || 'Petrol',
            capacity: car.capacity || 5,
            rent_per_day: car.rent_per_day || 3000,
            status: car.status || 'Available',
            latitude: car.latitude || 23.0225,
            longitude: car.longitude || 72.5714,
          });
        }
      }
      loadCar();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEdit) {
        await api.updateCar(id, formData);
        showToast('Vehicle specifications updated successfully.', 'success');
      } else {
        await api.addCar(formData);
        showToast('New vehicle registered into fleet successfully.', 'success');
      }
      navigate('/admin-panel/cars');
    } catch (err) {
      console.error(err);
      showToast('Error saving vehicle details.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/admin-panel/cars" className="btn-3d btn-3d-glass btn-3d-sm mb-6 inline-flex">
        <i className="fas fa-arrow-left mr-2"></i> Back to Fleet Directory
      </Link>

      <div ref={cardRef} className="card-3d tilt-card p-8 md:p-10 border-cyan-500/30">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white">
            {isEdit ? 'Edit Fleet Vehicle' : 'Register New Fleet Vehicle'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure vehicle metadata, telematics coordinates, and pricing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group-3d">
              <label>Manufacturer / Brand *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Toyota, Porsche, BMW"
                className="input-3d"
              />
            </div>
            <div className="form-group-3d">
              <label>Model Name *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. Fortuner, Taycan, M4"
                className="input-3d"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group-3d">
              <label>Registration Number *</label>
              <input
                type="text"
                required
                value={formData.reg_no}
                onChange={(e) => setFormData({ ...formData, reg_no: e.target.value })}
                placeholder="e.g. DL-01-AA-0001"
                className="input-3d font-mono uppercase"
              />
            </div>
            <div className="form-group-3d">
              <label>Vehicle Powertrain *</label>
              <select
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="input-3d"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-group-3d">
              <label>Seating Capacity</label>
              <input
                type="number"
                min="2"
                max="12"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="input-3d"
              />
            </div>
            <div className="form-group-3d">
              <label>Daily Rent (₹) *</label>
              <input
                type="number"
                min="500"
                required
                value={formData.rent_per_day}
                onChange={(e) => setFormData({ ...formData, rent_per_day: Number(e.target.value) })}
                className="input-3d"
              />
            </div>
            <div className="form-group-3d">
              <label>Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-3d"
              >
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div className="form-group-3d">
              <label>GPS Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                className="input-3d font-mono"
              />
            </div>
            <div className="form-group-3d">
              <label>GPS Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                className="input-3d font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-3d btn-3d-primary w-full h-12 text-base mt-4"
          >
            {submitting ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i> Writing Fleet Data...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2"></i> {isEdit ? 'Save Changes' : 'Create Vehicle'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
