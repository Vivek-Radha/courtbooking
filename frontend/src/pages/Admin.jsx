import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Admin() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ today: 0, total: 0, usage: 0 });
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/');
      toast.error('Admin access required');
    }
  }, [token, navigate]);

  const fetchBookings = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/');
          throw new Error('Session expired');
        }
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
      calculateStats(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error fetching bookings');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  useEffect(() => {
    const socket = io(API_URL);

    socket.on('slot_booked', () => {
      fetchBookings();
    });

    socket.on('booking_cancelled', () => {
      fetchBookings();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const calculateStats = (allBookings) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayBookings = allBookings.filter(b => b.date === todayStr && b.status === 'booked');
    const totalActive = allBookings.filter(b => b.status === 'booked').length;
    
    // Max 6 slots per day
    const usage = Math.round((todayBookings.length / 6) * 100);

    setStats({
      today: todayBookings.length,
      total: totalActive,
      usage: usage > 100 ? 100 : usage
    });
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Could not cancel booking');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
    toast.success('Logged out successfully');
  };

  const filteredBookings = bookings.filter(b => 
    b.flatNumber?.toLowerCase().includes(search.toLowerCase()) ||
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.date?.includes(search) ||
    b.timeSlot?.includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif-logo font-bold text-slate-800 tracking-wide">
            Admin Control Center
          </h1>
          <p className="text-gray-600 text-sm">Monitor court reservations and resident details.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-sm hover:border-rose-500/30 hover:bg-rose-50 transition-all text-gray-600 hover:text-rose-600 font-semibold"
        >
          Logout
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 border-t-4 border-t-rose-500 shadow-sm">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Today's Bookings</h3>
          <p className="text-3xl font-black text-rose-500 font-serif-logo">{stats.today}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 border-t-4 border-t-amber-500 shadow-sm">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Active Bookings</h3>
          <p className="text-3xl font-black text-amber-500 font-serif-logo">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 border-t-4 border-t-purple-500 shadow-sm">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Court Utilization (Today)</h3>
          <p className="text-3xl font-black text-purple-500 font-serif-logo">{stats.usage}%</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h2 className="text-lg font-serif-logo font-bold text-slate-800">Recent Reservations</h2>
          <input 
            type="text" 
            placeholder="Search by Flat, Name, Date..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-slate-800 placeholder-gray-400"
          />
        </div>
        <div className="overflow-x-auto">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">No court bookings recorded.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold font-serif-logo">Date & Time</th>
                  <th className="px-6 py-4 font-bold font-serif-logo">Flat No</th>
                  <th className="px-6 py-4 font-bold font-serif-logo">Name</th>
                  <th className="px-6 py-4 font-bold font-serif-logo">Phone</th>
                  <th className="px-6 py-4 font-bold font-serif-logo text-center">Status</th>
                  <th className="px-6 py-4 font-bold font-serif-logo text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredBookings.map((booking) => {
                  const bookingId = booking._id || booking.id;
                  const isCancelled = booking.status === 'cancelled';
                  return (
                    <tr key={bookingId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{booking.date}</div>
                        <div className="text-gray-500 text-xs font-mono font-semibold">{booking.timeSlot}</div>
                      </td>
                      <td className="px-6 py-4 text-rose-600 font-bold">{booking.flatNumber}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{booking.name}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono font-medium">{booking.phoneNumber}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                          isCancelled 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' 
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCancelled && (
                          <button 
                            onClick={() => handleCancel(bookingId)}
                            className="text-rose-500 hover:text-rose-700 transition-colors text-xs font-bold px-3.5 py-1.5 border border-rose-200 rounded-xl hover:bg-rose-50 hover:border-rose-300 bg-white shadow-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
