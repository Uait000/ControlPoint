import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Upload, FolderPlus, Trash2, Eye, EyeOff, ChevronDown, FileText, 
  Cpu, Zap, ShieldCheck, BookOpen, Layout, Code, Atom, Calculator, 
  FlaskConical, Globe, HardDrive, Terminal, Settings, Database, Activity, 
  UserPlus, X, ZoomIn, ZoomOut, Search, Check, RefreshCw, Printer 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subject } from '../types';
import { API_BASE_URL } from '../api';

interface DBTeacher {
  id?: number;
  teacher_id?: number; 
  name: string;
}

const AVAILABLE_ICONS = [
  { name: 'Cpu', Icon: Cpu }, { name: 'Zap', Icon: Zap }, { name: 'ShieldCheck', Icon: ShieldCheck },
  { name: 'BookOpen', Icon: BookOpen }, { name: 'Layout', Icon: Layout }, { name: 'Code', Icon: Code },
  { name: 'Atom', Icon: Atom }, { name: 'Calculator', Icon: Calculator }, { name: 'FlaskConical', Icon: FlaskConical },
  { name: 'Globe', Icon: Globe }, { name: 'HardDrive', Icon: HardDrive }, { name: 'Terminal', Icon: Terminal },
  { name: 'Settings', Icon: Settings }, { name: 'Database', Icon: Database }, { name: 'Activity', Icon: Activity }
];

