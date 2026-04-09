import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, LayoutGrid, Zap, LogOut, Settings, CheckCircle, Shield } from 'lucide-react';

import { MainPage } from './pages/MainPage';
import { TestPage } from './pages/TestPage';
import { TeacherProfile } from './pages/TeacherProfile';
import { StudentProfile } from './pages/StudentProfile';
import { SubjectSectionsPage } from './pages/SubjectSectionsPage';
import { AdminPanel } from './pages/AdminPanel';
import { RegistrationPage } from './pages/RegistrationPage';
import type { User, AuthResponse } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user_auth');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        console.log("[DEBUG] ОБЪЕКТ ИЗ ПАМЯТИ:", parsed);
        setUser(parsed); 
      } catch (e) { 
        console.error("Ошибка парсинга сессии:", e);
        localStorage.removeItem('user_auth'); 
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    console.log("[DEBUG] УСПЕШНЫЙ ВХОД. ДАННЫЕ С СЕРВЕРА:", data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user_auth', JSON.stringify(data.user));
    setUser(data.user);
    setNotification(`ДОБРО ПОЖАЛОВАТЬ, ${(data.user.login || 'ПОЛЬЗОВАТЕЛЬ').toUpperCase()}!`);
  };

  if (loading) return null;

  // --- ЛОГИКА ОПРЕДЕЛЕНИЯ РОЛИ ---
  // Проверяем все варианты: snake_case (из БД) и camelCase (из Serde)
  const roleRaw = user?.account_type || (user as any)?.accountType || "";
  const role = roleRaw.toString().trim(); // Оставляем оригинальный регистр для сравнения
  const login = user?.login?.toLowerCase() || "";

  // Сравнение с учетом регистра, который мы прописали в Rust enum
  const isAdmin = role === 'Admin' || login === 'admin';
  const isTeacher = role === 'Teacher';
  const isStudent = role === 'Student';

  console.log(`[DEBUG] ПРОВЕРКА ПРАВ: Роль="${role}" | Это Админ?=${isAdmin} | Это Учитель?=${isTeacher}`);

  const getProfilePath = () => {
    if (isAdmin) return "/admin";
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
                  <div className="bg-[#1976d2] p-2 rounded-xl shadow-lg"><Zap className="text-white" size={24} /></div>
                  <span className="text-xl tracking-tighter text-[#1565c0]">МАГИСТРАЛЬ</span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-4">
                  <NavLink to="/" icon={<LayoutGrid size={18}/>} label="ПРЕДМЕТЫ" />
                  
                  {isAdmin && <NavLink to="/admin" icon={<Settings size={18}/>} label="АДМИНКА" />}
                  
                  <NavLink to={getProfilePath()} icon={<UserIcon size={18}/>} label="ПРОФИЛЬ" />
                  
                  <button 
                    onClick={() => { localStorage.clear(); window.location.href = '/'; }} 
                    className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                    title="ВЫЙТИ"
                  >
                    <LogOut size={18}/>
                  </button>
                </div>
              </div>
            </nav>

            <main className="max-w-7xl mx-auto w-full p-6 flex-1 flex flex-col items-center">
              <Routes>
                <Route path="/" element={<MainPage />} />
                
                {/* Динамические маршруты с защитой по роли */}
                <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to={getProfilePath()} />} />
                <Route path="/teacher" element={isTeacher ? <TeacherProfile /> : <Navigate to={getProfilePath()} />} />
                <Route path="/student" element={isStudent ? <StudentProfile /> : <Navigate to={getProfilePath()} />} />
                
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
    <Link to={to} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-slate-500 hover:text-[#1976d2] transition-all font-black text-[10px] border-2 border-transparent hover:border-blue-100 uppercase italic whitespace-nowrap">
      {icon} <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}