import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Progress = forwardRef(({ className, value = 0, max = 100, color, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-white/10', className)}
    {...props}
  >
    <div
      className={cn(
        'h-full rounded-full transition-all duration-500 ease-out',
        color || 'bg-gradient-to-r from-emerald-500 to-emerald-400'
      )}
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
));
Progress.displayName = 'Progress';

export { Progress };
