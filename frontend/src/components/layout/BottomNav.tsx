import React from 'react';
import { LayoutDashboard, CalendarDays, ClipboardList, Users, IndianRupee } from 'lucide-react';

export type NavTab = 'dashboard' | 'events' | 'calendar' | 'customers' | 'finance';

interface Props {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<Props> = ({ currentTab, onChangeTab }) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Today', icon: LayoutDashboard },
    { id: 'events' as NavTab, label: 'Orders', icon: ClipboardList },
    { id: 'calendar' as NavTab, label: 'Calendar', icon: CalendarDays },
    { id: 'customers' as NavTab, label: 'Clients', icon: Users },
    { id: 'finance' as NavTab, label: 'Finance', icon: IndianRupee },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-3xl mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
