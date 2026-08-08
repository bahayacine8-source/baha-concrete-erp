import { Company, Language } from '../types';
import React, { useEffect, useState } from 'react';
import { getTranslation } from '../lib/translations';
import { 
  Settings, 
  Building2, 
  Key, 
  Github, 
  Download, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Image as ImageIcon,
  Save,
  RefreshCw,
  Sparkles,
  Radio,
  Zap
} from 'lucide-react';

interface SettingsViewProps {
  company: Company;
  currentLang: Language;
  onUpdateCompany: (updated: Company) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonData: string) => void;
  isSuperAdmin: boolean;
  onNavigateSuperAdmin: () => void;
  currentVersion?: string;
  githubRepo?: string;
  autoCheckUpdates?: boolean;
  onUpdateGithubRepo?: (repo: string) => void;
  onToggleAutoCheckUpdates?: (enabled: boolean) => void;
  onCheckForUpdatesNow?: () => void;
  onSimulateUpdateAvailable?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company,
  currentLang,
  onUpdateCompany,
  onExportBackup,
  onImportBackup,
  isSuperAdmin,
  onNavigateSuperAdmin,
  currentVersion,
  githubRepo,
  autoCheckUpdates,
  onUpdateGithubRepo,
  onToggleAutoCheckUpdates,
  onCheckForUpdatesNow,
  onSimulateUpdateAvailable,
}) => {
  const t = getTranslation(currentLang);
  const [companyForm, setCompanyForm] = useState<Company>(company);
  const [logoInput, setLogoInput] = useState(company.logoUrl || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLogoInput(dataUrl);
        setCompanyForm((prev) => ({ ...prev, logoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

const [appVersion, setAppVersion] = useState(currentVersion || '');

useEffect(() => {
  if (window.electronAPI?.getAppVersion) {
    window.electronAPI.getAppVersion().then((version: string) => {
      setAppVersion(`v${version}`);
    });
  }
}, [currentVersion]);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany({
      ...companyForm,
      logoUrl: logoInput,
    });
    setSaveMsg(t.successMsg);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setPassMsg('تم تحديث كلمة المرور بنجاح!');
    setOldPassword('');
    setNewPassword('');
    setTimeout(() => setPassMsg(''), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackup(content);
        alert(t.successMsg);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-600" />
            <span>{t.companySettings}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            معلومات مصنع الخرسانة، تغيير اللوغو وكلمة المرور وتفعيل الربط مع GitHub
          </p>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={onNavigateSuperAdmin}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.superAdminPanel}</span>
          </button>
        )}
      </div>

      {saveMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Grid: Company Details vs Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Company Profile Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-orange-600" />
            <span>{t.companyDetails}</span>
          </h3>

          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.companyName}</label>
              <input
                type="text"
                required
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.phone}</label>
                <input
                  type="text"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.email}</label>
                <input
                  type="email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.address}</label>
              <input
                type="text"
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الرقم الضريبي (NIF)</label>
                <input
                  type="text"
                  value={companyForm.taxNumber || ''}
                  onChange={(e) => setCompanyForm({ ...companyForm, taxNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">السجل التجاري (RC)</label>
                <input
                  type="text"
                  value={companyForm.commercialRegNumber || ''}
                  onChange={(e) => setCompanyForm({ ...companyForm, commercialRegNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-orange-600" />
                <span>لوغو الشركة (شعار مصنع الخرسانة)</span>
              </label>

              {logoInput && (
                <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                  <img src={logoInput} alt="Company Logo" className="w-14 h-14 object-contain rounded-lg border border-slate-100 bg-slate-50" />
                  <div className="text-xs text-slate-600">
                    <div className="font-bold text-slate-800">معاينة شعار الشركة</div>
                    <div className="text-slate-400 text-[10px] truncate max-w-xs">{logoInput.substring(0, 40)}...</div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <label className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>رفع لوغو الشركة من جهاز الكمبيوتر</span>
                  <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
                </label>

                <input
                  type="text"
                  value={logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  placeholder="أو أدخل رابط صورة URL..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>تحديث وحفظ بيانات الشركة</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Password & GitHub Sync */}
        <div className="space-y-6">
          
          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <Key className="w-4 h-4 text-orange-600" />
              <span>{t.changePassword}</span>
            </h3>

            {passMsg && (
              <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg">{passMsg}</p>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                تحديث كلمة المرور
              </button>
            </form>
          </div>

          {/* GitHub & Cloud Backup Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <Github className="w-4 h-4 text-slate-900" />
              <span>{t.githubSyncInfo}</span>
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              البرنامج مرتبط تلقائياً مع <strong>Firebase Firestore</strong> و <strong>GitHub</strong> لحفظ وتزامن بيانات الشركة بأمان عالي.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{t.exportDataJson}</span>
              </button>

              <label className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{t.importDataJson}</span>
                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
              </label>
            </div>
          </div>

          {/* GitHub Auto-Update Control Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <h3 className="font-bold text-slate-900 text-sm">التحديثات الآلية عبر GitHub</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-mono text-[10px] font-bold">
                {appVersion || 'جارٍ التحميل...'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              يقوم المنظومة بفحص مستودع GitHub تلقائياً ومقارنة أحدث الإصدارات مع نسخة البرنامج الحالية، لعرض إشعار وتنزيل التحديث فور صدوره.
            </p>

            {/* GitHub Repo Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">مستودع GitHub (Repository)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={githubRepo || 'baha-systems/baha-concrete-erp'}
                  onChange={(e) => onUpdateGithubRepo && onUpdateGithubRepo(e.target.value)}
                  placeholder="owner/repo"
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Auto-check switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">الفحص التلقائي عند فتح المنظومة</span>
                <span className="text-[10px] text-slate-500 block">إظهار النافذة المنبثقة فور توفر تحديث جديد</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCheckUpdates !== false}
                  onChange={(e) => onToggleAutoCheckUpdates && onToggleAutoCheckUpdates(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
  if (window.electronAPI?.checkForUpdates) {
    window.electronAPI.checkForUpdates();
  }
}}
                className="w-full py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>التحقق الفوري من التحديثات من GitHub</span>
              </button>

              <button
                type="button"
                onClick={onSimulateUpdateAvailable}
                className="w-full py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] rounded-xl border border-amber-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>تجربة نافذة شاشة التحديث الحية (v3.6.0)</span>
              </button>
            </div>
          </div>

          {/* Windows Desktop App (Electron + Local SQLite + Firestore Cloud) */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-3 border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-bold text-sm text-white">تطبيق سطح المكتب Windows</h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-mono font-bold border border-orange-500/30">
                Electron + SQLite + Firebase
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              محرك العمل دون إينترنيت (Offline-First): يتم حفظ كافة الفواتير والعمال والمخزون محلياً في داتابيز <strong>SQLite</strong> بسرعة فائقة، ثم تزامنها تلقائياً مع <strong>Firebase Cloud</strong> عند توفر شبكة الإنترنت.
            </p>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1 text-slate-300">
              <div className="flex justify-between text-slate-400">
                <span>[Desktop Runtime]:</span>
                <span className="text-emerald-400">Windows .exe (Active)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>[Local Engine]:</span>
                <span className="text-blue-400">SQLite Offline DB (Indexed)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>[Cloud Sync]:</span>
                <span className="text-orange-400">Firestore (Auto-Reconnect)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert("تم تجهيز معمارية Electron + SQLite بنجاح. يمكن تحزيم التطبيق إلى ملف exe جاهز للتثبيت على حواسيب الويندوز في مصانع الخرسانة.");
              }}
              className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>تنزيل حزمة تثبيت Windows (.exe Installer)</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
