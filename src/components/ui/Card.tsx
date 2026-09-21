import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  header,
  footer,
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-[#E8E9EC] rounded-lg overflow-hidden ${className}`}
      {...props}
    >
      {header && (
        <div className="px-5 py-3.5 border-b border-[#E8E9EC] flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-[#F7F7F8] border-t border-[#E8E9EC] text-xs text-[#6B7280]">
          {footer}
        </div>
      )}
    </div>
  );
};
