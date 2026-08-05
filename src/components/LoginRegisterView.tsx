import React, { useState, useEffect } from 'react';
import { Language, Company } from '../types';
import { getTranslation } from '../lib/translations';
import { getLocalData, setLocalData } from '../firebase';
import { 
  Building2, 
  Key, 
  Mail, 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ShieldAlert,
  Sparkles,
  Check
} from 'lucide-react';

interface LoginRegisterViewProps {
  currentLang: Language;
  companies?: Company[];
  currentCompanyId?: string;
  onSelectCompany?: (companyId: string) => void;
  onLogin: (email: string, password?: string, rememberMe?: boolean) => Promise<void> | void;
  onRegisterCompany: (companyData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    commercialRegNumber?: string;
    taxNumber?: string;
  }) => Promise<void> | void;
  onCloseView?: () => void;
}

export const LoginRegisterView: React.FC<LoginRegisterViewProps> = ({
  currentLang,
  companies = [],
  currentCompanyId = '',
  onSelectCompany = (_id: string) => {},
  onLogin,
  onRegisterCompany,
  onCloseView,
}) => {
  const t = getTranslation(currentLang);
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // Saved Login State from LocalStorage (Only Email is saved for security, NEVER PASSWORDS)
  const savedEmail = getLocalData<string>('saved_email', '');
  const savedRemember = getLocalData<boolean>('saved_remember', false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState(savedEmail);
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(savedRemember);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCommercial, setRegCommercial] = useState('');
  const [regTax, setRegTax] = useState('');

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');
    if (!loginEmail || !loginPassword) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور كاملين.');
      return;
    }

    if (loginPassword.length < 4) {
      setErrorMessage('كلمة المرور قصيرة جداً.');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(loginEmail, loginPassword, rememberMe);

      if (rememberMe) {
        setLocalData('saved_email', loginEmail);
        setLocalData('saved_remember', true);
      } else {
        localStorage.removeItem('baha_concrete_saved_email');
        setLocalData('saved_remember', false);
      }

      setMessage('تم تسجيل الدخول بنجاح بالمصادقة الآمنة!');
      if (onCloseView) setTimeout(onCloseView, 600);
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMessage(err.message || 'فشل المصادقة عبر الخادم. يرجى التأكد من البريد وكلمة المرور.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');
    if (!regName || !regEmail || !regPassword) {
      setErrorMessage('يرجى تعبئة اسم الشركة والبريد وكلمة المرور.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }

    setIsLoading(true);
    try {
      await onRegisterCompany({
        name: regName,
        email: regEmail,
        phone: regPhone,
        address: regAddress,
        commercialRegNumber: regCommercial,
        taxNumber: regTax,
      });
      setMessage('تم إنشاء حساب الشركة والتوثيق بنجاح!');
      if (onCloseView) setTimeout(onCloseView, 800);
    } catch (err: any) {
      console.error("Register error:", err);
      setErrorMessage(err.message || 'فشل توثيق حساب الشركة عبر الخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-orange-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>بوابة الحسابات والشركات - ReadyMix ERP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.appTitle}
          </h1>
          <p className="text-orange-100 text-sm font-medium leading-relaxed">
            تسجيل الدخول لمصنع الخرسانة أو إنشاء حساب جديد لتسيير الإنتاج والمبيعات والمخزون
          </p>
        </div>

        <div className="absolute -end-12 -bottom-12 w-56 h-56 bg-orange-400/20 rounded-full pointer-events-none" />
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Container with Auth Forms */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Side: Mode Selection Tabs & Info */}
        <div className="md:col-span-5 bg-gray-900 text-white p-8 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md">
                C
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight text-white">{t.appTitle}</h2>
                <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider">المنصة المركزية</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`w-full p-4 rounded-2xl transition-all text-start flex items-center justify-between border cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-orange-500/20 border-orange-500 text-white font-bold shadow-xs'
                    : 'bg-gray-800/60 border-gray-700/60 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className={`w-5 h-5 ${activeTab === 'login' ? 'text-orange-400' : 'text-gray-400'}`} />
                  <div>
                    <div className="text-sm font-bold">{t.login}</div>
                    <div className="text-xs text-gray-400 font-normal">دخول حساب شركة موجودة</div>
                  </div>
                </div>
                {activeTab === 'login' && <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`w-full p-4 rounded-2xl transition-all text-start flex items-center justify-between border cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-orange-500/20 border-orange-500 text-white font-bold shadow-xs'
                    : 'bg-gray-800/60 border-gray-700/60 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className={`w-5 h-5 ${activeTab === 'register' ? 'text-orange-400' : 'text-gray-400'}`} />
                  <div>
                    <div className="text-sm font-bold">{t.register}</div>
                    <div className="text-xs text-gray-400 font-normal">تسجيل مصنع خرسانة جديد</div>
                  </div>
                </div>
                {activeTab === 'register' && <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />}
              </button>
            </div>
          </div>

          {/* Security & System Info Footer Box */}
          <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-gray-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>منظومة حماية وتشفير متكاملة</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              جميع البيانات محمية ومؤمنة بنظام تشفير محلي وسحابي لمنع الوصول غير المصرح به.
            </p>
          </div>
        </div>

        {/* Right Side: Active Form */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center">
          
          {activeTab === 'login' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t.login}</h3>
                <p className="text-xs text-gray-500 mt-1">أدخل بريدك الإلكتروني وكلمة المرور للدخول لمصنع الخرسانة</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.email}</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="company@email.com"
                      className="w-full ps-10 pe-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-orange-500"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute start-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.password}</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full ps-10 pe-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-orange-500"
                    />
                    <Key className="w-4 h-4 text-gray-400 absolute start-3.5 top-3" />
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded-md border-gray-300 focus:ring-orange-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-gray-700">حفظ معلومات الدخول (تذكرني في الجهاز)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">عمل أوفلاين/أونلاين</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {t.login}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t.register}</h3>
                <p className="text-xs text-gray-500 mt-1">أنشئ حساباً جديداً لمصنع خرسانة جهزة واستفد من فترة تجريبية</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.companyName} *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: معمل خرسانة بسكرة الجاهزة"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.email} *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="company@readymix.dz"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.password} (كلمة السر لحساب المدير) *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{t.phone}</label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="06 XX XX XX XX"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{t.address}</label>
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="ولاية / بلدية..."
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">السجل التجاري (RC)</label>
                    <input
                      type="text"
                      value={regCommercial}
                      onChange={(e) => setRegCommercial(e.target.value)}
                      placeholder="07/00-1234567..."
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">الرقم الضريبي (NIF)</label>
                    <input
                      type="text"
                      value={regTax}
                      onChange={(e) => setRegTax(e.target.value)}
                      placeholder="00213000..."
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {t.register}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
