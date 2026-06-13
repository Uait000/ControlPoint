import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, KeyRound, ChevronRight, ArrowLeft, Search, Check, ChevronDown } from 'lucide-react';
import type { Group, AuthResponse } from '../types';
import { API_BASE_URL } from '../api';

interface RegistrationPageProps {
  onAuthSuccess: (data: AuthResponse) => void;
}

type FormMode = 'login' | 'register' | 'forgot_email' | 'forgot_code';

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<FormMode>('login');
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [isSpecialRolesVisible, setIsSpecialRolesVisible] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSecretClick = () => {
    setAdminClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setIsSpecialRolesVisible(true);
        return 0;
      }
      return next;
    });
  };

  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    first_name: '', 
    second_name: '', 
    belongs_to: '', 
    account_type: 'Student',
    resetCode: '',
    newPassword: ''
  });

  useEffect(() => {
    fetch(API_BASE_URL + '/groups')
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(() => setError("СЕРВЕР НЕДОСТУПЕН"));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedGroups = [...groups].sort((a, b) => {
    if (a.course !== b.course) return a.course - b.course;
    const nameCompare = a.name.localeCompare(b.name, 'ru');
    if (nameCompare !== 0) return nameCompare;
    return a.number - b.number;
  });

  const filteredGroups = sortedGroups.filter(g => {
    const fullGroupName = `${g.name}-${g.course}-${g.number}`.toUpperCase();
    const query = searchQuery.toUpperCase();
    return fullGroupName.includes(query) || g.course.toString() === query;
  });

  const selectedGroupObj = groups.find(g => g.id.toString() === formData.belongs_to);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'forgot_email') {
          const res = await fetch(API_BASE_URL + '/auth/forgot-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: formData.email })
          });
          if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || "ОШИБКА ОТПРАВКИ");
          }
          setSuccessMsg("КОД ОТПРАВЛЕН НА ПОЧТУ!");
          setMode('forgot_code');
          return;
      }

      if (mode === 'forgot_code') {
          const res = await fetch(API_BASE_URL + '/auth/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  email: formData.email, 
                  code: formData.resetCode, 
                  new_password: formData.newPassword 
              })
          });
          if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || "НЕВЕРНЫЙ КОД ИЛИ ПАРОЛЬ");
          }
          setSuccessMsg("ПАРОЛЬ УСПЕШНО ИЗМЕНЕН! ТЕПЕРЬ ВОЙДИТЕ.");
          setFormData({ ...formData, password: '', resetCode: '', newPassword: '' });
          setMode('login');
          return;
      }

      const url = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' 
        ? { login: formData.email, password: formData.password, account_type: formData.account_type }
        : { 
            email: formData.email, password: formData.password, 
            first_name: formData.first_name, second_name: formData.second_name,
            belongs_to: parseInt(formData.belongs_to),
          };

      const response = await fetch(API_BASE_URL + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "ОШИБКА ДОСТУПА");
      }

      const data: AuthResponse = await response.json();
      onAuthSuccess(data);

    } catch (err: any) {
      setError(err.message.toUpperCase());
    }
  };

  const getLeftPanelText = () => {
      if (mode === 'forgot_email' || mode === 'forgot_code') return 'ВЕРНУТЬСЯ КО ВХОДУ';
      return mode === 'login' ? 'СОЗДАТЬ АККАУНТ' : 'ВОЙТИ В ПРОФИЛЬ';
  };

  const handlePanelSwitch = () => {
      setError(null);
      setSuccessMsg(null);
      if (mode === 'forgot_email' || mode === 'forgot_code') {
          setMode('login');
      } else {
          setMode(mode === 'login' ? 'register' : 'login');
      }
      setIsSpecialRolesVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[600] bg-[#f0f7ff] flex items-center justify-center p-4 font-black italic uppercase overflow-y-auto text-slate-700">
      <div className="bg-white w-full max-w-md md:max-w-4xl rounded-[3rem] md:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative border-4 md:border-8 border-white">
        
        {/* ЛЕВАЯ ПАНЕЛЬ С ИКОНКОЙ */}
        <motion.div layout className={`bg-[#1976d2] p-8 md:p-12 text-white text-center space-y-4 md:w-1/2 flex flex-col justify-center order-first ${mode === 'login' ? 'md:order-first' : 'md:order-last'}`}>
          <div onClick={handleSecretClick} className="cursor-default select-none active:scale-90 transition-transform duration-200 inline-block mx-auto">
            <Shield size={48} className={`mx-auto transition-all duration-500 ${isSpecialRolesVisible ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'opacity-50'}`} />
          </div>
          <h3 className="text-2xl md:text-4xl tracking-tighter leading-none italic">МАГИСТРАЛЬ <br/> ТТЖТ</h3>
          <button type="button" onClick={handlePanelSwitch} className="bg-white/10 border-2 border-white/30 hover:bg-white hover:text-[#1976d2] px-8 py-3 rounded-[2rem] text-xs transition-all active:scale-95 shadow-lg font-black italic flex justify-center items-center gap-2 mx-auto">
            {(mode === 'forgot_email' || mode === 'forgot_code') && <ArrowLeft size={16}/>}
            {getLeftPanelText()}
          </button>
        </motion.div>

        {/* ФОРМА */}
        <div className="p-8 md:p-16 flex-1 flex flex-col justify-center bg-white">
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full space-y-6 max-w-sm mx-auto">
              
              <h2 className="text-3xl text-[#1565c0] tracking-tighter font-black italic">
                  {mode === 'login' ? 'ВХОД' : mode === 'register' ? 'СОЗДАТЬ' : 'ВОССТАНОВЛЕНИЕ'}
              </h2>
              
              {error && <div className="p-3 bg-red-50 text-red-500 text-[10px] rounded-xl border-2 border-red-100 animate-pulse font-black italic text-center">{error}</div>}
              {successMsg && <div className="p-3 bg-green-50 text-green-600 text-[10px] rounded-xl border-2 border-green-100 font-black italic text-center">{successMsg}</div>}
              
              <form onSubmit={handleAuth} className="space-y-4">
                
                {/* РЕЖИМ: ВХОД  */}
                {mode === 'login' && (
                  <>
                      <div className="flex flex-wrap bg-slate-100 p-1 rounded-2xl border-2 border-slate-50 shadow-inner mb-4 overflow-hidden gap-1">
                        <button type="button" onClick={() => setFormData({...formData, account_type: 'Student'})} className={`flex-1 min-w-[70px] py-3 rounded-xl text-[9px] font-black italic transition-all ${formData.account_type === 'Student' ? 'bg-[#1976d2] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Студент</button>
                        <button type="button" onClick={() => setFormData({...formData, account_type: 'Teacher'})} className={`flex-1 min-w-[70px] py-3 rounded-xl text-[9px] font-black italic transition-all ${formData.account_type === 'Teacher' ? 'bg-[#1976d2] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Учитель</button>
                        
                        {isSpecialRolesVisible && (
                          <>
                            <motion.button initial={{ width: 0, opacity: 0, x: 20 }} animate={{ width: 'auto', opacity: 1, x: 0 }} type="button" onClick={() => setFormData({...formData, account_type: 'Director'})} className={`flex-1 min-w-[70px] px-2 py-3 rounded-xl text-[9px] font-black italic transition-all ${formData.account_type === 'Director' ? 'bg-purple-600 text-white shadow-md' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>
                              ДИРЕКТОР
                            </motion.button>
                            <motion.button initial={{ width: 0, opacity: 0, x: 20 }} animate={{ width: 'auto', opacity: 1, x: 0 }} type="button" onClick={() => setFormData({...formData, account_type: 'Admin'})} className={`flex-1 min-w-[70px] px-2 py-3 rounded-xl text-[9px] font-black italic transition-all ${formData.account_type === 'Admin' ? 'bg-yellow-500 text-white shadow-md' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}>
                              ADMIN
                            </motion.button>
                          </>
                        )}
                      </div>
                      
                      <AuthInput 
                        label={
                          formData.account_type === 'Student' 
                            ? "ПОЧТА" 
                            : formData.account_type === 'Teacher' 
                              ? "ЛОГИН ПРЕПОДАВАТЕЛЯ" 
                              : formData.account_type === 'Director'
                                ? "ЛОГИН ДИРЕКТОРА"
                                : "ЛОГИН АДМИНА"
                        } 
                        icon={<Mail size={18}/>} 
                        value={formData.email} 
                        onChange={(v:any) => setFormData({...formData, email: v})} 
                      />
                      
                      <div className="space-y-1">
                          <AuthInput label="ПАРОЛЬ" type="password" icon={<Lock size={18}/>} value={formData.password} onChange={(v:any) => setFormData({...formData, password: v})} />
                          
                          {/* Условие изменено: кнопка рендерится только если заходит Студент */}
                          {formData.account_type === 'Student' && (
                            <div className="flex justify-end pt-1">
                              <button type="button" onClick={() => { setMode('forgot_email'); setError(null); setSuccessMsg(null); }} className="text-[9px] text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">
                                  ЗАБЫЛИ ПАРОЛЬ?
                              </button>
                            </div>
                          )}
                      </div>
                  </>
                )}

                {/* --- РЕЖИМ: РЕГИСТРАЦИЯ --- */}
                {mode === 'register' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <AuthInput label="ФАМИЛИЯ" value={formData.second_name} onChange={(v:any) => setFormData({...formData, second_name: v.toUpperCase()})} />
                      <AuthInput label="ИМЯ" value={formData.first_name} onChange={(v:any) => setFormData({...formData, first_name: v.toUpperCase()})} />
                    </div>

                    {/* КАСТОМНЫЙ DROPDOWN С УМНЫМ ПОИСКОМ */}
                    <div className="space-y-1 relative" ref={dropdownRef}>
                      <label className="text-[9px] text-slate-400 ml-3 font-black italic">ГРУППА</label>
                      
                      {/* Триггер дропдауна */}
                      <div 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 font-black text-[#1565c0] text-[11px] shadow-inner uppercase italic flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>
                          {selectedGroupObj 
                            ? `${selectedGroupObj.name}-${selectedGroupObj.course}-${selectedGroupObj.number}` 
                            : 'ВЫБОР ГРУППЫ...'}
                        </span>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Меню с поиском */}
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-2 max-h-72 flex flex-col"
                          >
                            {/* Поле поиска внутри селектора */}
                            <div className="relative flex-shrink-0">
                              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text"
                                placeholder="ПОИСК (НАПРИМЕР: КС ИЛИ 2)..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-4 text-[10px] font-black italic uppercase text-slate-700 outline-none focus:border-blue-300 transition-colors"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onClick={e => e.stopPropagation()} 
                              />
                            </div>

                            {/* Список отфильтрованных групп */}
                            <div className="overflow-y-auto flex-1 space-y-1 pr-1 custom-scrollbar">
                              {filteredGroups.length > 0 ? (
                                filteredGroups.map(g => {
                                  const isSelected = formData.belongs_to === g.id.toString();
                                  
                                  const courseColors = [
                                    'bg-emerald-50 text-emerald-700 border-emerald-100',
                                    'bg-blue-50 text-blue-700 border-blue-100',
                                    'bg-amber-50 text-amber-700 border-amber-100',
                                    'bg-rose-50 text-rose-700 border-rose-100'
                                  ][g.course - 1] || 'bg-slate-50 text-slate-700';

                                  return (
                                    <div
                                      key={g.id}
                                      onClick={() => {
                                        setFormData({ ...formData, belongs_to: g.id.toString() });
                                        setIsDropdownOpen(false);
                                        setSearchQuery('');
                                      }}
                                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-black italic cursor-pointer border-2 transition-all active:scale-[0.99]
                                        ${isSelected ? 'border-[#1976d2] bg-blue-50/50' : 'border-transparent hover:bg-slate-50'}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 text-[9px] rounded-md border font-black ${courseColors}`}>
                                          {g.course} КУРС
                                        </span>
                                        <span className="text-slate-700 tracking-tight">
                                          {g.name}-{g.course}-{g.number}
                                        </span>
                                      </div>
                                      {isSelected && <Check size={14} className="text-[#1976d2]" />}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-[10px] text-slate-400 text-center py-4 font-black italic">
                                  ГРУППЫ НЕ НАЙДЕНЫ
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AuthInput label="ПОЧТА" icon={<Mail size={18}/>} value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} />
                    <AuthInput label="ПАРОЛЬ" type="password" icon={<Lock size={18}/>} value={formData.password} onChange={(v:any) => setFormData({...formData, password: v})} />
                  </>
                )}

                {/* РЕЖИМ: ВОССТАНОВЛЕНИЕ (EMAIL) */}
                {mode === 'forgot_email' && (
                    <div className="space-y-4">
                        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                            Укажите почту от вашего аккаунта. Мы отправим на нее 6-значный код подтверждения.
                        </p>
                        <AuthInput label="ВАША ПОЧТА" icon={<Mail size={18}/>} value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} />
                    </div>
                )}

                {/* РЕЖИМ: ВОССТАНОВЛЕНИЕ (КОД + ПАРОЛЬ) */}
                {mode === 'forgot_code' && (
                    <div className="space-y-4">
                        <AuthInput 
                          label="КОД ИЗ ПИСЬМА (6 ЦИФР)" 
                          type="text" 
                          icon={<KeyRound size={18}/>} 
                          value={formData.resetCode} 
                          onChange={(v: any) => setFormData({...formData, resetCode: v})} 
                        />
                        <AuthInput 
                          label="НОВЫЙ ПАРОЛЬ" 
                          type="password" 
                          icon={<Lock size={18}/>} 
                          value={formData.newPassword} 
                          onChange={(v: any) => setFormData({...formData, newPassword: v})} 
                        />
                    </div>
                )}

                {/* КНОПКА ОТПРАВКИ */}
                <button type="submit" className={`w-full py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 mt-8 active:scale-95 transition-all text-sm font-black italic uppercase 
                  ${formData.account_type === 'Admin' && mode === 'login' ? 'bg-yellow-500 text-white' : 
                    formData.account_type === 'Director' && mode === 'login' ? 'bg-purple-600 text-white' : 
                    'bg-[#1976d2] text-white'}`}>
                  {mode === 'login' ? 'ВОЙТИ' : 
                   mode === 'register' ? 'ЗАРЕГИСТРИРОВАТЬСЯ' : 
                   mode === 'forgot_email' ? 'ПОЛУЧИТЬ КОД' : 'ИЗМЕНИТЬ ПАРОЛЬ'} 
                  <ChevronRight size={20}/>
                </button>
              </form>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const AuthInput = ({ label, icon, value, onChange, type = "text" }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] text-slate-400 ml-3 font-black italic">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1976d2]/40">{icon}</div>}
      <input 
        type={type} 
        required 
        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 ${icon ? 'pl-12' : 'px-4'} pr-4 text-[11px] font-black text-[#1565c0] outline-none shadow-inner italic uppercase focus:border-blue-200 transition-colors`} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  </div>
);