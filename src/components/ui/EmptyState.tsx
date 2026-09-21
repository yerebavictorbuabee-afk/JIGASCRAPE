import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button.tsx';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-4 rounded-lg border border-[#E8E9EC] bg-white ${className}`}
    >
      <div className="w-9 h-9 rounded-md bg-[#F7F7F8] border border-[#E8E9EC] flex items-center justify-center text-[#98A1B2] mb-3">
        <Icon className="w-4 h-4 stroke-[1.75]" />
      </div>

      <p className="text-sm font-medium text-[#171717]">{title}</p>
      {description && <p className="text-xs text-[#6B7280] mt-1 max-w-sm">{description}</p>}

      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

