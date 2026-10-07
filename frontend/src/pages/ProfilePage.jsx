import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { use3DTilt } from '../hooks/use3DTilt';
import { api } from '../services/api';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_no: '',
    license_no: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);

  const cardRef = use3DTilt(6, -4, 1.01);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone_no: user.phone_no || '',
        license_no: user.license_no || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile(formData);
      setUser(updated);
      showToast('Profile information successfully saved!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 pt-10 pb-20">
      <div ref={cardRef} className="card-3d tilt-card p-8 md:p-10 border-cyan-500/30">
        <div className="text-center mb-6">
          <div className="logo-icon-3d mx-auto mb-4" style={{ width: 52, height: 52, fontSize: '1.3rem' }}>
            <i className="fas fa-user-circle"></i>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Driver Profile</h1>
          <p className="text-slate-400 text-sm">Update your contact details and verified credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group-3d">
            <label>
              <i className="fas fa-user text-cyan-400"></i> Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="input-3d"
            />
          </div>

          <div className="form-group-3d">
            <label>
              <i className="fas fa-envelope text-cyan-400"></i> Registered Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="input-3d opacity-60 cursor-not-allowed"
            />
          </div>

          <div className="form-group-3d">
            <label>
              <i className="fas fa-phone text-cyan-400"></i> Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone_no}
              onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
              required
              className="input-3d"
            />
          </div>

          <div className="form-group-3d">
            <label>
              <i className="fas fa-id-card text-cyan-400"></i> Driving License No
            </label>
            <input
              type="text"
              value={formData.license_no}
              onChange={(e) => setFormData({ ...formData, license_no: e.target.value })}
              required
              className="input-3d font-mono"
            />
          </div>

          <div className="form-group-3d">
            <label>
              <i className="fas fa-location-dot text-cyan-400"></i> Home / Billing Address
            </label>
            <textarea
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-3d"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-3d btn-3d-primary w-full h-12 text-base mt-2"
          >
            {saving ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i> Saving Updates...
              </>
            ) : (
              <>
                <i className="fas fa-floppy-disk mr-2"></i> Save Profile Details
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
