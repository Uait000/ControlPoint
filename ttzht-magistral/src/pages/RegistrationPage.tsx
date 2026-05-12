import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, KeyRound, ChevronRight, ArrowLeft } from 'lucide-react';
import type { Group, AuthResponse } from '../types';

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
  const [isAdminVisible, setIsAdminVisible] = useState(false);

  const handleSecretClick = () => {
    setAdminClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setIsAdminVisible(true);
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
    fetch('/groups')
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(() => setError("СЕРВЕР НЕДОСТУПЕН"));
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      // ЛОГИКА СБРОСА ПАРОЛЯ: (ОТПРАВКА EMAIL)
      if (mode === 'forgot_email') {
          const res = await fetch('/auth/forgot-password', {
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

      // ЛОГИКА СБРОСА ПАРОЛЯ: (СМЕНА ПАРОЛЯ)
      if (mode === 'forgot_code') {
          const res = await fetch('/auth/reset-password', {
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

      // СТАНДАРТНАЯ ЛОГИКА ВХОДА И РЕГИСТРАЦИИ
      const url = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' 
        ? { login: formData.email, password: formData.password, account_type: formData.account_type }
        : { 
            email: formData.email, password: formData.password, 
            first_name: formData.first_name, second_name: formData.second_name,
            belongs_to: parseInt(formData.belongs_to),
          };

      const response = await fetch(url, {
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
      setIsAdminVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[600] bg-[#f0f7ff] flex items-center justify-center p-4 font-black italic uppercase overflow-y-auto text-slate-700">
      <div className="bg-white w-full max-w-md md:max-w-4xl rounded-[3rem] md:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative border-4 md:border-8 border-white">
        
        {/* ЛЕВАЯ ПАНЕЛЬ С ИКОНКОЙ */}
        <motion.div layout className={`bg-[#1976d2] p-8 md:p-12 text-white text-center space-y-4 md:w-1/2 flex flex-col justify-center order-first ${mode === 'login' ? 'md:order-first' : 'md:order-last'}`}>
          <div onClick={handleSecretClick} className="cursor-default select-none active:scale-90 transition-transform duration-200 inline-block mx-auto">
            <Shield size={48} className={`mx-auto transition-all duration-500 ${isAdminVisible ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'opacity-50'}`} />
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
                
                {/* --- РЕЖИМ: ВХОД --- */}
                {mode === 'login' && (
                  <>
                      <div className="flex bg-slate-100 p-1 rounded-2xl border-2 border-slate-50 shadow-inner mb-4 overflow-hidden">
                        <button type="button" onClick={() => setFormData({...formData, account_type: 'Student'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black italic transition-all ${formData.account_type === 'Student' ? 'bg-[#1976d2] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Студент</button>
                        <button type="button" onClick={() => setFormData({...formData, account_type: 'Teacher'})} className={`flex-1 py-3 rounded-xl text-[9px] font-black italic transition-all ${formData.account_type === 'Teacher' ? 'bg-[#1976d2] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Учитель</button>
                        {isAdminVisible && (
                          <motion.button initial={{ width: 0, opacity: 0, x: 20 }} animate={{ width: 'auto', opacity: 1, x: 0 }} type="button" onClick={() => setFormData({...formData, account_type: 'Admin'})} className={`px-4 py-3 rounded-xl text-[9px] font-black italic transition-all ${formData.account_type === 'Admin' ? 'bg-yellow-500 text-white shadow-md' : 'bg-yellow-100 text-yellow-700'}`}>
                            ADMIN
                          </motion.button>
                        )}
                      </div>
                      <AuthInput label={formData.account_type === 'Admin' ? "ЛОГИН АДМИНА" : "ПОЧТА"} icon={<Mail size={18}/>} value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} />
                      <div className="space-y-1">
                          <AuthInput label="ПАРОЛЬ" type="password" icon={<Lock size={18}/>} value={formData.password} onChange={(v:any) => setFormData({...formData, password: v})} />
                          <div className="flex justify-end pt-1">
                              <button type="button" onClick={() => { setMode('forgot_email'); setError(null); setSuccessMsg(null); }} className="text-[9px] text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">
                                  ЗАБЫЛИ ПАРОЛЬ?
                              </button>
                          </div>
                      </div>
                  </>
                )}

                {/* РЕГИСТРАЦИЯ */}
                {mode === 'register' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <AuthInput label="ФАМИЛИЯ" value={formData.second_name} onChange={(v:any) => setFormData({...formData, second_name: v.toUpperCase()})} />
                      <AuthInput label="ИМЯ" value={formData.first_name} onChange={(v:any) => setFormData({...formData, first_name: v.toUpperCase()})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 ml-3 font-black italic">ГРУППА</label>
                      <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 font-black text-[#1565c0] outline-none text-[11px] shadow-inner uppercase appearance-none italic" value={formData.belongs_to} onChange={e => setFormData({...formData, belongs_to: e.target.value})}>
                        <option value="">ВЫБОР...</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}-{g.course}-{g.number}</option>)}
                      </select>
                    </div>
                    <AuthInput label="ПОЧТА" icon={<Mail size={18}/>} value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} />
                    <AuthInput label="ПАРОЛЬ" type="password" icon={<Lock size={18}/>} value={formData.password} onChange={(v:any) => setFormData({...formData, password: v})} />
                  </>
                )}

                {/*ВВОД ПОЧТЫ ДЛЯ ВОССТАНОВЛЕНИЯ */}
                {mode === 'forgot_email' && (
                    <div className="space-y-4">
                        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                            Укажите почту от вашего аккаунта. Мы отправим на нее 6-значный код подтверждения.
                        </p>
                        <AuthInput label="ВАША ПОЧТА" icon={<Mail size={18}/>} value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} />
                    </div>
                )}

                {/* ВВОД КОДА И НОВОГО ПАРОЛЯ/}
                {mode === 'forgot_code' && (
                    <div className="space-y-4">
                        <AuthInput label="КОД ИЗ ПИСЬМА (6 ЦИФР)" type="text" icon={<KeyRound size={18}/>} value={formData.resetCode} onChange={(v:any) => setFormData({...formData, resetCode: v})} />
                        <AuthInput label="НОВЫЙ ПАРОЛЬ" type="password" icon={<Lock size={18}/>} value={formData.newPassword} onChange={(v:any) => setFormData({...formData, newPassword: v})} />
                    </div>
                )}

                {/* КНОПКА ОТПРАВКИ */}
                <button type="submit" className={`w-full py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 mt-8 active:scale-95 transition-all text-sm font-black italic uppercase ${formData.account_type === 'Admin' && mode === 'login' ? 'bg-yellow-500 text-white' : 'bg-[#1976d2] text-white'}`}>
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