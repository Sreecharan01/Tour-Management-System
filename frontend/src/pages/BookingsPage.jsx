import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, getStatusBadge, BOOKING_STATUSES, PAYMENT_STATUSES } from '../utils/helpers';

export default function BookingsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', paymentStatus: '' });
  const [editModal, setEditModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [bookModal, setBookModal] = useState(false);
  const [tours, setTours] = useState([]);
  const [bookForm, setBookForm] = useState({ tourId: '', travelDate: '', adults: 1, children: 0, paymentMethod: 'Online', specialRequests: '' });
  const [saving, setSaving] = useState(false);

  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ...filters });
      Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
      const res = await api.get(`/bookings?${params}`);
      setBookings(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchTours = async () => {
    try {
      const res = await api.get('/tour?status=Active&limit=50');
      setTours(res.data.data);
    } catch {}
  };

  const location = useLocation();

  // Open booking modal with preselected tour when navigated from tour card
  useEffect(() => {
    const preTourId = location.state?.tourId;
    if (preTourId) {
      (async () => {
        await fetchTours();
        setBookForm(f => ({ ...f, tourId: preTourId }));
        setBookModal(true);
        // clear state after using it
        try { history.replaceState({}, ''); } catch (e) {}
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.tourId]);

  useEffect(() => { fetchBookings(1); }, [fetchBookings]);

  const handleBookNow = async () => {
    if (!bookForm.tourId || !bookForm.travelDate) { toast.error('Please select a tour and travel date.'); return; }
    setSaving(true);
    try {
      await api.post('/bookings', bookForm);
      toast.success('Booking created successfully!');
      setBookModal(false);
      setBookForm({ tourId: '', travelDate: '', adults: 1, children: 0, paymentMethod: 'Online', specialRequests: '' });
      fetchBookings(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBooking = async () => {
    setSaving(true);
    try {
      await api.put(`/bookings/${editModal._id}`, { status: editModal.status, paymentStatus: editModal.paymentStatus });
      toast.success('Booking updated!');
      setEditModal(null);
      fetchBookings(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const getPaymentBadge = (s) => {
    const m = { Paid: 'badge-success', Partial: 'badge-warning', Unpaid: 'badge-danger', Refunded: 'badge-info' };
    return m[s] || 'badge-gray';
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">Bookings</h1>
          <p className="section-subtitle">{pagination.total} total bookings</p>
        </div>
        <button className="btn btn-primary" onClick={() => { fetchTours(); setBookModal(true); }}>
          + New Booking
        </button>
      </div>

      <div className="filters-bar">
        <select className="filter-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {BOOKING_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filters.paymentStatus} onChange={e => setFilters(f => ({ ...f, paymentStatus: e.target.value }))}>
          <option value="">All Payments</option>
          {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Tour</th>
                {isAdmin && <th>Customer</th>}
                <th>Travel Date</th>
                <th>Guests</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan="9">
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                    <h3>No bookings found</h3>
                    <p>Create your first booking to get started.</p>
                  </div>
                </td></tr>
              ) : bookings.map(b => (
                <tr key={b._id}>
                  <td><code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>{b.bookingRef}</code></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{b.tour?.title || 'N/A'}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{b.tour?.destination}</div>
                  </td>
                  {isAdmin && <td>
                    <div style={{ fontSize: 13 }}>{b.user?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{b.user?.email}</div>
                  </td>}
                  <td style={{ fontSize: 13 }}>{formatDate(b.travelDate)}</td>
                  <td style={{ fontSize: 13 }}>{b.adults}A {b.children > 0 ? `+ ${b.children}C` : ''}</td>
                  <td><strong>{formatCurrency(b.totalAmount)}</strong></td>
                  <td><span className={`badge ${getStatusBadge(b.status)}`}>{b.status}</span></td>
                  <td><span className={`badge ${getPaymentBadge(b.paymentStatus)}`}>{b.paymentStatus}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => setViewModal(b)}>View</button>
                      {/* Pay Now button for unpaid bookings (user only) */}
                      {!isAdmin && b.paymentStatus === 'Unpaid' && (
                        <button className="btn btn-sm btn-primary" onClick={() => navigate(`/payment/${b._id}`)}>
                          Pay Now
                        </button>
                      )}
                      {isAdmin && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={async () => {
                            try {
                              await api.put(`/bookings/${b._id}`, { status: 'Confirmed' });
                              toast.success('Booking confirmed');
                              fetchBookings(pagination.page);
                            } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
                          }}>Confirm</button>
                          <button className="btn btn-sm btn-danger" onClick={async () => {
                            try {
                              await api.put(`/bookings/${b._id}`, { status: 'Cancelled' });
                              toast.success('Booking cancelled');
                              fetchBookings(pagination.page);
                            } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
                          }}>Cancel</button>
                          <button className="btn btn-sm btn-primary" onClick={() => setEditModal({ ...b })}>Edit</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={pagination.page === 1} onClick={() => fetchBookings(pagination.page - 1)}>‹</button>
          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => fetchBookings(p)}>{p}</button>
          ))}
          <button className="page-btn" disabled={pagination.page === pagination.pages} onClick={() => fetchBookings(pagination.page + 1)}>›</button>
        </div>
      )}

      {/* Create Booking Modal */}
      {bookModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <span className="modal-title">Create New Booking</span>
              <button className="btn btn-icon btn-outline" onClick={() => setBookModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Tour *</label>
                <select className="form-select" value={bookForm.tourId} onChange={e => setBookForm(f => ({ ...f, tourId: e.target.value }))}>
                  <option value="">Choose a tour...</option>
                  {tours.map(t => <option key={t._id} value={t._id}>{t.title} - {t.destination} (${t.price.adult}/adult)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Travel Date *</label>
                <input type="date" className="form-input" value={bookForm.travelDate} onChange={e => setBookForm(f => ({ ...f, travelDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">Adults *</label>
                  <input type="number" className="form-input" min="1" value={bookForm.adults} onChange={e => setBookForm(f => ({ ...f, adults: +e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Children</label>
                  <input type="number" className="form-input" min="0" value={bookForm.children} onChange={e => setBookForm(f => ({ ...f, children: +e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-select" value={bookForm.paymentMethod} onChange={e => setBookForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                  {['Online', 'Credit Card', 'Bank Transfer', 'Cash'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Special Requests</label>
                <textarea className="form-textarea" rows={2} value={bookForm.specialRequests} onChange={e => setBookForm(f => ({ ...f, specialRequests: e.target.value }))} placeholder="Dietary requirements, accessibility needs..." />
              </div>
              {bookForm.tourId && tours.find(t => t._id === bookForm.tourId) && (
                <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '12px 14px', fontSize: 13 }}>
                  <strong>Estimated Total: </strong>
                  {formatCurrency(
                    tours.find(t => t._id === bookForm.tourId).price.adult * bookForm.adults +
                    tours.find(t => t._id === bookForm.tourId).price.child * bookForm.children
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setBookModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBookNow} disabled={saving}>{saving ? 'Creating...' : 'Create Booking'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <div className="modal-overlay" onClick={() => setViewModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Booking Details</span>
              <button className="btn btn-icon btn-outline" onClick={() => setViewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  { l: 'Booking Ref', v: viewModal.bookingRef },
                  { l: 'Tour', v: viewModal.tour?.title },
                  { l: 'Destination', v: viewModal.tour?.destination },
                  { l: 'Customer', v: viewModal.user?.name },
                  { l: 'Email', v: viewModal.user?.email },
                  { l: 'Travel Date', v: formatDate(viewModal.travelDate) },
                  { l: 'Guests', v: `${viewModal.adults} Adults, ${viewModal.children} Children` },
                  { l: 'Total Amount', v: formatCurrency(viewModal.totalAmount) },
                  { l: 'Payment Method', v: viewModal.paymentMethod },
                  { l: 'Status', v: <span className={`badge ${getStatusBadge(viewModal.status)}`}>{viewModal.status}</span> },
                  { l: 'Payment', v: <span className={`badge ${getPaymentBadge(viewModal.paymentStatus)}`}>{viewModal.paymentStatus}</span> },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>{item.l}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{item.v}</span>
                  </div>
                ))}
                {viewModal.specialRequests && (
                  <div><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>Special Requests</span><p style={{ fontSize: 13, marginTop: 4 }}>{viewModal.specialRequests}</p></div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewModal(null)}>Close</button>
              {!isAdmin && viewModal.paymentStatus === 'Unpaid' && (
                <button className="btn btn-primary" onClick={() => { setViewModal(null); navigate(`/payment/${viewModal._id}`); }}>
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title">Update Booking</span>
              <button className="btn btn-icon btn-outline" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Booking Status</label>
                <select className="form-select" value={editModal.status} onChange={e => setEditModal(m => ({ ...m, status: e.target.value }))}>
                  {BOOKING_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select className="form-select" value={editModal.paymentStatus} onChange={e => setEditModal(m => ({ ...m, paymentStatus: e.target.value }))}>
                  {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateBooking} disabled={saving}>{saving ? 'Saving...' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
