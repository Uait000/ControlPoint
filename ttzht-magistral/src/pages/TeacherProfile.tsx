import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, BarChart3, PieChart, Plus, Wifi, WifiOff, 
  XCircle, CheckCircle, Settings, ChevronDown, ChevronUp, ArrowUpRight, 
  Filter, FileText, Send, Edit2, Trash2, X, Camera, Save, RotateCcw 
} from 'lucide-react';

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
  ]
};

const initialHistory = [
  { group: "КС-2-1", subject: "Информатика", block: "1.1 Сети", excellent: 12, good: 8, satisfactory: 2, poor: 0, kq: 91, date: "15.01.2026", status: 'finished' },
  { group: "Р-1-1", subject: "Электротехника", block: "2.1 Цепи", excellent: 5, good: 15, satisfactory: 4, poor: 1, kq: 78, date: "14.01.2026", status: 'active' },
  { group: "КС-1-2", subject: "Математика", block: "3.2 Матрицы", excellent: 0, good: 0, satisfactory: 0, poor: 0, kq: 0, date: "---", status: 'draft' },
];

export const TeacherProfile = () => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'analytics' | 'management'>('monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupAnalytics, setSelectedGroupAnalytics] = useState<string>('all');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["КС-2-1"]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [teacher, setTeacher] = useState({ surname: "Прохоров", name: "Дмитрий", patronymic: "Семенович" });
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [publishStatus, setPublishStatus] = useState<'publish' | 'draft'>('draft');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 space-y-6 pb-20 text-sm font-bold antialiased">
      {/* HEADER ПРЕПОДАВАТЕЛЯ */}
      <div className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-xl border border-[#e1eefb] flex flex-col lg:flex-row items-center gap-8">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-900 rounded-[2.5rem] border-8 border-blue-50 overflow-hidden shadow-lg">
            {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry" alt="avatar" />}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-1">
            <Camera size={24} />
            <span className="text-[10px] uppercase">Обновить</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
        </div>
        
        <div className="text-center lg:text-left flex-1 w-full">
          <div className="inline-block bg-[#e3f2fd] text-[#1976d2] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 italic">Личный кабинет преподавателя</div>
          {isEditingProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">
              <input className="bg-slate-50 border-2 border-blue-100 rounded-xl px-4 py-2 font-black text-[#1565c0] w-full outline-none focus:border-[#1976d2]" value={teacher.surname} onChange={e=>setTeacher({...teacher, surname: e.target.value})} placeholder="Фамилия" />
              <input className="bg-slate-50 border-2 border-blue-100 rounded-xl px-4 py-2 font-black text-[#1565c0] w-full outline-none focus:border-[#1976d2]" value={teacher.name} onChange={e=>setTeacher({...teacher, name: e.target.value})} placeholder="Имя" />
              <input className="bg-slate-50 border-2 border-blue-100 rounded-xl px-4 py-2 font-black text-[#1565c0] w-full outline-none focus:border-[#1976d2]" value={teacher.patronymic} onChange={e=>setTeacher({...teacher, patronymic: e.target.value})} placeholder="Отчество" />
            </div>
          ) : (
            <h1 className="text-2xl sm:text-4xl font-black text-[#1565c0] uppercase italic tracking-tight leading-none mb-2">{teacher.surname} {teacher.name} {teacher.patronymic}</h1>
          )}
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">ТТЖТ • Учебная часть</p>
          <div className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start">
             <button onClick={() => setShowCreateModal(true)} className="bg-[#1976d2] text-white px-6 py-3 rounded-2xl font-black uppercase italic text-xs shadow-xl flex items-center gap-2 hover:bg-[#1565c0] transition-all"><Plus size={18}/> Создать тест</button>
             <button onClick={() => isEditingProfile ? setIsEditingProfile(false) : setIsEditingProfile(true)} className="bg-white border-2 border-[#e1eefb] text-slate-400 px-6 py-3 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 hover:border-[#1976d2] hover:text-[#1976d2] transition-all">
               {isEditingProfile ? <><Save size={18}/> Сохранить</> : <><Settings size={18}/> Настройки профиля</>}
             </button>
          </div>
        </div>
      </div>

      {/* ТАБЫ И ПОИСК */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-[#e1eefb] flex gap-1 w-full lg:w-auto overflow-x-auto">
          <TabBtn active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} icon={<Users size={18}/>} label="Мониторинг" />
          <TabBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={18}/>} label="Аналитика" />
          <TabBtn active={activeTab === 'management'} onClick={() => setActiveTab('management')} icon={<FileText size={18}/>} label="Архив" />
        </div>
        <div className="relative flex-1 lg:max-w-md w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" placeholder="Поиск по ФИО или группе..." className="w-full bg-white border-2 border-[#e1eefb] rounded-2xl py-4 pl-16 pr-6 font-bold outline-none focus:border-[#1976d2] transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* МОНИТОРИНГ */}
        {activeTab === 'monitoring' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {Object.keys(filteredMonitoring).map(group => (
              <div key={group} className="bg-white rounded-[2.5rem] shadow-xl border border-[#e1eefb] overflow-hidden">
                <div onClick={() => setExpandedGroups(p => p.includes(group) ? p.filter(g => g !== group) : [...p, group])} className="p-6 flex items-center justify-between cursor-pointer hover:bg-blue-50/50">
                  <div className="flex items-center gap-5">
                    <div className="bg-[#1565c0] text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black italic shadow-lg text-lg uppercase tracking-tighter">{group}</div>
                    <h4 className="text-xl font-black text-slate-800 uppercase italic">Группа {group}</h4>
                  </div>
                  {expandedGroups.includes(group) ? <ChevronUp size={28} className="text-[#1976d2]"/> : <ChevronDown size={28} className="text-slate-300"/>}
                </div>
                {expandedGroups.includes(group) && (
                  <div className="px-6 pb-6 border-t border-slate-50 overflow-x-auto uppercase italic">
                    <table className="w-full text-left mt-4 text-xs font-bold whitespace-nowrap">
                      <thead>
                        <tr className="text-slate-400 border-b italic">
                          <th className="pb-4 px-4 w-12 text-center">№</th>
                          <th className="pb-4 px-4">Студент</th>
                          <th className="pb-4 px-4">Прогресс</th>
                          <th className="pb-4 px-4">Статус</th>
                          <th className="pb-4 px-4 text-center">Оценка</th>
                          <th className="pb-4 px-4 text-right">Управление</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMonitoring[group].map((s: any, idx: number) => (
                          <tr key={s.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-all">
                            <td className="py-4 px-4 text-center text-slate-300">{(idx+1).toString().padStart(2, '0')}</td>
                            <td className="py-4 px-4 text-[#1565c0]">{s.name}</td>
                            <td className="py-4 px-4 w-40">
                               <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#1976d2]" style={{width: `${s.progress}%`}}/></div>
                                <span className="font-mono text-[10px]">{s.progress}%</span>
                               </div>
                            </td>
                            <td className="py-4 px-4">
                              {s.status === 'online' ? <span className="text-[#52b788] flex items-center gap-1"><Wifi size={14}/> В СЕТИ</span> : s.status === 'quit' ? <span className="text-[#ba181b] flex items-center gap-1 font-black"><XCircle size={14}/> ВЫШЕЛ</span> : <span className="text-[#ffb700] flex items-center gap-1 animate-pulse"><WifiOff size={14}/> ОБРЫВ</span>}
                            </td>
                            <td className="py-4 px-4 text-center">
                               <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white mx-auto shadow-md ${s.grade==='5'?'bg-[#52b788]':s.grade==='2'?'bg-[#ba181b]':s.grade==='4'?'bg-[#ffb700]':'bg-slate-200'}`}>{s.grade}</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                               {(s.status === 'quit' || s.status === 'offline') && <button className="bg-[#1976d2] text-white px-4 py-1.5 rounded-xl text-[10px] font-black italic shadow-lg hover:bg-[#1565c0]">РАЗРЕШИТЬ</button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* АНАЛИТИКА */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 italic uppercase">
            <div className="bg-slate-900 rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 relative z-10 gap-4">
                  <h3 className="text-xl font-black flex items-center gap-3 tracking-tighter leading-none"><PieChart className="text-orange-500" /> Аналитика КЗ: {selectedGroupAnalytics}</h3>
                  <select value={selectedGroupAnalytics} onChange={(e)=>setSelectedGroupAnalytics(e.target.value)} className="bg-white/10 border-2 border-white/10 rounded-xl px-4 py-2 font-black text-xs outline-none focus:border-orange-500 cursor-pointer">
                    <option value="all">Все группы ТТЖТ</option>
                    <option value="КС-2-1">КС-2-1</option>
                    <option value="Р-1-1">Р-1-1</option>
                  </select>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 font-black">
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-center flex flex-col justify-center">
                    <div className="text-[10px] text-slate-400 mb-2 italic tracking-widest uppercase opacity-60">Ср. Качество</div>
                    <div className="text-5xl text-orange-500 italic leading-none">85%</div>
                  </div>
                  <StatCard label="Отл (5)" value="27" color="text-[#52b788]" />
                  <StatCard label="Хор (4)" value="34" color="text-[#ffb700]" />
                  <StatCard label="Неуд (2)" value="1" color="text-[#ba181b]" />
               </div>
            </div>
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-[#e1eefb] overflow-hidden">
               <table className="w-full text-left font-black text-xs uppercase tracking-tight">
                <thead><tr className="text-slate-400 border-b italic uppercase font-black"><th className="pb-4 px-4 font-black">Дата</th><th className="pb-4 px-4">Группа</th><th className="pb-4 px-4">Предмет / Блок</th><th className="pb-4 text-right">Результат КЗ</th></tr></thead>
                <tbody className="divide-y divide-slate-50 italic">
                  {filteredHistory.filter(h=>h.status==='finished').map((h, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-all font-black">
                      <td className="py-6 px-4 text-slate-400 font-mono text-[11px]">{h.date}</td>
                      <td className="py-6 px-4 text-[#1565c0] text-sm">{h.group}</td>
                      <td className="py-6 px-4 leading-none"><div className="text-xs text-slate-700 font-black mb-1">{h.subject}</div><div className="text-[10px] text-slate-400 italic">{h.block}</div></td>
                      <td className="py-6 px-4 text-right"><span className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-sm font-black italic border border-orange-100">{h.kq}%</span></td>
                    </tr>
                  ))}
                </tbody>
               </table>
            </div>
          </motion.div>
        )}

        {/* АРХИВ КАТЕГОРИЙ */}
        {activeTab === 'management' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 italic uppercase font-black">
              <TestBox title="Активно" items={initialHistory.filter(h=>h.status==='active')} color="text-[#52b788]" />
              <TestBox title="Завершено" items={initialHistory.filter(h=>h.status==='finished')} color="text-slate-400" />
              <TestBox title="Черновики" items={initialHistory.filter(h=>h.status==='draft')} color="text-[#ffb700]" />
           </motion.div>
        )}
      </AnimatePresence>

      {/* КОНСТРУКТОР ТЕСТОВ */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
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
                    <label className="text-[11px] font-black text-slate-400 ml-2 italic tracking-widest">4. Кол-во вопросов (макс 20)</label>
                    <input type="number" max="20" min="1" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-4 font-black text-[#1565c0] outline-none focus:border-[#1976d2] text-base" defaultValue="10" />
                  </div>
                </div>

                <div className="bg-[#f8fbff] p-6 rounded-2xl border-2 border-[#e1eefb] space-y-4">
                   <p className="text-center text-[10px] font-black text-[#1976d2] tracking-[0.25em] italic underline underline-offset-8">Разбаловка системы ТТЖТ</p>
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

                <button className="w-full bg-[#1565c0] text-white py-6 rounded-[2.5rem] font-black italic tracking-widest shadow-2xl hover:bg-[#1976d2] transition-all active:scale-95 flex items-center justify-center gap-4 text-base">
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

// Вспомогательные элементы
const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-2xl font-black uppercase italic text-xs transition-all flex items-center gap-2 whitespace-nowrap ${active ? 'bg-[#1976d2] text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

const StatCard = ({ label, value, color }: any) => (
  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center flex flex-col justify-center">
    <div className="text-[10px] text-slate-400 mb-2 italic tracking-widest uppercase opacity-50">{label}</div>
    <div className={`text-4xl italic font-black ${color}`}>{value}</div>
  </div>
);

const TestBox = ({ title, items, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-[#e1eefb] space-y-4">
    <h4 className={`text-sm font-black italic underline underline-offset-8 px-2 tracking-widest ${color}`}>{title} ({items.length})</h4>
    <div className="space-y-3 pt-4 italic">
      {items.map((i:any, idx:number)=>(
        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-[#1976d2] transition-all">
           <div className="flex flex-col"><span className="text-[10px] text-slate-400 leading-none">{i.group}</span><span className="text-xs text-[#1565c0] font-black leading-tight mt-1">{i.subject}</span></div>
           <button className="text-slate-300 group-hover:text-[#1976d2]"><Edit2 size={16}/></button>
        </div>
      ))}
    </div>
  </div>
);

const SelectInp = ({ label, options }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-400 ml-2 tracking-widest italic uppercase">{label}</label>
    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-4 font-black text-[#1565c0] outline-none text-sm">
       {options.map((o:any)=><option key={o}>{o}</option>)}
    </select>
  </div>
);

const GradeInp = ({ color, label, def }: any) => (
  <div className="space-y-2 italic">
     <div style={{backgroundColor: color}} className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl text-lg shadow-black/5 leading-none">{label}</div>
     <input type="number" defaultValue={def} className="w-full bg-white border border-blue-100 rounded-xl text-center p-2 text-xs outline-none focus:border-[#1976d2] font-mono font-black" placeholder="Б" />
  </div>
);