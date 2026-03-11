import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard, Calendar, Download, ArrowUpRight, CheckCircle,
  Zap, Sparkles, Crown, Clock, BarChart3, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import DashboardHeader from '../components/DashboardHeader';
import SubscriptionStatus from '../components/SubscriptionStatus';
import { useAuth } from '../hooks/useAuth';

const planConfig = {
  free: { name: 'Free', icon: Zap, price: 0, color: 'text-blue-400', sessions: 5, sessionsUsed: 3 },
  pro: { name: 'Pro', icon: Sparkles, price: 29, color: 'text-emerald-400', sessions: -1, sessionsUsed: 24 },
  enterprise: { name: 'Enterprise', icon: Crown, price: 99, color: 'text-purple-400', sessions: -1, sessionsUsed: 156 },
};

const billingHistory = [
  { id: 'INV-001', date: '2024-12-01', amount: 29.00, status: 'paid', plan: 'Pro Monthly' },
  { id: 'INV-002', date: '2024-11-01', amount: 29.00, status: 'paid', plan: 'Pro Monthly' },
  { id: 'INV-003', date: '2024-10-01', amount: 29.00, status: 'paid', plan: 'Pro Monthly' },
  { id: 'INV-004', date: '2024-09-01', amount: 0, status: 'free', plan: 'Free Plan' },
];

const usageData = [
  { label: 'Interview Sessions', used: 24, limit: 'Unlimited', percent: null },
  { label: 'AI Feedback Reports', used: 24, limit: 'Unlimited', percent: null },
  { label: 'Custom Topics', used: 8, limit: 15, percent: 53 },
  { label: 'API Calls', used: 0, limit: 0, percent: 0 },
];

export default function Subscription() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentPlan] = useState('pro');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const plan = planConfig[currentPlan];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Subscription</h1>
              <p className="text-sm text-white/40 mt-1">Manage your plan and billing</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/pricing')}>
              View Plans
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                      <plan.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                        <Badge>Active</Badge>
                      </div>
                      <p className="text-sm text-white/40 mt-0.5">
                        {plan.price > 0 ? `$${plan.price}/month · Next billing: Jan 1, 2025` : 'Free forever'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">${plan.price}</p>
                      <p className="text-xs text-white/40">/month</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    {currentPlan !== 'enterprise' && (
                      <Button size="sm" onClick={() => navigate('/pricing')}>
                        <ArrowUpRight className="w-4 h-4 mr-1" /> Upgrade Plan
                      </Button>
                    )}
                    {currentPlan !== 'free' && (
                      <Button variant="ghost" size="sm" className="text-white/40 hover:text-red-400">
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Usage This Month</CardTitle>
                  <CardDescription>Reset on the 1st of each month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {usageData.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/70">{item.label}</span>
                          <span className="text-sm text-white/50">
                            {item.used} / {item.limit}
                          </span>
                        </div>
                        {item.percent !== null ? (
                          <Progress value={item.percent} className="h-2" />
                        ) : (
                          <div className="h-2 bg-white/[0.04] rounded-full">
                            <div className="h-full bg-emerald-500/50 rounded-full" style={{ width: '100%' }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Billing History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.04]">
                          <th className="text-left text-xs font-medium text-white/40 px-4 py-3 uppercase tracking-wider">Invoice</th>
                          <th className="text-left text-xs font-medium text-white/40 px-4 py-3 uppercase tracking-wider">Date</th>
                          <th className="text-left text-xs font-medium text-white/40 px-4 py-3 uppercase tracking-wider">Plan</th>
                          <th className="text-left text-xs font-medium text-white/40 px-4 py-3 uppercase tracking-wider">Amount</th>
                          <th className="text-left text-xs font-medium text-white/40 px-4 py-3 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {billingHistory.map((inv) => (
                          <tr key={inv.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 text-sm text-white/70">{inv.id}</td>
                            <td className="px-4 py-3 text-sm text-white/50">{new Date(inv.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td className="px-4 py-3 text-sm text-white/50">{inv.plan}</td>
                            <td className="px-4 py-3 text-sm text-white/70 font-medium">${inv.amount.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                                {inv.status === 'paid' ? 'Paid' : 'Free'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {inv.amount > 0 && (
                                <Button variant="ghost" size="sm"><Download className="w-3.5 h-3.5" /></Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <SubscriptionStatus />

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <CreditCard className="w-8 h-8 text-white/30" />
                    <div>
                      <p className="text-sm text-white/70">•••• •••• •••• 4242</p>
                      <p className="text-xs text-white/30">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3 w-full">
                    Update Payment Method
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 text-center">
                  <p className="text-sm text-white/40 mb-3">Need help with billing?</p>
                  <Button variant="secondary" size="sm" className="w-full">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
