import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, User, GraduationCap, LayoutGrid, 
  Settings, LogOut, Bell, Search, Zap, 
  Trophy, Clock, CheckCircle2, AlertCircle, Menu, X
} from 'lucide-react';

// Импортируем наши страницы (создадим их ниже)
import { MainPage } from './pages/MainPage';
import { TestPage } from './pages/TestPage';
import { TeacherProfile } from './pages/TeacherProfile';
import { StudentProfile } from './pages/StudentProfile';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center">
        {/* HEADER */}
        <nav className="w-full bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-[100]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl shadow-lg shadow-orange-200 group-hover:rotate-6 transition-transform">
                <Zap className="text-white" size={24} />
              </div>
              <span className="font-black text-xl tracking-tighter italic uppercase text-slate-800">Чух-чух мяу!</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/" icon={<LayoutGrid size={18}/>} label="Предметы" />
              <NavLink to="/student" icon={<User size={18}/>} label="Мой Профиль" />
              <NavLink to="/teacher" icon={<GraduationCap size={18}/>} label="Преподаватель" />
            </div>

            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Nav */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
              >
                <div className="flex flex-col p-4 space-y-2">
                  <MobileLink to="/" label="Предметы" onClick={() => setIsMenuOpen(false)} />
                  <MobileLink to="/student" label="Профиль Ученика" onClick={() => setIsMenuOpen(false)} />
                  <MobileLink to="/teacher" label="Кабинет Преподавателя" onClick={() => setIsMenuOpen(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* CONTENT AREA */}
        <main className="w-full max-w-7xl px-4 sm:px-6 py-8 flex flex-col items-center">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/teacher" element={<TeacherProfile />} />
            <Route path="/student" element={<StudentProfile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label }: { to: string, icon: any, label: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 text-sm font-black uppercase text-slate-500 hover:text-orange-500 transition-colors px-3 py-2 rounded-xl hover:bg-orange-50">
      {icon} {label}
    </Link>
  );
}

function MobileLink({ to, label, onClick }: any) {
  return (
    <Link to={to} onClick={onClick} className="w-full p-4 text-slate-800 font-black uppercase tracking-tight hover:bg-slate-50 rounded-2xl flex justify-between items-center">
      {label} <ChevronRight size={18} />
    </Link>
  );
}

const ChevronRight = ({ size }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);