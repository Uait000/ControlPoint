import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Clock, CheckCircle2, Edit3, Save, 
  Camera, PlayCircle, BookOpen, AlertCircle, FileText, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [assignedTests, setAssignedTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_auth');
    if (!saved) return { id: 0, login: 'guest' };
    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      firstName: parsed.firstName || parsed.first_name || 'ИМЯ',
      secondName: parsed.secondName || parsed.second_name || 'ФАМИЛИЯ',
      belongsTo: parsed.belongsTo || parsed.belongs_to || 0
    };
  });

  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('user_avatar'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headers = { 
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json' 
  };

  useEffect(() => {
    fetch('/groups', { headers })
      .then(res => res.json())
      .then(data => setGroups(Array.isArray(data) ? data : []))
      .catch(err => console.error("Ошибка групп", err));

    const fetchMyTests = async () => {
      try {
        const res = await fetch('/tests/available', { headers });
        const data = await res.json();
        if (Array.isArray(data)) {
          const myTests = data.filter((t: any) => String(t.belongs_to) === String(user.belongsTo));
          setAssignedTests(myTests);
        }
      } catch (err) {
        console.error("Ошибка тестов", err);
      } finally {
        setLoadingTests(false);
      }
    };

    if (user.belongsTo) fetchMyTests();
    else setLoadingTests(false);
  }, [user.belongsTo]);

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

  const groupInfo = useMemo(() => {
    const found = groups.find(g => String(g.id) === String(user.belongsTo));
    return found ? `${found.name}-${found.course}-${found.number}` : null;
  }, [groups, user.belongsTo]);

  return (
    <div className="w-full max-w-6xl px-4 space-y-6 sm:space-y-10 flex flex-col items-center text-slate-800 italic uppercase font-black antialiased pb-20">
      
      {/* HEADER CARD */}
      <div className="w-full bg-white rounded-[2.5rem] sm:rounded-[4rem] shadow-xl overflow-hidden border border-slate-100 relative">
        <div className="h-24 sm:h-40 bg-[#1976d2] relative overflow-hidden">
          <BookOpen size={180} className="absolute -bottom-10 -left-10 text-white opacity-10 rotate-12" />
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
            <button 
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              className="bg-white/20 backdrop-blur-md text-white px-4 py-2 sm:px-6 sm:py-3 rounded-2xl flex items-center gap-2 hover:bg-white/30 transition-all border border-white/30 shadow-lg text-[10px] sm:text-xs"
            >
              {isEditing ? <><Save size={16}/> СОХРАНИТЬ</> : <><Edit3 size={16}/> РЕДАКТИРОВАТЬ</>}
            </button>
          </div>
        </div>
        
        <div className="px-6 sm:px-12 pb-10 sm:pb-16 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-10 -mt-12 sm:-mt-20">
            
            <div className="relative group shrink-0">
               <div className="w-32 h-32 sm:w-44 sm:h-44 bg-slate-800 rounded-[2rem] sm:rounded-[3rem] border-4 sm:border-[6px] border-white shadow-2xl overflow-hidden">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.login}`} className="w-full h-full" />}
               </div>
               <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-[2rem] sm:rounded-[3rem] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-1">
                <Camera size={24} />
                <span className="text-[8px] tracking-tighter">ОБНОВИТЬ</span>
               </button>
               <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            </div>

            <div className="flex-1 text-center md:text-left w-full overflow-hidden">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 max-w-xl">
                  <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 font-black text-[#1565c0]" value={user.secondName} onChange={e => setUser({...user, secondName: e.target.value.toUpperCase()})} />
                  <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 font-black text-[#1565c0]" value={user.firstName} onChange={e => setUser({...user, firstName: e.target.value.toUpperCase()})} />
                </div>
              ) : (
                <div className="pt-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[9px] sm:text-[10px] tracking-widest mb-2 inline-block shadow-lg shadow-blue-200">СТУДЕНТ ТТЖТ</span>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight truncate">
                    {user.secondName} {user.firstName}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0"/>
                    <span className="text-[#1976d2] text-xs sm:text-base tracking-widest font-black truncate">
                       ГРУППА {groupInfo || `№${user.belongsTo}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TEST LIST SECTION */}
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
               <span className="text-xs">СИНХРОНИЗАЦИЯ СЕРВЕРА...</span>
            </div>
          ) : assignedTests.length > 0 ? (
            assignedTests.map((test) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={test.id} 
                className="bg-white p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl hover:shadow-blue-100/50 transition-all flex flex-col sm:flex-row items-center gap-5 sm:gap-6 group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-blue-600 shrink-0 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <FileText size={32} />
                </div>
                
                <div className="flex-1 text-center sm:text-left overflow-hidden w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 sm:mb-2">
                    <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-[8px] font-black animate-pulse">NEW</span>
                    <span className="text-[9px] text-slate-400 font-bold tracking-widest">ID #{test.id}</span>
                  </div>
                  <h4 className="text-sm sm:text-lg font-black text-slate-900 leading-tight mb-2 break-all line-clamp-2 uppercase">
                    {test.docx.replace('.pdf', '')}
                  </h4>
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-[9px] text-slate-500 font-black italic">
                    <span className="flex items-center gap-1"><Clock size={12}/> 20 МИН.</span>
                    <span className="flex items-center gap-1"><BookOpen size={12}/> 60 ВОПР.</span>
                  </div>
                </div>

                <Link 
                  to={`/test/${test.id}`}
                  className="w-full sm:w-auto bg-[#1976d2] text-white px-8 py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group/btn"
                >
                  СТАРТ <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 sm:py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
               <AlertCircle size={48} className="text-slate-200" />
               <div className="text-slate-400 font-black text-sm sm:text-xl tracking-tighter">
                  ДЛЯ ГРУППЫ {groupInfo || user.belongsTo} <br/> ЗАДАНИЙ ПОКА НЕТ
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};