/**
 * Типы аккаунтов, соответствующие бэкенду на Rust
 */
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

export type QuestionType = 'choice' | 'matching' | 'classification';

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: string[];
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