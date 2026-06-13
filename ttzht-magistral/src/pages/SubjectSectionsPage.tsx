import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, BookOpen, FileText, X, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject } from '../types';
import { API_BASE_URL } from '../api';

export const SubjectSectionsPage = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [uiScale, setUiScale] = useState(1.0);
  
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch(API_BASE_URL +'/storage/courses', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const all: Subject[] = await res.json();
          const current = all.find(s => s.id === id);
          setSubject(current || null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [id]);

  const openPdf = async (fileId: string, title: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(API_BASE_URL +`/storage/courses/file/${fileId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      setPdfUrl(url);
      setCurrentTitle(title);
    } catch (e) {
      alert("ОШИБКА ДОСТУПА К ФАЙЛУ");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-[#1976d2] italic uppercase text-xl">АНАЛИЗ ТТЖТ...</div>;
  if (!subject) return <div className="p-20 text-center font-black uppercase italic text-xl">ПРЕДМЕТ НЕ НАЙДЕН</div>;

  return (
    <div 
      className="w-full max-w-5xl mx-auto p-4 md:p-8 font-black italic uppercase text-slate-700 transition-all origin-top select-none"
      style={{ zoom: uiScale }}
    >
      <AnimatePresence>
        {pdfUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-slate-900/95 backdrop-blur-md p-2 md:p-10 flex flex-col items-center">
            <div className="w-full max-w-6xl flex justify-between items-center text-white mb-4 px-4">
               <div className="flex items-center gap-3">
                 <FileText className="text-blue-400" />
                 <h3 className="text-sm md:text-xl truncate max-w-[200px] md:max-w-md">{currentTitle}</h3>
               </div>
               <button onClick={() => setPdfUrl(null)} className="p-2 md:p-3 bg-red-500 rounded-full text-white"><X size={24}/></button>
            </div>
            <div className="w-full max-w-6xl h-full bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <embed src={pdfUrl} type="application/pdf" className="w-full h-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ВЕРХНЯЯ ПАНЕЛЬ: НАЗАД И МАСШТАБИРОВАНИЕ */}
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-[#1976d2] inline-flex group tracking-wider text-sm">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> НАЗАД НА ГЛАВНУЮ
        </Link>

        <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl overflow-hidden h-[42px]">
          <button onClick={() => setUiScale(prev => Math.max(0.7, prev - 0.1))} className="p-2.5 hover:bg-slate-200 text-slate-400"><ZoomOut size={16} /></button>
          <span className="w-12 text-center text-xs font-black text-slate-500 bg-white py-1.5">{Math.round(uiScale * 100)}%</span>
          <button onClick={() => setUiScale(prev => Math.min(1.4, prev + 0.1))} className="p-2.5 hover:bg-slate-200 text-slate-400"><ZoomIn size={16} /></button>
        </div>
      </div>

{/* ХЕДЕР ПРЕДМЕТА */}
      <div className={`p-10 md:p-16 rounded-[3rem] bg-gradient-to-br ${subject.color || 'from-blue-600 to-blue-800'} text-white shadow-2xl mb-12 relative overflow-hidden`}>
        <div className="absolute right-6 bottom-4 opacity-10 text-white pointer-events-none">
          <BookOpen size={160} />
        </div>
        <div className="flex flex-col items-start gap-3 relative z-10">
          <span className="bg-white/20 border border-white/30 text-white text-[10px] md:text-xs px-3 py-1 rounded-full font-black uppercase tracking-widest italic w-fit">
            УЧЕБНЫЙ КУРС ДИСЦИПЛИНЫ
          </span>
          <h1 className="text-3xl md:text-6xl tracking-tighter leading-tight font-black uppercase italic break-words w-full">
            {subject.title}
          </h1>
        </div>
      </div>

      {/* РАЗДЕЛЫ КУРСА */}
      <div className="space-y-12 pb-20">
        {subject.sections.map((section, idx) => (
          <div key={section.id} className="space-y-6">
            <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-2">
              <span className="text-4xl md:text-5xl text-blue-500/20 font-black">0{idx + 1}</span>
              <h2 className="text-xl md:text-2xl text-slate-800 tracking-tight font-black">{section.title}</h2>
            </div>
            
            <div className="grid gap-4 md:ml-12">
              {section.subSections.map(sub => (
                <div key={sub.id} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border-2 border-slate-50 hover:border-blue-100 transition-all group">
                  <div className="flex justify-between items-start mb-6 gap-4">
                    <div>
                      {/* Увеличен размер названия пункта */}
                      <h3 className="text-base md:text-xl text-[#1976d2] mb-2 font-black tracking-tight">{sub.title}</h3>
                      <span className="text-[10px] md:text-xs text-slate-400 font-black tracking-widest bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{sub.time}</span>
                    </div>
                    <BookOpen size={22} className="text-blue-100 group-hover:text-[#1976d2] shrink-0 transition-colors" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {sub.lectures.map(lecture => (
                      <button key={lecture.id} onClick={() => openPdf(lecture.fileName, lecture.title)} className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-[10px] md:text-xs font-black bg-[#1976d2] text-white shadow-md active:scale-95 transition-transform tracking-wider">
                        <FileText size={14} className="text-blue-200"/> {lecture.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};