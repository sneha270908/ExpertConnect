const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:MM
  isBooked: { type: Boolean, default: false },
});

const expertSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Finance', 'Health', 'Legal', 'Marketing', 'Design', 'Business', 'Education'],
    },
    experience: { type: Number, required: true },
    rating: { type: Number, min: 1, max: 5, default: 4.0 },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    hourlyRate: { type: Number, default: 100 },
    availableSlots: [timeSlotSchema],
  },
  { timestamps: true }
);

expertSchema.index({ name: 'text' });
expertSchema.index({ category: 1 });

module.exports = mongoose.model('Expert', expertSchema);
