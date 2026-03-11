import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

function Checkbox({ checked, onChange, className, id }) {
  return (
    <button
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'h-4 w-4 shrink-0 rounded border transition-all duration-200 flex items-center justify-center',
        checked
          ? 'bg-emerald-600 border-emerald-600'
          : 'border-white/20 bg-transparent hover:border-white/40',
        className
      )}
    >
      {checked && <Check className="h-3 w-3 text-white" />}
    </button>
  );
}

export { Checkbox };
