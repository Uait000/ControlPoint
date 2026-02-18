import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronRight, CheckCircle2, Lock, Trophy, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import type { Question } from '../types';

// Вопросы по лекции "Подходы к измерению информации" [cite: 1, 2]
const MOCK_QUESTIONS: Question[] = [
  { id: 1, type: 'choice', text: "Кто разработал содержательный подход к измерению информации?", options: ["А.Н. Колмогоров", "К. Шеннон", "Р. Хартли", "Билл Гейтс"], correctAnswer: 1 }, 
  { id: 2, type: 'choice', text: "Что такое 1 бит в содержательном подходе?", options: ["8 байтов", "Уменьшение неопределенности в 2 раза", "Мощность алфавита", "1024 Кбайта"], correctAnswer: 1 }, 
  { id: 3, type: 'choice', text: "Как называется формула $2^i = N$?", options: ["Формула Шеннона", "Формула Хартли", "Метод Колмогорова", "Таблица ASCII"], correctAnswer: 1 }, 
  { id: 4, type: 'choice', text: "Какой подход считается объективным и не зависит от субъекта?", options: ["Содержательный", "Алфавитный", "Вероятностный", "Параллельный"], correctAnswer: 1 }, 
  { id: 5, type: 'choice', text: "Сколько символов содержит алфавит UNICODE?", options: ["256", "2", "65 536", "1024"], correctAnswer: 2 }, 
  { id: 6, type: 'choice', text: "Чему равен 1 байт?", options: ["1024 бита", "2 бита", "8 бит", "16 бит"], correctAnswer: 2 }, 
  { id: 7, type: 'choice', text: "Что является кодирующим устройством в примере с микрофоном?", options: ["Микрофон", "Звуковая плата", "Жесткий диск", "Провода"], correctAnswer: 0 }, 
  { id: 8, type: 'choice', text: "Какова примерная информационная емкость CD-диска?", options: ["4,7 ГБ", "1,44 МБ", "700 МБ", "2 ТБ"], correctAnswer: 2 }, 
  { id: 9, type: 'choice', text: "Какие файлы почти не сжимаются архиваторами?", options: ["Текстовые", "Графические", "Аудио- и видеофайлы", "Базы данных"], correctAnswer: 2 }, 
  { id: 10, type: 'classification', text: "Распределите единицы измерения:", categories: ["Мелкие", "Крупные"], items: [{id:'1', text:'Бит'}, {id:'2', text:'Терабайт'}, {id:'3', text:'Байт'}], correctAnswer: {'1':0, '2':1, '3':0} } 
];