export const AdminPanel = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dbTeachers, setDbTeachers] = useState<DBTeacher[]>([]); 
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminRole, setAdminRole] = useState<'SystemAdmin' | 'AssistantAdmin' | null>(null);
  
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [masterKey, setMasterKey] = useState('');

  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [isResettingBulk, setIsResettingBulk] = useState(false);

  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [uiScale, setUiScale] = useState(1.0);

  const getHeaders = (isJson = true) => {
    const h: any = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    if (isJson) h['Content-Type'] = 'application/json';
    return h;
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/storage/courses', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (e) {
      console.error("ОШИБКА ЗАГРУЗКИ КУРСОВ:", e);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch(API_BASE_URL + '/auth/teachers', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        console.log("ДАННЫЕ ПРЕПОДАВАТЕЛЕЙ:", data); 
        const sortedTeachers = (data || []).sort((a: DBTeacher, b: DBTeacher) => a.name.localeCompare(b.name, 'ru'));
        setDbTeachers(sortedTeachers);
      }
    } catch (e) {
      console.error("ОШИБКА ЗАГРУЗКИ ПРЕПОДАВАТЕЛЕЙ:", e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token.includes('.')) {
      try {
        const payloadPart = token.split('.')[1];
        const decodedPayload = JSON.parse(window.atob(payloadPart));
        
        if (decodedPayload.id === 0 || decodedPayload.account_type === 'SystemAdmin') {
          setAdminRole('SystemAdmin');
        } else if (decodedPayload.account_type === 'AssistantAdmin') {
          setAdminRole('AssistantAdmin');
        }
      } catch (e) {
        console.error("Ошибка парсинга JWT:", e);
        setAdminRole(null);
      }
    }
    fetchSubjects();
    fetchTeachers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTeacherDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const syncWithServer = async (subject: Subject) => {
    setIsSyncing(true);
    try {
      const res = await fetch(API_BASE_URL + `/storage/courses/${subject.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(subject)
      });
      if (!res.ok) throw new Error();
    } catch (e) {
      console.error("ОШИБКА СИНХРОНИЗАЦИИ");
    } finally {
      setIsSyncing(false);
    }
  };

  const addSubject = async () => {
    const newSubData = { 
        id: "0", 
        title: 'НОВЫЙ ПРЕДМЕТ', 
        iconName: 'Layout', 
        color: 'from-blue-600 to-blue-700', 
        sections: [], 
        isHidden: false 
    };
    
    try {
        const res = await fetch(API_BASE_URL + '/storage/courses', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(newSubData)
        });
        if (res.ok) {
            const newId = await res.json();
            const created = { ...newSubData, id: newId.toString() } as Subject;
            setSubjects([...subjects, created]);
            setExpandedSubjectId(created.id);
        }
    } catch (e) {
        alert("ОШИБКА СОЗДАНИЯ ПРЕДМЕТА");
    }
  };

  const deleteSubject = async (id: string) => {
    if (!window.confirm("УДАЛИТЬ ВЕСЬ ПРЕДМЕТ СО ВСЕМИ ДАННЫМИ?")) return;
    try {
      const res = await fetch(API_BASE_URL + `/storage/courses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(false)
      });
      if (res.ok) setSubjects(subjects.filter(s => s.id !== id));
    } catch (e) {
      alert("ОШИБКА УДАЛЕНИЯ");
    }
  };

  const deleteSection = (subjectId: string, sectionId: string) => {
    if (!window.confirm("УДАЛИТЬ ЭТОТ РАЗДЕЛ?")) return;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const updatedSubject = {
        ...subject,
        sections: subject.sections.filter(sec => sec.id !== sectionId)
    };
    setSubjects(subjects.map(s => s.id === subjectId ? updatedSubject : s));
    syncWithServer(updatedSubject);
  };

  const deleteLecture = (subjectId: string, sectionId: string, subId: string, lectureId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const updatedSubject = {
        ...subject,
        sections: subject.sections.map(sec => {
            if (sec.id !== sectionId) return sec;
            return {
                ...sec,
                subSections: sec.subSections.map(sub => {
                    if (sub.id !== subId) return sub;
                    return { ...sub, lectures: sub.lectures.filter(l => l.id !== lectureId) };
                })
            };
        })
    };
    setSubjects(subjects.map(s => s.id === subjectId ? updatedSubject : s));
    syncWithServer(updatedSubject);
  };

  const handleFileUpload = async (subjectId: string, sectionId: string, subId: string, file: File, replaceId?: string) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await fetch(API_BASE_URL + '/storage/courses/upload', {
        method: 'POST',
        headers: getHeaders(false),
        body: formData
      });
      
      if (!uploadRes.ok) throw new Error();
      const hashedName = await uploadRes.json();

      const updated = subjects.map(s => {
        if (s.id === subjectId) {
          const newSections = s.sections.map(sec => {
            if (sec.id === sectionId) {
              const newSubs = sec.subSections.map(sub => {
                if (sub.id === subId) {
                  const newLecture = { id: Date.now().toString(), title: file.name, fileName: hashedName };
                  return { 
                    ...sub, 
                    lectures: replaceId 
                      ? sub.lectures.map(l => l.id === replaceId ? newLecture : l)
                      : [...sub.lectures, newLecture]
                  };
                }
                return sub;
              });
              return { ...sec, subSections: newSubs };
            }
            return sec;
          });
          const updatedSub = { ...s, sections: newSections };
          syncWithServer(updatedSub);
          return updatedSub;
        }
        return s;
      });
      setSubjects(updated);
      alert("ФАЙЛ ЗАГРУЖЕН");
    } catch (e) {
      alert("ОШИБКА ЗАГРУЗКИ");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !masterKey) {
        return alert("Выберите преподавателя и введите мастер-ключ сис-админа");
    }

    setIsCreatingAdmin(true);
    try {
        const res = await fetch(API_BASE_URL + '/auth/register-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': masterKey.trim()
            },
            body: JSON.stringify({ 
                teacher_id: selectedTeacherId 
            })
        });

        if (res.ok) {
            alert("ПОМОЩНИК АДМИНИСТРАТОРА УСПЕШНО НАЗНАЧЕН!");
            setSelectedTeacherId(null);
            setMasterKey(''); 
            setShowAdminModal(false);
        } else {
            alert("ОШИБКА ДОСТУПА: Проверьте правильность секретного ключа системы.");
        }
    } catch (e) {
        alert("ОШИБКА СИТЕВОГО РЕЖИМА");
    } finally {
        setIsCreatingAdmin(false);
    }
  };

  const handleForceResetPasswordBulk = async () => {
    if (selectedTeacherIds.length === 0) {
      return alert("НЕ ВЫБРАН НИ ОДИН СОТРУДНИК ДЛЯ СБРОСА");
    }

    if (!window.confirm(`ВЫБРАНО СОТРУДНИКОВ ДЛЯ СБРОСА: ${selectedTeacherIds.length}. ПРОДОЛЖИТЬ ОПЕРАЦИЮ?`)) return;

    setIsResettingBulk(true);
    try {
      const results: { name: string; login: string; temporaryPassword: string }[] = [];
      
      for (const tId of selectedTeacherIds) {
        let tName = "ПРЕПОДАВАТЕЛЬ ТТЖТ";
        if (tId === 0) {
          tName = "ДИРЕКТОР ТТЖТ";
        } else {
          const match = dbTeachers.find(t => (t.teacher_id ?? t.id) === tId);
          if (match) tName = match.name;
        }

        try {
          const res = await fetch(API_BASE_URL + '/auth/admin-force-reset', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ teacher_id: tId })
          });

          if (res.ok) {
            const data = await res.json();
            results.push({
              name: tName,
              login: data.login,
              temporaryPassword: data.temporaryPassword
            });
          }
        } catch (innerError) {
          console.error(`Ошибка сброса для ID ${tId}:`, innerError);
        }
      }

      if (results.length > 0) {
        alert(`УСПЕШНО СБРОШЕНО КЛЮЧЕЙ: ${results.length}. СГЕНЕРИРОВАНЫ КАРТЫ ВОССТАНОВЛЕНИЯ ДОСТУПА.`);
        printCards(results);
        setSelectedTeacherIds([]);
      } else {
        alert("ОШИБКА: Не удалось выполнить сброс ни для одного выбранного аккаунта.");
      }
    } catch (e) {
      alert("КРИТИЧЕСКАЯ ОШИБКА ПРИ МАССОВОМ СБРОСЕ ПАРОЛЕЙ");
    } finally {
      setIsResettingBulk(false);
    }
  };

  const printCards = (cards: { name: string; login: string; temporaryPassword: string }[]) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    let tableRows = '';
    cards.forEach((card, idx) => {
      tableRows += `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="font-weight: 800; text-transform: uppercase;">${card.name}</td>
          <td class="mono">${card.login}</td>
          <td class="mono-pass">${card.temporaryPassword}</td>
          <td class="signature-cell"></td>
        </tr>
      `;
    });

    const htmlContent = `
      <html>
      <head>
        <title>Ведомость учетных данных ТТЖТ</title>
        <style>
          @page { size: A4 portrait; margin: 15mm 10mm 15mm 10mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 0; background-color: #ffffff; }
          .header-container { text-align: center; margin-bottom: 30px; border-bottom: 4px double #0f172a; padding-bottom: 15px; }
          h1 { font-size: 18px; font-weight: 800; text-transform: uppercase; margin: 0 0 8px 0; color: #0f172a; }
          h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; margin: 0; color: #475569; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th { background-color: #f1f5f9; color: #0f172a; font-weight: 800; text-transform: uppercase; font-size: 11px; border: 2px solid #0f172a; padding: 10px 6px; }
          td { border: 2px solid #0f172a; padding: 12px 8px; font-size: 13px; vertical-align: middle; }
          .mono { font-family: "Courier New", Courier, monospace; font-weight: 700; font-size: 14px; }
          .mono-pass { font-family: "Courier New", Courier, monospace; font-weight: 900; font-size: 16px; background-color: #f8fafc; text-align: center; letter-spacing: 0.5px; }
          .signature-cell { width: 110px; }
          .footer { margin-top: 35px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #334155; }
          .warn-text { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 25px; line-height: 1.4; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header-container">
          <h1>ТИХОРЕЦКИЙ ТЕХНИКУМ ЖЕЛЕЗНОДОРОЖНОГО ТРАНСПОРТА (ТТЖТ)</h1>
          <h2>РЕЕСТР-ВЕДОМОСТЬ ОПЕРАТИВНОГО ВОССТАНОВЛЕНИЯ ДОСТУПА К СИСТЕМЕ «МАГИСТРАЛЬ»</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">№</th>
              <th style="width: 45%;">ФИО сотрудника</th>
              <th style="width: 18%;">Логин</th>
              <th style="width: 17%;">Новый пароль</th>
              <th style="width: 15%;">Подпись</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          <div>Ответственный администратор БД: _________________</div>
          <div>Дата формирования: ${new Date().toLocaleDateString('ru-RU')} г.</div>
        </div>
        <p class="warn-text">Важно: Настоящая ведомость содержит конфиденциальные данные. После передачи паролей сотрудникам под роспись, данный документ подлежит хранению в установленном внутренним регламентом ТТЖТ порядке.</p>
      </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => { document.body.removeChild(iframe); }, 1000);
    }, 500);
  };

  const printStaticTemplate = async (fileName: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/templates/${fileName}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!res.ok) throw new Error();
      const htmlText = await res.text();

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) return;

      doc.open();
      doc.write(htmlText);
      doc.close();

      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => { document.body.removeChild(iframe); }, 1000);
      }, 400);
    } catch (e) {
      alert(`ОШИБКА ПЕЧАТИ ШАБЛОНА: Файл ${fileName} отсутствует на сервере.`);
    }
  };

  const toggleTeacherSelection = (tId: number) => {
    setSelectedTeacherIds(prev => 
      prev.includes(tId) ? prev.filter(id => id !== tId) : [...prev, tId]
    );
  };

  const filteredTeachers = dbTeachers.filter(t => 
    t.name.toUpperCase().includes(teacherSearchQuery.toUpperCase())
  );

  const selectedTeacherObj = dbTeachers.find(t => (t.teacher_id ?? t.id) === selectedTeacherId);

  return (
    <div 
      className="w-full max-w-6xl mx-auto space-y-6 md:space-y-10 font-black italic uppercase p-4 md:p-8 animate-in fade-in duration-500 text-slate-700 transition-all origin-top" 
      style={{ zoom: uiScale }}
    >
      
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-blue-50 gap-6">
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-3xl md:text-5xl text-[#1565c0] tracking-tighter leading-none">ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
          <div className="flex items-center gap-4 justify-center sm:justify-start mt-2">
            <p className="text-sm md:text-base text-slate-400 uppercase font-bold">
              {adminRole === 'AssistantAdmin' ? 'РЕЖИМ ПОМОЩНИКА АДМИНА' : 'СИСТЕМНЫЙ АДМИНИСТРАТОР ТТЖТ'}
            </p>
            <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-xl overflow-hidden shadow-inner">
              <button onClick={() => setUiScale(prev => Math.max(0.7, prev - 0.1))} className="p-2 hover:bg-slate-200 text-slate-500"><ZoomOut size={20} /></button>
              <span className="w-14 text-center text-sm font-black text-slate-600 bg-white py-2 border-x-2 border-slate-100">{Math.round(uiScale * 100)}%</span>
              <button onClick={() => setUiScale(prev => Math.min(1.5, prev + 0.1))} className="p-2 hover:bg-slate-200 text-slate-500"><ZoomIn size={20} /></button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 w-full sm:w-auto">
            {adminRole === 'SystemAdmin' && (
              <button 
                  onClick={() => setShowAdminModal(true)} 
                  className="w-full sm:w-auto bg-slate-100 text-slate-700 px-8 py-5 md:py-6 rounded-2xl flex items-center justify-center gap-3 shadow-sm hover:bg-slate-200 active:scale-95 transition-all text-base md:text-lg border-2 border-slate-200"
              >
                  <UserPlus size={28}/> СИСТЕМНЫЙ ДОСТУП
              </button>
            )}
            
            <button onClick={addSubject} className="w-full sm:w-auto bg-[#1976d2] text-white px-8 py-5 md:py-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-base md:text-lg border-b-4 border-blue-800 hover:bg-[#1565c0]">
                <Plus size={28}/> СОЗДАТЬ ПРЕДМЕТ
            </button>
        </div>
      </div>

      <div className="grid gap-6 md:gap-10">
        {subjects.map(subject => (
          <div key={subject.id} className={`bg-white rounded-[2rem] md:rounded-[3.5rem] transition-all duration-500 overflow-hidden border-4 ${expandedSubjectId === subject.id ? 'border-blue-200 shadow-2xl' : 'border-transparent shadow-md'}`}>
            <div className="p-6 md:p-10 flex items-center justify-between cursor-pointer" onClick={() => setExpandedSubjectId(expandedSubjectId === subject.id ? null : subject.id)}>
              <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                <div className="bg-blue-50 text-blue-600 p-5 rounded-2xl shrink-0">
                   {AVAILABLE_ICONS.find(i => i.name === subject.iconName)?.Icon ? React.createElement(AVAILABLE_ICONS.find(i => i.name === subject.iconName)!.Icon, { size: 36 }) : <Layout size={36}/>}
                </div>
                <div className="flex-1">
                   <input 
                    className="text-xl md:text-4xl text-[#1565c0] bg-transparent border-none outline-none font-black w-full truncate uppercase italic placeholder:text-blue-300" 
                    value={subject.title} 
                    onClick={(e) => e.stopPropagation()} 
                    onChange={(e) => setSubjects(subjects.map(s => s.id === subject.id ? {...s, title: e.target.value} : s))}
                    onBlur={() => syncWithServer(subject)}
                   />
                </div>
              </div>
              <div className="flex items-center gap-6 ml-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); deleteSubject(subject.id); }}
                    className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors"
                >
                    <Trash2 size={28} />
                </button>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <ChevronDown size={32} className={`text-slate-400 transition-transform ${expandedSubjectId === subject.id ? 'rotate-180 text-blue-600' : ''}`} />
                </div>
              </div>
            </div>

            <div className="origin-top">
              {expandedSubjectId === subject.id && (
                <div className="border-t-4 border-slate-50 bg-slate-50/30">
                  <div className="p-6 md:p-12 space-y-8">
                    <button onClick={() => {
                        const updated = {...subject, sections: [...subject.sections, { id: Date.now().toString(), title: 'НОВЫЙ РАЗДЕЛ', subSections: [] }]};
                        setSubjects(subjects.map(s => s.id === subject.id ? updated : s));
                        syncWithServer(updated);
                    }} className="w-full py-6 border-4 border-dashed border-blue-300 rounded-3xl text-blue-600 flex items-center justify-center gap-4 font-black text-lg md:text-xl uppercase italic hover:bg-blue-50 active:scale-95 shadow-sm transition-all"><FolderPlus size={28}/> ДОБАВИТЬ РАЗДЕЛ</button>
                    
                    <div className="space-y-8">
                      {subject.sections.map((section, sIdx) => (
                        <div key={section.id} className="md:ml-6 border-l-8 border-blue-200 pl-6 md:pl-10 space-y-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-md gap-4">
                            <div className="flex items-center gap-4 flex-1 w-full">
                               <span className="text-blue-400 text-2xl md:text-3xl font-black shrink-0">0{sIdx + 1}</span>
                               <input 
                                className="bg-transparent border-none outline-none font-black text-slate-800 w-full text-lg sm:text-2xl uppercase placeholder:text-slate-300" 
                                value={section.title} 
                                onChange={(e) => setSubjects(subjects.map(s => s.id === subject.id ? {...s, sections: s.sections.map(sec => sec.id === section.id ? {...sec, title: e.target.value} : sec)} : s))}
                                onBlur={() => syncWithServer(subject)}
                               />
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                              <button onClick={() => deleteSection(subject.id, section.id)} className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors">
                                  <Trash2 size={24} />
                              </button>
                              <button onClick={() => {
                                  const updated = {...subject, sections: subject.sections.map(sec => sec.id === section.id ? {...sec, subSections: [...sec.subSections, { id: Date.now().toString(), title: 'НОВЫЙ ПУНКТ', time: '20 МИН', status: 'active', lectures: [] }]} : sec)};
                                  setSubjects(subjects.map(s => s.id === subject.id ? updated : s));
                                  syncWithServer(updated);
                              }} className="flex-1 sm:flex-none text-white bg-blue-500 px-6 py-4 rounded-xl text-base md:text-lg font-black hover:bg-blue-600 shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-2">
                                <Plus size={20}/> ПУНКТ
                              </button>
                            </div>
                          </div>

                          <div className="grid gap-4 md:ml-12">
                            {section.subSections.map((sub) => (
                              <div key={sub.id} className="bg-white p-6 md:p-8 rounded-3xl border-4 border-dashed border-blue-200 space-y-6 shadow-sm">
                                <input 
                                 className="bg-transparent border-none outline-none text-[#1976d2] text-base md:text-xl font-black w-full uppercase placeholder:text-blue-300" 
                                 value={sub.title} 
                                 onChange={(e) => setSubjects(subjects.map(s => s.id === subject.id ? {...s, sections: s.sections.map(sec => sec.id === section.id ? {...sec, subSections: sec.subSections.map(ss => ss.id === sub.id ? {...ss, title: e.target.value} : ss)} : sec)} : s))}
                                 onBlur={() => syncWithServer(subject)}
                                />
                                <div className="flex flex-wrap items-center gap-4">
                                  {sub.lectures.map(l => (
                                    <div key={l.id} className="group flex items-center gap-3 bg-emerald-50 text-emerald-800 text-sm md:text-base px-4 py-3 rounded-xl border-2 border-emerald-200 font-black shadow-sm">
                                      <FileText size={20} className="text-emerald-500"/> {l.title}
                                      <button 
                                        onClick={() => deleteLecture(subject.id, section.id, sub.id, l.id)}
                                        className="ml-2 bg-white text-red-500 p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                      >
                                        <X size={16}/>
                                      </button>
                                    </div>
                                  ))}
                                  <label className="cursor-pointer bg-white text-[#1976d2] border-4 border-[#1976d2] px-6 py-3 rounded-2xl text-sm md:text-base flex items-center gap-3 hover:bg-[#1976d2] hover:text-white transition-all font-black italic shadow-md active:scale-95">
                                    <Upload size={20}/> ЗАГРУЗИТЬ PDF
                                    <input 
                                        type="file" accept=".pdf" className="hidden" 
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(subject.id, section.id, sub.id, e.target.files[0])} 
                                    />
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-8 border-8 border-slate-100 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setShowAdminModal(false)} className="absolute top-6 right-6 p-4 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-full transition-all"><X size={28}/></button>
              
              <div className="text-center space-y-4 pb-6 border-b-2 border-slate-100">
                 <div className="w-24 h-24 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <ShieldCheck size={48} />
                 </div>
                 <h3 className="text-3xl md:text-4xl font-black text-purple-800 italic tracking-tight uppercase leading-none">СИСТЕМНЫЙ ДОСТУП</h3>
                 <p className="text-sm md:text-base text-slate-500 font-bold uppercase">УПРАВЛЕНИЕ КЛЮЧАМИ И ПАКЕТНЫЙ СБРОС</p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200 space-y-4">
                <h4 className="text-sm font-black text-slate-600 tracking-wide leading-none uppercase italic">АРХИВ ПЕЧАТНЫХ ШАБЛОНОВ ПАРОЛЕЙ</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => printStaticTemplate('teachers_passwords.html')}
                    className="p-4 bg-white border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 rounded-2xl flex items-center gap-3 transition-all text-left group"
                  >
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800 leading-none">БЛАНК ПРЕПОДАВАТЕЛЕЙ</div>
                      <div className="text-[9px] text-slate-400 font-bold mt-1">TEACHERS_PASSWORDS.HTML</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => printStaticTemplate('director_password.html')}
                    className="p-4 bg-white border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 rounded-2xl flex items-center gap-3 transition-all text-left group"
                  >
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-100">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800 leading-none">БЛАНК ДИРЕКТОРА</div>
                      <div className="text-[9px] text-slate-400 font-bold mt-1">DIRECTOR_PASSWORD.HTML</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-6 bg-purple-50 rounded-2xl border-2 border-purple-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="text-base font-black text-purple-900 leading-none">ГРУППОВАЯ ПЕЧАТЬ И СБРОС</h4>
                  <p className="text-[10px] text-purple-600 font-bold uppercase mt-1">Выбрано сотрудников для сброса: {selectedTeacherIds.length}</p>
                </div>
                <button
                  type="button"
                  disabled={isResettingBulk || selectedTeacherIds.length === 0}
                  onClick={handleForceResetPasswordBulk}
                  className={`px-6 py-4 rounded-xl font-black tracking-wide transition-all uppercase text-sm shadow-md active:scale-95 flex items-center gap-2 text-white ${selectedTeacherIds.length === 0 ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800'}`}
                >
                  <Printer size={16} /> СБРОСИТЬ И ПЕЧАТАТЬ ({selectedTeacherIds.length})
                </button>
              </div>

              <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-200 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox"
                    className="w-6 h-6 rounded-lg border-2 border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    checked={selectedTeacherIds.includes(0)}
                    onChange={() => toggleTeacherSelection(0)}
                  />
                  <div>
                    <h4 className="text-base font-black text-amber-900 leading-none">УЧЁТНАЯ ЗАПИСЬ ДИРЕКТОРА</h4>
                    <p className="text-[10px] text-amber-600 font-bold uppercase mt-1">Восстановление административного доступа</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-6">
                  <div className="space-y-3 relative" ref={dropdownRef}>
                      <label className="text-sm md:text-base text-slate-500 font-black ml-2 uppercase">СПИСОК СОТРУДНИКОВ ДЛЯ СБРОСА И НАЗНАЧЕНИЯ</label>
                      <div 
                        onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                        className="w-full bg-slate-50 border-4 border-slate-200 rounded-2xl px-6 py-4 text-lg md:text-xl font-black text-purple-700 outline-none flex justify-between items-center cursor-pointer select-none"
                      >
                        <span>{selectedTeacherObj ? selectedTeacherObj.name.toUpperCase() : 'ВЫБЕРИТЕ ПРЕПОДАВАТЕЛЯ...'}</span>
                        <ChevronDown size={24} className={`transition-transform duration-300 ${isTeacherDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>

                      <AnimatePresence>
                        {isTeacherDropdownOpen && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-[1100] left-0 right-0 top-full mt-2 bg-white border-4 border-slate-100 rounded-2xl shadow-2xl p-3 space-y-3 max-h-64 flex flex-col">
                            <div className="relative flex-shrink-0">
                              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text"
                                placeholder="ПОИСК ПО ФИО..."
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-black italic uppercase text-slate-700 outline-none focus:border-purple-400 transition-colors"
                                value={teacherSearchQuery}
                                onChange={e => setTeacherSearchQuery(e.target.value)}
                                onClick={e => e.stopPropagation()}
                              />
                            </div>
                            <div className="overflow-y-auto flex-1 space-y-1 pr-1 custom-scrollbar">
                              {filteredTeachers.length > 0 ? (
                                filteredTeachers.map(t => {
                                  const tId = t.teacher_id ?? t.id ?? 0;
                                  const isChecked = selectedTeacherIds.includes(tId);
                                  
                                  return (
                                    <div
                                      key={tId}
                                      onClick={() => setSelectedTeacherId(tId)}
                                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black italic border-2 cursor-pointer transition-all ${selectedTeacherId === tId ? 'bg-purple-50 border-purple-200' : 'border-transparent hover:bg-slate-50'}`}
                                    >
                                      <div className="flex items-center gap-4 flex-1">
                                        <input 
                                          type="checkbox"
                                          className="w-5 h-5 rounded border-2 border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                          checked={isChecked}
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={() => toggleTeacherSelection(tId)}
                                        />
                                        <span>{t.name.toUpperCase()}</span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-xs text-slate-400 text-center py-4 font-black italic">СОТРУДНИКИ НЕ НАЙДЕНЫ</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </div>

                  <div className="space-y-3 pt-4 border-t-2 border-slate-100">
                      <label className="text-sm md:text-base text-slate-500 font-black ml-2 uppercase">МАСТЕР-КЛЮЧ ПОДТВЕРЖДЕНИЯ ГЛАВНОГО СИС-АДМИНА</label>
                      <input 
                          type="password" 
                          required 
                          value={masterKey}
                          onChange={(e) => setMasterKey(e.target.value)}
                          className="w-full bg-orange-50 border-4 border-orange-200 rounded-2xl px-6 py-4 text-lg md:text-xl font-black text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all placeholder:text-orange-300"
                          placeholder="ВВЕДИТЕ СЕКРЕТНЫЙ КЛЮЧ СИСТЕМЫ"
                      />
                  </div>

                  <button 
                      type="submit" 
                      disabled={isCreatingAdmin}
                      className={`w-full mt-6 py-6 rounded-2xl font-black text-lg md:text-xl transition-all shadow-xl border-b-4 ${isCreatingAdmin ? 'bg-slate-300 border-slate-400 text-slate-100' : 'bg-purple-600 border-purple-800 text-white hover:bg-purple-500 active:scale-95'}`}
                  >
                      {isCreatingAdmin ? 'НАЗНАЧЕНИЕ...' : 'НАЗНАЧИТЬ ПОМОЩНИКОМ АДМИНИСТРАТОРА'}
                  </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};