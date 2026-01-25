import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, BarChart3, PieChart, Plus, Wifi, WifiOff, 
  XCircle, CheckCircle, Settings, ChevronDown, ChevronUp, ArrowUpRight, 
  Filter, FileText, Send, Edit2, Trash2, X, Camera, Save, RotateCcw 
} from 'lucide-react';

// --- БАЗА ДАННЫХ ДЛЯ МОНИТОРИНГА (ТЕКУЩИЕ ТЕСТЫ) ---
const monitoringDatabase: Record<string, any[]> = {
  "КС-2-1": [
    { id: '1', name: 'Александров Игорь Петрович', progress: 85, status: 'online', grade: '-' },
    { id: '2', name: 'Белов Максим Юрьевич', progress: 100, status: 'online', grade: '5' },
    { id: '3', name: 'Иванов Александр Викторович', progress: 30, status: 'offline', grade: '-' },
    { id: '4', name: 'Петров Сергей Александрович', progress: 12, status: 'quit', grade: '-' },
  ],
  "Р-1-1": [
    { id: '5', name: 'Сидоров Дмитрий Константинович', progress: 100, status: 'online', grade: '4' },
    { id: '6', name: 'Зайцев Олег Игоревич', progress: 5, status: 'offline', grade: '-' },
    { id: '7', name: 'Червякова Татьяна Тимофеевна', progress: 0, status: 'quit', grade: '-' },
  ]
};

// --- БАЗА ДАННЫХ ДЛЯ АНАЛИТИКИ (ИСТОРИЯ) ---
const initialHistory = [
  { group: "КС-2-1", subject: "ИНФОРМАТИКА", block: "1.1 СЕТИ", excellent: 12, good: 8, satisfactory: 2, poor: 0, kq: 91, date: "15.01.2026", status: 'finished' },
  { group: "Р-1-1", subject: "ЭЛЕКТРОТЕХНИКА", block: "2.1 ЦЕПИ", excellent: 5, good: 15, satisfactory: 4, poor: 1, kq: 78, date: "14.01.2026", status: 'active' },
  { group: "КС-1-2", subject: "МАТЕМАТИКА", block: "3.2 МАТРИЦЫ", excellent: 10, good: 10, satisfactory: 5, poor: 0, kq: 80, date: "12.01.2026", status: 'draft' },
];

