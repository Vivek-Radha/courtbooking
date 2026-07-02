import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Smartphone, CheckCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Clock,
    title: 'Real-Time Availability',
    description: 'See which slots are open right now with live updates powered by real-time sync.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200/60',
  },
  {
    icon: Smartphone,
    title: 'Easy Booking',
    description: 'Pick a date, choose a slot, fill your details — done in under 30 seconds.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200/60',
  },
  {
    icon: CheckCircle,
    title: 'Instant Confirmation',
    description: 'Get immediate confirmation with a delightful animation. No waiting, no emails.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200/60',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Built exclusively for Sushmitha Homes residents to connect and stay active together.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200/60',
  },
];

export default function Landing() {
  return (
    <div className="space-y-16 md:space-y-24 pb-8">
      {/* Hero Section */}
      <div className="min-h-[70vh] flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 animate-in fade-in duration-700 pt-2 lg:pt-8">
        <div className="flex-1 space-y-6 lg:space-y-8 text-center lg:text-left z-10">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif-logo font-bold text-slate-800 leading-tight">
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
              className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all duration-300 group"
            >
              <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-base sm:text-lg tracking-wider uppercase font-serif-logo">Book Now</span>
            </Link>
          </motion.div>
        </div>

        <div className="flex-1 relative w-full max-w-md mx-auto lg:max-w-lg mt-8 lg:mt-0">
          <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/10 to-rose-500/10 blur-2xl rounded-full" />
          <img 
            src="/badminton-court.jpg" 
            alt="Premium Badminton Court" 
            className="relative w-full h-auto max-h-[600px] rounded-3xl border border-gray-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] object-cover hover:scale-[1.04] hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(244,63,94,0.25)] hover:border-rose-300 transition-all duration-700 ease-out"
          />
        </div>
      </div>

      {/* Feature Highlights Section */}
      <section className="relative">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif-logo font-bold text-gold-gradient tracking-wide">
            Why Book With Us
          </h2>
          <p className="text-gray-500 text-sm md:text-base mt-2 max-w-md mx-auto">
            A seamless experience designed for our community residents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`${feature.bg} ${feature.border} border rounded-2xl p-6 hover:-translate-y-2 hover:shadow-lg transition-all duration-500 group`}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`${feature.color} w-6 h-6`} />
              </div>
              <h3 className="font-serif-logo font-bold text-slate-800 text-sm md:text-base mb-2 tracking-wide">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

