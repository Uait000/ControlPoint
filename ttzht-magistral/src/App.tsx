import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, GraduationCap, LayoutGrid, Zap, Menu, X, 
  ChevronRight, LogOut, Shield, Mail, Lock, Users, Briefcase, Info
} from 'lucide-react';

import { MainPage } from './pages/MainPage';
import { TestPage } from './pages/TestPage';
import { TeacherProfile } from './pages/TeacherProfile';
import { StudentProfile } from './pages/StudentProfile';
import { SubjectSectionsPage } from './pages/SubjectSectionsPage';

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
    setUser(userData);
    localStorage.setItem('user_auth', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('user_auth');
    setUser(null);
    setIsMenuOpen(false);
  };

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center font-black italic uppercase antialiased text-slate-700">
        <AnimatePresence mode="wait">
          {!user ? (
            <AuthPage key="auth" onAuthSuccess={handleAuthSuccess} />
          ) : (
            <div className="w-full flex flex-col items-center min-h-screen">
              {/* --- НАВИГАЦИЯ --- */}
              <nav className="w-full bg-white/90 backdrop-blur-xl border-b border-[#e1eefb] sticky top-0 z-[100]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-24 flex justify-between items-center">
                  <Link to="/" className="flex items-center gap-4 group">
                    <div className="bg-[#1976d2] p-3 rounded-2xl shadow-xl shadow-blue-100 group-hover:rotate-12 transition-transform duration-500">
                      <Zap className="text-white" size={28} />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="font-black text-2xl tracking-tighter text-[#1565c0]">МАГИСТРАЛЬ</span>
                      <span className="text-[10px] text-slate-400 tracking-[0.3em] ml-1">ПЛАТФОРМА ТТЖТ</span>
                    </div>
                  </Link>

                  <div className="hidden md:flex items-center gap-3">
                    <NavLink to="/" icon={<LayoutGrid size={20}/>} label="ПРЕДМЕТЫ" />
                    <NavLink to={user.role === 'teacher' ? "/teacher" : "/student"} icon={<User size={20}/>} label="ПРОФИЛЬ" />
                    <button onClick={handleLogout} className="flex items-center gap-2 text-[11px] font-black text-red-500 hover:bg-red-50 px-5 py-3 rounded-2xl transition-all ml-4 border-2 border-transparent hover:border-red-100">
                      <LogOut size={20}/> ВЫЙТИ
                    </button>
                  </div>

                  <button className="md:hidden p-3 bg-slate-50 rounded-2xl text-[#1976d2] shadow-inner" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                  </button>
                </div>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden bg-white border-t-2 border-slate-50 shadow-2xl overflow-hidden font-black">
                      <div className="flex flex-col p-6 space-y-3 uppercase italic">
                        <MobileLink to="/" label="КАТАЛОГ ПРЕДМЕТОВ" icon={<LayoutGrid size={24}/>} onClick={() => setIsMenuOpen(false)} />
                        <MobileLink to={user.role === 'teacher' ? "/teacher" : "/student"} label="ЛИЧНЫЙ КАБИНЕТ" icon={<User size={24}/>} onClick={() => setIsMenuOpen(false)} />
                        <button onClick={handleLogout} className="w-full p-5 bg-red-50 text-red-500 font-black flex items-center justify-between rounded-3xl transition-all text-sm uppercase mt-4 shadow-sm italic">
                          ЗАВЕРШИТЬ СЕАНС <LogOut size={24} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </nav>

              <main className="w-full max-w-7xl px-4 sm:px-6 py-10 flex flex-col items-center flex-1">
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/subject/:id" element={<SubjectSectionsPage />} />
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/teacher" element={user.role === 'teacher' ? <TeacherProfile /> : <Navigate to="/" />} />
                  <Route path="/student" element={user.role === 'student' ? <StudentProfile /> : <Navigate to="/" />} />
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

// --- ИСПРАВЛЕННОЕ ОКНО АВТОРИЗАЦИИ С РАБОЧИМИ ПОЛЯМИ ---
function AuthPage({ onAuthSuccess }: { onAuthSuccess: (data: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    surname: '', name: '', group: '', email: '', password: '', role: 'student' 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthSuccess(formData);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#f0f7ff] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-[4rem] sm:rounded-[5rem] shadow-[0_60px_120px_rgba(25,118,210,0.18)] flex flex-col md:flex-row min-h-0 md:min-h-[700px] overflow-hidden relative border-8 border-white">
        
        {/* АНИМИРОВАННЫЙ ОВЕРЛЕЙ (ПК: УХОДИТ В СТОРОНУ ОТ АКТИВНОЙ ФОРМЫ) */}
        <motion.div 
          animate={{ x: isLogin ? '100%' : '0%' }}
          transition={{ type: "spring", stiffness: 70, damping: 18 }}
          className="hidden md:flex absolute top-0 left-0 w-1/2 h-full bg-[#1976d2] z-50 p-16 text-white flex flex-col justify-center items-center text-center space-y-8 shadow-[0_0_80px_rgba(0,0,0,0.2)]"
        >
          <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center backdrop-blur-md border-2 border-white/20">
             <Shield size={50} className="text-white opacity-90" />
          </div>
          <div className="space-y-2">
            <h3 className="text-4xl leading-none font-black tracking-tighter">МАГИСТРАЛЬ <br/> ТТЖТ</h3>
            <div className="w-12 h-1.5 bg-white/30 mx-auto rounded-full" />
          </div>
          <p className="text-sm opacity-70 tracking-widest max-w-[280px] leading-relaxed font-black uppercase">
            {isLogin ? 'НЕТ УЧЁТНОЙ ЗАПИСИ ДЛЯ ТЕСТИРОВАНИЯ?' : 'УЖЕ ЗАРЕГИСТРИРОВАНЫ В СИСТЕМЕ?'}
          </p>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="border-4 border-white/30 hover:bg-white hover:text-[#1976d2] px-14 py-5 rounded-[2.5rem] text-xs transition-all active:scale-90 font-black uppercase shadow-xl italic"
          >
            {isLogin ? 'СОЗДАТЬ АККАУНТ' : 'ВОЙТИ В ПРОФИЛЬ'}
          </button>
        </motion.div>

        {/* ШАПКА ДЛЯ МОБИЛЬНЫХ */}
        <div className="md:hidden bg-[#1976d2] p-10 text-white text-center space-y-6 shrink-0 shadow-lg font-black uppercase italic">
           <h3 className="text-3xl tracking-tighter">МАГИСТРАЛЬ ТТЖТ</h3>
           <button 
             onClick={() => setIsLogin(!isLogin)} 
             className="bg-white text-[#1976d2] px-10 py-4 rounded-2xl text-xs font-black active:scale-95 shadow-2xl uppercase italic"
           >
             {isLogin ? 'РЕГИСТРАЦИЯ' : 'ВХОД В СИСТЕМУ'}
           </button>
        </div>

        {/* --- КОНТЕЙНЕР ФОРМ (РАЗДЕЛЕН НА ДВЕ ПОЛОВИНЫ) --- */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 relative bg-white overflow-y-auto max-h-[85vh] md:max-h-none">
          
          {/* ЛЕВАЯ ПОЛОВИНА: ФОРМА ВХОДА (Активна когда isLogin = true) */}
          <div className={`p-8 sm:p-12 md:p-20 flex flex-col justify-center transition-all duration-700 ${isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="max-w-sm mx-auto w-full space-y-8">
                <div className="space-y-2">
                  <h2 className="text-4xl text-[#1565c0] font-black uppercase tracking-tighter italic">ВХОД</h2>
                  <p className="text-[10px] text-slate-400 tracking-widest font-black uppercase">АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <RoleSelector role={formData.role} setRole={(r) => setFormData({...formData, role: r})} />
                    <AuthInput label="E-MAIL / ЛОГИН" icon={<Mail size={20}/>} value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                    <AuthInput label="ПАРОЛЬ" type="password" icon={<Lock size={20}/>} value={formData.password} onChange={v => setFormData({...formData, password: v})} />
                    <button className="w-full bg-[#1976d2] hover:bg-[#1565c0] text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-100 transition-all active:scale-95 mt-6 uppercase italic">Войти</button>
                </form>
             </div>
          </div>

          {/* ПРАВАЯ ПОЛОВИНА: ФОРМА РЕГИСТРАЦИИ (Активна когда isLogin = false) */}
          <div className={`p-8 sm:p-12 md:p-20 flex flex-col justify-center transition-all duration-700 ${!isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="max-w-sm mx-auto w-full space-y-8 font-black uppercase italic">
                <div className="space-y-2">
                  <h2 className="text-4xl text-[#1565c0] font-black uppercase tracking-tighter italic">СОЗДАТЬ</h2>
                  <p className="text-[10px] text-slate-400 tracking-widest font-black uppercase">РЕГИСТРАЦИЯ НОВОГО УЧАСТНИКА</p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <RoleSelector role={formData.role} setRole={(r) => setFormData({...formData, role: r})} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AuthInput label="ФАМИЛИЯ" value={formData.surname} onChange={v => setFormData({...formData, surname: v.toUpperCase()})} />
                      <AuthInput label="ИМЯ" value={formData.name} onChange={v => setFormData({...formData, name: v.toUpperCase()})} />
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {formData.role === 'student' && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-2">
                          <label className="text-[11px] text-slate-400 ml-5 font-black italic uppercase tracking-widest">Ваша Группа</label>
                          <div className="relative">
                              <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1976d2]/40" size={22} />
                              <select required className="w-full bg-slate-50 border-4 border-slate-100 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-black text-[#1565c0] outline-none appearance-none focus:border-[#1976d2] transition-all shadow-inner italic uppercase" value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})}>
                                  <option value="">ВЫБЕРИТЕ...</option>
                                  <option value="КС-2-1">КС-2-1</option>
                                  <option value="Р-1-1">Р-1-1</option>
                                  <option value="Т-1-2">Т-1-2</option>
                              </select>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AuthInput label="E-MAIL" icon={<Mail size={20}/>} value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                    <AuthInput label="ПАРОЛЬ" type="password" icon={<Lock size={20}/>} value={formData.password} onChange={v => setFormData({...formData, password: v})} />
                    <button className="w-full bg-[#1976d2] hover:bg-[#1565c0] text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 transition-all active:scale-95 mt-6 uppercase italic">Зарегистрироваться</button>
                </form>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

function RoleSelector({ role, setRole }: { role: string, setRole: (r: string) => void }) {
  return (
    <div className="space-y-2 font-black uppercase italic">
      <label className="text-[11px] text-slate-400 ml-5 font-black italic uppercase tracking-widest">Выберите Роль</label>
      <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border-2 border-slate-50 shadow-inner">
        <button type="button" onClick={() => setRole('student')} className={`flex-1 py-4 rounded-[1.5rem] font-black italic text-[11px] transition-all uppercase ${role === 'student' ? 'bg-[#1976d2] text-white shadow-xl scale-[1.03]' : 'text-slate-400 hover:text-slate-600'}`}>Студент</button>
        <button type="button" onClick={() => setRole('teacher')} className={`flex-1 py-4 rounded-[1.5rem] font-black italic text-[11px] transition-all uppercase ${role === 'teacher' ? 'bg-[#1976d2] text-white shadow-xl scale-[1.03]' : 'text-slate-400 hover:text-slate-600'}`}>Преподаватель</button>
      </div>
    </div>
  );
}

function AuthInput({ label, icon, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-2 group font-black uppercase italic">
      <label className="text-[11px] text-slate-400 ml-5 font-black italic uppercase tracking-widest transition-colors group-focus-within:text-[#1976d2]">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1976d2]/40 transition-colors group-focus-within:text-[#1976d2]">{icon}</div>}
        <input 
          type={type} required
          className={`w-full bg-slate-50 border-4 border-slate-100 rounded-[2rem] py-5 ${icon ? 'pl-16' : 'px-8'} pr-8 text-sm font-black text-[#1565c0] outline-none focus:border-[#1976d2] transition-all placeholder:text-slate-200 uppercase italic shadow-inner tracking-tight`} 
          value={value} onChange={e => onChange(e.target.value)} 
        />
      </div>
    </div>
  );
}

function NavLink({ to, icon, label }: any) {
  return (
    <Link to={to} className="flex items-center gap-3 text-slate-500 hover:text-[#1976d2] px-6 py-3 rounded-2xl transition-all font-black text-[12px] uppercase italic hover:bg-blue-50/50 border-2 border-transparent hover:border-blue-100 shadow-sm hover:shadow-md">
      {icon} {label}
    </Link>
  );
}

function MobileLink({ to, label, icon, onClick }: any) {
  return (
    <Link to={to} onClick={onClick} className="w-full p-5 bg-slate-50 text-[#1565c0] font-black flex justify-between items-center hover:bg-blue-100 rounded-[2rem] transition-all text-sm border-2 border-transparent active:border-blue-200 shadow-sm uppercase italic">
      <span className="flex items-center gap-4">{icon} {label}</span>
      <ChevronRight size={24} className="text-[#1976d2]/40" />
    </Link>
  );
}