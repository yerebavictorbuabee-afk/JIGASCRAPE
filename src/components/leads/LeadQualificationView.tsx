import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Award,
  RefreshCw,
  Info,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { Lead, LeadScoreSignal } from '@/src/types/database.ts';
import { SCORING_RULES } from '@/src/lib/scoring/scoringEngine.ts';

interface LeadQualificationViewProps {
  lead: Lead;
  signals: LeadScoreSignal[];
  onUpdateSignal: (
    signalKey: string,
    status: 'confirmed' | 'not_present' | 'unknown',
    evidence?: string
  ) => Promise<void>;
  onRecalculateScore: () => Promise<void>;
}

export const LeadQualificationView: React.FC<LeadQualificationViewProps> = ({
  lead,
  signals,
  onUpdateSignal,
  onRecalculateScore,
}) => {
  const [editingSignalKey, setEditingSignalKey] = useState<string | null>(null);
  const [evidenceText, setEvidenceText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
      default:
        return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  const handleStatusChange = async (
    signalKey: string,
    newStatus: 'confirmed' | 'not_present' | 'unknown'
  ) => {
    setIsUpdating(true);
    try {
      await onUpdateSignal(signalKey, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEvidence = async (signalKey: string) => {
    setIsUpdating(true);
    try {
      const current = signals.find((s) => s.signal_key === signalKey);
      await onUpdateSignal(signalKey, current?.status || 'unknown', evidenceText);
      setEditingSignalKey(null);
      setEvidenceText('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Summary Card */}
      <div className="bg-[#F9FAFB] rounded-xl border border-[#E8E9EC] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white border border-[#E8E9EC] flex flex-col items-center justify-center shadow-2xs">
              <span className="text-xl font-bold text-[#171717]">
                {lead.opportunity_score}
              </span>
              <span className="text-[10px] text-[#6B7280] font-medium uppercase">/ 30 max</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-[#171717]">Opportunity Score</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(
                    lead.opportunity_priority
                  )}`}
                >
                  {lead.opportunity_priority} Priority
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                {lead.opportunity_priority === 'High' &&
                  'Strong commercial gap detected: Prime candidate for digital conversion.'}
                {lead.opportunity_priority === 'Medium' &&
                  'Notable digital opportunity gaps; qualify key details before outreach.'}
                {lead.opportunity_priority === 'Low' &&
                  'Limited digital gaps or modern established presence.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRecalculateScore}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#374151] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>Recalculate</span>
            </button>
          </div>
        </div>

        {/* Priority Scale Bar */}
        <div className="mt-4 pt-4 border-t border-[#E8E9EC]">
          <div className="flex justify-between text-[11px] text-[#6B7280] mb-1.5 font-medium">
            <span>Low (0 - 14)</span>
            <span>Medium (15 - 19)</span>
            <span>High (20 - 30)</span>
          </div>
          <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 ${
                lead.opportunity_score >= 20
                  ? 'bg-emerald-500'
                  : lead.opportunity_score >= 15
                  ? 'bg-amber-500'
                  : 'bg-zinc-400'
              }`}
              style={{ width: `${Math.min(100, Math.round((lead.opportunity_score / 30) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 11 Qualification Rules Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
            Scoring Signals & Verification (11 Rules)
          </h4>
          <span className="text-[11px] text-[#6B7280]">
            Confirmed signals contribute directly to score
          </span>
        </div>

        <div className="border border-[#E8E9EC] rounded-xl divide-y divide-[#E8E9EC] overflow-hidden bg-white">
          {SCORING_RULES.map((rule) => {
            const signal = signals.find((s) => s.signal_key === rule.key);
            const status = signal?.status || 'unknown';
            const evidence = signal?.evidence;
            const isEditing = editingSignalKey === rule.key;

            return (
              <div key={rule.key} className="p-3.5 hover:bg-[#F9FAFB]/60 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="mt-0.5 shrink-0 px-2 py-0.5 text-[11px] font-bold rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      +{rule.points} pts
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#171717]">{rule.label}</span>
                        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider">
                          ({rule.category})
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                        {rule.description}
                      </p>

                      {evidence && !isEditing && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#F3F4F6] rounded text-[11px] text-[#374151]">
                          <Info className="w-3 h-3 text-[#6B7280]" />
                          <span>Evidence: {evidence}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Toggle Controls */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(rule.key, 'confirmed')}
                      className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1 transition-colors ${
                        status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold'
                          : 'bg-white text-[#6B7280] border-[#E8E9EC] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmed (+{rule.points})</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(rule.key, 'not_present')}
                      className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1 transition-colors ${
                        status === 'not_present'
                          ? 'bg-red-50 text-red-700 border-red-300 font-semibold'
                          : 'bg-white text-[#6B7280] border-[#E8E9EC] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Not Present</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(rule.key, 'unknown')}
                      className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1 transition-colors ${
                        status === 'unknown'
                          ? 'bg-zinc-100 text-zinc-700 border-zinc-300 font-semibold'
                          : 'bg-white text-[#6B7280] border-[#E8E9EC] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Unknown</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          setEditingSignalKey(null);
                        } else {
                          setEditingSignalKey(rule.key);
                          setEvidenceText(evidence || '');
                        }
                      }}
                      className="p-1.5 text-[#6B7280] hover:text-[#171717] rounded hover:bg-[#F3F4F6]"
                      title="Add or edit evidence"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Evidence Editor */}
                {isEditing && (
                  <div className="mt-3 pt-3 border-t border-[#E8E9EC] flex items-center gap-2">
                    <input
                      type="text"
                      value={evidenceText}
                      onChange={(e) => setEvidenceText(e.target.value)}
                      placeholder="Add observation note (e.g. Website URL returns 404, or Instagram bio has no link)..."
                      className="flex-1 px-2.5 py-1.5 text-xs rounded border border-[#E8E9EC] bg-white text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717]"
                    />
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSaveEvidence(rule.key)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-[#171717] rounded hover:bg-black transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSignalKey(null)}
                      className="px-2.5 py-1.5 text-xs text-[#6B7280] hover:text-[#171717]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
