import React, { useState } from 'react';
import { Company, AppUser, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  Clock, 
  LogOut, 
  User, 
  Sparkles,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Search
} from 'lucide-react';

interface HeaderProps {
  currentCompany: Company;
  currentUser: AppUser | null;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onToggleMobileSidebar: () => void;
  isSuperAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentCompany,
  currentUser,
  currentLang,
  onLanguageChange,
  onOpenAuth,
  onLogout,
  onToggleMobileSidebar,
  isSuperAdmin,
}) => {
  const t = getTranslation(currentLang);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate days remaining in trial if applicable
  const getDaysRemaining = () => {
    if (currentCompany.status !== 'trial' || !currentCompany.trialEndDate) return null;
    const end = new Date(currentCompany.trialEndDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 3600 * 24));
    return Math.max(0, diffDays);
  };

  const daysLeft = getDaysRemaining();

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0">
      
      {/* Left / Start: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div className="relative hidden md:block">
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder={currentLang === 'ar' ? 'بحث عن فاتورة، عميل، أو شاحنة...' : 'Search invoice, customer or mixer...'}
            className="w-72 lg:w-80 h-10 bg-gray-100/90 hover:bg-gray-100 focus:bg-white rounded-full ps-10 pe-4 text-xs font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-orange-200 transition-all border border-transparent focus:border-orange-300"
          />
          <Search className="w-4 h-4 absolute start-3.5 top-3 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
            {currentCompany.name.charAt(0)}
          </div>
          <span className="font-bold text-sm text-gray-800 truncate max-w-[120px]">{currentCompany.name}</span>
        </div>
      </div>

      {/* Right / End: Status Badge, Language Toggle, User Menu */}
      <div className="flex items-center gap-3">
        
        {/* Offline / Online Network Indicator */}
        <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
          isOnline 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-amber-50 text-amber-800 border-amber-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{isOnline ? 'متصل (سحابياً & محلياً)' : 'وضع بدون إنترنت (أوفلاين)'}</span>
        </div>

        {/* Account Status Badge */}
        {currentCompany.status === 'trial' ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.trialPeriod}: {daysLeft !== null ? `${daysLeft} ${t.daysRemaining}` : ''}</span>
          </div>
        ) : currentCompany.status === 'active' ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span>{t.activeAccount}</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>{t.suspendedAccount}</span>
          </div>
        )}

        {/* Company Title */}
        <div className="hidden xl:block text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          {currentCompany.name}
        </div>

        {/* Language Switcher */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => onLanguageChange('ar')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              currentLang === 'ar'
                ? 'bg-white rounded-md shadow-2xs text-orange-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            AR
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('fr')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              currentLang === 'fr'
                ? 'bg-white rounded-md shadow-2xs text-orange-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            FR
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              currentLang === 'en'
                ? 'bg-white rounded-md shadow-2xs text-orange-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            EN
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

        {/* Account / Auth Button */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col text-start">
              <span className="text-xs font-bold text-gray-800 max-w-[140px] truncate">{currentUser.displayName || currentUser.email}</span>
              <span className="text-[10px] font-semibold text-gray-400">{currentUser.role === 'superadmin' ? t.superAdminRole : currentUser.role}</span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title={t.logout}
              className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-2xs transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>{t.login}</span>
          </button>
        )}

      </div>
    </header>
  );
};

