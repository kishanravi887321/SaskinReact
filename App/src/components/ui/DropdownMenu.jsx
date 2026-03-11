import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

function DropdownMenu({ children, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      {typeof children === 'function'
        ? children({ isOpen, setIsOpen, toggle: () => setIsOpen(!isOpen) })
        : children}
    </div>
  );
}

function DropdownTrigger({ onClick, children, className }) {
  return (
    <button onClick={onClick} className={cn('', className)}>
      {children}
    </button>
  );
}

function DropdownContent({ isOpen, children, className, align = 'right' }) {
  if (!isOpen) return null;
  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-[200px] rounded-xl border border-white/[0.06] bg-gray-900/95 backdrop-blur-xl p-1 shadow-2xl animate-slide-up',
        align === 'right' ? 'right-0' : 'left-0',
        className
      )}
    >
      {children}
    </div>
  );
}

function DropdownItem({ onClick, children, className, destructive }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
        destructive
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-white/70 hover:text-white hover:bg-white/5',
        className
      )}
    >
      {children}
    </button>
  );
}

function DropdownSeparator() {
  return <div className="my-1 h-px bg-white/[0.06]" />;
}

export { DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator };
