import React, { useState, useEffect } from 'react';
import { 
  Plus, Upload, FolderPlus, Trash2, Eye, EyeOff, ChevronDown, FileText, Edit3,
  Cpu, Zap, ShieldCheck, BookOpen, Layout, Code, Atom, Calculator, 
  FlaskConical, Globe, HardDrive, Terminal, Settings, Database, Activity, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject, Section, SubSection } from '../types';

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

  const getHeaders = (isJson = true) => {
    const h: any = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    if (isJson) h['Content-Type'] = 'application/json';
    return h;
  };

  // Загрузка 
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

  // Сохранение 
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

  // Создание предмета 
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

  // Удаление 
  const deleteSubject = async (id: string) => {
    if (!window.confirm("УДАЛИТЬ ПРЕДМЕТ?")) return;
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

  //Загрузка PDF 
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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 md:space-y-10 font-black italic uppercase p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-blue-50 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl text-[#1565c0] tracking-tighter leading-none">ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
          <p className="text-[10px] text-slate-300 mt-1 uppercase">
            {isSyncing ? 'СОХРАНЕНИЕ В БД...' : 'МЕНЕДЖЕР КУРСОВ ТТЖТ'}
          </p>
        </div>
        <button onClick={addSubject} className="w-full sm:w-auto bg-[#1976d2] text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-xs">
          <Plus size={22}/> СОЗДАТЬ ПРЕДМЕТ
        </button>
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
              <ChevronDown size={24} className={`text-slate-200 transition-transform ${expandedSubjectId === subject.id ? 'rotate-180' : ''}`} />
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
                            <button onClick={() => {
                                const updated = {...subject, sections: subject.sections.map(sec => sec.id === section.id ? {...sec, subSections: [...sec.subSections, { id: Date.now().toString(), title: 'НОВЫЙ ПУНКТ', time: '20 МИН', status: 'active', lectures: [] }]} : sec)};
                                setSubjects(subjects.map(s => s.id === subject.id ? updated : s));
                                syncWithServer(updated);
                            }} className="text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg text-[8px] font-black">+ ПУНКТ</button>
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
                                    <div key={l.id} className="flex items-center gap-2 bg-green-50 text-green-700 text-[8px] px-2 py-1 rounded-lg border border-green-100 font-black">
                                      <FileText size={10}/> {l.title}
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
    </div>
  );
};