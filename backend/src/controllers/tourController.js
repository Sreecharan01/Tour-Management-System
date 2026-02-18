const Tour = require('../models/Tour');

// @desc    Get all tours
// @route   GET /api/tour
// @access  Public
const getTours = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, search, category, difficulty,
      status, minPrice, maxPrice, sortBy = 'createdAt', order = 'desc', featured
    } = req.query;

    // Build query
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;
    if (featured === 'true') query.featured = true;
    if (minPrice || maxPrice) {
      query['price.adult'] = {};
      if (minPrice) query['price.adult'].$gte = Number(minPrice);
      if (maxPrice) query['price.adult'].$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [tours, total] = await Promise.all([
      Tour.find(query)
        .populate('createdBy', 'name email')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Tour.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: tours,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single tour
// @route   GET /api/tour/:id
// @access  Public
const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).populate('createdBy', 'name email');
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found.' });
    }
    res.json({ success: true, data: tour });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create tour
// @route   POST /api/tour
// @access  Private/Admin
const createTour = async (req, res) => {
  try {
    const tourData = { ...req.body, createdBy: req.user.id };

    // Parse JSON strings if needed (from form data)
    if (typeof tourData.duration === 'string') tourData.duration = JSON.parse(tourData.duration);
    if (typeof tourData.price === 'string') tourData.price = JSON.parse(tourData.price);
    if (typeof tourData.inclusions === 'string') tourData.inclusions = JSON.parse(tourData.inclusions);
    if (typeof tourData.exclusions === 'string') tourData.exclusions = JSON.parse(tourData.exclusions);
    if (typeof tourData.itinerary === 'string') tourData.itinerary = JSON.parse(tourData.itinerary);
    if (typeof tourData.startDates === 'string') tourData.startDates = JSON.parse(tourData.startDates);

    const tour = await Tour.create(tourData);
    await tour.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Tour package created successfully!',
      data: tour
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update tour
// @route   PUT /api/tour/:id
// @access  Private/Admin
const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found.' });
    }

    const updateData = { ...req.body };
    if (typeof updateData.duration === 'string') updateData.duration = JSON.parse(updateData.duration);
    if (typeof updateData.price === 'string') updateData.price = JSON.parse(updateData.price);
    if (typeof updateData.inclusions === 'string') updateData.inclusions = JSON.parse(updateData.inclusions);
    if (typeof updateData.exclusions === 'string') updateData.exclusions = JSON.parse(updateData.exclusions);
    if (typeof updateData.itinerary === 'string') updateData.itinerary = JSON.parse(updateData.itinerary);

    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Tour updated successfully!',
      data: updatedTour
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete tour
// @route   DELETE /api/tour/:id
// @access  Private/Admin
const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found.' });
    }
    await tour.deleteOne();
    res.json({ success: true, message: 'Tour deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tour stats
// @route   GET /api/tour/stats
// @access  Private/Admin
const getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price.adult' },
          minPrice: { $min: '$price.adult' },
          maxPrice: { $max: '$price.adult' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTours, getTour, createTour, updateTour, deleteTour, getTourStats };
