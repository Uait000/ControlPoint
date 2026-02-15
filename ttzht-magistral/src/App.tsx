import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, LayoutGrid, Zap, Menu, X, 
  LogOut, Shield, Mail, Lock, Users, Settings, ChevronRight
} from 'lucide-react';

import { MainPage } from './pages/MainPage';
import { TestPage } from './pages/TestPage';
import { TeacherProfile } from './pages/TeacherProfile';
import { StudentProfile } from './pages/StudentProfile';
import { SubjectSectionsPage } from './pages/SubjectSectionsPage';
import { AdminPanel } from './pages/AdminPanel';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user_auth');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userData: any) => {
    let finalUser = { ...userData };
    if (userData.role === 'teacher' && userData.email === 'admin' && userData.password === 'admin') {
      finalUser.role = 'admin';
    }
    setUser(finalUser);
    localStorage.setItem('user_auth', JSON.stringify(finalUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('user_auth');
    setUser(null);
    setIsMenuOpen(false);
  };

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center font-black italic uppercase antialiased text-slate-700 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {!user ? (
            <AuthPage key="auth" onAuthSuccess={handleAuthSuccess} />
          ) : (
            <div className="w-full flex flex-col items-center min-h-screen relative">
              {/* --- НАВИГАЦИЯ --- */}
              <nav className="w-full bg-white/90 backdrop-blur-xl border-b-2 border-[#e1eefb] sticky top-0 z-[500]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-24 flex justify-between items-center">
                  <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMenuOpen(false)}>
                    <div className="bg-[#1976d2] p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl shadow-blue-100 group-hover:rotate-12 transition-transform duration-500">
                      <Zap className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col leading-none text-left">
                      <span className="font-black text-xl sm:text-2xl tracking-tighter text-[#1565c0]">МАГИСТРАЛЬ</span>
                      <span className="text-[8px] sm:text-[10px] text-slate-400 tracking-[0.2em] ml-0.5 uppercase">ТТЖТ</span>
                    </div>
                  </Link>

                  {/* ДЕКСТОПНОЕ МЕНЮ */}
                  <div className="hidden md:flex items-center gap-3">
                    <NavLink to="/" icon={<LayoutGrid size={20}/>} label="ПРЕДМЕТЫ" />
                    {user.role === 'admin' && <NavLink to="/admin" icon={<Settings size={20}/>} label="АДМИН-ЦЕНТР" />}
                    {user.role !== 'admin' && <NavLink to={user.role === 'student' ? "/student" : "/teacher"} icon={<User size={20}/>} label="ПРОФИЛЬ" />}
                    <button onClick={handleLogout} className="flex items-center gap-2 text-[11px] font-black text-red-500 hover:bg-red-50 px-5 py-3 rounded-2xl transition-all ml-4 border-2 border-transparent hover:border-red-100 uppercase">
                      <LogOut size={20}/> ВЫЙТИ
                    </button>
                  </div>

                  {/* КНОПКА БУРГЕРА */}
                  <button className="md:hidden p-3 bg-slate-50 rounded-2xl text-[#1976d2] shadow-sm active:scale-90 transition-all" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                  </button>
                </div>

                {/* МОБИЛЬНОЕ МЕНЮ (ИСПРАВЛЕНО) */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -20 }} 
                      className="absolute top-full left-0 w-full bg-white border-b-4 border-slate-50 shadow-2xl z-[1000] p-6 flex flex-col space-y-3"
                    >
                      <MobileLink to="/" label="КАТАЛОГ ПРЕДМЕТОВ" icon={<LayoutGrid size={24}/>} onClick={() => setIsMenuOpen(false)} />
                      {user.role === 'admin' && <MobileLink to="/admin" label="АДМИН-ЦЕНТР" icon={<Settings size={24}/>} onClick={() => setIsMenuOpen(false)} />}
                      {user.role !== 'admin' && <MobileLink to={user.role === 'student' ? "/student" : "/teacher"} label="МОЙ ПРОФИЛЬ" icon={<User size={24}/>} onClick={() => setIsMenuOpen(false)} />}
                      
                      <button onClick={handleLogout} className="w-full p-5 bg-red-50 text-red-500 font-black flex items-center justify-between rounded-3xl mt-4 italic uppercase text-xs">
                        ЗАВЕРШИТЬ СЕАНС <LogOut size={24} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </nav>

              <main className="w-full max-w-7xl md:px-6 py-6 md:py-10 flex flex-col items-center flex-1">
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/subject/:id" element={<SubjectSectionsPage />} />
                  <Route path="/admin" element={user.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
                  <Route path="/teacher" element={user.role === 'teacher' ? <TeacherProfile /> : <Navigate to={user.role === 'admin' ? "/admin" : "/"} />} />
                  <Route path="/student" element={user.role === 'student' ? <StudentProfile /> : <Navigate to={user.role === 'admin' ? "/admin" : "/"} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

// --- СТРАНИЦА АВТОРИЗАЦИИ (ИСПРАВЛЕННОЕ ПЕРЕКРЫТИЕ) ---
function AuthPage({ onAuthSuccess }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ surname: '', name: '', group: '', email: '', password: '', role: 'student' });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onAuthSuccess(formData); };

  return (
    <div className="fixed inset-0 z-[600] bg-[#f0f7ff] flex items-center justify-center p-4 overflow-y-auto">
      {/* КАРТОЧКА БЕЗ ABSOLUTE ДЛЯ ПАНЕЛЕЙ */}
      <div className="bg-white w-full max-w-5xl rounded-[3rem] md:rounded-[4rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative border-4 md:border-8 border-white min-h-[600px]">
        
        {/* СИНЯЯ ПАНЕЛЬ (ТЕПЕРЬ В ПОТОКЕ FLEX) */}
        <motion.div 
          layout
          className={`bg-[#1976d2] text-white p-10 md:p-16 flex flex-col justify-center items-center text-center space-y-6 md:space-y-8 md:w-1/2 order-first ${isLogin ? 'md:order-last' : 'md:order-first'}`}
        >
          <Shield size={60} className="opacity-80" />
          <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">МАГИСТРАЛЬ <br/> ТТЖТ</h3>
          <div className="space-y-4">
            <p className="text-[10px] md:text-xs opacity-70 tracking-widest leading-relaxed font-black">
              {isLogin ? 'НЕТ УЧЁТНОЙ ЗАПИСИ?' : 'УЖЕ ЗАРЕГИСТРИРОВАНЫ?'}
            </p>
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="border-4 border-white/30 hover:bg-white hover:text-[#1976d2] px-10 py-4 md:px-14 md:py-5 rounded-[2.5rem] text-[10px] md:text-xs transition-all font-black uppercase italic shadow-xl active:scale-95"
            >
              {isLogin ? 'ЗАРЕГИСТРИРОВАТЬСЯ' : 'ВОЙТИ В ПРОФИЛЬ'}
            </button>
          </div>
        </motion.div>

        {/* БЕЛАЯ ПАНЕЛЬ (ФОРМА) */}
        <div className="flex-1 flex flex-col justify-center bg-white p-8 md:p-16">
          <AnimatePresence mode="wait">
            <motion.div 
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? 20 : -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: isLogin ? -20 : 20 }}
              className="max-w-sm mx-auto w-full space-y-6 text-left"
            >
              <div className="space-y-1">
                <h2 className="text-3xl md:text-4xl text-[#1565c0] font-black italic uppercase leading-none">{isLogin ? 'ВХОД' : 'СОЗДАТЬ'}</h2>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black italic">{isLogin ? 'АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ' : 'РЕГИСТРАЦИЯ НОВОГО УЧАСТНИКА'}</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <RoleSelector role={formData.role} setRole={(r:any) => setFormData({...formData, role: r})} />
                
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    <AuthInput label="ФАМИЛИЯ" value={formData.surname} onChange={(v:any) => setFormData({...formData, surname: v.toUpperCase()})} />
                    <AuthInput label="ИМЯ" value={formData.name} onChange={(v:any) => setFormData({...formData, name: v.toUpperCase()})} />
                  </div>
                )}

                {!isLogin && formData.role === 'student' && (
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 ml-3 font-black italic uppercase">Группа</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1976d2]/40" size={16} />
                      <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-10 pr-4 text-[11px] font-black outline-none italic uppercase shadow-inner appearance-none transition-all focus:border-[#1976d2]" value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})}>
                          <option value="">ВЫБЕРИТЕ...</option>
                          <option value="КС-2-1">КС-2-1</option>
                          <option value="Р-1-1">Р-1-1</option>
                      </select>
                    </div>
                  </div>
                )}

                <AuthInput label="E-MAIL / ЛОГИН" icon={<Mail size={18}/>} value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} />
                <AuthInput label="ПАРОЛЬ" type="password" icon={<Lock size={18}/>} value={formData.password} onChange={(v:any) => setFormData({...formData, password: v})} />
                
                <button className="w-full bg-[#1976d2] text-white py-4 md:py-5 rounded-2xl font-black text-lg shadow-xl uppercase italic mt-6 active:scale-95 transition-all flex items-center justify-center gap-2">
                  {isLogin ? 'Войти' : 'Создать'} <ChevronRight size={20}/>
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

