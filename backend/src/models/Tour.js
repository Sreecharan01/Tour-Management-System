const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tour title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  duration: {
    days: { type: Number, required: true, min: 1 },
    nights: { type: Number, required: true, min: 0 }
  },
  price: {
    adult: { type: Number, required: true, min: 0 },
    child: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' }
  },
  maxGroupSize: {
    type: Number,
    required: true,
    min: 1,
    max: 500
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Challenging', 'Expert'],
    default: 'Easy'
  },
  category: {
    type: String,
    enum: ['Adventure', 'Beach', 'Cultural', 'Wildlife', 'Mountain', 'City', 'Cruise', 'Honeymoon'],
    required: true
  },
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    accommodation: String
  }],
  images: [{ type: String }],
  coverImage: { type: String, default: null },
  startDates: [{ type: Date }],
  availableSlots: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingsCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Sold Out', 'Coming Soon'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Virtual for average rating
tourSchema.virtual('averageRating').get(function () {
  if (this.ratingsCount === 0) return 0;
  return (this.rating / this.ratingsCount).toFixed(1);
});

tourSchema.set('toJSON', { virtuals: true });
tourSchema.set('toObject', { virtuals: true });

// Text index for search
tourSchema.index({ title: 'text', destination: 'text', country: 'text', description: 'text' });

module.exports = mongoose.model('Tour', tourSchema);
