import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toursRes, bookingsRes] = await Promise.all([
          api.get('/tour?limit=4&featured=true'),
          api.get('/bookings?limit=5')
        ]);
        setTours(toursRes.data.data);
        setBookings(bookingsRes.data.data);

        if (isAdmin) {
          const reportsRes = await api.get('/reports');
          setStats(reportsRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  if (loading) return (
    <div className="loading-container"><div className="loading-spinner" /></div>
  );

  const monthLabels = { 1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec' };
  const revenueData = stats?.revenueByMonth?.map(m => ({
    name: monthLabels[m._id.month],
    revenue: m.revenue,
    bookings: m.bookings
  })) || [];

  const pieData = stats?.bookingsByStatus?.map(b => ({
    name: b._id,
    value: b.count
  })) || [];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        color: 'white',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p style={{ opacity: 0.85, fontSize: 14 }}>
            {isAdmin ? 'Here\'s an overview of your TourPro system today.' : 'Browse tours and manage your bookings.'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Today</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</div>
        </div>
      </div>

      {/* Stats - Admin */}
      {isAdmin && stats && (
        <div className="stats-grid">
          {[
            { icon: '📋', label: 'Total Bookings', value: stats.overview.totalBookings, color: '#4f46e5', bg: '#e0e7ff' },
            { icon: '✅', label: 'Confirmed', value: stats.overview.confirmedBookings, color: '#10b981', bg: '#d1fae5' },
            { icon: '💰', label: 'Total Revenue', value: formatCurrency(stats.overview.totalRevenue), color: '#f59e0b', bg: '#fef3c7' },
            { icon: '🌍', label: 'Active Tours', value: stats.overview.totalTours, color: '#8b5cf6', bg: '#ede9fe' },
            { icon: '👥', label: 'Total Users', value: stats.overview.totalUsers, color: '#06b6d4', bg: '#cffafe' },
            { icon: '📅', label: 'Recent (30d)', value: stats.overview.recentBookings, color: '#ef4444', bg: '#fee2e2' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts - Admin only */}
      {isAdmin && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Revenue & Bookings Trend</span>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Monthly overview</span>
            </div>
            <div className="card-body" style={{ padding: '16px 8px' }}>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v, n) => n === 'revenue' ? formatCurrency(v) : v} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" fill="url(#colorRev)" strokeWidth={2} />
                    <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">
                  <p>No revenue data yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Bookings by Status</span>
            </div>
            <div className="card-body">
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {pieData.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--gray-600)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                        {p.name} ({p.value})
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state"><p>No booking data</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Featured Tours */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Featured Tours</span>
            <a href="/tours" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          <div>
            {tours.length === 0 ? (
              <div className="card-body">
                <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>No tours available.</p>
              </div>
            ) : tours.map(tour => (
              <div key={tour._id} style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                  {tour.coverImage ? (
                    <img src={tour.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌍</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tour.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{tour.destination}, {tour.country}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>{formatCurrency(tour.price.adult)}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{tour.duration.days}D/{tour.duration.nights}N</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Bookings</span>
            <a href="/bookings" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          <div>
            {bookings.length === 0 ? (
              <div className="card-body">
                <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>No bookings yet.</p>
              </div>
            ) : bookings.map(b => (
              <div key={b._id} style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-900)' }}>{b.tour?.title || 'N/A'}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                      {b.bookingRef} · {formatDate(b.createdAt)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>
                      <span className={`badge badge-${b.status === 'Confirmed' ? 'success' : b.status === 'Cancelled' ? 'danger' : 'warning'}`}>
                        {b.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginTop: 4 }}>{formatCurrency(b.totalAmount)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


