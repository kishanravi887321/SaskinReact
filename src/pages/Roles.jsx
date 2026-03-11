import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Code, Briefcase, BarChart3, Users, PenTool, Server, ArrowRight, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const roles = [
  { id: 'sde', label: 'Software Engineer', icon: Code, desc: 'Data structures, algorithms, system design, and coding challenges.', color: 'from-blue-500 to-cyan-500', questions: '500+', difficulty: 'All levels' },
  { id: 'pm', label: 'Product Manager', icon: Briefcase, desc: 'Product strategy, metrics, user stories, and execution frameworks.', color: 'from-purple-500 to-pink-500', questions: '300+', difficulty: 'All levels' },
  { id: 'analyst', label: 'Data Analyst', icon: BarChart3, desc: 'SQL, statistics, data visualization, and business analysis.', color: 'from-emerald-500 to-teal-500', questions: '400+', difficulty: 'All levels' },
  { id: 'consultant', label: 'Business Consultant', icon: Users, desc: 'Case studies, market sizing, strategy, and frameworks.', color: 'from-yellow-500 to-orange-500', questions: '250+', difficulty: 'All levels' },
  { id: 'designer', label: 'UX/UI Designer', icon: PenTool, desc: 'Design thinking, portfolio reviews, wireframing, and user research.', color: 'from-pink-500 to-rose-500', questions: '200+', difficulty: 'All levels' },
  { id: 'devops', label: 'DevOps Engineer', icon: Server, desc: 'CI/CD, cloud architecture, containers, and infrastructure.', color: 'from-orange-500 to-red-500', questions: '350+', difficulty: 'All levels' },
];

export default function Roles() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <span className="text-lg font-bold text-white">InterviewAI</span>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Choose Your Interview <span className="gradient-text">Role</span>
          </h1>
          <p className="text-white/50">
            Select the role you want to practice for. Each role has tailored questions and evaluation criteria.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/interview/${role.id}`}>
                <Card className="p-6 h-full hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.02] transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <role.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{role.label}</h3>
                  <p className="text-sm text-white/50 mb-4 leading-relaxed">{role.desc}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">{role.questions} Questions</Badge>
                    <Badge variant="secondary">{role.difficulty}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-emerald-400 font-medium group-hover:gap-2 transition-all">
                    Start Practice <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Card className="inline-flex items-center gap-3 p-4 px-6">
            <HelpCircle className="w-5 h-5 text-white/40" />
            <span className="text-sm text-white/50">Not sure which role fits you?</span>
            <Button variant="link" size="sm">Take Our Quiz <ArrowRight className="w-3 h-3 ml-1" /></Button>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
