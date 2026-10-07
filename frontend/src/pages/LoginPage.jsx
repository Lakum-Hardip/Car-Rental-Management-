import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { use3DTilt } from '../hooks/use3DTilt';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginCustomer } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const cardRef = use3DTilt(6, -4, 1.01);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginCustomer(email, password);
      if (res && res.success) {
        showToast('Authentication successful! Welcome back.', 'success');
        navigate('/dashboard');
      } else {
        showToast(res?.error || 'Invalid email or password.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Login request failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('lakumhardip11@gmail.com');
    setPassword('Hardip@123');
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-20">
      <div ref={cardRef} className="card-3d tilt-card p-8 md:p-10 border-cyan-500/30">
        <div className="text-center mb-7">
          <div className="logo-icon-3d mx-auto mb-4" style={{ width: 52, height: 52, fontSize: '1.3rem' }}>
            <i className="fas fa-key"></i>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1.5">Customer Access</h1>
          <p className="text-slate-400 text-sm">Enter your credentials to manage your car reservations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group-3d">
            <label>
              <i className="fas fa-envelope text-cyan-400"></i> Registered Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
              className="input-3d"
            />
          </div>

          <div className="form-group-3d">
            <label>
              <i className="fas fa-lock text-cyan-400"></i> Password
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
              Autofill Demo Login
            </button>
            <Link to="/password-reset" className="text-slate-400 hover:text-cyan-300">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-3d btn-3d-primary w-full h-12 text-base mt-2"
          >
            {loading ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i> Authenticating...
              </>
            ) : (
              <>
                <i className="fas fa-arrow-right-to-bracket mr-2"></i> Authenticate & Enter
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/10 pt-5 text-sm text-slate-400">
          Don't have a driver account?{' '}
          <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300">
            Create One Free
          </Link>
        </div>

        <div className="mt-3 text-center text-xs">
          <Link to="/admin/login" className="text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1.5">
            <i className="fas fa-shield-halved"></i> Staff & Admin Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
