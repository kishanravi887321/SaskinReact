import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Zap, CreditCard, BarChart3, ArrowUpRight } from 'lucide-react';

const planConfig = {
  free: { label: 'Free Plan', color: 'secondary', icon: Zap },
  pro: { label: 'Pro Plan', color: 'default', icon: CreditCard },
  enterprise: { label: 'Enterprise', color: 'purple', icon: BarChart3 },
};

export default function SubscriptionStatus({
  plan = 'free',
  usage = { sessionsUsed: 3, sessionsLimit: 5, period: 'This Month' },
  nextBilling,
  showUpgrade = true,
}) {
  const config = planConfig[plan] || planConfig.free;
  const Icon = config.icon;
  const usagePercent = (usage.sessionsUsed / usage.sessionsLimit) * 100;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <Badge variant={config.color}>{config.label}</Badge>
            </div>
          </div>
        </div>

        {plan === 'free' && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">{usage.period}</span>
              <span className="text-white/80">{usage.sessionsUsed}/{usage.sessionsLimit} sessions</span>
            </div>
            <Progress value={usage.sessionsUsed} max={usage.sessionsLimit} />
            {usagePercent > 80 && (
              <p className="text-xs text-yellow-400">⚠ Running low on sessions this month</p>
            )}
          </div>
        )}

        {plan !== 'free' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 text-xs">Manage Billing</Button>
              <Button variant="secondary" size="sm" className="flex-1 text-xs">View Usage</Button>
            </div>
            {nextBilling && (
              <p className="text-xs text-white/40">Next billing: {nextBilling}</p>
            )}
          </div>
        )}

        {showUpgrade && plan === 'free' && (
          <Link to="/pricing" className="block mt-4">
            <Button className="w-full" size="sm">
              Upgrade Plan <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
