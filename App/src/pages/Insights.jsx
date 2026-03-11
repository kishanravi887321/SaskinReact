import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Target, Brain, BarChart3, Calendar, Award,
  ArrowUpRight, ArrowDownRight, Sparkles, Flame, Clock, Zap,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../hooks/useAuth';

const performanceData = [
  { date: 'Week 1', score: 55 }, { date: 'Week 2', score: 62 },
  { date: 'Week 3', score: 58 }, { date: 'Week 4', score: 71 },
  { date: 'Week 5', score: 68 }, { date: 'Week 6', score: 75 },
  { date: 'Week 7', score: 82 }, { date: 'Week 8', score: 78 },
];

const skillsData = [
  { skill: 'Communication', value: 85 },
  { skill: 'Technical', value: 78 },
  { skill: 'Problem Solving', value: 82 },
  { skill: 'Leadership', value: 70 },
  { skill: 'System Design', value: 65 },
  { skill: 'Behavioral', value: 88 },
];

const companyData = [
  { company: 'Google', score: 82 }, { company: 'Amazon', score: 75 },
  { company: 'Meta', score: 78 }, { company: 'Netflix', score: 85 },
  { company: 'Apple', score: 70 }, { company: 'Microsoft', score: 80 },
];

const weeklyActivity = [
  { day: 'Mon', sessions: 2 }, { day: 'Tue', sessions: 3 },
  { day: 'Wed', sessions: 1 }, { day: 'Thu', sessions: 4 },
  { day: 'Fri', sessions: 2 }, { day: 'Sat', sessions: 5 },
  { day: 'Sun', sessions: 0 },
];

const aiInsights = [
  { title: 'Communication skills improving', description: 'Your verbal clarity has improved by 15% over the last 4 sessions.', trend: 'up', icon: TrendingUp },
  { title: 'System Design needs focus', description: 'Consider practicing more distributed systems and scalability topics.', trend: 'down', icon: Target },
  { title: 'Strong behavioral responses', description: 'STAR method usage is consistent. Keep providing quantified impacts.', trend: 'up', icon: Award },
  { title: 'Time management improved', description: 'Average response time decreased from 5.2 to 3.8 minutes.', trend: 'up', icon: Clock },
];

const stats = [
  { label: 'Total Sessions', value: '24', icon: BarChart3, change: '+3 this week', up: true },
  { label: 'Avg Score', value: '78', icon: Target, change: '+5 vs last month', up: true },
  { label: 'Current Streak', value: '7', icon: Flame, change: '7 day streak', up: true },
  { label: 'Total Hours', value: '18.5', icon: Clock, change: '+2.5h this week', up: true },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-sm font-medium text-emerald-400">{payload[0].value}</p>
    </div>
  );
};

export default function Insights() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Performance Insights</h1>
              <p className="text-sm text-white/40 mt-1">Track your interview preparation journey</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/roles')}>
              <Zap className="w-4 h-4 mr-2" /> Start Practice
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className="w-5 h-5 text-white/30" />
                      <div className="flex items-center gap-1 text-xs text-emerald-400">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>{stat.change}</span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Performance Trend */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Performance Trend</CardTitle>
                    <CardDescription>Score progression over 8 weeks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} domain={[40, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fill="url(#fillScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiInsights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.trend === 'up' ? 'bg-emerald-500/10' : 'bg-yellow-500/10'}`}>
                          <insight.icon className={`w-4 h-4 ${insight.trend === 'up' ? 'text-emerald-400' : 'text-yellow-400'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{insight.title}</p>
                          <p className="text-xs text-white/40 mt-0.5">{insight.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="skills">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Radar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Skills Analysis</CardTitle>
                    <CardDescription>Competency across key areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={skillsData}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="skill" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                        <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Bar chart company */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Company Performance</CardTitle>
                    <CardDescription>Scores by interview style</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={companyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="company" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Skill progress bars */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Skill Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {skillsData.map((skill) => (
                        <div key={skill.skill} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/70">{skill.skill}</span>
                            <span className="text-sm font-medium text-white">{skill.value}%</span>
                          </div>
                          <Progress value={skill.value} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Weekly Activity</CardTitle>
                    <CardDescription>Sessions per day this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={weeklyActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="sessions" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-5 text-center">
                      <Flame className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                      <p className="text-3xl font-bold text-white">7</p>
                      <p className="text-sm text-white/40 mt-1">Day Streak</p>
                      <p className="text-xs text-white/30 mt-2">Best: 14 days</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <p className="text-3xl font-bold text-white">17</p>
                      <p className="text-sm text-white/40 mt-1">Active Days</p>
                      <p className="text-xs text-white/30 mt-2">This month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <h3 className="text-sm font-medium text-white mb-3">Milestones</h3>
                      <div className="space-y-2">
                        {['First Interview', '10 Sessions', 'Score 80+', '7-Day Streak'].map((m, i) => (
                          <div key={m} className="flex items-center gap-2">
                            <Award className={`w-4 h-4 ${i < 3 ? 'text-emerald-400' : 'text-white/20'}`} />
                            <span className={`text-sm ${i < 3 ? 'text-white/70' : 'text-white/30'}`}>{m}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