function RoleSelector({ role, setRole }: any) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl border-2 border-slate-50 shadow-inner">
      <button type="button" onClick={() => setRole('student')} className={`flex-1 py-3 rounded-xl transition-all font-black italic uppercase text-[9px] ${role === 'student' ? 'bg-[#1976d2] text-white shadow-lg' : 'text-slate-400'}`}>Студент</button>
      <button type="button" onClick={() => setRole('teacher')} className={`flex-1 py-3 rounded-xl transition-all font-black italic uppercase text-[9px] ${role === 'teacher' ? 'bg-[#1976d2] text-white shadow-lg' : 'text-slate-400'}`}>Учитель</button>
    </div>
  );
}

function AuthInput({ label, icon, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[9px] text-slate-400 ml-3 font-black uppercase italic">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1976d2]/40">{icon}</div>}
        <input type={type} required className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 ${icon ? 'pl-10' : 'px-4'} pr-4 text-[11px] font-black text-[#1565c0] outline-none focus:ring-2 focus:ring-[#1976d2]/20 italic shadow-inner uppercase transition-all focus:border-[#1976d2]`} value={value} onChange={e => onChange(e.target.value)} />
      </div>
    </div>
  );
}

function MobileLink({ to, label, icon, onClick }: any) {
  return (
    <Link to={to} onClick={onClick} className="w-full p-5 bg-slate-50 text-[#1565c0] font-black flex justify-between items-center rounded-3xl active:bg-blue-50 transition-colors border-2 border-transparent active:border-blue-100 shadow-sm text-left">
      <div className="flex items-center gap-4">{icon} {label}</div>
      <ChevronRight size={20} className="text-[#1976d2]/30" />
    </Link>
  );
}

function NavLink({ to, icon, label }: any) {
  return (
    <Link to={to} className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-[#1976d2] transition-all font-black text-[10px] uppercase italic border-2 border-transparent hover:border-blue-100 hover:bg-blue-50">
      {icon} {label}
    </Link>
  );
}