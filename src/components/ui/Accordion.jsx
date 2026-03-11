import { useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

function Accordion({ children, className }) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

function AccordionItem({ title, children, className }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={cn('border border-white/[0.06] rounded-lg overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-medium text-white hover:bg-white/5 transition-colors"
      >
        {title}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-white/40 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-white/60">
          {children}
        </div>
      )}
    </div>
  );
}

export { Accordion, AccordionItem };
