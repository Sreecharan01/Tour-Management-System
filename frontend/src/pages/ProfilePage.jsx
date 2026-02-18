import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getInitials } from '../utils/helpers';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name) { toast.error('Name is required.'); return; }
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/update-profile', profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (passwordForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        marginBottom: 24
      }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, flexShrink: 0 }}>
          {getInitials(user?.name)}
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ opacity: 0.85, fontSize: 14, marginBottom: 8 }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
              {user?.role}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              Member since {formatDate(user?.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Edit Profile */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <span className="card-title">👤 Edit Profile</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleProfileSave}>
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 0100" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" value={user?.email} disabled style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }} />
                <p className="form-error">Email cannot be changed. Contact an admin to update.</p>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <span className="card-title">🔒 Change Password</span>
          </div>
          <div className="card-body">
            <form onSubmit={handlePasswordSave}>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <input type="password" className="form-input" value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} required />
              </div>
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">New Password *</label>
                  <input type="password" className="form-input" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 6 characters" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <input type="password" className="form-input" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
                </div>
              </div>
              {passwordForm.newPassword && passwordForm.confirmPassword && (
                <div className={`alert ${passwordForm.newPassword === passwordForm.confirmPassword ? 'alert-success' : 'alert-error'}`} style={{ fontSize: 12 }}>
                  {passwordForm.newPassword === passwordForm.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                {savingPassword ? 'Changing...' : '🔐 Change Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Account Info */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header"><span className="card-title">ℹ️ Account Information</span></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { l: 'Account ID', v: user?._id?.slice(-8).toUpperCase() },
                { l: 'Role', v: <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-gray'}`}>{user?.role}</span> },
                { l: 'Account Status', v: <span className="badge badge-success">Active</span> },
                { l: 'Last Login', v: formatDate(user?.lastLogin) },
                { l: 'Member Since', v: formatDate(user?.createdAt) },
                { l: 'Phone', v: user?.phone || 'Not set' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{item.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{item.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
