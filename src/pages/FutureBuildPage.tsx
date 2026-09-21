import React from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge.tsx';

export const FutureBuildPage: React.FC = () => {
  // 16 intentionally deferred capabilities requested by prompt:
  const futureCapabilities = [
    { title: 'Automated lead discovery', phase: 'Phase 2', domain: 'Lead Engine' },
    { title: 'More business-data providers', phase: 'Phase 2', domain: 'Lead Engine' },
    { title: 'Automated website screenshots', phase: 'Phase 2', domain: 'Audit & Analysis' },
    { title: 'Advanced website audits', phase: 'Phase 2', domain: 'Audit & Analysis' },
    { title: 'AI-generated landing pages', phase: 'Phase 3', domain: 'Free-Value Concepts' },
    { title: 'AI-generated proposal PDFs', phase: 'Phase 5', domain: 'Commercials' },
    { title: 'CRM integrations', phase: 'Phase 5', domain: 'Integrations' },
    { title: 'Personalized email outreach templates', phase: 'Phase 4', domain: 'Outreach Engine' },
    { title: 'Manual WhatsApp click-to-chat links', phase: 'Phase 4', domain: 'Outreach Engine' },
    { title: 'Manual follow-up schedules & logging', phase: 'Phase 4', domain: 'Cadence Engine' },
    { title: 'AI sales assistant', phase: 'Phase 4', domain: 'Intelligence' },
    { title: 'Historical-conversion lead prioritization', phase: 'Phase 5', domain: 'Intelligence' },
    { title: 'Automated reporting', phase: 'Phase 5', domain: 'Analytics' },
    { title: 'Client onboarding', phase: 'Phase 5', domain: 'Client Retention' },
    { title: 'Commercial proposal generation', phase: 'Phase 5', domain: 'Commercials' },
    { title: 'Project management', phase: 'Phase 5', domain: 'Delivery' },
  ];

  const coreMvpWorkflow = [
    'Find / Import Leads',
    'Score',
    'Analyze',
    'Create Free Value',
    'Outreach',
    'Follow Up',
    'Convert',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E9EC]">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717] tracking-tight">Future Build Roadmap</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Deliberate architectural boundaries: capabilities scheduled for subsequent build phases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#98A1B2]">Current: Phase 1 (Foundation)</span>
        </div>
      </div>

      {/* Core MVP Workflow Focus Banner */}
      <div className="p-5 rounded-lg bg-white border border-[#E8E9EC] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E30613]" />
            <h2 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
              Current Build Focus: Core MVP Acquisition Workflow
            </h2>
          </div>
          <span className="text-xs font-medium text-[#E30613] bg-red-50 px-2 py-0.5 rounded border border-red-200">
            Phase 1 Active
          </span>
        </div>

        <p className="text-xs text-[#6B7280] leading-relaxed max-w-3xl">
          We are intentionally not building bloated multi-module CRM distractions. The application architecture is hyper-focused on validating the single high-intent acquisition path for Jigaway:
        </p>

        {/* Workflow Chain */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          {coreMvpWorkflow.map((step, idx) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#171717] text-white text-xs font-medium">
                <span className="text-red-400 font-bold">{idx + 1}.</span>
                <span>{step}</span>
              </div>
              {idx < coreMvpWorkflow.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-[#98A1B2] shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Deferred Capabilities Table */}
      <div className="bg-white rounded-lg border border-[#E8E9EC] overflow-hidden">
        <div className="p-4 border-b border-[#E8E9EC] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#171717]">Intentionally Deferred Capabilities</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              These features are structurally scaffolded in the database schema and service provider interfaces, ready for future phases.
            </p>
          </div>
          <span className="text-xs text-[#98A1B2]">16 Capabilities</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {futureCapabilities.map((cap, i) => (
            <div
              key={i}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-mono shrink-0">
                  {i + 1}
                </div>
                <span className="font-semibold text-slate-800">{cap.title}</span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {cap.domain}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    cap.phase === 'Phase 2'
                      ? 'bg-amber-100 text-amber-900'
                      : cap.phase === 'Phase 3'
                      ? 'bg-purple-100 text-purple-900'
                      : cap.phase === 'Phase 4'
                      ? 'bg-sky-100 text-sky-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {cap.phase}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
