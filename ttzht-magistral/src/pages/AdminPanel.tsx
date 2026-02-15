import React, { useState, useEffect } from 'react';
import { 
  Plus, Upload, FolderPlus, Trash2, Eye, EyeOff, ChevronDown, FileText, Edit3,
  Cpu, Zap, ShieldCheck, BookOpen, Layout, Code, Atom, Calculator, 
  FlaskConical, Globe, HardDrive, Terminal, Settings, Database, Activity
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

  useEffect(() => {
    const saved = localStorage.getItem('app_subjects');
    if (saved) setSubjects(JSON.parse(saved));
  }, []);

  const saveToStorage = (newSubjects: Subject[]) => {
    setSubjects(newSubjects);
    localStorage.setItem('app_subjects', JSON.stringify(newSubjects));
  };

  const addSubject = () => {
    const newSub: Subject = { id: Date.now().toString(), title: '', iconName: 'Layout', color: 'from-blue-600 to-blue-700', sections: [], isHidden: false };
    saveToStorage([...subjects, newSub]);
    setExpandedSubjectId(newSub.id);
  };

  const handleFileUpload = (subjectId: string, sectionId: string, subId: string, fileName: string) => {
    const updated = subjects.map(s => {
      if (s.id === subjectId) {
        const newSections = s.sections.map(sec => {
          if (sec.id === sectionId) {
            const newSubs = sec.subSections.map(sub => {
              if (sub.id === subId) return { ...sub, lectures: [{ id: Date.now().toString(), title: fileName, fileName }] };
              return sub;
            });
            return { ...sec, subSections: newSubs };
          }
          return sec;
        });
        return { ...s, sections: newSections };
      }
      return s;
    });
    saveToStorage(updated);
    alert(`ФАЙЛ ${fileName} ЗАКРЕПЛЕН`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 md:space-y-10 font-black italic uppercase p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-sm border-0 md:border border-blue-50 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl text-[#1565c0] tracking-tighter leading-none">ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
          <p className="text-[10px] text-slate-300 mt-1 uppercase">РЕДАКТОР КУРСОВ И МАТЕРИАЛОВ</p>
        </div>
        <button onClick={addSubject} className="w-full sm:w-auto bg-[#1976d2] text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-xs">
          <Plus size={22}/> СОЗДАТЬ ПРЕДМЕТ
        </button>
      </div>

      <div className="grid gap-4 md:gap-8">
        {subjects.map(subject => (
          <div key={subject.id} className={`bg-white rounded-[2rem] md:rounded-[3.5rem] transition-all duration-500 overflow-hidden border-0 md:border-4 ${expandedSubjectId === subject.id ? 'md:border-blue-100 shadow-xl' : 'md:border-transparent shadow-sm'}`}>
            
            <div className="p-5 md:p-10 flex items-center justify-between cursor-pointer relative" onClick={() => setExpandedSubjectId(expandedSubjectId === subject.id ? null : subject.id)}>
              <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
                <div className="relative group/icon">
                  <div 
                    onClick={(e) => { e.stopPropagation(); setShowIconPicker(showIconPicker === subject.id ? null : subject.id); }}
                    className={`flex items-center justify-center aspect-square p-3 md:p-4 rounded-xl md:rounded-2xl shrink-0 transition-all hover:scale-105 active:scale-90 relative ${subject.isHidden ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 shadow-inner'}`}
                  >
                    {AVAILABLE_ICONS.find(i => i.name === subject.iconName)?.Icon ? React.createElement(AVAILABLE_ICONS.find(i => i.name === subject.iconName)!.Icon, { size: 24 }) : <Layout size={24}/>}
                    <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-md border border-blue-100 text-blue-600"><Edit3 size={10}/></div>
                  </div>
                  
                  <AnimatePresence>
                    {showIconPicker === subject.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute top-full left-0 mt-4 bg-white p-4 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] z-[200] grid grid-cols-5 gap-3 border border-blue-50 w-[260px] md:w-[280px]" onClick={(e) => e.stopPropagation()}>
                        {AVAILABLE_ICONS.map((ico) => (
                          <button key={ico.name} onClick={() => { saveToStorage(subjects.map(s => s.id === subject.id ? {...s, iconName: ico.name} : s)); setShowIconPicker(null); }} className={`flex items-center justify-center aspect-square p-3 rounded-xl transition-all ${subject.iconName === ico.name ? 'bg-[#1976d2] text-white shadow-lg scale-105' : 'hover:bg-blue-50 text-slate-400'}`}><ico.Icon size={20} /></button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1 relative group/title">
                   <input placeholder="ВВЕДИТЕ НАЗВАНИЕ ПРЕДМЕТА..." className="text-base md:text-2xl text-[#1565c0] bg-transparent border-none outline-none font-black w-full truncate uppercase italic placeholder:text-blue-100" value={subject.title} onClick={(e) => e.stopPropagation()} onChange={(e) => saveToStorage(subjects.map(s => s.id === subject.id ? {...s, title: e.target.value} : s))} />
                   <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-blue-100 opacity-0 group-hover/title:opacity-100 transition-opacity"><Edit3 size={14}/></div>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-4 ml-2 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); saveToStorage(subjects.map(s => s.id === subject.id ? {...s, isHidden: !s.isHidden} : s)); }} className="p-2 text-slate-300 hover:text-blue-500">{subject.isHidden ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                <button onClick={(e) => { e.stopPropagation(); if(window.confirm('УДАЛИТЬ ПРЕДМЕТ?')) saveToStorage(subjects.filter(s => s.id !== subject.id)); }} className="p-2 text-red-300 hover:text-red-500"><Trash2 size={18}/></button>
                <ChevronDown size={24} className={`text-slate-200 transition-transform hidden sm:block ${expandedSubjectId === subject.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            <AnimatePresence>
              {expandedSubjectId === subject.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-slate-50 bg-slate-50/15">
                  <div className="p-4 md:p-10 space-y-6 md:space-y-10">
                    <button onClick={() => saveToStorage(subjects.map(s => s.id === subject.id ? {...s, sections: [...s.sections, { id: Date.now().toString(), title: '', subSections: [] }]} : s))} className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl text-blue-400 flex items-center justify-center gap-3 hover:bg-blue-50 transition-all font-black text-[10px] uppercase italic active:scale-95 shadow-sm"><FolderPlus size={18}/> ДОБАВИТЬ РАЗДЕЛ</button>
                    
                    <div className="space-y-6">
                      {subject.sections.map((section, sIdx) => (
                        <div key={section.id} className="md:ml-10 border-l-4 border-blue-100 pl-4 md:pl-8 space-y-4">
                          <div className="flex justify-between items-center bg-white p-4 md:p-5 rounded-2xl shadow-sm border-0 md:border border-slate-50 relative group/sec">
                            <div className="flex items-center gap-3 flex-1">
                               <span className="text-blue-200 text-lg font-bold">0{sIdx + 1}</span>
                               <input placeholder="НАЗВАНИЕ РАЗДЕЛА..." className="bg-transparent border-none outline-none font-black text-slate-700 w-full text-xs sm:text-base uppercase placeholder:text-slate-200" value={section.title} onChange={(e) => saveToStorage(subjects.map(s => s.id === subject.id ? {...s, sections: s.sections.map(sec => sec.id === section.id ? {...sec, title: e.target.value} : sec)} : s))} />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => saveToStorage(subjects.map(s => s.id === subject.id ? {...s, sections: s.sections.map(sec => sec.id === section.id ? {...sec, subSections: [...sec.subSections, { id: Date.now().toString(), title: '', time: '20 МИН', questionsCount: '0', status: 'active', lectures: [] }]} : sec)} : s))} className="text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg text-[8px] font-black italic shadow-sm active:scale-90">+ ПУНКТ</button>
                              <button onClick={() => saveToStorage(subjects.map(s => s.id === subject.id ? {...s, sections: s.sections.filter(sec => sec.id !== section.id)} : s))} className="text-red-300 p-1"><Trash2 size={16}/></button>
                            </div>
                          </div>

                          <div className="grid gap-3 md:ml-8">
                            {section.subSections.map((sub) => (
                              <div key={sub.id} className="bg-white/80 p-4 md:p-5 rounded-2xl border-2 border-dashed border-blue-100 space-y-4 shadow-sm relative group/sub">
                                <div className="flex justify-between items-center gap-2">
                                   <input placeholder="НАЗВАНИЕ ПОДПУНКТА..." className="bg-transparent border-none outline-none text-[#1976d2] text-xs font-black w-full uppercase placeholder:text-blue-100" value={sub.title} onChange={(e) => saveToStorage(subjects.map(s => s.id === subject.id ? {...s, sections: s.sections.map(sec => sec.id === section.id ? {...sec, subSections: sec.subSections.map(ss => ss.id === sub.id ? {...ss, title: e.target.value} : ss)} : sec)} : s))} />
                                   <button onClick={() => saveToStorage(subjects.map(s => s.id === subject.id ? {...s, sections: s.sections.map(sec => sec.id === section.id ? {...sec, subSections: sec.subSections.filter(ss => ss.id !== sub.id)} : sec)} : s))} className="text-red-200 p-1"><Trash2 size={14}/></button>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {sub.lectures.map(l => (
                                    <div key={l.id} className="flex items-center gap-1.5 bg-green-50 text-green-700 text-[8px] px-2 py-1 rounded-lg border-0 md:border border-green-100 font-black"><FileText size={10}/> {l.fileName}</div>
                                  ))}
                                  <label className="cursor-pointer bg-white text-[#1976d2] border-0 md:border-2 border-[#1976d2] px-3 py-2 rounded-xl text-[9px] flex items-center gap-2 hover:bg-[#1976d2] hover:text-white transition-all font-black italic shadow-sm active:scale-95">
                                    <Upload size={12}/> {sub.lectures.length > 0 ? 'ЗАМЕНИТЬ' : 'ЗАГРУЗИТЬ'}
                                    <input type="file" className="hidden" onChange={(e) => e.target.files && handleFileUpload(subject.id, section.id, sub.id, e.target.files[0].name)} />
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