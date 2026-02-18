const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { getTours, getTour, createTour, updateTour, deleteTour, getTourStats } = require('../controllers/tourController');
const { createBooking, getBookings, getBooking, updateBooking, getReports, payBooking } = require('../controllers/bookingController');
const { getSettings, updateSettings, getUsers, getUser, createUser, updateUser, deleteUser, toggleUserStatus } = require('../controllers/adminController');

// ============ AUTH ROUTES ============
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.put('/auth/update-profile', protect, updateProfile);
router.put('/auth/change-password', protect, changePassword);

// ============ TOUR ROUTES ============
// Public
router.get('/tour', getTours);
router.get('/tour/stats', protect, authorize('admin'), getTourStats);
router.get('/tour/:id', getTour);

// Admin only
router.post('/tour', protect, authorize('admin'), createTour);
router.put('/tour/:id', protect, authorize('admin'), updateTour);
router.delete('/tour/:id', protect, authorize('admin'), deleteTour);

// ============ BOOKING ROUTES ============
router.post('/bookings', protect, createBooking);
router.get('/bookings', protect, getBookings);
router.get('/bookings/:id', protect, getBooking);
router.put('/bookings/:id', protect, authorize('admin'), updateBooking);
router.post('/bookings/:id/pay', protect, payBooking);

// ============ REPORTS ROUTES ============
router.get('/reports', protect, authorize('admin'), getReports);

// ============ SETTINGS ROUTES ============
router.get('/settings', protect, authorize('admin'), getSettings);
router.put('/settings', protect, authorize('admin'), updateSettings);

// ============ USER MANAGEMENT (Admin) ============
router.get('/users', protect, authorize('admin'), getUsers);
router.get('/users/:id', protect, authorize('admin'), getUser);
router.post('/users', protect, authorize('admin'), createUser);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.patch('/users/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
