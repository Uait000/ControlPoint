import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Upload, FolderPlus, Trash2, Eye, EyeOff, ChevronDown, FileText, 
  Cpu, Zap, ShieldCheck, BookOpen, Layout, Code, Atom, Calculator, 
  FlaskConical, Globe, HardDrive, Terminal, Settings, Database, Activity, 
  UserPlus, X, ZoomIn, ZoomOut, Search, Check, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject } from '../types';
import { API_BASE_URL } from '../api';

interface DBTeacher {
  id?: number;
  teacher_id?: number; 
  name: string;
}

const AVAILABLE_ICONS = [
  { name: 'Cpu', Icon: Cpu }, { name: 'Zap', Icon: Zap }, { name: 'ShieldCheck', Icon: ShieldCheck },
  { name: 'BookOpen', Icon: BookOpen }, { name: 'Layout', Icon: Layout }, { name: 'Code', Icon: Code },
  { name: 'Atom', Icon: Atom }, { name: 'Calculator', Icon: Calculator }, { name: 'FlaskConical', Icon: FlaskConical },
  { name: 'Globe', Icon: Globe }, { name: 'HardDrive', Icon: HardDrive }, { name: 'Terminal', Icon: Terminal },
  { name: 'Settings', Icon: Settings }, { name: 'Database', Icon: Database }, { name: 'Activity', Icon: Activity }
];

