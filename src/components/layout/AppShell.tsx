import React, { useState, useEffect } from 'react';
import { NavRoute } from '@/src/types/index.ts';
import { Lead } from '@/src/types/database.ts';
import { Sidebar } from './Sidebar.tsx';
import { Header } from './Header.tsx';
import { DashboardPage } from '@/src/pages/DashboardPage.tsx';
import { LeadsPage } from '@/src/pages/LeadsPage.tsx';
import { OpportunitiesPage } from '@/src/pages/OpportunitiesPage.tsx';
import { ConceptsPage } from '@/src/pages/ConceptsPage.tsx';
import { OutreachPage } from '@/src/pages/OutreachPage.tsx';
import { ClientsPage } from '@/src/pages/ClientsPage.tsx';
import { AnalyticsPage } from '@/src/pages/AnalyticsPage.tsx';
import { SettingsPage } from '@/src/pages/SettingsPage.tsx';
import { FutureBuildPage } from '@/src/pages/FutureBuildPage.tsx';
import { LeadWorkspace } from '@/src/components/leads/LeadWorkspace.tsx';
import { leadRepository } from '@/src/lib/services/leadRepository.ts';
import { useAuth } from '@/src/context/AuthContext.tsx';

export const AppShell: React.FC = () => {
  const { session } = useAuth();
  const orgId = session?.organization?.id || 'org_default';

  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!selectedLeadId) {
      setSelectedLead(null);
      return;
    }
    let isMounted = true;
    leadRepository.getLeadById(orgId, selectedLeadId).then((lead) => {
      if (isMounted && lead) {
        setSelectedLead(lead);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedLeadId, orgId]);

  const handleNavigate = (route: NavRoute) => {
    setSelectedLeadId(null);
    setSelectedLead(null);
    setCurrentRoute(route);
  };

  const handleSelectLead = async (leadId: string) => {
    setSelectedLeadId(leadId);
    const lead = await leadRepository.getLeadById(orgId, leadId);
    if (lead) {
      setSelectedLead(lead);
    }
  };

  const handleBackFromLead = () => {
    setSelectedLeadId(null);
    setSelectedLead(null);
  };

  const handleLeadUpdated = (updated: Lead) => {
    setSelectedLead(updated);
  };


  const routeLabels: Record<NavRoute, string> = {
    dashboard: 'Overview',
    leads: 'Leads',
    opportunities: 'Opportunities',
    concepts: 'Concepts',
    outreach: 'Outreach',
    clients: 'Clients',
    analytics: 'Analytics',
    settings: 'Settings',
    future: 'Future Build',
    'lead-workspace': 'Lead Workspace',
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex text-[#171717]">
      {/* Navigation Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onRouteChange={handleNavigate}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        {/* Top Header */}
        <Header
          pageLabel={selectedLeadId ? 'Lead Workspace' : routeLabels[currentRoute]}
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onNavigateToLeads={() => handleNavigate('leads')}
        />

        {/* Dynamic Route View or Lead Workspace */}
        <main className="flex-1">
          {selectedLeadId ? (
            <LeadWorkspace
              lead={selectedLead}
              orgId={orgId}
              onBack={handleBackFromLead}
              onLeadUpdated={handleLeadUpdated}
            />
          ) : (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {currentRoute === 'dashboard' && (
                <DashboardPage onNavigateToLead={handleSelectLead} />
              )}
              {currentRoute === 'leads' && (
                <LeadsPage onSelectLead={handleSelectLead} />
              )}
              {currentRoute === 'opportunities' && (
                <OpportunitiesPage onSelectLead={handleSelectLead} />
              )}
              {currentRoute === 'concepts' && (
                <ConceptsPage onNavigateToLeads={() => handleNavigate('leads')} />
              )}
              {currentRoute === 'outreach' && (
                <OutreachPage onNavigateToLeads={() => handleNavigate('leads')} />
              )}
              {currentRoute === 'clients' && (
                <ClientsPage onNavigateToLeads={() => handleNavigate('leads')} />
              )}
              {currentRoute === 'analytics' && (
                <AnalyticsPage onNavigateToLeads={() => handleNavigate('leads')} />
              )}
              {currentRoute === 'settings' && <SettingsPage />}
              {currentRoute === 'future' && <FutureBuildPage />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
