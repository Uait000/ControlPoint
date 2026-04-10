import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Clock, CheckCircle2, Camera, PlayCircle, BookOpen, 
  AlertCircle, FileText, ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface UserState {
  id: number;
  login: string;
  first_name: string;
  second_name: string;
  belongs_to: number;
}

export const StudentProfile = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [assignedTests, setAssignedTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);

  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('user_auth');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      id: parsed.id || 0,
      login: parsed.login || 'guest',
      first_name: parsed.firstName || parsed.first_name || 'ИМЯ',
      second_name: parsed.secondName || parsed.second_name || 'ФАМИЛИЯ',
      belongs_to: parsed.belongsTo || parsed.belongs_to || 0
    };
  });

  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('user_avatar'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headers = { 
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json' 
  };

  useEffect(() => {
    // Синхронизация профиля с актуальными данными из таблицы students
    const syncProfile = async () => {
      try {
        const res = await fetch('/test/whoami', { headers });
        if (res.ok) {
          const data = await res.json();
          
          const updated: UserState = {
            ...user,
            first_name: data.firstName || user.first_name,
            second_name: data.secondName || user.second_name,
            belongs_to: data.belongsTo || user.belongs_to
          };
          
          setUser(updated);
          localStorage.setItem('user_auth', JSON.stringify(updated));
        }
      } catch (err) {
        console.error("Critical: Profile sync failed", err);
      }
    };

    const fetchGroups = async () => {
      try {
        const res = await fetch('/groups', { headers });
        const data = await res.json();
        setGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error: Groups fetch failed", err);
      }
    };

    syncProfile();
    fetchGroups();
  }, []);

  // Загрузка тестов при получении ID группы
  useEffect(() => {
    const fetchMyTests = async () => {
      if (!user.belongs_to) {
        setLoadingTests(false);
        return;
      }

      try {
        const res = await fetch('/tests/available', { headers });
        const data = await res.json();
        if (Array.isArray(data)) {
          const myTests = data.filter((t: any) => String(t.belongs_to) === String(user.belongs_to));
          setAssignedTests(myTests);
        }
      } catch (err) {
        console.error("Error: Tests fetch failed", err);
      } finally {
        setLoadingTests(false);
      }
    };

    fetchMyTests();
  }, [user.belongs_to]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
        localStorage.setItem('user_avatar', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const groupName = useMemo(() => {
    const found = groups.find(g => String(g.id) === String(user.belongs_to));
    return found ? `${found.name}-${found.course}-${found.number}` : `№${user.belongs_to}`;
  }, [groups, user.belongs_to]);

  return (
    <div className="w-full max-w-6xl px-4 space-y-6 sm:space-y-10 flex flex-col items-center text-slate-800 italic uppercase font-black antialiased pb-20">
      
      {/* КАРТОЧКА ПРОФИЛЯ */}
      <div className="w-full bg-white rounded-[2.5rem] sm:rounded-[4rem] shadow-xl overflow-hidden border border-slate-100 relative">
        <div className="h-24 sm:h-40 bg-[#1976d2] relative overflow-hidden">
          <BookOpen size={180} className="absolute -bottom-10 -left-10 text-white opacity-10 rotate-12" />
        </div>
        
        <div className="px-6 sm:px-12 pb-10 sm:pb-16 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-10 -mt-12 sm:-mt-20">
            
            <div className="relative group shrink-0">
               <div className="w-32 h-32 sm:w-44 sm:h-44 bg-slate-800 rounded-[2rem] sm:rounded-[3rem] border-4 sm:border-[6px] border-white shadow-2xl overflow-hidden">
                  {avatar ? (
                    <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.login}`} className="w-full h-full" alt="Default Avatar" />
                  )}
               </div>
               <button 
                 onClick={() => fileInputRef.current?.click()} 
                 className="absolute inset-0 bg-black/50 rounded-[2rem] sm:rounded-[3rem] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-1"
               >
                <Camera size={24} />
                <span className="text-[8px] tracking-tighter">ОБНОВИТЬ</span>
               </button>
               <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            </div>

            <div className="flex-1 text-center md:text-left w-full overflow-hidden">
              <div className="pt-2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[9px] sm:text-[10px] tracking-widest mb-2 inline-block shadow-lg">СТУДЕНТ ТТЖТ</span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight truncate">
                  {user.second_name} {user.first_name}
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0"/>
                  <span className="text-[#1976d2] text-xs sm:text-base tracking-widest font-black truncate">
                      ГРУППА {groupName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* СЕКЦИЯ ТЕСТОВ */}
      <div className="w-full space-y-6">
        <div className="flex items-center gap-4 px-4 sm:px-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-[#1976d2]">
            <PlayCircle size={28} />
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter italic">ДОСТУПНЫЕ ТЕСТЫ</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {loadingTests ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-4 opacity-50">
               <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-xs">ЗАГРУЗКА ЗАДАНИЙ...</span>
            </div>
          ) : assignedTests.length > 0 ? (
            assignedTests.map((test) => (
              <motion.div 
                whileHover={{ y: -5 }} 
                key={test.id} 
                className="bg-white p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all flex flex-col sm:flex-row items-center gap-5 group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={32} />
                </div>
                <div className="flex-1 text-center sm:text-left overflow-hidden w-full">
                  <h4 className="text-sm sm:text-lg font-black text-slate-900 leading-tight mb-2 break-all uppercase">
                    {test.docx ? test.docx.replace('.pdf', '') : 'ТЕСТ БЕЗ НАЗВАНИЯ'}
                  </h4>
                  <div className="text-[9px] text-slate-500 font-black italic">
                    СЛОЖНОСТЬ: {test.complexity || 1} • 20 МИНУТ
                  </div>
                </div>
                <Link 
                  to={`/test/${test.id}`} 
                  className="w-full sm:w-auto bg-[#1976d2] text-white px-8 py-4 rounded-xl font-black text-[10px] shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  СТАРТ <ChevronRight size={16} />
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
               <AlertCircle size={48} className="text-slate-200" />
               <div className="text-slate-400 font-black text-sm sm:text-xl tracking-tighter">
                  ДЛЯ ГРУППЫ {groupName} <br/> ЗАДАНИЙ ПОКА НЕТ
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};