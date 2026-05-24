import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-[80vh] flex flex-col lg:flex-row items-center justify-between gap-12 animate-in fade-in duration-700 pt-8">
      <div className="flex-1 space-y-8 text-center lg:text-left z-10">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif-logo font-bold text-slate-800 leading-tight">
            Our Community <br />
            <span className="text-rose-500">Badminton</span> Court
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
            Welcome to the Sushmitha Homes residential court. Whether you're looking for a friendly match with neighbors or a daily fitness routine, our exclusive community amenity is here for all residents to enjoy. Stay active, connect, and play right at home.
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block mt-4">
          <Link 
            to="/book" 
            className="flex items-center gap-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold px-8 py-4 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all duration-300 group"
          >
            <CalendarDays className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-lg tracking-wider uppercase font-serif-logo">Book Now</span>
          </Link>
        </motion.div>
      </div>

      <div className="flex-1 relative w-full max-w-md mx-auto lg:max-w-lg mt-8 lg:mt-0">
        <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/10 to-rose-500/10 blur-2xl rounded-full" />
        <img 
          src="/@fs/C:/Users/vivek/.gemini/antigravity-ide/brain/0d678851-e4ec-4b1e-ac1f-e494304fdea5/media__1779379372122.jpg" 
          alt="Premium Badminton Court" 
          className="relative w-full h-auto max-h-[600px] rounded-3xl border border-gray-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] object-cover hover:scale-[1.04] hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(244,63,94,0.25)] hover:border-rose-300 transition-all duration-700 ease-out"
        />
      </div>
    </div>
  );
}
