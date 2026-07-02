import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { format, addDays, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MORNING_SLOTS = [
  "06:00 - 07:00", "07:00 - 08:00"
];

const EVENING_SLOTS = [
  "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00"
];

// Convert 24hr slot string to 12hr display format
const formatSlotDisplay = (slot) => {
  return slot.replace(/(\d{2}):(\d{2})/g, (_, h, m) => {
    const hour = parseInt(h, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${period}`;
  });
};

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [flatNumber, setFlatNumber] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Booked slots loaded from database
  const [bookedSlots, setBookedSlots] = useState([]);

  const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  // Fetch booked slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`${API_URL}/api/slots?date=${dateStr}`);
        if (!response.ok) throw new Error('Failed to load slots');
        const data = await response.json();
        setBookedSlots(data.bookedSlots || []);
      } catch (err) {
        console.error(err);
        toast.error('Could not fetch booked slots');
      }
    };

    fetchSlots();
  }, [selectedDate]);

  // Real-time socket updates
  useEffect(() => {
    const socket = io(API_URL);

    socket.on('slot_booked', ({ date, timeSlot }) => {
      const currentDateStr = format(selectedDate, 'yyyy-MM-dd');
      if (date === currentDateStr) {
        setBookedSlots(prev => prev.includes(timeSlot) ? prev : [...prev, timeSlot]);
      }
    });

    socket.on('booking_cancelled', () => {
      // Reload slots if a booking gets cancelled
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      fetch(`${API_URL}/api/slots?date=${dateStr}`)
        .then(res => res.json())
        .then(data => setBookedSlots(data.bookedSlots || []))
        .catch(err => console.error('Error reloading slots:', err));
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedDate]);

  // Play success sound effect when animation triggers
  useEffect(() => {
    if (showSuccessAnimation) {
      const playSuccessSound = () => {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) return;
          const ctx = new AudioContext();

          const playNote = (frequency, startTime, duration) => {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc1.type = 'sine';
            osc2.type = 'triangle';

            osc1.frequency.value = frequency;
            osc2.frequency.value = frequency * 2; // Adds a harmonic for a brighter "bell" sound

            gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
            gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc1.start(ctx.currentTime + startTime);
            osc2.start(ctx.currentTime + startTime);
            osc1.stop(ctx.currentTime + startTime + duration);
            osc2.stop(ctx.currentTime + startTime + duration);
          };

          // A beautiful, bright C major arpeggio "ta-da!" effect
          playNote(523.25, 0.0, 0.6);   // C5
          playNote(659.25, 0.08, 0.6);  // E5
          playNote(783.99, 0.16, 0.6);  // G5
          playNote(1046.50, 0.24, 1.2); // C6
        } catch (e) {
          console.error('Audio playback failed', e);
        }
      };

      playSuccessSound();
    }
  }, [showSuccessAnimation]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!flatNumber || !name || !phone) {
      toast.error('Please fill all fields');
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error('Please enter valid 10-digit phone number');
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: dateStr,
          timeSlot: selectedSlot,
          flatNumber,
          name,
          phoneNumber: phone
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to book slot');
      }

      setSuccessDetails({ slot: selectedSlot, date: selectedDate });
      setShowBookingForm(false);
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 3500);
      setSelectedSlot(null);
      setFlatNumber('');
      setName('');
      setPhone('');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Could not complete booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-500">

      {/* Back Link */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-rose-500 transition-colors duration-300 mb-2 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Hero Welcome Section */}
      <section className="text-center md:text-left space-y-3 py-6 relative">
        <div className="absolute top-0 left-0 w-44 h-44 bg-rose-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-20 right-0 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif-logo font-bold text-gold-gradient tracking-wide">
          Community Court Booking
        </h2>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl leading-relaxed">
          Welcome to the Sushmitha Homes community badminton court. Connect with neighbors, enjoy friendly matches, and foster an active, healthy lifestyle together.
        </p>
      </section>

      {/* Date Selector */}
      <section className="space-y-6">
        <h2 className="text-base md:text-lg font-serif-logo font-bold tracking-wider text-gold-gradient uppercase">Select Date</h2>
        <div className="flex gap-4 overflow-x-auto py-4 px-2 snap-x scrollbar-thin -mx-2">
          {dates.map((date, i) => {
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const dateIsToday = isToday(date);
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`snap-center flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border transition-all duration-300 ease-out cursor-pointer relative ${isSelected
                    ? 'bg-rose-500 border-rose-500 shadow-[0_8px_20px_rgba(244,63,94,0.3)] text-white scale-105 hover:scale-110 hover:shadow-[0_12px_25px_rgba(244,63,94,0.45)]'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-amber-400 hover:bg-amber-50 hover:-translate-y-1 hover:shadow-lg hover:scale-105'
                  }`}
              >
                {dateIsToday && (
                  <span className={`absolute -top-2.5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isSelected ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'}`}>Today</span>
                )}
                <span className={`text-xs uppercase tracking-widest font-bold mb-0.5 ${isSelected ? 'text-rose-100' : 'text-gray-400'}`}>{format(date, 'EEE')}</span>
                <span className={`text-[28px] font-black leading-none my-1.5 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {format(date, 'dd')}
                </span>
                <span className={`text-[10px] uppercase tracking-widest font-bold ${isSelected ? 'text-rose-100' : 'text-gray-400'}`}>{format(date, 'MMM')}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Time Slots */}
      <section className="space-y-8">
        <h2 className="text-base md:text-lg font-serif-logo font-bold tracking-wider text-gold-gradient uppercase">Available Slots</h2>

        {[
          { title: "Morning Slots", icon: "☀️", slots: MORNING_SLOTS, iconColor: "text-amber-400" },
          { title: "Evening Slots", icon: "🌙", slots: EVENING_SLOTS, iconColor: "text-rose-400" }
        ].map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 flex items-center gap-2.5 font-serif-logo">
              <span className={`${group.iconColor} text-base`}>{group.icon}</span> {group.title}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {group.slots.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = selectedSlot === slot;

                return (
                  <motion.button
                    whileHover={!isBooked ? { scale: 1.04, y: -2 } : {}}
                    whileTap={!isBooked ? { scale: 0.97 } : {}}
                    key={slot}
                    disabled={isBooked}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setShowBookingForm(true);
                    }}
                    className={`
                      relative overflow-hidden rounded-xl py-4 px-1 sm:px-3 font-semibold border transition-all duration-300 text-center whitespace-nowrap text-xs sm:text-sm tracking-tight sm:tracking-normal
                      ${isBooked
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed shadow-inner'
                        : isSelected
                          ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-rose-600'
                          : 'bg-gradient-to-b from-white to-amber-50/50 border-amber-200/60 shadow-sm hover:border-amber-400 hover:shadow-md text-gray-700'}
                    `}
                  >
                    <span className={isBooked ? 'filter blur-[1px]' : ''}>{formatSlotDisplay(slot)}</span>
                    {isBooked && (
                      <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[0.5px]">
                        <span className="text-[10px] tracking-widest font-serif-logo font-black text-rose-600 border border-rose-300 px-2.5 py-1 rounded bg-white shadow-sm transform -rotate-12 select-none">
                          Booked
                        </span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Booking Form Modal */}
      {createPortal(
        <AnimatePresence>
          {showBookingForm && selectedSlot && (
            <motion.div
              key="booking-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingForm(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
            >
              <motion.div
                key="booking-modal"
                initial={{ scale: 0.93, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.93, y: 15, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border border-rose-200 p-6 md:p-8 rounded-3xl w-full max-w-md relative shadow-xl"
              >
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>

                <div className="mb-6">
                  <h2 className="text-xl font-serif-logo font-bold text-gold-gradient">Confirm Court Reservation</h2>
                  <p className="text-rose-400 text-sm mt-1.5 font-medium flex items-center gap-2">
                    <span>📅 {format(selectedDate, 'MMMM d, yyyy')}</span>
                    <span className="text-gray-600">•</span>
                    <span>⏰ {formatSlotDisplay(selectedSlot)}</span>
                  </p>
                </div>

                <form onSubmit={handleBook} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Flat Number</label>
                    <input
                      type="text" required placeholder="e.g. A-101"
                      value={flatNumber} onChange={e => setFlatNumber(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Resident Name</label>
                    <input
                      type="text" required placeholder="Your Name"
                      value={name} onChange={e => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Phone Number</label>
                    <input
                      type="tel" required placeholder="10-digit number"
                      inputMode="numeric" pattern="[0-9]*" maxLength={10}
                      value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full mt-6 font-bold py-4 rounded-xl transition-all transform active:translate-y-0 ${
                      isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] hover:-translate-y-0.5'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Booking...
                      </span>
                    ) : 'Confirm Booking'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Success Animation Modal */}
      {createPortal(
        <AnimatePresence>
          {showSuccessAnimation && successDetails && (
            <motion.div
              key="success-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/70 backdrop-blur-md"
            >
              {/* Confetti particles */}
              {Array.from({ length: 60 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    scale: Math.random() * 2 + 0.5,
                    x: (Math.random() - 0.5) * (typeof window !== 'undefined' ? window.innerWidth : 800),
                    y: (Math.random() - 0.5) * (typeof window !== 'undefined' ? window.innerHeight : 800),
                  }}
                  transition={{ duration: 1.5 + Math.random() * 1.5, ease: "easeOut" }}
                  className={`absolute w-3 h-3 rounded-full ${['bg-rose-500', 'bg-amber-400', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'][Math.floor(Math.random() * 6)]}`}
                  style={{ top: '50%', left: '50%' }}
                />
              ))}

              <motion.div
                key="success-modal"
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.7 }}
                className="flex flex-col items-center bg-white p-10 rounded-[2rem] shadow-2xl relative z-10 mx-4 max-w-sm w-full"
              >
                {/* Outer pulse */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  className="absolute w-24 h-24 bg-green-400 rounded-full top-10"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)] relative z-20"
                >
                  <svg className="w-12 h-12 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
                <motion.h2
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl sm:text-3xl font-bold text-gray-800 font-serif-logo text-center mb-2"
                >
                  Booking Confirmed!
                </motion.h2>
                <motion.p
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-500 text-center leading-relaxed"
                >
                  You're all set. Your court is booked for <br />
                  <span className="font-bold text-gray-800">{formatSlotDisplay(successDetails.slot)}</span> on <span className="font-medium text-gray-700">{format(successDetails.date, 'MMM do')}</span>.
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => setShowSuccessAnimation(false)}
                  className="mt-8 px-8 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-medium transition-colors border border-gray-200"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