export const TestPage = () => {
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(3000); 
  const [score, setScore] = useState(0);

  const currentQuestion = MOCK_QUESTIONS[currentStep];
  const totalSteps = MOCK_QUESTIONS.length;
  const percentage = Math.round((score / totalSteps) * 100);

  // Настройки оценки и цветов шкалы
  const evalData = useMemo(() => {
    if (percentage < 40) return { label: 'НУЖНО ПОВТОРИТЬ', grade: 2, textColor: 'text-rose-700', bgColor: 'bg-rose-50' };
    if (percentage < 65) return { label: 'УДОВЛЕТВОРИТЕЛЬНО', grade: 3, textColor: 'text-amber-800', bgColor: 'bg-amber-50' };
    if (percentage < 85) return { label: 'ХОРОШИЙ РЕЗУЛЬТАТ', grade: 4, textColor: 'text-sky-800', bgColor: 'bg-sky-50' };
    return { label: 'ОТЛИЧНАЯ РАБОТА', grade: 5, textColor: 'text-emerald-800', bgColor: 'bg-emerald-50' };
  }, [percentage]);

  const finishTest = useCallback(() => setTestFinished(true), []);

  useEffect(() => {
    if (!testStarted || testFinished) return;
    const timer = setInterval(() => setTimeLeft(p => p <= 1 ? (clearInterval(timer), finishTest(), 0) : p - 1), 1000);
    return () => clearInterval(timer);
  }, [testStarted, testFinished, finishTest]);

  const handleNext = () => {
    const isCorrect = currentQuestion.type === 'choice' 
      ? selectedIdx === currentQuestion.correctAnswer 
      : JSON.stringify(selectedIdx) === JSON.stringify(currentQuestion.correctAnswer);
    
    if (isCorrect) setScore(s => s + 1);
    if (currentStep + 1 < totalSteps) { 
      setCurrentStep(prev => prev + 1); 
      setSelectedIdx(null); 
    } else finishTest();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 font-sans text-slate-700">
      <AnimatePresence>
        {!testStarted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1000] bg-slate-50/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl text-center max-w-sm border border-slate-100">
              <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-6"><Lock /></div>
              <h2 className="text-xl font-bold mb-2 uppercase text-slate-800 tracking-tight">Вход в систему</h2>
              <p className="text-xs text-slate-400 mb-8 uppercase tracking-widest">Тема: Измерение информации [cite: 1]</p>
              <button onClick={() => setTestStarted(true)} className="w-full bg-sky-400 hover:bg-sky-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-sky-100 transition-all">НАЧАТЬ</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {testStarted && !testFinished && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-bold bg-slate-50 px-4 py-2 rounded-full text-slate-500 uppercase tracking-tighter">Вопрос {currentStep + 1} из {totalSteps}</span>
              <div className="flex items-center gap-2 font-mono text-lg font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <Timer size={18} className="text-sky-400"/> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full mb-10 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} className="h-full bg-sky-300" />
            </div>

            <h2 className="text-lg md:text-2xl font-bold mb-8 leading-tight text-slate-800">{currentQuestion.text}</h2>

            <div className="grid gap-3">
              {currentQuestion.type === 'choice' ? (
                currentQuestion.options?.map((opt, i) => (
                  <button key={i} onClick={() => setSelectedIdx(i)} className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedIdx === i ? 'border-sky-300 bg-sky-50/50' : 'border-slate-50 hover:bg-slate-50'}`}>
                    <span className={`text-sm font-semibold ${selectedIdx === i ? 'text-sky-800' : 'text-slate-600'}`}>{opt}</span>
                    {selectedIdx === i && <CheckCircle2 size={18} className="text-sky-500" />}
                  </button>
                ))
              ) : (
                currentQuestion.items?.map(item => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-3 border border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.text}</span>
                    <div className="flex gap-2">
                      {currentQuestion.categories?.map((cat, ci) => (
                        <button key={ci} onClick={() => setSelectedIdx({...selectedIdx, [item.id]: ci})} className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${selectedIdx?.[item.id] === ci ? 'bg-sky-400 text-white shadow-md' : 'bg-white text-slate-300 border border-slate-100'}`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button disabled={selectedIdx === null} onClick={handleNext} className="w-full mt-10 py-5 bg-sky-400 hover:bg-sky-500 text-white rounded-2xl font-bold shadow-lg shadow-sky-50 disabled:bg-slate-100 disabled:text-slate-300 transition-all flex items-center justify-center gap-2">
              {currentStep + 1 === totalSteps ? 'ЗАВЕРШИТЬ' : 'ДАЛЕЕ'} <ChevronRight size={20}/>
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {testFinished && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-[3rem] shadow-xl text-center border border-slate-100 max-w-lg mx-auto">
            <Trophy size={60} className="mx-auto text-amber-400 mb-6" />
            <h2 className="text-5xl font-black mb-2 tracking-tighter text-slate-800">{percentage}%</h2>
            
            <div className={`px-10 py-4 rounded-2xl inline-block text-xs font-black uppercase tracking-widest mb-12 shadow-sm ${evalData.bgColor} ${evalData.textColor}`}>
              {evalData.label} — ОЦЕНКА {evalData.grade}
            </div>
            
            {/* Шкала уровней: Загорается постепенно */}
            <div className="w-full h-12 bg-slate-100 rounded-full mb-12 relative overflow-hidden flex p-1.5 border border-slate-200">
              <div className={`flex-1 flex items-center justify-center rounded-l-full text-[11px] font-black transition-all duration-500 ${evalData.grade >= 2 ? 'bg-rose-100 text-rose-700' : 'text-slate-300'}`}>2</div>
              <div className={`flex-1 flex items-center justify-center text-[11px] font-black border-x border-white transition-all duration-700 ${evalData.grade >= 3 ? 'bg-amber-100 text-amber-800' : 'text-slate-300'}`}>3</div>
              <div className={`flex-1 flex items-center justify-center text-[11px] font-black border-r border-white transition-all duration-1000 ${evalData.grade >= 4 ? 'bg-sky-100 text-sky-800' : 'text-slate-300'}`}>4</div>
              <div className={`flex-1 flex items-center justify-center rounded-r-full text-[11px] font-black transition-all duration-[1200ms] ${evalData.grade >= 5 ? 'bg-emerald-100 text-emerald-800' : 'text-slate-300'}`}>5</div>
            </div>

            <button onClick={() => window.location.href = '/'} className="bg-slate-900 hover:bg-slate-800 text-white px-12 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center gap-3 mx-auto shadow-xl">
              <RotateCcw size={18}/> НА ГЛАВНУЮ
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};