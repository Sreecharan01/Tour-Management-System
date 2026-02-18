const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'TourPro Management System' },
  siteTagline: { type: String, default: 'Discover the World with Us' },
  contactEmail: { type: String, default: 'admin@tourpro.com' },
  contactPhone: { type: String, default: '+1 (555) 123-4567' },
  address: { type: String, default: '123 Travel Street, New York, NY 10001' },
  currency: { type: String, default: 'USD' },
  currencySymbol: { type: String, default: '$' },
  timezone: { type: String, default: 'UTC' },
  bookingPolicy: { type: String, default: 'Cancellation allowed 48 hours before travel date.' },
  cancellationPolicy: { type: String, default: 'Full refund if cancelled 7 days before. 50% refund if cancelled 3-7 days before.' },
  maxBookingsPerUser: { type: Number, default: 10 },
  maintenanceMode: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  logo: { type: String, default: null },
  primaryColor: { type: String, default: '#6366f1' },
  accentColor: { type: String, default: '#f59e0b' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
