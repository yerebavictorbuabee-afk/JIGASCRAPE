import React from 'react';
import { Briefcase } from 'lucide-react';
import { EmptyState } from '@/src/components/ui/EmptyState.tsx';

export const ClientsPage: React.FC<{ onNavigateToLeads: () => void }> = ({ onNavigateToLeads }) => {
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E9EC]">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717] tracking-tight">Clients</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Converted clients and active service engagements.
          </p>
        </div>
      </div>

      <EmptyState
        icon={Briefcase}
        title="No clients yet."
        actionLabel="View Leads"
        onAction={onNavigateToLeads}
      />
    </div>
  );
};

