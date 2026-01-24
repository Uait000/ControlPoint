import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, User, GraduationCap, LayoutGrid, 
  Settings, LogOut, Bell, Search, Zap, 
  Trophy, Clock, CheckCircle2, AlertCircle, Menu, X, UserPlus, ChevronRight
} from 'lucide-react';
import { MainPage } from './pages/MainPage';
import { TestPage } from './pages/TestPage';
import { TeacherProfile } from './pages/TeacherProfile';
import { StudentProfile } from './pages/StudentProfile';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [user, setUser] = useState({ surname: '', name: '', patronymic: '', group: '', role: '' });

  useEffect(() => {
    const saved = localStorage.getItem('user_auth');
    if (saved) {
      setUser(JSON.parse(saved));
      setIsRegistered(true);
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.surname && user.name && user.group && user.role) {
      setIsRegistered(true);
      localStorage.setItem('user_auth', JSON.stringify(user));
    }
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-[#f0f7ff] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-lg p-10 rounded-[3rem] shadow-2xl border-b-8 border-[#1565c0]/20">
          <div className="text-center mb-8">
            <div className="bg-[#e3f2fd] w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-[#1976d2]">
              <UserPlus size={40} />
            </div>
            <h2 className="text-3xl font-black text-[#1565c0] uppercase italic tracking-tighter">Регистрация</h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase mt-2 tracking-widest">Добро пожаловать в Магистраль</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Фамилия*</label>
              <input type="text" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-6 py-4 font-bold outline-none focus:border-[#1976d2] transition-all" value={user.surname} onChange={e => setUser({...user, surname: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Имя*</label>
              <input type="text" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-6 py-4 font-bold outline-none focus:border-[#1976d2] transition-all" value={user.name} onChange={e => setUser({...user, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Отчество</label>
              <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-6 py-4 font-bold outline-none focus:border-[#1976d2] transition-all" value={user.patronymic} onChange={e => setUser({...user, patronymic: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Группа*</label>
                <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-6 py-4 font-bold outline-none focus:border-[#1976d2] transition-all appearance-none" value={user.group} onChange={e => setUser({...user, group: e.target.value})}>
                  <option value="">Выбор...</option>
                  <option value="КС-2-1">КС-2-1</option>
                  <option value="Р-1-1">Р-1-1</option>
                  <option value="КС-1-2">КС-1-2</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Роль*</label>
                <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-6 py-4 font-bold outline-none focus:border-[#1976d2] transition-all appearance-none" value={user.role} onChange={e => setUser({...user, role: e.target.value})}>
                  <option value="">Выбор...</option>
                  <option value="student">Студент</option>
                  <option value="teacher">Преподаватель</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-[#1976d2] text-white font-black py-6 rounded-[2rem] shadow-xl hover:bg-[#1565c0] transition-all mt-6 flex items-center justify-center gap-3 uppercase italic tracking-widest">
              Создать аккаунт <ChevronRight size={24} />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center bg-[#f0f7ff]">
        <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-[#e1eefb] sticky top-0 z-[100]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-[#1e88e5] to-[#1565c0] p-2 rounded-xl shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
                <Zap className="text-white" size={24} />
              </div>
              <span className="font-black text-xl tracking-tighter italic uppercase text-[#1565c0]">Магистраль</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/" icon={<LayoutGrid size={18}/>} label="Предметы" />
              <NavLink to="/student" icon={<User size={18}/>} label="Профиль" />
              {user.role === 'teacher' && <NavLink to="/teacher" icon={<GraduationCap size={18}/>} label="Панель Управления" />}
            </div>
            <button className="md:hidden p-2 text-[#1976d2]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-slate-100 overflow-hidden">
                <div className="flex flex-col p-4 space-y-2">
                  <MobileLink to="/" label="Предметы" onClick={() => setIsMenuOpen(false)} />
                  <MobileLink to="/student" label="Мой Профиль" onClick={() => setIsMenuOpen(false)} />
                  {user.role === 'teacher' && <MobileLink to="/teacher" label="Преподаватель" onClick={() => setIsMenuOpen(false)} />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
        <main className="w-full max-w-7xl px-4 sm:px-6 py-8 flex flex-col items-center flex-1">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/teacher" element={<TeacherProfile />} />
            <Route path="/student" element={<StudentProfile user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label }: { to: string, icon: any, label: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-[#1976d2] transition-all px-4 py-2 rounded-xl hover:bg-blue-50">
      {icon} {label}
    </Link>
  );
}

function MobileLink({ to, label, onClick }: any) {
  return (
    <Link to={to} onClick={onClick} className="w-full p-4 text-slate-800 font-black uppercase tracking-tight hover:bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
      {label} <ChevronRight size={18} />
    </Link>
  );
}