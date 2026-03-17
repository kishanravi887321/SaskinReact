/**
 * Audio Pipeline Demo Utility
 *
 * This file provides demo functions for testing the audio pipeline
 * when the full backend is not available. It simulates the complete
 * Voice → VTT → Gemini AI → TTV → User flow.
 */

// Mock audio responses for different question types
const mockAudioResponses = {
  technical: [
    {
      feedback: "Your solution shows good understanding of system architecture. I'd like to dive deeper into scalability considerations.",
      strengths: ["System design thinking", "Clear explanation", "Practical approach"],
      improvements: ["Discuss caching strategies", "Address database scaling", "Consider load balancing"],
      score: 85,
      followUp: "How would you handle 10x traffic growth in this system?"
    },
    {
      feedback: "Excellent debugging approach! Your systematic methodology is impressive. Let's explore error handling next.",
      strengths: ["Systematic approach", "Tool knowledge", "Problem analysis"],
      improvements: ["Monitoring strategies", "Preventive measures", "Documentation"],
      score: 92,
      followUp: "What monitoring would you implement to catch this issue earlier?"
    }
  ],
  behavioral: [
    {
      feedback: "Great use of the STAR method! Your leadership during the crisis was commendable. I'd like to hear more about team dynamics.",
      strengths: ["Leadership skills", "Clear communication", "Result-oriented"],
      improvements: ["Team conflict resolution", "Stakeholder management", "Process improvement"],
      score: 88,
      followUp: "How did you handle any resistance from team members during this change?"
    }
  ]
};

// Mock transcription results
export const mockTranscription = (audioBlob) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sampleTranscriptions = [
        "In my previous role as a senior software engineer, I designed a microservices architecture that handled over 1 million requests per day. The main challenge was ensuring data consistency across multiple services, which I solved by implementing an event-driven architecture with CQRS pattern.",
        "I faced a critical production issue where our payment system was failing for 30% of transactions. I immediately implemented circuit breakers to prevent cascading failures, then traced the issue to a database connection pool exhaustion. I increased the pool size and implemented better connection management.",
        "When leading the team migration from monolith to microservices, I had to convince stakeholders who were resistant to change. I created a detailed migration plan with measurable milestones and risk mitigation strategies. The result was a 40% improvement in deployment frequency and 60% reduction in downtime."
      ];

      resolve({
        transcription: sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)],
        confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
        processingTime: 1200 + Math.random() * 800 // 1.2-2.0 seconds
      });
    }, 1500); // Simulate processing time
  });
};

// Mock AI feedback generation
export const mockAIFeedback = (transcription, questionType = 'technical') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = mockAudioResponses[questionType] || mockAudioResponses.technical;
      const response = responses[Math.floor(Math.random() * responses.length)];

      // Generate next question based on type
      const nextQuestions = {
        technical: [
          "Walk me through how you would design a real-time chat system for 100,000 concurrent users.",
          "Describe your approach to debugging a memory leak in a production system.",
          "How would you implement a distributed caching strategy for a global application?"
        ],
        behavioral: [
          "Tell me about a time when you had to deliver bad news to stakeholders.",
          "Describe a situation where you had to learn a new technology under pressure.",
          "Give me an example of how you handled conflicting priorities."
        ]
      };

      const questions = nextQuestions[questionType] || nextQuestions.technical;

      resolve({
        ...response,
        next_question: questions[Math.floor(Math.random() * questions.length)],
        status: 'continue',
        progress: {
          current_question: Math.floor(Math.random() * 5) + 1,
          total_questions: 10
        }
      });
    }, 2000); // Simulate AI processing time
  });
};

// Mock text-to-speech generation
export const mockTextToSpeech = (text) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, this would call a TTS service
      // For demo, we'll use Web Speech API or return a mock audio URL
      if ('speechSynthesis' in window) {
        resolve({
          audioUrl: null, // Will use Web Speech API
          duration: Math.ceil(text.length / 10), // Rough estimate: 10 chars per second
          format: 'speech-synthesis'
        });
      } else {
        resolve({
          audioUrl: `https://api.mock-tts.com/speak?text=${encodeURIComponent(text)}`,
          duration: Math.ceil(text.length / 10),
          format: 'mp3'
        });
      }
    }, 800);
  });
};

