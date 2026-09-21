import React, { useState } from 'react';
import { Menu, Search, Bell, LogOut } from 'lucide-react';
import { Button } from '@/src/components/ui/Button.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { Modal } from '@/src/components/ui/Modal.tsx';

interface HeaderProps {
  onMenuToggle: () => void;
  onNavigateToLeads: () => void;
  pageLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onNavigateToLeads,
  pageLabel = 'Overview',
}) => {
  const { user, organization, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFindLeadsModalOpen, setIsFindLeadsModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 h-14 bg-white/95 backdrop-blur-xs border-b border-[#E8E9EC] px-4 sm:px-6 flex items-center justify-between">
        {/* Left Section: Mobile Menu + Small Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 text-[#6B7280] hover:text-[#171717] hover:bg-[#F7F7F8] rounded-md transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 stroke-[1.75]" />
          </button>

          <nav className="flex items-center gap-1.5 text-xs">
            <span className="text-[#98A1B2]">Jigaway</span>
            <span className="text-[#E8E9EC]">/</span>
            <span className="text-[#171717] font-medium">{pageLabel}</span>
          </nav>
        </div>

        {/* Right Section: Compact Search + Notification + Primary Find Leads Button + Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Compact search placeholder */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-[#98A1B2] absolute left-2.5 top-1/2 -translate-y-1/2 stroke-[1.75]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-44 lg:w-56 pl-8 pr-3 py-1 text-xs bg-[#F7F7F8] border border-[#E8E9EC] rounded-md text-[#171717] placeholder-[#98A1B2] focus:outline-none focus:border-[#171717] focus:bg-white transition-colors"
            />
          </div>

          {/* Notification icon */}
          <button
            title="Notifications"
            className="p-1.5 text-[#6B7280] hover:text-[#171717] hover:bg-[#F7F7F8] rounded-md transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 stroke-[1.75]" />
          </button>

          {/* Primary Action Button: Find Leads */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsFindLeadsModalOpen(true)}
          >
            Find Leads
          </Button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-[#E8E9EC] transition-all focus:outline-none"
              aria-expanded={isProfileOpen}
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center text-[11px] font-medium overflow-hidden">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{user?.full_name?.charAt(0) || 'T'}</span>
                )}
              </div>
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg border border-[#E8E9EC] py-1 z-40">
                  <div className="px-3.5 py-2 border-b border-[#E8E9EC]">
                    <p className="text-xs font-semibold text-[#171717]">{user?.full_name || 'Tariq Al-Mansoor'}</p>
                    <p className="text-[11px] text-[#6B7280] truncate">{user?.email || 'tariq@jigaway.com'}</p>
                    <p className="text-[10px] text-[#98A1B2] capitalize mt-0.5">
                      {organization?.name || 'Jigaway'} • {user?.role || 'owner'}
                    </p>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#E30613] hover:bg-red-50/60 rounded transition-colors text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Find Leads Scaffold Modal */}
      <Modal
        isOpen={isFindLeadsModalOpen}
        onClose={() => setIsFindLeadsModalOpen(false)}
        title="Find Leads"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsFindLeadsModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsFindLeadsModalOpen(false);
                onNavigateToLeads();
              }}
            >
              Go to Leads
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-1">
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Lead search engine will query Gulf markets (Dubai, Abu Dhabi, Riyadh, Doha) to surface businesses with high digital expansion potential.
          </p>
          <div className="p-3 bg-[#F7F7F8] border border-[#E8E9EC] rounded-md text-xs text-[#171717] space-y-1">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#98A1B2] block">
              Search parameters
            </span>
            <p className="text-xs text-[#6B7280]">
              Serper query integration scheduled for lead discovery across selected Gulf business categories.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
