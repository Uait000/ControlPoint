/**
 * Типы заданий для платформы "Магистраль":
 * choice - выбор одного верного варианта из списка
 * matching - сопоставление пар (например, устройство — его роль)
 * classification - распределение элементов по категориям (например, подходы к измерению)
 */
export type QuestionType = 'choice' | 'matching' | 'classification';

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  instruction?: string; // Подсказка (например: "Выберите все верные утверждения")
  options?: string[]; // Варианты для типа 'choice'
  categories?: string[]; // Заголовки колонок для 'classification'
  items?: { id: string; text: string }[]; // Элементы для распределения
  pairs?: { id: string; left: string; right: string }[]; // Для сопоставления
  correctAnswer: any; // Хранит индекс, карту распределения или массив пар
}

export interface Lecture {
  id: string;
  title: string;
  fileName: string;
}

export interface SubSection {
  id: string;
  title: string;
  time: string; 
  questionsCount: string; 
  status: 'active' | 'locked';
  lectures: Lecture[];
  questions?: Question[];
}

export interface Section {
  id: string;
  title: string;
  subSections: SubSection[];
}

export interface Subject {
  id: string;
  title: string;
  iconName: string; 
  color: string;
  sections: Section[];
  isHidden?: boolean; 
}