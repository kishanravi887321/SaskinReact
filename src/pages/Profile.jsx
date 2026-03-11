import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Briefcase, MapPin, Globe, Github, Linkedin, Twitter,
  Camera, Edit3, Save, X, Shield, Award, BarChart3, Calendar,
  CheckCircle, Clock, Loader2, ExternalLink, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Select, SelectOption } from '../components/ui/Select';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { apiRequest, API_ENDPOINTS } from '../lib/api';
import { getDisplayName, getUserInitials, getProfileImage } from '../lib/userUtils';

const achievements = [
  { title: 'First Interview', desc: 'Completed your first practice session', earned: true, icon: '🎯' },
  { title: '10 Sessions', desc: 'Completed 10 interview sessions', earned: true, icon: '🔥' },
  { title: 'Score 90+', desc: 'Achieved a 90+ score', earned: false, icon: '⭐' },
  { title: '30-Day Streak', desc: 'Practiced every day for 30 days', earned: false, icon: '🏆' },
  { title: 'All Roles', desc: 'Tried all available interview roles', earned: true, icon: '🎭' },
  { title: 'Top Performer', desc: 'Scored in the top 10% globally', earned: false, icon: '👑' },
];

const recentActivity = [
  { type: 'interview', title: 'SDE Technical Interview', score: 85, time: '2 hours ago' },
  { type: 'interview', title: 'PM Behavioral Interview', score: 78, time: '1 day ago' },
  { type: 'achievement', title: 'Earned "10 Sessions" badge', time: '2 days ago' },
  { type: 'interview', title: 'System Design Practice', score: 72, time: '3 days ago' },
  { type: 'streak', title: 'Started a 7-day streak', time: '5 days ago' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAuth();
  const { user, refreshUser } = useUser();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [form, setForm] = useState({
    username: '',
    bio: '',
    role: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
  });

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        bio: user.bio || '',
        role: user.role || '',
        location: user.location || '',
        website: user.website || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
      });
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (photoFile) formData.append('profile_image', photoFile);

      await apiRequest(API_ENDPOINTS.USER.PROFILE_UPDATE, {
        method: 'PATCH',
        body: formData,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setPhotoFile(null);
      refreshUser();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const displayName = user ? getDisplayName(user) : 'User';
  const initials = user ? getUserInitials(user) : 'U';
  const profileImg = user ? getProfileImage(user) : null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-white/10">
                    <AvatarImage src={photoPreview || profileImg} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                    <Badge variant="secondary">{user?.subscription_plan || 'Free'} Plan</Badge>
                  </div>
                  <p className="text-white/50 text-sm mb-3">{user?.email || 'user@example.com'}</p>
                  {(form.bio || !isEditing) && (
                    <p className="text-white/40 text-sm max-w-lg">{form.bio || 'No bio added yet'}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/40">
                    {form.role && (
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{form.role}</span>
                    )}
                    {form.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{form.location}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : 'recently'}</span>
                  </div>
                  {/* Social links */}
                  {(form.github || form.linkedin || form.twitter || form.website) && !isEditing && (
                    <div className="flex gap-3 mt-3">
                      {form.github && <a href={form.github} target="_blank" rel="noreferrer" className="text-white/30 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>}
                      {form.linkedin && <a href={form.linkedin} target="_blank" rel="noreferrer" className="text-white/30 hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>}
                      {form.twitter && <a href={form.twitter} target="_blank" rel="noreferrer" className="text-white/30 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>}
                      {form.website && <a href={form.website} target="_blank" rel="noreferrer" className="text-white/30 hover:text-white transition-colors"><Globe className="w-4 h-4" /></a>}
                    </div>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={loading} size="sm">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save
                      </Button>
                      <Button variant="ghost" onClick={() => { setIsEditing(false); setPhotoPreview(null); setPhotoFile(null); }} size="sm">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="secondary" onClick={() => setIsEditing(true)} size="sm">
                      <Edit3 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <AnimatePresence>
            {isEditing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                          <SelectOption value="">Select role</SelectOption>
                          <SelectOption value="Software Developer">Software Developer</SelectOption>
                          <SelectOption value="Product Manager">Product Manager</SelectOption>
                          <SelectOption value="Data Analyst">Data Analyst</SelectOption>
                          <SelectOption value="Designer">Designer</SelectOption>
                          <SelectOption value="DevOps Engineer">DevOps Engineer</SelectOption>
                          <SelectOption value="Consultant">Consultant</SelectOption>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
                      </div>
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." rows={3} />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>GitHub</Label>
                        <Input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/..." />
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Twitter</Label>
                        <Input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="https://twitter.com/..." />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Interviews', value: '24', icon: BarChart3, color: 'text-blue-400' },
                  { label: 'Avg Score', value: '78', icon: Award, color: 'text-emerald-400' },
                  { label: 'Hours Practiced', value: '18.5', icon: Clock, color: 'text-purple-400' },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="p-5 flex flex-col items-center text-center">
                      <s.icon className={`w-6 h-6 mb-2 ${s.color}`} />
                      <p className="text-2xl font-bold text-white">{s.value}</p>
                      <p className="text-xs text-white/40 mt-1">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((a) => (
                  <Card key={a.title} className={a.earned ? 'border-emerald-500/20' : 'opacity-50'}>
                    <CardContent className="p-5 text-center">
                      <div className="text-3xl mb-3">{a.icon}</div>
                      <p className="text-sm font-medium text-white">{a.title}</p>
                      <p className="text-xs text-white/40 mt-1">{a.desc}</p>
                      {a.earned && (
                        <div className="flex items-center justify-center gap-1 mt-3 text-xs text-emerald-400">
                          <CheckCircle className="w-3 h-3" /> Earned
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardContent className="p-0">
                  {recentActivity.map((a, i) => (
                    <div key={i} className={`flex items-center gap-4 p-4 ${i < recentActivity.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.type === 'interview' ? 'bg-blue-500/10' : a.type === 'achievement' ? 'bg-yellow-500/10' : 'bg-orange-500/10'}`}>
                        {a.type === 'interview' ? <FileText className="w-4 h-4 text-blue-400" /> : a.type === 'achievement' ? <Award className="w-4 h-4 text-yellow-400" /> : <CheckCircle className="w-4 h-4 text-orange-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80">{a.title}</p>
                        <p className="text-xs text-white/30">{a.time}</p>
                      </div>
                      {a.score && <Badge variant="secondary">{a.score}/100</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
