import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check, X, Sparkles, Zap, Crown, HelpCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Switch } from '../components/ui/Switch';
import Header from '../components/Header';

const plans = [
  {
    name: 'Free',
    icon: Zap,
    monthly: 0,
    yearly: 0,
    description: 'Perfect for getting started',
    popular: false,
    features: [
      { text: '5 interview sessions/month', included: true },
      { text: 'Basic AI feedback', included: true },
      { text: 'Performance tracking', included: true },
      { text: 'Email support', included: true },
      { text: 'Advanced analytics', included: false },
      { text: 'Custom interview topics', included: false },
      { text: 'Priority support', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    name: 'Pro',
    icon: Sparkles,
    monthly: 29,
    yearly: 278,
    description: 'Best for active job seekers',
    popular: true,
    features: [
      { text: 'Unlimited interview sessions', included: true },
      { text: 'Advanced AI feedback', included: true },
      { text: 'Detailed analytics', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom interview topics', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: false },
    ],
  },
  {
    name: 'Enterprise',
    icon: Crown,
    monthly: 99,
    yearly: 950,
    description: 'For teams and organizations',
    popular: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Team management', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom interview topics', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: true },
    ],
  },
];

const faqs = [
  { q: 'Can I switch plans anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes! Pro comes with a 7-day free trial. No credit card required to start.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.' },
  { q: 'Can I get a refund?', a: 'We offer a 30-day money-back guarantee for all paid plans. No questions asked.' },
  { q: 'Do you offer student discounts?', a: 'Yes! Students get 50% off Pro plans with a valid .edu email address.' },
  { q: 'What happens when I hit my session limit?', a: 'On the Free plan, you\'ll need to wait until next month or upgrade. Your data is always preserved.' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Heading */}
          <div className="text-center mb-12">
            <Badge className="mb-4">Pricing</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, transparent <span className="gradient-text">pricing</span>
            </h1>
            <p className="text-white/40 max-w-lg mx-auto">
              Choose the plan that works best for you. All plans include core AI interview features.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <span className={`text-sm ${!yearly ? 'text-white' : 'text-white/40'}`}>Monthly</span>
              <Switch checked={yearly} onCheckedChange={setYearly} />
              <span className={`text-sm ${yearly ? 'text-white' : 'text-white/40'}`}>Yearly</span>
              {yearly && <Badge variant="secondary" className="text-xs">Save 20%</Badge>}
            </div>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`relative h-full flex flex-col ${plan.popular ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-emerald-500 text-white border-0">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                      <plan.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-white">
                        ${yearly ? Math.round(plan.yearly / 12) : plan.monthly}
                      </span>
                      <span className="text-white/40 text-sm">/month</span>
                      {yearly && plan.monthly > 0 && (
                        <p className="text-xs text-white/30 mt-1">Billed ${plan.yearly}/year</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1 mb-6">
                      {plan.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2">
                          {f.included ? (
                            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${f.included ? 'text-white/70' : 'text-white/30'}`}>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'secondary'}
                      onClick={() => navigate(plan.monthly === 0 ? '/signup' : '/subscription')}
                    >
                      {plan.monthly === 0 ? 'Get Started Free' : `Get ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
              <p className="text-sm text-white/40">Everything you need to know about our pricing</p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Card key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-white/30 flex-shrink-0" />
                      <span className="text-sm text-white/80">{faq.q}</span>
                    </div>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                  </button>
                  <AnimatePresenceFaq open={openFaq === i}>
                    <div className="px-4 pb-4 pl-11">
                      <p className="text-sm text-white/50">{faq.a}</p>
                    </div>
                  </AnimatePresenceFaq>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function AnimatePresenceFaq({ open, children }) {
  if (!open) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
      {children}
    </motion.div>
  );
}
