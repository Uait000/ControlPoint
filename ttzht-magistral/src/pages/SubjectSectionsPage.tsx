import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, BookOpen, FileText, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject } from '../types';

export const SubjectSectionsPage = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Состояния для PDF-просмотра
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch('/courses', {
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
      const response = await fetch(`/courses/file/${fileId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) throw new Error();
      
      const blob = await response.blob();
      // КРИТИЧНО: Создаем Blob именно с типом PDF
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      
      setPdfUrl(url);
      setCurrentTitle(title);
    } catch (e) {
      alert("ОШИБКА ДОСТУПА К ФАЙЛУ");
    } finally {
      setIsProcessing(false);
    }
  };

  const closePdf = () => {
    if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setCurrentTitle("");
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-[#1976d2] italic uppercase">АНАЛИЗ МАТЕРИАЛОВ ТТЖТ...</div>;
  if (!subject) return <div className="p-20 text-center font-black uppercase italic">ПРЕДМЕТ НЕ НАЙДЕН</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 font-black italic uppercase text-slate-700">
      
      {/* МОДАЛЬНОЕ ОКНО С ИДЕАЛЬНЫМ PDF */}
      <AnimatePresence>
        {pdfUrl && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-900/95 backdrop-blur-md p-2 md:p-10 flex flex-col items-center"
          >
            <div className="w-full max-w-6xl flex justify-between items-center text-white mb-4 px-4">
               <div className="flex items-center gap-3">
                 <FileText className="text-blue-400" />
                 <h3 className="text-sm md:text-xl truncate max-w-[200px] md:max-w-md">{currentTitle}</h3>
               </div>
               <div className="flex items-center gap-4">
                 <button 
                  onClick={() => window.open(pdfUrl, '_blank')}
                  className="hidden md:flex items-center gap-2 text-[10px] bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all"
                 >
                   <ExternalLink size={14}/> ВО ВСЮ ВКЛАДКУ
                 </button>
                 <button onClick={closePdf} className="p-2 md:p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg">
                   <X size={24}/>
                 </button>
               </div>
            </div>
            
            <div className="w-full max-w-6xl h-full bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              {/* Используем тег <embed> для нативного просмотра PDF */}
              <embed 
                src={`${pdfUrl}#toolbar=1&navpanes=0`} 
                type="application/pdf" 
                className="w-full h-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-[#1976d2] transition-all text-xs mb-8 inline-flex group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> НАЗАД К ПРЕДМЕТАМ
      </Link>

      <div className={`p-8 md:p-14 rounded-[3rem] bg-gradient-to-br ${subject.color || 'from-blue-600 to-blue-800'} text-white shadow-2xl mb-12 relative overflow-hidden`}>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl tracking-tighter leading-none">{subject.title}</h1>
          <p className="text-[10px] opacity-70 mt-4 tracking-widest">ПРОГРАММА ОБУЧЕНИЯ • ТТЖТ</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 -mr-20 -mt-20 rounded-full blur-3xl" />
      </div>

      <div className="space-y-12 pb-20">
        {subject.sections.map((section, idx) => (
          <div key={section.id} className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl text-blue-100 font-bold">0{idx + 1}</span>
              <h2 className="text-xl text-slate-800 tracking-tight">{section.title}</h2>
            </div>

            <div className="grid gap-4 md:ml-12">
              {section.subSections.map(sub => (
                <div key={sub.id} className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-slate-50 hover:border-blue-100 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-sm text-[#1976d2] leading-tight mb-1">{sub.title}</h3>
                      <span className="text-[9px] text-slate-300 font-black tracking-widest">{sub.time}</span>
                    </div>
                    <BookOpen size={20} className="text-blue-100 group-hover:text-[#1976d2] transition-colors" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sub.lectures.map(lecture => (
                      <button 
                        key={lecture.id}
                        disabled={isProcessing}
                        onClick={() => openPdf(lecture.fileName, lecture.title)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[9px] font-black transition-all shadow-md active:scale-95 ${
                          isProcessing 
                          ? 'bg-slate-100 text-slate-400 cursor-wait' 
                          : 'bg-[#1976d2] text-white hover:bg-[#1565c0]'
                        }`}
                      >
                        <FileText size={14}/> {lecture.title}
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