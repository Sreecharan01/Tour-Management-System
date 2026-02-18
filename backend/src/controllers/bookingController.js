const Booking = require('../models/Booking');
const Tour = require('../models/Tour');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { tourId, travelDate, adults, children, paymentMethod, specialRequests, contactInfo } = req.body;

    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ success: false, message: 'Tour not found.' });
    if (tour.status === 'Inactive' || tour.status === 'Sold Out') {
      return res.status(400).json({ success: false, message: 'Tour is not available for booking.' });
    }

    const totalAmount = (tour.price.adult * adults) + (tour.price.child * (children || 0));

    const booking = await Booking.create({
      tour: tourId,
      user: req.user.id,
      travelDate,
      adults,
      children: children || 0,
      totalAmount,
      paymentMethod,
      specialRequests,
      contactInfo: contactInfo || { name: req.user.name, email: req.user.email }
    });

    await booking.populate(['tour', 'user']);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      data: booking
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin) or user bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    if (req.user.role !== 'admin') query.user = req.user.id;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('tour', 'title destination price coverImage')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('tour').populate('user');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Owner or admin only
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking.' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Admin
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('tour', 'title destination')
      .populate('user', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    res.json({ success: true, message: 'Booking updated!', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Pay for a booking (user or admin)
// @route   POST /api/bookings/:id/pay
// @access  Private
const payBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('tour').populate('user');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Only owner or admin can pay
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking.' });
    }

    // Simple payment simulation: mark as Paid
    booking.paymentStatus = 'Paid';
    booking.status = 'Confirmed';
    await booking.save();

    res.json({ success: true, message: 'Payment successful!', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reports / analytics
// @route   GET /api/reports
// @access  Private/Admin
const getReports = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    const [
      totalBookings,
      confirmedBookings,
      totalRevenue,
      recentBookings,
      bookingsByStatus,
      revenueByMonth,
      topTours
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Confirmed' }),
      Booking.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.countDocuments({ createdAt: { $gte: daysAgo } }),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            bookings: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]),
      Booking.aggregate([
        { $group: { _id: '$tour', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'tours', localField: '_id', foreignField: '_id', as: 'tour' } },
        { $unwind: '$tour' },
        { $project: { 'tour.title': 1, 'tour.destination': 1, count: 1, revenue: 1 } }
      ])
    ]);

    const Tour = require('../models/Tour');
    const User = require('../models/User');
    const [totalTours, totalUsers] = await Promise.all([
      Tour.countDocuments({ status: 'Active' }),
      User.countDocuments({ role: 'user' })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalBookings,
          confirmedBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          recentBookings,
          totalTours,
          totalUsers
        },
        bookingsByStatus,
        revenueByMonth: revenueByMonth.reverse(),
        topTours
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking, getBookings, getBooking, updateBooking, getReports, payBooking };

