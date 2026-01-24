import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Hash, BookOpen, Cpu, ShieldCheck, Zap } from 'lucide-react';

export const MainPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const subjects = [
    { id: '1', title: 'Компьютерные системы', icon: <Cpu />, count: 12, color: 'bg-[#1e88e5]' },
    { id: '2', title: 'Информационная безопасность', icon: <ShieldCheck />, count: 8, color: 'bg-[#1976d2]' },
    { id: '3', title: 'Электротехника', icon: <Zap />, count: 15, color: 'bg-[#1565c0]' },
    { id: '4', title: 'Высшая математика', icon: <BookOpen />, count: 10, color: 'bg-[#1e88e5]' },
  ];

  return (
    <div className="w-full space-y-12">
      <div className="bg-[#1565c0] rounded-[3rem] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full"></div>
        <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter mb-6 relative z-10">Доступ по коду</h2>
        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 relative z-10">
          <div className="flex-1 relative text-left">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="text" placeholder="Введите код теста" 
              className="w-full bg-white/20 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xl font-bold uppercase tracking-widest focus:bg-white/30 outline-none transition-all placeholder:text-white/30"
              value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
          <button 
            onClick={() => navigate('/test')}
            className="bg-white text-[#1565c0] font-black px-10 py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase italic"
          >
            Войти
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black uppercase italic text-[#1565c0]">Доступные дисциплины</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((s) => (
            <div 
              key={s.id} 
              onClick={() => navigate('/test')}
              className="group cursor-pointer bg-white p-8 rounded-[2.5rem] border border-[#e1eefb] shadow-xl hover:shadow-blue-100 hover:border-[#1976d2] transition-all"
            >
              <div className={`${s.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:rotate-6 transition-transform shadow-lg shadow-blue-50`}>
                {s.icon}
              </div>
              <h4 className="text-xl font-black text-slate-800 leading-tight mb-2 uppercase italic tracking-tighter">{s.title}</h4>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{s.count} тестов активно</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border border-dashed border-[#1976d2]/30 text-center">
        <p className="text-[#1976d2] font-black uppercase italic text-[10px] tracking-widest leading-relaxed">
          Система «Магистраль» автоматически формирует списки групп и отслеживает успеваемость. <br/> Все данные синхронизированы с базой ТТЖТ.
        </p>
      </div>
    </div>
  );
};