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

            {/* Advanced Answer Input */}
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/20 border-white/10">
              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Enhanced Text Area */}
                  <div className="relative group">
                    <Textarea
                      placeholder="Share your experience here... (💬 Voice input available)"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="min-h-[180px] text-lg bg-white/[0.02] border-white/10 focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-200 resize-none pr-16"
                    />

                    {/* Voice Recording Visual Indicator */}
                    {isRecording && (
                      <div className="absolute top-4 right-4">
                        <motion.div
                          animate={{
                            scale: [1, 1.3, 1],
                            boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.7)", "0 0 0 10px rgba(239, 68, 68, 0)", "0 0 0 0 rgba(239, 68, 68, 0)"]
                          }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-4 h-4 bg-red-500 rounded-full"
                        />
                      </div>
                    )}

                    {/* Smart Input Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-2">
                          📝 <strong>{answer.split(' ').filter(w => w.length > 0).length}</strong> words
                        </span>
                        <span className="flex items-center gap-2">
                          ⏱️ <strong>{answer.length}</strong> chars
                        </span>
                        {answer.length > 200 && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            ✨ Great detail!
                          </span>
                        )}
                      </div>

                      {voiceToText && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="text-green-400 flex items-center gap-1 text-xs font-medium"
                        >
                          <Headphones className="w-3 h-3" />
                          Listening...
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Advanced Control Bar */}
                  <div className="flex items-center gap-3">
                    <Button
                      className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 transition-all duration-200"
                      onClick={handleSubmitAnswer}
                      disabled={loading || !answer.trim()}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Submit Answer
                        </>
                      )}
                    </Button>

                    {/* Voice Control Button */}
                    <Button
                      variant={voiceToText ? "default" : "secondary"}
                      size="lg"
                      onClick={toggleVoiceToText}
                      className={`h-12 px-4 ${voiceToText ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500" : "bg-white/10 hover:bg-white/20"} transition-all duration-200`}
                    >
                      {voiceToText ? (
                        <Volume2 className="w-5 h-5" />
                      ) : (
                        <VolumeX className="w-5 h-5" />
                      )}
                    </Button>

                    {/* End Interview Button */}
                    <Button
                      variant="destructive"
                      className="h-12 px-6 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500"
                      onClick={() => navigate('/feedback')}
                    >
                      End
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Sidebar: Camera + History */}
          <div className="space-y-6">
            {/* Enhanced Professional Camera */}
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Interview Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden mb-4 relative group border border-white/10">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
                  />

                  {!isVideoOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <VideoOff className="w-12 h-12 text-white/20 mb-2" />
                      <span className="text-sm text-white/40">Camera Off</span>
                    </div>
                  )}

                  {/* Professional Recording Indicator */}
                  {isRecording && (
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute top-3 right-3"
                    >
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        RECORDING
                      </div>
                    </motion.div>
                  )}

                  {/* Camera Status Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="text-xs text-white/90 text-center">
                      Professional Interview Mode {isVideoOn ? '• Camera Active' : '• Camera Off'}
                    </div>
                  </div>
                </div>

                {/* Advanced Controls */}
                <div className="flex gap-2 justify-center mb-4">
                  <Button
                    variant={isVideoOn ? 'default' : 'destructive'}
                    size="sm"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`${isVideoOn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} transition-all duration-200`}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant={isAudioOn ? 'default' : 'destructive'}
                    size="sm"
                    onClick={() => setIsAudioOn(!isAudioOn)}
                    className={`${isAudioOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} transition-all duration-200`}
                  >
                    {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant={voiceToText ? 'default' : 'secondary'}
                    size="sm"
                    onClick={toggleVoiceToText}
                    className={`${voiceToText ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500' : 'bg-white/10 hover:bg-white/20'} transition-all duration-200`}
                  >
                    <Headphones className="w-4 h-4" />
                  </Button>
                </div>

                {/* Interview Status */}
                <div className="text-xs text-white/60 space-y-2 bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Interview Mode:</span>
                    <span className="font-medium text-emerald-400">Professional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Status:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Performance History */}
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 border-white/10">
              <CardHeader className="pb-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-base font-semibold">Interview History</CardTitle>
                  </div>
                  <motion.div
                    animate={{ rotate: showHistory ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
                  </motion.div>
                </button>
              </CardHeader>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="max-h-80 overflow-y-auto space-y-3">
                      {questionHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                            <BarChart3 className="w-6 h-6 text-white/30" />
                          </div>
                          <p className="text-sm text-white/30">No questions answered yet</p>
                          <p className="text-xs text-white/20 mt-1">Your progress will appear here</p>
                        </div>
                      ) : (
                        questionHistory.map((q, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 rounded-xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/[0.06] hover:bg-white/[0.05] transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                  {i + 1}
                                </div>
                                <span className="text-xs text-white/50 font-medium">{q.questionType}</span>
                              </div>
                              <div className="text-lg font-bold text-emerald-400">{q.score}</div>
                            </div>
                            <p className="text-sm text-white/70 mb-3 line-clamp-2 leading-relaxed">{q.question}</p>
                            <div className="space-y-2">
                              <Progress value={q.score} className="h-2 bg-white/10" />
                              {q.strengths && q.strengths.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {q.strengths.slice(0, 2).map((strength, si) => (
                                    <Badge key={si} className="text-xs bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30">
                                      ✓ {strength}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
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
