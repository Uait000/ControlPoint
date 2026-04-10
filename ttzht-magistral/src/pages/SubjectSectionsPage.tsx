import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, BookOpen, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject } from '../types';

export const SubjectSectionsPage = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch('/storage/courses', {
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
      const response = await fetch(`/storage/courses/file/${fileId}`, {
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

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-[#1976d2] italic uppercase">АНАЛИЗ ТТЖТ...</div>;
  if (!subject) return <div className="p-20 text-center font-black uppercase italic">ПРЕДМЕТ НЕ НАЙДЕН</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 font-black italic uppercase text-slate-700">
      <AnimatePresence>
        {pdfUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-slate-900/95 backdrop-blur-md p-2 md:p-10 flex flex-col items-center">
            <div className="w-full max-w-6xl flex justify-between items-center text-white mb-4 px-4">
               <div className="flex items-center gap-3">
                 <FileText className="text-blue-400" />
                 <h3 className="text-sm md:text-xl truncate max-w-[200px] md:max-w-md">{currentTitle}</h3>
               </div>
               <button onClick={() => setPdfUrl(null)} className="p-2 md:p-3 bg-red-500 rounded-full"><X size={24}/></button>
            </div>
            <div className="w-full max-w-6xl h-full bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <embed src={pdfUrl} type="application/pdf" className="w-full h-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-[#1976d2] mb-8 inline-flex group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> НАЗАД
      </Link>

      <div className={`p-8 md:p-14 rounded-[3rem] bg-gradient-to-br ${subject.color || 'from-blue-600 to-blue-800'} text-white shadow-2xl mb-12`}>
        <h1 className="text-3xl md:text-5xl tracking-tighter leading-none">{subject.title}</h1>
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
                      <h3 className="text-sm text-[#1976d2] mb-1">{sub.title}</h3>
                      <span className="text-[9px] text-slate-300 font-black tracking-widest">{sub.time}</span>
                    </div>
                    <BookOpen size={20} className="text-blue-100 group-hover:text-[#1976d2]" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sub.lectures.map(lecture => (
                      <button key={lecture.id} onClick={() => openPdf(lecture.fileName, lecture.title)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-[9px] font-black bg-[#1976d2] text-white shadow-md">
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