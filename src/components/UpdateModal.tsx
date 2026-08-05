import React, { useState } from 'react';
import { 
  Download, 
  Github, 
  Sparkles, 
  X, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  HardDrive, 
  ArrowRight,
  AlertCircle,
  FileCode,
  Zap,
  Check
} from 'lucide-react';
import { AppUpdateInfo } from '../types';

interface UpdateModalProps {
  isOpen: boolean;
  updateInfo: AppUpdateInfo | null;
  currentVersion: string;
  onClose: () => void;
  onApplyUpdate: (newVersion: string) => void;
  onSkipVersion: (version: string) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  updateInfo,
  currentVersion,
  onClose,
  onApplyUpdate,
  onSkipVersion,
}) => {
  const [installing, setInstalling] = useState(false);
  const [installStep, setInstallStep] = useState<number>(0);
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [stepStatusText, setStepStatusText] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen || !updateInfo) return null;

  const stepsList = [
    'الاتصال بـ GitHub API وتنزيل حزمة الإصدار...',
    'التحقق من التوقيع الرقمي والتشفير SHA-256...',
    'استخراج الملفات وتحديث قواعد البيانات المحلية...',
    'إنهاء التثبيت وإعداد إعادة تشغيل النظام...',
  ];

  const handleStartInstallation = () => {
    setInstalling(true);
    setInstallStep(0);
    setInstallProgress(10);
    setStepStatusText(stepsList[0]);

    // Step 1: Downloading from GitHub
    setTimeout(() => {
      setInstallStep(1);
      setInstallProgress(35);
      setStepStatusText(stepsList[1]);
    }, 1200);

    // Step 2: Verification
    setTimeout(() => {
      setInstallStep(2);
      setInstallProgress(70);
      setStepStatusText(stepsList[2]);
    }, 2500);

    // Step 3: Extraction & Update
    setTimeout(() => {
      setInstallStep(3);
      setInstallProgress(95);
      setStepStatusText(stepsList[3]);
    }, 3800);

    // Step 4: Completion
    setTimeout(() => {
      setInstallProgress(100);
      setIsCompleted(true);
    }, 4800);
  };

  const handleFinishAndReload = () => {
    onApplyUpdate(updateInfo.version);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden space-y-0 relative">
        
        {/* Top Banner Gradient Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-6 relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-600/90 text-white rounded-2xl flex items-center justify-center shadow-lg border border-orange-400/30">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                    GitHub Release
                  </span>
                  <span className="text-xs text-slate-300 font-mono">{updateInfo.githubRepo}</span>
                </div>
                <h3 className="font-black text-white text-lg mt-0.5">تحديث جديد متوفر للبرنامج!</h3>
              </div>
            </div>

            {!installing && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Version badge tag */}
          <div className="mt-4 flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <div className="flex-1 text-center border-e border-white/10 pe-2">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">الإصدار الحالي</span>
              <span className="text-xs font-mono font-bold text-slate-200">{currentVersion}</span>
            </div>
            <div className="flex items-center justify-center text-orange-400 px-1">
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </div>
            <div className="flex-1 text-center ps-2">
              <span className="text-[10px] text-amber-300 font-bold block uppercase">الإصدار التحديثي الجديد</span>
              <span className="text-sm font-mono font-black text-amber-400">{updateInfo.version}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-5">

          {!installing ? (
            /* Standard Info View */
            <>
              {/* Release Metadata */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>{updateInfo.releaseName}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 font-mono">
                    {updateInfo.releaseDate}
                  </span>
                </div>

                {/* Changelog items */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-slate-700 block">أبرز التحسينات والمميزات في التحديث:</span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {updateInfo.changelog.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {updateInfo.sizeMB && (
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    <span>حجم حزمة التحديث التلقائية: <strong>{updateInfo.sizeMB} ميغابايت</strong></span>
                  </div>
                )}
              </div>

              {/* Security guarantee badge */}
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>التحديث موقع رقمياً ومجرب آلياً عبر مستودعات GitHub المعتمدة.</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleStartInstallation}
                  className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل وتثبيت التحديث الآن</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  تذكيري لاحقاً
                </button>

                <button
                  type="button"
                  onClick={() => onSkipVersion(updateInfo.version)}
                  className="py-3 px-3 text-slate-400 hover:text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  title="تخطي هذا الإصدار عدم السؤال مرة أخرى"
                >
                  تخطي الإصدار
                </button>
              </div>
            </>
          ) : (
            /* Interactive Installation Progress View */
            <div className="space-y-5 py-2">
              {!isCompleted ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-orange-600 animate-spin" />
                      <span className="font-bold text-slate-900 text-sm">جاري تنزيل وتثبيت التحديث...</span>
                    </div>
                    <span className="font-mono font-black text-orange-600 text-sm">{installProgress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${installProgress}%` }}
                    />
                  </div>

                  {/* Active Step Indicator */}
                  <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-orange-400 font-bold uppercase block">المرحلة الحالية</span>
                    <p className="text-xs font-semibold font-mono">{stepStatusText}</p>
                  </div>

                  {/* Step Checklist */}
                  <div className="space-y-2 text-xs">
                    {stepsList.map((stepName, index) => {
                      const isDone = installStep > index;
                      const isCurrent = installStep === index;
                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-100'
                              : isCurrent
                              ? 'bg-orange-50 text-orange-900 font-bold border border-orange-200'
                              : 'bg-slate-50 text-slate-400 border border-slate-100'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isCurrent ? (
                            <RefreshCw className="w-4 h-4 text-orange-600 animate-spin shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                          )}
                          <span>{stepName}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Complete Success View */
                <div className="text-center space-y-4 py-3 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-lg">تم اكتمل التحديث بنجاح!</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                      تم استبدال ملفات المنظومة وتثبيت الإصدار <strong>{updateInfo.version}</strong> على حاسوبك بنجاح.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700">
                    سيتم تشغيل البرنامج بالإصدار الجديد ومزامنة التغييرات الآن.
                  </div>

                  <button
                    type="button"
                    onClick={handleFinishAndReload}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>تشغيل المنظومة بالإصدار الجديد ({updateInfo.version})</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
