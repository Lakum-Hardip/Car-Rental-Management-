import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { use3DTilt } from '../../hooks/use3DTilt';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const cardRef = use3DTilt(6, -4, 1.01);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginAdmin(username, password);
      if (res && res.success) {
        showToast('Admin session authorized! Welcome to Command Matrix.', 'success');
        navigate('/admin-panel');
      } else {
        showToast(res?.error || 'Invalid admin credentials.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Login authorization error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-20">
      <div ref={cardRef} className="card-3d tilt-card p-8 md:p-10 border-cyan-500/30">
        <div className="text-center mb-7">
          <div
            className="logo-icon-3d mx-auto mb-4"
            style={{
              width: 52,
              height: 52,
              fontSize: '1.3rem',
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
            }}
          >
            <i className="fas fa-shield-halved"></i>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1.5">Staff & Admin Terminal</h1>
          <p className="text-slate-400 text-sm">Manager / Staff authentication for fleet control</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group-3d">
            <label>
              <i className="fas fa-user-shield text-cyan-400"></i> Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              required
              className="input-3d"
            />
          </div>

          <div className="form-group-3d">
            <label>
              <i className="fas fa-lock text-cyan-400"></i> Master Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-3d"
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer bg-transparent border-none"
            >
              Autofill Admin Demo (admin / admin123)
            </button>
            <Link to="/login" className="text-slate-400 hover:text-cyan-300">
              Customer Login
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-3d btn-3d-primary w-full h-12 text-base mt-2"
          >
            {loading ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i> Verifying Matrix Token...
              </>
            ) : (
              <>
                <i className="fas fa-unlock-keyhole mr-2"></i> Authorize Console Session
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/10 pt-5 text-sm text-slate-400">
          <Link to="/" className="text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-1.5">
            <i className="fas fa-arrow-left"></i> Return to Main Website
          </Link>
        </div>
      </div>
    </div>
  );
}
