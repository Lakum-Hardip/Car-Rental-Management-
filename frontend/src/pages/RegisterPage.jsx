import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { use3DTilt } from '../hooks/use3DTilt';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_no: '',
    license_no: '',
    address: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);

  const { registerCustomer } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const cardRef = use3DTilt(6, -4, 1.01);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (formData.password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await registerCustomer(formData);
      if (res && res.success) {
        showToast('Registration successful! Welcome to Velocity 3D.', 'success');
        navigate('/dashboard');
      } else {
        showToast(res?.error || 'Registration failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred during registration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 pt-12 pb-20">
      <div ref={cardRef} className="card-3d tilt-card p-8 md:p-10 border-cyan-500/30">
        <div className="text-center mb-7">
          <div className="logo-icon-3d mx-auto mb-4" style={{ width: 52, height: 52, fontSize: '1.3rem' }}>
            <i className="fas fa-user-plus"></i>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1.5">Create Account</h1>
          <p className="text-slate-400 text-sm">Join Velocity 3D for instantaneous verified bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group-3d">
            <label>Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="input-3d"
            />
          </div>

          <div className="form-group-3d">
            <label>Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="input-3d"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group-3d">
              <label>Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone_no}
                onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                placeholder="10-15 digits"
                className="input-3d"
              />
            </div>
            <div className="form-group-3d">
              <label>License Number *</label>
              <input
                type="text"
                required
                value={formData.license_no}
                onChange={(e) => setFormData({ ...formData, license_no: e.target.value })}
                placeholder="e.g. DL-04-2022-981"
                className="input-3d font-mono"
              />
            </div>
          </div>

          <div className="form-group-3d">
            <label>Residential Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="City, State"
              className="input-3d"
            />
          </div>

          <div className="form-group-3d">
            <label>
              <i className="fas fa-lock text-cyan-400"></i> Password *
            </label>
            <input
              type="password"
              required
              minLength="8"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 8 chars, 1 uppercase, 1 lowercase & 1 digit"
              className="input-3d"
            />
          </div>

          <div className="form-group-3d">
            <label>
              <i className="fas fa-shield-halved text-cyan-400"></i> Confirm Password *
            </label>
            <input
              type="password"
              required
              minLength="8"
              value={formData.password_confirm}
              onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
              placeholder="Re-type matching password"
              className="input-3d"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-3d btn-3d-primary w-full h-12 text-base mt-2"
          >
            {loading ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i> Registering Account...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2"></i> Complete Registration
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/10 pt-5 text-sm text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
