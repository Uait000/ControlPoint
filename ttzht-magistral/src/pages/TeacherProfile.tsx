import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, BarChart3, PieChart, 
  Wifi, WifiOff, XCircle, CheckCircle, 
  Settings, ChevronDown, ChevronUp, ArrowUpRight, Filter, PlayCircle
} from 'lucide-react';

// --- БАЗА ДАННЫХ ДЛЯ МОНИТОРИНГА (ТЕКУЩИЕ ТЕСТЫ) ---
const monitoringDatabase: Record<string, any[]> = {
  "КС-2-1": [
    { id: '1', name: 'Иванов Александр Викторович', progress: 85, status: 'online', needsApproval: false },
    { id: '2', name: 'Петров Сергей Александрович', progress: 30, status: 'offline', needsApproval: true },
    { id: '3', name: 'Сидоров Дмитрий Константинович', progress: 100, status: 'quit', needsApproval: false },
  ],
  "Р-2-1": [
    { id: '4', name: 'Кузнецов Артем Игоревич', progress: 45, status: 'online', needsApproval: false },
    { id: '5', name: 'Смирнова Елена Павловна', progress: 12, status: 'online', needsApproval: false },
  ],
  "Р-1-1": [
    { id: '6', name: 'Белов Максим Сергеевич', progress: 0, status: 'offline', needsApproval: false },
  ]
};

// --- БАЗА ДАННЫХ ДЛЯ АНАЛИТИКИ (ИСТОРИЯ) ---
const allTestsHistory = [
  { group: "КС-2-1", subject: "Информатика", block: "1.1 Сети", excellent: 12, good: 8, satisfactory: 2, poor: 0, kq: 91, date: "15.01.2026" },
  { group: "КС-2-1", subject: "Основы алгоритмизации", block: "2.3 Циклы", excellent: 10, good: 10, satisfactory: 1, poor: 1, kq: 88, date: "10.01.2026" },
  { group: "Р-2-1", subject: "Информатика", block: "1.1 Сети", excellent: 5, good: 15, satisfactory: 4, poor: 1, kq: 78, date: "14.01.2026" },
  { group: "Р-1-1", subject: "Информатика", block: "1.1 Сети", excellent: 10, good: 10, satisfactory: 5, poor: 0, kq: 80, date: "12.01.2026" },
];

