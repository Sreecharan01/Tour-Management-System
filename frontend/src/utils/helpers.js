export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getStatusBadge = (status) => {
  const map = {
    'Active': 'badge-success',
    'Confirmed': 'badge-success',
    'Paid': 'badge-success',
    'Completed': 'badge-success',
    'Inactive': 'badge-gray',
    'Cancelled': 'badge-danger',
    'Refunded': 'badge-danger',
    'Pending': 'badge-warning',
    'Partial': 'badge-warning',
    'Unpaid': 'badge-warning',
    'Sold Out': 'badge-danger',
    'Coming Soon': 'badge-info'
  };
  return map[status] || 'badge-gray';
};

export const truncate = (str, n = 60) => {
  if (!str) return '';
  return str.length > n ? str.substr(0, n - 1) + '...' : str;
};

export const generateStars = (rating, max = 5) => {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    stars.push(i <= Math.round(rating) ? '★' : '☆');
  }
  return stars.join('');
};

export const CATEGORIES = ['Adventure', 'Beach', 'Cultural', 'Wildlife', 'Mountain', 'City', 'Cruise', 'Honeymoon'];
export const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Expert'];
export const TOUR_STATUSES = ['Active', 'Inactive', 'Sold Out', 'Coming Soon'];
export const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
export const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid', 'Refunded'];
