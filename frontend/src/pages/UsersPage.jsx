import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDate, getInitials } from '../utils/helpers';

const emptyForm = { name: '', email: '', password: '', role: 'user', phone: '' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'create', user: null });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const res = await api.get(`/users?${params}`);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const openCreate = () => { setForm(emptyForm); setModal({ open: true, mode: 'create', user: null }); };
  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role, phone: user.phone || '' });
    setModal({ open: true, mode: 'edit', user });
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required.'); return; }
    if (modal.mode === 'create' && !form.password) { toast.error('Password is required.'); return; }
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await api.post('/users', form);
        toast.success('User created!');
      } else {
        const { password, ...data } = form;
        await api.put(`/users/${modal.user._id}`, data);
        toast.success('User updated!');
      }
      setModal({ open: false, mode: 'create', user: null });
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (user) => {
    try {
      await api.patch(`/users/${user._id}/toggle-status`);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}!`);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteModal._id}`);
      toast.success('User deleted!');
      setDeleteModal(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">User Management</h1>
          <p className="section-subtitle">{pagination.total} registered users</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add User</button>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="form-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Payments</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="8">
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <h3>No users found</h3>
                  </div>
                </td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>{getInitials(u.name)}</div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{u.email}</td>
                  <td>
                    <div style={{ fontSize: 13 }}>{u.payments?.totalBookings || 0} bookings</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Paid: ${u.payments?.totalPaid?.toFixed(2) || '0.00'}</div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{u.phone || '—'}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-gray'}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{formatDate(u.lastLogin)}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{formatDate(u.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(u)}>Edit</button>
                      <a className="btn btn-sm btn-outline" href={`/bookings?user=${u._id}`}>View Bookings</a>
                      <button className={`btn btn-sm ${u.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => handleToggle(u)}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteModal(u)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
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
          <button className="page-btn" disabled={pagination.page === 1} onClick={() => fetchUsers(pagination.page - 1)}>‹</button>
          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => fetchUsers(p)}>{p}</button>
          ))}
          <button className="page-btn" disabled={pagination.page === pagination.pages} onClick={() => fetchUsers(pagination.page + 1)}>›</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal.open && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <span className="modal-title">{modal.mode === 'create' ? 'Add New User' : 'Edit User'}</span>
              <button className="btn btn-icon btn-outline" onClick={() => setModal({ open: false })}>✕</button>
            </div>
            <div className="modal-body">
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555..." />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              {modal.mode === 'create' && (
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input type="password" className="form-input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal({ open: false })}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : modal.mode === 'create' ? 'Create User' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title">Delete User</span>
              <button className="btn btn-icon btn-outline" onClick={() => setDeleteModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>Delete <strong>{deleteModal.name}</strong>? This cannot be undone.</p>
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
