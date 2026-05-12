import React, { useState, useEffect } from 'react';
import { 
  Plus, Upload, FolderPlus, Trash2, Eye, EyeOff, ChevronDown, FileText, Edit3,
  Cpu, Zap, ShieldCheck, BookOpen, Layout, Code, Atom, Calculator, 
  FlaskConical, Globe, HardDrive, Terminal, Settings, Database, Activity, RefreshCw, 
  UserPlus, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject, Section, SubSection, User } from '../types';

const AVAILABLE_ICONS = [
  { name: 'Cpu', Icon: Cpu }, { name: 'Zap', Icon: Zap }, { name: 'ShieldCheck', Icon: ShieldCheck },
  { name: 'BookOpen', Icon: BookOpen }, { name: 'Layout', Icon: Layout }, { name: 'Code', Icon: Code },
  { name: 'Atom', Icon: Atom }, { name: 'Calculator', Icon: Calculator }, { name: 'FlaskConical', Icon: FlaskConical },
  { name: 'Globe', Icon: Globe }, { name: 'HardDrive', Icon: HardDrive }, { name: 'Terminal', Icon: Terminal },
  { name: 'Settings', Icon: Settings }, { name: 'Database', Icon: Database }, { name: 'Activity', Icon: Activity }
];

export const AdminPanel = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminFirstName, setNewAdminFirstName] = useState(''); 
  const [newAdminSecondName, setNewAdminSecondName] = useState(''); 
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [isSystemAdmin, setIsSystemAdmin] = useState(true);

  const getHeaders = (isJson = true) => {
    const h: any = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    if (isJson) h['Content-Type'] = 'application/json';
    return h;
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/storage/courses', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (e) {
      console.error("ОШИБКА ЗАГРУЗКИ:", e);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const syncWithServer = async (subject: Subject) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/storage/courses/${subject.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(subject)
      });
      if (!res.ok) throw new Error();
    } catch (e) {
      console.error("ОШИБКА СОХРАНЕНИЯ");
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
        const res = await fetch('/storage/courses', {
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
      const res = await fetch(`/storage/courses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(false)
      });
      if (res.ok) setSubjects(subjects.filter(s => s.id !== id));
    } catch (e) {
      alert("ОШИБКА УДАЛЕНИЯ");
    }
  };

  //  УДАЛЕНИЯ РАЗДЕЛА 
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

  // УДАЛЕНИЯ ЛЕКЦИИ (ФАЙЛА)
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
                    return {
                        ...sub,
                        lectures: sub.lectures.filter(l => l.id !== lectureId)
                    };
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
      const uploadRes = await fetch('/storage/courses/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
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
    if (!newAdminEmail || !newAdminPassword || !newAdminFirstName || !newAdminSecondName) {
        return alert("Заполните все поля");
    }
    
    setIsCreatingAdmin(true);
    try {
        const res = await fetch('/auth/register-admin', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ 
                email: newAdminEmail, 
                password: newAdminPassword,
                first_name: newAdminFirstName,
                second_name: newAdminSecondName
            })
        });

        if (res.ok) {
            alert("АДМИНИСТРАТОР УСПЕШНО СОЗДАН!");
            setNewAdminEmail('');
            setNewAdminPassword('');
            setNewAdminFirstName('');
            setNewAdminSecondName('');
            setShowAdminModal(false);
        } else {
            const errorData = await res.json().catch(() => null);
            if (res.status === 403) {
                alert("ОШИБКА ДОСТУПА: Только Системный Администратор может создавать новых админов.");
                setIsSystemAdmin(false);
                setShowAdminModal(false);
            } else {
                alert(`ОШИБКА: ${errorData?.message || 'Не удалось создать администратора'}`);
            }
        }
    } catch (e) {
        alert("ОШИБКА СЕТИ");
    } finally {
        setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 md:space-y-10 font-black italic uppercase p-4 md:p-8 animate-in fade-in duration-500 text-slate-700">
      
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-blue-50 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl text-[#1565c0] tracking-tighter leading-none">ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
          <p className="text-[10px] text-slate-300 mt-1 uppercase">
            {isSyncing ? 'СОХРАНЕНИЕ В БД...' : 'МЕНЕДЖЕР КУРСОВ ТТЖТ'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
            {isSystemAdmin && (
              <button 
                  onClick={() => setShowAdminModal(true)} 
                  className="w-full sm:w-auto bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-sm hover:bg-slate-200 active:scale-95 transition-all text-xs border border-slate-200"
              >
                  <UserPlus size={22}/> НОВЫЙ АДМИН
              </button>
            )}
            <button onClick={addSubject} className="w-full sm:w-auto bg-[#1976d2] text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-xs border-b-4 border-blue-800">
                <Plus size={22}/> СОЗДАТЬ ПРЕДМЕТ
            </button>
        </div>
      </div>

      <div className="grid gap-4 md:gap-8">
        {subjects.map(subject => (
          <div key={subject.id} className={`bg-white rounded-[2rem] md:rounded-[3.5rem] transition-all duration-500 overflow-hidden border-4 ${expandedSubjectId === subject.id ? 'border-blue-100 shadow-xl' : 'border-transparent shadow-sm'}`}>
            <div className="p-5 md:p-10 flex items-center justify-between cursor-pointer" onClick={() => setExpandedSubjectId(expandedSubjectId === subject.id ? null : subject.id)}>
              <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
                <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl shrink-0">
                   {AVAILABLE_ICONS.find(i => i.name === subject.iconName)?.Icon ? React.createElement(AVAILABLE_ICONS.find(i => i.name === subject.iconName)!.Icon, { size: 24 }) : <Layout size={24}/>}
                </div>
                <div className="flex-1">
                   <input 
                    className="text-base md:text-2xl text-[#1565c0] bg-transparent border-none outline-none font-black w-full truncate uppercase italic" 
                    value={subject.title} 
                    onClick={(e) => e.stopPropagation()} 
                    onChange={(e) => setSubjects(subjects.map(s => s.id === subject.id ? {...s, title: e.target.value} : s))}
                    onBlur={() => syncWithServer(subject)}
                   />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); deleteSubject(subject.id); }}
                    className="p-3 text-red-400 hover:text-red-600 transition-colors"
                    title="УДАЛИТЬ ПРЕДМЕТ"
                >
                    <Trash2 size={24} />
                </button>
                <ChevronDown size={24} className={`text-slate-200 transition-transform ${expandedSubjectId === subject.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            <AnimatePresence>
              {expandedSubjectId === subject.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-50 bg-slate-50/15 overflow-hidden">
                  <div className="p-4 md:p-10 space-y-6">
                    <button onClick={() => {
                        const updated = {...subject, sections: [...subject.sections, { id: Date.now().toString(), title: 'НОВЫЙ РАЗДЕЛ', subSections: [] }]};
                        setSubjects(subjects.map(s => s.id === subject.id ? updated : s));
                        syncWithServer(updated);
                    }} className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl text-blue-400 flex items-center justify-center gap-3 font-black text-[10px] uppercase italic active:scale-95 shadow-sm"><FolderPlus size={18}/> ДОБАВИТЬ РАЗДЕЛ</button>
                    
                    <div className="space-y-6">
                      {subject.sections.map((section, sIdx) => (
                        <div key={section.id} className="md:ml-10 border-l-4 border-blue-100 pl-4 md:pl-8 space-y-4">
                          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3 flex-1">
                               <span className="text-blue-200 text-lg font-bold">0{sIdx + 1}</span>
                               <input 
                                className="bg-transparent border-none outline-none font-black text-slate-700 w-full text-xs sm:text-base uppercase" 
                                value={section.title} 
                                onChange={(e) => setSubjects(subjects.map(s => s.id === subject.id ? {...s, sections: s.sections.map(sec => sec.id === section.id ? {...sec, title: e.target.value} : sec)} : s))}
                                onBlur={() => syncWithServer(subject)}
                               />
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => deleteSection(subject.id, section.id)} className="p-2 text-red-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                                <button onClick={() => {
                                    const updated = {...subject, sections: subject.sections.map(sec => sec.id === section.id ? {...sec, subSections: [...sec.subSections, { id: Date.now().toString(), title: 'НОВЫЙ ПУНКТ', time: '20 МИН', status: 'active', lectures: [] }]} : sec)};
                                    setSubjects(subjects.map(s => s.id === subject.id ? updated : s));
                                    syncWithServer(updated);
                                }} className="text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg text-[8px] font-black">+ ПУНКТ</button>
                            </div>
                          </div>

                          <div className="grid gap-3 md:ml-8">
                            {section.subSections.map((sub) => (
                              <div key={sub.id} className="bg-white/80 p-4 md:p-5 rounded-2xl border-2 border-dashed border-blue-100 space-y-4">
                                <input 
                                 className="bg-transparent border-none outline-none text-[#1976d2] text-xs font-black w-full uppercase" 
                                 value={sub.title} 
                                 onChange={(e) => setSubjects(subjects.map(s => s.id === subject.id ? {...s, sections: s.sections.map(sec => sec.id === section.id ? {...sec, subSections: sec.subSections.map(ss => ss.id === sub.id ? {...ss, title: e.target.value} : ss)} : sec)} : s))}
                                 onBlur={() => syncWithServer(subject)}
                                />
                                <div className="flex flex-wrap items-center gap-2">
                                  {sub.lectures.map(l => (
                                    <div key={l.id} className="group flex items-center gap-2 bg-green-50 text-green-700 text-[8px] px-2 py-1 rounded-lg border border-green-100 font-black">
                                      <FileText size={10}/> {l.title}
                                      <button 
                                        onClick={() => deleteLecture(subject.id, section.id, sub.id, l.id)}
                                        className="ml-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                                      >
                                        <X size={12}/>
                                      </button>
                                    </div>
                                  ))}
                                  <label className="cursor-pointer bg-white text-[#1976d2] border-2 border-[#1976d2] px-3 py-2 rounded-xl text-[9px] flex items-center gap-2 hover:bg-[#1976d2] hover:text-white transition-all font-black italic shadow-sm active:scale-95">
                                    <Upload size={12}/> ЗАГРУЗИТЬ PDF
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl space-y-6 border-8 border-white/50 relative">
              <button onClick={() => setShowAdminModal(false)} className="absolute top-6 right-6 p-3 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all"><X size={24}/></button>
              
              <div className="text-center space-y-2 pb-4">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} />
                 </div>
                 <h3 className="text-2xl font-black text-blue-800 italic tracking-tighter uppercase leading-none">СИСТЕМНЫЙ ДОСТУП</h3>
                 <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">РЕГИСТРАЦИЯ НОВОГО АДМИНИСТРАТОРА</p>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <label className="text-[9px] text-slate-400 font-black tracking-widest ml-2">ИМЯ</label>
                          <input 
                              type="text" required value={newAdminFirstName}
                              onChange={(e) => setNewAdminFirstName(e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all uppercase"
                              placeholder="НАТАЛЬЯ"
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[9px] text-slate-400 font-black tracking-widest ml-2">ФАМИЛИЯ</label>
                          <input 
                              type="text" required value={newAdminSecondName}
                              onChange={(e) => setNewAdminSecondName(e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all uppercase"
                              placeholder="ИСАЕНКО"
                          />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-[9px] text-slate-400 font-black tracking-widest ml-2">EMAIL (ЛОГИН)</label>
                      <input 
                          type="email" required value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all lowercase"
                          placeholder="admin@ttzht.ru"
                      />
                  </div>

                  <div className="space-y-2">
                      <label className="text-[9px] text-slate-400 font-black tracking-widest ml-2">ПАРОЛЬ (МИН. 8 СИМВОЛОВ)</label>
                      <div className="relative">
                          <input 
                              type={showAdminPassword ? "text" : "password"}
                              required minLength={8} value={newAdminPassword}
                              onChange={(e) => setNewAdminPassword(e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-5 pr-12 py-3 text-sm font-black text-slate-700 outline-none focus:border-blue-400 focus:bg-white transition-all"
                              placeholder="********"
                          />
                          <button 
                              type="button" 
                              onClick={() => setShowAdminPassword(!showAdminPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                          >
                              {showAdminPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                          </button>
                      </div>
                  </div>

                  <button 
                      type="submit" 
                      disabled={isCreatingAdmin}
                      className={`w-full mt-4 py-4 rounded-xl font-black text-sm transition-all shadow-lg border-b-4 ${isCreatingAdmin ? 'bg-slate-300 border-slate-400 text-slate-100' : 'bg-green-50 border-green-700 text-white hover:bg-green-600 active:scale-95'}`}
                  >
                      {isCreatingAdmin ? 'СОЗДАНИЕ...' : 'ЗАРЕГИСТРИРОВАТЬ АДМИНА'}
                  </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};