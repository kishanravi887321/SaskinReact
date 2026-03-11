import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Star, TrendingUp, Target, CheckCircle,
  AlertCircle, Sparkles, Download, Share2, BarChart3, Clock, Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { useAuth } from '../hooks/useAuth';

const mockFeedback = {
  overall_score: 78,
  total_questions: 8,
  duration: '32:15',
  strengths: ['Clear communication', 'Strong technical knowledge', 'Good problem-solving approach', 'Confident delivery'],
  improvements: ['Could provide more specific examples', 'Time management on complex questions', 'Add more depth to system design answers'],
  questions: [
    { id: 1, question: 'Explain the concept of closures in JavaScript.', answer: 'A closure is a function that has access to variables from its outer scope...', score: 92, feedback: 'Excellent explanation with clear examples.', strengths: ['Clear definition', 'Practical examples'], improvements: ['Could mention memory implications'] },
    { id: 2, question: 'How would you design a URL shortening service?', answer: 'I would start with a hash function to generate short codes...', score: 75, feedback: 'Good high-level design, needs more detail on scalability.', strengths: ['Good architecture understanding'], improvements: ['Discuss caching strategy', 'Address scalability'] },
    { id: 3, question: 'Describe a challenging project you worked on.', answer: 'In my previous role, I led the migration of a monolithic app...', score: 88, feedback: 'Great STAR method usage with quantified results.', strengths: ['Structured response', 'Quantified impact'], improvements: ['More detail on team dynamics'] },
    { id: 4, question: 'What is the difference between SQL and NoSQL databases?', answer: 'SQL databases are relational and use structured query language...', score: 70, feedback: 'Covers the basics but needs real-world trade-off analysis.', strengths: ['Correct fundamentals'], improvements: ['Use-case based comparison', 'Discuss CAP theorem'] },
    { id: 5, question: 'How do you handle conflicts in a team?', answer: 'I believe in open communication and active listening...', score: 65, feedback: 'Good principles but lacks a concrete example.', strengths: ['Good communication values'], improvements: ['Provide a specific example', 'Discuss resolution outcome'] },
    { id: 6, question: 'Explain event-driven architecture.', answer: 'Event-driven architecture uses events to trigger communication...', score: 82, feedback: 'Solid understanding demonstrated.', strengths: ['Good technical depth', 'Clear flow explanation'], improvements: ['Mention error handling in event systems'] },
    { id: 7, question: 'What is your approach to debugging?', answer: 'I follow a systematic approach starting with reproducing the issue...', score: 80, feedback: 'Good systematic methodology.', strengths: ['Methodical approach', 'Tool familiarity'], improvements: ['Discuss logging strategies'] },
    { id: 8, question: 'How would you optimize a slow API endpoint?', answer: 'First, I would profile the endpoint to identify bottlenecks...', score: 72, feedback: 'Decent approach, needs more specific optimization techniques.', strengths: ['Profiling-first mindset'], improvements: ['Discuss indexing', 'Mention caching layers'] },
  ],
};

const getScoreColor = (score) => {
  if (score >= 85) return 'text-emerald-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
};

const getScoreBg = (score) => {
  if (score >= 85) return 'from-emerald-500/20 to-emerald-500/5';
  if (score >= 70) return 'from-yellow-500/20 to-yellow-500/5';
  return 'from-red-500/20 to-red-500/5';
};

export default function Feedback() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [displayedFeedback, setDisplayedFeedback] = useState('');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // Typewriter for feedback
  useEffect(() => {
    if (!selectedQuestion) return;
    const fb = selectedQuestion.feedback;
    let i = 0;
    setDisplayedFeedback('');
    const interval = setInterval(() => {
      setDisplayedFeedback(fb.slice(0, i + 1));
      i++;
      if (i >= fb.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [selectedQuestion]);

  const data = mockFeedback;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </Link>
            <h1 className="text-sm font-medium text-white">Interview Feedback</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm"><Share2 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid sm:grid-cols-4 gap-4">
            <Card className="sm:col-span-1">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                  <span className={`text-4xl font-bold ${getScoreColor(data.overall_score)}`}>{data.overall_score}</span>
                </div>
                <p className="text-sm text-white/60">Overall Score</p>
                <Badge className="mt-2">{data.overall_score >= 80 ? 'Excellent' : data.overall_score >= 60 ? 'Good' : 'Needs Improvement'}</Badge>
              </CardContent>
            </Card>
            {[
              { label: 'Questions', value: data.total_questions, icon: BarChart3, color: 'text-blue-400' },
              { label: 'Duration', value: data.duration, icon: Clock, color: 'text-purple-400' },
              { label: 'Avg Speed', value: '4.0 min/Q', icon: Zap, color: 'text-yellow-400' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Question Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Performance Timeline</h2>
            {data.questions.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:border-white/10 ${selectedQuestion?.id === q.id ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : ''}`}
                  onClick={() => setSelectedQuestion(q)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 bg-gradient-to-br ${getScoreBg(q.score)} flex items-center justify-center`}>
                        <span className={`text-sm font-bold ${getScoreColor(q.score)}`}>{q.score}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 mb-2 line-clamp-1">{q.question}</p>
                        <div className="flex items-center gap-3">
                          <Progress value={q.score} className="flex-1 h-1.5" />
                          <span className="text-xs text-white/40">Q{idx + 1}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Detail Sidebar */}
          <div className="space-y-6">
            {/* Strengths & Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white/70">{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-yellow-400" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.improvements.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white/70">{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected question detail */}
            {selectedQuestion && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-emerald-500/20">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      AI Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-white/70 leading-relaxed">{displayedFeedback}<span className="animate-pulse">|</span></p>

                    <div>
                      <p className="text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Your Answer</p>
                      <p className="text-sm text-white/50 bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">{selectedQuestion.answer}</p>
                    </div>

                    {selectedQuestion.strengths.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-emerald-400/80 mb-1">Strengths</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedQuestion.strengths.map((s, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedQuestion.improvements.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-yellow-400/80 mb-1">Improvements</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedQuestion.improvements.map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => navigate('/roles')}>
                Practice Again
              </Button>
              <Button className="flex-1" onClick={() => navigate('/insights')}>
                View Insights
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
