import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Brain, MessageSquare, Target, BarChart3, Users, Shield,
  Star, Zap, CheckCircle2, Play, Sparkles, ChevronRight, Github, Twitter, Linkedin,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Header from '../components/Header';
import AuthStatus from '../components/AuthStatus';
import { useAuth } from '../hooks/useAuth';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stats = [
  { value: '10,000+', label: 'Active Users', icon: Users },
  { value: '95%', label: 'Success Rate', icon: Target },
  { value: '50,000+', label: 'Interviews', icon: MessageSquare },
  { value: '4.9/5', label: 'User Rating', icon: Star },
];

const features = [
  { icon: Brain, title: 'AI-Powered Interviews', desc: 'Practice with advanced AI that adapts to your skill level and provides personalized questions.' },
  { icon: MessageSquare, title: 'Real-Time Feedback', desc: 'Get instant, actionable feedback on your answers including strengths and areas to improve.' },
  { icon: Target, title: 'Multiple Roles', desc: 'Prepare for SDE, PM, Data Analyst, Design, DevOps and more with role-specific questions.' },
  { icon: BarChart3, title: 'Performance Analytics', desc: 'Track your progress over time with detailed insights and skill breakdown charts.' },
  { icon: Shield, title: 'Enterprise Ready', desc: 'Team management, SSO, and white-label solutions for organizations of any size.' },
  { icon: Zap, title: 'Instant Setup', desc: 'No complex configuration needed. Start practicing in under 60 seconds with any role.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Software Engineer @ Google', text: 'SakSin AI helped me prepare for my Google interview. The AI feedback was incredibly accurate and helped me identify blind spots.', rating: 5 },
  { name: 'Marcus Johnson', role: 'Product Manager @ Meta', text: 'The role-specific questions were spot on. I felt much more confident going into my PM interviews after using this platform.', rating: 5 },
  { name: 'Priya Sharma', role: 'Data Analyst @ Amazon', text: 'I improved my interview score by 40% in just two weeks. The analytics dashboard made it easy to track my weak areas.', rating: 5 },
];

const companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Spotify', 'Stripe'];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <AuthStatus />;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[150px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[150px]" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[180px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-8"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Interview Preparation
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              <span className="text-white">Master Your Next</span>
              <br />
              <span className="gradient-text">AI Interview</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
            >
              Practice with our AI interviewer, get real-time feedback, and track your progress
              across technical, behavioral, and system design interviews.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            >
              <Link to="/dashboard">
                <Button size="xl" className="group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="group">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="flex items-center justify-center gap-6 mt-8 text-sm text-white/40"
            >
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 5 free sessions</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="text-center p-6 hover:bg-white/[0.04] transition-colors">
                  <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/40 mt-1">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Logos */}
      <section className="py-12 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-white/30 mb-8">Trusted by engineers from top companies</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {companies.map((company) => (
              <span key={company} className="text-lg font-semibold text-white/20 hover:text-white/40 transition-colors">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="mt-4 text-white/50">Our platform provides comprehensive tools to prepare you for any interview scenario.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="p-6 h-full hover:bg-white/[0.04] transition-all duration-300 group cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <f.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Loved by <span className="gradient-text">Thousands</span>
            </h2>
            <p className="mt-4 text-white/50">See what our users have to say about their experience.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-white/70 mb-6 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-sm font-semibold text-white">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs text-white/40">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-12 sm:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-white/50 max-w-xl mx-auto mb-8">
                  Join thousands of professionals who have improved their interview skills with AI-powered practice sessions.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/signup">
                    <Button size="xl" className="group">
                      Get Started Free
                      <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="outline" size="xl">View Pricing</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SakSin AI</span>
              </div>
              <p className="text-sm text-white/40 mb-4">AI-powered interview preparation for the modern professional.</p>
              <div className="flex gap-3">
                <a href="#" className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Dashboard', 'API'] },
              { title: 'Resources', links: ['Documentation', 'Blog', 'Support', 'Changelog'] },
              { title: 'Company', links: ['About', 'Careers', 'Privacy', 'Terms'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-white mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.04] mt-12 pt-8 text-center text-sm text-white/30">
            &copy; {new Date().getFullYear()} SakSin AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
