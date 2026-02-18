import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency, getStatusBadge, CATEGORIES, DIFFICULTIES, TOUR_STATUSES, truncate } from '../utils/helpers';

const emptyTour = {
  title: '', description: '', destination: '', country: '',
  duration: { days: 1, nights: 0 },
  price: { adult: 0, child: 0, currency: 'USD' },
  maxGroupSize: 10, difficulty: 'Easy', category: 'Beach',
  inclusions: [], exclusions: [],
  coverImage: '', status: 'Active', featured: false
};

export default function ToursPage() {
  const { isAdmin } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', category: '', difficulty: '', status: '' });
  const [modal, setModal] = useState({ open: false, mode: 'view', tour: null });
  const [form, setForm] = useState(emptyTour);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [tagInput, setTagInput] = useState({ inclusions: '', exclusions: '' });

  const fetchTours = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9, ...filters });
      Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
      const res = await api.get(`/tour?${params}`);
      setTours(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load tours');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTours(1); }, [fetchTours]);

  const openCreate = () => { setForm(emptyTour); setModal({ open: true, mode: 'create', tour: null }); };
  const openEdit = (tour) => {
    setForm({
      title: tour.title, description: tour.description,
      destination: tour.destination, country: tour.country,
      duration: tour.duration, price: tour.price,
      maxGroupSize: tour.maxGroupSize, difficulty: tour.difficulty,
      category: tour.category, inclusions: tour.inclusions || [],
      exclusions: tour.exclusions || [], coverImage: tour.coverImage || '',
      status: tour.status, featured: tour.featured
    });
    setModal({ open: true, mode: 'edit', tour });
  };
  const openView = (tour) => setModal({ open: true, mode: 'view', tour });
  const closeModal = () => { setModal({ open: false, mode: 'view', tour: null }); setSaving(false); };

  const addTag = (field) => {
    const val = tagInput[field].trim();
    if (!val) return;
    setForm(f => ({ ...f, [field]: [...f[field], val] }));
    setTagInput(t => ({ ...t, [field]: '' }));
  };

  const removeTag = (field, idx) => {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.title || !form.destination || !form.country) {
      toast.error('Please fill in required fields.'); return;
    }
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await api.post('/tour', form);
        toast.success('Tour created!');
      } else {
        await api.put(`/tour/${modal.tour._id}`, form);
        toast.success('Tour updated!');
      }
      fetchTours(pagination.page);
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tour/${deleteModal._id}`);
      toast.success('Tour deleted!');
      setDeleteModal(null);
      fetchTours(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const navigate = useNavigate();

  const handleBookFromCard = (tour) => {
    // navigate to bookings page and open modal with tour preselected
    navigate('/bookings', { state: { tourId: tour._id } });
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">Tour Packages</h1>
          <p className="section-subtitle">{pagination.total} total packages</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Tour
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            className="form-input"
            placeholder="Search tours, destinations..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        <select className="filter-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={filters.difficulty} onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}>
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
        </select>
        {isAdmin && (
          <select className="filter-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            {TOUR_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-container"><div className="loading-spinner" /></div>
      ) : tours.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <h3>No tours found</h3>
          <p>{isAdmin ? 'Create your first tour package to get started.' : 'No tours match your search.'}</p>
          {isAdmin && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>+ Create Tour</button>}
        </div>
      ) : (
        <div className="tour-grid">
          {tours.map(tour => (
            <div key={tour._id} className="tour-card">
              <div className="tour-card-image">
                {tour.coverImage ? (
                  <img src={tour.coverImage} alt={tour.title} loading="lazy" />
                ) : (
                  <div className="tour-card-image-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                )}
                <div className="tour-badge">
                  <span className={`badge ${getStatusBadge(tour.status)}`}>{tour.status}</span>
                </div>
                {tour.featured && <div className="tour-featured-badge">⭐ Featured</div>}
              </div>
              <div className="tour-card-body">
                <div className="tour-category">{tour.category}</div>
                <div className="tour-title">{tour.title}</div>
                <div className="tour-destination">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {tour.destination}, {tour.country}
                </div>
                <div className="tour-meta">
                  <div className="tour-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {tour.duration.days}D / {tour.duration.nights}N
                  </div>
                  <div className="tour-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    Max {tour.maxGroupSize}
                  </div>
                  <div className="tour-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {tour.difficulty}
                  </div>
                </div>
                <div className="tour-footer">
                  <div className="tour-price">
                    <div className="price-amount">{formatCurrency(tour.price.adult)}</div>
                    <div className="price-label">per person</div>
                  </div>
                    <div className="tour-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openView(tour)}>View</button>
                    {!isAdmin && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleBookFromCard(tour)}>Book</button>
                    )}
                    {isAdmin && (
                      <>
                        <button className="btn btn-sm btn-primary" onClick={() => openEdit(tour)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteModal(tour)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={pagination.page === 1} onClick={() => fetchTours(pagination.page - 1)}>‹</button>
          {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => fetchTours(p)}>{p}</button>
          ))}
          <button className="page-btn" disabled={pagination.page === pagination.pages} onClick={() => fetchTours(pagination.page + 1)}>›</button>
        </div>
      )}

      {/* View Modal */}
      {modal.open && modal.mode === 'view' && modal.tour && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <span className="modal-title">{modal.tour.title}</span>
              <button className="btn btn-icon btn-outline" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {modal.tour.coverImage && (
                <img src={modal.tour.coverImage} alt="" style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 18 }} />
              )}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                <span className={`badge ${getStatusBadge(modal.tour.status)}`}>{modal.tour.status}</span>
                <span className="badge badge-primary">{modal.tour.category}</span>
                <span className="badge badge-gray">{modal.tour.difficulty}</span>
                {modal.tour.featured && <span className="badge badge-warning">⭐ Featured</span>}
              </div>
              <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 18, lineHeight: 1.7 }}>{modal.tour.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
                {[
                  { l: 'Destination', v: `${modal.tour.destination}, ${modal.tour.country}` },
                  { l: 'Duration', v: `${modal.tour.duration.days} Days / ${modal.tour.duration.nights} Nights` },
                  { l: 'Group Size', v: `Max ${modal.tour.maxGroupSize} people` },
                  { l: 'Adult Price', v: formatCurrency(modal.tour.price.adult) },
                  { l: 'Child Price', v: formatCurrency(modal.tour.price.child) },
                  { l: 'Available Slots', v: modal.tour.availableSlots },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{item.l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{item.v}</div>
                  </div>
                ))}
              </div>
              {modal.tour.inclusions?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>✅ Inclusions</div>
                  <div className="tags-container">{modal.tour.inclusions.map((inc, i) => <span key={i} className="tag">{inc}</span>)}</div>
                </div>
              )}
              {modal.tour.exclusions?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>❌ Exclusions</div>
                  <div className="tags-container">{modal.tour.exclusions.map((ex, i) => <span key={i} className="tag" style={{ background: 'var(--danger-light)', color: '#991b1b' }}>{ex}</span>)}</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {isAdmin && <button className="btn btn-primary" onClick={() => openEdit(modal.tour)}>Edit Tour</button>}
              <button className="btn btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal.open && (modal.mode === 'create' || modal.mode === 'edit') && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 750 }}>
            <div className="modal-header">
              <span className="modal-title">{modal.mode === 'create' ? '+ New Tour Package' : 'Edit Tour Package'}</span>
              <button className="btn btn-icon btn-outline" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">Tour Title *</label>
                  <input type="text" className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Amazing Bali Getaway" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the tour experience..." />
              </div>
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">Destination *</label>
                  <input type="text" className="form-input" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="Bali" />
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <input type="text" className="form-input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="Indonesia" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Days</label>
                  <input type="number" className="form-input" min="1" value={form.duration.days} onChange={e => setForm(f => ({ ...f, duration: { ...f.duration, days: +e.target.value } }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nights</label>
                  <input type="number" className="form-input" min="0" value={form.duration.nights} onChange={e => setForm(f => ({ ...f, duration: { ...f.duration, nights: +e.target.value } }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Adult Price ($)</label>
                  <input type="number" className="form-input" min="0" value={form.price.adult} onChange={e => setForm(f => ({ ...f, price: { ...f.price, adult: +e.target.value } }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Child Price ($)</label>
                  <input type="number" className="form-input" min="0" value={form.price.child} onChange={e => setForm(f => ({ ...f, price: { ...f.price, child: +e.target.value } }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Max Group Size</label>
                  <input type="number" className="form-input" min="1" value={form.maxGroupSize} onChange={e => setForm(f => ({ ...f, maxGroupSize: +e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select className="form-select" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {TOUR_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input type="url" className="form-input" value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} placeholder="https://..." />
              </div>
              {['inclusions', 'exclusions'].map(field => (
                <div key={field} className="form-group">
                  <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" className="form-input" value={tagInput[field]} onChange={e => setTagInput(t => ({ ...t, [field]: e.target.value }))} placeholder={`Add ${field}...`}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(field))} />
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => addTag(field)}>Add</button>
                  </div>
                  <div className="tags-container">
                    {form[field].map((tag, i) => (
                      <span key={i} className="tag">{tag} <button onClick={() => removeTag(field, i)}>×</button></span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  Mark as Featured Tour
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : modal.mode === 'create' ? 'Create Tour' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">Delete Tour</span>
              <button className="btn btn-icon btn-outline" onClick={() => setDeleteModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>
                Are you sure you want to delete <strong>{deleteModal.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
