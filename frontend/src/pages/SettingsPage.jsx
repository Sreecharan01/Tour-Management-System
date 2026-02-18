import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(res.data.data);
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));
  const updateNested = (parent, key, value) => setSettings(s => ({ ...s, [parent]: { ...s[parent], [key]: value } }));

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>;

  const tabs = [
    { id: 'general', label: '⚙️ General' },
    { id: 'contact', label: '📞 Contact' },
    { id: 'policies', label: '📜 Policies' },
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'social', label: '🌐 Social Links' },
  ];

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">System Settings</h1>
          <p className="section-subtitle">Configure TourPro system preferences</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Tabs */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div className="card">
            <div style={{ padding: '8px 0' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary-dark)' : 'var(--gray-700)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    borderLeft: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">{tabs.find(t => t.id === activeTab)?.label}</span>
            </div>
            <div className="card-body">
              {activeTab === 'general' && (
                <>
                  <div className="input-row">
                    <div className="form-group">
                      <label className="form-label">Site Name</label>
                      <input className="form-input" value={settings.siteName} onChange={e => update('siteName', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tagline</label>
                      <input className="form-input" value={settings.siteTagline} onChange={e => update('siteTagline', e.target.value)} />
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="form-group">
                      <label className="form-label">Currency</label>
                      <select className="form-select" value={settings.currency} onChange={e => update('currency', e.target.value)}>
                        {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Currency Symbol</label>
                      <input className="form-input" value={settings.currencySymbol} onChange={e => update('currencySymbol', e.target.value)} />
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="form-group">
                      <label className="form-label">Timezone</label>
                      <select className="form-select" value={settings.timezone} onChange={e => update('timezone', e.target.value)}>
                        {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'Asia/Dubai'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max Bookings per User</label>
                      <input type="number" className="form-input" value={settings.maxBookingsPerUser} onChange={e => update('maxBookingsPerUser', +e.target.value)} />
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="form-group">
                      <label className="form-label">Primary Color</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={settings.primaryColor} onChange={e => update('primaryColor', e.target.value)} style={{ width: 44, height: 38, padding: 2, border: '1.5px solid var(--gray-200)', borderRadius: 6, cursor: 'pointer' }} />
                        <input className="form-input" value={settings.primaryColor} onChange={e => update('primaryColor', e.target.value)} style={{ flex: 1 }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Accent Color</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={settings.accentColor} onChange={e => update('accentColor', e.target.value)} style={{ width: 44, height: 38, padding: 2, border: '1.5px solid var(--gray-200)', borderRadius: 6, cursor: 'pointer' }} />
                        <input className="form-input" value={settings.accentColor} onChange={e => update('accentColor', e.target.value)} style={{ flex: 1 }} />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={settings.maintenanceMode} onChange={e => update('maintenanceMode', e.target.checked)} style={{ width: 16, height: 16 }} />
                      <span style={{ fontWeight: 600 }}>Maintenance Mode</span>
                      <span style={{ color: 'var(--gray-500)', fontWeight: 400 }}>— Users will see a maintenance notice</span>
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'contact' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input type="email" className="form-input" value={settings.contactEmail} onChange={e => update('contactEmail', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input className="form-input" value={settings.contactPhone} onChange={e => update('contactPhone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea className="form-textarea" rows={3} value={settings.address} onChange={e => update('address', e.target.value)} />
                  </div>
                </>
              )}

              {activeTab === 'policies' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Booking Policy</label>
                    <textarea className="form-textarea" rows={4} value={settings.bookingPolicy} onChange={e => update('bookingPolicy', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cancellation Policy</label>
                    <textarea className="form-textarea" rows={4} value={settings.cancellationPolicy} onChange={e => update('cancellationPolicy', e.target.value)} />
                  </div>
                </>
              )}

              {activeTab === 'notifications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {[
                    { key: 'emailNotifications', label: '📧 Email Notifications', desc: 'Send booking confirmations and alerts via email' },
                    { key: 'smsNotifications', label: '📱 SMS Notifications', desc: 'Send booking updates via SMS (requires SMS gateway)' },
                  ].map(item => (
                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--gray-50)', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{item.desc}</div>
                      </div>
                      <label style={{ cursor: 'pointer', position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                        <input type="checkbox" checked={settings[item.key]} onChange={e => update(item.key, e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: settings[item.key] ? 'var(--primary)' : 'var(--gray-300)', borderRadius: 24, transition: '0.3s' }}>
                          <span style={{ position: 'absolute', height: 18, width: 18, left: settings[item.key] ? 23 : 3, bottom: 3, background: 'white', borderRadius: '50%', transition: '0.3s' }} />
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'social' && (
                <>
                  {['facebook', 'instagram', 'twitter', 'youtube'].map(platform => (
                    <div key={platform} className="form-group">
                      <label className="form-label" style={{ textTransform: 'capitalize' }}>
                        {platform === 'facebook' ? '👥' : platform === 'instagram' ? '📸' : platform === 'twitter' ? '🐦' : '▶️'} {platform}
                      </label>
                      <input className="form-input" value={settings.socialLinks?.[platform] || ''} onChange={e => updateNested('socialLinks', platform, e.target.value)} placeholder={`https://${platform}.com/yourbrand`} />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