export const TeacherProfile = () => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'analytics' | 'management'>('monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupAnalytics, setSelectedGroupAnalytics] = useState<string>('all');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["КС-2-1"]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Состояния профиля преподавателя
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [teacher, setTeacher] = useState({ surname: "Прохоров", name: "Дмитрий", patronymic: "Семенович" });
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [publishStatus, setPublishStatus] = useState<'publish' | 'draft'>('draft');

  // Логика загрузки аватарки
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ФУНКЦИОНАЛЬНЫЙ ПОИСК
  const filteredMonitoring = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const result: any = {};
    Object.keys(monitoringDatabase).forEach(group => {
      const students = monitoringDatabase[group].filter(s => 
        s.name.toLowerCase().includes(query) || group.toLowerCase().includes(query)
      );
      if (students.length > 0) result[group] = students.sort((a, b) => a.name.localeCompare(b.name));
    });
    return result;
  }, [searchQuery]);

  const filteredHistory = useMemo(() => {
    return initialHistory.filter(h => 
      h.group.toLowerCase().includes(searchQuery.toLowerCase()) || 
      h.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // АВТОМАТИЧЕСКИЙ РАСЧЕТ АНАЛИТИКИ
  const calculatedStats = useMemo(() => {
    const filtered = selectedGroupAnalytics === 'all' ? initialHistory : initialHistory.filter(d => d.group === selectedGroupAnalytics);
    return filtered.reduce((acc, curr) => ({
      excellent: acc.excellent + curr.excellent,
      good: acc.good + curr.good,
      satisfactory: acc.satisfactory + curr.satisfactory,
      poor: acc.poor + curr.poor,
      totalKq: acc.totalKq + curr.kq,
      count: acc.count + 1
    }), { excellent: 0, good: 0, satisfactory: 0, poor: 0, totalKq: 0, count: 0 });
  }, [selectedGroupAnalytics]);

  const avgKq = calculatedStats.count > 0 ? Math.round(calculatedStats.totalKq / calculatedStats.count) : 0;

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 space-y-6 pb-20 text-sm font-bold antialiased">
      {/* HEADER ПРЕПОДАВАТЕЛЯ (АДАПТИВНЫЙ) */}
      <div className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-xl border border-[#e1eefb] flex flex-col lg:flex-row items-center gap-8 lg:items-start">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-900 rounded-[2.5rem] border-8 border-blue-50 overflow-hidden shadow-lg transition-transform group-hover:scale-[1.02]">
            {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry" alt="avatar" />}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-1 uppercase text-[10px] font-black">
            <Camera size={24} /> ГАЛЕРЕЯ
          </button>
          <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
        </div>
        
        <div className="text-center lg:text-left flex-1 w-full uppercase italic">
          <div className="inline-block bg-[#e3f2fd] text-[#1976d2] px-4 py-1 rounded-full text-xs font-black tracking-widest mb-4 leading-none">Личный кабинет преподавателя</div>
          
          {isEditingProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mb-4">
              <div className="space-y-1 text-left"><label className="text-[10px] text-slate-400 ml-2">ФАМИЛИЯ</label><input className="bg-slate-50 border-2 border-blue-100 rounded-xl px-4 py-2 font-black text-[#1565c0] w-full outline-none focus:border-[#1976d2]" value={teacher.surname} onChange={e=>setTeacher({...teacher, surname: e.target.value.toUpperCase()})} /></div>
              <div className="space-y-1 text-left"><label className="text-[10px] text-slate-400 ml-2">ИМЯ</label><input className="bg-slate-50 border-2 border-blue-100 rounded-xl px-4 py-2 font-black text-[#1565c0] w-full outline-none focus:border-[#1976d2]" value={teacher.name} onChange={e=>setTeacher({...teacher, name: e.target.value.toUpperCase()})} /></div>
              <div className="space-y-1 text-left"><label className="text-[10px] text-slate-400 ml-2">ОТЧЕСТВО</label><input className="bg-slate-50 border-2 border-blue-100 rounded-xl px-4 py-2 font-black text-[#1565c0] w-full outline-none focus:border-[#1976d2]" value={teacher.patronymic} onChange={e=>setTeacher({...teacher, patronymic: e.target.value.toUpperCase()})} /></div>
            </div>
          ) : (
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1565c0] leading-none mb-3 tracking-tighter break-words overflow-hidden">
              {teacher.surname} {teacher.name} {teacher.patronymic}
            </h1>
          )}
          
          <p className="text-slate-400 font-bold text-xs sm:text-sm tracking-widest leading-none">Тихорецкий техникум железнодорожного транспорта</p>
          
          <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
             <button onClick={() => setShowCreateModal(true)} className="bg-[#1976d2] text-white px-6 py-3 rounded-2xl font-black uppercase italic text-xs shadow-xl flex items-center gap-2 hover:bg-[#1565c0] transition-all"><Plus size={20}/> СОЗДАТЬ ТЕСТ</button>
             <button onClick={() => isEditingProfile ? setIsEditingProfile(false) : setIsEditingProfile(true)} className="bg-white border-2 border-[#e1eefb] text-slate-400 px-6 py-3 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 hover:border-[#1976d2] hover:text-[#1976d2] transition-all shadow-sm">
               {isEditingProfile ? <><Save size={18}/> СОХРАНИТЬ</> : <><Settings size={18}/> РЕДАКТИРОВАТЬ</>}
             </button>
          </div>
        </div>
      </div>

      {/* ТАБЫ И ПОИСК */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-[#e1eefb] flex gap-1 w-full lg:w-auto overflow-x-auto font-black italic text-xs">
          <TabBtn active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} icon={<Users size={18}/>} label="МОНИТОРИНГ" />
          <TabBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={18}/>} label="АНАЛИТИКА" />
          <TabBtn active={activeTab === 'management'} onClick={() => setActiveTab('management')} icon={<FileText size={18}/>} label="АРХИВ ТЕСТОВ" />
        </div>
        <div className="relative flex-1 lg:max-w-md w-full font-black italic">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" placeholder="ПОИСК СТУДЕНТА ИЛИ ГРУППЫ..." className="w-full bg-white border-2 border-[#e1eefb] rounded-2xl py-4 pl-16 pr-6 font-bold outline-none focus:border-[#1976d2] transition-all text-sm uppercase tracking-tight" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* МОНИТОРИНГ */}
        {activeTab === 'monitoring' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 uppercase italic font-black">
            {Object.keys(filteredMonitoring).map(group => (
              <div key={group} className="bg-white rounded-[2.5rem] shadow-xl border border-[#e1eefb] overflow-hidden transition-all">
                <div onClick={() => setExpandedGroups(p => p.includes(group) ? p.filter(g => g !== group) : [...p, group])} className="p-6 flex items-center justify-between cursor-pointer hover:bg-blue-50/50">
                  <div className="flex items-center gap-5">
                    <div className="bg-[#1565c0] text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black italic shadow-lg text-lg uppercase tracking-tighter shrink-0">{group}</div>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">ГРУППА {group}</h4>
                  </div>
                  {expandedGroups.includes(group) ? <ChevronUp size={28} className="text-[#1976d2]"/> : <ChevronDown size={28} className="text-slate-300"/>}
                </div>
                {expandedGroups.includes(group) && (
                  <div className="px-6 pb-6 border-t border-slate-50 overflow-x-auto">
                    <table className="w-full text-left mt-4 text-[11px] font-black tracking-tight whitespace-nowrap leading-none uppercase italic">
                      <thead><tr className="text-slate-400 border-b italic uppercase font-black"><th className="pb-4 px-4 w-12 text-center italic">№</th><th className="pb-4 px-4">СТУДЕНТ</th><th className="pb-4 px-4">ПРОГРЕСС</th><th className="pb-4 px-4">СТАТУС</th><th className="pb-4 px-4 text-center italic">ОЦЕНКА</th><th className="pb-4 px-4 text-right">УПРАВЛЕНИЕ</th></tr></thead>
                      <tbody>{filteredMonitoring[group].map((s: any, idx: number) => (
                          <tr key={s.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-all leading-none">
                            <td className="py-5 px-4 text-center text-slate-300 italic">{(idx+1).toString().padStart(2, '0')}</td>
                            <td className="py-5 px-4 text-[#1565c0] font-black text-xs leading-none whitespace-nowrap">{s.name}</td>
                            <td className="py-5 px-4 w-40 italic leading-none">
                               <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#1976d2] transition-all duration-1000" style={{width: `${s.progress}%`}}/></div>
                                <span className="font-mono text-[10px] leading-none">{s.progress}%</span>
                               </div>
                            </td>
                            <td className="py-5 px-4 italic tracking-widest text-[10px] leading-none">
                              {s.status === 'online' ? <span className="text-[#52b788] flex items-center gap-1"><Wifi size={14}/> СЕТЬ ОК</span> : s.status === 'quit' ? <span className="text-[#ba181b] flex items-center gap-1 font-black leading-none"><XCircle size={14}/> ВЫШЕЛ</span> : <span className="text-[#ffb700] flex items-center gap-1 animate-pulse leading-none"><WifiOff size={14}/> ОБРЫВ</span>}
                            </td>
                            <td className="py-5 px-4 text-center leading-none">
                               <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white mx-auto shadow-md transition-transform hover:scale-110 ${s.grade==='5'?'bg-[#52b788]':s.grade==='2'?'bg-[#ba181b]':s.grade==='4'?'bg-[#ffb700]':s.grade==='3'?'bg-[#f4d35e]':'bg-slate-200 shadow-none'}`}>{s.grade}</span>
                            </td>
                            <td className="py-5 px-4 text-right whitespace-nowrap leading-none">
                               {(s.status === 'quit' || s.status === 'offline') && <button className="bg-[#1976d2] text-white px-3 py-1.5 rounded-xl text-[9px] font-black italic shadow-lg hover:bg-[#1565c0] flex items-center gap-1 mx-auto leading-none">РАЗРЕШИТЬ <RotateCcw size={10}/></button>}
                            </td>
                          </tr>
                        ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* АНАЛИТИКА (СВЕТЛЫЙ БАНЕР И ТРОЙКИ) */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 italic uppercase font-black">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-blue-50 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-[#1976d2]/5 blur-[120px] rounded-full" />
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 relative z-10 gap-4">
                  <h3 className="text-xl sm:text-2xl font-black flex items-center gap-3 tracking-tighter leading-none text-[#1565c0]"><PieChart className="text-orange-500" /> АНАЛИТИКА КЗ: {selectedGroupAnalytics}</h3>
                  <select value={selectedGroupAnalytics} onChange={(e)=>setSelectedGroupAnalytics(e.target.value)} className="bg-[#f0f7ff] border-2 border-[#1976d2]/20 rounded-xl px-4 py-2 font-black text-xs outline-none focus:border-orange-500 cursor-pointer text-[#1565c0] italic">
                    <option value="all">ВСЕ ГРУППЫ ТТЖТ</option><option value="КС-2-1">КС-2-1</option><option value="Р-1-1">Р-1-1</option>
                  </select>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10 font-black tracking-tight text-center">
                  <div className="bg-[#1565c0] p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-center border-b-8 border-[#1976d2]">
                    <div className="text-[10px] text-white/60 mb-2 italic tracking-widest uppercase">КАЧЕСТВО</div>
                    <div className="text-5xl text-white italic leading-none">{avgKq}%</div>
                  </div>
                  <StatCard label="ОТЛИЧНО (5)" value={calculatedStats.excellent} color="text-[#52b788]" />
                  <StatCard label="ХОРОШО (4)" value={calculatedStats.good} color="text-[#ffb700]" />
                  <StatCard label="УДОВЛ. (3)" value={calculatedStats.satisfactory} color="text-[#f4d35e]" />
                  <StatCard label="НЕУД. (2)" value={calculatedStats.poor} color="text-[#ba181b]" />
               </div>
            </div>
            {/* ТАБЛИЦА С ВЫСОКИМ КОНТРАСТОМ */}
            <div className="bg-white rounded-[3.5rem] p-8 shadow-xl border border-[#e1eefb] overflow-hidden">
               <h3 className="text-xl text-[#1565c0] mb-8 px-4 italic underline underline-offset-8 decoration-4 decoration-[#1976d2] font-black">ИСТОРИЯ ЗАВЕРШЕННЫХ ТЕСТИРОВАНИЙ</h3>
               <div className="overflow-x-auto px-4 uppercase italic">
                  <table className="w-full text-left font-black tracking-tighter leading-none italic uppercase">
                    <thead><tr className="text-sm text-slate-900 border-b-2 border-slate-100 uppercase tracking-widest italic font-black"><th className="pb-6">ДАТА</th><th className="pb-6">ГРУППА</th><th className="pb-6">ДИСЦИПЛИНА / БЛОК ТЕМЫ</th><th className="pb-6 text-right">РЕЗУЛЬТАТ (КЗ%)</th></tr></thead>
                    <tbody className="divide-y divide-slate-100 font-black italic uppercase text-slate-800">
                      {filteredHistory.filter(h=>h.status==='finished').map((h, i) => (
                        <tr key={i} className="group hover:bg-blue-50 transition-all font-black">
                          <td className="py-6 px-4 text-slate-500 font-mono text-sm leading-none italic uppercase">{h.date}</td>
                          <td className="py-6 px-4 text-[#1565c0] text-lg font-black leading-none italic uppercase">{h.group}</td>
                          <td className="py-6 px-4 leading-none italic uppercase"><div className="text-base text-slate-900 font-black mb-1 leading-none uppercase italic">{h.subject}</div><div className="text-xs text-slate-400 font-black tracking-tighter opacity-80 uppercase italic">{h.block}</div></td>
                          <td className="py-6 px-4 text-right leading-none uppercase italic"><span className="bg-orange-50 text-orange-600 px-5 py-2 rounded-2xl text-lg font-black border-2 border-orange-100 shadow-sm italic uppercase">{h.kq}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </motion.div>
        )}

        {/* АРХИВ */}
        {activeTab === 'management' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 italic uppercase font-black">
              <TestBox title="АКТИВНО" items={initialHistory.filter(h=>h.status==='active')} color="text-[#52b788]" />
              <TestBox title="ЗАВЕРШЕНО" items={initialHistory.filter(h=>h.status==='finished')} color="text-slate-400" />
              <TestBox title="ЧЕРНОВИКИ" items={initialHistory.filter(h=>h.status==='draft')} color="text-[#ffb700]" />
           </motion.div>
        )}
      </AnimatePresence>

      {/* МОДАЛЬНОЕ ОКНО КОНСТРУКТОРА */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-6 sm:p-10 relative max-h-[95vh] overflow-y-auto italic uppercase font-black">
              <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><X size={32}/></button>
              
              <div className="text-center mb-8">
                 <h3 className="text-2xl sm:text-3xl font-black text-[#1565c0] tracking-tighter italic leading-none">Конструктор тестирования</h3>
                 <p className="text-slate-400 font-bold text-[10px] mt-2 tracking-widest italic underline underline-offset-4">Учебная часть ТТЖТ</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SelectInp label="1. Предмет" options={['Информатика', 'Электротехника', 'КСК']} />
                  <SelectInp label="2. Раздел" options={['1.1 Сети', '1.2 Железо', '2.1 Алгоритмы']} />
                  <SelectInp label="3. Группа" options={['КС-2-1', 'Р-1-1', 'КС-1-2']} />
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-400 ml-2 italic tracking-widest uppercase">4. Кол-во вопросов (макс 20)</label>
                    <input type="number" max="20" min="1" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-4 font-black text-[#1565c0] outline-none focus:border-[#1976d2] text-base" defaultValue="10" />
                  </div>
                </div>

                <div className="bg-[#f8fbff] p-6 rounded-2xl border-2 border-[#e1eefb] space-y-4">
                   <p className="text-center text-[10px] font-black text-[#1976d2] tracking-[0.25em] italic underline underline-offset-8 leading-none uppercase">Разбаловка системы ТТЖТ</p>
                   <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center font-black">
                      <GradeInp color="#52b788" label="5" def="90" />
                      <GradeInp color="#ffb700" label="4" def="75" />
                      <GradeInp color="#f4d35e" label="3" def="50" />
                      <GradeInp color="#ba181b" label="2" def="0" />
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row bg-slate-100 p-1.5 rounded-2xl gap-2 border-2 border-slate-50">
                   <button onClick={()=>setPublishStatus('active')} className={`flex-1 py-4 rounded-xl font-black italic text-[11px] transition-all ${publishStatus==='active' ? 'bg-[#1976d2] text-white shadow-xl scale-[1.02]' : 'text-slate-400'}`}>Опубликовать всей группе</button>
                   <button onClick={()=>setPublishStatus('draft')} className={`flex-1 py-4 rounded-xl font-black italic text-[11px] transition-all ${publishStatus==='draft' ? 'bg-[#1976d2] text-white shadow-xl scale-[1.02]' : 'text-slate-400'}`}>В черновики</button>
                </div>

                <button className="w-full bg-[#1565c0] text-white py-6 rounded-[2rem] font-black italic tracking-widest shadow-2xl hover:bg-[#1976d2] transition-all active:scale-95 flex items-center justify-center gap-4 text-base">
                  <Send size={24}/> Сгенерировать через ИИ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---
const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-6 py-4 rounded-3xl font-black uppercase italic text-xs transition-all flex items-center gap-3 whitespace-nowrap shadow-sm ${active ? 'bg-[#1976d2] text-white shadow-lg shadow-[#1976d2]/30' : 'text-slate-400 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

const StatCard = ({ label, value, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border-2 border-blue-50 text-center flex flex-col justify-center shadow-lg hover:shadow-xl transition-all">
    <div className="text-[10px] text-slate-400 mb-2 italic tracking-widest uppercase opacity-80">{label}</div>
    <div className={`text-4xl italic font-black ${color}`}>{value}</div>
  </div>
);

const TestBox = ({ title, items, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-[#e1eefb] space-y-4">
    <h4 className={`text-sm font-black italic underline underline-offset-8 px-2 tracking-widest ${color}`}>{title} ({items.length})</h4>
    <div className="space-y-3 pt-4 italic">
      {items.map((i:any, idx:number)=>(
        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-[#1976d2] transition-all">
           <div className="flex flex-col"><span className="text-[10px] text-slate-400 leading-none uppercase font-bold">{i.group}</span><span className="text-xs text-[#1565c0] font-black leading-tight mt-1">{i.subject}</span></div>
           <button className="text-slate-300 group-hover:text-[#1976d2]"><Edit2 size={16}/></button>
        </div>
      ))}
    </div>
  </div>
);

const SelectInp = ({ label, options }: any) => (
  <div className="space-y-2 italic uppercase">
    <label className="text-[11px] font-black text-slate-400 ml-2 tracking-widest italic uppercase">{label}</label>
    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-4 font-black text-[#1565c0] outline-none text-sm appearance-none cursor-pointer hover:bg-white">
       {options.map((o:any)=><option key={o}>{o}</option>)}
    </select>
  </div>
);

const GradeInp = ({ color, label, def }: any) => (
  <div className="space-y-2 italic font-black">
     <div style={{backgroundColor: color}} className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl text-lg shadow-black/5 leading-none">{label}</div>
     <input type="number" defaultValue={def} className="w-full bg-white border border-blue-100 rounded-xl text-center p-2 text-xs outline-none focus:border-[#1976d2] font-mono font-black shadow-inner" placeholder="Б" />
  </div>
);