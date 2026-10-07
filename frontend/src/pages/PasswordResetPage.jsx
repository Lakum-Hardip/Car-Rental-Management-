import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { use3DTilt } from '../hooks/use3DTilt';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();
  const cardRef = use3DTilt(6, -4, 1.01);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Reset email instructions generated. Check your mailbox.', 'info');
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-20">
      <div ref={cardRef} className="card-3d tilt-card p-8 md:p-10 border-cyan-500/30">
        <div className="text-center mb-6">
          <div className="logo-icon-3d mx-auto mb-4" style={{ width: 52, height: 52, fontSize: '1.3rem' }}>
            <i className="fas fa-key"></i>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1.5">Reset Password</h1>
          <p className="text-slate-400 text-sm">We'll dispatch a secure recovery link to your registered email</p>
        </div>

        {submitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center text-sm text-emerald-300">
            <i className="fas fa-check-circle text-2xl mb-2 block"></i>
            A password reset email has been dispatched to <strong>{email}</strong>.
            <div className="mt-4">
              <Link to="/login" className="btn-3d btn-3d-glass btn-3d-sm">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group-3d">
              <label>
                <i className="fas fa-envelope text-cyan-400"></i> Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="input-3d"
              />
            </div>

            <button type="submit" className="btn-3d btn-3d-primary w-full h-12 text-base mt-2">
              <i className="fas fa-paper-plane mr-2"></i> Send Recovery Link
            </button>
          </form>
        )}

        <div className="mt-6 text-center border-t border-white/10 pt-5 text-sm text-slate-400">
          Remembered your password?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
