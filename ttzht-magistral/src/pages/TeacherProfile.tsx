import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Wifi, ChevronDown, X, Database, BookOpen, Award, RefreshCw, Search,
  Download, BarChart2, Activity 
} from 'lucide-react';
import type { Subject, Group, ApiTest, TeacherQuestion, User } from '../types';

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
  
  const [activeTab, setActiveTab] = useState<'monitoring' | 'analytics'>('monitoring');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const [localAssignedGroups, setLocalAssignedGroups] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    const initializeData = async () => {
        let userObj: any = null;
        let tokenLogin = '';
        
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
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

    const assignedGroupIds = new Set<string>();
    
    availableTests.forEach(t => {
        const tTeacherId = String(t.teacherId ?? t.teacher_id);
        const tGroupId = String(t.assignedGroupId ?? t.assigned_group_id);
        if (tTeacherId === currentTeacherId && tGroupId && tGroupId !== 'null' && tGroupId !== 'undefined') {
            assignedGroupIds.add(tGroupId);
        }
    });

    localAssignedGroups.forEach(id => assignedGroupIds.add(id));

    return groups
      .filter(g => assignedGroupIds.has(String(g.id)))
      .sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        if (nameA.localeCompare(nameB) !== 0) return nameA.localeCompare(nameB);
        if (a.course !== b.course) return (a.course || 0) - (b.course || 0);
        return (a.number || 0) - (b.number || 0);
      });
  }, [groups, availableTests, currentUser, localAssignedGroups]);

  const getGroupData = useCallback((groupId: number) => {
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
  }, [students, liveMonitor, availableTests, currentUser]);

  const getFilteredGroupData = useCallback((groupId: number) => {
      const data = getGroupData(groupId);
      const q = searchQuery.toLowerCase().trim();
      const group = groups.find(g => g.id === groupId);
      const groupNameStr = group ? `${group.name}-${group.course}-${group.number}`.toLowerCase() : '';
      
      const filtered: Record<string, any[]> = {};

      for (const [topic, studentsList] of Object.entries(data)) {
          const studentTest = availableTests.find(t => (t.docxName || t.docx_name) === topic);
          const subjectId = studentTest ? String(studentTest.belongsTo || studentTest.belongs_to) : '';
          const courseObj = courses.find(c => String(c.id) === subjectId);
          const subjectName = courseObj ? courseObj.title.toLowerCase() : '';

          if (filterSubject && subjectId !== filterSubject && topic !== "СПИСОК ГРУППЫ (ТЕСТ НЕ НАЧАТ)") continue; 
          
          if (q) {
              const topicLower = topic.toLowerCase();
              if (!groupNameStr.includes(q) && !topicLower.includes(q) && !subjectName.includes(q)) continue; 
          }

          filtered[topic] = studentsList;
      }
      return filtered;
  }, [getGroupData, searchQuery, filterSubject, groups, availableTests, courses]);

  const displayedGroups = useMemo(() => {
    return visibleGroups.filter(g => {
        const filteredData = getFilteredGroupData(g.id);
        return Object.keys(filteredData).length > 0;
    });
  }, [visibleGroups, getFilteredGroupData]);

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
    return Array.from(uniquePoolsMap.values()).sort((a, b) => {
      const nameA = a.docxName || a.docx_name || '';
      const nameB = b.docxName || b.docx_name || '';
      return nameA.localeCompare(nameB);
    });
  };

  const filteredPools = useMemo(() => getUniquePools(selSub), [availableTests, selSub]);
  const inspectorPools = useMemo(() => getUniquePools(inspectedSubject), [availableTests, inspectedSubject]);

  const analyticsData = useMemo(() => {
    let total5 = 0, total4 = 0, total3 = 0, total2 = 0;
    const groupStats: { name: string, avg: number, counts: { 5: number, 4: number, 3: number, 2: number } }[] = [];

    displayedGroups.forEach(group => {
        const grpData = getFilteredGroupData(group.id);
        let gScore = 0;
        let gCount = 0;
        let g5 = 0, g4 = 0, g3 = 0, g2 = 0;

        Object.values(grpData).forEach(studentsList => {
            studentsList.forEach((student: any) => {
                const mon = liveMonitor[student.id] || {};
                if (mon.status === 'Finished' && mon.percent !== undefined) {
                    const grade = getGrade(mon.percent).val;
                    if (grade === 5) { total5++; g5++; }
                    if (grade === 4) { total4++; g4++; }
                    if (grade === 3) { total3++; g3++; }
                    if (grade === 2) { total2++; g2++; }
                    
                    gScore += Number(mon.percent);
                    gCount++;
                }
            });
        });

        if (gCount > 0) {
            groupStats.push({
                name: `${group.name}-${group.course}-${group.number}`,
                avg: Math.round(gScore / gCount),
                counts: { 5: g5, 4: g4, 3: g3, 2: g2 }
            });
        }
    });

    return { total5, total4, total3, total2, totalFinished: total5 + total4 + total3 + total2, groupStats };
  }, [displayedGroups, getFilteredGroupData, liveMonitor]);

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

    const validVariants = question.options; 
    const maxIdx = validVariants.length - 1;
    const validCorrectIdx = newCorrectIdx > maxIdx ? maxIdx : newCorrectIdx;

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
      setLocalAssignedGroups(prev => new Set(prev).add(String(selGrp)));
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

  const handleExportReport = (topicName: string) => {
    const test = availableTests.find(t => (t.docxName || t.docx_name) === topicName);
    const token = localStorage.getItem('token');
    
    if (test && token) {
        window.open(`/export/${test.id}/${token}`, '_blank');
    } else {
        alert("ОШИБКА: Тест не найден или у вас нет прав доступа. Экспорт временно недоступен.");
    }
  };

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

      {/* ПАНЕЛЬ ФИЛЬТРОВ И ВКЛАДОК */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-3 rounded-[2.5rem] shadow-md border-2 border-slate-100">
          <div className="flex gap-2 w-full xl:w-auto">
             <button onClick={() => setActiveTab('monitoring')} className={`flex-1 xl:flex-none px-6 py-4 rounded-2xl flex justify-center items-center gap-3 transition-all text-sm font-black tracking-widest ${activeTab === 'monitoring' ? 'bg-blue-50 text-blue-700 shadow-inner border-2 border-blue-200' : 'text-slate-400 hover:text-slate-600 border-2 border-transparent hover:bg-slate-50'}`}>
                <Activity size={22} /> МОНИТОРИНГ
             </button>
             <button onClick={() => setActiveTab('analytics')} className={`flex-1 xl:flex-none px-6 py-4 rounded-2xl flex justify-center items-center gap-3 transition-all text-sm font-black tracking-widest ${activeTab === 'analytics' ? 'bg-blue-50 text-blue-700 shadow-inner border-2 border-blue-200' : 'text-slate-400 hover:text-slate-600 border-2 border-transparent hover:bg-slate-50'}`}>
                <BarChart2 size={22} /> АНАЛИТИКА
             </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
             <select 
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full md:w-64 px-5 py-4 bg-slate-50 border-2 border-blue-100 rounded-2xl text-sm font-black text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all uppercase shadow-inner cursor-pointer"
             >
                <option value="">🏫 ВСЕ ПРЕДМЕТЫ</option>
                {courses.slice().sort((a,b) => a.title.localeCompare(b.title)).map(c => (
                    <option key={c.id} value={String(c.id)}>{c.title}</option>
                ))}
             </select>

             <div className="w-full md:w-[350px] relative">
                <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                <input 
                    type="text" 
                    placeholder="ПОИСК: ГРУППА ИЛИ РАЗДЕЛ..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-blue-100 rounded-2xl text-sm font-black text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all uppercase placeholder-slate-400 shadow-inner"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
                        <X size={20}/>
                    </button>
                )}
             </div>
          </div>
      </div>

      {/* МОНИТОРИНГ ГРУПП */}
      {activeTab === 'monitoring' && (
      <div className="grid gap-8">
        {displayedGroups.length === 0 && (
            <div className="text-center py-12 text-slate-400 font-bold italic text-lg border-4 border-dashed border-slate-200 rounded-[3rem]">
                По вашим фильтрам ничего не найдено...
            </div>
        )}
        {displayedGroups.map(group => (
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
                    
                    {Object.entries(getFilteredGroupData(group.id))
                      .sort((a, b) => {
                        const isAEmpty = a[0] === "СПИСОК ГРУППЫ (ТЕСТ НЕ НАЧАТ)";
                        const isBEmpty = b[0] === "СПИСОК ГРУППЫ (ТЕСТ НЕ НАЧАТ)";
                        if (isAEmpty && !isBEmpty) return 1;
                        if (!isAEmpty && isBEmpty) return -1;
                        return a[0].localeCompare(b[0]);
                      })
                      .map(([topicName, studentsList]) => {
                        
                        const testObj = availableTests.find(t => (t.docxName || t.docx_name) === topicName);
                        const subjId = testObj ? String(testObj.belongsTo || testObj.belongs_to) : '';
                        const subjObj = courses.find(c => String(c.id) === subjId);
                        const subjectDisplay = subjObj ? subjObj.title : 'НЕИЗВЕСТНЫЙ ПРЕДМЕТ';

                        return (
                          <div key={topicName} className="space-y-6">
                            
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4 px-6 py-3 bg-white rounded-3xl border-2 border-blue-100 shadow-sm w-fit">
                                  <BookOpen size={20} className="text-blue-500" />
                                  <span className="text-sm font-black text-blue-700 tracking-widest uppercase">
                                     {topicName !== "СПИСОК ГРУППЫ (ТЕСТ НЕ НАЧАТ)" ? `${subjectDisplay} • ${topicName}` : topicName}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-black">{(studentsList as any[]).length} ЧЕЛ.</span>
                                </div>

                                {topicName !== "СПИСОК ГРУППЫ (ТЕСТ НЕ НАЧАТ)" && (
                                  <button 
                                    onClick={() => handleExportReport(topicName)}
                                    className="px-6 py-3 bg-emerald-500 text-white rounded-2xl shadow-xl hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-3"
                                  >
                                    <Download size={20} />
                                    <span className="tracking-widest">ЭКСПОРТ ОТЧЕТА</span>
                                  </button>
                                )}
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
                                  {[...(studentsList as any[])]
                                    .sort((a, b) => {
                                      const nameA = `${a.secondName || a.second_name || ''} ${a.firstName || a.first_name || ''}`.trim();
                                      const nameB = `${b.secondName || b.second_name || ''} ${b.firstName || b.first_name || ''}`.trim();
                                      return nameA.localeCompare(nameB);
                                    })
                                    .map(student => {
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
                        );
                      })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      )}

      {/* АНАЛИТИКА + ДЕТАЛИЗАЦИЯ ПО ГРУППАМ */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-2xl font-black italic text-slate-800 mb-8 flex items-center gap-3"><PieChartIcon /> УСПЕВАЕМОСТЬ (ОБЩАЯ)</h3>
                {analyticsData.totalFinished > 0 ? (
                    <div className="space-y-6">
                        {[
                            { label: 'ОТЛИЧНО (5)', count: analyticsData.total5, color: 'bg-green-500' },
                            { label: 'ХОРОШО (4)', count: analyticsData.total4, color: 'bg-blue-500' },
                            { label: 'УДОВЛ. (3)', count: analyticsData.total3, color: 'bg-orange-500' },
                            { label: 'НЕУД. (2)', count: analyticsData.total2, color: 'bg-red-500' },
                        ].map(stat => (
                            <div key={stat.label} className="flex items-center gap-6">
                                <span className="w-28 text-sm font-black text-slate-600">{stat.label}</span>
                                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${(stat.count / analyticsData.totalFinished) * 100}%` }} 
                                        className={`h-full ${stat.color}`} 
                                    />
                                </div>
                                <span className="w-16 text-right text-lg font-black text-slate-800">{stat.count} ЧЕЛ.</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-slate-400 italic text-center py-10">Нет завершенных тестов для аналитики</div>
                )}
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-2xl font-black italic text-slate-800 mb-8 flex items-center gap-3"><BarChartIcon /> СРЕДНИЙ ПРОЦЕНТ ГРУПП</h3>
                {analyticsData.groupStats.length > 0 ? (
                    <div className="space-y-8">
                        {analyticsData.groupStats.map(stat => (
                            <div key={stat.name}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-black text-slate-700">ГРУППА {stat.name}</span>
                                    <span className="text-xl font-black text-blue-600">{stat.avg}%</span>
                                </div>
                                <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${stat.avg}%` }} 
                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400" 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-slate-400 italic text-center py-10">Ожидание данных...</div>
                )}
            </div>

            <div className="col-span-1 md:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-2xl font-black italic text-slate-800 mb-8 flex items-center gap-3"><Users className="text-blue-500" /> ДЕТАЛЬНАЯ СТАТИСТИКА ПО ГРУППАМ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analyticsData.groupStats.map(stat => (
                        <div key={stat.name} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                             <h4 className="text-xl font-black text-blue-800 mb-6">{stat.name}</h4>
                             <div className="space-y-4">
                                 <div className="flex justify-between items-center text-sm font-bold"><span className="text-green-600">ОТЛИЧНО (5)</span> <span>{stat.counts[5]} чел.</span></div>
                                 <div className="flex justify-between items-center text-sm font-bold"><span className="text-blue-600">ХОРОШО (4)</span> <span>{stat.counts[4]} чел.</span></div>
                                 <div className="flex justify-between items-center text-sm font-bold"><span className="text-orange-600">УДОВЛ. (3)</span> <span>{stat.counts[3]} чел.</span></div>
                                 <div className="flex justify-between items-center text-sm font-bold"><span className="text-red-600">НЕУД. (2)</span> <span>{stat.counts[2]} чел.</span></div>
                             </div>
                             <div className="mt-8 pt-6 border-t-2 border-slate-200 flex justify-between items-center">
                                 <span className="text-slate-500 font-black">СРЕДНИЙ БАЛЛ:</span>
                                 <span className="text-3xl font-black text-blue-600">{stat.avg}%</span>
                             </div>
                        </div>
                    ))}
                </div>
                {analyticsData.groupStats.length === 0 && <div className="text-slate-400 italic text-center py-4">Нет завершенных тестов для отображения</div>}
            </div>
        </div>
      )}

      {/* МОДАЛКА: ИНСПЕКТОР */}
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
                        {courses.slice().sort((a, b) => a.title.localeCompare(b.title)).map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

      {/* МОДАЛКА: НАЗНАЧИТЬ ТЕСТ */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-4xl rounded-[4rem] p-10 shadow-2xl space-y-10 border-8 border-white/50">
              <div className="flex justify-between items-center border-b-2 border-slate-100 pb-8">
                <h3 className="text-4xl font-black text-blue-600 italic tracking-tighter uppercase leading-none">ПУБЛИКАЦИЯ ЗАДАНИЯ</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-3 bg-slate-100 hover:bg-red-50 rounded-3xl transition-all"><X size={32}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <select className="w-full bg-slate-50 p-7 rounded-[2.5rem] font-black text-lg shadow-inner outline-none focus:border-blue-400 border-4 border-transparent transition-all" value={selSub} onChange={e => {setSelSub(e.target.value); setSelPoolId('');}}>
                    <option value="">ДИСЦИПЛИНА...</option>
                    {courses.slice().sort((a, b) => a.title.localeCompare(b.title)).map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
                </select>
                <select className="w-full bg-slate-50 p-7 rounded-[2.5rem] font-black text-lg shadow-inner outline-none focus:border-blue-400 border-4 border-transparent transition-all" value={selGrp} onChange={e => setSelGrp(e.target.value)}>
                    <option value="">ГРУППА...</option>
                    {groups
                      .slice()
                      .sort((a, b) => {
                        const nameA = a.name || '';
                        const nameB = b.name || '';
                        if (nameA.localeCompare(nameB) !== 0) return nameA.localeCompare(nameB);
                        if (a.course !== b.course) return (a.course || 0) - (b.course || 0);
                        return (a.number || 0) - (b.number || 0);
                      })
                      .map(g => <option key={g.id} value={String(g.id)}>{g.name}-{g.course}-{g.number}</option>)}
                </select>
                
                <div className="col-span-full">
                    <select className="w-full bg-blue-50/50 p-8 rounded-[3rem] font-black text-xl border-4 border-blue-100 outline-none focus:border-blue-400 transition-all" value={selPoolId} onChange={e => setSelPoolId(e.target.value)}>
                        <option value="">{selSub ? "ВЫБЕРИТЕ ПУЛ ВОПРОСОВ..." : "СНАЧАЛА ПРЕДМЕТ"}</option>
                        {filteredPools.map(pool => <option key={pool.id} value={String(pool.id)}>{pool.docxName || pool.docx_name}</option>)}
                    </select>
                </div>

                <div className="col-span-full bg-slate-50 p-8 rounded-[3rem] shadow-inner border-2 border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-black text-slate-500 tracking-widest uppercase">КОЛИЧЕСТВО ВОПРОСОВ В БИЛЕТЕ:</span>
                        <div className="bg-blue-600 text-white px-6 py-2 rounded-2xl text-2xl shadow-lg border-2 border-blue-400">
                            {questionCount}
                        </div>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={questionCount} 
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-black mt-3 px-1">
                        <span>1 ВОПРОС</span>
                        <span>20 ВОПРОСОВ (МАКСИМУМ)</span>
                    </div>
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

const PieChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;

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