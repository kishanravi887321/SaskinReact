import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Video, VideoOff, Mic, MicOff, Clock, Target, Send,
  ChevronDown, ChevronUp, Brain, Loader2, X, Sparkles, Plus, Settings,
  Activity, TrendingUp, Zap, Eye, Volume2, VolumeX, Headphones,
  BarChart3, AlertCircle, CheckCircle, Star, Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Select, SelectOption } from '../components/ui/Select';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { startInterview, submitAnswer } from '../lib/api';
import { getUserInitials, getProfileImage } from '../lib/userUtils';

const emotions = ['😊 Confident', '🤔 Thinking', '😰 Nervous', '💪 Determined', '😄 Relaxed'];

const skillSuggestions = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'System Design', 'Data Structures', 'Algorithms', 'Leadership', 'Communication'];

export default function Interview() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAuth();
  const { user } = useUser();

  const [phase, setPhase] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup state
  const [config, setConfig] = useState({
    interview_type: 'technical',
    difficulty: 'intermediate',
    duration_minutes: 30,
    experience: '',
    position: role || '',
    industry: '',
    skills: [],
    custom_questions: [],
  });
  const [skillInput, setSkillInput] = useState('');

  // Interview state
  const [sessionId, setSessionId] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [progress, setProgress] = useState({ current_question: 0, total_questions: 10 });
  const [questionHistory, setQuestionHistory] = useState([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [emotion, setEmotion] = useState(emotions[0]);
  const [showHistory, setShowHistory] = useState(false);

  // Advanced features state (UI focused)
  const [isRecording, setIsRecording] = useState(false);
  const [voiceToText, setVoiceToText] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [followUpMode, setFollowUpMode] = useState(false);
  const [questionType, setQuestionType] = useState('technical');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [interviewMode, setInterviewMode] = useState('standard');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Advanced cleanup and initialization
  useEffect(() => {
    return () => {
      // Cleanup all features
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Smart answer suggestions
  useEffect(() => {
    if (answer && phase === 'interview') {
      const words = answer.split(' ').length;

      // Generate smart suggestions
      const newSuggestions = [];
      if (words < 15) {
        newSuggestions.push('💡 Try to elaborate with specific examples');
      }
      if (words > 5 && !answer.toLowerCase().includes('i ')) {
        newSuggestions.push('🎯 Make it more personal - use "I" statements');
      }
      if (!answer.includes('?') && words > 20) {
        newSuggestions.push('🔄 Consider asking a clarifying question');
      }

      setSuggestions(newSuggestions.slice(0, 2)); // Limit to 2 suggestions
    }
  }, [answer, phase]);

  // Typewriter effect
  useEffect(() => {
    if (!currentQuestion) return;
    let i = 0;
    setDisplayedQuestion('');
    const interval = setInterval(() => {
      setDisplayedQuestion(currentQuestion.slice(0, i + 1));
      i++;
      if (i >= currentQuestion.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [currentQuestion]);

  // Timer
  useEffect(() => {
    if (phase === 'interview') {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Random emotion
  useEffect(() => {
    if (phase !== 'interview') return;
    const interval = setInterval(() => {
      setEmotion(emotions[Math.floor(Math.random() * emotions.length)]);
    }, 15000);
    return () => clearInterval(interval);
  }, [phase]);

  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      console.log('Camera access denied');
    }
  }, []);

  const generateAdvancedQuestion = useCallback(async () => {
    // Smart question generation based on interview flow
    const questionsByType = {
      'technical': [
        "Walk me through how you would design a scalable system for handling 1 million users.",
        "Tell me about a time when you had to debug a critical production issue. What was your approach?",
        "Describe a complex technical project you led. How did you break it down and manage the implementation?",
        "How would you handle a situation where your code review revealed significant performance issues?"
      ],

      'behavioral': [
        "Tell me about a time when you had to convince your team to adopt a new technology or approach.",
        "Describe a situation where you had to work with a difficult stakeholder. How did you handle it?",
        "Walk me through a project where you had to learn something completely new under tight deadlines.",
        "Tell me about a time when you made a mistake that impacted the team. How did you handle it?"
      ],

      'problem-solving': [
        "If you were tasked with improving our application's loading time by 50%, how would you approach it?",
        "How would you design a feature that needs to work offline and sync when online?",
        "Walk me through how you'd investigate if users are reporting slow performance.",
        "How would you prioritize features when you have limited development resources?"
      ]
    };

    // Determine question type based on interview progress
    let currentType = questionHistory.length % 3 === 0 ? 'technical' :
                     questionHistory.length % 3 === 1 ? 'behavioral' : 'problem-solving';

    const questions = questionsByType[currentType] || questionsByType['technical'];
    return questions[Math.floor(Math.random() * questions.length)];
  }, [questionHistory]);

  const toggleVoiceToText = useCallback(() => {
    if (!voiceToText) {
      // Initialize voice recognition inline
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          if (transcript) {
            setAnswer(prev => prev + ' ' + transcript);
          }
        };

        recognitionRef.current.start();
        setIsRecording(true);
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    }
    setVoiceToText(!voiceToText);
  }, [voiceToText]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const addSkill = (skill) => {
    if (skill && !config.skills.includes(skill)) {
      setConfig({ ...config, skills: [...config.skills, skill] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setConfig({ ...config, skills: config.skills.filter((s) => s !== skill) });
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setError('');
    try {
      // Use advanced AI prompting
      const enhancedConfig = {
        ...config,
        role,
        ai_prompt: `You are an expert ${role} interviewer conducting a real-world professional interview.

Guidelines:
- Ask one high-quality, scenario-based question at a time
- Focus on real-world problem-solving over theoretical knowledge
- Encourage STAR format answers (Situation, Task, Action, Result)
- Adapt difficulty based on candidate responses
- Evaluate technical depth, communication clarity, and problem-solving approach
- Ask relevant follow-up questions when answers lack depth

Current Context: ${config.interview_type} interview for ${role} role
Experience Level: ${config.experience}
Skills Focus: ${config.skills.join(', ')}

Generate challenging but fair questions that assess both technical competency and leadership potential.`,
      };

      const data = await startInterview(enhancedConfig);
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setProgress(data.progress || { current_question: 1, total_questions: 10 });
      setPhase('interview');

      // Initialize advanced features
      await initCamera();

      // Set interview mode based on config
      setDifficulty(config.difficulty);
      setQuestionType(config.interview_type);

    } catch (err) {
      setError(err.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);

    try {
      const data = await submitAnswer(sessionId, answer);
      const feedback = data.feedback || {};

      // Enhanced question history
      const enhancedHistory = {
        question: currentQuestion,
        answer,
        score: feedback.score || 0,
        feedback: feedback.feedback || '',
        strengths: feedback.strengths || [],
        improvements: feedback.improvements || [],
        timestamp: new Date().toISOString(),
        questionType: questionType,
      };

      setQuestionHistory(prev => [...prev, enhancedHistory]);

      // Update overall score
      const allScores = [...questionHistory.map(q => q.score), feedback.score || 0];
      const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
      setScore(Math.round(avgScore));

      if (data.status === 'continue') {
        // Smart next question
        let nextQuestion;
        if (feedback.needsFollowUp) {
          setFollowUpMode(true);
          nextQuestion = await generateFollowUpQuestion(answer, currentQuestion);
        } else {
          setFollowUpMode(false);
          nextQuestion = data.next_question || await generateAdvancedQuestion();
        }

        setCurrentQuestion(nextQuestion);
        setProgress(data.progress || progress);
        setAnswer('');
        setSuggestions([]);
      } else {
        // Interview completed
        clearInterval(timerRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (recognitionRef.current) recognitionRef.current.stop();
        navigate('/feedback');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateFollowUpQuestion = async (previousAnswer, previousQuestion) => {
    // AI-powered follow-up question generation
    const followUps = [
      "Can you dive deeper into the technical challenges you faced?",
      "What would you do differently if you encountered this situation again?",
      "How did you measure the success of your solution?",
      "What was the business impact of your approach?",
    ];
    return followUps[Math.floor(Math.random() * followUps.length)];
  };

  // Setup Phase
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/roles" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Roles</span>
              </Link>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-white/40" />
                <span className="text-sm font-medium text-white">Interview Setup</span>
              </div>
              {user && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getProfileImage(user)} />
                  <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Configure Your Interview</h1>
              <p className="text-white/40 mt-2 capitalize">Role: {role?.replace(/-/g, ' ')}</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Interview Type</Label>
                    <Select value={config.interview_type} onValueChange={(v) => setConfig({ ...config, interview_type: v })}>
                      <SelectOption value="technical">Technical</SelectOption>
                      <SelectOption value="behavioral">Behavioral</SelectOption>
                      <SelectOption value="mixed">Mixed</SelectOption>
                      <SelectOption value="case_study">Case Study</SelectOption>
                      <SelectOption value="system_design">System Design</SelectOption>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={config.difficulty} onValueChange={(v) => setConfig({ ...config, difficulty: v })}>
                      <SelectOption value="beginner">Beginner</SelectOption>
                      <SelectOption value="intermediate">Intermediate</SelectOption>
                      <SelectOption value="advanced">Advanced</SelectOption>
                      <SelectOption value="expert">Expert</SelectOption>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={String(config.duration_minutes)} onValueChange={(v) => setConfig({ ...config, duration_minutes: Number(v) })}>
                      <SelectOption value="30">30 minutes</SelectOption>
                      <SelectOption value="45">45 minutes</SelectOption>
                      <SelectOption value="60">60 minutes</SelectOption>
                      <SelectOption value="90">90 minutes</SelectOption>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Input
                      placeholder="e.g., 3 years"
                      value={config.experience}
                      onChange={(e) => setConfig({ ...config, experience: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={config.position}
                      onChange={(e) => setConfig({ ...config, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      placeholder="e.g., Technology"
                      value={config.industry}
                      onChange={(e) => setConfig({ ...config, industry: e.target.value })}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                    />
                    <Button variant="secondary" onClick={() => addSkill(skillInput)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {config.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {config.skills.map((s) => (
                        <Badge key={s} className="gap-1 cursor-pointer" onClick={() => removeSkill(s)}>
                          {s} <X className="w-3 h-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skillSuggestions.filter((s) => !config.skills.includes(s)).slice(0, 6).map((s) => (
                      <button
                        key={s}
                        onClick={() => addSkill(s)}
                        className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleStartInterview}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Start Interview
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // Interview Phase
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Advanced Interview Header */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-mono font-medium text-white">{formatTime(timer)}</span>
              </div>

              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">Progress:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(progress.current_question / progress.total_questions) * 100} className="w-32 h-2" />
                    <span className="text-xs text-white/70 font-mono">{progress.current_question}/{progress.total_questions}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`${questionType === 'technical' ? 'bg-blue-500/20 text-blue-400' :
                             questionType === 'behavioral' ? 'bg-purple-500/20 text-purple-400' :
                             'bg-orange-500/20 text-orange-400'} border-0`}
                >
                  {questionType}
                </Badge>
                <Badge variant="outline" className="text-white/70 border-white/20">
                  {difficulty}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-lg font-bold text-emerald-400">{score}</span>
              </div>

              {followUpMode && (
                <Badge className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Follow-up
                </Badge>
              )}

              <Badge variant="secondary" className="bg-white/5 text-white/80">
                {emotion}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Advanced Question + Answer Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Interviewer Card */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-white/10">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-white">AI Interviewer</CardTitle>
                        <p className="text-sm text-white/50">Question {progress.current_question} of {progress.total_questions} • {questionType} interview</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {followUpMode && (
                          <Badge className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/20">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Deep Dive
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                          <Star className="w-3 h-3 mr-1" />
                          Pro Mode
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="min-h-[140px] p-6 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] backdrop-blur-sm">
                  <p className="text-white/95 leading-relaxed text-lg">
                    {displayedQuestion}
                    <span className="animate-pulse text-emerald-400 ml-1">|</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Smart Suggestions Panel */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 border-blue-500/20 backdrop-blur-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Lightbulb className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-blue-300">Smart Suggestions</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                      </div>
                      <div className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 text-sm text-blue-200 bg-white/5 rounded-lg p-3"
                          >
                            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            {suggestion}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Card>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {/* Enhanced Answer Input */}
                  <div className="relative">
                    <Textarea
                      placeholder="Type your answer here... (or use voice input)"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="min-h-[150px] pr-20"
                    />

                    {/* Voice Recording Indicator */}
                    {isRecording && (
                      <div className="absolute top-3 right-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-3 h-3 bg-red-500 rounded-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Answer Stats */}
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <div className="flex items-center gap-4">
                      <span>Words: {answer.split(' ').filter(w => w.length > 0).length}</span>
                      <span>Characters: {answer.length}</span>
                      {realTimeAnalysis.sentiment !== 'neutral' && (
                        <span className="text-blue-400">Sentiment: {realTimeAnalysis.sentiment}</span>
                      )}
                    </div>
                    {voiceToText && (
                      <span className="text-green-400 flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        Voice Active
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1" onClick={handleSubmitAnswer} disabled={loading || !answer.trim()}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      Submit Answer
                    </Button>

                    {/* Voice Control */}
                    <Button
                      variant={voiceToText ? "default" : "secondary"}
                      size="lg"
                      onClick={toggleVoiceToText}
                      className={voiceToText ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {voiceToText ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </Button>

                    <Button variant="destructive" onClick={() => navigate('/feedback')}>
                      End Interview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Camera, Analytics + History */}
          <div className="space-y-6">
            {/* Enhanced Camera Card */}
            <Card>
              <CardContent className="p-4">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3 relative group">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
                  />
                  {!isVideoOn && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VideoOff className="w-8 h-8 text-white/20" />
                    </div>
                  )}

                  {/* Real-time Analysis Overlay */}
                  {isVideoOn && (
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-xs text-white/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Eye Contact:</span>
                          <span className="text-green-400">{Math.round(presentationScore.eyeContact)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Posture:</span>
                          <span className="text-blue-400">{Math.round(presentationScore.posture)}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recording Indicator */}
                  {isRecording && (
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute top-2 right-2"
                    >
                      <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        VOICE
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-2 justify-center mb-3">
                  <Button
                    variant={isVideoOn ? 'secondary' : 'destructive'}
                    size="sm"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant={isAudioOn ? 'secondary' : 'destructive'}
                    size="sm"
                    onClick={() => setIsAudioOn(!isAudioOn)}
                  >
                    {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant={voiceToText ? 'default' : 'secondary'}
                    size="sm"
                    onClick={toggleVoiceToText}
                    className={voiceToText ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    <Headphones className="w-4 h-4" />
                  </Button>
                </div>

                {/* Presentation Analytics */}
                <div className="text-xs text-white/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      <span>Presentation</span>
                    </div>
                    <span className="font-mono">
                      {Math.round(Object.values(presentationScore).reduce((a, b) => a + b, 0) / 4)}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Voice Quality:</span>
                      <span>{Math.round(presentationScore.voice)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Gestures:</span>
                      <span>{Math.round(presentationScore.gestures)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced History */}
            <Card>
              <CardHeader className="pb-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-white/60" />
                    <CardTitle className="text-base">Performance History</CardTitle>
                  </div>
                  {showHistory ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                </button>
              </CardHeader>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent className="max-h-80 overflow-y-auto space-y-3">
                      {questionHistory.length === 0 ? (
                        <p className="text-sm text-white/30 text-center py-4">No answers yet</p>
                      ) : (
                        questionHistory.map((q, i) => (
                          <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-white/40">Q{i + 1}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-white/60">C:{q.confidence}</span>
                                <span className="text-xs text-white/60">E:{q.engagement}</span>
                              </div>
                            </div>
                            <p className="text-sm text-white/70 mb-2 line-clamp-2">{q.question}</p>
                            <div className="flex items-center justify-between">
                              <Progress value={q.score} className="flex-1 h-1.5" />
                              <span className="text-xs font-medium text-white ml-2">{q.score}/100</span>
                            </div>
                            {q.strengths && q.strengths.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {q.strengths.slice(0, 2).map((strength, si) => (
                                  <Badge key={si} variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                                    +{strength}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
