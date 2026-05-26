import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MORNING_SLOTS = [
  "06:00 - 07:00", "07:00 - 08:00"
];

const EVENING_SLOTS = [
  "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00"
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
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

      toast.success('Court booked successfully!');
      setShowBookingForm(false);
      setSelectedSlot(null);
      setFlatNumber('');
      setName('');
      setPhone('');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Could not complete booking');
    }
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-500">
      
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
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`snap-center flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border transition-all duration-300 ease-out cursor-pointer ${
                  isSelected 
                    ? 'bg-rose-500 border-rose-500 shadow-[0_8px_20px_rgba(244,63,94,0.3)] text-white scale-105 hover:scale-110 hover:shadow-[0_12px_25px_rgba(244,63,94,0.45)]' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-amber-400 hover:bg-amber-50 hover:-translate-y-1 hover:shadow-lg hover:scale-105'
                }`}
              >
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
                      relative overflow-hidden rounded-xl py-4 px-3 font-semibold border transition-all duration-300 text-center
                      ${isBooked 
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed shadow-inner' 
                        : isSelected
                          ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-rose-600'
                          : 'bg-white border-gray-200 shadow-sm hover:border-amber-300 hover:bg-amber-50 text-gray-700'}
                    `}
                  >
                    <span className={isBooked ? 'filter blur-[1px]' : ''}>{slot}</span>
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
      {showBookingForm && selectedSlot && createPortal(
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.93, y: 15 }}
            animate={{ scale: 1, y: 0 }}
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
                <span>⏰ {selectedSlot}</span>
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
                  value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder-gray-400"
                />
              </div>
              <button 
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Confirm Booking
              </button>
            </form>
          </motion.div>
        </motion.div>,
        document.body
      )}

    </div>
  );
}
