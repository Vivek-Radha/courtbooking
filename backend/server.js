import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/Booking.js';
import Admin from './models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For dev
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// --- Database Connection with Local JSON Fallback ---
let isMongoConnected = false;

// Ensure file exists for the local database fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JSON_DB_PATH = path.join(__dirname, 'bookings.json');

if (!fs.existsSync(JSON_DB_PATH)) {
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify([]));
}

const readLocalBookings = () => {
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local JSON db:', err);
    return [];
  }
};

const writeLocalBookings = (bookings) => {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error('Error writing to local JSON db:', err);
  }
};

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 2000
})
  .then(() => {
    console.log("MongoDB Connected")
    console.log("Database Name:", mongoose.connection.name)
  })
  .catch((err) => {
    console.log(err)
  })

// --- Socket.io for Real-time ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// --- Public Routes ---

// Get all booked slots for a specific date
app.get('/api/slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    let bookings = [];
    if (isMongoConnected) {
      try {
        bookings = await Booking.find({ date, status: 'booked' });
      } catch (err) {
        console.error('MongoDB query error, using local fallback:', err);
        const local = readLocalBookings();
        bookings = local.filter(b => b.date === date && b.status === 'booked');
      }
    } else {
      const local = readLocalBookings();
      bookings = local.filter(b => b.date === date && b.status === 'booked');
    }

    const bookedSlots = bookings.map(b => b.timeSlot);
    res.json({ bookedSlots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { date, timeSlot, flatNumber, name, phoneNumber } = req.body;
    if (!date || !timeSlot || !flatNumber || !name || !phoneNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (isMongoConnected) {
      try {
        const newBooking = new Booking({ date, timeSlot, flatNumber, name, phoneNumber });
        await newBooking.save();
      } catch (err) {
        console.error('MongoDB save error, using local fallback:', err);
        if (err.code === 11000) {
          return res.status(400).json({ error: 'Slot already booked' });
        }
        // Fallback to saving in local JSON if save fails
        saveLocalBooking({ date, timeSlot, flatNumber, name, phoneNumber });
      }
    } else {
      saveLocalBooking({ date, timeSlot, flatNumber, name, phoneNumber });
    }

    // Notify all clients about the new booking
    io.emit('slot_booked', { date, timeSlot });

    res.status(201).json({ message: 'Booking successful' });
  } catch (error) {
    if (error.code === 11000 || error.message === 'Slot already booked') {
      return res.status(400).json({ error: 'Slot already booked' });
    }
    res.status(500).json({ error: error.message });
  }
});

function saveLocalBooking(data) {
  const local = readLocalBookings();
  const exists = local.some(b => b.date === data.date && b.timeSlot === data.timeSlot && b.status === 'booked');
  if (exists) {
    const err = new Error('Slot already booked');
    err.code = 11000;
    throw err;
  }
  const newBooking = {
    id: crypto.randomUUID(),
    _id: crypto.randomUUID(), // for MongoDB compatibility
    ...data,
    status: 'booked',
    createdAt: new Date().toISOString()
  };
  local.push(newBooking);
  writeLocalBookings(local);
  return newBooking;
}


// --- Admin Routes ---
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/admin/login', async (req, res) => {
  // Mock login for demo
  const { username, password } = req.body;
  if (password === 'admin123') {
    const token = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// Get all bookings (admin only)
app.get('/api/admin/bookings', authenticateAdmin, async (req, res) => {
  try {
    let bookings = [];
    if (isMongoConnected) {
      bookings = await Booking.find({}).sort({ createdAt: -1 });
    } else {
      bookings = readLocalBookings().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel/delete booking (admin only)
app.delete('/api/admin/bookings/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Booking.findByIdAndDelete(id);
    } else {
      let local = readLocalBookings();
      local = local.filter(b => b.id !== id && b._id !== id);
      writeLocalBookings(local);
    }

    // Notify all clients about deletion
    io.emit('booking_cancelled', { id });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
