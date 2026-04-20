export type AccountType = 'Student' | 'Teacher' | 'Admin';

export interface Group {
    id: number;
    name: string;
    course: number;
    number: number;
}

export interface User {
    id: number;
    login: string;
    account_type: AccountType;
    first_name?: string;
    second_name?: string;
    belongs_to?: number; 
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ApiTest {
    id: number;
    docx: string;        
    docx_name: string;   
    belongs_to: number;  
    starts_at: number;   
    finished: number | null;
    question_limit: number;
    assigned_group_id: number | null;
}

export type QuestionType = 'choice' | 'matching' | 'classification';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;     
  options: string[];    
  complexity: number;
}


export interface Subject {
  id: string;
  title: string;
  iconName: string; 
  color: string;
  sections: any[];
  isHidden?: boolean; 
}