import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, BarChart3, Plus, Wifi, CheckCircle, Settings, 
  ChevronDown, FileText, Send, X, RotateCcw, Activity, 
  AlertCircle, FileCheck 
} from 'lucide-react';
import type { Subject, Group } from '../types';

interface StudentStatus {
  id: number;
  status: 'Online' | 'Offline' | 'TabFocussedOut' | 'Blocked' | 'Progress';
  progress?: number;
}

export const TeacherProfile = () => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'analytics' | 'management'>('monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [courses, setCourses] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  
  const [selSub, setSelSub] = useState('');
  const [selSec, setSelSec] = useState('');
  const [selLec, setSelLec] = useState('');
  const [selGrp, setSelGrp] = useState('');
  const [manualTestId, setManualTestId] = useState('');

  const ws = useRef<WebSocket | null>(null);
  const headers = { 
    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
    'Content-Type': 'application/json' 
  };

  useEffect(() => {
    fetch('/courses', { headers }).then(r => r.json()).then(data => setCourses(Array.isArray(data) ? data : [])).catch(e => console.error(e));
    fetch('/groups', { headers }).then(r => r.json()).then(data => setGroups(Array.isArray(data) ? data : [])).catch(e => console.error(e));
    fetch('/tests/available', { headers }).then(r => r.json()).then(data => setAvailableTests(Array.isArray(data) ? data : [])).catch(e => console.error(e));
    fetch('/auth/students', { headers }).then(r => r.json()).then(data => setStudents(Array.isArray(data) ? data : [])).catch(() => {});

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const connectWS = () => {
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

  const [liveMonitor, setLiveMonitor] = useState<Record<number, any>>({});

  // --- БЕЗОПАСНАЯ ЛОГИКА СИНХРОНИЗАЦИИ ---
  const matchedTest = useMemo(() => {
    if (!selSub || !selSec || !selLec || !Array.isArray(courses)) return null;
    
    const disc = courses.find(c => String(c.id) === selSub);
    const sec = disc?.sections?.find(s => String(s.id) === selSec);
    const subSections = (sec as any)?.sub_sections || (sec as any)?.subSections || [];
    
    // Безопасный flatMap
    const lecture = subSections.flatMap((ss: any) => ss.lectures || [])
                               .find((l: any) => String(l.id) === selLec);
    
    if (!lecture) return null;

    return (availableTests || []).find(t => 
      t.docx === lecture.file_name || 
      (String(t.belongs_to) === selSub && t.docx.includes(lecture.id))
    );
  }, [selSub, selSec, selLec, availableTests, courses]);

  const filteredPools = useMemo(() => {
    return (availableTests || []).filter(t => String(t.belongs_to) === selSub || t.belongs_to === 0);
  }, [availableTests, selSub]);

  const currentTestId = manualTestId || matchedTest?.id;

  const handleAssignTest = async () => {
    if (!currentTestId || !selGrp) return alert("ВЫБЕРИТЕ ТЕСТ И ГРУППУ!");
    const res = await fetch('/tests/assign', {
      method: 'POST',
      headers,
      body: JSON.stringify({ test_id: Number(currentTestId), group_id: parseInt(selGrp) })
    });
    if (res.ok) {
      alert("ТЕСТИРОВАНИЕ ЗАПУЩЕНО!");
      setShowCreateModal(false);
      setManualTestId('');
    }
  };

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 space-y-6 pb-20 text-sm font-bold antialiased italic uppercase text-slate-700">
      
      {/* HEADER */}
      <div className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-xl border border-[#e1eefb] flex flex-col lg:flex-row items-center gap-8">
        <div className="relative">
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-900 rounded-[2.5rem] border-8 border-blue-50 overflow-hidden shadow-lg">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStorage.getItem('token')}`} alt="avatar" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 p-3 rounded-2xl text-white shadow-lg border-4 border-white">
            <Wifi size={20} />
          </div>
        </div>
        <div className="text-center lg:text-left flex-1">
          <div className="inline-block bg-[#e3f2fd] text-[#1976d2] px-4 py-1 rounded-full text-[10px] font-black mb-4 uppercase">ПРЕПОДАВАТЕЛЬ ТТЖТ</div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1565c0] tracking-tighter mb-2 italic">ПУЛЬТ УПРАВЛЕНИЯ</h1>
          <button onClick={() => setShowCreateModal(true)} className="mt-4 bg-[#1976d2] text-white px-8 py-4 rounded-2xl shadow-xl flex items-center gap-2 hover:bg-[#1565c0] transition-all"><Plus size={20}/> НАЗНАЧИТЬ ТЕСТ</button>
        </div>
      </div>

      {/* MONITORING */}
      <div className="space-y-4">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-[2.5rem] shadow-lg border border-blue-50 overflow-hidden">
            <div className="p-6 flex justify-between items-center cursor-pointer" onClick={() => setExpandedGroups(p => p.includes(group.id) ? p.filter(id => id !== group.id) : [...p, group.id])}>
              <span className="text-xl font-black italic">ГРУППА {group.name}-{group.course}-{group.number}</span>
              <ChevronDown className={expandedGroups.includes(group.id) ? 'rotate-180' : ''} />
            </div>
            {expandedGroups.includes(group.id) && (
              <div className="p-6 border-t overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-300 text-[10px] border-b">
                      <th className="pb-4 px-4">СТУДЕНТ</th>
                      <th className="pb-4 px-4">СТАТУС</th>
                      <th className="pb-4 px-4">ПРОГРЕСС</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => String(s.belongs_to) === String(group.id)).map(student => (
                      <tr key={student.id} className="border-b border-slate-50">
                        <td className="py-4 px-4">{student.second_name} {student.first_name}</td>
                        <td className="py-4 px-4"><StatusBadge status={liveMonitor[student.id]?.status || 'Offline'} /></td>
                        <td className="py-4 px-4">{liveMonitor[student.id]?.progress || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* МОДАЛКА (С ЗАЩИТОЙ) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-4xl rounded-[3.5rem] p-10 shadow-2xl space-y-8">
              
              <div className="flex justify-between items-center border-b pb-6">
                <h3 className="text-3xl font-black text-blue-600 italic">ПУБЛИКАЦИЯ ТЕСТА</h3>
                <button onClick={() => setShowCreateModal(false)}><X size={32} className="text-slate-300"/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. ПРЕДМЕТ */}
                <div className="space-y-2">
                  <label className="text-[10px] ml-3">1. ДИСЦИПЛИНА</label>
                  <select className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold" value={selSub} onChange={e => {setSelSub(e.target.value); setSelSec(''); setSelLec('');}}>
                    <option value="">ВЫБЕРИТЕ...</option>
                    {courses.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
                  </select>
                </div>

                {/* 2. РАЗДЕЛ (БЕЗОПАСНЫЙ) */}
                <div className="space-y-2">
                  <label className="text-[10px] ml-3">2. РАЗДЕЛ</label>
                  <select className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold" disabled={!selSub} value={selSec} onChange={e => {setSelSec(e.target.value); setSelLec('');}}>
                    <option value="">ВЫБЕРИТЕ...</option>
                    {(courses.find(c => String(c.id) === selSub)?.sections || []).map(s => (
                      <option key={s.id} value={String(s.id)}>{s.title}</option>
                    ))}
                  </select>
                </div>

                {/* 3. ТЕМА (С ЗАЩИТОЙ flatMap) */}
                <div className="space-y-2">
                  <label className="text-[10px] ml-3">3. ТЕМА</label>
                  <select className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold" disabled={!selSec} value={selLec} onChange={e => setSelLec(e.target.value)}>
                    <option value="">ВЫБЕРИТЕ ТЕМУ...</option>
                    {(() => {
                      const disc = courses.find(c => String(c.id) === selSub);
                      const sec = disc?.sections?.find(s => String(s.id) === selSec);
                      const subs = (sec as any)?.sub_sections || (sec as any)?.subSections || [];
                      return subs.flatMap((ss: any) => ss.lectures || []).map((l: any) => (
                        <option key={l.id} value={String(l.id)}>{l.title}</option>
                      ));
                    })()}
                  </select>
                </div>

                {/* 4. ГРУППА */}
                <div className="space-y-2">
                  <label className="text-[10px] ml-3">4. ЦЕЛЕВАЯ ГРУППА</label>
                  <select className="w-full bg-slate-50 p-5 rounded-[2rem] font-bold" value={selGrp} onChange={e => setSelGrp(e.target.value)}>
                    <option value="">ВЫБЕРИТЕ...</option>
                    {groups.map(g => <option key={g.id} value={String(g.id)}>{g.name}-{g.course}-{g.number}</option>)}
                  </select>
                </div>
              </div>

              {/* СТАТУС */}
              <div className={`p-6 rounded-[2rem] border-2 border-dashed ${currentTestId ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50'}`}>
                 {matchedTest ? (
                   <span className="text-green-600 font-black">ТЕСТ НАЙДЕН: {matchedTest.docx}</span>
                 ) : (
                   <div className="space-y-2">
                     <span className="text-slate-400">АВТО-ПОДБОР НЕ УДАЛСЯ. ВЫБЕРИТЕ ВРУЧНУЮ:</span>
                     <select className="w-full p-2 rounded-xl text-xs" value={manualTestId} onChange={e => setManualTestId(e.target.value)}>
                        <option value="">СПИСОК ПУЛОВ...</option>
                        {filteredPools.map(t => <option key={t.id} value={t.id}>ТЕСТ #{t.id} ({t.docx.substring(0,20)})</option>)}
                     </select>
                   </div>
                 )}
              </div>

              <button disabled={!currentTestId || !selGrp} onClick={handleAssignTest} className={`w-full py-8 rounded-[2.5rem] font-black text-lg ${currentTestId && selGrp ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                ОПУБЛИКОВАТЬ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-8 py-5 rounded-[2rem] font-black text-[10px] flex items-center gap-3 ${active ? 'bg-[#1976d2] text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

const StatusBadge = ({ status }: any) => (
  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black ${status === 'Online' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
    {status.toUpperCase()}
  </span>
);