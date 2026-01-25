import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ShieldCheck, Zap, BookOpen, ChevronRight, Play } from 'lucide-react';

export const MainPage = () => {
  const navigate = useNavigate();

  // Актуальная дата
  const now = new Date();
  const dayNumber = now.getDate();
  const monthGenitive = now.toLocaleString('ru-RU', { month: 'long', day: 'numeric' }).split(' ')[1].toUpperCase();
  const weekDay = now.toLocaleString('ru-RU', { weekday: 'long' }).toUpperCase();

  // Все плашки теперь имеют синие градиенты разных оттенков
  const subjects = [
    { id: 'cs', title: 'Компьютерные системы', icon: <Cpu />, count: 12, color: 'from-blue-600 to-blue-700' },
    { id: 'is', title: 'Информационная безопасность', icon: <ShieldCheck />, count: 8, color: 'from-[#1565c0] to-[#0d47a1]' },
    { id: 'et', title: 'Электротехника', icon: <Zap />, count: 15, color: 'from-blue-500 to-blue-600' },
    { id: 'math', title: 'Высшая математика', icon: <BookOpen />, count: 10, color: 'from-sky-500 to-blue-500' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-10 animate-in fade-in duration-700 font-black italic uppercase antialiased">
      
      {/* ГЛАВНЫЙ БАНЕР (HERO) */}
      <div className="relative w-full min-h-[320px] sm:h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer flex items-center">
        {/* Градиентный фон */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1565c0] via-[#1976d2]/90 to-transparent z-10" />
        
        {/* Изображение на фоне */}
        <img 
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt="Hero"
        />
        
        {/* Контент банера */}
        <div className="absolute inset-0 z-20 p-6 sm:p-14 flex flex-col justify-center max-w-2xl space-y-4">
          <h2 className="text-2xl sm:text-4xl md:text-6xl text-white leading-tight tracking-tighter">
            ОБРАЗОВАТЕЛЬНАЯ <br className="hidden sm:block"/> ПЛАТФОРМА ТТЖТ
          </h2>
          <button className="bg-white text-[#1976d2] px-6 py-3 sm:px-8 sm:py-4 rounded-2xl w-fit flex items-center gap-3 text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-xl active:scale-95">
            ПОДРОБНЕЕ <ChevronRight size={18}/>
          </button>
        </div>

        {/* ДИНАМИЧЕСКИЙ ЭЛЕМЕНТ ДАТЫ */}
        <div className="absolute right-6 bottom-6 sm:right-10 sm:bottom-10 z-20 text-white flex flex-col items-end">
          <div className="text-6xl sm:text-9xl opacity-40 leading-none font-black tracking-tighter drop-shadow-2xl">
            {dayNumber}
          </div>
          <div className="text-sm sm:text-2xl tracking-tighter mt-[-5px] sm:mt-[-10px] font-black whitespace-nowrap">
            {monthGenitive}, {weekDay}
          </div>
          <div className="hidden sm:flex items-center gap-2 mt-3 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg opacity-80 italic tracking-widest uppercase text-[10px] border border-white/20">
            <Play size={12} className="fill-white"/> ОНЛАЙН СЕРВЕР
          </div>
        </div>
      </div>

      {/* СЕТКА ПРЕДМЕТОВ */}
      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-between px-2 text-[#1565c0]">
          <h3 className="text-xl sm:text-2xl">ДИСЦИПЛИНЫ</h3>
          <div className="flex gap-2">
            <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-blue-100 flex items-center justify-center shadow-sm cursor-pointer hover:bg-blue-50 transition-all">
              <ChevronRight className="rotate-180" size={18}/>
            </button>
            <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-blue-100 flex items-center justify-center shadow-sm cursor-pointer hover:bg-blue-50 transition-all">
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {subjects.map((s) => (
            <div 
              key={s.id} 
              onClick={() => navigate(`/subject/${s.id}`)}
              className="relative group cursor-pointer bg-white rounded-[2rem] border border-[#e1eefb] shadow-xl hover:shadow-blue-100 transition-all overflow-hidden h-56 sm:h-64"
            >
              {/* Синий градиент */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-90 group-hover:opacity-100 transition-opacity z-10`} />
              
              {/* Фоновый паттерн */}
              <div className="absolute inset-0 opacity-10 z-10 p-4">
                <div className="grid grid-cols-4 gap-2">
                   {[...Array(12)].map((_, i) => <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white"/>)}
                </div>
              </div>

              <div className="absolute inset-0 z-20 p-5 sm:p-6 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-2xl">
                    {React.cloneElement(s.icon as React.ReactElement, { size: 24 })}
                  </div>
                  <span className="text-[8px] sm:text-[10px] bg-black/10 px-2 py-1 rounded-md font-bold">АКТИВНО</span>
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl leading-tight mb-1">{s.title}</h4>
                  <p className="text-[9px] sm:text-[10px] opacity-70 tracking-widest italic">{s.count} РАЗДЕЛОВ ДОСТУПНО</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};