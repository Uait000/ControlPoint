import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, LayoutGrid, Zap, LogOut, Settings, CheckCircle, BarChart3, RefreshCw } from 'lucide-react';

import { MainPage } from './pages/MainPage';
import { TestPage } from './pages/TestPage';
import { TeacherProfile } from './pages/TeacherProfile';
import { StudentProfile } from './pages/StudentProfile';
import { SubjectSectionsPage } from './pages/SubjectSectionsPage';
import { AdminPanel } from './pages/AdminPanel';
import { RegistrationPage } from './pages/RegistrationPage';
import { DirectorProfile } from './pages/DirectorProfile';
import type { User, AuthResponse } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Локальное состояние для переключения интерфейса (для преподавателей-помощников)
  const [activeAssistantMode, setActiveAssistantRole] = useState<'teacher' | 'admin'>('teacher');

  useEffect(() => {
    const saved = localStorage.getItem('user_auth');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setUser(parsed); 
        
        // Если зашел ассистент, по умолчанию включаем ему интерфейс админки
        const rawRole = parsed.accountType || parsed.account_type || "";
        if (rawRole.toString().toLowerCase() === 'assistantadmin') {
          setActiveAssistantRole('admin');
        }
      } catch (e) { 
        localStorage.removeItem('user_auth'); 
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user_auth', JSON.stringify(data.user));
    setUser(data.user);
    
    const rawRole = data.user.accountType || "";
    if (rawRole.toString().toLowerCase() === 'assistantadmin') {
      setActiveAssistantRole('admin');
    } else {
      setActiveAssistantRole('teacher');
    }

    setNotification(`ДОБРО ПОЖАЛОВАТЬ!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  if (loading) return null;

  const getRawRole = () => {
    if (!user) return "";
    const rawRole = (user as any).accountType || (user as any).account_type || "";
    return rawRole.toString().toLowerCase();
  };

  const rawRole = getRawRole();
  const userLogin = (user?.login || "").toLowerCase();

  // Разграничение ролей
  const isSystemAdmin = rawRole === 'systemadmin' || userLogin === 'admin';
  const isAssistantAdmin = rawRole === 'assistantadmin';
  const isAdmin = isSystemAdmin || (isAssistantAdmin && activeAssistantMode === 'admin');
  
  const isTeacher = rawRole === 'teacher' || (isAssistantAdmin && activeAssistantMode === 'teacher');
  const isDirector = rawRole === 'director';
  const isStudent = rawRole === 'student' || (!isSystemAdmin && !isAssistantAdmin && !isTeacher && !isDirector && !!user);

  const getProfilePath = () => {
    if (isSystemAdmin || (isAssistantAdmin && activeAssistantMode === 'admin')) return "/admin";
    if (isDirector) return "/director";
    if (isTeacher) return "/teacher";
    return "/student";
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fbff] flex flex-col font-black italic uppercase text-slate-700 overflow-x-hidden">
        
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }} 
              animate={{ y: 20, opacity: 1 }} 
              exit={{ y: -100, opacity: 0 }} 
              className="fixed top-0 self-center z-[1000] bg-[#1976d2] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white/20"
            >
              <CheckCircle size={20} />
              <span className="text-[10px] tracking-widest">{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!user ? (
          <RegistrationPage onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            <nav className="w-full bg-white/90 backdrop-blur-xl border-b-2 border-[#e1eefb] sticky top-0 z-[500]">
              <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3">
                  <div className="bg-[#1976d2] p-2 rounded-xl shadow-lg">
                    <Zap className="text-white" size={24} />
                  </div>
                  <span className="text-xl tracking-tighter text-[#1565c0]">МАГИСТРАЛЬ</span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-4">
                  <NavLink to="/" icon={<LayoutGrid size={18}/>} label="ПРЕДМЕТЫ" />
                  
                  {/* Кнопка Админки видна Системному Админу и Помощнику в режиме администрирования */}
                  {(isSystemAdmin || isAssistantAdmin) && (
                    <NavLink to="/admin" icon={<Settings size={18}/>} label="АДМИНКА" />
                  )}

                  {/* Кнопка Аналитики видна Директору и только Системному Админу */}
                  {(isDirector || isSystemAdmin) && (
                    <NavLink to="/director" icon={<BarChart3 size={18}/>} label="АНАЛИТИКА" />
                  )}

                  <NavLink to={getProfilePath()} icon={<UserIcon size={18}/>} label="ПРОФИЛЬ" />

                  {/* КНОПКА-ТУМБЛЕР ПЕРЕКЛЮЧЕНИЯ ДЛЯ ПОМОЩНИКОВ */}
                  {isAssistantAdmin && (
                    <button
                      onClick={() => setActiveAssistantRole(prev => prev === 'teacher' ? 'admin' : 'teacher')}
                      className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200 px-4 py-2 rounded-xl text-[10px] tracking-tighter transition-all font-black"
                      title="ПЕРЕКЛЮЧИТЬ ИНТЕРФЕЙС РОЛИ"
                    >
                      <RefreshCw size={14} className="animate-spin duration-1000" />
                      <span className="hidden md:inline">РЕЖИМ: {activeAssistantMode === 'teacher' ? 'УЧИТЕЛЬ' : 'ПОМОЩНИК'}</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={handleLogout} 
                    className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                    title="ВЫЙТИ"
                  >
                    <LogOut size={18}/>
                  </button>
                </div>
              </div>
            </nav>

            <main className="max-w-7xl mx-auto w-full p-6 flex-1">
              <Routes>
                <Route path="/" element={<MainPage />} />
                
                <Route 
                  path="/admin" 
                  element={isSystemAdmin || isAssistantAdmin ? <AdminPanel /> : <Navigate to={getProfilePath()} />} 
                />
                
                <Route 
                  path="/director" 
                  element={isDirector || isSystemAdmin ? <DirectorProfile /> : <Navigate to={getProfilePath()} />} 
                />

                <Route 
                  path="/teacher" 
                  element={isTeacher || isAssistantAdmin ? <TeacherProfile /> : <Navigate to={getProfilePath()} />} 
                />
                <Route 
                  path="/student" 
                  element={isStudent ? <StudentProfile /> : <Navigate to={getProfilePath()} />} 
                />
                
                <Route path="/subject/:id" element={<SubjectSectionsPage />} />
                <Route path="/test/:id" element={<TestPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label }: any) {
  return (
    <Link 
      to={to} 
      className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-slate-500 hover:text-[#1976d2] transition-all font-black text-[10px] border-2 border-transparent hover:border-blue-100 uppercase italic"
    >
      {icon} <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}