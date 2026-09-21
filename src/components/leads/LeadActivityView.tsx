import React from 'react';
import {
  Activity,
  PlusCircle,
  Upload,
  Search,
  Edit3,
  RefreshCw,
  Award,
  ArrowRightCircle,
  Archive,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { LeadActivity } from '@/src/types/database.ts';

interface LeadActivityViewProps {
  activities: LeadActivity[];
}

export const LeadActivityView: React.FC<LeadActivityViewProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead_created':
        return <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'stage_change':
        return <ArrowRightCircle className="w-3.5 h-3.5 text-blue-600" />;
      case 'qualification_updated':
        return <Award className="w-3.5 h-3.5 text-amber-600" />;
      case 'score_recalculated':
        return <RefreshCw className="w-3.5 h-3.5 text-purple-600" />;
      case 'note_added':
        return <MessageSquare className="w-3.5 h-3.5 text-zinc-600" />;
      case 'archived':
      case 'restored':
        return <Archive className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-zinc-600" />;
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
          Audit Activity Log ({activities.length})
        </h4>
        <span className="text-[11px] text-[#6B7280]">
          System events and team modifications recorded automatically
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center bg-[#F9FAFB] rounded-xl border border-[#E8E9EC]">
          <Clock className="w-6 h-6 text-[#98A1B2] mx-auto mb-2" />
          <p className="text-xs text-[#6B7280]">No activity recorded yet for this lead.</p>
        </div>
      ) : (
        <div className="relative border-l border-[#E5E7EB] ml-3.5 pl-6 space-y-5">
          {activities.map((act) => (
            <div key={act.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-white border border-[#E8E9EC] flex items-center justify-center shadow-2xs">
                {getActivityIcon(act.activity_type)}
              </div>

              <div className="bg-white rounded-lg border border-[#E8E9EC] p-3 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#171717]">{act.title}</span>
                  <span className="text-[11px] text-[#6B7280]">{formatDate(act.occurred_at)}</span>
                </div>
                {act.description && (
                  <p className="text-xs text-[#374151] leading-relaxed">{act.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
