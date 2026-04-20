import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Wifi, ChevronDown, X, HelpCircle, Database, BookOpen, Award, RefreshCw 
} from 'lucide-react';
import type { Subject, Group, ApiTest } from '../types';

const getGrade = (percent: any) => {
  const p = Number(percent);
  if (p >= 90) return { val: 5, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'ОТЛИЧНО' };
  if (p >= 70) return { val: 4, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'ХОРОШО' };
  if (p >= 50) return { val: 3, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'УДОВЛ.' };
  return { val: 2, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'НЕУД.' };
};

export const TeacherProfile = () => {
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [courses, setCourses] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [availableTests, setAvailableTests] = useState<ApiTest[]>([]);
  
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
    const loadData = () => {
      fetch('/storage/courses', { headers }).then(r => r.json()).then(data => setCourses(Array.isArray(data) ? data : []));
      fetch('/groups', { headers }).then(r => r.json()).then(data => setGroups(Array.isArray(data) ? data : []));
      fetch('/tests/available', { headers }).then(r => r.json()).then(data => setAvailableTests(Array.isArray(data) ? data : []));
      fetch('/auth/students', { headers }).then(r => r.json()).then(data => setStudents(Array.isArray(data) ? data : []));
    };

    loadData();

    const connectWS = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws.current = new WebSocket(`${protocol}//${window.location.host}/test/ws/monitor?token=${localStorage.getItem('token')}`);
        
        ws.current.onmessage = (e) => {
            const parts = e.data.split(':');
            if (parts.length >= 3) {
                const [type, sId, ...rest] = parts;
                const studentId = Number(sId);
                setLiveMonitor(prev => {
                    const current = prev[studentId] || {};
                    if (type === 'finish') return { ...prev, [studentId]: { ...current, status: 'Finished', score: rest[0], percent: rest[1] } };
                    if (type === 'topic') return { ...prev, [studentId]: { ...current, topic: rest.join(':') } };
                    if (type === 'progress') return { ...prev, [studentId]: { ...current, progress: rest[0] } };
                    if (type === 'status') return { ...prev, [studentId]: { ...current, status: rest[0] } };
                    return prev;
                });
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
        question_count: Number(questionCount) 
      })
    });

    if (res.ok) {
      alert(`ТЕСТ УСПЕШНО НАЗНАЧЕН!`);
      setShowCreateModal(false);
      fetch('/tests/available', { headers }).then(r => r.json()).then(data => setAvailableTests(Array.isArray(data) ? data : []));
    } else {
      const errData = await res.json().catch(() => ({}));
      alert("ОШИБКА СЕРВЕРА: " + (errData.error || res.statusText));
    }
  };

  const handleReset = async (sId: number) => {
    if (!confirm("ВЫ УВЕРЕНЫ? РЕЗУЛЬТАТ БУДЕТ УДАЛЕН, СТУДЕНТ ПОЛУЧИТ НОВЫЙ ВАРИАНТ.")) return;
    const studentTopic = liveMonitor[sId]?.topic;
    const test = availableTests.find(t => t.docx_name === studentTopic);
    
    if (!test) return alert("ОШИБКА: ТЕСТ НЕ НАЙДЕН ДЛЯ СБРОСА");

    const res = await fetch(`/test/reset/${sId}/${test.id}`, { method: 'POST', headers });
    if (res.ok) {
      setLiveMonitor(prev => {
        const next = { ...prev };
        delete next[sId];
        return next;
      });
      alert("ДОСТУП СБРОШЕН");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-20 text-sm font-bold antialiased italic uppercase text-slate-700">
      
      {/* HEADER */}
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
          <div className="inline-block bg-[#e3f2fd] text-[#1976d2] px-4 py-1 rounded-full text-[10px] font-black mb-4 tracking-widest uppercase">ТТЖТ • КОНТРОЛЬ СИСТЕМ</div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1565c0] tracking-tighter mb-2 italic leading-none">ПУЛЬТ ПРЕПОДАВАТЕЛЯ</h1>
          <button onClick={() => setShowCreateModal(true)} className="mt-4 bg-[#1976d2] text-white px-8 py-5 rounded-2xl shadow-xl flex items-center gap-3 hover:bg-[#1565c0] active:scale-95 transition-all tracking-tight font-black border-b-4 border-blue-800"><Plus size={24}/> НАЗНАЧИТЬ ТЕСТ</button>
        </div>
      </div>

      {/* GROUPS MONITORING */}
      <div className="grid gap-8">
        {groups.map(group => (
          <div key={`group-card-${group.id}`} className="bg-white rounded-[3rem] shadow-2xl border border-blue-50 overflow-hidden">
            <div className="p-8 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setExpandedGroups(p => p.includes(group.id) ? p.filter(id => id !== group.id) : [...p, group.id])}>
              <div className="flex items-center gap-5">
                 <div className="bg-blue-600 text-white p-4 rounded-[1.5rem] shadow-lg shadow-blue-200"><Users size={24}/></div>
                 <span className="text-2xl font-black italic tracking-tighter text-slate-800">ГРУППА {group.name}-{group.course}-{group.number}</span>
              </div>
              <ChevronDown className={`transition-transform duration-500 text-blue-300 ${expandedGroups.includes(group.id) ? 'rotate-180 text-blue-600' : ''}`} size={32} />
            </div>
            
            <AnimatePresence>
              {expandedGroups.includes(group.id) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-8 border-t-2 border-slate-50 bg-slate-50/30 space-y-12">
                    {Object.entries(
                      students
                        .filter(s => String(s.belongsTo || s.belongs_to) === String(group.id))
                        .reduce((acc, s) => {
                          const topic = liveMonitor[s.id]?.topic || "СПИСОК ГРУППЫ (ТЕСТ НЕ НАЧАТ)";
                          if (!acc[topic]) acc[topic] = [];
                          acc[topic].push(s);
                          return acc;
                        }, {} as Record<string, any[]>)
                    ).map(([topicName, studentsList]) => (
                      <div key={topicName} className="space-y-6">
                        <div className="flex items-center gap-4 px-6 py-3 bg-white rounded-3xl border-2 border-blue-100 shadow-sm w-fit">
                          <BookOpen size={20} className="text-blue-500" />
                          <span className="text-sm font-black text-blue-700 tracking-widest uppercase">РАЗДЕЛ: {topicName}</span>
                          <div className="w-1 h-6 bg-blue-100 rounded-full"></div>
                          <span className="text-[11px] text-slate-400 font-black">{studentsList.length} ЧЕЛ.</span>
                        </div>
                        <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-slate-400 text-[10px] border-b bg-slate-50/50">
                                <th className="py-4 px-8 w-1/3">ФИО СТУДЕНТА</th>
                                <th className="py-4 px-4 text-center">СТАТУС</th>
                                <th className="py-4 px-8 text-center">ОЦЕНКА / ПРОГРЕСС</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentsList.map(student => {
                                const monitorData = liveMonitor[student.id] || {};
                                const isFinished = monitorData.status === 'Finished';
                                const isBlocked = monitorData.status === 'Blocked';
                                const grade = isFinished ? getGrade(monitorData.percent) : null;
                                return (
                                  <tr key={`student-row-${student.id}`} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                                    <td className="py-6 px-8">
                                      <span className="font-black text-slate-700 text-lg tracking-tight block">
                                        {student.secondName || student.second_name || ''} {student.firstName || student.first_name || student.login}
                                      </span>
                                    </td>
                                    <td className="py-6 px-4 text-center"><StatusBadge status={monitorData.status || 'Offline'} /></td>
                                    <td className="py-6 px-8">
                                       <div className="flex items-center gap-6 justify-center">
                                          {(isFinished || isBlocked) ? (
                                            <div className="flex items-center gap-4">
                                              <div className={`flex items-center gap-5 ${isBlocked ? 'bg-red-50 border-red-200' : grade?.bg} px-8 py-3 rounded-3xl border-4 shadow-sm`}>
                                                <div className="flex flex-col items-center">
                                                  <span className={`text-5xl font-black ${isBlocked ? 'text-red-600' : grade?.color} leading-none`}>{isBlocked ? '!' : grade?.val}</span>
                                                  <span className={`text-[8px] font-black ${isBlocked ? 'text-red-400' : grade?.color} mt-1`}>{isBlocked ? 'БЛОК' : grade?.label}</span>
                                                </div>
                                                {!isBlocked && (
                                                  <>
                                                    <div className="w-1 h-10 bg-slate-200 rounded-full"></div>
                                                    <div className="flex flex-col text-left">
                                                      <span className="text-[10px] text-slate-400 font-black leading-none">{monitorData.score} БАЛЛОВ</span>
                                                      <span className="text-[11px] text-slate-700 font-black mt-1 italic">{monitorData.percent}%</span>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                              <button onClick={() => handleReset(student.id)} className="p-4 bg-slate-800 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-90" title="Разрешить пересдачу"><RefreshCw size={20} /></button>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-4 w-full max-w-[240px]">
                                              <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-white">
                                                 <motion.div initial={{ width: 0 }} animate={{ width: `${monitorData.progress || 0}%` }} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-md" />
                                              </div>
                                              <span className="text-sm font-black text-blue-600 tabular-nums">{monitorData.progress || 0}%</span>
                                            </div>
                                          )}
                                       </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
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

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-4xl rounded-[4rem] p-10 sm:p-14 shadow-2xl space-y-10 my-auto border-8 border-white/50">
              <div className="flex justify-between items-center border-b-2 border-slate-100 pb-8">
                <div>
                   <h3 className="text-4xl font-black text-blue-600 italic tracking-tighter uppercase leading-none">ПУБЛИКАЦИЯ ЗАДАНИЯ</h3>
                   <p className="text-xs text-slate-400 font-black mt-2 tracking-widest italic uppercase">АВТОМАТИЗИРОВАННЫЙ КОНТРОЛЬ ТТЖТ</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-3 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-3xl transition-all duration-300"><X size={32}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] ml-6 text-slate-500 font-black tracking-widest uppercase">01. ВЫБОР ДИСЦИПЛИНЫ</label>
                  <select className="w-full bg-slate-50 p-7 rounded-[2.5rem] font-black outline-none border-4 border-transparent focus:border-blue-100 appearance-none text-slate-700 text-lg shadow-inner" value={selSub} onChange={e => {setSelSub(e.target.value); setSelPoolId('');}}>
                    <option value="">ВЫБЕРИТЕ ПРЕДМЕТ...</option>
                    {courses.map(c => <option key={`subject-opt-${c.id}`} value={String(c.id)}>{c.title || c.name || `ПРЕДМЕТ №${c.id}`}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] ml-6 text-slate-500 font-black tracking-widest uppercase">02. ЦЕЛЕВАЯ ГРУППА</label>
                  <select className="w-full bg-slate-50 p-7 rounded-[2.5rem] font-black outline-none border-4 border-transparent focus:border-blue-100 appearance-none text-slate-700 text-lg shadow-inner" value={selGrp} onChange={e => setSelGrp(e.target.value)}>
                    <option value="">ВЫБЕРИТЕ ГРУППУ...</option>
                    {groups.map(g => <option key={`group-opt-${g.id}`} value={String(g.id)}>{g.name}-{g.course}-{g.number}</option>)}
                  </select>
                </div>

                <div className="col-span-full space-y-3">
                  <label className="text-[10px] ml-6 text-blue-600 font-black tracking-widest uppercase">03. БАЗА ВОПРОСОВ (МАГИСТРАЛЬ CORE)</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-blue-50/50 p-8 rounded-[3rem] font-black outline-none border-4 border-blue-100 focus:border-blue-400 appearance-none text-blue-900 text-xl shadow-inner" 
                      disabled={!selSub} 
                      value={selPoolId} 
                      onChange={e => setSelPoolId(e.target.value)}
                    >
                      <option value="">{selSub ? "ВЫБЕРИТЕ ПУЛ ВОПРОСОВ..." : "СНАЧАЛА ВЫБЕРИТЕ ДИСЦИПЛИНУ"}</option>
                      {filteredPools.map(pool => (
                        <option key={`pool-opt-${pool.id}`} value={String(pool.id)}>{pool.docx_name || `ПУЛ №${pool.id}`}</option>
                      ))}
                    </select>
                    <Database className="absolute right-10 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={32}/>
                  </div>
                  {selSub && filteredPools.length === 0 && (
                    <p className="ml-6 text-[10px] text-red-500 font-black animate-pulse">ВНИМАНИЕ: ДЛЯ ЭТОГО ПРЕДМЕТА ЕЩЕ НЕ СГЕНЕРИРОВАНЫ ТЕСТЫ!</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50/30 p-10 rounded-[3.5rem] space-y-8 border-4 border-dashed border-blue-100">
                 <div className="flex justify-between items-center font-black italic">
                    <div className="flex items-center gap-4 text-blue-700 text-xl uppercase"><HelpCircle size={32}/><span>ВОПРОСОВ В ВАРИАНТЕ:</span></div>
                    <span className="text-7xl text-blue-600 tabular-nums drop-shadow-lg">{questionCount}</span>
                 </div>
                 <input type="range" min="5" max="20" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value))} className="w-full h-6 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600 shadow-inner" />
              </div>

              <button disabled={!selPoolId || !selGrp} onClick={handleAssignTest} className={`w-full py-9 rounded-[3rem] font-black text-2xl transition-all shadow-2xl active:scale-[0.98] ${selPoolId && selGrp ? 'bg-blue-600 text-white hover:bg-blue-700 border-b-8 border-blue-800' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>ОПУБЛИКОВАТЬ ЗАДАНИЕ</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg: Record<string, string> = {
    'Online': 'bg-green-100 text-green-700 border-green-200',
    'Offline': 'bg-slate-100 text-slate-500 border-slate-200',
    'TabFocussedOut': 'bg-orange-100 text-orange-700 border-orange-200',
    'Blocked': 'bg-red-100 text-red-700 border-red-200',
    'Finished': 'bg-blue-100 text-blue-700 border-blue-200',
  };
  const label = status === 'Blocked' ? 'НАРУШЕНИЕ' : status === 'Finished' ? 'ЗАВЕРШЕНО' : status === 'TabFocussedOut' ? 'ПОКИНУЛ ОКНО' : status === 'Online' ? 'В СЕТИ' : 'OFFLINE';
  return <span className={`px-6 py-2.5 rounded-2xl text-[11px] font-black border-2 shadow-sm whitespace-nowrap ${cfg[status] || cfg['Offline']}`}>{label}</span>;
};