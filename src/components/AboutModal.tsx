import React, { useState } from 'react';
import { 
  X, 
  Factory, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Laptop, 
  HardDrive, 
  Download, 
  Cpu, 
  Award, 
  Lock,
  Sparkles
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion?: string;
  onTriggerCheckUpdate?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ 
  isOpen, 
  onClose,
  currentVersion = 'v3.5.0',
  onTriggerCheckUpdate
}) => {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [updateProgress, setUpdateProgress] = useState(0);

  if (!isOpen) return null;

  const handleCheckUpdate = () => {
    setCheckingUpdate(true);
    setUpdateStatus('جاري الاتصال بمستودع GitHub والتحقق من الإصدارات...');
    setUpdateProgress(30);

    setTimeout(() => {
      setUpdateProgress(70);
      setUpdateStatus(`فحص التوافقية ومقارنة النسخة الحالية (${currentVersion})...`);
    }, 800);

    setTimeout(() => {
      setUpdateProgress(100);
      setCheckingUpdate(false);
      setUpdateStatus(null);
      if (onTriggerCheckUpdate) {
        onTriggerCheckUpdate();
      }
    }, 1600);
  };

  const handleDownloadDesktopInstaller = () => {
    // Generate installer config metadata file for Windows deployment
    const installerManifest = {
      appName: 'Baha Concrete ERP',
      version: '3.5.0-enterprise',
      publisher: 'Baha Industrial Systems',
      executableName: 'BahaConcreteERP.exe',
      singleInstanceLock: true,
      autoUpdateChannel: 'stable',
      encryptedStorageEnabled: true,
      firestoreDatabaseId: 'ai-studio-3bb193b4-7c00-4c42-af9d-a0f96cea0761',
      buildDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(installerManifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Baha_Concrete_ERP_Windows_Setup_Config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl p-2.5 flex items-center justify-center shadow-md">
              <Factory className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Baha Concrete ERP</h3>
              <p className="text-xs text-orange-600 font-bold">Enterprise Commercial Release v3.5.0</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Specs Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 text-[10px] font-bold block uppercase">ترخيص البرنامج</span>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>مؤسساتي غير محدود (Commercial)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 text-[10px] font-bold block uppercase">حماية النسخة الواحدة</span>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Single Instance Active</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 text-[10px] font-bold block uppercase">التشفير المحلي</span>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>baha_sec AES Storage</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 text-[10px] font-bold block uppercase">نظام المزامنة والطباعة</span>
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <HardDrive className="w-4 h-4 text-purple-500" />
              <span>sync_queue & A4 Print</span>
            </div>
          </div>
        </div>

        {/* Check for Auto Updates section */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold">التحديث التلقائي (Auto Update Channel)</span>
            </div>
            <button
              type="button"
              onClick={handleCheckUpdate}
              disabled={checkingUpdate}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
              <span>التحقق من التحديثات</span>
            </button>
          </div>

          {updateStatus && (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] text-slate-300 font-medium">{updateStatus}</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full transition-all duration-300"
                  style={{ width: `${updateProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Windows Installer Config Button */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <button
            type="button"
            onClick={handleDownloadDesktopInstaller}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-orange-600" />
            <span>تصدير إعدادات مثبت الويندوز (.exe Installer)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
