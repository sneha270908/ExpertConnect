const Expert = require('../models/Expert');

const generateSlots = () => {
  const slots = [];
  const today = new Date();
  for (let d = 1; d <= 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    times.forEach((time) => {
      slots.push({ date: dateStr, time, isBooked: false });
    });
  }
  return slots;
};

const experts = [
  {
    name: 'Dr. Priya Sharma',
    category: 'Health',
    experience: 12,
    rating: 4.9,
    bio: 'Senior consultant with 12+ years in preventive healthcare and nutrition. Helped 500+ clients achieve healthier lifestyles.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    hourlyRate: 150,
  },
  {
    name: 'Arjun Mehta',
    category: 'Technology',
    experience: 8,
    rating: 4.8,
    bio: 'Full-stack engineer and CTO with expertise in cloud architecture, AI systems, and startup scaling.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
    hourlyRate: 200,
  },
  {
    name: 'Sneha Kapoor',
    category: 'Finance',
    experience: 10,
    rating: 4.7,
    bio: 'Chartered accountant and investment advisor specializing in personal wealth management and tax optimization.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
    hourlyRate: 180,
  },
  {
    name: 'Rahul Verma',
    category: 'Legal',
    experience: 15,
    rating: 4.6,
    bio: 'Senior advocate with expertise in corporate law, contracts, and intellectual property rights.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    hourlyRate: 250,
  },
  {
    name: 'Ananya Singh',
    category: 'Marketing',
    experience: 6,
    rating: 4.8,
    bio: 'Growth marketing strategist who has scaled D2C brands from 0 to 10Cr+ ARR using digital channels.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    hourlyRate: 120,
  },
  {
    name: 'Vikram Nair',
    category: 'Design',
    experience: 9,
    rating: 4.9,
    bio: 'Product designer and UX researcher with experience at top startups. Focused on accessible, user-centric design.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    hourlyRate: 160,
  },
  {
    name: 'Kavya Reddy',
    category: 'Business',
    experience: 11,
    rating: 4.7,
    bio: 'MBA from IIM, business strategy consultant who has advised 100+ SMEs on market entry and growth.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya',
    hourlyRate: 220,
  },
  {
    name: 'Rohan Das',
    category: 'Education',
    experience: 7,
    rating: 4.5,
    bio: 'EdTech entrepreneur and curriculum designer. Specializes in competitive exam preparation and career counseling.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
    hourlyRate: 80,
  },
  {
    name: 'Meera Iyer',
    category: 'Technology',
    experience: 5,
    rating: 4.6,
    bio: 'Cybersecurity specialist and ethical hacker. Helps startups build secure systems from day one.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera',
    hourlyRate: 190,
  },
  {
    name: 'Aditya Joshi',
    category: 'Finance',
    experience: 14,
    rating: 4.8,
    bio: 'Venture capitalist and angel investor with portfolio of 50+ startups. Expert in fundraising and valuation.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya',
    hourlyRate: 300,
  },
  {
    name: 'Pooja Bhatt',
    category: 'Health',
    experience: 8,
    rating: 4.7,
    bio: 'Licensed clinical psychologist specializing in stress management, anxiety, and work-life balance coaching.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja',
    hourlyRate: 140,
  },
  {
    name: 'Sanjay Gupta',
    category: 'Legal',
    experience: 20,
    rating: 4.9,
    bio: 'Senior partner at a leading law firm with specialization in real estate law and property disputes.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjay',
    hourlyRate: 350,
  },
];

const seedExperts = async () => {
  try {
    const count = await Expert.countDocuments();
    if (count === 0) {
      const expertsWithSlots = experts.map((e) => ({
        ...e,
        availableSlots: generateSlots(),
      }));
      await Expert.insertMany(expertsWithSlots);
      console.log(`✅ Seeded ${experts.length} experts with time slots`);
    } else {
      console.log(`ℹ️  Database already has ${count} experts, skipping seed`);
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
};

module.exports = seedExperts;
