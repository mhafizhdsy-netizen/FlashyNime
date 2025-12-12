import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'glass' }>(
  ({ className = '', variant = 'primary', children, ...props }, ref) => {
    const baseStyle = "relative overflow-hidden inline-flex items-center justify-center rounded-xl text-sm font-bold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50 h-11 px-6 active:scale-95";
    
    const variants = {
      primary: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-900/30 hover:shadow-violet-600/50 hover:scale-[1.02]",
      secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-white border border-slate-700",
      ghost: "hover:bg-slate-800/50 text-slate-300 hover:text-white",
      outline: "border-2 border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100",
      glass: "bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 hover:border-white/20 shadow-lg"
    };
    
    return (
      <button ref={ref} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
        {/* Shine effect on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0 pointer-events-none" />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-slate-800/50 ${className}`} />
);

export const Spinner = () => (
  <div className="flex flex-col items-center gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-violet-500 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
    <span className="text-xs text-violet-400 font-medium tracking-widest uppercase">Loading</span>
  </div>
);

export const Badge = ({ children, className = '', variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'outline' | 'hot' }) => {
  const variants = {
    default: "bg-slate-800/80 text-slate-200 border-slate-700",
    outline: "border border-white/20 text-white bg-transparent",
    hot: "bg-gradient-to-r from-orange-500 to-red-600 text-white border-none shadow-md shadow-orange-900/20"
  };
  
  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm transition-colors ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};