import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Wifi, ChevronDown, X, Activity, 
  FileCheck, HelpCircle, Database, LayoutGrid, CheckCircle2
} from 'lucide-react';
import type { Subject, Group } from '../types';

export const TeacherProfile = () => {
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [courses, setCourses] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  
  const [selSub, setSelSub] = useState('');
  const [selPoolId, setSelPoolId] = useState(''); 
  const [selGrp, setSelGrp] = useState('');
  const [questionCount, setQuestionCount] = useState(15);

  const ws = useRef<WebSocket | null>(null);
  const headers = { 
    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
    'Content-Type': 'application/json' 
  };

  const [liveMonitor, setLiveMonitor] = useState<Record<number, any>>({});

  useEffect(() => {
    fetch('/storage/courses', { headers }).then(r => r.json()).then(data => setCourses(Array.isArray(data) ? data : []));
    fetch('/groups', { headers }).then(r => r.json()).then(data => setGroups(Array.isArray(data) ? data : []));
    fetch('/tests/available', { headers }).then(r => r.json()).then(data => setAvailableTests(Array.isArray(data) ? data : []));
    fetch('/auth/students', { headers }).then(r => r.json()).then(data => setStudents(Array.isArray(data) ? data : []));

    const connectWS = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws.current = new WebSocket(`${protocol}//${window.location.host}/test/ws/monitor`);
        
        ws.current.onmessage = (e) => {
            const parts = e.data.split(':');
            if (parts.length >= 3) {
                const [type, sId, value] = parts;
                setLiveMonitor(prev => ({ ...prev, [sId]: { ...prev[sId], [type]: value } }));
            }
        };
        ws.current.onclose = () => setTimeout(connectWS, 3000);
    };
    connectWS();
    return () => ws.current?.close();
  }, []);

  const filteredPools = useMemo(() => {
    if (!selSub) return [];
    return availableTests.filter(t => String(t.belongs_to) === String(selSub));
  }, [availableTests, selSub]);

  const handleAssignTest = async () => {
    if (!selPoolId || !selGrp) return alert("ОШИБКА: ПУЛ ИЛИ ГРУППА НЕ ВЫБРАНЫ");
    
    const res = await fetch('/tests/assign', {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        test_id: Number(selPoolId), 
        group_id: parseInt(selGrp),
        question_count: questionCount 
      })
    });

    if (res.ok) {
      alert(`ТЕСТ УСПЕШНО НАЗНАЧЕН! (Вопросов: ${questionCount})`);
      setShowCreateModal(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-20 text-sm font-bold antialiased italic uppercase text-slate-700">
      
      <div className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-xl border border-[#e1eefb] flex flex-col lg:flex-row items-center gap-8">
        <div className="relative">
          <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] border-8 border-blue-50 overflow-hidden shadow-2xl">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher`} alt="avatar" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 p-3 rounded-2xl text-white shadow-lg border-4 border-white">
            <Wifi size={20} className={ws.current?.readyState === 1 ? "animate-pulse" : "opacity-30"} />
          </div>
        </div>
        <div className="text-center lg:text-left flex-1">
          <div className="inline-block bg-[#e3f2fd] text-[#1976d2] px-4 py-1 rounded-full text-[10px] font-black mb-4">ТТЖТ • КОНТРОЛЬ</div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1565c0] tracking-tighter mb-2 italic">ПУЛЬТ ПРЕПОДАВАТЕЛЯ</h1>
          <button onClick={() => setShowCreateModal(true)} className="mt-4 bg-[#1976d2] text-white px-8 py-4 rounded-2xl shadow-xl flex items-center gap-2 hover:bg-[#1565c0] active:scale-95 transition-all"><Plus size={20}/> НАЗНАЧИТЬ ТЕСТ</button>
        </div>
      </div>

      <div className="grid gap-6">
        {groups.map(group => (
          <div key={`group-card-${group.id}`} className="bg-white rounded-[2.5rem] shadow-lg border border-blue-50 overflow-hidden">
            <div className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setExpandedGroups(p => p.includes(group.id) ? p.filter(id => id !== group.id) : [...p, group.id])}>
              <div className="flex items-center gap-4">
                 <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-md"><Users size={20}/></div>
                 <span className="text-xl font-black italic">ГРУППА {group.name}-{group.course}-{group.number}</span>
              </div>
              <ChevronDown className={`transition-transform duration-300 ${expandedGroups.includes(group.id) ? 'rotate-180' : ''}`} />
            </div>
            
            <AnimatePresence>
              {expandedGroups.includes(group.id) && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-6 border-t bg-slate-50/20">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-400 text-[10px] border-b">
                          <th className="pb-4 px-4">СТУДЕНТ</th>
                          <th className="pb-4 px-4 text-center">СТАТУС</th>
                          <th className="pb-4 px-4 text-center">ПРОГРЕСС</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter(s => String(s.belongs_to) === String(group.id)).map(student => (
                          <tr key={`student-${student.id}`} className="border-b border-white/50">
                            <td className="py-4 px-4 font-bold">{student.second_name} {student.first_name}</td>
                            <td className="py-4 px-4 text-center">
                               <StatusBadge status={liveMonitor[student.id]?.status || 'Offline'} />
                            </td>
                            <td className="py-4 px-4">
                               <div className="flex items-center gap-3 max-w-[200px] mx-auto">
                                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                     <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${liveMonitor[student.id]?.progress || 0}%` }} />
                                  </div>
                                  <span className="text-[10px] font-black">{liveMonitor[student.id]?.progress || 0}%</span>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-4xl rounded-[3.5rem] p-8 sm:p-12 shadow-2xl space-y-8 my-auto border-4 border-white">
              
              <div className="flex justify-between items-center border-b pb-6">
                <div>
                   <h3 className="text-3xl font-black text-blue-600 italic tracking-tighter">ПУБЛИКАЦИЯ КОНТРОЛЬНОЙ</h3>
                   <p className="text-[10px] text-slate-300">ФОРМИРОВАНИЕ УНИКАЛЬНЫХ ВАРИАНТОВ ИЗ ПУЛА</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={32} className="text-slate-300"/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] ml-4 text-slate-400 font-black">01. ДИСЦИПЛИНА</label>
                  <select className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-blue-200 appearance-none" value={selSub} onChange={e => {setSelSub(e.target.value); setSelPoolId('');}}>
                    <option value="">ВЫБЕРИТЕ ПРЕДМЕТ...</option>
                    {courses.map(c => <option key={`opt-course-${c.id}`} value={String(c.id)}>{c.title}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] ml-4 text-slate-400 font-black">02. ЦЕЛЕВАЯ ГРУППА</label>
                  <select className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-blue-200 appearance-none" value={selGrp} onChange={e => setSelGrp(e.target.value)}>
                    <option value="">ВЫБЕРИТЕ ГРУППУ...</option>
                    {groups.map(g => <option key={`opt-group-${g.id}`} value={String(g.id)}>{g.name}-{g.course}-{g.number}</option>)}
                  </select>
                </div>

                <div className="col-span-full space-y-2">
                  <label className="text-[9px] ml-4 text-blue-500 font-black">03. БАЗА ВОПРОСОВ (ПОДГОТОВЛЕНО ИИ)</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-blue-50/50 p-6 rounded-[2rem] font-black outline-none border-2 border-blue-100 focus:border-blue-300 appearance-none text-blue-700" 
                      disabled={!selSub} 
                      value={selPoolId} 
                      onChange={e => setSelPoolId(e.target.value)}
                    >
                      <option value="">ВЫБЕРИТЕ ПУЛ ВОПРОСОВ...</option>
                      {filteredPools.map(pool => (
                        <option key={`opt-pool-${pool.id}`} value={String(pool.id)}>
                          ПУЛ #{pool.id} — {pool.docx.replace('.pdf', '')}
                        </option>
                      ))}
                    </select>
                    <Database className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" size={24}/>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-5 border-2 border-dashed border-slate-200">
                 <div className="flex justify-between items-center font-black italic">
                    <div className="flex items-center gap-2 text-[#1976d2]">
                       <HelpCircle size={20}/>
                       <span>ВОПРОСОВ В ОДНОМ ВАРИАНТЕ:</span>
                    </div>
                    <span className="text-4xl text-blue-600 tabular-nums">{questionCount}</span>
                 </div>
                 <input 
                   type="range" min="5" max="20" 
                   value={questionCount} 
                   onChange={(e) => setQuestionCount(parseInt(e.target.value))} 
                   className="w-full h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                 />
                 <div className="flex justify-between text-[8px] text-slate-400 font-black px-2">
                    <span>МИНИМУМ: 5</span>
                    <span>МАКСИМУМ: 20</span>
                 </div>
              </div>

              <button 
                disabled={!selPoolId || !selGrp} 
                onClick={handleAssignTest} 
                className={`w-full py-8 rounded-[2.5rem] font-black text-xl transition-all shadow-xl active:scale-[0.98] ${selPoolId && selGrp ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-300'}`}
              >
                ОПУБЛИКОВАТЬ ЗАДАНИЕ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusBadge = ({ status }: any) => {
  const cfg: any = {
    'Online': 'bg-green-100 text-green-600',
    'Offline': 'bg-slate-100 text-slate-400',
    'TabFocussedOut': 'bg-orange-100 text-orange-600',
    'Blocked': 'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border ${cfg[status] || cfg['Offline']}`}>
      {status === 'TabFocussedOut' ? 'ВЫШЕЛ ИЗ ВКЛАДКИ' : status.toUpperCase()}
    </span>
  );
};