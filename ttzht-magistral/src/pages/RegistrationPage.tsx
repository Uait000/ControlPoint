import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, LogIn, Shield, Mail, Lock, User, Users, ChevronRight } from 'lucide-react';

export const RegistrationPage = ({ onAuthSuccess }: { onAuthSuccess: (data: any) => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({ surname: '', name: '', group: '', email: '', password: '' });

  const groups = ["КС-2-1", "Р-2-1", "Р-1-1", "КС-1-2"];

  return (
    <div className="fixed inset-0 z-[500] bg-[#f0f7ff] flex items-center justify-center p-4 font-black italic uppercase overflow-y-auto">
      {/* Контейнер с фиксированным макс-размером для стабильности */}
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_20px_60px_rgba(25,118,210,0.1)] overflow-hidden flex flex-col relative min-h-[580px]">
        
        {/* Верхняя часть (Синяя плашка) */}
        <div className="bg-[#1976d2] p-8 text-white text-center space-y-3 shrink-0">
          <Shield size={48} className="mx-auto opacity-30" />
          <h3 className="text-xl tracking-tighter leading-none">МАГИСТРАЛЬ ТТЖТ</h3>
          <div className="flex flex-col items-center gap-2 pt-2">
            <p className="text-[10px] opacity-60 tracking-widest leading-relaxed">
              {mode === 'login' ? 'ЕЩЕ НЕТ АККАУНТА?' : 'УЖЕ ЕСТЬ АККАУНТ?'}
            </p>
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="bg-white/10 border border-white/20 hover:bg-white hover:text-[#1976d2] px-6 py-2 rounded-xl text-[10px] transition-all font-black"
            >
              {mode === 'login' ? 'СОЗДАТЬ' : 'ВОЙТИ'}
            </button>
          </div>
        </div>

        {/* Область формы (Анимированная) */}
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div 
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl text-[#1565c0] tracking-tighter mb-6">{mode === 'login' ? 'АВТОРИЗАЦИЯ' : 'РЕГИСТРАЦИЯ'}</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); onAuthSuccess(formData); }} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <AuthInput label="ФАМИЛИЯ" icon={<User size={16}/>} value={formData.surname} onChange={v => setFormData({...formData, surname: v})} />
                    <AuthInput label="ИМЯ" icon={<User size={16}/>} value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 ml-2 italic">ГРУППА</label>
                      <select 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-black text-[#1565c0] outline-none text-xs"
                        value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})}
                      >
                        <option value="">ВЫБОР...</option>
                        {groups.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <AuthInput label="E-MAIL" icon={<Mail size={16}/>} value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                <AuthInput label="ПАРОЛЬ" type="password" icon={<Lock size={16}/>} value={formData.password} onChange={v => setFormData({...formData, password: v})} />

                <button type="submit" className="w-full bg-[#1976d2] text-white py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-3 mt-6">
                  {mode === 'login' ? 'ВОЙТИ' : 'СОЗДАТЬ'} <ChevronRight size={18}/>
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
    <label className="text-[9px] text-slate-400 ml-2 italic">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>
      <input 
        type={type} required
        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-black text-[#1565c0] focus:border-[#1976d2] outline-none transition-all"
        value={value} onChange={e => onChange(e.target.value)}
      />
    </div>
  </div>
);