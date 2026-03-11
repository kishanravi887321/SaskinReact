import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        secondary: 'border-white/10 bg-white/5 text-white/70',
        destructive: 'border-red-500/20 bg-red-500/10 text-red-400',
        outline: 'border-white/20 text-white/70',
        blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
        purple: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
        yellow: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
