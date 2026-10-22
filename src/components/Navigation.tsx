import React from 'react';

export type TabType = 'buat-struk' | 'preview-dan-cetak' | 'riwayat-struk' | 'pengaturan-printer-dan-spbu';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  historyBadgeCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  historyBadgeCount,
}) => {
  const tabs = [
    {
      id: 'buat-struk' as TabType,
      label: 'Buat Struk',
      icon: 'receipt_long',
    },
    {
      id: 'preview-dan-cetak' as TabType,
      label: 'Preview & Cetak',
      icon: 'print',
    },
    {
      id: 'riwayat-struk' as TabType,
      label: 'Riwayat',
      icon: 'history',
      badge: historyBadgeCount,
    },
    {
      id: 'pengaturan-printer-dan-spbu' as TabType,
      label: 'Pengaturan',
      icon: 'tune',
    },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#faf8ff]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)] border-t border-[#eaedff]">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-[#bb0013] font-bold'
                  : 'text-[#5e3f3c] hover:text-[#131b2e]'
              }`}
              type="button"
            >
              <div className="relative">
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    isActive ? 'scale-105' : ''
                  }`}
                >
                  {tab.icon}
                </span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 bg-[#bb0013] text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="font-body text-[10.5px] tracking-tight mt-0.5 text-center leading-tight truncate w-full px-0.5 font-medium">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-[#bb0013] rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
