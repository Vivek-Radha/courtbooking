import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  flatNumber: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled'],
    default: 'booked',
  }
}, { timestamps: true });

// Prevent double booking for same date and time slot
bookingSchema.index({ date: 1, timeSlot: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: 'booked' } 
});

export default mongoose.model('Booking', bookingSchema);
