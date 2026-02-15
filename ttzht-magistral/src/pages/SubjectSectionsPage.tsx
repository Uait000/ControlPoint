import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen, Lock, ChevronDown, Clock, CheckCircle2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject, SubSection } from '../types';

export const SubjectSectionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('app_subjects');
    if (saved) {
      const allSubjects: Subject[] = JSON.parse(saved);
      const found = allSubjects.find(s => s.id === id);
      if (found) {
        setSubject(found);
        if (found.sections.length > 0) setOpenSection(found.sections[0].id);
      }
    }
  }, [id]);

  // --- ИСПРАВЛЕННАЯ ЛОГИКА ОТКРЫТИЯ ---
  const handleOpenLecture = (sub: SubSection) => {
    if (sub.lectures && sub.lectures.length > 0) {
      const fileName = sub.lectures[0].fileName;
      // Путь '/' означает корень папки public
      const fileUrl = `/${fileName}`;
      
      console.log("Запрос к файлу:", fileUrl);
      window.open(fileUrl, '_blank');
    } else {
      alert("ЛЕКЦИЯ ЕЩЕ НЕ ЗАГРУЖЕНА ПРЕПОДАВАТЕЛЕМ");
    }
  };

  if (!subject) return <div className="p-20 text-center font-black uppercase italic">ПРЕДМЕТ НЕ НАЙДЕН</div>;

  return (
    <div className="w-full max-w-4xl space-y-8 font-black italic uppercase animate-in slide-in-from-bottom-10 duration-700">
      <div className="flex items-center gap-6">
        <button onClick={() => navigate('/')} className="bg-white p-4 rounded-[1.5rem] shadow-xl text-[#1976d2] hover:scale-110 transition-all border border-blue-50">
          <ChevronLeft size={28}/>
        </button>
        <div>
           <h1 className="text-2xl sm:text-4xl text-[#1565c0] tracking-tighter leading-none">РАЗДЕЛЫ ДИСЦИПЛИНЫ</h1>
           <p className="text-[#1976d2] text-sm opacity-50 mt-1">{subject.title}</p>
        </div>
      </div>

      <div className="space-y-6">
        {subject.sections.map((section, idx) => (
          <div key={section.id} className="bg-white rounded-[2.5rem] border border-[#e1eefb] overflow-hidden shadow-lg shadow-blue-900/5">
            <button 
              onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              className="w-full p-8 sm:p-10 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-6 text-left">
                 <span className="text-4xl sm:text-5xl text-[#1976d2] opacity-10">0{idx + 1}</span>
                 <h3 className="text-lg sm:text-2xl text-slate-800 tracking-tighter">{section.title}</h3>
              </div>
              <motion.div animate={{ rotate: openSection === section.id ? 180 : 0 }}>
                <ChevronDown size={32} className="text-slate-300" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openSection === section.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-slate-50/30"
                >
                  <div className="p-4 sm:p-10 space-y-4">
                    {section.subSections.map((sub, sIdx) => (
                      <div 
                        key={sub.id}
                        onClick={() => sub.status !== 'locked' && handleOpenLecture(sub)}
                        className={`group flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all cursor-pointer
                          ${sub.status === 'locked' ? 'bg-white/50 border-slate-100 opacity-50' : 'bg-white border-blue-50 hover:border-[#1976d2] shadow-md hover:shadow-blue-100'}`}
                      >
                        <div className="flex items-center gap-6">
                           <span className="text-[#1976d2] text-lg font-bold opacity-40">{idx + 1}.{sIdx + 1}</span>
                           <div>
                              <div className="text-sm sm:text-lg text-slate-700 group-hover:text-[#1976d2] transition-colors">{sub.title}</div>
                              <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-black">
                                 <span className="flex items-center gap-1.5"><Clock size={14}/> {sub.time}</span>
                                 {sub.lectures && sub.lectures.length > 0 && (
                                   <span className="flex items-center gap-1.5 text-green-500"><FileText size={14}/> МАТЕРИАЛ ГОТОВ</span>
                                 )}
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {sub.status === 'locked' ? (
                            <Lock size={20} className="text-slate-300"/>
                          ) : (
                            <div className="bg-blue-50 p-4 rounded-2xl text-[#1976d2] group-hover:bg-[#1976d2] group-hover:text-white transition-all shadow-sm">
                              <BookOpen size={20} />
                            </div>
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
    </div>
  );
};