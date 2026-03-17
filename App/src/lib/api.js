const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL1 = import.meta.env.VITE_API_URL1 || 'http://localhost:8005';

export const API_ENDPOINTS = {
  interview: {
    start: '/api/central/v1/interview/start/',
    answer: '/api/central/v1/interview/answer/',
    end: '/api/central/v1/interview/end/',
    // Audio Pipeline Endpoints
    submitAudio: '/api/interview/submit-audio/',
    session: '/api/interview/session/',
    cleanup: '/api/interview/session/{session_id}/cleanup/',
    generateAudio: '/api/interview/generate-audio/',
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

// ===== AUDIO PIPELINE FUNCTIONS =====

/**
 * Submit audio for processing through the VTT → Gemini AI → TTV pipeline
 * @param {string} sessionId - Interview session ID
 * @param {Blob} audioBlob - Recorded audio blob
 * @param {Object} metadata - Additional metadata (transcription, confidence, etc.)
 * @returns {Promise<Object>} Response with transcription, feedback, next question, and audio paths
 */
export async function submitAudioAnswer(sessionId, audioBlob, metadata = {}) {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('audio', audioBlob, 'response.wav');

  // Add metadata if provided
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.interview.submitAudio}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Audio upload failed' }));
    throw new Error(error.detail || error.message || 'Audio upload failed');
  }

  return response.json();
}

/**
 * Get interview session information
 * @param {string} sessionId - Interview session ID
 * @returns {Promise<Object>} Session info, progress, and status
 */
export async function getInterviewSession(sessionId) {
  return apiRequest(`${API_ENDPOINTS.interview.session}${sessionId}/`, {
    method: 'GET',
  });
}

/**
 * Cleanup interview session and temporary files
 * @param {string} sessionId - Interview session ID
 * @returns {Promise<Object>} Cleanup status
 */
export async function cleanupInterviewSession(sessionId) {
  return apiRequest(API_ENDPOINTS.interview.cleanup.replace('{session_id}', sessionId), {
    method: 'POST',
  });
}

/**
 * Generate audio from text using AI TTS
 * @param {string} text - Text to convert to speech
 * @param {Object} options - TTS options (voice, speed, pitch, etc.)
 * @returns {Promise<Object>} Response with audio URL and metadata
 */
export async function generateAudioFromText(text, options = {}) {
  const payload = {
    text,
    voice_settings: {
      speed: options.speed || 1.0,
      pitch: options.pitch || 1.0,
      voice_type: options.voiceType || 'professional',
      language: options.language || 'en-US',
    },
    output_format: options.format || 'mp3',
  };

  return apiRequest(API_ENDPOINTS.interview.generateAudio, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Enhanced interview start with audio support
 * @param {Object} config - Interview configuration including audio settings
 * @returns {Promise<Object>} Session info with initial question and optional audio URL
 */
export async function startAudioInterview(config) {
  const enhancedConfig = {
    ...config,
    audio_enabled: true,
    pipeline_settings: {
      generate_question_audio: config.generateQuestionAudio || true,
      generate_feedback_audio: config.generateFeedbackAudio || true,
      transcription_enabled: config.transcriptionEnabled || true,
      real_time_analysis: config.realTimeAnalysis || true,
    },
  };

  return apiRequest(API_ENDPOINTS.interview.start, {
    method: 'POST',
    body: JSON.stringify(enhancedConfig),
  });
}

/**
 * Enhanced text answer submission with audio pipeline integration
 * @param {string} sessionId - Interview session ID
 * @param {string} answer - Text answer
 * @param {Object} analysisData - Analysis data from UI
 * @param {Object} audioData - Optional audio-related data
 * @returns {Promise<Object>} Enhanced response with audio URLs
 */
export async function submitEnhancedAnswer(sessionId, answer, analysisData = null, audioData = null) {
  const payload = {
    session_id: sessionId,
    answer,
    submission_type: audioData ? 'audio' : 'text',
  };

  // Include analysis data if provided
  if (analysisData && Object.keys(analysisData).length > 0) {
    payload.analysis_metadata = analysisData;
  }

  // Include audio data if provided
  if (audioData) {
    payload.audio_metadata = {
      duration: audioData.duration,
      transcription: audioData.transcription,
      confidence: audioData.confidence,
      audio_quality: audioData.audioQuality || 'good',
    };
  }

  return apiRequest(API_ENDPOINTS.interview.answer, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Download audio file from URL
 * @param {string} audioUrl - URL of the audio file
 * @returns {Promise<Blob>} Audio blob for playback
 */
export async function downloadAudioFile(audioUrl) {
  const response = await fetch(audioUrl);

  if (!response.ok) {
    throw new Error('Failed to download audio file');
  }

  return response.blob();
}

/**
 * Upload and process audio with real-time feedback
 * @param {string} sessionId - Interview session ID
 * @param {Blob} audioBlob - Audio recording
 * @param {Object} realtimeData - Real-time analysis data
 * @returns {Promise<Object>} Processing results with feedback
 */
export async function processAudioWithFeedback(sessionId, audioBlob, realtimeData = {}) {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('audio', audioBlob, `interview_response_${Date.now()}.wav`);

  // Add real-time analysis data
  formData.append('realtime_analysis', JSON.stringify({
    recording_duration: realtimeData.duration || 0,
    audio_level_peaks: realtimeData.audioLevels || [],
    pause_analysis: realtimeData.pauseAnalysis || {},
    speech_pace: realtimeData.speechPace || 'normal',
    ...realtimeData,
  }));

  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.interview.submitAudio}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Audio processing failed' }));
    throw new Error(error.detail || error.message || 'Audio processing failed');
  }

  return response.json();
}

export { API_BASE_URL, API_BASE_URL1 };
