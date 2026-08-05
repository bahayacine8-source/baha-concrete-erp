import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  LayoutDashboard, 
  Factory,
  RefreshCw,
  Users, 
  Truck, 
  Store, 
  Boxes, 
  Users2, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'production'
  | 'users'
  | 'workers'
  | 'vehicles'
  | 'suppliers'
  | 'inventory'
  | 'customers'
  | 'reports'
  | 'sync'
  | 'settings'
  | 'audit'
  | 'superadmin';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentLang: Language;
  isSuperAdmin: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentLang,
  isSuperAdmin,
  isOpenMobile,
  onCloseMobile,
}) => {
  const t = getTranslation(currentLang);
  const isRtl = currentLang === 'ar';

  const navItems = [
    { id: 'dashboard' as NavTab, label: t.dashboard, icon: LayoutDashboard, shortcut: 'F1' },
    { id: 'production' as NavTab, label: 'أوامر الإنتاج والخلط', icon: Factory, shortcut: 'F2' },
    { id: 'customers' as NavTab, label: t.customers, icon: Users2, shortcut: 'F3' },
    { id: 'suppliers' as NavTab, label: t.suppliers, icon: Store, shortcut: 'F4' },
    { id: 'inventory' as NavTab, label: t.inventory, icon: Boxes, shortcut: 'F5' },
    { id: 'vehicles' as NavTab, label: t.vehicles, icon: Truck, shortcut: 'F6' },
    { id: 'workers' as NavTab, label: t.workers, icon: Users2, shortcut: 'F7' },
    { id: 'reports' as NavTab, label: t.reports, icon: BarChart3, shortcut: 'F8' },
    { id: 'users' as NavTab, label: 'المستخدمون والصلاحيات', icon: Users, shortcut: 'F9' },
    { id: 'settings' as NavTab, label: t.settings, icon: Settings, shortcut: 'F10' },
  ];

  if (isSuperAdmin) {
    navItems.push(
      { id: 'sync' as NavTab, label: 'جدول المزامنة (sync_queue)', icon: RefreshCw, shortcut: 'F11' },
      { id: 'audit' as NavTab, label: 'سجل الأمان والتدقيق (Audit Logs)', icon: ShieldCheck, shortcut: 'F12' },
      { id: 'superadmin' as NavTab, label: t.superAdmin, icon: ShieldAlert, shortcut: 'Admin' }
    );
  }

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs">
          C
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight text-gray-800">{t.appTitle}</h1>
          <p className="text-[11px] text-orange-500 font-semibold uppercase tracking-wider">{t.dashboard}</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isSpecialAdmin = item.id === 'superadmin';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                isActive
                  ? isSpecialAdmin
                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                    : 'text-orange-600 bg-orange-50 font-bold'
                  : isSpecialAdmin
                  ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 transition-colors'
              }`}
            >
              {isActive && !isSpecialAdmin ? (
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
              ) : (
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : isSpecialAdmin ? 'text-amber-600' : 'text-gray-400'}`} />
              )}
              <span className="truncate flex-1 text-start">{item.label}</span>
              {item.shortcut && (
                <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                  isActive 
                    ? 'bg-orange-200 text-orange-900 border border-orange-300' 
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <button
          type="button"
          onClick={() => handleTabClick('settings')}
          className="w-full py-2.5 text-xs font-semibold bg-white border border-gray-200 rounded-xl shadow-2xs text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          <span>{t.companySettings}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-e border-gray-200 shrink-0 shadow-xs min-h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile} 
          />
          <div className="relative flex-1 max-w-xs w-full bg-white h-full shadow-2xl flex flex-col z-10">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <span className="font-bold text-gray-800 text-base">{t.appTitle}</span>
              <button 
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