export const TeacherProfile = () => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'analytics'>('monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupAnalytics, setSelectedGroupAnalytics] = useState<string>('all');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["КС-2-1"]);
  const [roomCode, setRoomCode] = useState('DVJ3K');

  // --- ЛОГИКА АНАЛИТИКИ (АВТО-РАСЧЕТ) ---
  const calculatedStats = useMemo(() => {
    const filtered = selectedGroupAnalytics === 'all' 
      ? allTestsHistory 
      : allTestsHistory.filter(d => d.group === selectedGroupAnalytics);

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

  // --- ЛОГИКА МОНИТОРИНГА (ФИЛЬТР ГРУПП) ---
  const filteredMonitoringGroups = Object.keys(monitoringDatabase).filter(name => 
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl space-y-8">
      
      {/* ХЕДЕР ПРОФИЛЯ */}
      <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col lg:flex-row items-center gap-8">
        <div className="relative shrink-0">
          <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-orange-100">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry" alt="Avatar" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-2 rounded-xl border-4 border-white shadow-lg">
            <CheckCircle size={18} />
          </div>
        </div>
        
        <div className="text-center lg:text-left flex-1">
          <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3">
            Преподаватель ТТЖТ
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 uppercase italic tracking-tighter leading-none mb-2">
            Дмитрий Семенович Прохоров
          </h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">Тихорецкий техникум железнодорожного транспорта</p>
        </div>

        {/* ПАНЕЛЬ КОДА */}
        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-center min-w-[200px] shadow-2xl">
           <div className="text-[9px] font-black text-slate-500 uppercase mb-2">Код теста</div>
           <div className="text-3xl font-black text-orange-500 tracking-widest mb-4 italic">{roomCode}</div>
           <button onClick={() => setRoomCode(Math.random().toString(36).substring(2, 7).toUpperCase())} className="text-white hover:text-orange-400 transition-colors"><PlayCircle size={24}/></button>
        </div>
      </div>

      {/* УПРАВЛЕНИЕ: ТАБЫ И ПОИСК */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex gap-1">
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`px-8 py-3 rounded-[1.5rem] font-black uppercase italic text-[10px] transition-all flex items-center gap-2
            ${activeTab === 'monitoring' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Users size={18} /> Мониторинг
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-8 py-3 rounded-[1.5rem] font-black uppercase italic text-[10px] transition-all flex items-center gap-2
            ${activeTab === 'analytics' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <BarChart3 size={18} /> Аналитика
          </button>
        </div>

        <div className="flex gap-4">
          {activeTab === 'analytics' && (
            <div className="bg-white px-4 py-2 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select 
                value={selectedGroupAnalytics}
                onChange={(e) => setSelectedGroupAnalytics(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase italic outline-none cursor-pointer"
              >
                <option value="all">Все группы</option>
                <option value="КС-2-1">КС-2-1</option>
                <option value="Р-2-1">Р-2-1</option>
                <option value="Р-1-1">Р-1-1</option>
              </select>
            </div>
          )}
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск..."
              className="w-full bg-white border border-slate-200 rounded-[1.5rem] py-3 pl-12 pr-4 text-[10px] font-bold outline-none focus:border-orange-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ВКЛАДКА: МОНИТОРИНГ (ЖИВОЙ ПРОГРЕСС) */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          {filteredMonitoringGroups.map((group) => (
            <div key={group} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div 
                onClick={() => setExpandedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group])}
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black italic shadow-lg">
                    {group}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-800 uppercase italic">Группа {group}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Тест: Информатика (Блок 1.1)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="hidden sm:flex gap-2">
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Online: {monitoringDatabase[group].filter(s => s.status === 'online').length}</span>
                      {monitoringDatabase[group].some(s => s.status === 'offline') && <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase animate-pulse">Обрыв сети!</span>}
                   </div>
                   {expandedGroups.includes(group) ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </div>
              </div>

              <AnimatePresence>
                {expandedGroups.includes(group) && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-6 overflow-hidden">
                    <div className="grid gap-3 pt-4 border-t border-slate-50">
                      {monitoringDatabase[group].map((student) => (
                        <div key={student.id} className="bg-slate-50 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100">
                          <div className="flex items-center gap-4 w-full md:w-1/3">
                            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 overflow-hidden shrink-0">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt="av" />
                            </div>
                            <div className="truncate">
                               <div className="font-black text-slate-800 text-xs uppercase italic truncate">{student.name}</div>
                               <div className="flex items-center gap-2 mt-1">
                                  {student.status === 'online' ? (
                                    <span className="text-green-500 flex items-center gap-1 text-[8px] font-black uppercase"><Wifi size={10}/> Стабильно</span>
                                  ) : student.status === 'offline' ? (
                                    <span className="text-red-500 flex items-center gap-1 text-[8px] font-black uppercase"><WifiOff size={10}/> Обрыв связи</span>
                                  ) : (
                                    <span className="text-slate-400 flex items-center gap-1 text-[8px] font-black uppercase"><XCircle size={10}/> Вышел</span>
                                  )}
                               </div>
                            </div>
                          </div>
                          
                          <div className="flex-1 w-full">
                             <div className="flex justify-between text-[8px] font-black uppercase mb-1 text-slate-400 tracking-widest">
                                <span>Прогресс выполнения</span>
                                <span>{student.progress}%</span>
                             </div>
                             <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${student.progress}%` }} className={`h-full ${student.progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`} />
                             </div>
                          </div>

                          <div className="min-w-[140px] flex justify-end">
                            {student.needsApproval ? (
                              <button className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase italic shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Разрешить</button>
                            ) : (
                              <div className="text-green-500 flex items-center gap-1 font-black uppercase text-[9px] italic tracking-tighter"><CheckCircle size={14}/> Проходит тест</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* ВКЛАДКА: АНАЛИТИКА (ОТЧЕТЫ) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full" />
            <h3 className="text-2xl font-black uppercase italic mb-10 flex items-center gap-3 relative z-10">
              <PieChart className="text-orange-500" /> {selectedGroupAnalytics === 'all' ? 'Сводный отчет ТТЖТ' : `Аналитика: ${selectedGroupAnalytics}`}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col justify-center text-center">
                <div className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Качество знаний (КЗ)</div>
                <div className="text-6xl font-black text-orange-500 italic leading-none">{avgKq}%</div>
                <div className="mt-4 text-[9px] text-green-400 font-bold flex items-center justify-center gap-1 uppercase tracking-widest">
                  <ArrowUpRight size={14}/> +4.2% Рост
                </div>
              </div>

              <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Отлично (5)" value={calculatedStats.excellent} color="text-green-400" />
                <StatCard label="Хорошо (4)" value={calculatedStats.good} color="text-blue-400" />
                <StatCard label="Удовл. (3)" value={calculatedStats.satisfactory} color="text-yellow-400" />
                <StatCard label="Неуд. (2)" value={calculatedStats.poor} color="text-red-400" />
              </div>
            </div>
          </motion.div>

          {/* ТАБЛИЦА ИСТОРИИ */}
          <div className="bg-white rounded-[3.5rem] p-8 shadow-xl border border-slate-100 overflow-hidden">
            <h3 className="text-xl font-black uppercase italic text-slate-800 mb-6 px-4 italic">Пройденные тестирования</h3>
            <div className="overflow-x-auto px-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black uppercase text-slate-400 border-b border-slate-100">
                    <th className="pb-5">Дата</th>
                    <th className="pb-5">Группа</th>
                    <th className="pb-5">Блок тем</th>
                    <th className="pb-5">Результаты</th>
                    <th className="pb-5 text-right">КЗ (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold">
                  {allTestsHistory.filter(d => selectedGroupAnalytics === 'all' || d.group === selectedGroupAnalytics).map((stat, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-6 text-[10px] text-slate-400 font-mono tracking-tighter">{stat.date}</td>
                      <td className="py-6 text-slate-800 uppercase italic text-sm">{stat.group}</td>
                      <td className="py-6">
                        <div className="text-xs font-black text-slate-800 uppercase leading-none mb-1">{stat.subject}</div>
                        <div className="text-[8px] text-slate-400 uppercase tracking-tighter">{stat.block}</div>
                      </td>
                      <td className="py-6">
                        <div className="flex gap-2 text-[10px] font-mono">
                          <span className="text-green-500">5:{stat.excellent}</span>
                          <span className="text-blue-500">4:{stat.good}</span>
                          <span className="text-yellow-600">3:{stat.satisfactory}</span>
                          <span className="text-red-500">2:{stat.poor}</span>
                        </div>
                      </td>
                      <td className="py-6 text-right">
                        <span className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-black italic border border-orange-100 shadow-sm">
                          {stat.kq}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }: any) => (
  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center flex flex-col justify-center transition-transform hover:scale-105">
    <div className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest">{label}</div>
    <div className={`text-4xl font-black ${color} italic leading-none`}>{value}</div>
  </div>
);