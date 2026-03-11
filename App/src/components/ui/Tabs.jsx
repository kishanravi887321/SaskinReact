import { useState } from 'react';
import { cn } from '../../lib/utils';

function Tabs({ defaultValue, children, className }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className={cn('', className)} data-value={value}>
      {typeof children === 'function' ? children({ value, setValue }) : children}
    </div>
  );
}

function TabsList({ children, className }) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-lg bg-white/5 p-1', className)}>
      {children}
    </div>
  );
}

function TabsTrigger({ value, activeValue, onSelect, children, className }) {
  const isActive = value === activeValue;
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-white/10 text-white shadow-sm'
          : 'text-white/50 hover:text-white/80 hover:bg-white/5',
        className
      )}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, activeValue, children, className }) {
  if (value !== activeValue) return null;
  return <div className={cn('mt-4', className)}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