export const AdminPanel = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dbTeachers, setDbTeachers] = useState<DBTeacher[]>([]); 
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Управление модалкой и ролями
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminRole, setAdminRole] = useState<'SystemAdmin' | 'AssistantAdmin' | null>(null);
  
  // Поля формы назначения помощника
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [masterKey, setMasterKey] = useState('');

  // Состояния кастомного выпадающего списка учителей
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [uiScale, setUiScale] = useState(1.0);

  const getHeaders = (isJson = true) => {
    const h: any = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    if (isJson) h['Content-Type'] = 'application/json';
    return h;
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/storage/courses', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (e) {
      console.error("ОШИБКА ЗАГРУЗКИ КУРСОВ:", e);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/auth/teachers', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        console.log("ДАННЫЕ ПРЕПОДАВАТЕЛЕЙ:", data); 
        const sortedTeachers = (data || []).sort((a: DBTeacher, b: DBTeacher) => a.name.localeCompare(b.name, 'ru'));
        setDbTeachers(sortedTeachers);
      }
    } catch (e) {
      console.error("ОШИБКА ЗАГРУЗКИ ПРЕПОДАВАТЕЛЕЙ:", e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token.includes('.')) {
      try {
        const payloadPart = token.split('.')[1];
        const decodedPayload = JSON.parse(window.atob(payloadPart));
        
        if (decodedPayload.id === 0 || decodedPayload.account_type === 'SystemAdmin') {
          setAdminRole('SystemAdmin');
        } else if (decodedPayload.account_type === 'AssistantAdmin') {
          setAdminRole('AssistantAdmin');
        }
      } catch (e) {
        console.error("Ошибка парсинга JWT:", e);
        setAdminRole(null);
      }
    }
    fetchSubjects();
    fetchTeachers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTeacherDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const syncWithServer = async (subject: Subject) => {
    setIsSyncing(true);
    try {
      const res = await fetch(API_BASE_URL + `/storage/courses/${subject.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(subject)
      });
      if (!res.ok) throw new Error();
    } catch (e) {
      console.error("ОШИБКА СИНХРОНИЗАЦИИ");
    } finally {
      setIsSyncing(false);
    }
  };

  const addSubject = async () => {
    const newSubData = { 
        id: "0", 
        title: 'НОВЫЙ ПРЕДМЕТ', 
        iconName: 'Layout', 
        color: 'from-blue-600 to-blue-700', 
        sections: [], 
        isHidden: false 
    };
    
    try {
        const res = await fetch(API_BASE_URL + '/storage/courses', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(newSubData)
        });
        if (res.ok) {
            const newId = await res.json();
            const created = { ...newSubData, id: newId.toString() } as Subject;
            setSubjects([...subjects, created]);
            setExpandedSubjectId(created.id);
        }
    } catch (e) {
        alert("ОШИБКА СОЗДАНИЯ ПРЕДМЕТА");
    }
  };

  const deleteSubject = async (id: string) => {
    if (!window.confirm("УДАЛИТЬ ВЕСЬ ПРЕДМЕТ СО ВСЕМИ ДАННЫМИ?")) return;
    try {
      const res = await fetch(API_BASE_URL + `/storage/courses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(false)
      });
      if (res.ok) setSubjects(subjects.filter(s => s.id !== id));
    } catch (e) {
      alert("ОШИБКА УДАЛЕНИЯ");
    }
  };

  const deleteSection = (subjectId: string, sectionId: string) => {
    if (!window.confirm("УДАЛИТЬ ЭТОТ РАЗДЕЛ?")) return;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const updatedSubject = {
        ...subject,
        sections: subject.sections.filter(sec => sec.id !== sectionId)
    };
    setSubjects(subjects.map(s => s.id === subjectId ? updatedSubject : s));
    syncWithServer(updatedSubject);
  };

  const deleteLecture = (subjectId: string, sectionId: string, subId: string, lectureId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const updatedSubject = {
        ...subject,
        sections: subject.sections.map(sec => {
            if (sec.id !== sectionId) return sec;
            return {
                ...sec,
                subSections: sec.subSections.map(sub => {
                    if (sub.id !== subId) return sub;
                    return { ...sub, lectures: sub.lectures.filter(l => l.id !== lectureId) };
                })
            };
        })
    };
    setSubjects(subjects.map(s => s.id === subjectId ? updatedSubject : s));
    syncWithServer(updatedSubject);
  };

  const handleFileUpload = async (subjectId: string, sectionId: string, subId: string, file: File, replaceId?: string) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await fetch(API_BASE_URL + '/storage/courses/upload', {
        method: 'POST',
        headers: getHeaders(false),
        body: formData
      });
      
      if (!uploadRes.ok) throw new Error();
      const hashedName = await uploadRes.json();

      const updated = subjects.map(s => {
        if (s.id === subjectId) {
          const newSections = s.sections.map(sec => {
            if (sec.id === sectionId) {
              const newSubs = sec.subSections.map(sub => {
                if (sub.id === subId) {
                  const newLecture = { id: Date.now().toString(), title: file.name, fileName: hashedName };
                  return { 
                    ...sub, 
                    lectures: replaceId 
                      ? sub.lectures.map(l => l.id === replaceId ? newLecture : l)
                      : [...sub.lectures, newLecture]
                  };
                }
                return sub;
              });
              return { ...sec, subSections: newSubs };
            }
            return sec;
          });
          const updatedSub = { ...s, sections: newSections };
          syncWithServer(updatedSub);
          return updatedSub;
        }
        return s;
      });
      setSubjects(updated);
      alert("ФАЙЛ ЗАГРУЖЕН");
    } catch (e) {
      alert("ОШИБКА ЗАГРУЗКИ");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !masterKey) {
        return alert("Выберите преподавателя и введите мастер-ключ сис-админа");
    }

    setIsCreatingAdmin(true);
    try {
        const res = await fetch(API_BASE_URL + '/auth/register-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': masterKey.trim()
            },
            body: JSON.stringify({ 
                teacher_id: selectedTeacherId 
            })
        });

        if (res.ok) {
            alert("ПОМОЩНИК АДМИНИСТРАТОРА УСПЕШНО НАЗНАЧЕН!");
            setSelectedTeacherId(null);
            setMasterKey(''); 
            setShowAdminModal(false);
        } else {
            alert("ОШИБКА ДОСТУПА: Проверьте правильность секретного ключа системы.");
        }
    } catch (e) {
        alert("ОШИБКА СИТЕВОГО РЕЖИМА");
    } finally {
        setIsCreatingAdmin(false);
    }
  };

  const handleForceResetPassword = async (teacherId: number, teacherName: string) => {
    if (!window.confirm(`СБРОСИТЬ СИСТЕМНЫЙ ПАРОЛЬ ДЛЯ СОТРУДНИКА: ${teacherName.toUpperCase()}?`)) return;

    try {
      const res = await fetch(API_BASE_URL + '/auth/admin-force-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ teacher_id: teacherId })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`ПАРОЛЬ УСПЕШНО СБРОШЕН! СЕЙЧАС ОТКРОЕТСЯ ИНТЕРФЕЙС ПЕЧАТИ.`);

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (!doc) return;

        const htmlContent = `
          <html>
          <head>
            <title>Учетные данные ТТЖТ</title>
            <style>
              body { font-family: sans-serif; color: #000000; padding: 40px; line-height: 1.5; }
              .border-box { border: 4px double #000000; padding: 30px; border-radius: 20px; max-width: 600px; margin: 0 auto; }
              h1 { font-size: 16px; text-align: center; font-weight: 900; text-transform: uppercase; margin-bottom: 25px; border-bottom: 2px solid #000000; padding-bottom: 10px; }
              .field { font-size: 14px; margin-bottom: 15px; font-weight: bold; }
              .val { font-family: monospace; font-size: 22px; font-weight: 900; background-color: #f1f5f9; padding: 4px 12px; border-radius: 6px; border: 1px solid #cbd5e1; }
              .warn { font-size: 11px; margin-top: 30px; border-top: 2px dashed #000000; padding-top: 15px; text-transform: uppercase; font-weight: 900; }
              .signatures { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="border-box">
              <h1>ТИХОРЕЦКИЙ ТЕХНИКУМ ЖЕЛЕЗНОДОРОЖНОГО ТРАНСПОРТА (ТТЖТ)<br>КАРТА ОПЕРАТИВНОГО ВОССТАНОВЛЕНИЯ ДОСТУПА</h1>
              <div class="field">ФИО СОТРУДНИКА: <span style="text-transform: uppercase;">${teacherName}</span></div>
              <div class="field">ЛОГИН ДЛЯ ВХОДА В СИСТЕМУ: <span class="val">${data.login}</span></div>
              <div class="field">НОВЫЙ СГЕНЕРИРОВАННЫЙ ПАРОЛЬ: <span class="val">${data.temporaryPassword}</span></div>
              <p class="warn">ВНИМАНИЕ: Данные сгенерированы главным администратором базы данных. Пароль является действующим с момента формирования бланка.</p>
              <div class="signatures">
                <div>Администратор: _________________</div>
                <div>Сотрудник: _________________</div>
              </div>
            </div>
          </body>
          </html>
        `;

        doc.open();
        doc.write(htmlContent);
        doc.close();

        iframe.contentWindow?.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => { document.body.removeChild(iframe); }, 1000);
        }, 500);

      } else {
        alert("ОШИБКА ДОСТУПА: Недостаточно прав для выполнения операции сброса.");
      }
    } catch (e) {
      alert("ОШИБКА СВЯЗИ С СЕРВЕРОМ БАЗЫ ДАННЫХ");
    }
  };

  const filteredTeachers = dbTeachers.filter(t => 
    t.name.toUpperCase().includes(teacherSearchQuery.toUpperCase())
  );

  const selectedTeacherObj = dbTeachers.find(t => (t.teacher_id ?? t.id) === selectedTeacherId);

  return (
    <div 
      className="w-full max-w-6xl mx-auto space-y-6 md:space-y-10 font-black italic uppercase p-4 md:p-8 animate-in fade-in duration-500 text-slate-700 transition-all origin-top" 
      style={{ zoom: uiScale }}
    >
      
      {/* ШАПКА С КОНТРОЛЛЕРОМ МАСШТАБА */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-blue-50 gap-6">
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-3xl md:text-5xl text-[#1565c0] tracking-tighter leading-none">ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
          <div className="flex items-center gap-4 justify-center sm:justify-start mt-2">
            <p className="text-sm md:text-base text-slate-400 uppercase font-bold">
              {adminRole === 'AssistantAdmin' ? 'РЕЖИМ ПОМОЩНИКА АДМИНА' : 'СИСТЕМНЫЙ АДМИНИСТРАТОР ТТЖТ'}
            </p>
            <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-xl overflow-hidden shadow-inner">
              <button onClick={() => setUiScale(prev => Math.max(0.7, prev - 0.1))} className="p-2 hover:bg-slate-200 text-slate-500"><ZoomOut size={20} /></button>
              <span className="w-14 text-center text-sm font-black text-slate-600 bg-white py-2 border-x-2 border-slate-100">{Math.round(uiScale * 100)}%</span>
              <button onClick={() => setUiScale(prev => Math.min(1.5, prev + 0.1))} className="p-2 hover:bg-slate-200 text-slate-500"><ZoomIn size={20} /></button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 w-full sm:w-auto">
            {/* Кнопка создания админа доступна ТОЛЬКО Главному Сис-Админу */}
            {adminRole === 'SystemAdmin' && (
              <button 
                  onClick={() => setShowAdminModal(true)} 
                  className="w-full sm:w-auto bg-slate-100 text-slate-700 px-8 py-5 md:py-6 rounded-2xl flex items-center justify-center gap-3 shadow-sm hover:bg-slate-200 active:scale-95 transition-all text-base md:text-lg border-2 border-slate-200"
              >
                  <UserPlus size={28}/> СИСТЕМНЫЙ ДОСТУП
              </button>
            )}
            
            <button onClick={addSubject} className="w-full sm:w-auto bg-[#1976d2] text-white px-8 py-5 md:py-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-base md:text-lg border-b-4 border-blue-800 hover:bg-[#1565c0]">
                <Plus size={28}/> СОЗДАТЬ ПРЕДМЕТ
            </button>
        </div>
      </div>

      {/* СПИСОК ПРЕДМЕТОВ КУРСА */}
      <div className="grid gap-6 md:gap-10">
        {subjects.map(subject => (
          <div key={subject.id} className={`bg-white rounded-[2rem] md:rounded-[3.5rem] transition-all duration-500 overflow-hidden border-4 ${expandedSubjectId === subject.id ? 'border-blue-200 shadow-2xl' : 'border-transparent shadow-md'}`}>
            <div className="p-6 md:p-10 flex items-center justify-between cursor-pointer" onClick={() => setExpandedSubjectId(expandedSubjectId === subject.id ? null : subject.id)}>
              <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                <div className="bg-blue-50 text-blue-600 p-5 rounded-2xl shrink-0">
                   {AVAILABLE_ICONS.find(i => i.name === subject.iconName)?.Icon ? React.createElement(AVAILABLE_ICONS.find(i => i.name === subject.iconName)!.Icon, { size: 36 }) : <Layout size={36}/>}
                </div>
                <div className="flex-1">
                   <input 
                    className="text-xl md:text-4xl text-[#1565c0] bg-transparent border-none outline-none font-black w-full truncate uppercase italic placeholder:text-blue-300" 
                    value={subject.title} 
                    onClick={(e) => e.stopPropagation()} 
                    onChange={(e) => setSubjects(subjects.map(s => s.id === subject.id ? {...s, title: e.target.value} : s))}
                    onBlur={() => syncWithServer(subject)}
                   />
                </div>
              </div>
              <div className="flex items-center gap-6 ml-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); deleteSubject(subject.id); }}
                    className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors"
                >
                    <Trash2 size={28} />
                </button>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <ChevronDown size={32} className={`text-slate-400 transition-transform ${expandedSubjectId === subject.id ? 'rotate-180 text-blue-600' : ''}`} />
                </div>
              </div>
            </div>

            <div className="origin-top">
              {expandedSubjectId === subject.id && (
                <div className="border-t-4 border-slate-50 bg-slate-50/30">
                  <div className="p-6 md:p-12 space-y-8">
                    <button onClick={() => {
                        const updated = {...subject, sections: [...subject.sections, { id: Date.now().toString(), title: 'НОВЫЙ РАЗДЕЛ', subSections: [] }]};
                        setSubjects(subjects.map(s => s.id === subject.id ? updated : s));
                        syncWithServer(updated);
                    }} className="w-full py-6 border-4 border-dashed border-blue-300 rounded-3xl text-blue-600 flex items-center justify-center gap-4 font-black text-lg md:text-xl uppercase italic hover:bg-blue-50 active:scale-95 shadow-sm transition-all"><FolderPlus size={28}/> ДОБАВИТЬ РАЗДЕЛ</button>
                    
                    <div className="space-y-8">
                      {subject.sections.map((section, sIdx) => (
                        <div key={section.id} className="md:ml-6 border-l-8 border-blue-200 pl-6 md:pl-10 space-y-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-md gap-4">
                            <div className="flex items-center gap-4 flex-1 w-full">
                               <span className="text-blue-400 text-2xl md:text-3xl font-black shrink-0">0{sIdx + 1}</span>
                               <input 
                                className="bg-transparent border-none outline-none font-black text-slate-800 w-full text-lg sm:text-2xl uppercase placeholder:text-slate-300" 
                                value={section.title} 
                                onChange={(e) => setSubjects(subjects.map(s => s.id === subject.id ? {...s, sections: s.sections.map(sec => sec.id === section.id ? {...sec, title: e.target.value} : sec)} : s))}
                                onBlur={() => syncWithServer(subject)}
                               />
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                              <button onClick={() => deleteSection(subject.id, section.id)} className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors">
                                  <Trash2 size={24} />
                              </button>
                              <button onClick={() => {
                                  const updated = {...subject, sections: subject.sections.map(sec => sec.id === section.id ? {...sec, subSections: [...sec.subSections, { id: Date.now().toString(), title: 'НОВЫЙ ПУНКТ', time: '20 МИН', status: 'active', lectures: [] }]} : sec)};
                                  setSubjects(subjects.map(s => s.id === subject.id ? updated : s));
                                  syncWithServer(updated);
                              }} className="flex-1 sm:flex-none text-white bg-blue-500 px-6 py-4 rounded-xl text-base md:text-lg font-black hover:bg-blue-600 shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-2">
                                <Plus size={20}/> ПУНКТ
                              </button>
                            </div>
                          </div>

                          <div className="grid gap-4 md:ml-12">
                            {section.subSections.map((sub) => (
                              <div key={sub.id} className="bg-white p-6 md:p-8 rounded-3xl border-4 border-dashed border-blue-200 space-y-6 shadow-sm">
                                <input 
                                 className="bg-transparent border-none outline-none text-[#1976d2] text-base md:text-xl font-black w-full uppercase placeholder:text-blue-300" 
                                 value={sub.title} 
                                 onChange={(e) => setSubjects(subjects.map(s => s.id === subject.id ? {...s, sections: s.sections.map(sec => sec.id === section.id ? {...sec, subSections: sec.subSections.map(ss => ss.id === sub.id ? {...ss, title: e.target.value} : ss)} : sec)} : s))}
                                 onBlur={() => syncWithServer(subject)}
                                />
                                <div className="flex flex-wrap items-center gap-4">
                                  {sub.lectures.map(l => (
                                    <div key={l.id} className="group flex items-center gap-3 bg-emerald-50 text-emerald-800 text-sm md:text-base px-4 py-3 rounded-xl border-2 border-emerald-200 font-black shadow-sm">
                                      <FileText size={20} className="text-emerald-500"/> {l.title}
                                      <button 
                                        onClick={() => deleteLecture(subject.id, section.id, sub.id, l.id)}
                                        className="ml-2 bg-white text-red-500 p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                      >
                                        <X size={16}/>
                                      </button>
                                    </div>
                                  ))}
                                  <label className="cursor-pointer bg-white text-[#1976d2] border-4 border-[#1976d2] px-6 py-3 rounded-2xl text-sm md:text-base flex items-center gap-3 hover:bg-[#1976d2] hover:text-white transition-all font-black italic shadow-md active:scale-95">
                                    <Upload size={20}/> ЗАГРУЗИТЬ PDF
                                    <input 
                                        type="file" accept=".pdf" className="hidden" 
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(subject.id, section.id, sub.id, e.target.files[0])} 
                                    />
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* МОДАЛКА: СИСТЕМНЫЙ ДОСТУП ПРЕПОДАВАТЕЛЕЙ (БЕЗ ПАРОЛЯ, С ФУНКЦИЕЙ СБРОСА) */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-8 border-8 border-slate-100 relative">
              <button onClick={() => setShowAdminModal(false)} className="absolute top-6 right-6 p-4 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-full transition-all"><X size={28}/></button>
              
              <div className="text-center space-y-4 pb-6 border-b-2 border-slate-100">
                 <div className="w-24 h-24 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <ShieldCheck size={48} />
                 </div>
                 <h3 className="text-3xl md:text-4xl font-black text-purple-800 italic tracking-tight uppercase leading-none">СИСТЕМНЫЙ ДОСТУП</h3>
                 <p className="text-sm md:text-base text-slate-500 font-bold uppercase">НАЗНАЧЕНИЕ ПОМОЩНИКА И ЭКСТРЕННЫЙ СБРОС КЛЮЧЕЙ</p>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-6">

                  {/* НАЗНАЧЕНИЕ ПРЕПОДАВАТЕЛЯ ИЗ КАСТОМНОГО DROPDOWN С УМНЫМ ПОИСКОМ */}
                  <div className="space-y-3 relative" ref={dropdownRef}>
                      <label className="text-sm md:text-base text-slate-500 font-black ml-2 uppercase">ВЫБЕРИТЕ ПРЕПОДАВАТЕЛЯ / ДИРЕКТОРА</label>
                      <div 
                        onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                        className="w-full bg-slate-50 border-4 border-slate-200 rounded-2xl px-6 py-4 text-lg md:text-xl font-black text-purple-700 outline-none flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>{selectedTeacherObj ? selectedTeacherObj.name.toUpperCase() : 'ВЫБЕРИТЕ ИЗ СПИСКА...'}</span>
                        <ChevronDown size={24} className={`transition-transform duration-300 ${isTeacherDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>

                      <AnimatePresence>
                        {isTeacherDropdownOpen && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-[1100] left-0 right-0 top-full mt-2 bg-white border-4 border-slate-100 rounded-2xl shadow-2xl p-3 space-y-3 max-h-64 flex flex-col">
                            <div className="relative flex-shrink-0">
                              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text"
                                placeholder="ПОИСК ПО ФИО (А-Я)..."
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-black italic uppercase text-slate-700 outline-none focus:border-purple-400 transition-colors"
                                value={teacherSearchQuery}
                                onChange={e => setTeacherSearchQuery(e.target.value)}
                                onClick={e => e.stopPropagation()}
                              />
                            </div>
                            <div className="overflow-y-auto flex-1 space-y-1 pr-1 custom-scrollbar">
                              {filteredTeachers.length > 0 ? (
                                filteredTeachers.map(t => {
                                  const tId = t.teacher_id ?? t.id ?? 0;
                                  const isSelected = selectedTeacherId === tId;
                                  
                                  return (
                                    <div
                                      key={tId}
                                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black italic border-2 border-transparent hover:bg-slate-50 transition-all`}
                                    >
                                      <div 
                                        className="flex-1 cursor-pointer py-1"
                                        onClick={() => {
                                          setSelectedTeacherId(tId);
                                          setIsTeacherDropdownOpen(false);
                                          setTeacherSearchQuery('');
                                        }}
                                      >
                                        <span>{t.name.toUpperCase()}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-3">
                                        
                                        {/* КНОПКА ЭКСТРЕННОГО АДМИНИСТРАТИВНОГО СБРОСА */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleForceResetPassword(tId, t.name);
                                          }}
                                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-bold tracking-tighter transition-all uppercase text-[10px]"
                                          title="Сбросить пароль сотруднику и распечатать чек-акт"
                                        >
                                          СБРОС КЛЮЧА
                                        </button>
                                        {isSelected && <Check size={16} className="text-purple-600" />}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-xs text-slate-400 text-center py-4 font-black italic">СОТРУДНИКИ НЕ НАЙДЕНЫ</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </div>

                  {/* КНОПКА ЭКСТРЕННОГО СБРОСА ДЛЯ ДИРЕКТОРА (ИСПРАВЛЕНО: ПЕРЕДАЕМ 0 ДЛЯ АВТОПОИСКА НА БЭКЕНДЕ) */}
                  <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-200 shadow-sm flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-base font-black text-amber-900 leading-none">УЧЁТНАЯ ЗАПИСЬ ДИРЕКТОРА</h4>
                      <p className="text-[10px] text-amber-600 font-bold uppercase mt-1">Экстренный сброс доступа руководства ТТЖТ</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleForceResetPassword(0, "ДИРЕКТОР ТТЖТ");
                      }}
                      className="px-5 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-black tracking-wide transition-all uppercase text-xs shadow-md active:scale-95 flex items-center gap-2"
                    >
                      <RefreshCw size={14} /> СБРОСИТЬ ПАРОЛЬ
                    </button>
                  </div>

                  {/* ПОДТВЕРЖДЕНИЕ МАСТЕР-КЛЮЧОМ */}
                  <div className="space-y-3 pt-4 border-t-2 border-slate-100">
                      <label className="text-sm md:text-base text-slate-500 font-black ml-2 uppercase">МАСТЕР-КЛЮЧ ПОДТВЕРЖДЕНИЯ ГЛАВНОГО СИС-АДМИНА</label>
                      <input 
                          type="password" 
                          required 
                          value={masterKey}
                          onChange={(e) => setMasterKey(e.target.value)}
                          className="w-full bg-orange-50 border-4 border-orange-200 rounded-2xl px-6 py-4 text-lg md:text-xl font-black text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all placeholder:text-orange-300"
                          placeholder="ВВЕДИТЕ СЕКРЕТНЫЙ КЛЮЧ СИСТЕМЫ"
                      />
                  </div>

                  <button 
                      type="submit" 
                      disabled={isCreatingAdmin}
                      className={`w-full mt-6 py-6 rounded-2xl font-black text-lg md:text-xl transition-all shadow-xl border-b-4 ${isCreatingAdmin ? 'bg-slate-300 border-slate-400 text-slate-100' : 'bg-purple-600 border-purple-800 text-white hover:bg-purple-500 active:scale-95'}`}
                  >
                      {isCreatingAdmin ? 'НАЗНАЧЕНИЕ...' : 'НАЗНАЧИТЬ ПОМОЩНИКОМ АДМИНИСТРАТОРА'}
                  </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};