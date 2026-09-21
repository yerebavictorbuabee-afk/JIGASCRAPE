import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  MessageCircle,
  Clock,
  FileText,
  Search,
  Info,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button.tsx';
import { Modal } from '@/src/components/ui/Modal.tsx';
import { ACQUISITION_ACTION_HIERARCHY } from '@/src/lib/constants/config.ts';

interface QuickActionBarProps {
  businessName: string;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({ businessName }) => {
  const [activeModalAction, setActiveModalAction] = useState<string | null>(null);

  // Actions as specified:
  // - Analyze
  // - Generate Free Value
  // - Generate Message
  // - Open WhatsApp
  // - Schedule Follow-up
  // - Create Proposal
  const actions = [
    {
      id: 'analyze',
      label: 'Analyze',
      icon: Search,
      variant: 'outline' as const,
      phase: 'Phase 2',
      description: 'Audit mobile performance, review sentiment, and digital opportunity gaps.',
    },
    {
      id: 'generate_concept',
      label: 'Generate Free Value',
      icon: Sparkles,
      variant: 'primary' as const, // High intent Jigaway red action
      phase: 'Phase 3',
      description: 'Create a tailored mobile-first website concept demo before initiating contact.',
    },
    {
      id: 'generate_message',
      label: 'Generate Message',
      icon: Send,
      variant: 'outline' as const,
      phase: 'Phase 4',
      description: 'Draft personalized WhatsApp or email outreach citing the generated concept.',
    },
    {
      id: 'open_whatsapp',
      label: 'Open WhatsApp',
      icon: MessageCircle,
      variant: 'outline' as const,
      phase: 'Phase 4',
      description: 'Launch direct WhatsApp chat with pre-filled personalized conversion message.',
    },
    {
      id: 'schedule_follow_up',
      label: 'Schedule Follow-up',
      icon: Clock,
      variant: 'outline' as const,
      phase: 'Phase 4',
      description: 'Set follow-up reminder with secondary value addition hook.',
    },
    {
      id: 'create_proposal',
      label: 'Create Proposal',
      icon: FileText,
      variant: 'outline' as const,
      phase: 'Phase 5',
      description: 'Generate commercial contract and deposit link for approved scope.',
    },
  ];

  const currentActionDetails = actions.find((a) => a.id === activeModalAction);

  return (
    <>
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 py-2.5 px-4 sm:px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace Actions:
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 font-normal">
              Acquisition workflow priority hierarchy (Phases 2–5)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <Button
                  key={act.id}
                  variant={act.variant}
                  size="sm"
                  leftIcon={<Icon className="w-3.5 h-3.5" />}
                  onClick={() => setActiveModalAction(act.id)}
                  title={`${act.label} (${act.phase})`}
                >
                  <span>{act.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Dialog Notice */}
      <Modal
        isOpen={Boolean(activeModalAction)}
        onClose={() => setActiveModalAction(null)}
        title={currentActionDetails?.label || 'Action Notice'}
        subtitle={`Scheduled for implementation in ${currentActionDetails?.phase}.`}
        maxWidth="md"
        footer={
          <Button variant="primary" size="sm" onClick={() => setActiveModalAction(null)}>
            Understood
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Info className="w-4 h-4 text-red-600" />
              <span>Target Lead: {businessName}</span>
            </div>
            <p className="leading-relaxed">{currentActionDetails?.description}</p>
          </div>

          <div className="text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-800">
              Jigaway Acquisition Workflow Hierarchy:
            </p>
            <div className="space-y-1.5 pl-1">
              {ACQUISITION_ACTION_HIERARCHY.map((step) => (
                <div key={step.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <span className={step.id === activeModalAction ? 'font-bold text-red-600' : 'text-slate-600'}>
                    {step.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{step.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
