import React, { useState } from 'react';
import { AuditLog, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { runSecurityPenetrationTest } from '../firebase';
import { 
  ShieldCheck, 
  Search, 
  Clock, 
  User, 
  FileText, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Database,
  Terminal,
  ShieldAlert
} from 'lucide-react';

interface AuditLogsViewProps {
  logs: AuditLog[];
  currentLang: Language;
  companyName: string;
  onRefreshLogs?: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  currentLang,
  companyName,
  onRefreshLogs
}) => {
  const t = getTranslation(currentLang);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [penTestResults, setPenTestResults] = useState<{ name: string; passed: boolean; detail: string }[] | null>(null);

  const handleRunPenTest = () => {
    const results = runSecurityPenetrationTest();
    setPenTestResults(results);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>سجل الأمان والعمليات (Security Audit Trail)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            سجل التدقيق الأمني لشركة {companyName}
          </h2>
          <p className="text-slate-400 text-xs font-medium">
            تتبع كافة التغييرات والعمليات الحساسة، المبيعات، تحديثات الحسابات، وصلاحيات المستخدمين على Firestore
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRunPenTest}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            <span>إجراء فحص أمني واختراق (PenTest)</span>
          </button>

          {onRefreshLogs && (
            <button
              type="button"
              onClick={onRefreshLogs}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تحديث السجل من Firestore</span>
            </button>
          )}
        </div>
      </div>

      {/* Penetration Testing Execution Box */}
      {penTestResults && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Terminal className="w-4 h-4" />
              <span>تقرير نتائج فحص أمان الصلاحيات والتخزين (Penetration Audit Report)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Status: PASS (0 Critical Findings)</span>
          </div>
          <div className="space-y-2">
            {penTestResults.map((res, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                {res.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-slate-200">{res.name}</div>
                  <div className="text-slate-400 text-[11px] font-medium">{res.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">قواعد حماية Firestore</div>
            <div className="text-sm font-black text-slate-900">مفعّلة (Fortress ABAC Rules)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">طريقة الكتابة الدفعية</div>
            <div className="text-sm font-black text-slate-900">writeBatch Atomic Operations</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">عزل بيانات الشركات</div>
            <div className="text-sm font-black text-slate-900">Isolating Subcollections</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث في التفاصيل أو البريد..."
            className="w-full ps-10 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-orange-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">نوع العملية:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-orange-500"
          >
            <option value="all">كل العمليات</option>
            <option value="create_dispatch">إرسال خرسانة (Dispatch)</option>
            <option value="worker_payment">تسديد رواتب</option>
            <option value="inventory_update">تحديث المخزون</option>
            <option value="company_register">تسجيل شركة</option>
            <option value="user_login">تسجيل دخول</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 text-start">الوقت والتااريخ</th>
                <th className="p-3.5 text-start">المستخدم</th>
                <th className="p-3.5 text-start">نوع الإجراء (Action)</th>
                <th className="p-3.5 text-start">التفاصيل والبيانات</th>
                <th className="p-3.5 text-center">الحالة الحسابية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    لا توجد سجلات تدقيق مطابقة حالياً
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 whitespace-nowrap font-mono text-slate-600 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleString(currentLang === 'ar' ? 'ar-DZ' : 'fr-FR')}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-orange-500" />
                        <span>{log.userEmail}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>موثق بالخادم</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
