import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Wifi, ChevronDown, X, Database, BookOpen, Award, RefreshCw, Search
} from 'lucide-react';
import type { Subject, Group, ApiTest, TeacherQuestion, User } from '../types';
import { api } from '../api';

const getGrade = (percent: any) => {
  const p = Number(percent);
  if (p >= 90) return { val: 5, color: 'text-green-600', bg: 'bg-green-50', label: 'ОТЛИЧНО' };
  if (p >= 70) return { val: 4, color: 'text-blue-600', bg: 'bg-blue-50', label: 'ХОРОШО' };
  if (p >= 50) return { val: 3, color: 'text-orange-600', bg: 'bg-orange-50', label: 'УДОВЛ.' };
  return { val: 2, color: 'text-red-600', bg: 'bg-red-50', label: 'НЕУД.' };
};

export const TeacherProfile = () => {
  const [currentUser, setCurrentUser] = useState<User | any>({});
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [showInspector, setShowInspector] = useState(false);
  const [inspectedSubject, setInspectedSubject] = useState('');
  const [inspectedPool, setInspectedPool] = useState('');
  const [reviewQuestions, setReviewQuestions] = useState<TeacherQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
  const [courses, setCourses] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [availableTests, setAvailableTests] = useState<ApiTest[]>([]);
  
  const [selSub, setSelSub] = useState('');
  const [selPoolId, setSelPoolId] = useState(''); 
  const [selGrp, setSelGrp] = useState('');
  const [questionCount, setQuestionCount] = useState(15);

  const ws = useRef<WebSocket | null>(null);
  const headers = useMemo(() => ({ 
    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
    'Content-Type': 'application/json' 
  }), []);

  const [liveMonitor, setLiveMonitor] = useState<Record<number, any>>({});

  // ИСПРАВЛЕНА ЛОГИКА ЗАГРУЗКИ ПОЛЬЗОВАТЕЛЯ (ИЩЕМ ЛОГИН ВО ВСЕХ ПОЛЯХ)
  useEffect(() => {
    const initializeData = async () => {
        let userObj: any = null;
        let tokenLogin = '';
        
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // Перебираем варианты ключей, в которых бэкенд мог сохранить логин
                tokenLogin = payload.login || payload.name || payload.username || payload.email?.split('@')[0] || '';
                userObj = { id: payload.id || payload.sub, login: tokenLogin };
            }
        } catch (e) {}

        try {
            const rawUser = localStorage.getItem('user');
            if (rawUser) {
                const parsed = JSON.parse(rawUser);
                if (parsed) {
                    const parsedLogin = parsed.login || parsed.name || parsed.username || parsed.email?.split('@')[0];
                    userObj = { ...parsed, id: parsed.id || userObj?.id, login: parsedLogin || tokenLogin };
                }
            }
        } catch (e) {}

        if (!userObj?.id || !userObj?.login) {
            try {
                const res = await fetch('/test/whoami', { headers });
                if (res.ok) {
                    const data = await res.json();
                    const targetData = data.user || data;
                    const apiLogin = targetData.login || targetData.name || targetData.username || targetData.email?.split('@')[0];
                    userObj = { ...targetData, id: targetData.id || userObj?.id, login: apiLogin || tokenLogin };
                    localStorage.setItem('user', JSON.stringify(userObj));
                }
            } catch (e) {}
        }
        
        setCurrentUser(userObj || { login: 'ПРЕПОДАВАТЕЛЬ' });

        fetch('/storage/courses', { headers }).then(r => r.json()).then(data => setCourses(Array.isArray(data) ? data : []));
        fetch('/groups', { headers }).then(r => r.json()).then(data => setGroups(Array.isArray(data) ? data : []));
        fetch('/tests/available', { headers }).then(r => r.json()).then(data => setAvailableTests(Array.isArray(data) ? data : []));
        fetch('/auth/students', { headers }).then(r => r.json()).then(data => setStudents(Array.isArray(data) ? data : []));
    };

    initializeData();
    // Повторяем проверку на случай, если App.tsx запишет данные позже
    const interval = setInterval(initializeData, 1000);

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
    return () => {
        clearInterval(interval);
        ws.current?.close();
    };
  }, [headers]);

  const visibleGroups = useMemo(() => {
    const currentTeacherId = String(currentUser?.id || '');
    if (!currentTeacherId || currentTeacherId === 'undefined') return [];

    const assignedGroupIds = new Set();
    
    availableTests.forEach(t => {
        const tTeacherId = String(t.teacherId ?? t.teacher_id);
        const tGroupId = String(t.assignedGroupId ?? t.assigned_group_id);
        
        if (tTeacherId === currentTeacherId && tGroupId && tGroupId !== 'null' && tGroupId !== 'undefined') {
            assignedGroupIds.add(tGroupId);
        }
    });

    return groups.filter(g => assignedGroupIds.has(String(g.id)));
  }, [groups, availableTests, currentUser]);

  const getUniquePools = (subjectId: string) => {
    if (!subjectId) return [];
    
    const poolsOfSubject = availableTests.filter(t => String(t.belongsTo || t.belongs_to) === String(subjectId));
    const uniquePoolsMap = new Map();
    
    for (const p of poolsOfSubject) {
      const name = p.docxName || p.docx_name;
      if (!uniquePoolsMap.has(name) || uniquePoolsMap.get(name).id < p.id) {
        uniquePoolsMap.set(name, p);
      }
    }
    return Array.from(uniquePoolsMap.values());
  };

  const filteredPools = useMemo(() => getUniquePools(selSub), [availableTests, selSub]);
  const inspectorPools = useMemo(() => getUniquePools(inspectedSubject), [availableTests, inspectedSubject]);

  const getGroupData = (groupId: number) => {
    return students
      .filter(s => String(s.belongsTo || s.belongs_to) === String(groupId))
      .reduce((acc, s) => {
        const monitorData = liveMonitor[s.id] || {};
        let topicName = monitorData.topic || "СПИСОК ГРУППЫ (ТЕСТ НЕ НАЧАТ)";
        
        if (monitorData.topic) {
           const studentTest = availableTests.find(t => (t.docxName || t.docx_name) === monitorData.topic);
           const tTeacherId = String(studentTest?.teacherId ?? studentTest?.teacher_id);
           
           if (studentTest && tTeacherId !== String(currentUser?.id)) {
              topicName = "СПИСОК ГРУППЫ (ТЕСТ НЕ НАЧАТ)";
           }
        }

        if (!acc[topicName]) acc[topicName] = [];
        acc[topicName].push(s);
        return acc;
      }, {} as Record<string, any[]>);
  };

  const loadInspectorQuestions = async (poolId: string) => {
    setInspectedPool(poolId);
    if (!poolId) {
        setReviewQuestions([]);
        return;
    }
    
    setIsLoadingQuestions(true);
    try {
      let data: any[] = [];
      let searchId = Number(poolId);
      let maxAttempts = 20; 
      
      while (searchId > 0 && maxAttempts > 0) {
          try {
              const res = await fetch(`/tests/${searchId}/questions/review`, { headers });
              if (res.ok) {
                  const result = await res.json();
                  if (result && result.length > 0) {
                      data = result;
                      break; 
                  }
              }
          } catch (err) {}
          searchId--;
          maxAttempts--;
      }
      
      setReviewQuestions(data || []);
    } catch (err) {
      alert("ОШИБКА ЗАГРУЗКИ ПУЛА");
      setReviewQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleOptionChange = async (qId: number, newCorrectIdx: number) => {
    const question = reviewQuestions.find(q => q.id === qId);
    if (!question) return;

    const validVariants = question.options.slice(0, 4);
    const validCorrectIdx = newCorrectIdx > 3 ? 3 : newCorrectIdx;

    setReviewQuestions(prev => prev.map(q => 
        q.id === qId ? { ...q, correct: validCorrectIdx, modifiedBy: 'СОХРАНЕНИЕ...' } : q
    ));

    const payload = {
        question: question.question,
        variants: validVariants,
        correct: validCorrectIdx,
        complexity: question.complexity
    };

    try {
        const res = await fetch(`/questions/${qId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
             const errorData = await res.json();
             alert(`ОШИБКА СЕРВЕРА: ${errorData.message}`);
        }
    } catch (e) {
        console.error("Ошибка сети", e);
    }

    loadInspectorQuestions(inspectedPool);
  };

  const handleAssignTest = async () => {
    if (!selPoolId || !selGrp) return alert("ОШИБКА: ДАННЫЕ НЕ ВЫБРАНЫ");
    
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
    }
  };

  const handleReset = async (sId: number) => {
    if (!confirm("СБРОСИТЬ РЕЗУЛЬТАТ И РАЗРЕШИТЬ ПЕРЕСДАЧУ?")) return;
    const studentTopic = liveMonitor[sId]?.topic;
    
    const test = availableTests.find(t => 
        (t.docxName || t.docx_name) === studentTopic && 
        String(t.teacherId ?? t.teacher_id) === String(currentUser?.id)
    );
    const finalTest = test || availableTests.find(t => (t.docxName || t.docx_name) === studentTopic);

    if (!finalTest) {
      alert("Ошибка: Тест не найден");
      return;
    }

    const res = await fetch(`/test/reset/${sId}/${finalTest.id}`, { method: 'POST', headers });
    if (res.ok) {
      setLiveMonitor(prev => {
        const next = { ...prev };
        delete next[sId]; 
        return next;
      });
    } else {
      alert("Ошибка при сбросе результата");
    }
  };

  // Получаем итоговое имя для отображения:
  const teacherDisplayName = currentUser?.login || currentUser?.name || currentUser?.username || 'ПРЕПОДАВАТЕЛЬ';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-6 pb-20 text-sm font-bold antialiased italic uppercase text-slate-700">
      
      {/* HEADER */}
      <div className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-xl border border-[#e1eefb] flex flex-col lg:flex-row items-center gap-8">
        <div className="relative">
          <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] border-8 border-blue-50 overflow-hidden shadow-2xl">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacherDisplayName}`} alt="avatar" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 p-3 rounded-2xl text-white shadow-lg border-4 border-white">
            <Wifi size={20} className={ws.current?.readyState === 1 ? "animate-pulse" : "opacity-30"} />
          </div>
        </div>
        <div className="text-center lg:text-left flex-1">
          <div className="inline-block bg-[#e3f2fd] text-[#1976d2] px-4 py-1 rounded-full text-[10px] font-black mb-4 tracking-widest uppercase">ТТЖТ • ПУЛЬТ ПРЕПОДАВАТЕЛЯ</div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-[#1565c0] tracking-tighter mb-2 italic leading-none">
            {teacherDisplayName.toUpperCase()}
          </h1>
          
          <div className="flex flex-wrap gap-4 mt-6 justify-center lg:justify-start">
            <button onClick={() => setShowCreateModal(true)} className="bg-[#1976d2] text-white px-8 py-5 rounded-2xl shadow-xl flex items-center gap-3 hover:bg-[#1565c0] active:scale-95 transition-all border-b-4 border-blue-800"><Plus size={24}/> НАЗНАЧИТЬ ТЕСТ</button>
            <button onClick={() => setShowInspector(true)} className="bg-orange-500 text-white px-8 py-5 rounded-2xl shadow-xl flex items-center gap-3 hover:bg-orange-600 active:scale-95 transition-all border-b-4 border-orange-800"><Search size={24}/> ИНСПЕКТОР БАЗЫ</button>
          </div>
        </div>
      </div>

      {/* GROUPS MONITORING */}
      <div className="grid gap-8">
        {visibleGroups.map(group => (
          <div key={group.id} className="bg-white rounded-[3rem] shadow-2xl border border-blue-50 overflow-hidden">
            <div className="p-8 flex justify-between items-center cursor-pointer hover:bg-slate-50/50" onClick={() => setExpandedGroups(p => p.includes(group.id) ? p.filter(id => id !== group.id) : [...p, group.id])}>
              <div className="flex items-center gap-5">
                 <div className="bg-blue-600 text-white p-4 rounded-[1.5rem] shadow-lg shadow-blue-200"><Users size={24}/></div>
                 <span className="text-2xl font-black italic tracking-tighter text-slate-800">ГРУППА {group.name}-{group.course}-{group.number}</span>
              </div>
              <ChevronDown className={`transition-transform duration-500 ${expandedGroups.includes(group.id) ? 'rotate-180 text-blue-600' : ''}`} size={32} />
            </div>
            
            <AnimatePresence>
              {expandedGroups.includes(group.id) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-8 border-t-2 border-slate-50 bg-slate-50/30 space-y-12">
                    {Object.entries(getGroupData(group.id)).map(([topicName, studentsList]) => (
                      <div key={topicName} className="space-y-6">
                        <div className="flex items-center gap-4 px-6 py-3 bg-white rounded-3xl border-2 border-blue-100 shadow-sm w-fit">
                          <BookOpen size={20} className="text-blue-500" />
                          <span className="text-sm font-black text-blue-700 tracking-widest uppercase">РАЗДЕЛ: {topicName}</span>
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
                                const grade = isFinished ? getGrade(monitorData.percent) : null;
                                const hasActivity = Object.keys(monitorData).length > 0;

                                return (
                                  <tr key={student.id} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors">
                                    <td className="py-6 px-8 font-black text-slate-700 text-lg tracking-tight">
                                      {student.secondName || student.second_name || ''} {student.firstName || student.first_name || student.login}
                                    </td>
                                    <td className="py-6 px-4 text-center"><StatusBadge status={monitorData.status || 'Offline'} /></td>
                                    <td className="py-6 px-8">
                                        <div className="flex items-center gap-6 justify-center">
                                            <div className="flex items-center gap-4">
                                              {isFinished ? (
                                                <div className={`flex items-center gap-5 ${grade?.bg} px-8 py-3 rounded-3xl border-4 shadow-sm`}>
                                                  <div className="flex flex-col items-center">
                                                    <span className={`text-5xl font-black ${grade?.color} leading-none`}>{grade?.val}</span>
                                                    <span className={`text-[8px] font-black ${grade?.color} mt-1`}>{grade?.label}</span>
                                                  </div>
                                                  <div className="w-1 h-10 bg-slate-200 rounded-full"></div>
                                                  <div className="flex flex-col text-left">
                                                    <span className="text-[10px] text-slate-400 font-black leading-none">{monitorData.score} БАЛЛОВ</span>
                                                    <span className="text-[11px] text-slate-700 font-black mt-1 italic">{monitorData.percent}%</span>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-4 w-full max-w-[240px]">
                                                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                     <motion.div initial={{ width: 0 }} animate={{ width: `${monitorData.progress || 0}%` }} className="h-full bg-gradient-to-r from-blue-600 to-blue-400" />
                                                  </div>
                                                  <span className="text-sm font-black text-blue-600">{monitorData.progress || 0}%</span>
                                                </div>
                                              )}

                                              {hasActivity && (
                                                <button 
                                                  onClick={() => handleReset(student.id)} 
                                                  title="Сбросить результат или разблокировать тест"
                                                  className="p-4 bg-slate-800 text-white rounded-2xl hover:bg-red-600 transition-all shadow-lg active:scale-90"
                                                >
                                                  <RefreshCw size={20} />
                                                </button>
                                              )}
                                            </div>
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

      {/* MODAL: INSPECTOR */}
      <AnimatePresence>
        {showInspector && (
          <div className="fixed inset-0 z-[1100] bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center p-4">
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="bg-white w-full max-w-6xl h-[90vh] rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border-8 border-white/50">
              <div className="p-10 border-b-2 border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-black text-orange-600 italic tracking-tighter uppercase leading-none">ИНСПЕКТОР БАЗЫ ЗНАНИЙ</h2>
                  <p className="text-[10px] text-slate-400 font-black mt-2 tracking-widest uppercase">ПРОВЕРКА И МОДЕРАЦИЯ ВОПРОСОВ ТТЖТ</p>
                </div>
                <button onClick={() => setShowInspector(false)} className="p-4 bg-white shadow-xl rounded-full hover:text-red-500 transition-all"><X size={32}/></button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col p-10 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                    <select className="p-6 bg-slate-100 rounded-[2rem] font-black outline-none border-4 border-transparent focus:border-orange-200" value={inspectedSubject} onChange={e => setInspectedSubject(e.target.value)}>
                        <option value="">ВЫБЕРИТЕ ДИСЦИПЛИНУ...</option>
                        {courses.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
                    </select>
                    <select className="p-6 bg-slate-100 rounded-[2rem] font-black outline-none border-4 border-transparent focus:border-orange-200" disabled={!inspectedSubject} value={inspectedPool} onChange={e => loadInspectorQuestions(e.target.value)}>
                        <option value="">ВЫБЕРИТЕ ПУЛ ВОПРОСОВ...</option>
                        {inspectorPools.map(p => <option key={p.id} value={String(p.id)}>{p.docxName || p.docx_name}</option>)}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 space-y-8">
                    {isLoadingQuestions && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 animate-pulse">
                            <Database size={80} className="mb-4" />
                            <p className="text-2xl font-black italic">ПОИСК ОРИГИНАЛЬНОГО ШАБЛОНА...</p>
                        </div>
                    )}
                    
                    {!isLoadingQuestions && inspectedPool && reviewQuestions.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <Database size={80} className="mb-4 opacity-50" />
                            <p className="text-2xl font-black italic">В ДАННОМ ПУЛЕ НЕТ ВОПРОСОВ</p>
                        </div>
                    )}

                    {!isLoadingQuestions && reviewQuestions.map((q, qIdx) => (
                        <div key={q.id} className="bg-white p-10 rounded-[3rem] border-4 border-slate-100 space-y-8 relative shadow-sm hover:border-orange-200 transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-[12px] font-black italic tracking-widest">ВОПРОС №{qIdx + 1}</span>
                                {q.modifiedBy && (
                                    <div className="flex items-center gap-3 text-orange-600 bg-orange-50 px-6 py-2 rounded-2xl border-2 border-orange-100">
                                        <Award size={18}/>
                                        <span className="text-[11px] font-black uppercase italic">РЕДАКТОР: {q.modifiedBy}</span>
                                    </div>
                                )}
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 leading-tight italic tracking-tight underline decoration-orange-100 decoration-8 underline-offset-4">"{q.question}"</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {q.options.map((opt, optIdx) => (
                                    <button 
                                        key={optIdx} 
                                        onClick={() => handleOptionChange(q.id, optIdx)}
                                        className={`p-6 rounded-[2rem] border-4 text-left transition-all flex items-center gap-5 ${q.correct === optIdx ? 'bg-green-50 border-green-500 text-green-700 shadow-xl' : 'bg-slate-50 border-transparent text-slate-400'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full border-4 flex-shrink-0 flex items-center justify-center ${q.correct === optIdx ? 'border-green-500 bg-white' : 'border-slate-200 bg-white'}`}>
                                            {q.correct === optIdx && <div className="w-3 h-3 bg-green-500 rounded-full" />}
                                        </div>
                                        <span className="font-black italic text-base tracking-tight">{opt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ASSIGN TEST */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-4xl rounded-[4rem] p-10 shadow-2xl space-y-10 border-8 border-white/50">
              <div className="flex justify-between items-center border-b-2 border-slate-100 pb-8">
                <h3 className="text-4xl font-black text-blue-600 italic tracking-tighter uppercase leading-none">ПУБЛИКАЦИЯ ЗАДАНИЯ</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-3 bg-slate-100 hover:bg-red-50 rounded-3xl transition-all"><X size={32}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <select className="w-full bg-slate-50 p-7 rounded-[2.5rem] font-black text-lg shadow-inner" value={selSub} onChange={e => {setSelSub(e.target.value); setSelPoolId('');}}>
                    <option value="">ДИСЦИПЛИНА...</option>
                    {courses.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
                </select>
                <select className="w-full bg-slate-50 p-7 rounded-[2.5rem] font-black text-lg shadow-inner" value={selGrp} onChange={e => setSelGrp(e.target.value)}>
                    <option value="">ГРУППА...</option>
                    {groups.map(g => <option key={g.id} value={String(g.id)}>{g.name}-{g.course}-{g.number}</option>)}
                </select>
                <div className="col-span-full">
                    <select className="w-full bg-blue-50/50 p-8 rounded-[3rem] font-black text-xl border-4 border-blue-100" value={selPoolId} onChange={e => setSelPoolId(e.target.value)}>
                        <option value="">{selSub ? "ВЫБЕРИТЕ ПУЛ ВОПРОСОВ..." : "СНАЧАЛА ПРЕДМЕТ"}</option>
                        {filteredPools.map(pool => <option key={pool.id} value={String(pool.id)}>{pool.docxName || pool.docx_name}</option>)}
                    </select>
                </div>
              </div>

              <button disabled={!selPoolId || !selGrp} onClick={handleAssignTest} className={`w-full py-9 rounded-[3rem] font-black text-2xl transition-all shadow-2xl ${selPoolId && selGrp ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-300'}`}>ОПУБЛИКОВАТЬ ЗАДАНИЕ</button>
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
  return <span className={`px-6 py-2.5 rounded-2xl text-[11px] font-black border-2 shadow-sm ${cfg[status] || cfg['Offline']}`}>{label}</span>;
};