const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL1 = import.meta.env.VITE_API_URL1 || 'http://localhost:8005';

export const API_ENDPOINTS = {
  interview: {
    start: '/api/central/v1/interview/start/',
    answer: '/api/central/v1/interview/answer/',
    end: '/api/central/v1/interview/end/',
  },
  user: {
    profile: '/api/users/profile/',
    updateProfile: '/api/users/profile/update/',
    checkUsername: '/api/users/check-username/',
    profileFallback: '/api/user/profile',
  },
  auth: {
    login: '/api/users/login/',
    otpLogin: '/api/users/auth/login/',
    google: '/api/users/auth/google/',
    registerOtp: '/api/users/auth/register/',
    register: '/api/users/register/',
    forgotPasswordOtp: '/api/users/auth/forget-password/',
    forgotPassword: '/api/users/forget-password/',
    updatePassword: '/api/users/auth/update-password/',
  },
  chatbot: {
    get: '/chat/get/',
    feed: '/api/users/chat/feed/',
  },
};

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.detail || error.message || 'Request failed');
  }

  return response.json();
}

export async function chatbotGetRequest(data) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL1}${API_ENDPOINTS.chatbot.get}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Chatbot request failed');
  return response.json();
}

export async function startInterview(config) {
  return apiRequest(API_ENDPOINTS.interview.start, {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function submitAnswer(sessionId, answer) {
  return apiRequest(API_ENDPOINTS.interview.answer, {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, answer }),
  });
}

export async function getUserProfile() {
  return apiRequest(API_ENDPOINTS.user.profile);
}

export { API_BASE_URL, API_BASE_URL1 };
