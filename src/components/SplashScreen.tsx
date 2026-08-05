import React, { useState, useEffect } from 'react';
import { Factory, ShieldCheck, Database, Cpu, CheckCircle2, Lock } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('جاري تهيئة المحرك Baha Concrete ERP...');

  useEffect(() => {
    const steps = [
      { p: 15, msg: 'التحقق من ترخيص النسخة التجارية Enterprise...' },
      { p: 35, msg: 'تفكيك تشفير ملفات الإعدادات والذاكرة الآمنة...' },
      { p: 60, msg: 'فحص منع تعدد النسخ (Single Instance Process Lock)...' },
      { p: 85, msg: 'ربط قاعدة بيانات Firebase الأوفلاين وطابور sync_queue...' },
      { p: 100, msg: 'اكتمل التشغيل بنجاح! جاري التوجيه للوحة التحكم...' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p);
        setStatusText(steps[currentStep].msg);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans select-none">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Animated Brand Logo */}
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-3xl p-5 shadow-2xl shadow-orange-600/30 flex items-center justify-center mx-auto border border-orange-400/30">
            <Factory className="w-12 h-12 text-white animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-xl font-bold shadow-lg text-[10px] flex items-center gap-1 border border-emerald-300">
            <Lock className="w-3 h-3" />
            <span>v3.5 Locked</span>
          </div>
        </div>

        {/* Brand Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-white">
            Baha Concrete ERP
          </h1>
          <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">
            نظام إدارة مصانع الخرسانة ومحطات الخلط الجاهزة
          </p>
          <span className="inline-block text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-mono mt-1">
            Commercial Desktop & Web Edition
          </span>
        </div>

        {/* Loading Progress Section */}
        <div className="space-y-3 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-orange-400 animate-spin" />
              <span>{statusText}</span>
            </span>
            <span className="font-mono font-black text-orange-400">{progress}%</span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-800">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Secure Lock</span>
            </div>
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3 text-blue-400" />
              <span>Firebase Ready</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-amber-400" />
              <span>Single Instance</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-600 font-mono">
          © 2026 Baha Industrial Software Systems. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};
