import type { TeacherQuestion } from './types';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const api = {
  async get(url: string) {
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async post(url: string, body: any) {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async patch(url: string, body: any) {
    return fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
  },

  /**
   * Получает список вопросов теста с правильными ответами для проверки преподавателем[cite: 1, 2]
   */
  async getQuestionsForReview(testId: number): Promise<TeacherQuestion[]> {
    const res = await fetch(`/tests/${testId}/questions/review`, { 
      headers: getHeaders() 
    });
    return res.json();
  },

  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/courses/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });
    return res.json();
  }
};