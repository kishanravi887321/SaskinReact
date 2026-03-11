import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Video, VideoOff, Mic, MicOff, Clock, Target, Send,
  ChevronDown, ChevronUp, Brain, Loader2, X, Sparkles, Plus, Settings,
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
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

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
      const data = await startInterview({ role, ...config });
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setProgress(data.progress || { current_question: 1, total_questions: 10 });
      setPhase('interview');
      initCamera();
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
      setQuestionHistory([
        ...questionHistory,
        {
          question: currentQuestion,
          answer,
          score: feedback.score || 0,
          feedback: feedback.feedback || '',
          strengths: feedback.strengths || [],
          improvements: feedback.improvements || [],
        },
      ]);
      setScore(Math.round(
        [...questionHistory.map((q) => q.score), feedback.score || 0].reduce((a, b) => a + b, 0) /
        (questionHistory.length + 1)
      ));
      if (data.status === 'continue' && data.next_question) {
        setCurrentQuestion(data.next_question);
        setProgress(data.progress || progress);
        setAnswer('');
      } else {
        clearInterval(timerRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        navigate('/feedback');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-mono font-medium">{formatTime(timer)}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-white/40">Progress:</span>
                <Progress value={progress.current_question} max={progress.total_questions} className="w-28 h-2" />
                <span className="text-xs text-white/60">{progress.current_question}/{progress.total_questions}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">{score}</span>
              </div>
              <Badge variant="secondary">{emotion}</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question + Answer */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">AI Interviewer</CardTitle>
                    <p className="text-xs text-white/40">Question {progress.current_question} of {progress.total_questions}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="min-h-[100px] p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-white/90 leading-relaxed">{displayedQuestion}<span className="animate-pulse">|</span></p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <Textarea
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[150px] mb-4"
                />
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={handleSubmitAnswer} disabled={loading || !answer.trim()}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Submit Answer
                  </Button>
                  <Button variant="destructive" onClick={() => navigate('/feedback')}>
                    End Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Camera + History */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3 relative">
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
                </div>
                <div className="flex gap-2 justify-center">
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
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader className="pb-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center justify-between w-full"
                >
                  <CardTitle className="text-base">Q&A History</CardTitle>
                  {showHistory ? <ChevronUp className="w-4 h.4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                </button>
              </CardHeader>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent className="max-h-72 overflow-y-auto space-y-3">
                      {questionHistory.length === 0 ? (
                        <p className="text-sm text-white/30 text-center py-4">No answers yet</p>
                      ) : (
                        questionHistory.map((q, i) => (
                          <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-xs text-white/40 mb-1">Q{i + 1}</p>
                            <p className="text-sm text-white/70 mb-2 line-clamp-2">{q.question}</p>
                            <div className="flex items-center gap-2">
                              <Progress value={q.score} className="flex-1 h-1.5" />
                              <span className="text-xs font-medium text-white">{q.score}/100</span>
                            </div>
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
