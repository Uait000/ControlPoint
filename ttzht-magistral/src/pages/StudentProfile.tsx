import React, { useState, useRef, useEffect } from 'react';
import { User, Clock, CheckCircle2, Edit3, Save, Camera, X } from 'lucide-react';

export const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Загрузка данных из localStorage или значения по умолчанию
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_auth');
    return saved ? JSON.parse(saved) : {
      surname: 'ИВАНОВ',
      name: 'ИВАН',
      patronymic: 'ИВАНОВИЧ',
      group: 'КС-2-1'
    };
  });

  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('user_avatar'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Пример данных истории
  const tests = [
    { subject: 'КОМПЬЮТЕРНЫЕ СИСТЕМЫ', score: '18/20', grade: '5', date: '12.01.2026', teacher: 'ПРОХОРОВ Д.С.' },
    { subject: 'ВЫСШАЯ МАТЕМАТИКА', score: '14/20', grade: '4', date: '08.01.2026', teacher: 'ИВАНОВА Е.А.' },
    { subject: 'ИНФОРМАТИКА', score: '11/20', grade: '3', date: '25.12.2025', teacher: 'ПРОХОРОВ Д.С.' },
  ];

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

  const saveProfile = () => {
    setIsEditing(false);
    localStorage.setItem('user_auth', JSON.stringify(user));
  };

  const getGradeColor = (grade: string) => {
    if (grade === '5') return 'bg-[#52b788]';
    if (grade === '4') return 'bg-[#ffb700]';
    if (grade === '3') return 'bg-[#f4d35e]';
    return 'bg-[#ba181b]';
  };

  return (
    <div className="w-full max-w-4xl px-4 space-y-6 flex flex-col items-center text-slate-700 italic uppercase font-black antialiased">
      
      {/* КАРТОЧКА ПРОФИЛЯ */}
      <div className="w-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-[#e1eefb]">
        
        {/* Синий хедер с адаптивной кнопкой */}
        <div className="h-28 sm:h-32 bg-[#1976d2] relative flex items-center justify-end px-4 sm:px-8">
          <button 
            onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
            className="z-10 bg-white/20 backdrop-blur-md text-white p-3 sm:px-5 sm:py-2 rounded-full sm:rounded-xl flex items-center justify-center gap-2 hover:bg-white/30 transition-all border border-white/20 shadow-lg"
          >
            {isEditing ? (
              <><Save size={20}/><span className="hidden sm:inline text-xs">СОХРАНИТЬ</span></>
            ) : (
              <><Edit3 size={20}/><span className="hidden sm:inline text-xs">РЕДАКТИРОВАТЬ</span></>
            )}
          </button>
        </div>
        
        <div className="px-6 pb-10 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 -mt-12 sm:-mt-16">
            
            {/* Аватар с загрузкой */}
            <div className="relative group shrink-0">
               <div className="w-32 h-32 sm:w-36 sm:h-36 bg-slate-900 rounded-[2rem] border-4 sm:border-8 border-white shadow-xl overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                  ) : (
                    <User size={64} className="text-white opacity-20" />
                  )}
               </div>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-1"
               >
                <Camera size={24} />
                <span className="text-[8px]">ГАЛЕРЕЯ</span>
               </button>
               <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            </div>

            {/* Блок информации / редактирования */}
            <div className="flex-1 text-center md:text-left w-full">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto md:mx-0 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 ml-2">ФАМИЛИЯ</label>
                    <input 
                      className="w-full bg-slate-50 border-2 border-blue-100 rounded-xl px-4 py-2 font-black text-[#1565c0] outline-none focus:border-[#1976d2] text-sm" 
                      value={user.surname} 
                      onChange={e => setUser({...user, surname: e.target.value.toUpperCase()})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 ml-2">ИМЯ</label>
                    <input 
                      className="w-full bg-slate-50 border-2 border-blue-100 rounded-xl px-4 py-2 font-black text-[#1565c0] outline-none focus:border-[#1976d2] text-sm" 
                      value={user.name} 
                      onChange={e => setUser({...user, name: e.target.value.toUpperCase()})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 ml-2">ОТЧЕСТВО</label>
                    <input 
                      className="w-full bg-slate-50 border-2 border-blue-100 rounded-xl px-4 py-2 font-black text-[#1565c0] outline-none focus:border-[#1976d2] text-sm" 
                      value={user.patronymic} 
                      onChange={e => setUser({...user, patronymic: e.target.value.toUpperCase()})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 ml-2">ГРУППА</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-blue-100 rounded-xl px-4 py-2 font-black text-[#1565c0] outline-none text-sm appearance-none cursor-pointer"
                      value={user.group} 
                      onChange={e => setUser({...user, group: e.target.value})}
                    >
                      <option value="КС-2-1">КС-2-1</option>
                      <option value="Р-1-1">Р-1-1</option>
                      <option value="КС-1-2">КС-1-2</option>
                      <option value="Т-2-1">Т-2-1</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="pt-4 md:pt-0">
                  <h2 className="text-xl sm:text-3xl font-black text-[#1565c0] leading-tight tracking-tight">
                    {user.surname} {user.name} {user.patronymic}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <CheckCircle2 size={18} className="text-[#52b788]"/>
                    <span className="text-[#1976d2] text-xs sm:text-sm tracking-wide">
                      ГРУППА {user.group} • СТУДЕНТ ТТЖТ
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Статус (скрыт при редактировании на мобилках) */}
            {!isEditing && (
              <div className="bg-[#f0f7ff] px-6 py-4 rounded-3xl border border-[#e1eefb] text-center min-w-[140px] hidden sm:block">
                <div className="text-[10px] text-slate-400 mb-1">СТАТУС</div>
                <div className="text-lg font-black text-[#1976d2]">АКТИВЕН</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ИСТОРИЯ ТЕСТИРОВАНИЙ */}
      <div className="w-full bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-[#e1eefb]">
        <h3 className="text-base sm:text-xl font-black text-[#1565c0] mb-8 flex items-center gap-3 underline underline-offset-8 decoration-2 decoration-[#1e88e5]">
          <Clock size={24} className="text-[#1e88e5]"/> ИСТОРИЯ ТЕСТИРОВАНИЙ
        </h3>
        
        <div className="space-y-4">
          {tests.map((t, i) => (
            <div key={i} className="flex flex-col sm:flex-row justify-between items-center p-5 sm:p-6 bg-[#f8fbff] rounded-2xl border border-slate-100 gap-4 transition-all hover:bg-blue-50/50 group">
              <div className="flex-1 text-center sm:text-left leading-tight">
                <div className="text-[10px] text-slate-400 mb-1 opacity-70">
                  ДАТА: {t.date} • {t.teacher}
                </div>
                <div className="text-sm sm:text-base text-[#1565c0] font-black group-hover:text-[#1976d2]">
                  {t.subject}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <div className="text-[9px] text-slate-400 opacity-50">РЕЗУЛЬТАТ</div>
                    <div className="text-lg sm:text-xl font-mono text-[#1976d2]">{t.score}</div>
                 </div>
                 <div className={`${getGradeColor(t.grade)} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl text-white shadow-lg shadow-black/5`}>
                    {t.grade}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};