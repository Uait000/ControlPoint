import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, ChevronRight, CheckCircle2, Lock, Trophy, 
  AlertTriangle, Home, BarChart3, Loader2 
} from 'lucide-react';

const getGradeData = (percent: number) => {
  if (percent >= 90) return { val: 5, label: 'ОТЛИЧНО', color: 'text-green-500' };
  if (percent >= 70) return { val: 4, label: 'ХОРОШО', color: 'text-blue-500' };
  if (percent >= 50) return { val: 3, label: 'УДОВЛЕТВОРИТЕЛЬНО', color: 'text-orange-500' };
  return { val: 2, label: 'НЕУДОВЛЕТВОРИТЕЛЬНО', color: 'text-red-500' };
};

export const TestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ИНИЦИАЛИЗАЦИЯ ИЗ ХРАНИЛИЩА
  const [testStarted, setTestStarted] = useState(() => JSON.parse(sessionStorage.getItem(`started_${id}`) || 'false'));
  const [testFinished, setTestFinished] = useState(() => JSON.parse(sessionStorage.getItem(`finished_${id}`) || 'false'));
  const [currentStep, setCurrentStep] = useState(() => Number(sessionStorage.getItem(`step_${id}`) || 0));
  const [score, setScore] = useState(() => Number(sessionStorage.getItem(`score_${id}`) || 0));
  const [timeLeft, setTimeLeft] = useState(() => Number(sessionStorage.getItem(`time_${id}`) || 1200));

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const headers = { 
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  };

  // СОХРАНЕНИЕ ПРОГРЕССА ПРИ КАЖДОМ ИЗМЕНЕНИИ
  useEffect(() => {
    if (testStarted) {
      sessionStorage.setItem(`started_${id}`, 'true');
      sessionStorage.setItem(`step_${id}`, currentStep.toString());
      sessionStorage.setItem(`score_${id}`, score.toString());
      sessionStorage.setItem(`time_${id}`, timeLeft.toString());
      sessionStorage.setItem(`finished_${id}`, JSON.stringify(testFinished));
    }
  }, [currentStep, score, timeLeft, testStarted, testFinished, id]);

  const startTestExecution = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/test/start/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 403 || res.status === 401) { 
        setIsBlocked(true); 
        setLoading(false);
        return; 
      }
      
      if (!res.ok) throw new Error("ERROR_STARTING_TEST");

      const responseJson = await res.json();
      const binaryStr = window.atob(responseJson.data);
      const bytes = new Uint8Array(binaryStr.length);
      const key = new TextEncoder().encode("magistral_secret_2026");

      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i) ^ key[i % key.length];
      }

      const decodedText = new TextDecoder('utf-8').decode(bytes);
      const decodedData = JSON.parse(decodedText);
      
      setTimeout(() => {
        setQuestions(decodedData); 
        setTestStarted(true);
        setLoading(false);
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socketUrl = `${protocol}//${window.location.host}/test/ws/monitor?token=${token}`;
        socketRef.current = new WebSocket(socketUrl);
        socketRef.current.onmessage = (e) => { if (e.data === "BLOCKED") setIsBlocked(true); };
      }, 1000);

    } catch (err) {
      console.error("Ошибка инициализации:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testStarted && questions.length === 0 && !testFinished && !isBlocked) {
      startTestExecution();
    }
  }, []);

  const handleViolation = async () => {
    if (isBlocked || testFinished || !testStarted) return;
    setIsBlocked(true);
    try {
      await fetch(`/test/violate/${id}`, { method: 'POST', headers });
      if (socketRef.current?.readyState === 1) socketRef.current.send("focus_lost");
    } catch (e) {}
  };

  useEffect(() => {
    if (!testStarted || testFinished || isBlocked) return;
    const onBlur = () => handleViolation();
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [testStarted, testFinished, isBlocked]);

  useEffect(() => {
    if (!testStarted || testFinished || isBlocked || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { handleFinish(score); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, testFinished, isBlocked, score, questions]);

  const handleFinish = async (finalScore: number) => {
    const percent = Math.round((finalScore / (questions.length || 1)) * 100);
    try {
      await fetch(`/test/finish/${id}/${finalScore}/${percent}`, { method: 'POST', headers });
      sessionStorage.setItem(`finished_${id}`, 'true');
      setTestFinished(true);
    } catch (e) {
      console.error("Finish error:", e);
    }
  };

  const handleNext = async () => {
    let currentScore = score;
    if (selectedIdx !== null) {
      try {
        const res = await fetch(`/test/submit`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ question_id: questions[currentStep].id, selected_option: selectedIdx })
        });
        const result = await res.json();
        if (result.correct) {
          currentScore += 1;
          setScore(currentScore);
        }
      } catch(e) {}
    }

    if (currentStep + 1 < questions.length) {
      setCurrentStep(prev => prev + 1);
      setSelectedIdx(null);
    } else {
      await handleFinish(currentScore);
    }
  };

  const clearAndNavigate = () => {
    // Очищаем сессию перед уходом
    sessionStorage.removeItem(`started_${id}`);
    sessionStorage.removeItem(`step_${id}`);
    sessionStorage.removeItem(`score_${id}`);
    sessionStorage.removeItem(`time_${id}`);
    sessionStorage.removeItem(`finished_${id}`);
    navigate('/');
  };

  if (isBlocked) return (
    <div className="fixed inset-0 bg-white flex items-center justify-center p-6 text-center z-[3000] font-black italic uppercase">
      <div className="max-w-md space-y-6">
        <AlertTriangle size={100} className="text-red-600 mx-auto animate-pulse" />
        <h2 className="text-4xl text-slate-900 tracking-tighter">ДОСТУП ОГРАНИЧЕН</h2>
        <p className="text-slate-500 font-bold">НАРУШЕНИЕ ПРАВИЛ ИЛИ ПОВТОРНЫЙ ВХОД. <br/> ОБРАТИТЕСЬ К ПРЕПОДАВАТЕЛЮ.</p>
        <button onClick={clearAndNavigate} className="w-full bg-slate-900 text-white py-6 rounded-3xl active:scale-95 transition-all">ВЕРНУТЬСЯ</button>
      </div>
    </div>
  );

  if (testFinished) {
    const finalPercent = Math.round((score / (questions.length || 1)) * 100);
    const grade = getGradeData(finalPercent);
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-black italic uppercase">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-10 sm:p-16 border-4 border-blue-50 text-center space-y-10">
          <div className="w-32 h-32 bg-yellow-400 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-6"><Trophy size={64} /></div>
          <div>
            <h2 className="text-5xl text-slate-900 tracking-tighter">ТЕСТ ЗАВЕРШЕН</h2>
            <p className="text-blue-500 text-xs tracking-widest font-black mt-2">РЕЗУЛЬТАТ ЗАФИКСИРОВАН</p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-slate-800">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-white shadow-inner flex flex-col items-center">
               <span className={`text-8xl leading-none ${grade.color}`}>{grade.val}</span>
               <span className="text-[10px] text-slate-400 mt-4 tracking-[0.2em]">ОЦЕНКА</span>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-white shadow-inner flex flex-col justify-center">
               <div className="text-4xl leading-none">{score}/{questions.length}</div>
               <div className="text-[9px] text-slate-400 mt-2 italic">БАЛЛЫ</div>
               <div className="w-full h-1.5 bg-slate-200 mt-4 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${finalPercent}%` }}></div></div>
               <div className="text-xs text-blue-500 mt-2">{finalPercent}%</div>
            </div>
          </div>
          <button onClick={clearAndNavigate} className="w-full bg-[#1976d2] text-white py-8 rounded-[2.5rem] shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-4 text-xl">В ПРОФИЛЬ <Home size={24}/></button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 font-black italic uppercase text-slate-700 antialiased pb-20 relative min-h-[60vh]">
      <AnimatePresence mode="wait">
        {!testStarted && !loading && (
          <motion.div key="start-modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 z-[1000] flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl text-center max-w-md border-4 border-slate-50 w-full">
              <Lock size={64} className="text-[#1976d2] mx-auto mb-6" />
              <h2 className="text-3xl mb-4 text-[#1565c0] tracking-tighter">ДОСТУП ОТКРЫТ</h2>
              <p className="text-[10px] text-slate-400 mb-8 leading-relaxed tracking-widest font-black">
                ВНИМАНИЕ: ОДНОКРАТНЫЙ ВХОД. ПОКИДАНИЕ ВКЛАДКИ ЗАПРЕЩЕНО.
              </p>
              <button onClick={startTestExecution} className="w-full bg-[#1976d2] text-white py-6 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all active:scale-95 font-black text-xl uppercase">НАЧАТЬ РАБОТУ</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(loading || (testStarted && questions.length === 0)) && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center space-y-6">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Loader2 size={80} className="text-[#1976d2]" /></motion.div>
          <div className="text-center">
            <h2 className="text-3xl font-black text-[#1565c0] animate-pulse italic uppercase">МАГИСТРАЛЬ CORE</h2>
            <p className="text-[10px] text-slate-400 mt-2 tracking-[0.3em] font-black uppercase">ВОССТАНОВЛЕНИЕ СЕССИИ...</p>
          </div>
        </div>
      )}

      {testStarted && questions.length > 0 && !testFinished && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-10 px-2 sm:px-6">
           <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-slate-100 relative">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 border-b-2 border-slate-50 pb-8">
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-[10px] text-slate-400 mb-1 font-black">ПРОГРЕСС</span>
                  <div className="bg-slate-900 px-6 py-2 rounded-full text-xs font-black text-white shadow-lg uppercase tracking-widest">
                    ШАГ {currentStep + 1} / {questions.length}
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-blue-50 text-[#1976d2] px-8 py-3 rounded-full border-2 border-blue-100 shadow-sm">
                  <Timer size={28} className="animate-pulse"/><div className="text-3xl font-mono leading-none font-black">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                </div>
              </div>

              <div className="mb-14">
                <div className="flex items-center gap-2 text-blue-500 mb-4"><BarChart3 size={18}/><span className="text-[10px] tracking-[0.4em] font-black uppercase italic">MAGISTRAL_PROCESSOR</span></div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight uppercase">{questions[currentStep].question}</h2>
              </div>

              <div className="grid gap-4">
                {(() => {
                  const v = questions[currentStep].options || questions[currentStep].variants || [];
                  const variants = Array.isArray(v) ? v : JSON.parse(v || '[]');
                  return variants.filter((o:any) => o).map((opt: string, i: number) => (
                    <button key={i} onClick={() => setSelectedIdx(i)} className={`w-full text-left p-6 sm:p-8 rounded-[2.5rem] border-2 transition-all flex items-center justify-between group ${selectedIdx === i ? 'border-blue-600 bg-blue-50 shadow-xl scale-[1.01]' : 'border-slate-100 bg-white hover:border-blue-200'}`}>
                      <span className={`text-lg sm:text-xl font-black uppercase tracking-tight ${selectedIdx === i ? 'text-blue-700' : 'text-slate-700'}`}>{opt}</span>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedIdx === i ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-slate-200'}`}>{selectedIdx === i && <CheckCircle2 size={20} />}</div>
                    </button>
                  ));
                })()}
              </div>

              <button disabled={selectedIdx === null} onClick={handleNext} className={`w-full mt-12 py-9 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all flex items-center justify-center gap-4 ${selectedIdx === null ? 'bg-slate-100 text-slate-300' : 'bg-[#1976d2] text-white hover:bg-blue-700 active:scale-[0.98]'}`}>
                {currentStep + 1 === questions.length ? 'ЗАФИКСИРОВАТЬ РЕЗУЛЬТАТ' : 'СЛЕДУЮЩИЙ ШАГ'} <ChevronRight size={32}/>
              </button>
           </div>
        </motion.div>
      )}
    </div>
  );
};