// Complete audio pipeline simulation
export const simulateAudioPipeline = async (audioBlob, questionType = 'technical') => {
  try {
    // Step 1: Voice to Text (VTT)
    const transcriptionResult = await mockTranscription(audioBlob);

    // Step 2: AI Processing (Gemini AI)
    const aiResult = await mockAIFeedback(transcriptionResult.transcription, questionType);

    // Step 3: Text to Voice (TTV) for feedback
    const feedbackAudio = await mockTextToSpeech(aiResult.feedback);

    // Step 4: Text to Voice (TTV) for next question
    const questionAudio = await mockTextToSpeech(aiResult.next_question);

    return {
      // Transcription results
      transcription: transcriptionResult.transcription,
      transcription_confidence: transcriptionResult.confidence,

      // AI feedback
      feedback: {
        feedback: aiResult.feedback,
        score: aiResult.score,
        strengths: aiResult.strengths,
        improvements: aiResult.improvements,
        needsFollowUp: Math.random() > 0.7 // 30% chance of follow-up
      },

      // Next question
      next_question: aiResult.next_question,
      status: aiResult.status,
      progress: aiResult.progress,

      // Audio URLs
      feedback_audio_url: feedbackAudio.audioUrl,
      question_audio_url: questionAudio.audioUrl,

      // Processing metadata
      processing_time: {
        vtt: transcriptionResult.processingTime,
        ai: 2000,
        ttv_feedback: 800,
        ttv_question: 800,
        total: transcriptionResult.processingTime + 2000 + 800 + 800
      }
    };
  } catch (error) {
    throw new Error(`Audio pipeline simulation failed: ${error.message}`);
  }
};

// Demo audio generation for questions
export const generateDemoQuestionAudio = (questionText) => {
  return mockTextToSpeech(questionText);
};

// Audio quality analysis simulation
export const analyzeAudioQuality = (audioBlob) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        duration: Math.random() * 60 + 30, // 30-90 seconds
        sampleRate: 44100,
        bitRate: 128,
        channels: 1,
        format: 'audio/wav',
        quality: Math.random() > 0.2 ? 'good' : 'fair', // 80% good quality
        noise_level: Math.random() * 0.1, // 0-10% noise
        volume_level: Math.random() * 0.3 + 0.7, // 70-100% volume
        speech_clarity: Math.random() * 0.2 + 0.8 // 80-100% clarity
      });
    }, 300);
  });
};

// Demo configuration for different interview types
export const demoConfigs = {
  sde: {
    role: 'Software Engineer',
    questionTypes: ['technical', 'system-design', 'behavioral'],
    difficulty: 'intermediate',
    estimatedDuration: 45, // minutes
    questionsCount: 8
  },
  pm: {
    role: 'Product Manager',
    questionTypes: ['behavioral', 'analytical', 'strategic'],
    difficulty: 'intermediate',
    estimatedDuration: 40,
    questionsCount: 7
  },
  analyst: {
    role: 'Data Analyst',
    questionTypes: ['technical', 'analytical', 'behavioral'],
    difficulty: 'intermediate',
    estimatedDuration: 35,
    questionsCount: 6
  }
};

// Error simulation for testing robustness
export const simulateError = (errorType = 'random') => {
  const errors = {
    transcription: new Error('Transcription service temporarily unavailable'),
    ai: new Error('AI service rate limit exceeded'),
    tts: new Error('Text-to-speech generation failed'),
    network: new Error('Network connection timeout'),
    audio: new Error('Audio format not supported')
  };

  if (errorType === 'random') {
    const errorKeys = Object.keys(errors);
    errorType = errorKeys[Math.floor(Math.random() * errorKeys.length)];
  }

  return Promise.reject(errors[errorType] || new Error('Unknown error occurred'));
};

export default {
  mockTranscription,
  mockAIFeedback,
  mockTextToSpeech,
  simulateAudioPipeline,
  generateDemoQuestionAudio,
  analyzeAudioQuality,
  demoConfigs,
  simulateError
};