import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'neutral' | 'red' | 'amber' | 'emerald' | 'blue' | 'purple' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  icon,
  className = '',
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs tracking-wide';

  const variantClasses = {
    default: 'bg-slate-900 text-white',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    blue: 'bg-sky-50 text-sky-700 border border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    outline: 'border border-slate-300 text-slate-600 bg-transparent',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md whitespace-nowrap ${sizeClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
