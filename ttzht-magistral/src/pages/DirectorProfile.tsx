import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Users, ZoomIn, ZoomOut, 
  BarChart3, ShieldCheck, ChevronDown, ChevronUp, Filter, 
  BookOpenCheck, LayoutGrid, BarChart2, TableProperties, Eye, EyeOff, GraduationCap, Printer, X
} from 'lucide-react';
import { API_BASE_URL } from '../api';
import defaultAvatar from '../assets/avatarka.png';

interface DirectorTestDetails {
  testId: number;
  docxName: string;
  lessonName: string;
  groupName: string;
  studentsPassed: number;
  testKz: number;
  testResult: number;
  testSuccess: number;
}

interface TeacherAnalytics {
  teacherId: number;
  name: string;
  testsConducted: number;
  studentsTested: number;
  averageKz: number;
  averageSuccess: number;
  detailedTests: DirectorTestDetails[];
}

type ViewMode = 'cards' | 'charts' | 'table';

export const DirectorProfile = () => {
  const [analytics, setAnalytics] = useState<TeacherAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uiScale, setUiScale] = useState(1.0);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedLesson, setSelectedLesson] = useState<string>('ВСЕ');
  const [selectedTopic, setSelectedTopic] = useState<string>('ВСЕ');
  const [selectedGroup, setSelectedGroup] = useState<string>('ВСЕ');
  const [showKz, setShowKz] = useState<boolean>(true);
  const [showSuccess, setShowSuccess] = useState<boolean>(true);
  const [expandedTeacher, setExpandedTeacher] = useState<number | null>(null);
  const [hoveredTeacherId, setHoveredTeacherId] = useState<number | null>(null);
  const [isPrintModalOpen, setIsSpecialPrintModalOpen] = useState<boolean>(false);
  const [printTarget, setPrintTarget] = useState<'all' | 'selected'>('all');
  const [selectedTeachersForPrint, setSelectedTeachersForPrint] = useState<number[]>([]);
  const [printIncludeKpi, setPrintIncludeKpi] = useState<boolean>(true);
  const [printIncludeCharts, setPrintIncludeCharts] = useState<boolean>(true);
  const [printIncludeTable, setPrintIncludeTable] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/director/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          const sortedData = (data || []).sort((a: TeacherAnalytics, b: TeacherAnalytics) => 
            a.name.localeCompare(b.name, 'ru')
          );
          setAnalytics(sortedData);
        }
    } catch (error) {
        console.error("Ошибка загрузки аналитики директора:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedTopic('ВСЕ');
  }, [selectedLesson]);

  const getStatusColor = (value: number) => {
    if (value >= 70) return 'text-emerald-600 border-emerald-200 bg-emerald-500';
    if (value >= 50) return 'text-blue-600 border-blue-200 bg-blue-500';
    return 'text-amber-600 border-amber-200 bg-amber-500';
  };

  const getStatusBg = (value: number) => {
    if (value >= 70) return 'bg-emerald-50 border-emerald-100';
    if (value >= 50) return 'bg-blue-50 border-blue-100';
    return 'bg-amber-50/70 border-amber-100';
  };

  const allLessons = ['ВСЕ', ...new Set((analytics || []).flatMap(t => (t?.detailedTests || []).map(d => d?.lessonName || '')))].filter(Boolean);
  const allTopics = ['ВСЕ', ...new Set((analytics || []).flatMap(t => (t?.detailedTests || [])).filter(d => selectedLesson === 'ВСЕ' || d?.lessonName?.trim() === selectedLesson).map(d => d?.docxName || ''))].filter(Boolean);
  const allGroups = ['ВСЕ', ...new Set((analytics || []).flatMap(t => (t?.detailedTests || []).map(d => d?.groupName || '')))].filter(Boolean);

  const filteredAnalytics = (analytics || []).map(teacher => {
    const filteredTests = (teacher?.detailedTests || []).filter(test => {
      const matchLesson = selectedLesson === 'ВСЕ' || test?.lessonName?.trim() === selectedLesson;
      const matchTopic = selectedTopic === 'ВСЕ' || test?.docxName?.trim() === selectedTopic;
      const matchGroup = selectedGroup === 'ВСЕ' || test?.groupName?.trim() === selectedGroup;
      return matchLesson && matchTopic && matchGroup;
    });

    if (filteredTests.length === 0 && (selectedLesson !== 'ВСЕ' || selectedTopic !== 'ВСЕ' || selectedGroup !== 'ВСЕ')) {
      return { ...teacher, testsConducted: 0, studentsTested: 0, averageKz: 0, averageSuccess: 0, detailedTests: [] };
    }

    const studentsTested = filteredTests.reduce((acc, c) => acc + (c?.studentsPassed || 0), 0);
    const averageKz = filteredTests.length > 0 ? Math.round(filteredTests.reduce((acc, c) => acc + (c?.testKz || 0), 0) / filteredTests.length) : 0;
    const averageSuccess = filteredTests.length > 0 ? Math.round(filteredTests.reduce((acc, c) => acc + (c?.testSuccess || 0), 0) / filteredTests.length) : 0;

    return { ...teacher, testsConducted: filteredTests.length, studentsTested, averageKz, averageSuccess, detailedTests: filteredTests };
  }).filter(t => {
    if (selectedLesson === 'ВСЕ' && selectedTopic === 'ВСЕ' && selectedGroup === 'ВСЕ') return true;
    return t.testsConducted > 0;
  });

  const totalTests = filteredAnalytics.reduce((acc, curr) => acc + (curr?.testsConducted || 0), 0);
  const totalStudents = filteredAnalytics.reduce((acc, curr) => acc + (curr?.studentsTested || 0), 0);
  
  const activeStaffForKz = filteredAnalytics.filter(a => (a?.studentsTested || 0) > 0);
  const avgSchoolKz = activeStaffForKz.length > 0 ? Math.round(activeStaffForKz.reduce((acc, curr) => acc + (curr?.averageKz || 0), 0) / activeStaffForKz.length) : 0;
  const avgSchoolSuccess = activeStaffForKz.length > 0 ? Math.round(activeStaffForKz.reduce((acc, curr) => acc + (curr?.averageSuccess || 0), 0) / activeStaffForKz.length) : 0;

  const toggleTeacherPrintSelection = (id: number) => {
    setSelectedTeachersForPrint(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const RenderTooltip = ({ teacherId }: { teacherId: number }) => {
    const teacher = analytics.find(t => t.teacherId === teacherId);
    const groups = [...new Set((teacher?.detailedTests || []).map(d => d.groupName))];
    return (
      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 z-50 bg-white border border-slate-200 p-4 rounded-2xl shadow-xl min-w-[220px] normal-case font-bold text-xs italic space-y-2 pointer-events-none">
        <div className="flex items-center gap-1.5 text-blue-600 uppercase font-black tracking-wider"><GraduationCap size={15}/> ГРУППЫ ПРЕПОДАВАТЕЛЯ:</div>
        <div className="h-px bg-slate-100 w-full"/>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {groups.length > 0 ? groups.map(g => <span key={g} className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg font-black uppercase text-[10px] shadow-sm">{g}</span>) : <span className="text-slate-400">Назначения отсутствуют</span>}
        </div>
      </div>
    );
  };

  const handleExecutePrint = () => {
    setIsSpecialPrintModalOpen(false);

    const targetData = printTarget === 'all' 
      ? filteredAnalytics 
      : filteredAnalytics.filter(t => selectedTeachersForPrint.includes(t.teacherId));

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    let htmlContent = `
      <html>
      <head>
        <title>Отчет Мониторинга ТТЖТ</title>
        <style>
          body { font-family: sans-serif; color: #000000; padding: 20px; line-height: 1.4; }
          .header { text-align: center; border-bottom: 4px solid #000000; padding-bottom: 12px; margin-bottom: 25px; }
          .header h1 { font-size: 19px; margin: 0; font-weight: 900; text-transform: uppercase; color: #000000; }
          .header h2 { font-size: 14px; margin: 6px 0 0 0; font-weight: 800; color: #000000; text-transform: uppercase; }
          
          .filter-badge-panel { margin-top: 10px; display: flex; justify-content: center; gap: 12px; font-size: 11px; font-weight: 900; }
          .filter-badge { border: 2px solid #000000; padding: 4px 10px; border-radius: 6px; color: #000000; background: #ffffff; text-transform: uppercase; }

          .kpi-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
          .kpi-card { border: 2px solid #000000; padding: 12px; border-radius: 12px; background: #ffffff; }
          .kpi-title { font-size: 10px; font-weight: 900; color: #000000; text-transform: uppercase; margin-bottom: 3px; }
          .kpi-val { font-size: 21px; font-weight: 900; color: #000000; }
          
          .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; border-bottom: 3px solid #000000; padding-bottom: 4px; margin-top: 30px; margin-bottom: 15px; color: #000000; }
          
          .chart-card { border: 2px solid #000000; padding: 14px; margin-bottom: 14px; background: #ffffff; page-break-inside: avoid; border-radius: 8px; }
          .chart-name { font-size: 14px; font-weight: 900; text-transform: uppercase; color: #000000; border-bottom: 2px dashed #000000; padding-bottom: 6px; margin-bottom: 8px; }
          .sub-test-row { font-size: 12px; padding: 6px 0; color: #000000; border-bottom: 1.5px solid #000000; }
          .sub-test-row:last-child { border-bottom: none; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          tr { page-break-inside: avoid; }
          th, td { border: 2px solid #000000; padding: 10px; font-size: 12px; text-align: left; color: #000000; }
          th { background-color: #f8fafc; font-weight: 900; text-transform: uppercase; }
          td.center { text-align: center; font-weight: 900; }
          
          .footer-signatures { margin-top: 70px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; color: #000000; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ТИХОРЕЦКИЙ ТЕХНИКУМ ЖЕЛЕЗНОДОРОЖНОГО ТРАНСПОРТА (ТТЖТ)</h1>
          <h2>СВОДНАЯ ВЕДОМОСТЬ АТТЕСТАЦИИ И МОНИТОРИНГА ЗНАНИЙ СТУДЕНТОВ</h2>
          
          <div class="filter-badge-panel">
            <div class="filter-badge">ДИСЦИПЛИНА: ${selectedLesson}</div>
            <div class="filter-badge">ТЕМА: ${selectedTopic}</div>
            <div class="filter-badge">ГРУППА: ${selectedGroup}</div>
          </div>
        </div>
    `;

    if (printIncludeKpi) {
      htmlContent += `
        <div class="kpi-grid">
          <div class="kpi-card"><div class="kpi-title">Выбрано тестов в срезе:</div><div class="kpi-val">${totalTests}</div></div>
          <div class="kpi-card"><div class="kpi-title">Прошедших студентов:</div><div class="kpi-val">${totalStudents} ЧЕЛ.</div></div>
          <div class="kpi-card"><div class="kpi-title">Среднее КЗ по срезу:</div><div class="kpi-val">${avgSchoolKz}%</div></div>
        </div>
      `;
    }

    if (printIncludeCharts) {
      htmlContent += `<div class="section-title">1. Подробный детализированный аудит по преподавателям</div>`;
      targetData.filter(t => t.testsConducted > 0).forEach(teacher => {
        htmlContent += `
          <div class="chart-card">
            <div class="chart-name">${teacher.name.toUpperCase()}</div>
            <div style="font-size: 12px; margin-bottom: 10px; color: #000000; font-weight: 900;">
              Total тестов в срезе: ${teacher.testsConducted} | Агрегированное КЗ: ${teacher.averageKz}% | Успеваемость: ${teacher.averageSuccess}%
            </div>
            <div style="margin-left: 10px; border-left: 3px solid #000000; padding-left: 12px;">
              ${teacher.detailedTests.map(test => `
                <div class="sub-test-row">
                  • <strong>Тема исследования:</strong> ${test.docxName}<br/>
                  <span style="font-size: 11px; color: #000000; font-weight: 700;">
                    Дисциплина: ${test.lessonName} | Академ. Группа: ${test.groupName} | Прохло аттестацию: ${test.studentsPassed} чел. | 
                    <strong>Качество знаний (КЗ): ${test.testKz}%</strong> | Успеваемость: ${test.testSuccess}%
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      });
    }

    if (printIncludeTable) {
      htmlContent += `
        <div class="section-title" style="margin-top:25px;">2. Сводная таблица результатов аттестационной сессии</div>
        <table>
          <thead>
            <tr>
              <th>ФИО Преподавателя</th>
              <th class="center">Тесты</th>
              <th class="center">Сдачи</th>
              <th class="center">Среднее КЗ</th>
              <th class="center">Успеваемость</th>
              <th>Закрепленные в срезе группы</th>
            </tr>
          </thead>
          <tbody>
      `;

      targetData.forEach(teacher => {
        const tGroups = [...new Set((teacher?.detailedTests || []).map(d => d.groupName))].join(', ');
        htmlContent += `
          <tr>
            <td><strong>${teacher.name.toUpperCase()}</strong></td>
            <td class="center">${teacher.testsConducted}</td>
            <td class="center">${teacher.studentsTested}</td>
            <td class="center">${teacher.averageKz}%</td>
            <td class="center">${teacher.averageSuccess}%</td>
            <td style="font-style:italic; font-size:11px; text-transform:uppercase; font-weight: 900;">${tGroups || 'нет активных сдач'}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    }

    htmlContent += `
        <div class="footer-signatures">
          <div>Ответственный за мониторинг: ___________________</div>
          <div>Директор ТТЖТ: ___________________</div>
        </div>
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 font-black italic uppercase p-4 md:p-8 text-slate-700 transition-all origin-top select-none" style={{ zoom: uiScale }}>
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 gap-6 print:hidden">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-[1.8rem] flex items-center justify-center shadow-lg shadow-blue-100">
            <BarChart3 size={36} />
          </div>
          <div>
            <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-black mb-2 tracking-widest">ТТЖТ • СИСТЕМА МОНИТОРИНГА</div>
            <h1 className="text-3xl md:text-4xl text-slate-800 tracking-tighter leading-none">ПАНЕЛЬ ДИРЕКТОРА</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => setIsSpecialPrintModalOpen(true)} 
            className="h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-2xl flex items-center gap-2 text-xs font-black shadow-lg shadow-emerald-100 active:scale-95 transition-all"
          >
            <Printer size={16}/> ПЕЧАТЬ ОТЧЁТА
          </button>

          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={() => setViewMode('cards')} className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black italic ${viewMode === 'cards' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={16} /> КАРТОЧКИ</button>
            <button onClick={() => setViewMode('charts')} className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black italic ${viewMode === 'charts' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><BarChart2 size={16} /> ГРАФИКИ</button>
            <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black italic ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><TableProperties size={16} /> ТАБЛИЦА</button>
          </div>
          <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl overflow-hidden h-[46px]">
            <button onClick={() => setUiScale(prev => Math.max(0.7, prev - 0.1))} className="p-3 hover:bg-slate-200 text-slate-400"><ZoomOut size={18} /></button>
            <span className="w-14 text-center text-xs font-black text-slate-500 bg-white py-2">{Math.round(uiScale * 100)}%</span>
            <button onClick={() => setUiScale(prev => Math.min(1.4, prev + 0.1))} className="p-3 hover:bg-slate-200 text-slate-400"><ZoomIn size={18} /></button>
          </div>
        </div>
      </div>

      {/* ФИЛЬТРЫ */}
      <div className="bg-white p-6 rounded-[2rem] shadow-md border border-slate-100 flex flex-col xl:flex-row items-stretch xl:items-center gap-6 print:hidden">
        <div className="flex items-center gap-3 text-blue-600 min-w-[210px] shrink-0"><Filter size={24} /><span className="tracking-wider text-sm">ФИЛЬТРАЦИЯ СВОДОВ:</span></div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-6 items-stretch w-full">
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-xs text-slate-400 block tracking-widest">ДИСЦИПЛИНА / ПРЕДМЕТ</label>
            <select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 text-sm p-3 rounded-xl italic font-black outline-none focus:border-blue-400 transition-all text-slate-600">
              {allLessons.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-xs text-slate-400 block tracking-widest">ТЕМА АТТЕСТАЦИИ</label>
            <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 text-sm p-3 rounded-xl italic font-black outline-none focus:border-blue-400 transition-all text-slate-600">
              {allTopics.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-xs text-slate-400 block tracking-widest">АКАДЕМИЧЕСКАЯ ГРУППА</label>
            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 text-sm p-3 rounded-xl italic font-black outline-none focus:border-blue-400 transition-all text-slate-600">
              {allGroups.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* КОНФИГУРАТОР МЕТРИК */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex flex-wrap items-center gap-6 text-xs font-black print:hidden">
        <span className="text-slate-400 tracking-wider">КОНФИГУРАТОР СВЕДЕНИЙ:</span>
        <button onClick={() => setShowKz(!showKz)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${showKz ? 'bg-white border-blue-200 text-blue-600 shadow-sm' : 'text-slate-400 border-transparent'}`}>
          {showKz ? <Eye size={14}/> : <EyeOff size={14}/>} КАЧЕСТВО ЗНАНИЙ (КЗ)
        </button>
        <button onClick={() => setShowSuccess(!showSuccess)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${showSuccess ? 'bg-white border-blue-200 text-blue-600 shadow-sm' : 'text-slate-400 border-transparent'}`}>
          {showSuccess ? <Eye size={14}/> : <EyeOff size={14}/>} УСПЕВАЕМОСТЬ
        </button>
      </div>

      {/* KPI СВЕДЕНИЯ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex items-center justify-between">
          <div><p className="text-xs text-slate-400 mb-1 tracking-widest">ПРОВЕДЕНО ТЕСТОВ</p><p className="text-4xl font-black text-blue-600">{totalTests}</p></div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><BookOpenCheck size={28}/></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex items-center justify-between">
          <div><p className="text-xs text-slate-400 mb-1 tracking-widest">ОХВАТ АТТЕСТАЦИИ</p><p className="text-4xl font-black text-purple-600">{totalStudents} СТУД.</p></div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Users size={28}/></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex items-center justify-between">
          <div><p className="text-xs text-slate-400 mb-1 tracking-widest">СРЕДНЕЕ КЗ ПО ТТЖТ</p><p className="text-4xl font-black text-emerald-600">{avgSchoolKz}%</p></div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={28}/></div>
        </div>
      </div>

      {/* ЭКРАННЫЙ СЛОЙ */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
        <h2 className="text-2xl text-slate-800 border-b-2 border-slate-100 pb-4 flex items-center gap-3"><ShieldCheck className="text-blue-600" size={28}/> МОНИТОРИНГ КАДРОВОГО СОСТАВА ТЕХНИКУМА</h2>

        <div>
          {isLoading ? (
            <div className="text-center py-16 animate-pulse text-lg text-slate-400">Парсинг результатов Diesel ORM...</div>
          ) : filteredAnalytics.length === 0 ? (
            <div className="text-center py-16 text-slate-400">По заданным фильтрам срезов данных не найдено.</div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === 'cards' && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-4">
                  {filteredAnalytics.map((teacher) => {
                    const isExpanded = expandedTeacher === teacher.teacherId;
                    return (
                      <div key={teacher.teacherId} className={`border-2 rounded-[2rem] transition-all bg-white shadow-sm relative ${isExpanded ? 'border-blue-200' : 'border-slate-100'}`}>
                        <AnimatePresence>{hoveredTeacherId === teacher.teacherId && <RenderTooltip teacherId={teacher.teacherId} />}</AnimatePresence>
                        <div className="p-6 flex flex-col xl:flex-row gap-6 items-center">
                          <div className="flex-1 w-full flex items-center gap-4 cursor-pointer" onMouseEnter={() => setHoveredTeacherId(teacher.teacherId)} onMouseLeave={() => setHoveredTeacherId(null)} onClick={() => setExpandedTeacher(isExpanded ? null : teacher.teacherId)}>
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden shrink-0"><img src={defaultAvatar} alt="avatar" /></div>
                            <div>
                              <h3 className="text-xl font-black text-slate-800 tracking-tight hover:text-blue-600 transition-colors">{teacher.name.toUpperCase()}</h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">{teacher.testsConducted} ТЕСТОВ</span>
                                <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">{teacher.studentsTested} УЧЕНИКОВ СДАЛО</span>
                              </div>
                            </div>
                          </div>
                          <div onClick={() => setExpandedTeacher(isExpanded ? null : teacher.teacherId)} className="w-full xl:w-auto flex items-center gap-8 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 justify-between sm:justify-start cursor-pointer">
                            {showKz && <div className="text-center"><span className="block text-[10px] text-slate-400 tracking-wider">СРЕДНЕЕ КЗ</span><span className={`text-lg font-black ${getStatusColor(teacher.averageKz).split(' ')[0]}`}>{teacher.averageKz}%</span></div>}
                            {showKz && showSuccess && <div className="w-0.5 h-8 bg-slate-200"/>}
                            {showSuccess && <div className="text-center"><span className="block text-[10px] text-slate-400 tracking-wider">УСПЕВАЕМОСТЬ</span><span className={`text-lg font-black ${getStatusColor(teacher.averageSuccess).split(' ')[0]}`}>{teacher.averageSuccess}%</span></div>}
                            <div className="ml-4">{isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}</div>
                          </div>
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-slate-50/30 border-t-2 border-slate-100 overflow-hidden">
                              <div className="p-6 space-y-3">
                                {(teacher?.detailedTests || []).map((test) => (
                                  <div key={test?.testId} className={`p-5 rounded-2xl border-2 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${getStatusBg(test?.testKz || 0)}`}>
                                    <div className="space-y-2 flex-1">
                                      <div className="text-base font-black text-slate-800 tracking-tight leading-tight">{test?.docxName}</div>
                                      <div className="flex flex-wrap gap-2 text-xs font-black tracking-tight">
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-lg border border-blue-700 shadow-sm">ПРЕДМЕТ: {(test?.lessonName || '').toUpperCase()}</span>
                                        <span className="bg-purple-600 text-white px-3 py-1 rounded-lg border border-purple-700 shadow-sm">ГРУППА: {test?.groupName}</span>
                                        <span className="bg-slate-700 text-white px-3 py-1 rounded-lg border border-slate-800 shadow-sm">ПРОШЛО: {test?.studentsPassed} ЧЕЛ.</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-4 text-xs shrink-0 w-full md:w-auto">
                                      {showKz && <div className="bg-white px-4 py-2 rounded-xl border-2 border-slate-200 text-center shadow-sm"><span className="text-slate-400 block text-[10px] font-black tracking-widest">КЗ ТЕСТА</span><span className={`font-black text-base ${getStatusColor(test?.testKz || 0).split(' ')[0]}`}>{test?.testKz || 0}%</span></div>}
                                      {showSuccess && <div className="bg-white px-4 py-2 rounded-xl border-2 border-slate-200 text-center shadow-sm"><span className="text-slate-400 block text-[10px] font-black tracking-widest">УСПЕВАЕМОСТЬ</span><span className={`font-black text-base ${getStatusColor(test?.testSuccess || 0).split(' ')[0]}`}>{test?.testSuccess || 0}%</span></div>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {viewMode === 'charts' && (
                <div className="space-y-6">
                  {filteredAnalytics.filter(t => t.testsConducted > 0).map((teacher) => {
                    const kzDelta = teacher.averageKz - avgSchoolKz;
                    const successDelta = teacher.averageSuccess - avgSchoolSuccess;
                    return (
                      <div key={teacher.teacherId} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-6 relative" onMouseEnter={() => setHoveredTeacherId(teacher.teacherId)} onMouseLeave={() => setHoveredTeacherId(null)}>
                        <AnimatePresence>{hoveredTeacherId === teacher.teacherId && <RenderTooltip teacherId={teacher.teacherId} />}</AnimatePresence>
                        <div className="flex justify-between items-center border-b border-slate-200/60 pb-2"><span className="font-black text-lg text-slate-800 tracking-tight cursor-help">{teacher.name.toUpperCase()}</span></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {showKz && (
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                              <div className="flex justify-between text-xs font-bold tracking-wider items-center">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                  КАЧЕСТВО ЗНАНИЙ (КЗ)
                                  {kzDelta >= 0 ? <span className="text-emerald-600 text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+{kzDelta}%</span> : <span className="text-amber-600 text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{kzDelta}%</span>}
                                </span>
                                <span className={`font-black text-sm ${getStatusColor(teacher.averageKz).split(' ')[0]}`}>{teacher.averageKz}%</span>
                              </div>
                              <div className="w-full h-24 bg-slate-50 rounded-xl relative overflow-hidden border border-slate-100">
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <path d={`M 0 100 Q 25 ${100 - teacher.averageKz * 0.8}, 50 ${100 - teacher.averageKz}, T 100 ${100 - teacher.averageKz} L 100 100 Z`} fill="rgba(16, 185, 129, 0.1)" />
                                  <path d={`M 0 100 Q 25 ${100 - teacher.averageKz * 0.8}, 50 ${100 - teacher.averageKz}, T 100 ${100 - teacher.averageKz}`} fill="none" stroke={teacher.averageKz >= 50 ? '#10b981' : '#d97706'} strokeWidth="2.5" />
                                </svg>
                              </div>
                            </div>
                          )}
                          {showSuccess && (
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                              <div className="flex justify-between text-xs font-bold tracking-wider items-center">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                  ОБЩАЯ УСПЕВАЕМОСТЬ
                                  {successDelta >= 0 ? <span className="text-emerald-600 text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+{successDelta}%</span> : <span className="text-amber-600 text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{successDelta}%</span>}
                                </span>
                                <span className={`font-black text-sm ${getStatusColor(teacher.averageSuccess).split(' ')[0]}`}>{teacher.averageSuccess}%</span>
                              </div>
                              <div className="w-full h-24 bg-slate-50 rounded-xl relative overflow-hidden border border-slate-100">
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <path d={`M 0 100 Q 25 ${100 - teacher.averageSuccess * 0.8}, 50 ${100 - teacher.averageSuccess}, T 100 ${100 - teacher.averageSuccess} L 100 100 Z`} fill="rgba(59, 130, 246, 0.1)" />
                                  <path d={`M 0 100 Q 25 ${100 - teacher.averageSuccess * 0.8}, 50 ${100 - teacher.averageSuccess}, T 100 ${100 - teacher.averageSuccess}`} fill="none" stroke={teacher.averageSuccess >= 50 ? '#3b82f6' : '#d97706'} strokeWidth="2.5" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === 'table' && (
                <div className="w-full rounded-3xl border-2 border-slate-100 shadow-sm overflow-visible">
                  <table className="w-full border-collapse bg-white text-left text-xs md:text-sm overflow-visible">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-100 text-slate-500 font-black"><th className="p-4">ФИО ПРЕПОДАВАТЕЛЯ</th><th className="p-4 text-center">ТЕСТЫ</th><th className="p-4 text-center">СДАЧИ</th>{showKz && <th className="p-4 text-center">СРЕДНЕЕ КЗ</th>}{showSuccess && <th className="p-4 text-center">УСПЕВАЕМОСТЬ</th>}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold overflow-visible">
                      {filteredAnalytics.map((teacher) => (
                        <tr key={teacher.teacherId} className="hover:bg-slate-50/50 transition-colors h-14 overflow-visible" onMouseEnter={() => setHoveredTeacherId(teacher.teacherId)} onMouseLeave={() => setHoveredTeacherId(null)}>
                          <td className="p-4 font-black text-slate-800 tracking-tight cursor-help hover:text-blue-600 transition-colors relative overflow-visible"><AnimatePresence>{hoveredTeacherId === teacher.teacherId && <RenderTooltip teacherId={teacher.teacherId} />}</AnimatePresence>{teacher.name.toUpperCase()}</td>
                          <td className="p-4 text-center text-slate-400">{teacher.testsConducted}</td>
                          <td className="p-4 text-center text-slate-400">{teacher.studentsTested}</td>
                          {showKz && <td className={`p-4 text-center font-black ${getStatusColor(teacher.averageKz).split(' ')[0]}`}>{teacher.averageKz}%</td>}
                          {showSuccess && <td className={`p-4 text-center font-black ${getStatusColor(teacher.averageSuccess).split(' ')[0]}`}>{teacher.averageSuccess}%</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* МОДАЛКА НАСТРОЙКИ СРЕЗА ПЕЧАТИ */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2.5rem] p-6 md:p-8 border-4 border-white shadow-2xl w-full max-w-2xl text-slate-700 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Printer className="text-blue-600"/> НАСТРОЙКА ПЕЧАТИ ОТЧЁТА</h3>
                <button onClick={() => setIsSpecialPrintModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-50"><X size={18}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
                  <div className="text-xs text-blue-600 block tracking-wider font-black">КОГО ВКЛЮЧИТЬ В ОТЧЁТ:</div>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="radio" checked={printTarget === 'all'} onChange={() => setPrintTarget('all')} className="w-4 h-4 text-blue-600" />
                      <span>ВСЕХ ПРЕПОДАВАТЕЛЕЙ ИЗ СРЕЗА ({filteredAnalytics.length})</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="radio" checked={printTarget === 'selected'} onChange={() => setPrintTarget('selected')} className="w-4 h-4 text-blue-600" />
                      <span>ВЫБОРОЧНЫЙ СПИСОК КАДРОВ</span>
                    </label>
                  </div>

                  {printTarget === 'selected' && (
                    <div className="pt-2 border-t border-slate-200 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {filteredAnalytics.map(t => (
                        <label key={t.teacherId} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 cursor-pointer">
                          <input type="checkbox" checked={selectedTeachersForPrint.includes(t.teacherId)} onChange={() => toggleTeacherPrintSelection(t.teacherId)} className="rounded text-blue-600" />
                          <span>{t.name.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
                  <div className="text-xs text-blue-600 block tracking-wider font-black">ЧТО ВЫВЕСТИ НА БУМАГУ:</div>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-3 cursor-pointer select-none"><input type="checkbox" checked={printIncludeKpi} onChange={(e) => setPrintIncludeKpi(e.target.checked)} className="rounded text-blue-600 w-4 h-4" /><span>ГЛОБАЛЬНЫЕ СВОДЫ KPI ТТЖТ</span></label>
                    <label className="flex items-center gap-3 cursor-pointer select-none"><input type="checkbox" checked={printIncludeCharts} onChange={(e) => setPrintIncludeCharts(e.target.checked)} className="rounded text-blue-600 w-4 h-4" /><span>ПОДРОБНОЕ ДОСЬЕ ТЕСТОВ СРЕЗА</span></label>
                    <label className="flex items-center gap-3 cursor-pointer select-none"><input type="checkbox" checked={printIncludeTable} onChange={(e) => setPrintIncludeTable(e.target.checked)} className="rounded text-blue-600 w-4 h-4" /><span>СВОДНУЮ ТАБЛИЦУ</span></label>
                  </div>
                </div>
              </div>

              <button onClick={handleExecutePrint} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm tracking-wide shadow-xl transition-all flex items-center justify-center gap-2"><Printer size={18}/> СФОРМИРОВАТЬ ПЕЧАТНУЮ СТРАНИЦУ</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};