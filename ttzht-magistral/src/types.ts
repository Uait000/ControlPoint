export type AccountType = 'Student' | 'Teacher' | 'Admin';

export interface Group {
    id: number;
    name: string;
    course: number;
    number: number;
    maxCourse: number; // Соответствует max_course в БД
}

export interface User {
    id: number;
    login: string;
    email: string;
    accountType: AccountType; // Соответствует account_type
    firstName?: string;        // Соответствует first_name
    secondName?: string;       // Соответствует second_name
    belongsTo?: number;        // Соответствует belongs_to (ID группы)
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ApiTest {
    id: number;
    docx: string;        
    docxName: string;      // ИСПРАВЛЕНО: было docx_name
    belongsTo: number;     // ИСПРАВЛЕНО: было belongs_to
    startsAt: number;      // ИСПРАВЛЕНО: было starts_at
    finished: number | null;
    questionLimit: number; // ИСПРАВЛЕНО: было question_limit
    assignedGroupId: number | null; // ИСПРАВЛЕНО: было assigned_group_id
    teacherId: number | null;       // ИСПРАВЛЕНО: было teacher_id
}

export type QuestionType = 'choice' | 'matching' | 'classification';

export interface Question {
    id: number;
    type: QuestionType;
    question: string;     
    options: string[];    
    complexity: number;
}

export interface TeacherQuestion {
    id: number;
    question: string;
    options: string[];
    correct: number;      
    complexity: number;
    modifiedBy?: string; // ИСПРАВЛЕНО: было modified_by
}

export interface Subject {
    id: string;
    title: string;
    iconName: string; // ИСПРАВЛЕНО: было icon_name
    color: string;
    sections: any[];
    isHidden?: boolean; // ИСПРАВЛЕНО: было is_hidden
}