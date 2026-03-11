import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30',
        destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20',
        outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-white',
        secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/5',
        ghost: 'text-white/70 hover:text-white hover:bg-white/5',
        link: 'text-emerald-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = forwardRef(({ className, variant, size, ...props }, ref) => (
  <button
    className={cn(buttonVariants({ variant, size, className }))}
    ref={ref}
    {...props}
  />
));
Button.displayName = 'Button';

export { Button, buttonVariants };
