import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Lock, ChevronDown, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SubjectSectionsPage = () => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>("1");

  const data = [
    {
      id: "1",
      title: "ОСНОВЫ БЕЗОПАСНОСТИ",
      subsections: [
        { id: "1.1", title: "ПОНЯТИЕ УГРОЗ", status: "active", time: "40 МИН", q: "20" },
        { id: "1.2", title: "КЛАССИФИКАЦИЯ АТАК", status: "active", time: "30 МИН", q: "15" },
      ]
    },
    {
      id: "2",
      title: "КРИПТОГРАФИЯ",
      subsections: [
        { id: "2.1", title: "СИММЕТРИЧНЫЕ ШИФРЫ", status: "locked", time: "45 МИН", q: "25" },
        { id: "2.2", title: "ХЕШ-ФУНКЦИИ", status: "locked", time: "20 МИН", q: "10" },
      ]
    }
  ];

  return (
    <div className="w-full max-w-4xl space-y-8 font-black italic uppercase">
      <div className="flex items-center gap-4 sm:gap-6">
        <button onClick={() => navigate('/')} className="bg-white p-3 sm:p-4 rounded-2xl shadow-lg text-[#1976d2]">
          <ChevronLeft size={24}/>
        </button>
        <h1 className="text-xl sm:text-3xl text-[#1565c0] leading-none">РАЗДЕЛЫ ДИСЦИПЛИНЫ</h1>
      </div>

      <div className="space-y-4">
        {data.map((section) => (
          <div key={section.id} className="bg-white rounded-[2rem] border border-[#e1eefb] overflow-hidden shadow-sm">
            <button 
              onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              className="w-full p-6 sm:p-8 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4 sm:gap-6 text-left">
                 <span className="text-3xl sm:text-4xl text-[#1976d2] opacity-20">0{section.id}</span>
                 <h3 className="text-base sm:text-xl text-slate-800 tracking-tighter">{section.title}</h3>
              </div>
              <motion.div animate={{ rotate: openSection === section.id ? 180 : 0 }}>
                <ChevronDown size={24} className="text-slate-300" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openSection === section.id && (
                <motion.div 
                  initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  className="overflow-hidden bg-slate-50/50"
                >
                  <div className="p-4 sm:p-6 space-y-3">
                    {section.subsections.map((sub) => (
                      <div 
                        key={sub.id}
                        onClick={() => sub.status !== 'locked' && navigate('/test')}
                        className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer
                          ${sub.status === 'locked' ? 'bg-white/50 border-slate-100 opacity-50' : 'bg-white border-blue-50 hover:border-[#1976d2] shadow-sm'}`}
                      >
                        <div className="flex items-center gap-4">
                           <span className="text-[#1976d2] text-sm">{sub.id}</span>
                           <div>
                              <div className="text-xs sm:text-sm text-slate-700">{sub.title}</div>
                              <div className="flex gap-3 mt-1 text-[8px] text-slate-400">
                                 <span className="flex items-center gap-1"><Clock size={10}/>{sub.time}</span>
                                 <span className="flex items-center gap-1"><CheckCircle2 size={10}/>{sub.q} ВОПРОСОВ</span>
                              </div>
                           </div>
                        </div>
                        {sub.status === 'locked' ? <Lock size={16} className="text-slate-300"/> : <Play size={18} className="text-[#1976d2] fill-[#1976d2]"/>}
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