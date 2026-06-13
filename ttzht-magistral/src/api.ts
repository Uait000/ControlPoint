import type { TeacherQuestion } from './types';

// ПРЯМОЙ ВЫЗОВ БЭКЕНДА: Игнорируем капризы Nginx и шлем запросы сразу в порт 8000
export const API_BASE_URL = "http://127.0.0.1:8000"; 

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// Хелпер теперь гарантирует склейку базового URL с эндпоинтом, проверяя ведущий слэш
const formatUrl = (url: string) => {
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanUrl}`;
};

export const api = {
  API_BASE_URL,

  async get(url: string) {
    const res = await fetch(formatUrl(url), { headers: getHeaders() });
    return res.json();
  },

  async post(url: string, body: any) {
    const res = await fetch(formatUrl(url), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async patch(url: string, body: any) {
    return fetch(formatUrl(url), {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
  },

  /**
   * Получает список вопросов теста с правильными ответами для проверки преподавателем
   */
  async getQuestionsForReview(testId: number): Promise<TeacherQuestion[]> {
    const res = await fetch(formatUrl(`/tests/${testId}/questions/review`), { 
      headers: getHeaders() 
    });
    return res.json();
  },

  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(formatUrl('/courses/upload'), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });
    return res.json();
  }
};