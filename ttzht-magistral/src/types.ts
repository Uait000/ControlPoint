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