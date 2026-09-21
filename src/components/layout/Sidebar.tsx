import React from 'react';
import {
  LayoutDashboard,
  Users,
  CircleCheck,
  LayoutTemplate,
  Send,
  BadgeCheck,
  BarChart3,
  Settings,
  Sparkles,
  X,
  LogOut,
} from 'lucide-react';
import { NavRoute } from '@/src/types/index.ts';
import { useAuth } from '@/src/context/AuthContext.tsx';

interface SidebarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  isOpen,
  onClose,
}) => {
  const { user, organization, logout } = useAuth();

  const primaryNavItems: { id: NavRoute; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'opportunities', label: 'Opportunities', icon: CircleCheck },
    { id: 'concepts', label: 'Concepts', icon: LayoutTemplate },
    { id: 'outreach', label: 'Outreach', icon: Send },
    { id: 'clients', label: 'Clients', icon: BadgeCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (route: NavRoute) => {
    onRouteChange(route);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Permanent Desktop Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-60 bg-white text-[#171717] flex flex-col border-r border-[#E8E9EC] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-[#E8E9EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#E30613] flex items-center justify-center text-white text-[11px] font-bold tracking-tight shadow-2xs">
              J
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-[#171717]">Jigaway</span>
              <span className="text-[10px] font-medium tracking-wide text-[#98A1B2] uppercase">
                Gulf
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-[#6B7280] hover:text-[#171717] rounded-md"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-2.5 pb-2 text-[11px] font-medium uppercase tracking-wider text-[#98A1B2]">
            Acquisition
          </div>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors duration-150 relative text-left ${
                  isActive
                    ? 'bg-[#F7F7F8] text-[#171717] font-medium'
                    : 'text-[#6B7280] hover:text-[#171717] hover:bg-[#F7F7F8]'
                }`}
              >
                {/* Red subtle active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#E30613] rounded-r" />
                )}
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 stroke-[1.75] transition-colors ${
                    isActive
                      ? 'text-[#171717]'
                      : 'text-[#98A1B2] group-hover:text-[#6B7280]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Area: Future Build + User Profile */}
        <div className="border-t border-[#E8E9EC] p-2 space-y-1">
          {/* Quieter Secondary Link for Future Build */}
          <button
            onClick={() => handleNav('future')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
              currentRoute === 'future'
                ? 'bg-[#F7F7F8] text-[#171717] font-medium'
                : 'text-[#98A1B2] hover:text-[#6B7280] hover:bg-[#F7F7F8]'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 stroke-[1.75]" />
            <span className="truncate">Future Build</span>
          </button>

          {/* User Profile bar */}
          <div className="pt-2 mt-1 border-t border-[#E8E9EC]/60 px-2 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#F7F7F8] border border-[#E8E9EC] flex items-center justify-center text-[11px] font-medium text-[#171717] shrink-0">
                {user?.full_name?.charAt(0) || 'T'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#171717] truncate leading-tight">
                  {user?.full_name || 'Tariq Al-Mansoor'}
                </p>
                <p className="text-[11px] text-[#98A1B2] truncate leading-tight">
                  {organization?.name || 'Jigaway'}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign out"
              className="p-1.5 text-[#98A1B2] hover:text-[#E30613] hover:bg-red-50/60 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
