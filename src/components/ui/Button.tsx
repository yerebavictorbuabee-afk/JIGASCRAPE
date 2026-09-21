import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/20 focus-visible:border-[#E30613] disabled:opacity-40 disabled:cursor-not-allowed select-none whitespace-nowrap';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 h-8',
    md: 'px-3.5 py-2 text-sm gap-2 h-9',
    lg: 'px-4 py-2.5 text-sm gap-2 h-10',
  };

  const variantStyles = {
    primary:
      'bg-[#E30613] text-white hover:bg-[#C80712] active:bg-[#A8050F] border border-transparent shadow-2xs',
    secondary:
      'bg-[#F7F7F8] text-[#171717] hover:bg-[#E8E9EC] active:bg-[#DCDFE4] border border-[#E8E9EC]',
    outline:
      'border border-[#E8E9EC] bg-white text-[#171717] hover:bg-[#F7F7F8] hover:border-[#DCDFE4] active:bg-[#E8E9EC]',
    ghost:
      'text-[#6B7280] hover:text-[#171717] hover:bg-[#F7F7F8] active:bg-[#E8E9EC] border border-transparent',
    danger:
      'bg-red-50 text-[#E30613] border border-red-200 hover:bg-red-100/80 active:bg-red-200',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
    </button>
  );
};
