import React from 'react';
import { User, Shield, Zap, Star, Trophy, Clock } from 'lucide-react';

export const StudentProfile = () => {
  const tests = [
    { subject: 'Компьютерные системы', score: 95, grade: '5', date: '12.01.2026' },
    { subject: 'Высшая математика', score: 72, grade: '4', date: '08.01.2026' },
  ];

  return (
    <div className="w-full max-w-4xl space-y-8 flex flex-col items-center">
      {/* КАРТОЧКА ПРОФИЛЯ */}
      <div className="w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="h-32 bg-gradient-to-r from-orange-500 to-red-500"></div>
        <div className="px-8 pb-10 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
            <div className="relative group cursor-pointer">
               <div className="w-32 h-32 bg-slate-800 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Student" alt="avatar" />
               </div>
               <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase">Сменить фото</div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Марат Хамитов</h2>
              <p className="text-orange-500 font-bold uppercase text-sm">Группа Р-2-1 • Студент</p>
            </div>
            <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-center">
               <div className="text-[10px] font-black text-slate-400 uppercase">Рейтинг</div>
               <div className="text-2xl font-black text-slate-800">A+</div>
            </div>
          </div>

          {/* XP БАР */}
          <div className="mt-10 bg-slate-50 p-6 rounded-3xl">
             <div className="flex justify-between items-center mb-3">
                <span className="text-slate-800 font-black italic uppercase text-xs flex items-center gap-2"><Star size={16} className="fill-orange-400 text-orange-400" /> Уровень 14</span>
                <span className="font-mono text-xs font-bold text-slate-400">4200 / 5000 XP</span>
             </div>
             <div className="h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all" style={{width: '84%'}}></div>
             </div>
          </div>
        </div>
      </div>

      {/* ИСТОРИЯ И АЧИВКИ */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <h3 className="text-xl font-black uppercase italic text-slate-800 mb-6 flex items-center gap-2"><Clock className="text-orange-500" /> Последние результаты</h3>
          <div className="space-y-4">
            {tests.map((t, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <div className="font-black text-slate-800 uppercase text-xs mb-1">{t.subject}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t.date}</div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="font-mono font-bold text-orange-600">{t.score}%</span>
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-xl text-slate-800 shadow-sm border border-slate-100">{t.grade}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
          <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2"><Trophy className="text-yellow-500" /> Достижения</h3>
          <div className="grid grid-cols-3 gap-4">
             {[
               { icon: <Shield />, color: 'bg-blue-500' },
               { icon: <Zap />, color: 'bg-yellow-500' },
               { icon: <Star />, color: 'bg-purple-500' },
             ].map((a, i) => (
               <div key={i} className={`${a.color} aspect-square rounded-2xl flex items-center justify-center text-white shadow-lg shadow-white/5 hover:scale-110 transition-transform cursor-pointer`}>
                 {a.icon}
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};