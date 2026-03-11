import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, Clock, Target, TrendingUp, Search, Filter, Calendar,
  ArrowUpRight, BookOpen, Briefcase, Code, PenTool, MoreHorizontal,
  Plus, ChevronRight, Zap, Brain, MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Input } from '../components/ui/Input';
import DashboardHeader from '../components/DashboardHeader';
import SubscriptionStatus from '../components/SubscriptionStatus';
import ProtectedRoute from '../components/ProtectedRoute';
import { useUser } from '../hooks/useUser';
import { normalizeUserData, getDisplayName } from '../lib/userUtils';

const quickStats = [
  { label: 'Total Sessions', value: '24', change: '+3 this week', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Avg Score', value: '86', change: '+5 from last month', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Practice Time', value: '18h', change: '+2h this week', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Success Rate', value: '94%', change: '+2% improvement', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];

const recentSessions = [
  { id: 1, role: 'Software Engineer', type: 'Technical', score: 85, date: 'Today, 2:30 PM', icon: Code, color: 'from-blue-500 to-cyan-500' },
  { id: 2, role: 'Product Manager', type: 'Behavioral', score: 78, date: 'Yesterday, 4:00 PM', icon: Briefcase, color: 'from-purple-500 to-pink-500' },
  { id: 3, role: 'Data Analyst', type: 'Technical', score: 92, date: 'Mar 8, 11:00 AM', icon: BarChart3, color: 'from-emerald-500 to-teal-500' },
  { id: 4, role: 'UX Designer', type: 'Mixed', score: 88, date: 'Mar 7, 3:15 PM', icon: PenTool, color: 'from-orange-500 to-red-500' },
];

const upcomingSessions = [
  { role: 'Senior SWE', company: 'Netflix', date: 'Tomorrow, 10:00 AM', type: 'System Design' },
  { role: 'Tech Lead', company: 'Spotify', date: 'Mar 14, 2:00 PM', type: 'Behavioral' },
];

const progressData = [
  { skill: 'Interview Skills', value: 86, color: 'bg-gradient-to-r from-emerald-500 to-emerald-400' },
  { skill: 'Technical Knowledge', value: 78, color: 'bg-gradient-to-r from-blue-500 to-blue-400' },
  { skill: 'Communication', value: 92, color: 'bg-gradient-to-r from-purple-500 to-purple-400' },
];

export default function Dashboard() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const normalized = user ? normalizeUserData(user) : null;
  const displayName = normalized ? getDisplayName(normalized) : 'User';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Welcome back, {displayName}! <span className="inline-block animate-float">👋</span>
              </h1>
              <p className="text-white/40 mt-1">Ready to ace your next interview? Let's practice.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/roles">
                <Button className="group">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Practice
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Study Guide
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">{stat.change}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/40">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Sessions */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Sessions</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                        <Input
                          placeholder="Search sessions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-44 h-8 pl-8 text-xs"
                        />
                      </div>
                      <Button variant="secondary" size="sm" className="h-8">
                        <Filter className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentSessions.map((session, i) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${session.color} flex items-center justify-center shrink-0`}>
                          <session.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{session.role}</p>
                          <p className="text-xs text-white/40">{session.type} • {session.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{session.score}<span className="text-white/40">/100</span></p>
                          <Progress value={session.score} className="w-20 h-1 mt-1" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                      </motion.div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-white/40">
                    View All Sessions <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Upcoming Sessions</CardTitle>
                    <Button variant="ghost" size="sm"><Plus className="w-4 h-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingSessions.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{s.role}</p>
                          <p className="text-xs text-white/40">{s.company} • {s.type}</p>
                          <p className="text-xs text-emerald-400 mt-1">{s.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/roles">
                    <Button variant="outline" className="w-full mt-4" size="sm">
                      Schedule New <Plus className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData.map((p) => (
                      <div key={p.skill}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-white/60">{p.skill}</span>
                          <span className="text-white font-medium">{p.value}%</span>
                        </div>
                        <Progress value={p.value} color={p.color} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { label: 'New Interview', to: '/roles', icon: Brain },
                      { label: 'View Insights', to: '/insights', icon: BarChart3 },
                      { label: 'Edit Profile', to: '/profile', icon: PenTool },
                    ].map((action) => (
                      <Link key={action.to} to={action.to}>
                        <Button variant="ghost" className="w-full justify-start" size="sm">
                          <action.icon className="w-4 h-4 mr-2 text-white/40" />
                          {action.label}
                          <ChevronRight className="w-4 h-4 ml-auto text-white/20" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <SubscriptionStatus />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
