import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronRight, CheckCircle2, AlertCircle, Info, Lock, Wifi, WifiOff } from 'lucide-react';

export const TestPage = () => {
  const [testStarted, setTestStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const totalSteps = 10;

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 relative">
      <AnimatePresence>
        {!testStarted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-[#1565c0]/90 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-12 text-center border-b-[1rem] border-[#1976d2]">
              <div className="bg-blue-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-[#1976d2] shadow-inner">
                <Lock size={48} />
              </div>
              <h2 className="text-4xl font-black text-[#1565c0] uppercase italic tracking-tighter leading-none mb-4">Тестирование активно</h2>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-10">Преподаватель Прохоров Д.С. запустил тест для вашей группы</p>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-10 border-2 border-dashed border-slate-200">
                 <div className="text-2xl font-black text-slate-700 uppercase italic mb-2 tracking-tight">Сетевые технологии 1.1</div>
                 <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">10 вопросов • 40 минут • 1 попытка</div>
              </div>
              <button onClick={() => setTestStarted(true)} className="w-full bg-[#1976d2] hover:bg-[#1565c0] text-white font-black py-7 rounded-[2.5rem] shadow-2xl transition-all uppercase italic tracking-widest text-xl">
                Начать выполнение
              </button>
              <p className="mt-6 text-[8px] font-black text-slate-300 uppercase tracking-widest">Внимание: Система анти-чит фиксирует сворачивание окна</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full bg-white p-8 rounded-[3rem] shadow-xl border border-[#e1eefb] relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-[#f0f7ff] text-[#1976d2] px-5 py-2 rounded-2xl font-black uppercase italic text-xs tracking-widest">Вопрос {currentStep} из {totalSteps}</div>
          <div className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl font-mono font-bold text-lg shadow-xl">
            <Timer size={22} className="text-orange-400" /> 38:14
          </div>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-10">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(currentStep / totalSteps) * 100}%` }} className="h-full bg-gradient-to-r from-[#1e88e5] to-[#1565c0]" />
        </div>
        <div className="space-y-8">
           <h2 className="text-3xl sm:text-5xl font-black text-slate-800 uppercase italic tracking-tighter leading-tight mb-10">Что означает аббревиатура DNS?</h2>
           <div className="grid gap-4">
              {['Domain Name System', 'Dynamic Network Service', 'Digital Node Server'].map((opt, i) => (
                <button key={i} onClick={() => setSelected(i)} className={`w-full text-left p-8 rounded-[2.5rem] border-4 transition-all flex items-center justify-between group ${selected === i ? 'bg-blue-50 border-[#1976d2] shadow-xl' : 'bg-white border-slate-50 hover:border-slate-100 hover:bg-slate-50'}`}>
                   <span className={`text-xl font-bold uppercase tracking-tight ${selected === i ? 'text-[#1565c0]' : 'text-slate-500'}`}>{opt}</span>
                   <div className={`w-8 h-8 rounded-xl border-4 flex items-center justify-center transition-all ${selected === i ? 'bg-[#1976d2] border-[#1565c0]' : 'bg-white border-slate-100'}`}>
                      {selected === i && <CheckCircle2 size={20} className="text-white"/>}
                   </div>
                </button>
              ))}
           </div>
        </div>
        <div className="mt-12 flex flex-col md:flex-row gap-6">
           <button className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white font-black py-7 rounded-[2.5rem] shadow-[0_10px_0_rgb(21,101,192)] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4 uppercase italic text-2xl tracking-tighter">
              Следующий вопрос <ChevronRight size={32}/>
           </button>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-white/70 backdrop-blur-md px-8 py-4 rounded-[2rem] border border-white shadow-sm">
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[#52b788]' : 'bg-[#ba181b] animate-ping'}`} />
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">{isOnline ? 'Сеть ТТЖТ: Стабильно' : 'Ошибка соединения: Ждите'}</span>
      </div>
    </div>
  );
};