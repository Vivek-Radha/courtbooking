import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Header() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: 'admin', password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Incorrect Password');
      }

      localStorage.setItem('adminToken', data.token);
      setShowAdminLogin(false);
      setPassword('');
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Login failed');
    }
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <Link to="/" className="flex items-center gap-3 md:gap-4 group">
          <div className="relative transform group-hover:scale-105 transition-transform duration-500 ease-out">
            <div className="absolute -inset-1 bg-rose-500/20 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
            <svg viewBox="0 0 100 100" className="w-12 h-12 relative z-10 drop-shadow-[0_2px_10px_rgba(244,63,94,0.5)]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="backPetals" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#be123c" />
                  <stop offset="60%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#ffe4e6" />
                </linearGradient>
                <linearGradient id="midPetals" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="70%" stopColor="#fda4af" />
                  <stop offset="100%" stopColor="#fff1f2" />
                </linearGradient>
                <linearGradient id="frontPetals" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#9f1239" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fda4af" />
                </linearGradient>
                <radialGradient id="lotusCenter" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </radialGradient>
              </defs>
              <path d="M 50 65 C 25 65, 15 45, 30 25 C 40 40, 48 55, 50 65 Z" fill="url(#backPetals)" opacity="0.85"/>
              <path d="M 50 65 C 75 65, 85 45, 70 25 C 60 40, 52 55, 50 65 Z" fill="url(#backPetals)" opacity="0.85"/>
              <path d="M 50 68 C 15 68, 10 50, 25 35 C 35 48, 45 58, 50 68 Z" fill="url(#midPetals)"/>
              <path d="M 50 68 C 85 68, 90 50, 75 35 C 65 48, 55 58, 50 68 Z" fill="url(#midPetals)"/>
              <path d="M 50 72 C 30 85, 15 75, 20 60 C 30 65, 45 70, 50 72 Z" fill="url(#backPetals)"/>
              <path d="M 50 72 C 70 85, 85 75, 80 60 C 70 65, 55 70, 50 72 Z" fill="url(#backPetals)"/>
              <ellipse cx="50" cy="58" rx="8" ry="12" fill="url(#lotusCenter)"/>
              <circle cx="47" cy="53" r="1.5" fill="#ffffff" opacity="0.8"/>
              <circle cx="53" cy="51" r="1" fill="#ffffff" opacity="0.8"/>
              <circle cx="50" cy="49" r="1.5" fill="#ffffff" opacity="0.8"/>
              <circle cx="46" cy="62" r="1.2" fill="#ffffff" opacity="0.6"/>
              <circle cx="54" cy="60" r="1" fill="#ffffff" opacity="0.6"/>
              <path d="M 50 72 C 35 70, 25 45, 40 30 C 45 45, 48 60, 50 72 Z" fill="url(#frontPetals)"/>
              <path d="M 50 72 C 65 70, 75 45, 60 30 C 55 45, 52 60, 50 72 Z" fill="url(#frontPetals)"/>
              <path d="M 50 75 C 38 65, 38 40, 50 15 C 62 40, 62 65, 50 75 Z" fill="url(#frontPetals)"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-serif-logo font-bold tracking-widest text-gold-gradient drop-shadow-sm">
              SUSHMITHA HOMES
            </h1>
            <p className="text-[9px] md:text-[10px] text-rose-600/80 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <span>Badminton Court</span>
              <span className="text-amber-500/80">•</span>
              <span className="italic text-gray-500 font-normal normal-case">Making dreams come to life</span>
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Get Help Email */}
          <button 
            onClick={() => {
              navigator.clipboard.writeText('vivekradha01@gmail.com');
              toast(
                <div className="flex flex-col items-center text-center leading-relaxed">
                  <span>Write an email to <strong className="text-amber-400">vivekradha01@gmail.com</strong></span>
                  <span className="text-sm text-gray-300">for slot related queries.</span>
                </div>, 
                { 
                  icon: <Headset className="text-amber-500" size={28} />,
                  duration: 5000,
                  style: { maxWidth: '500px', padding: '16px 20px' }
                }
              );
              window.location.href = 'mailto:vivekradha01@gmail.com?subject=Court Booking Query';
            }}
            className="text-gray-400 hover:text-amber-500 hover:scale-110 transition-all duration-300 p-2 rounded-xl hover:bg-amber-50 flex items-center justify-center"
            title="Get Help / Email Us"
          >
            <Headset size={22} />
          </button>

          {/* Hidden Admin Trigger */}
          <button 
            onClick={() => setShowAdminLogin(true)}
            className="text-gray-300 hover:text-rose-500 hover:scale-110 transition-all duration-300 p-2 rounded-xl hover:bg-rose-50 flex items-center justify-center"
            aria-label="Admin Access"
            title="Admin Access"
          >
            <ShieldAlert size={20} />
          </button>
        </div>
      </header>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.93, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 15 }}
              className="bg-white p-8 rounded-3xl w-full max-w-sm relative border border-gray-100 shadow-2xl"
            >
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                  <ShieldAlert className="text-amber-500" size={24} />
                </div>
                <h2 className="text-2xl font-serif-logo font-bold text-slate-800 text-center">Admin Portal</h2>
                <p className="text-xs text-gray-500 mt-1">Authorized access only</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <input 
                    type="password"
                    placeholder="Enter Admin Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-center text-lg tracking-widest"
                    autoFocus
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Authenticate
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
