import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@tourpro.com', password: 'admin123' });
    else setForm({ email: 'john@example.com', password: 'user123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <h1>Tour<span>Pro</span></h1>
            <p>Tour Package Management System</p>
          </div>

          <h2 className="auth-title">Welcome back!</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? (
                <><div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider">Demo Accounts</div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline btn-full btn-sm" onClick={() => fillDemo('admin')}>
              🔑 Admin Demo
            </button>
            <button className="btn btn-outline btn-full btn-sm" onClick={() => fillDemo('user')}>
              👤 User Demo
            </button>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.6 }}>
            <div><strong>Admin:</strong> admin@tourpro.com / admin123</div>
            <div><strong>User:</strong> john@example.com / user123</div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--gray-500)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          © 2024 TourPro Management System
        </div>
      </div>
    </div>
  );
}
