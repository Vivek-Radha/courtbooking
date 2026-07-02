import { Link } from 'react-router-dom';
import { CalendarDays, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-auto border-t border-gray-200/60">
      <div className="flex flex-col items-center justify-center space-y-8">

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <Link to="/book" className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-colors duration-300 group">
            <CalendarDays size={16} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-medium">Book a Court</span>
          </Link>
          <a href="mailto:vivekradha01@gmail.com?subject=Court Booking Query" className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-500 transition-colors duration-300 group">
            <Mail size={16} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium">vivekradha01@gmail.com</span>
          </a>
        </div>

        {/* Divider + Crew Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-500/50"></div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-serif-logo font-bold text-gold-gradient drop-shadow-sm">Project Crew</h4>
          <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-500/50"></div>
        </div>

        {/* Team Members */}
        <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-12 gap-y-6 text-center">
          <div className="space-y-1">
            <p className="font-bold text-slate-800 text-sm tracking-wide">Radha Vivek</p>
            <p className="text-xs text-rose-500 font-medium uppercase tracking-wider">Design UI & Developer</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-800 text-sm tracking-wide">Varikoti Varun Raj</p>
            <p className="text-xs text-rose-500 font-medium uppercase tracking-wider">Design UI & Developer</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-800 text-sm tracking-wide">Sujan Reddy Bommineni</p>
            <p className="text-xs text-rose-500 font-medium uppercase tracking-wider">Design UI & Developer</p>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-400 pt-2">
          © {new Date().getFullYear()} Sushmitha Homes. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
