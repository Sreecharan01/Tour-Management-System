const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Tour = require('./models/Tour');
const Booking = require('./models/Booking');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB for seeding...');

  // Clear existing data
  await User.deleteMany({});
  await Tour.deleteMany({});
  await Booking.deleteMany({});

  // Create admin and users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@tourpro.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0100',
    isActive: true
  });

  const user1 = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    role: 'user',
    phone: '+1-555-0101'
  });

  const user2 = await User.create({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    role: 'user',
    phone: '+1-555-0102'
  });

  // Create sample tours
  const tours = await Tour.insertMany([
    {
      title: 'Amazing Bali Getaway',
      description: 'Experience the magic of Bali with stunning temples, rice terraces, and pristine beaches. This carefully crafted itinerary balances adventure, culture, and relaxation.',
      destination: 'Bali',
      country: 'Indonesia',
      duration: { days: 7, nights: 6 },
      price: { adult: 1299, child: 799, currency: 'USD' },
      maxGroupSize: 15,
      difficulty: 'Easy',
      category: 'Beach',
      inclusions: ['Hotel accommodation', 'Daily breakfast', 'Airport transfers', 'Temple visits', 'Rice terrace trek'],
      exclusions: ['International flights', 'Visa fees', 'Personal expenses', 'Travel insurance'],
      itinerary: [
        { day: 1, title: 'Arrival & Kuta Beach', description: 'Arrive in Bali, check-in and relax at Kuta Beach.', accommodation: 'Kuta Beach Hotel' },
        { day: 2, title: 'Ubud Cultural Tour', description: 'Visit the Tegalalang Rice Terrace and Sacred Monkey Forest.', accommodation: 'Ubud Villa' },
        { day: 3, title: 'Temple Trail', description: 'Explore Tanah Lot and Uluwatu temples with sunset views.', accommodation: 'Ubud Villa' }
      ],
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'],
      startDates: [new Date('2025-03-15'), new Date('2025-04-10'), new Date('2025-05-05')],
      availableSlots: 12,
      rating: 45,
      ratingsCount: 10,
      featured: true,
      status: 'Active',
      createdBy: admin._id
    },
    {
      title: 'Swiss Alps Adventure',
      description: 'Conquer the majestic Swiss Alps with world-class skiing, hiking, and breathtaking mountain scenery. An unforgettable alpine experience.',
      destination: 'Interlaken',
      country: 'Switzerland',
      duration: { days: 8, nights: 7 },
      price: { adult: 3499, child: 2200, currency: 'USD' },
      maxGroupSize: 12,
      difficulty: 'Challenging',
      category: 'Mountain',
      inclusions: ['4-star hotel', 'Ski passes', 'Guided hikes', 'Cable car rides', 'All breakfasts & dinners'],
      exclusions: ['Flights', 'Ski equipment rental', 'Travel insurance', 'Alcohol'],
      coverImage: 'https://images.unsplash.com/photo-1531400158697-005a3d415b4a?w=800',
      images: ['https://images.unsplash.com/photo-1531400158697-005a3d415b4a?w=800'],
      startDates: [new Date('2025-02-20'), new Date('2025-03-10')],
      availableSlots: 8,
      rating: 48,
      ratingsCount: 9,
      featured: true,
      status: 'Active',
      createdBy: admin._id
    },
    {
      title: 'African Safari Experience',
      description: 'Witness the Great Migration and explore the vast Serengeti. Encounter the Big Five in their natural habitat on this once-in-a-lifetime safari.',
      destination: 'Serengeti',
      country: 'Tanzania',
      duration: { days: 10, nights: 9 },
      price: { adult: 4999, child: 3500, currency: 'USD' },
      maxGroupSize: 8,
      difficulty: 'Moderate',
      category: 'Wildlife',
      inclusions: ['Luxury safari lodge', 'All meals', 'Game drives', 'Park fees', 'English guide'],
      exclusions: ['International flights', 'Visa', 'Yellow fever vaccination', 'Tips'],
      coverImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'],
      startDates: [new Date('2025-07-01'), new Date('2025-08-15')],
      availableSlots: 6,
      rating: 50,
      ratingsCount: 8,
      featured: true,
      status: 'Active',
      createdBy: admin._id
    },
    {
      title: 'Kyoto Cultural Immersion',
      description: 'Explore ancient temples, zen gardens, and geisha districts in Japan\'s cultural capital. Experience tea ceremonies and authentic Japanese hospitality.',
      destination: 'Kyoto',
      country: 'Japan',
      duration: { days: 6, nights: 5 },
      price: { adult: 2299, child: 1500, currency: 'USD' },
      maxGroupSize: 10,
      difficulty: 'Easy',
      category: 'Cultural',
      inclusions: ['Ryokan accommodation', 'Breakfast included', 'Temple passes', 'Tea ceremony', 'Kimono rental'],
      exclusions: ['Flights', 'Lunch & dinner', 'Personal shopping'],
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'],
      startDates: [new Date('2025-04-01'), new Date('2025-11-01')],
      availableSlots: 9,
      rating: 47,
      ratingsCount: 11,
      featured: false,
      status: 'Active',
      createdBy: admin._id
    },
    {
      title: 'Maldives Paradise Escape',
      description: 'Ultimate luxury in the crystal-clear waters of the Maldives. Private overwater bungalows, world-class snorkeling, and absolute serenity.',
      destination: 'Malé Atoll',
      country: 'Maldives',
      duration: { days: 5, nights: 4 },
      price: { adult: 3999, child: 2800, currency: 'USD' },
      maxGroupSize: 6,
      difficulty: 'Easy',
      category: 'Honeymoon',
      inclusions: ['Overwater villa', 'All-inclusive meals', 'Snorkeling gear', 'Speedboat transfers', 'Spa treatment'],
      exclusions: ['International flights', 'Alcohol upgrades', 'Excursions'],
      coverImage: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
      images: ['https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800'],
      startDates: [new Date('2025-02-14'), new Date('2025-06-01')],
      availableSlots: 4,
      rating: 50,
      ratingsCount: 7,
      featured: true,
      status: 'Active',
      createdBy: admin._id
    },
    {
      title: 'New York City Explorer',
      description: 'Discover the city that never sleeps! From Times Square to Central Park, museums to Broadway shows — the ultimate NYC experience.',
      destination: 'New York City',
      country: 'USA',
      duration: { days: 5, nights: 4 },
      price: { adult: 1899, child: 1200, currency: 'USD' },
      maxGroupSize: 20,
      difficulty: 'Easy',
      category: 'City',
      inclusions: ['Hotel in Midtown', 'City pass', 'Guided tours', 'Airport transfers', 'Welcome dinner'],
      exclusions: ['Flights', 'Broadway tickets', 'Meals (except dinner)'],
      coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
      images: ['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'],
      startDates: [new Date('2025-03-01'), new Date('2025-09-15')],
      availableSlots: 18,
      rating: 44,
      ratingsCount: 12,
      featured: false,
      status: 'Active',
      createdBy: admin._id
    }
  ]);

  // Create sample bookings
  await Booking.create([
    {
      tour: tours[0]._id,
      user: user1._id,
      travelDate: new Date('2025-03-15'),
      adults: 2,
      children: 1,
      totalAmount: tours[0].price.adult * 2 + tours[0].price.child,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
      contactInfo: { name: user1.name, email: user1.email, phone: user1.phone }
    },
    {
      tour: tours[1]._id,
      user: user2._id,
      travelDate: new Date('2025-02-20'),
      adults: 2,
      children: 0,
      totalAmount: tours[1].price.adult * 2,
      status: 'Pending',
      paymentStatus: 'Partial',
      paymentMethod: 'Bank Transfer',
      contactInfo: { name: user2.name, email: user2.email, phone: user2.phone }
    },
    {
      tour: tours[2]._id,
      user: user1._id,
      travelDate: new Date('2025-07-01'),
      adults: 1,
      children: 0,
      totalAmount: tours[2].price.adult,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'Online',
      contactInfo: { name: user1.name, email: user1.email, phone: user1.phone }
    }
  ]);

  console.log('\n✅ Database seeded successfully!');
  console.log('👤 Admin: admin@tourpro.com / admin123');
  console.log('👤 User: john@example.com / user123');
  console.log('👤 User: jane@example.com / user123');
  console.log(`🌍 ${tours.length} tours created\n`);

  mongoose.connection.close();
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
