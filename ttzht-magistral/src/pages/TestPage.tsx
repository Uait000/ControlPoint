import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, ChevronRight, CheckCircle2, Lock, Trophy, 
  AlertTriangle, Home, BarChart3, Loader2 
} from 'lucide-react';

export const TestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 минут
  const [score, setScore] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  const startTestExecution = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/test/start/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 403) { setIsBlocked(true); return; }
      if (!res.ok) throw new Error("NOT_FOUND");

      const responseJson = await res.json();
      
      const binaryStr = window.atob(responseJson.data);
      const bytes = new Uint8Array(binaryStr.length);
      const key = new TextEncoder().encode("magistral_secret_2026");

      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i) ^ key[i % key.length];
      }

      const decodedText = new TextDecoder('utf-8').decode(bytes);
      const decodedData = JSON.parse(decodedText);
      
      // Имитируем процесс сборки ИИ-варианта
      setTimeout(() => {
        setQuestions(decodedData); 
        setTestStarted(true);
        setLoading(false);
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socketUrl = `${protocol}//${window.location.hostname}:8000/test/ws/monitor?token=${token}`;
        socketRef.current = new WebSocket(socketUrl);
        socketRef.current.onmessage = (e) => { if (e.data === "BLOCKED") setIsBlocked(true); };
      }, 1500);

    } catch (err) {
      console.error("Ошибка инициализации или расшифровки:", err);
      setLoading(false);
    }
  };

  // АНТИЧИТ: СЛЕЖКА ЗА ФОКУСОМ 
  useEffect(() => {
    if (!testStarted || questions.length === 0) return;

    const handleBlur = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send("focus_lost");
      }
    };
    const handleFocus = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send("focus_gained");
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      socketRef.current?.close();
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [testStarted, questions]);

  // ТАЙМЕР 
  useEffect(() => {
    if (!testStarted || loading || questions.length === 0 || testFinished || isBlocked) return;
    const timer = setInterval(() => {
      setTimeLeft(p => p <= 1 ? (setTestFinished(true), 0) : p - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, loading, questions, testFinished, isBlocked]);

  // ОТПРАВКА ОТВЕТА
  const handleNext = async () => {
    let answeredCorrectly = false;

    if (selectedIdx !== null) {
      const q = questions[currentStep];
      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`/test/submit`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ question_id: q.id, selected_option: selectedIdx })
        });
        const result = await res.json();
        if (result.correct) answeredCorrectly = true;
      } catch(e) {
        console.error("Ошибка отправки ответа", e);
      }
    }

    if (answeredCorrectly) setScore(s => s + 1);

    if (currentStep + 1 < questions.length) {
      setCurrentStep(prev => prev + 1);
      setSelectedIdx(null);
    } else {
      setTestFinished(true);
    }
  };

  // ЭКРАН БЛОКИРОВКИ
  if (isBlocked) return (
    <div className="fixed inset-0 bg-white flex items-center justify-center p-6 text-center z-[3000] font-black italic uppercase">
      <div className="max-w-md space-y-6">
        <AlertTriangle size={80} className="text-red-600 mx-auto animate-bounce" />
        <h2 className="text-3xl text-slate-900">ТЕСТ ЗАБЛОКИРОВАН</h2>
        <p className="text-slate-400 leading-relaxed">Обнаружено нарушение правил тестирования. Результаты аннулированы.</p>
        <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white py-5 rounded-3xl active:scale-95 transition-all">ВЕРНУТЬСЯ</button>
      </div>
    </div>
  );

  // ЭКРАН РЕЗУЛЬТАТОВ 
  if (testFinished) {
    const percent = Math.round((score / (questions.length || 1)) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-black italic uppercase">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-10 sm:p-16 border-4 border-blue-50 text-center space-y-10">
          <div className="w-32 h-32 bg-yellow-400 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-6"><Trophy size={64} /></div>
          <div>
            <h2 className="text-5xl text-slate-900 tracking-tighter mb-2">ТЕСТ ЗАВЕРШЕН</h2>
            <p className="text-slate-400 tracking-widest text-xs">ВАШ РЕЗУЛЬТАТ ЗАФИКСИРОВАН В СИСТЕМЕ</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-white shadow-inner">
               <div className="text-5xl text-blue-600">{score}/{questions.length}</div>
               <div className="text-[10px] text-slate-400 mt-2">БАЛЛЫ</div>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-white shadow-inner">
               <div className="text-5xl text-green-500">{percent}%</div>
               <div className="text-[10px] text-slate-400 mt-2">РЕЗУЛЬТАТ</div>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="w-full bg-[#1976d2] text-white py-6 rounded-[2.5rem] shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-4">
             В ПРОФИЛЬ <Home size={20}/>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 font-black italic uppercase text-slate-700 antialiased pb-20 relative min-h-[60vh]">
      
      {/* ЭКРАН ПОДТВЕРЖДЕНИЯ */}
      <AnimatePresence mode="wait">
        {!testStarted && !loading && (
          <motion.div 
            key="start-modal" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="absolute inset-0 z-[1000] flex items-center justify-center p-6"
          >
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl text-center max-w-md border-4 border-slate-50 w-full relative">
              <Lock size={64} className="text-[#1976d2] mx-auto mb-6" />
              <h2 className="text-3xl mb-4 text-[#1565c0] tracking-tighter">ДОСТУП ОТКРЫТ</h2>
              <p className="text-[10px] text-slate-400 mb-8 leading-relaxed tracking-widest font-black">
                ВНИМАНИЕ: ПОСЛЕ НАЖАТИЯ КНОПКИ БУДЕТ СФОРМИРОВАН ВАШ ПЕРСОНАЛЬНЫЙ ВАРИАНТ. ПОКИДАНИЕ ВКЛАДКИ ЗАПРЕЩЕНО.
              </p>
              <button 
                onClick={startTestExecution} 
                className="w-full bg-[#1976d2] text-white py-6 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all active:scale-95 font-black text-xl"
              >
                НАЧАТЬ РАБОТУ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*ЭКРАН ГЕНЕРАЦИИ (ЛОАДЕР) */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center space-y-6">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
            <Loader2 size={80} className="text-[#1976d2]" />
          </motion.div>
          <div className="text-center">
            <h2 className="text-3xl font-black text-[#1565c0] animate-pulse italic">МАГИСТРАЛЬ ИИ</h2>
            <p className="text-[10px] text-slate-400 mt-2 tracking-[0.3em]">ФОРМИРУЕМ ПЕРСОНАЛЬНЫЙ ВАРИАНТ...</p>
          </div>
        </div>
      )}

      {/*ПРОЦЕСС ТЕСТИРОВАНИЯ */}
      {testStarted && !loading && questions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-10 px-2 sm:px-6">
           <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-slate-100 relative">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 border-b-2 border-slate-50 pb-8">
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-[10px] text-slate-400 mb-1">ТЕКУЩИЙ ПРОГРЕСС</span>
                  <div className="bg-slate-100 px-6 py-2 rounded-full text-xs font-black text-slate-800 border border-slate-200">
                    ВОПРОС {currentStep + 1} ИЗ {questions.length}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-blue-50 text-[#1976d2] px-8 py-3 rounded-full border-2 border-blue-100 shadow-sm">
                  <Timer size={28} className="animate-pulse"/>
                  <div className="text-3xl font-mono leading-none">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              <div className="mb-14">
                <div className="flex items-center gap-2 text-blue-500 mb-4">
                  <BarChart3 size={18}/>
                  <span className="text-[10px] tracking-[0.3em]">БЛОК ВОПРОСОВ МАГИСТРАЛЬ ИИ</span>
                </div>
                <h2 className="text-xl md:text-4xl font-black text-slate-900 leading-tight">
                  {questions[currentStep].question}
                </h2>
              </div>

              {/* УМНЫЙ ПАРСИНГ ВАРИАНТОВ (С УЧЕТОМ OPTIONS) 50 на 50 может тут проблема*/}
              {(() => {
                let rawVariants: string[] = [];
                try {
                  const q = questions[currentStep];
                  const v = q.options || q.variants; 
                  
                  if (Array.isArray(v)) {
                    rawVariants = v;
                  } else if (typeof v === 'string') {
                    rawVariants = JSON.parse(v || '[]');
                  }
                  
                  rawVariants = rawVariants.filter((opt: string) => opt && opt.toString().trim().length > 0);
                } catch (e) {
                  console.error("Ошибка парсинга вариантов", e);
                }
                
                return rawVariants.length > 0 ? (
                  <div className="grid gap-4">
                    {rawVariants.map((opt: string, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedIdx(i)} 
                        className={`w-full text-left p-6 sm:p-8 rounded-[2rem] border-2 transition-all flex items-center justify-between group shadow-sm hover:shadow-md ${selectedIdx === i ? 'border-[#1976d2] bg-blue-50 shadow-xl' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                      >
                        <span className={`text-base sm:text-xl font-black ${selectedIdx === i ? 'text-[#1976d2]' : 'text-slate-700'}`}>{opt}</span>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedIdx === i ? 'bg-[#1976d2] border-[#1976d2] text-white shadow-lg' : 'border-slate-200'}`}>
                          {selectedIdx === i && <CheckCircle2 size={20} />}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center space-y-4 bg-red-50 rounded-[2rem] border-2 border-red-100 mt-8 shadow-inner">
                    <AlertTriangle size={48} className="text-red-400 mx-auto" />
                    <div className="text-red-500 font-black text-xl tracking-tighter uppercase italic leading-none">ВАРИАНТЫ ОТВЕТОВ НЕ НАЙДЕНЫ</div>
                    <div className="text-red-300 text-[10px] font-black tracking-widest leading-relaxed uppercase">
                      В БАЗЕ ДАННЫХ ДЛЯ ЭТОГО ВОПРОСА НЕТ ВАРИАНТОВ. <br/> НАЖМИТЕ "ПРОПУСТИТЬ ШАГ", ЧТОБЫ ПЕРЕЙТИ ДАЛЬШЕ.
                    </div>
                  </div>
                );
              })()}

              {/* УМНАЯ КНОПКА СЛЕДУЮЩЕГО ШАГА */}
              {(() => {
                const hasVariants = (() => {
                  try { 
                    const q = questions[currentStep];
                    const v = q.options || q.variants;
                    const arr = Array.isArray(v) ? v : JSON.parse(v || '[]');
                    return arr.filter((x: string) => x && x.trim().length > 0).length > 0;
                  } catch { return false; }
                })();

                return (
                  <button 
                    disabled={hasVariants && selectedIdx === null} 
                    onClick={handleNext} 
                    className={`w-full mt-12 py-8 rounded-[2.5rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 ${hasVariants && selectedIdx === null ? 'bg-slate-100 text-slate-300 shadow-none' : 'bg-[#1976d2] text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-200'}`}
                  >
                    {currentStep + 1 === questions.length ? 'ЗАВЕРШИТЬ ТЕСТ' : (!hasVariants ? 'ПРОПУСТИТЬ ШАГ' : 'СЛЕДУЮЩИЙ ШАГ')} 
                    <ChevronRight size={28}/>
                  </button>
                );
              })()}
           </div>
        </motion.div>
      )}
    </div>
  );
};