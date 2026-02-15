import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, Users, ChevronRight } from 'lucide-react';

export const RegistrationPage = ({ onAuthSuccess }: { onAuthSuccess: (data: any) => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({ surname: '', name: '', group: '', email: '', password: '' });
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    setGroups(['КС-2-1', 'Р-1-1', 'Т-2-1']); // Заглушка, пока нет бэка
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    onAuthSuccess({...formData, role: 'student'});
  };

  return (
    <div className="fixed inset-0 z-[600] bg-[#f0f7ff] flex items-center justify-center p-4 font-black italic uppercase overflow-y-auto">
      {/* ЕДИНАЯ КАРТОЧКА С РАМКАМИ КАК В APP.TSX */}
      <div className="bg-white w-full max-w-md md:max-w-4xl md:rounded-[4rem] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative min-h-[600px] border-4 md:border-8 border-white">
        
        {/* СИНЯЯ ПАНЕЛЬ */}
        <div className={`bg-[#1976d2] p-8 md:p-12 text-white text-center space-y-4 shrink-0 md:w-1/2 flex flex-col justify-center transition-all order-first ${isLogin ? 'md:order-first' : 'md:order-last'}`}>
          <Shield size={48} className="mx-auto opacity-50 md:w-[60px] md:h-[60px]" />
          <h3 className="text-2xl md:text-4xl font-black tracking-tighter leading-none">МАГИСТРАЛЬ <br/> ТТЖТ</h3>
          <button 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="bg-white/10 border-2 border-white/30 hover:bg-white hover:text-[#1976d2] px-8 py-3 md:px-10 md:py-4 rounded-[2rem] text-[10px] md:text-xs transition-all font-black uppercase italic active:scale-95 shadow-lg"
          >
            {mode === 'login' ? 'СОЗДАТЬ АККАУНТ' : 'ВОЙТИ В ПРОФИЛЬ'}
          </button>
        </div>

        {/* БЕЛАЯ ПАНЕЛЬ */}
        <div className="p-8 md:p-16 flex-1 flex flex-col justify-center md:w-1/2 bg-white">
          <AnimatePresence mode="wait">
            <motion.div 
              key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-6 max-w-sm mx-auto"
            >
              <div className="space-y-1">
                 <h2 className="text-3xl md:text-4xl text-[#1565c0] tracking-tighter font-black italic">{mode === 'login' ? 'ВХОД' : 'СОЗДАТЬ'}</h2>
                 <p className="text-[9px] text-slate-400 uppercase tracking-widest">{mode === 'login' ? 'АВТОРИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ' : 'РЕГИСТРАЦИЯ НОВОГО УЧАСТНИКА'}</p>
              </div>
              
              <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'register' && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                    <AuthInput label="ФАМИЛИЯ" icon={<User size={16}/>} value={formData.surname} onChange={(v:any) => setFormData({...formData, surname: v.toUpperCase()})} />
                    <AuthInput label="ИМЯ" icon={<User size={16}/>} value={formData.name} onChange={(v:any) => setFormData({...formData, name: v.toUpperCase()})} />
                  </div>
                )}
                
                {mode === 'register' && (
                    <div className="space-y-1 animate-in slide-in-from-left-2">
                      <label className="text-[9px] text-slate-400 ml-3 font-black italic">ГРУППА</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1976d2]/40" size={16} />
                        <select required className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-12 pr-4 font-black text-[#1565c0] outline-none text-[11px] shadow-inner uppercase appearance-none" value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})}>
                          <option value="">ВЫБОР...</option>
                          {groups.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90" />
                      </div>
                    </div>
                )}

                <AuthInput label="E-MAIL / ЛОГИН" icon={<Mail size={18}/>} value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} />
                <AuthInput label="ПАРОЛЬ" type="password" icon={<Lock size={18}/>} value={formData.password} onChange={(v:any) => setFormData({...formData, password: v})} />

                <button type="submit" className="w-full bg-[#1976d2] text-white py-4 md:py-5 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-3 mt-8 active:scale-95 transition-all text-sm font-black italic uppercase">
                  {mode === 'login' ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'} <ChevronRight size={20}/>
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
    <label className="text-[9px] text-slate-400 ml-3 font-black uppercase italic">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1976d2]/40">{icon}</div>
      <input 
        type={type} required
        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-12 pr-4 text-[11px] font-black text-[#1565c0] focus:ring-2 focus:ring-[#1976d2]/20 outline-none shadow-inner italic"
        value={value} onChange={e => onChange(e.target.value)}
      />
    </div>
  </div>
);