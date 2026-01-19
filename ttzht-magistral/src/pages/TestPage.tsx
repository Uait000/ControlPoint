import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronRight, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const TestPage = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 10;

  // Расчет процента прогресса для визуальной полоски
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
      
      {/* ВЕРХНЯЯ ПАНЕЛЬ: ПРОГРЕСС */}
      <div className="w-full bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              Вопрос {currentStep} из {totalSteps}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl font-mono font-bold text-sm shadow-lg shadow-slate-200">
            <Timer size={18} className="text-orange-400" />
            <span>38:14</span>
          </div>
        </div>

        {/* Интерактивная полоса прогресса */}
        <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]"
          />
        </div>
        
        {/* Точки-шаги сверху (как на твоем скетче) */}
        <div className="flex justify-between mt-6 px-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <div 
              key={num} 
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500
                ${num === currentStep ? 'bg-orange-400 text-white scale-110 shadow-lg shadow-orange-200' : 
                  num < currentStep ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-300'}`}
            >
              {num < currentStep ? <CheckCircle2 size={20} /> : num}
            </div>
          ))}
          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 font-black italic">
            ...
          </div>
        </div>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ: ВОПРОС */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full bg-white p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative"
        >
          {/* Декоративный элемент "XP" */}
          <div className="absolute -top-4 -right-4 bg-yellow-400 text-slate-900 px-4 py-2 rounded-2xl font-black text-sm rotate-12 shadow-lg">
            +50 XP
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-800 uppercase italic mb-10 tracking-tighter leading-tight">
            Сколько $2 + 2$?
          </h2>
          
          <div className="grid gap-4">
            {[
              { id: 1, text: "4", tip: "Это база" },
              { id: 2, text: "9", tip: "Перебор" },
              { id: 3, text: "ХЛОР", tip: "Это из другой оперы" }
            ].map((ans) => (
              <motion.label 
                key={ans.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer
                  ${selected === ans.id 
                    ? 'border-orange-400 bg-orange-50 ring-4 ring-orange-50' 
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all 
                    ${selected === ans.id ? 'border-orange-500 bg-white shadow-inner' : 'border-slate-200 bg-white'}`}>
                    {selected === ans.id && <div className="w-3 h-3 bg-orange-500 rounded-full" />}
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-slate-700 uppercase tracking-tight">{ans.text}</span>
                </div>
                
                {selected === ans.id && (
                  <span className="text-[10px] font-black uppercase text-orange-400 italic flex items-center gap-1">
                    <Info size={12} /> {ans.tip}
                  </span>
                )}
                <input type="radio" name="q" className="hidden" onChange={() => setSelected(ans.id)} />
              </motion.label>
            ))}
          </div>

          {/* КНОПКА ДАЛЕЕ */}
          <motion.button 
            whileHover={{ y: -4 }}
            whileTap={{ y: 0 }}
            className="w-full mt-10 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-black py-6 rounded-[2rem] shadow-[0_8px_0_rgb(234,140,0)] hover:shadow-[0_12px_0_rgb(234,140,0)] active:shadow-none transition-all flex items-center justify-center gap-3 text-2xl italic uppercase tracking-tighter"
          >
            Ответить и продолжить <ChevronRight size={28} />
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* ПОДСКАЗКА: АНТИ-ЧИТ */}
      <div className="flex items-center gap-3 text-slate-400 bg-white/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white">
        <AlertCircle size={16} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Система контроля ТТЖТ активна. Не сворачивайте окно.</span>
      </div>
    </div>
  );
};