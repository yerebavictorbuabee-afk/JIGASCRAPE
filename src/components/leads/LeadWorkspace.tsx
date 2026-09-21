import React, { useState, useEffect } from 'react';
import {
  Info,
  Award,
  StickyNote,
  Activity,
  Sparkles,
  ExternalLink,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle2,
  AlertTriangle,
  Building,
  Edit2,
  Lock,
} from 'lucide-react';
import { Lead, LeadScoreSignal, LeadActivity, LeadNote, PipelineStage } from '@/src/types/database.ts';
import { LeadHeader } from './LeadHeader.tsx';
import { LeadQualificationView } from './LeadQualificationView.tsx';
import { LeadNotesView } from './LeadNotesView.tsx';
import { LeadActivityView } from './LeadActivityView.tsx';
import { leadRepository } from '@/src/lib/services/leadRepository.ts';

interface LeadWorkspaceProps {
  lead: Lead | null;
  orgId: string;
  onBack: () => void;
  onLeadUpdated: (updatedLead: Lead) => void;
}

type WorkspaceTab = 'overview' | 'qualification' | 'notes' | 'activity' | 'future_phases';

export const LeadWorkspace: React.FC<LeadWorkspaceProps> = ({
  lead: initialLead,
  orgId,
  onBack,
  onLeadUpdated,
}) => {
  const [lead, setLead] = useState<Lead | null>(initialLead);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [signals, setSignals] = useState<LeadScoreSignal[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit lead modal state
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (!initialLead) return;
    setLead(initialLead);
    loadLeadDetails(initialLead.id);
  }, [initialLead?.id]);

  const loadLeadDetails = async (leadId: string) => {
    setIsLoading(true);
    try {
      const [fetchedSignals, fetchedActivities, fetchedNotes] = await Promise.all([
        leadRepository.getSignalsForLead(orgId, leadId),
        leadRepository.getActivities(orgId, leadId),
        leadRepository.getNotes(orgId, leadId),
      ]);
      setSignals(fetchedSignals);
      setActivities(fetchedActivities);
      setNotes(fetchedNotes);
    } finally {
      setIsLoading(false);
    }
  };

  if (!lead) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-[#98A1B2] mx-auto mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#171717]">Lead Record Not Found</h2>
        <p className="text-xs text-[#6B7280] mt-1 max-w-md mx-auto">
          The requested lead workspace does not exist or has been removed from your organization scope.
        </p>
        <div className="mt-6">
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-medium text-[#171717] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB]"
          >
            Return to Leads
          </button>
        </div>
      </div>
    );
  }

  const handleStageChange = async (newStage: PipelineStage) => {
    const updated = await leadRepository.updateLead(orgId, lead.id, {
      pipeline_stage: newStage,
    });
    if (updated) {
      setLead(updated);
      onLeadUpdated(updated);
      const acts = await leadRepository.getActivities(orgId, lead.id);
      setActivities(acts);
    }
  };

  const handleArchiveToggle = async () => {
    await leadRepository.archiveLead(orgId, lead.id);
    const refreshed = await leadRepository.getLeadById(orgId, lead.id);
    if (refreshed) {
      setLead(refreshed);
      onLeadUpdated(refreshed);
      const acts = await leadRepository.getActivities(orgId, lead.id);
      setActivities(acts);
    }
  };

  const handleRecalculateScore = async () => {
    const updated = await leadRepository.recalculateScore(orgId, lead.id);
    if (updated) {
      setLead(updated);
      onLeadUpdated(updated);
      const [sigs, acts] = await Promise.all([
        leadRepository.getSignalsForLead(orgId, lead.id),
        leadRepository.getActivities(orgId, lead.id),
      ]);
      setSignals(sigs);
      setActivities(acts);
    }
  };

  const handleUpdateSignal = async (
    signalKey: string,
    status: 'confirmed' | 'not_present' | 'unknown',
    evidence?: string
  ) => {
    const res = await leadRepository.updateSignal(orgId, lead.id, signalKey, status, evidence);
    setLead(res.lead);
    setSignals(res.signals);
    onLeadUpdated(res.lead);
    const acts = await leadRepository.getActivities(orgId, lead.id);
    setActivities(acts);
  };

  const handleAddNote = async (content: string) => {
    await leadRepository.addNote(orgId, lead.id, content);
    const [fetchedNotes, fetchedActs] = await Promise.all([
      leadRepository.getNotes(orgId, lead.id),
      leadRepository.getActivities(orgId, lead.id),
    ]);
    setNotes(fetchedNotes);
    setActivities(fetchedActs);
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    await leadRepository.updateNote(orgId, noteId, content);
    const fetchedNotes = await leadRepository.getNotes(orgId, lead.id);
    setNotes(fetchedNotes);
  };

  const handleDeleteNote = async (noteId: string) => {
    await leadRepository.deleteNote(orgId, noteId);
    const fetchedNotes = await leadRepository.getNotes(orgId, lead.id);
    setNotes(fetchedNotes);
  };

  const handleSaveLeadEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await leadRepository.updateLead(orgId, lead.id, editFormData);
    if (updated) {
      setLead(updated);
      onLeadUpdated(updated);
      setIsEditingLead(false);
      const acts = await leadRepository.getActivities(orgId, lead.id);
      setActivities(acts);
    }
  };

  const tabs: { id: WorkspaceTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: 'Lead Overview', icon: Info },
    { id: 'qualification', label: 'Qualification & Score', icon: Award, badge: `${lead.opportunity_score}/30` },
    { id: 'notes', label: 'Team Notes', icon: StickyNote, badge: notes.length > 0 ? String(notes.length) : undefined },
    { id: 'activity', label: 'Audit Activity', icon: Activity, badge: activities.length > 0 ? String(activities.length) : undefined },
    { id: 'future_phases', label: 'Concept & Outreach', icon: Sparkles, badge: 'Phase 3' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Lead Header with /30 score & Stage Select */}
      <LeadHeader
        lead={lead}
        onBack={onBack}
        onStageChange={handleStageChange}
        onArchiveToggle={handleArchiveToggle}
        onRecalculateScore={handleRecalculateScore}
      />

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-[#E8E9EC] sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#E30613] text-[#E30613] bg-red-50/20'
                    : 'border-transparent text-[#6B7280] hover:text-[#171717] hover:bg-[#F9FAFB]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isActive
                        ? 'bg-[#E30613] text-white'
                        : tab.badge === 'Phase 3'
                        ? 'bg-zinc-100 text-zinc-600'
                        : 'bg-[#F3F4F6] text-[#374151]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspace Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Business Overview Card */}
              <div className="bg-white rounded-xl border border-[#E8E9EC] p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8E9EC]">
                  <h3 className="text-sm font-semibold text-[#171717]">Commercial Business Profile</h3>
                  <button
                    onClick={() => {
                      setEditFormData({
                        business_name: lead.business_name,
                        category_name: lead.category_name,
                        city: lead.city,
                        country: lead.country,
                        address: lead.address,
                        phone: lead.phone,
                        email: lead.email,
                        website_url: lead.website_url,
                        business_description: lead.business_description,
                      });
                      setIsEditingLead(true);
                    }}
                    className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#171717] font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Lead Info</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[#6B7280] block mb-1">Business Description</span>
                    <p className="text-[#374151] leading-relaxed bg-[#F9FAFB] p-3 rounded-lg border border-[#E8E9EC]">
                      {lead.business_description || 'No business description provided by source.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-[#6B7280] block mb-0.5">Physical Address</span>
                      <span className="font-medium text-[#171717] block">
                        {lead.address || 'Not available'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block mb-0.5">Market Location</span>
                      <span className="font-medium text-[#171717] block">
                        {lead.city}, {lead.country} ({lead.country_code})
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block mb-0.5">Phone Number</span>
                      <span className="font-medium text-[#171717] font-mono block">
                        {lead.phone || 'Not available'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block mb-0.5">Direct Email</span>
                      <span className="font-medium text-[#171717] block">
                        {lead.email || 'Not available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Source & Metadata */}
              <div className="bg-white rounded-xl border border-[#E8E9EC] p-5 shadow-2xs">
                <h3 className="text-sm font-semibold text-[#171717] pb-3 mb-4 border-b border-[#E8E9EC]">
                  Source Provenance & External IDs
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#6B7280] block mb-0.5">Discovery Provider</span>
                    <span className="font-semibold text-[#171717] capitalize">{lead.source}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block mb-0.5">External Result ID</span>
                    <span className="font-mono text-[#374151] truncate block">
                      {lead.source_external_id || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block mb-0.5">Discovered On</span>
                    <span className="text-[#374151] block">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {lead.source_metadata && (
                  <div className="mt-4 pt-3 border-t border-[#E8E9EC]">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">
                      Raw Provider Metadata
                    </span>
                    <pre className="text-[11px] font-mono bg-[#F9FAFB] p-3 rounded-lg border border-[#E8E9EC] text-[#374151] overflow-x-auto max-h-36">
                      {JSON.stringify(lead.source_metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Side Column: Operating Hours & Reputation */}
            <div className="space-y-6">
              {/* Reputation & Google Review Details */}
              <div className="bg-white rounded-xl border border-[#E8E9EC] p-5 shadow-2xs">
                <h3 className="text-sm font-semibold text-[#171717] pb-3 mb-3 border-b border-[#E8E9EC]">
                  Public Reputation
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E8E9EC]">
                    <span className="text-[#6B7280]">Google Rating:</span>
                    {lead.google_rating != null ? (
                      <span className="font-bold text-base text-[#171717] flex items-center gap-1">
                        ★ {lead.google_rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-[#98A1B2]">Not available</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E8E9EC]">
                    <span className="text-[#6B7280]">Total Reviews:</span>
                    <span className="font-bold text-base text-[#171717]">
                      {lead.review_count}
                    </span>
                  </div>
                  {lead.google_maps_url && (
                    <a
                      href={lead.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-[#374151] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E8E9EC] rounded-lg transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#E30613]" />
                      <span>View Google Maps Listing</span>
                      <ExternalLink className="w-3 h-3 text-[#6B7280]" />
                    </a>
                  )}
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-white rounded-xl border border-[#E8E9EC] p-5 shadow-2xs">
                <h3 className="text-sm font-semibold text-[#171717] pb-3 mb-3 border-b border-[#E8E9EC]">
                  Operating Schedule
                </h3>
                {lead.opening_hours && Object.keys(lead.opening_hours).length > 0 ? (
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(lead.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between py-1 border-b border-[#F3F4F6] last:border-0">
                        <span className="font-medium text-[#6B7280]">{day}</span>
                        <span className="font-mono text-[#171717]">{hours}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#98A1B2] italic">
                    No operating hours provided by source listing.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qualification' && (
          <LeadQualificationView
            lead={lead}
            signals={signals}
            onUpdateSignal={handleUpdateSignal}
            onRecalculateScore={handleRecalculateScore}
          />
        )}

        {activeTab === 'notes' && (
          <LeadNotesView
            notes={notes}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {activeTab === 'activity' && (
          <LeadActivityView activities={activities} />
        )}

        {activeTab === 'future_phases' && (
          <div className="bg-white rounded-xl border border-[#E8E9EC] p-8 max-w-2xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-[#171717] mx-auto">
              <Lock className="w-5 h-5 text-[#6B7280]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171717]">
                AI Concept & Direct Outreach Engine
              </h3>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto mt-1 leading-relaxed">
                Automated mobile website concept generation, WhatsApp pitch drafts, and client proposal links will be unlocked in Phase 3. No fake mockups or simulated messages are generated.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2 text-xs">
              <button
                disabled
                className="px-3.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#98A1B2] font-medium cursor-not-allowed"
              >
                Generate Free Value Concept (Phase 3)
              </button>
              <button
                disabled
                className="px-3.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#98A1B2] font-medium cursor-not-allowed"
              >
                Launch WhatsApp Pitch (Phase 4)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Lead Modal */}
      {isEditingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E8E9EC] shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8E9EC] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#171717]">Edit Lead Details</h3>
              <button
                onClick={() => setIsEditingLead(false)}
                className="text-[#6B7280] hover:text-[#171717]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLeadEdit} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-[#374151] mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.business_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, business_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Category</label>
                  <input
                    type="text"
                    value={editFormData.category_name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, category_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#374151] mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Country</label>
                  <input
                    type="text"
                    value={editFormData.country || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#374151] mb-1">Address</label>
                <input
                  type="text"
                  value={editFormData.address || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Website URL</label>
                  <input
                    type="text"
                    value={editFormData.website_url || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, website_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#374151] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editFormData.business_description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, business_description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E9EC] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E9EC] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingLead(false)}
                  className="px-3 py-1.5 border border-[#E8E9EC] rounded-lg text-[#374151]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#171717] text-white font-medium rounded-lg hover:bg-black"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
