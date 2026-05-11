const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

// POST /bookings
exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { expertId, userName, email, phone, date, timeSlot, notes } = req.body;

    // Validate required fields
    if (!expertId || !userName || !email || !phone || !date || !timeSlot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'All fields are required: expertId, userName, email, phone, date, timeSlot',
      });
    }

    // Find expert and lock the slot atomically
    const expert = await Expert.findOneAndUpdate(
      {
        _id: expertId,
        'availableSlots.date': date,
        'availableSlots.time': timeSlot,
        'availableSlots.isBooked': false,
      },
      { $set: { 'availableSlots.$.isBooked': true } },
      { new: true, session }
    );

    if (!expert) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: 'This slot is already booked or does not exist. Please choose another slot.',
      });
    }

    const booking = new Booking({
      expertId,
      expertName: expert.name,
      userName,
      email,
      phone,
      date,
      timeSlot,
      notes,
    });

    await booking.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Emit real-time update to all clients viewing this expert
    if (req.io) {
      req.io.to(`expert_${expertId}`).emit('slot_booked', { expertId, date, timeSlot });
    }

    res.status(201).json({ success: true, data: booking, message: 'Booking confirmed!' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Handle duplicate booking (race condition fallback)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This slot was just booked by someone else. Please choose another slot.',
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /bookings?email=
exports.getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const bookings = await Booking.find({ email: email.toLowerCase() })
      .populate('expertId', 'name category avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Confirmed', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Confirmed, or Completed',
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Emit real-time status update
    if (req.io) {
      req.io.emit('booking_status_updated', { bookingId: booking._id, status });
    }

    res.json({ success: true, data: booking, message: 'Booking status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
