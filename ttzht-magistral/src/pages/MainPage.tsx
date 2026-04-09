import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ShieldCheck, Zap, BookOpen, ChevronRight, Layout } from 'lucide-react';

// Соответствует структуре CourseReq в Rust (бэкенд уже парсит JSON в объекты)
interface Subject {
  id: string;
  title: string;
  iconName: string;
  color: string;
  isHidden: boolean;
  sections: any[]; 
}

export const MainPage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap: Record<string, React.ReactNode> = {
    Cpu: <Cpu size={24} />,
    ShieldCheck: <ShieldCheck size={24} />,
    Zap: <Zap size={24} />,
    BookOpen: <BookOpen size={24} />,
    Layout: <Layout size={24} />
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        // ИСПРАВЛЕНО: Эндпоинт /courses вместо /lessons
        const response = await fetch('/courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Показываем только те, что не скрыты
          setSubjects(data.filter((s: Subject) => !s.isHidden));
        }
      } catch (error) {
        console.error("ОШИБКА ЗАГРУЗКИ ПРЕДМЕТОВ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleString('ru-RU', { month: 'long', weekday: 'long' }).toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-black italic text-[#1976d2] animate-pulse uppercase">
        ЗАГРУЗКА ДИСЦИПЛИН...
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-10 animate-in fade-in duration-700 font-black italic uppercase text-slate-700">
      
      {/* ПРИВЕТСТВЕННЫЙ БАННЕР */}
      <div className="relative w-full min-h-[320px] sm:h-[400px] rounded-[3rem] overflow-hidden shadow-2xl flex items-center border-4 border-white">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1565c0] via-[#1976d2]/90 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Hero"
        />
        <div className="absolute inset-0 z-20 p-6 sm:p-14 flex flex-col justify-center max-w-2xl space-y-4 text-white">
          <h2 className="text-2xl sm:text-6xl tracking-tighter leading-tight italic">ОБРАЗОВАТЕЛЬНАЯ ПЛАТФОРМА ТТЖТ</h2>
          <button className="bg-white text-[#1976d2] px-8 py-4 rounded-2xl w-fit flex items-center gap-3 text-xs shadow-xl active:scale-95 transition-transform font-black">
            О ПЛАТФОРМЕ <ChevronRight size={18}/>
          </button>
        </div>
        <div className="absolute right-12 bottom-12 z-20 text-white text-right hidden sm:block">
           <div className="text-9xl opacity-20 leading-none">{now.getDate()}</div>
           <div className="text-xl tracking-tighter mt-[-20px]">{dateStr}</div>
        </div>
      </div>

      <div className="space-y-8 pb-20">
        <h3 className="text-2xl text-[#1565c0] px-2 flex items-center gap-3 italic">
          <Zap className="fill-current" /> ДОСТУПНЫЕ ДИСЦИПЛИНЫ
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {subjects.map((s) => (
            <div 
              key={s.id} 
              onClick={() => navigate(`/subject/${s.id}`)}
              className="relative group cursor-pointer bg-white rounded-[2.5rem] shadow-xl hover:shadow-blue-200 transition-all overflow-hidden h-64 border border-blue-50 hover:-translate-y-2"
            >
              {/* Используем цвет из БД или дефолтный */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color || 'from-blue-600 to-indigo-700'} opacity-90 group-hover:opacity-100 transition-opacity z-10`} />
              
              <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between text-white">
                <div className="bg-white/20 p-4 rounded-2xl w-fit backdrop-blur-md">
                  {iconMap[s.iconName] || <Layout size={24} />}
                </div>
                <div>
                  <h4 className="text-xl leading-tight mb-1 break-words font-black italic">{s.title}</h4>
                  <p className="text-[10px] opacity-70 tracking-widest font-black italic">
                    {s.sections.length} РАЗДЕЛОВ ДОСТУПНО
                  </p>
                </div>
              </div>
            </div>
          ))}

          {subjects.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30 text-xl border-4 border-dashed border-slate-200 rounded-[3rem] font-black italic">
              НЕТ ДОСТУПНЫХ ПРЕДМЕТОВ В БАЗЕ ДАННЫХ
            </div>
          )}
        </div>
      </div>
    </div>
  );
};