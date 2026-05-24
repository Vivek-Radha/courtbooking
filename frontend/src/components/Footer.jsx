export default function Footer() {
  return (
    <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-auto border-t border-gray-200/60">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-500/50"></div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-serif-logo font-bold text-gold-gradient drop-shadow-sm">Project Crew</h4>
          <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-500/50"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-center pt-2">
          <div className="space-y-1">
            <p className="font-bold text-slate-800 text-sm tracking-wide">Radha Vivek</p>
            <p className="text-xs text-rose-500 font-medium uppercase tracking-wider">Design UI & Developer</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-800 text-sm tracking-wide">Varikoti Varun Raj</p>
            <p className="text-xs text-rose-500 font-medium uppercase tracking-wider">Idea Pitching & Planner</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-800 text-sm tracking-wide">Sujan Reddy Bommineni</p>
            <p className="text-xs text-rose-500 font-medium uppercase tracking-wider">Treasurer</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
