import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

function Select({ value, onValueChange, children, className }) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-10 w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
    </div>
  );
}

function SelectOption({ value, children }) {
  return (
    <option value={value} className="bg-gray-900 text-white">
      {children}
    </option>
  );
}

export { Select, SelectOption };
