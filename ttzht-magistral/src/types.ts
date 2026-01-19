export interface Subject {
  id: string;
  title: string;
  icon: string;
  count: number;
}

export interface StudentProgress {
  id: string;
  name: string;
  progress: number; // 0-100%
  status: 'online' | 'offline' | 'quit';
  needsApproval: boolean;
}