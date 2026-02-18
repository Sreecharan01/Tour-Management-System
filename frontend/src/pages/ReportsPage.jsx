import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const MONTH_LABELS = { 1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec' };

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/reports?period=${period}`);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [period]);

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>;
  if (!data) return <div className="empty-state"><h3>Failed to load reports</h3></div>;

  const revenueData = data.revenueByMonth?.map(m => ({
    name: MONTH_LABELS[m._id.month],
    revenue: m.revenue,
    bookings: m.bookings
  })) || [];

  const pieData = data.bookingsByStatus?.map(b => ({ name: b._id || 'Unknown', value: b.count })) || [];

  const statsCards = [
    { icon: '📋', label: 'Total Bookings', value: data.overview.totalBookings, color: '#4f46e5', bg: '#e0e7ff' },
    { icon: '✅', label: 'Confirmed', value: data.overview.confirmedBookings, color: '#10b981', bg: '#d1fae5' },
    { icon: '💰', label: 'Total Revenue', value: formatCurrency(data.overview.totalRevenue), color: '#f59e0b', bg: '#fef3c7' },
    { icon: '🌍', label: 'Active Tours', value: data.overview.totalTours, color: '#8b5cf6', bg: '#ede9fe' },
    { icon: '👥', label: 'Users', value: data.overview.totalUsers, color: '#06b6d4', bg: '#cffafe' },
    { icon: `📅`, label: `Last ${period}d Bookings`, value: data.overview.recentBookings, color: '#ef4444', bg: '#fee2e2' }
  ];

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">Reports & Analytics</h1>
          <p className="section-subtitle">System performance overview</p>
        </div>
        <select className="filter-select" value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {statsCards.map((s, i) => (
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

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue Trend</span>
            <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Monthly revenue & bookings</span>
          </div>
          <div style={{ padding: '16px 8px' }}>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v, n) => n === 'revenue' ? formatCurrency(v) : v} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" fill="url(#revGrad)" strokeWidth={2.5} />
                  <Area yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="5 3" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><p>No revenue data yet</p></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Booking Status</span></div>
          <div className="card-body">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {pieData.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                        {p.name}
                      </div>
                      <strong style={{ fontSize: 13 }}>{p.value}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="empty-state"><p>No data</p></div>}
          </div>
        </div>
      </div>

      {/* Top Tours */}
      {data.topTours?.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">🏆 Top Performing Tours</span></div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tour</th>
                  <th>Destination</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topTours.map((t, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: ['#fbbf24','#9ca3af','#cd7c3c'][i] || 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: i < 3 ? 'white' : 'var(--gray-600)' }}>
                        {i + 1}
                      </div>
                    </td>
                    <td><strong>{t.tour.title}</strong></td>
                    <td style={{ color: 'var(--gray-600)' }}>{t.tour.destination}</td>
                    <td><span className="badge badge-primary">{t.count} bookings</span></td>
                    <td><strong style={{ color: 'var(--success)' }}>{formatCurrency(t.revenue)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
