const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL1 = import.meta.env.VITE_API_URL1 || 'http://localhost:8005';

export const API_ENDPOINTS = {
  interview: {
    start: '/api/central/interview/start/',
    answer: '/api/central/interview/answer/',
    end: '/api/central/interview/end/',
    // Enhanced Audio Pipeline Endpoints (NEW - from UI.txt)
    enhancedStart: '/api/central/enhanced-interview/start/',
    enhancedSubmit: '/api/central/enhanced-interview/submit/',
    enhancedAudio: '/api/central/enhanced-interview/audio/',
    enhancedMicrophone: '/api/central/enhanced-interview/microphone/',
    enhancedStatus: '/api/central/enhanced-interview/status/',
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

export async function submitAnswer(sessionId, answer, analysisData = null) {
  const payload = {
    session_id: sessionId,
    answer,
  };

  // Include additional data if provided (optional for advanced features)
  if (analysisData && Object.keys(analysisData).length > 0) {
    payload.metadata = analysisData;
  }

  return apiRequest(API_ENDPOINTS.interview.answer, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUserProfile() {
  return apiRequest(API_ENDPOINTS.user.profile);
}

// ===== ENHANCED AUDIO PIPELINE FUNCTIONS (from UI.txt) =====

/**
 * Start enhanced interview with role-based setup (VTT → Gemini → TTV Pipeline)
 * @param {string} role - Role from URL parameter (e.g., 'python-developer')
 * @param {string} experience - Experience level (Junior, Mid-level, Senior)
 * @param {string} industry - Industry (Technology, Healthcare, etc.)
 * @param {boolean} audioEnabled - Enable audio pipeline
 * @returns {Promise<Object>} Enhanced interview session with audio URLs
 */
export async function startEnhancedInterview(role, experience, industry, audioEnabled = true) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.interview.enhancedStart}${role}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      experience,
      industry,
      audio_enabled: audioEnabled,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Enhanced interview start failed' }));
    throw new Error(error.detail || error.message || 'Enhanced interview start failed');
  }

  return response.json();
}

/**
 * Submit audio response through VTT → Gemini AI → TTV pipeline
 * @param {string} sessionId - Interview session ID
 * @param {Blob} audioBlob - Recorded audio blob
 * @returns {Promise<Object>} Pipeline response with transcription, feedback, and audio URLs
 */
export async function submitAudioResponsePipeline(sessionId, audioBlob) {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('audio', audioBlob, 'response.wav');

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.interview.enhancedSubmit}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Audio pipeline processing failed' }));
    throw new Error(error.detail || error.message || 'Audio pipeline processing failed');
  }

  return response.json();
}

/**
 * Submit text response (fallback mode)
 * @param {string} sessionId - Interview session ID
 * @param {string} textAnswer - Text answer
 * @returns {Promise<Object>} Response with feedback
 */
export async function submitTextResponsePipeline(sessionId, textAnswer) {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('answer', textAnswer);

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.interview.enhancedSubmit}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Text processing failed' }));
    throw new Error(error.detail || error.message || 'Text processing failed');
  }

  return response.json();
}

/**
 * Get audio URL for playback
 * @param {string} sessionId - Interview session ID
 * @param {string} type - Audio type ('question_1', 'feedback', 'summary', etc.)
 * @returns {string} Audio URL
 */
export function getAudioUrl(sessionId, type) {
  return `${API_BASE_URL}${API_ENDPOINTS.interview.enhancedAudio}${sessionId}/${type}/`;
}

/**
 * Live microphone recording (alternative approach)
 * @param {string} sessionId - Interview session ID
 * @param {number} duration - Recording duration in seconds
 * @returns {Promise<Object>} Pipeline response
 */
export async function useLiveMicrophone(sessionId, duration = 10) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.interview.enhancedMicrophone}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      session_id: sessionId,
      duration,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Live microphone failed' }));
    throw new Error(error.detail || error.message || 'Live microphone failed');
  }

  return response.json();
}

/**
 * Get enhanced interview status
 * @param {string} sessionId - Interview session ID
 * @returns {Promise<Object>} Session status and progress
 */
export async function getEnhancedInterviewStatus(sessionId) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.interview.enhancedStatus}?session_id=${sessionId}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Status check failed' }));
    throw new Error(error.detail || error.message || 'Status check failed');
  }

  return response.json();
}

export { API_BASE_URL, API_BASE_URL1 };
